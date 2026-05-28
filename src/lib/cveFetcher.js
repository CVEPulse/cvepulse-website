/**
 * CVE Data Fetcher — calls CVEPulse's own serverless functions
 *
 * Architecture:
 *   Browser → /api/intelligence → Server-side fetch to CISA + NVD + EPSS → Browser
 *
 * Why this matters:
 *   - No CORS issues (we control the response headers)
 *   - No rate limiting (we cache server-side for 15-30 min)
 *   - Faster (one round-trip from browser, parallel server-side)
 *   - More reliable (we can fall back gracefully)
 *
 * Caching layers:
 *   1. Browser memory (per-tab, instant)
 *   2. sessionStorage (per-tab, survives reload)
 *   3. Vercel Edge CDN (15-30 min server-side cache)
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes client-side
const cache = new Map();

function getCached(key) {
  const mem = cache.get(key);
  if (mem && Date.now() - mem.ts < CACHE_TTL_MS) return mem.data;
  try {
    const raw = sessionStorage.getItem(`cvepulse:${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL_MS) {
        cache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (_) {}
  return null;
}

function setCached(key, data) {
  const entry = { data, ts: Date.now() };
  cache.set(key, entry);
  try {
    sessionStorage.setItem(`cvepulse:${key}`, JSON.stringify(entry));
  } catch (_) {}
}

async function fetchWithCache(key, url) {
  const cached = getCached(key);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const data = await res.json();
  setCached(key, data);
  return data;
}

/**
 * The main endpoint — returns everything the dashboards need in one call.
 * Server-side: fetches CISA KEV, batches EPSS, scores with MWS, sorts.
 */
export async function fetchIntelligence() {
  return fetchWithCache('intelligence', '/api/intelligence');
}

/**
 * Direct CISA KEV catalog (full list, normalized).
 * Used by KEV Tracker dashboard.
 */
export async function fetchKEV() {
  return fetchWithCache('kev', '/api/kev');
}

/**
 * Recent CVEs from NVD (last 7 days by default).
 * Used by CVE Intelligence + CVE Trends dashboards.
 */
export async function fetchRecentCVEs(limit = 50, days = 7) {
  const key = `cves:${limit}:${days}`;
  const result = await fetchWithCache(key, `/api/cves?limit=${limit}&days=${days}`);
  return result.cves || [];
}

/**
 * EPSS scores for a batch of CVE IDs.
 * Returns: { "CVE-2024-1": { epss, percentile }, ... }
 */
export async function fetchEPSSBatch(cveIds) {
  if (!cveIds || cveIds.length === 0) return {};
  const ids = cveIds.slice(0, 100).join(',');
  const key = `epss:${ids.slice(0, 80)}`;
  const result = await fetchWithCache(key, `/api/epss?cves=${ids}`);
  return result.scores || {};
}

/**
 * Combined fetch for CVE Intelligence + Trends dashboards.
 * Returns CVEs enriched with KEV and EPSS data, ready for MWS scoring client-side.
 */
export async function fetchEnrichedCVEs(limit = 50) {
  const [recent, kev] = await Promise.all([fetchRecentCVEs(limit), fetchKEV()]);
  const kevSet = new Set(kev.vulnerabilities.map(v => v.id));
  const ids = recent.map(c => c.id);
  const epssMap = await fetchEPSSBatch(ids);

  return recent.map(c => ({
    ...c,
    isKev: kevSet.has(c.id),
    epss: epssMap[c.id]?.epss || 0,
    epssPercentile: epssMap[c.id]?.percentile || 0,
    isInternetFacing: true,
  }));
}

/**
 * KEV-specific enrichment for KEV Tracker dashboard.
 * Pulls full KEV catalog + EPSS scores for top entries.
 */
export async function fetchEnrichedKEV() {
  const kev = await fetchKEV();
  const ids = kev.vulnerabilities.slice(0, 100).map(v => v.id);
  const epssMap = await fetchEPSSBatch(ids);

  return {
    ...kev,
    vulnerabilities: kev.vulnerabilities.map(v => ({
      ...v,
      epss: epssMap[v.id]?.epss || 0,
      epssPercentile: epssMap[v.id]?.percentile || 0,
      isKev: true,
      hasPoc: true,
      cvss: 8.5,
      isInternetFacing: true,
    })),
  };
}
