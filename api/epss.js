// Vercel Serverless Function — fetches EPSS scores from FIRST.org
// Endpoint: /api/epss?cves=CVE-2024-1,CVE-2024-2,...
// Returns: { "CVE-2024-1": { epss: 0.94, percentile: 0.99 }, ... }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  const cveList = req.query.cves;
  if (!cveList) {
    return res.status(400).json({ error: 'Missing cves query parameter' });
  }

  const cves = cveList.split(',').filter(c => /^CVE-\d{4}-\d+$/i.test(c.trim())).slice(0, 100);
  if (cves.length === 0) {
    return res.status(400).json({ error: 'No valid CVE IDs found in query' });
  }

  try {
    const url = `https://api.first.org/data/v1/epss?cve=${cves.join(',')}`;
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'CVEPulse/1.0 (https://cvepulse.com; business@cvepulse.com)',
        'Accept': 'application/json',
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({
        error: 'Upstream EPSS API returned ' + upstream.status,
        timestamp: new Date().toISOString(),
      });
    }

    const data = await upstream.json();
    const map = {};
    (data.data || []).forEach(d => {
      map[d.cve] = {
        epss: parseFloat(d.epss),
        percentile: parseFloat(d.percentile),
      };
    });

    return res.status(200).json({
      scores: map,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch EPSS',
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
