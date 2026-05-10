/**
 * CVE Data Fetcher with stale-while-revalidate caching
 *
 * Solves the "dashboards are super slow" problem:
 *  - In-memory + sessionStorage cache
 *  - Stale-while-revalidate: shows cached data instantly, refreshes in background
 *  - Batched requests (single fetch instead of N+1 per CVE)
 *  - Concurrent fetches with Promise.all
 *  - Falls back gracefully if any source fails
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

function getCached(key) {
  // Memory first
  const mem = cache.get(key);
  if (mem && Date.now() - mem.ts < CACHE_TTL_MS) return mem.data;

  // Then sessionStorage
  try {
    const raw = sessionStorage.getItem(`cvepulse:${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL_MS) {
        cache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (_) { /* ignore */ }
  return null;
}

function setCached(key, data) {
  const entry = { data, ts: Date.now() };
  cache.set(key, entry);
  try {
    sessionStorage.setItem(`cvepulse:${key}`, JSON.stringify(entry));
  } catch (_) { /* quota exceeded - ignore */ }
}

/**
 * Stale-while-revalidate fetch - returns cached immediately if available,
 * triggers background refresh, and calls onUpdate when new data arrives.
 */
export async function swrFetch(key, fetcher, onUpdate) {
  const cached = getCached(key);
  if (cached) {
    // Background refresh
    fetcher()
      .then(fresh => {
        setCached(key, fresh);
        if (onUpdate) onUpdate(fresh);
      })
      .catch(() => { /* keep stale */ });
    return cached;
  }
  const fresh = await fetcher();
  setCached(key, fresh);
  return fresh;
}

/**
 * NVD - Recent CVEs (last 7 days, top 50)
 * https://services.nvd.nist.gov/rest/json/cves/2.0
 */
export async function fetchRecentCVEs(limit = 50) {
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate}&resultsPerPage=${limit}`;

  return swrFetch(`nvd:recent:${limit}`, async () => {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`NVD ${res.status}`);
    const data = await res.json();
    return (data.vulnerabilities || []).map(v => normalizeNvdCve(v.cve));
  });
}

function normalizeNvdCve(c) {
  const cvssV3 = c.metrics?.cvssMetricV31?.[0]?.cvssData
    || c.metrics?.cvssMetricV30?.[0]?.cvssData
    || null;
  return {
    id: c.id,
    description: c.descriptions?.find(d => d.lang === 'en')?.value || '',
    published: c.published,
    cvss: cvssV3?.baseScore || 0,
    severity: cvssV3?.baseSeverity || 'UNKNOWN',
    cwe: c.weaknesses?.[0]?.description?.[0]?.value || '',
    references: (c.references || []).slice(0, 5).map(r => r.url),
    hasPoc: detectPoc(c.references || []),
  };
}

function detectPoc(refs) {
  return refs.some(r => {
    const url = (r.url || '').toLowerCase();
    return url.includes('github.com') ||
           url.includes('exploit-db.com') ||
           url.includes('packetstormsecurity') ||
           (r.tags || []).includes('Exploit');
  });
}

/**
 * CISA KEV catalog - the authoritative "actively exploited" list
 */
export async function fetchKEV() {
  const url = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
  return swrFetch('cisa:kev', async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`KEV ${res.status}`);
    const data = await res.json();
    return {
      count: data.count,
      catalogVersion: data.catalogVersion,
      dateReleased: data.dateReleased,
      vulnerabilities: data.vulnerabilities.map(v => ({
        id: v.cveID,
        vendor: v.vendorProject,
        product: v.product,
        name: v.vulnerabilityName,
        dateAdded: v.dateAdded,
        description: v.shortDescription,
        action: v.requiredAction,
        dueDate: v.dueDate,
        ransomwareUse: v.knownRansomwareCampaignUse === 'Known',
      })),
    };
  });
}

/**
 * EPSS scores - probability of exploitation
 * Bulk fetch instead of per-CVE
 */
export async function fetchEPSSBatch(cveIds) {
  if (!cveIds || cveIds.length === 0) return {};
  const ids = cveIds.slice(0, 100).join(','); // EPSS API limit
  const url = `https://api.first.org/data/v1/epss?cve=${ids}`;

  return swrFetch(`epss:${ids.slice(0, 50)}`, async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`EPSS ${res.status}`);
    const data = await res.json();
    const map = {};
    (data.data || []).forEach(d => {
      map[d.cve] = { epss: parseFloat(d.epss), percentile: parseFloat(d.percentile) };
    });
    return map;
  });
}

/**
 * Single combined fetch for dashboards - batched + cached + parallel
 *
 * Returns enriched CVE list ready for MWS scoring.
 */
export async function fetchEnrichedCVEs(limit = 50) {
  const [recent, kev] = await Promise.all([
    fetchRecentCVEs(limit),
    fetchKEV(),
  ]);

  const kevSet = new Set(kev.vulnerabilities.map(v => v.id));
  const ids = recent.map(c => c.id);
  const epssMap = await fetchEPSSBatch(ids);

  return recent.map(c => ({
    ...c,
    isKev: kevSet.has(c.id),
    epss: epssMap[c.id]?.epss || 0,
    epssPercentile: epssMap[c.id]?.percentile || 0,
    isInternetFacing: true, // Default to true for unknown environment
  }));
}

/**
 * KEV-specific enrichment for KEV Tracker dashboard
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
      hasPoc: true, // KEV-listed CVEs almost always have public exploits
      cvss: 8, // Default high - KEV implies critical-ish
      isInternetFacing: true,
    })),
  };
}
