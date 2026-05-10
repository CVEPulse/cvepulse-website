/**
 * Mythos Weaponization Score (MWS) - Composite scoring engine
 *
 * Six-signal composite score (0-100) measuring how attractive a CVE is to
 * Mythos-class autonomous AI exploitation.
 *
 * Weights:
 *   CVSS Base Score:        20%
 *   EPSS Probability:       25%  (heaviest)
 *   CISA KEV Listing:       20%  (binary)
 *   Public PoC Available:   15%
 *   Internet-Facing:        12%
 *   Attack Class Affinity:   8%
 */

const ATTACK_CLASS_AFFINITY = {
  RCE: 1.0,                    // Remote Code Execution - highest Mythos affinity
  AUTH_BYPASS: 0.95,           // Authentication bypass
  LFI: 0.9,                    // Local File Inclusion
  CMD_INJECTION: 0.9,          // Command Injection
  DESERIALIZATION: 0.85,       // Insecure deserialization
  SQLI: 0.7,                   // SQL Injection
  XXE: 0.65,                   // XML External Entity
  SSRF: 0.65,                  // Server-Side Request Forgery
  XSS: 0.5,                    // Cross-Site Scripting
  CSRF: 0.4,                   // Cross-Site Request Forgery
  DOS: 0.25,                   // Denial of Service - lowest
  INFO_DISCLOSURE: 0.4,
  UNKNOWN: 0.5,
};

/**
 * Infer attack class from CVE description / CWE
 */
export function inferAttackClass(cve) {
  const desc = (cve.description || '').toLowerCase();
  const cwe = (cve.cwe || '').toLowerCase();

  if (/remote code execution|rce|arbitrary code|command execution/.test(desc)) return 'RCE';
  if (/authentication bypass|auth.{0,15}bypass|unauthenticated/.test(desc)) return 'AUTH_BYPASS';
  if (/command injection|os command|shell injection/.test(desc) || cwe.includes('cwe-78')) return 'CMD_INJECTION';
  if (/deserialization|deserialize|unsafe object/.test(desc) || cwe.includes('cwe-502')) return 'DESERIALIZATION';
  if (/path traversal|directory traversal|local file inclusion/.test(desc) || cwe.includes('cwe-22')) return 'LFI';
  if (/sql injection|sqli/.test(desc) || cwe.includes('cwe-89')) return 'SQLI';
  if (/xml external entity|xxe/.test(desc) || cwe.includes('cwe-611')) return 'XXE';
  if (/server.side request forgery|ssrf/.test(desc) || cwe.includes('cwe-918')) return 'SSRF';
  if (/cross.site scripting|xss/.test(desc) || cwe.includes('cwe-79')) return 'XSS';
  if (/cross.site request forgery|csrf/.test(desc) || cwe.includes('cwe-352')) return 'CSRF';
  if (/denial of service|dos|crash/.test(desc) || cwe.includes('cwe-400')) return 'DOS';
  if (/information disclosure|sensitive data/.test(desc) || cwe.includes('cwe-200')) return 'INFO_DISCLOSURE';
  return 'UNKNOWN';
}

/**
 * Calculate Mythos Weaponization Score for a CVE
 *
 * @param {Object} cve - CVE object with: cvss, epss, isKev, hasPoc, isInternetFacing, attackClass
 * @returns {Object} { score, breakdown, verdict, tags }
 */
export function calculateMWS(cve) {
  const cvss = clamp(cve.cvss || 0, 0, 10);
  const epss = clamp(cve.epss || 0, 0, 1);
  const isKev = !!cve.isKev;
  const hasPoc = !!cve.hasPoc;
  const isInternetFacing = cve.isInternetFacing !== false; // default true for unknown - safer
  const attackClass = cve.attackClass || inferAttackClass(cve);

  // Component scores (each normalized to 0-100)
  const cvssScore = (cvss / 10) * 100;
  const epssScore = epss * 100;
  const kevScore = isKev ? 100 : 0;
  const pocScore = hasPoc ? 100 : 0;
  const exposureScore = isInternetFacing ? 100 : 30; // internal still some risk
  const classScore = (ATTACK_CLASS_AFFINITY[attackClass] || 0.5) * 100;

  // Weighted composite
  const score = Math.round(
    cvssScore * 0.20 +
    epssScore * 0.25 +
    kevScore  * 0.20 +
    pocScore  * 0.15 +
    exposureScore * 0.12 +
    classScore * 0.08
  );

  return {
    score,
    breakdown: {
      cvss: { value: cvss, score: cvssScore, weight: 0.20 },
      epss: { value: epss, score: epssScore, weight: 0.25 },
      kev:  { value: isKev, score: kevScore, weight: 0.20 },
      poc:  { value: hasPoc, score: pocScore, weight: 0.15 },
      exposure: { value: isInternetFacing, score: exposureScore, weight: 0.12 },
      attackClass: { value: attackClass, score: classScore, weight: 0.08 },
    },
    verdict: getVerdict(score),
    tier: getTier(score),
    tags: buildTags({ cvss, epss, isKev, hasPoc, isInternetFacing, attackClass }),
  };
}

function getVerdict(score) {
  if (score >= 90) return 'A textbook Mythos target.';
  if (score >= 80) return 'High Mythos affinity — patch immediately.';
  if (score >= 65) return 'Elevated AI exploit risk.';
  if (score >= 45) return 'Moderate exposure — within standard SLA.';
  return 'Low Mythos affinity.';
}

function getTier(score) {
  if (score >= 85) return 'critical';   // red
  if (score >= 70) return 'high';        // orange
  if (score >= 50) return 'medium';      // amber
  return 'low';                          // muted
}

function buildTags({ cvss, epss, isKev, hasPoc, isInternetFacing, attackClass }) {
  const tags = [];
  if (attackClass === 'RCE') tags.push({ label: 'RCE', tone: 'red' });
  if (attackClass === 'AUTH_BYPASS') tags.push({ label: 'Auth Bypass', tone: 'red' });
  if (isKev) tags.push({ label: 'KEV listed', tone: 'red' });
  if (epss >= 0.9) tags.push({ label: `EPSS ${epss.toFixed(2)}`, tone: 'amber' });
  if (hasPoc) tags.push({ label: 'PoC public', tone: 'amber' });
  if (isInternetFacing) tags.push({ label: 'Internet-facing', tone: 'cyan' });
  if (cvss >= 9) tags.push({ label: `CVSS ${cvss.toFixed(1)}`, tone: 'red' });
  return tags;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Bulk scoring with sort and bucket helpers
 */
export function scoreAndSort(cves) {
  return cves
    .map(cve => ({ ...cve, mws: calculateMWS(cve) }))
    .sort((a, b) => b.mws.score - a.mws.score);
}

export function bucketByTier(scoredCves) {
  return scoredCves.reduce((acc, cve) => {
    const tier = cve.mws.tier;
    acc[tier] = acc[tier] || [];
    acc[tier].push(cve);
    return acc;
  }, { critical: [], high: [], medium: [], low: [] });
}

/**
 * "If Mythos targeted you today" - the headline insight
 */
export function generateMythosInsight(scoredCves) {
  const critical = scoredCves.filter(c => c.mws.tier === 'critical');
  const kevPlusPoc = scoredCves.filter(c => c.isKev && c.hasPoc);
  const internetFacingRce = scoredCves.filter(
    c => c.isInternetFacing && c.mws.breakdown.attackClass.value === 'RCE'
  );

  return {
    totalAtRisk: critical.length,
    criticalIds: critical.slice(0, 5).map(c => c.id),
    kevPlusPocCount: kevPlusPoc.length,
    internetFacingRceCount: internetFacingRce.length,
    topThreat: critical[0] || null,
  };
}
