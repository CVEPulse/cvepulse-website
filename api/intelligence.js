// Vercel Serverless Function — the "everything you need" endpoint
//
// One call gives the browser fully-enriched data ready to render.
// Server does all the heavy lifting: KEV fetch, EPSS batch, joining, sorting.
//
// Endpoint: /api/intelligence
// Returns: { kev: {...}, recentScored: [...], stats: {...} }

import { calculateMWS, inferAttackClass } from './_lib/scoring.js';

const ORIGIN = 'https://api.first.org';
const KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

async function fetchKev() {
  const res = await fetch(KEV_URL, {
    headers: { 'User-Agent': 'CVEPulse/1.0', 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('KEV ' + res.status);
  return res.json();
}

async function fetchEpssBatch(ids) {
  if (ids.length === 0) return {};
  // EPSS supports up to 100 CVEs per query
  const chunks = [];
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));

  const all = {};
  for (const chunk of chunks) {
    const url = `${ORIGIN}/data/v1/epss?cve=${chunk.join(',')}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CVEPulse/1.0', 'Accept': 'application/json' },
    });
    if (!res.ok) continue;
    const data = await res.json();
    (data.data || []).forEach(d => {
      all[d.cve] = { epss: parseFloat(d.epss), percentile: parseFloat(d.percentile) };
    });
  }
  return all;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=7200');

  try {
    // 1. Fetch CISA KEV (full catalog)
    const kev = await fetchKev();
    const kevVulns = kev.vulnerabilities || [];

    // 2. Take the 50 most recently-added entries for scoring
    const recent = kevVulns
      .slice()
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 50);

    // 3. Batch-fetch EPSS scores for those
    const epssMap = await fetchEpssBatch(recent.map(v => v.cveID));

    // 4. Score each one with MWS
    const scored = recent.map(v => {
      const desc = v.shortDescription || v.vulnerabilityName || '';
      const attackClass = inferAttackClass({ description: desc });
      const epssData = epssMap[v.cveID] || { epss: 0, percentile: 0 };

      // Heuristic CVSS estimation for KEV entries (CISA doesn't include CVSS in KEV feed)
      // KEV-listed implies high impact; default to 8 if unknown
      const cvssEstimate = 8.5;

      const cveInput = {
        cvss: cvssEstimate,
        epss: epssData.epss,
        isKev: true,
        hasPoc: true, // KEV-listed implies known exploitation
        isInternetFacing: true, // most KEV entries are externally exploitable
        attackClass,
      };

      const mws = calculateMWS(cveInput);

      return {
        id: v.cveID,
        vendor: v.vendorProject,
        product: v.product,
        name: v.vulnerabilityName,
        description: desc,
        dateAdded: v.dateAdded,
        dueDate: v.dueDate,
        ransomwareUse: v.knownRansomwareCampaignUse === 'Known',
        cvss: cvssEstimate,
        epss: epssData.epss,
        epssPercentile: epssData.percentile,
        isKev: true,
        hasPoc: true,
        isInternetFacing: true,
        attackClass,
        mws,
      };
    });

    // 5. Sort by MWS descending — highest Mythos threat first
    scored.sort((a, b) => b.mws.score - a.mws.score);

    // 6. Build summary stats
    const stats = {
      kevTotal: kev.count,
      kevCatalogVersion: kev.catalogVersion,
      kevDateReleased: kev.dateReleased,
      scoredCount: scored.length,
      mythosTargets: scored.filter(c => c.mws.score >= 85).length,
      ransomwareLinked: scored.filter(c => c.ransomwareUse).length,
      rceClass: scored.filter(c => c.attackClass === 'RCE').length,
      authBypassClass: scored.filter(c => c.attackClass === 'AUTH_BYPASS').length,
      avgMws: Math.round(scored.reduce((s, c) => s + c.mws.score, 0) / Math.max(scored.length, 1)),
    };

    return res.status(200).json({
      stats,
      scored,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to build intelligence response',
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
