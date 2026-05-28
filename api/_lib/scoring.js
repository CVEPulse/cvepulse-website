// Shared MWS scoring logic — used by serverless functions
// This is a CommonJS-style mirror of src/lib/mythosScoring.js
// (Vercel functions can't easily import from src/, so we duplicate the logic here)

const ATTACK_CLASS_AFFINITY = {
  RCE: 1.0,
  AUTH_BYPASS: 0.95,
  LFI: 0.9,
  CMD_INJECTION: 0.9,
  DESERIALIZATION: 0.85,
  SQLI: 0.7,
  XXE: 0.65,
  SSRF: 0.65,
  XSS: 0.5,
  CSRF: 0.4,
  DOS: 0.25,
  INFO_DISCLOSURE: 0.4,
  UNKNOWN: 0.5,
};

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

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function getVerdict(score) {
  if (score >= 90) return 'A textbook Mythos target.';
  if (score >= 80) return 'High Mythos affinity — patch immediately.';
  if (score >= 65) return 'Elevated AI exploit risk.';
  if (score >= 45) return 'Moderate exposure — within standard SLA.';
  return 'Low Mythos affinity.';
}

function getTier(score) {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
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

export function calculateMWS(cve) {
  const cvss = clamp(cve.cvss || 0, 0, 10);
  const epss = clamp(cve.epss || 0, 0, 1);
  const isKev = !!cve.isKev;
  const hasPoc = !!cve.hasPoc;
  const isInternetFacing = cve.isInternetFacing !== false;
  const attackClass = cve.attackClass || inferAttackClass(cve);

  const cvssScore = (cvss / 10) * 100;
  const epssScore = epss * 100;
  const kevScore = isKev ? 100 : 0;
  const pocScore = hasPoc ? 100 : 0;
  const exposureScore = isInternetFacing ? 100 : 30;
  const classScore = (ATTACK_CLASS_AFFINITY[attackClass] || 0.5) * 100;

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
