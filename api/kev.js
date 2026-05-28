// Vercel Serverless Function — fetches CISA KEV catalog
// Runs server-side, no CORS issues, cached at edge
//
// Endpoint: /api/kev
// Returns: full CISA KEV catalog with current data

export default async function handler(req, res) {
  // Allow CORS from browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache at CDN edge for 1 hour (KEV updates infrequently)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const upstream = await fetch(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      {
        headers: {
          'User-Agent': 'CVEPulse/1.0 (https://cvepulse.com; business@cvepulse.com)',
          'Accept': 'application/json',
        },
      }
    );

    if (!upstream.ok) {
      return res.status(502).json({
        error: 'Upstream CISA KEV API returned ' + upstream.status,
        timestamp: new Date().toISOString(),
      });
    }

    const data = await upstream.json();

    // Normalize the response for our app
    const normalized = {
      count: data.count,
      catalogVersion: data.catalogVersion,
      dateReleased: data.dateReleased,
      vulnerabilities: (data.vulnerabilities || []).map(v => ({
        id: v.cveID,
        vendor: v.vendorProject,
        product: v.product,
        name: v.vulnerabilityName,
        dateAdded: v.dateAdded,
        description: v.shortDescription,
        action: v.requiredAction,
        dueDate: v.dueDate,
        ransomwareUse: v.knownRansomwareCampaignUse === 'Known',
        cwes: v.cwes || [],
      })),
      fetchedAt: new Date().toISOString(),
    };

    return res.status(200).json(normalized);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch CISA KEV',
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
