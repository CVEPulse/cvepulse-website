// Vercel Serverless Function — fetches recent CVEs from NVD
// Runs server-side, no CORS issues, cached at edge
//
// Endpoint: /api/cves?limit=50
// Returns: recent CVE entries with CVSS, references, and PoC detection

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache for 15 minutes — NVD updates more frequently than KEV
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
  const days = Math.min(parseInt(req.query.days || '7', 10), 30);

  // NVD wants ISO-8601 with milliseconds and TZ
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, '.000');
  const endDate = new Date().toISOString().replace(/\.\d{3}Z$/, '.000');

  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate}&pubEndDate=${endDate}&resultsPerPage=${limit}`;

  try {
    const headers = {
      'User-Agent': 'CVEPulse/1.0 (https://cvepulse.com; business@cvepulse.com)',
      'Accept': 'application/json',
    };
    // Use API key if you have one (NVD rate limits without it: 5 req/30s)
    if (process.env.NVD_API_KEY) {
      headers['apiKey'] = process.env.NVD_API_KEY;
    }

    const upstream = await fetch(url, { headers });

    if (!upstream.ok) {
      return res.status(502).json({
        error: 'Upstream NVD API returned ' + upstream.status,
        timestamp: new Date().toISOString(),
      });
    }

    const data = await upstream.json();

    const normalized = (data.vulnerabilities || []).map(v => {
      const cve = v.cve;
      const cvssV3 = cve.metrics?.cvssMetricV31?.[0]?.cvssData
        || cve.metrics?.cvssMetricV30?.[0]?.cvssData
        || null;
      const refs = (cve.references || []).slice(0, 5);
      const hasPoc = refs.some(r => {
        const url = (r.url || '').toLowerCase();
        const tags = r.tags || [];
        return tags.includes('Exploit')
          || url.includes('github.com')
          || url.includes('exploit-db.com')
          || url.includes('packetstormsecurity');
      });
      return {
        id: cve.id,
        description: cve.descriptions?.find(d => d.lang === 'en')?.value || '',
        published: cve.published,
        lastModified: cve.lastModified,
        cvss: cvssV3?.baseScore || 0,
        severity: cvssV3?.baseSeverity || 'UNKNOWN',
        cwe: cve.weaknesses?.[0]?.description?.[0]?.value || '',
        references: refs.map(r => r.url),
        hasPoc,
      };
    });

    return res.status(200).json({
      total: data.totalResults || normalized.length,
      cves: normalized,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch NVD',
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
