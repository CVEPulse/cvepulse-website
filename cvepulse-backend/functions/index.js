/**
 * CVEPulse Threat Intelligence Platform - WORLD CLASS
 * Firebase Cloud Functions
 * 
 * FEATURES:
 * - Threat relevance scoring (not just CVSS)
 * - Correlation & campaign detection
 * - Actionable recommendations
 * - Executive summaries
 * - Data quality & noise reduction
 * - Timeline & trend analysis
 * 
 * ALL LIVE DATA - NO MOCK DATA
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ============================================
// CONFIGURATION
// ============================================
const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const EPSS_API = 'https://api.first.org/data/v1/epss';

// Sector keywords for relevance
const SECTOR_KEYWORDS = {
  healthcare: ['hospital', 'health', 'medical', 'pharma', 'clinic', 'patient', 'drug', 'biotech'],
  finance: ['bank', 'financial', 'insurance', 'credit', 'payment', 'trading', 'investment', 'fintech'],
  technology: ['software', 'tech', 'cloud', 'saas', 'data center', 'hosting', 'it service'],
  manufacturing: ['manufacturing', 'industrial', 'factory', 'automotive', 'aerospace'],
  energy: ['energy', 'oil', 'gas', 'utility', 'power', 'electric', 'nuclear'],
  government: ['government', 'federal', 'state', 'municipal', 'defense', 'military'],
  retail: ['retail', 'ecommerce', 'store', 'shop', 'consumer'],
  education: ['university', 'college', 'school', 'education', 'academic']
};

// MITRE ATT&CK mapping
const MITRE_TECHNIQUES = {
  'emotet': { tactics: ['Initial Access', 'Execution'], techniques: ['T1566.001', 'T1059.005', 'T1547.001'] },
  'qakbot': { tactics: ['Initial Access', 'Execution', 'Defense Evasion'], techniques: ['T1566.001', 'T1059.001', 'T1055'] },
  'icedid': { tactics: ['Initial Access', 'Execution'], techniques: ['T1566.001', 'T1059.003', 'T1055.012'] },
  'cobalt strike': { tactics: ['Command and Control', 'Execution'], techniques: ['T1059.001', 'T1071.001', 'T1105'] },
  'lockbit': { tactics: ['Impact', 'Defense Evasion'], techniques: ['T1486', 'T1490', 'T1027'] },
  'blackcat': { tactics: ['Impact', 'Execution'], techniques: ['T1486', 'T1059.001', 'T1489'] },
  'cl0p': { tactics: ['Impact', 'Exfiltration'], techniques: ['T1486', 'T1567.002', 'T1190'] },
  'play': { tactics: ['Impact', 'Discovery'], techniques: ['T1486', 'T1082', 'T1083'] },
  'akira': { tactics: ['Impact', 'Lateral Movement'], techniques: ['T1486', 'T1021.001', 'T1570'] },
  'rhysida': { tactics: ['Impact', 'Credential Access'], techniques: ['T1486', 'T1003', 'T1552'] },
  '8base': { tactics: ['Impact', 'Collection'], techniques: ['T1486', 'T1560', 'T1074'] },
  'bianlian': { tactics: ['Impact', 'Exfiltration'], techniques: ['T1486', 'T1048', 'T1567'] }
};

// Source reliability scores
const SOURCE_RELIABILITY = {
  'cisa_kev': 95,
  'threatfox': 85,
  'urlhaus': 80,
  'malwarebazaar': 85,
  'feodotracker': 90,
  'ransomware_live': 75
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate threat relevance score (0-100)
function calculateRelevanceScore(threat) {
  let score = 0;
  const factors = [];
  
  // Factor 1: Exploit status (0-30 points)
  if (threat.activeExploitation) {
    score += 30;
    factors.push({ factor: 'Active Exploitation', points: 30, reason: 'Confirmed active exploitation in the wild' });
  } else if (threat.pocAvailable) {
    score += 15;
    factors.push({ factor: 'PoC Available', points: 15, reason: 'Proof of concept code publicly available' });
  }
  
  // Factor 2: Recency (0-25 points)
  const ageHours = threat.ageHours || 168;
  if (ageHours <= 24) {
    score += 25;
    factors.push({ factor: 'Recency', points: 25, reason: 'Discovered within last 24 hours' });
  } else if (ageHours <= 72) {
    score += 20;
    factors.push({ factor: 'Recency', points: 20, reason: 'Discovered within last 3 days' });
  } else if (ageHours <= 168) {
    score += 10;
    factors.push({ factor: 'Recency', points: 10, reason: 'Discovered within last 7 days' });
  }
  
  // Factor 3: Source reliability (0-20 points)
  const sourceScore = threat.sourceReliability || 70;
  const sourcePoints = Math.round((sourceScore / 100) * 20);
  score += sourcePoints;
  factors.push({ factor: 'Source Reliability', points: sourcePoints, reason: `Source confidence: ${sourceScore}%` });
  
  // Factor 4: Threat actor association (0-15 points)
  if (threat.threatActor) {
    score += 15;
    factors.push({ factor: 'Threat Actor', points: 15, reason: `Associated with ${threat.threatActor}` });
  }
  
  // Factor 5: Prevalence (0-10 points)
  if (threat.prevalence === 'high') {
    score += 10;
    factors.push({ factor: 'Prevalence', points: 10, reason: 'High prevalence across multiple sources' });
  } else if (threat.prevalence === 'medium') {
    score += 5;
    factors.push({ factor: 'Prevalence', points: 5, reason: 'Medium prevalence' });
  }
  
  return { score: Math.min(100, score), factors };
}

// Determine recommended action
function getRecommendedAction(threat) {
  const score = threat.relevanceScore || 0;
  
  if (score >= 80 || threat.activeExploitation) {
    return {
      action: 'BLOCK_IMMEDIATELY',
      priority: 'CRITICAL',
      reason: 'Active exploitation confirmed - immediate blocking required',
      steps: ['Add to blocklist immediately', 'Hunt for indicators in environment', 'Alert SOC team', 'Check for compromise indicators']
    };
  } else if (score >= 60) {
    return {
      action: 'INVESTIGATE',
      priority: 'HIGH',
      reason: 'High-confidence threat requiring investigation',
      steps: ['Search logs for indicators', 'Review affected systems', 'Prepare blocking rules', 'Monitor for activity']
    };
  } else if (score >= 40) {
    return {
      action: 'MONITOR',
      priority: 'MEDIUM',
      reason: 'Credible threat - add to watchlist',
      steps: ['Add to monitoring watchlist', 'Set up alerts', 'Review weekly']
    };
  } else {
    return {
      action: 'TRACK',
      priority: 'LOW',
      reason: 'Low-confidence or low-relevance - track for awareness',
      steps: ['Log for awareness', 'No immediate action required']
    };
  }
}

// Detect campaigns by correlating threats
function detectCampaigns(threats) {
  const campaigns = [];
  const groupedByActor = {};
  const groupedByMalware = {};
  
  threats.forEach(t => {
    if (t.threatActor) {
      if (!groupedByActor[t.threatActor]) groupedByActor[t.threatActor] = [];
      groupedByActor[t.threatActor].push(t);
    }
    if (t.malwareFamily) {
      if (!groupedByMalware[t.malwareFamily]) groupedByMalware[t.malwareFamily] = [];
      groupedByMalware[t.malwareFamily].push(t);
    }
  });
  
  // Detect actor-based campaigns
  Object.entries(groupedByActor).forEach(([actor, items]) => {
    if (items.length >= 3) {
      const recentItems = items.filter(i => (i.ageHours || 999) <= 168);
      if (recentItems.length >= 2) {
        campaigns.push({
          type: 'actor_campaign',
          name: `${actor} Campaign`,
          actor: actor,
          threatCount: recentItems.length,
          indicators: recentItems.slice(0, 5).map(i => i.indicator),
          status: 'ACTIVE',
          description: `Active campaign by ${actor} with ${recentItems.length} indicators observed in the last 7 days`
        });
      }
    }
  });
  
  // Detect malware-based campaigns
  Object.entries(groupedByMalware).forEach(([malware, items]) => {
    if (items.length >= 5) {
      const recentItems = items.filter(i => (i.ageHours || 999) <= 72);
      if (recentItems.length >= 3) {
        campaigns.push({
          type: 'malware_campaign',
          name: `${malware} Distribution`,
          malware: malware,
          threatCount: recentItems.length,
          indicators: recentItems.slice(0, 5).map(i => i.indicator),
          status: 'ACTIVE',
          description: `Active ${malware} distribution campaign with ${recentItems.length} new indicators`
        });
      }
    }
  });
  
  return campaigns;
}

// Calculate overall threat posture
function calculateThreatPosture(data) {
  let score = 0;
  const factors = [];
  
  // Factor 1: Ransomware activity (0-30)
  const ransomware24h = data.ransomware24h || 0;
  if (ransomware24h >= 15) {
    score += 30;
    factors.push({ factor: 'Ransomware Activity', level: 'CRITICAL', detail: `${ransomware24h} victims in 24h` });
  } else if (ransomware24h >= 8) {
    score += 20;
    factors.push({ factor: 'Ransomware Activity', level: 'HIGH', detail: `${ransomware24h} victims in 24h` });
  } else if (ransomware24h >= 3) {
    score += 10;
    factors.push({ factor: 'Ransomware Activity', level: 'MODERATE', detail: `${ransomware24h} victims in 24h` });
  }
  
  // Factor 2: New KEV CVEs (0-25)
  const newKEV = data.newKEV7d || 0;
  if (newKEV >= 5) {
    score += 25;
    factors.push({ factor: 'CISA KEV Additions', level: 'CRITICAL', detail: `${newKEV} new exploited CVEs this week` });
  } else if (newKEV >= 3) {
    score += 15;
    factors.push({ factor: 'CISA KEV Additions', level: 'HIGH', detail: `${newKEV} new exploited CVEs this week` });
  } else if (newKEV >= 1) {
    score += 8;
    factors.push({ factor: 'CISA KEV Additions', level: 'MODERATE', detail: `${newKEV} new exploited CVEs this week` });
  }
  
  // Factor 3: Active campaigns (0-25)
  const activeCampaigns = data.activeCampaigns || 0;
  if (activeCampaigns >= 5) {
    score += 25;
    factors.push({ factor: 'Active Campaigns', level: 'CRITICAL', detail: `${activeCampaigns} active threat campaigns` });
  } else if (activeCampaigns >= 3) {
    score += 15;
    factors.push({ factor: 'Active Campaigns', level: 'HIGH', detail: `${activeCampaigns} active threat campaigns` });
  } else if (activeCampaigns >= 1) {
    score += 8;
    factors.push({ factor: 'Active Campaigns', level: 'MODERATE', detail: `${activeCampaigns} active threat campaigns` });
  }
  
  // Factor 4: High-relevance IoCs (0-20)
  const criticalIoCs = data.criticalIoCs || 0;
  if (criticalIoCs >= 50) {
    score += 20;
    factors.push({ factor: 'Critical IoCs', level: 'HIGH', detail: `${criticalIoCs} high-relevance indicators` });
  } else if (criticalIoCs >= 20) {
    score += 12;
    factors.push({ factor: 'Critical IoCs', level: 'MODERATE', detail: `${criticalIoCs} high-relevance indicators` });
  }
  
  // Determine posture level
  let posture = 'LOW';
  if (score >= 70) posture = 'CRITICAL';
  else if (score >= 50) posture = 'HIGH';
  else if (score >= 30) posture = 'MODERATE';
  
  return { score, posture, factors };
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * EXECUTIVE DASHBOARD - Top Risk Snapshot
 * GET /executiveDashboard
 */
exports.executiveDashboard = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Generating executive dashboard...');
      
      // Fetch all data sources in parallel
      const [kevRes, threatfoxRes, urlhausRes, ransomwareRes, feodoRes] = await Promise.allSettled([
        fetch(CISA_KEV_URL).then(r => r.json()),
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: 7 })
        }).then(r => r.json()),
        fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/500/').then(r => r.json()),
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json').then(r => r.json())
      ]);
      
      // Process CISA KEV
      const kevData = kevRes.status === 'fulfilled' ? kevRes.value : { vulnerabilities: [] };
      const now = Date.now();
      const kevNew7d = kevData.vulnerabilities?.filter(v => {
        const added = new Date(v.dateAdded);
        return (now - added) < 7 * 24 * 60 * 60 * 1000;
      }) || [];
      const kevOverdue = kevData.vulnerabilities?.filter(v => {
        const due = new Date(v.dueDate);
        return due < new Date();
      }) || [];
      
      // Process ransomware
      const ransomwareData = ransomwareRes.status === 'fulfilled' && Array.isArray(ransomwareRes.value) ? ransomwareRes.value : [];
      const ransomware24h = ransomwareData.filter(v => {
        const discovered = new Date(v.discovered || v.published);
        return (now - discovered) < 24 * 60 * 60 * 1000;
      });
      const ransomware7d = ransomwareData.filter(v => {
        const discovered = new Date(v.discovered || v.published);
        return (now - discovered) < 7 * 24 * 60 * 60 * 1000;
      });
      
      // Process threat fox IoCs
      const threatfoxData = threatfoxRes.status === 'fulfilled' ? threatfoxRes.value?.data || [] : [];
      const highConfidenceIoCs = threatfoxData.filter(ioc => (ioc.confidence_level || 0) >= 75);
      
      // Process botnets
      const feodoData = feodoRes.status === 'fulfilled' && Array.isArray(feodoRes.value) ? feodoRes.value : [];
      
      // Calculate threat posture
      const postureData = {
        ransomware24h: ransomware24h.length,
        newKEV7d: kevNew7d.length,
        activeCampaigns: 0, // Will be calculated
        criticalIoCs: highConfidenceIoCs.length
      };
      
      // Build enriched threat list for campaign detection
      const enrichedThreats = threatfoxData.slice(0, 200).map(ioc => ({
        indicator: ioc.ioc,
        type: ioc.ioc_type,
        malwareFamily: ioc.malware_printable,
        threatActor: ioc.threat_type === 'botnet_cc' ? 'Botnet Operator' : null,
        ageHours: ioc.first_seen ? Math.floor((now - new Date(ioc.first_seen)) / 3600000) : 999,
        sourceReliability: SOURCE_RELIABILITY.threatfox
      }));
      
      // Detect campaigns
      const campaigns = detectCampaigns(enrichedThreats);
      postureData.activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
      
      // Calculate final posture
      const posture = calculateThreatPosture(postureData);
      
      // Top ransomware groups this week
      const groupCounts = {};
      ransomware7d.forEach(v => {
        const group = v.group_name || 'Unknown';
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      });
      const topGroups = Object.entries(groupCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          victims: count,
          trend: count >= 5 ? 'INCREASING' : 'STABLE',
          mitre: MITRE_TECHNIQUES[name.toLowerCase()] || null
        }));
      
      // Top malware families
      const malwareCounts = {};
      threatfoxData.forEach(ioc => {
        const family = ioc.malware_printable || 'Unknown';
        malwareCounts[family] = (malwareCounts[family] || 0) + 1;
      });
      const topMalware = Object.entries(malwareCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          indicators: count,
          mitre: MITRE_TECHNIQUES[name.toLowerCase()] || null
        }));
      
      // Generate top 5 emerging threats (plain English)
      const emergingThreats = [];
      
      if (kevNew7d.length > 0) {
        const topKEV = kevNew7d[0];
        emergingThreats.push({
          title: `${topKEV.cveID} - Actively Exploited`,
          summary: `${topKEV.vendorProject} ${topKEV.product} vulnerability is being actively exploited. Patch deadline: ${topKEV.dueDate}`,
          severity: 'CRITICAL',
          activeExploitation: true,
          actionRequired: 'Patch immediately'
        });
      }
      
      if (topGroups[0] && topGroups[0].victims >= 3) {
        emergingThreats.push({
          title: `${topGroups[0].name} Ransomware Surge`,
          summary: `${topGroups[0].name} has claimed ${topGroups[0].victims} victims this week, showing increased activity.`,
          severity: topGroups[0].victims >= 5 ? 'CRITICAL' : 'HIGH',
          activeExploitation: true,
          actionRequired: 'Review ransomware defenses'
        });
      }
      
      if (campaigns.length > 0) {
        const topCampaign = campaigns[0];
        emergingThreats.push({
          title: topCampaign.name,
          summary: topCampaign.description,
          severity: 'HIGH',
          activeExploitation: true,
          actionRequired: 'Block associated indicators'
        });
      }
      
      if (topMalware[0] && topMalware[0].indicators >= 20) {
        emergingThreats.push({
          title: `${topMalware[0].name} Distribution Active`,
          summary: `${topMalware[0].indicators} new ${topMalware[0].name} indicators detected this week.`,
          severity: 'HIGH',
          activeExploitation: true,
          actionRequired: 'Update threat feeds and signatures'
        });
      }
      
      if (feodoData.length > 50) {
        emergingThreats.push({
          title: 'Botnet C2 Infrastructure Active',
          summary: `${feodoData.length} active botnet command & control servers detected.`,
          severity: 'MEDIUM',
          activeExploitation: true,
          actionRequired: 'Verify C2 blocklist is current'
        });
      }
      
      // Trend comparison (simulated based on current data - in production, compare to stored historical)
      const trend = ransomware24h.length > (ransomware7d.length / 7) ? 'INCREASING' : 
                    ransomware24h.length < (ransomware7d.length / 14) ? 'DECREASING' : 'STABLE';
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        threatPosture: {
          level: posture.posture,
          score: posture.score,
          trend: trend,
          factors: posture.factors
        },
        emergingThreats: emergingThreats.slice(0, 5),
        metrics: {
          ransomware: {
            last24h: ransomware24h.length,
            last7d: ransomware7d.length,
            topGroups: topGroups
          },
          vulnerabilities: {
            newKEV7d: kevNew7d.length,
            overduePatches: kevOverdue.length,
            totalKEV: kevData.vulnerabilities?.length || 0
          },
          indicators: {
            totalIoCs: threatfoxData.length,
            highConfidence: highConfidenceIoCs.length,
            maliciousURLs: urlhausRes.status === 'fulfilled' ? urlhausRes.value?.urls?.length || 0 : 0,
            botnetC2: feodoData.length
          },
          campaigns: {
            active: campaigns.filter(c => c.status === 'ACTIVE').length,
            list: campaigns.slice(0, 3)
          }
        },
        topMalware: topMalware,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Executive dashboard error:', error);
      res.status(500).json({ error: 'Failed to generate executive dashboard' });
    }
  });
});

/**
 * ENRICHED THREAT FEED - With scoring and context
 * GET /enrichedThreats?limit=50
 */
exports.enrichedThreats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      console.log(`Fetching enriched threats (limit: ${limit})...`);
      
      // Fetch threat data
      const [threatfoxRes, urlhausRes, kevRes] = await Promise.allSettled([
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: 3 })
        }).then(r => r.json()),
        fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/200/').then(r => r.json()),
        fetch(CISA_KEV_URL).then(r => r.json())
      ]);
      
      const now = Date.now();
      const threats = [];
      
      // Process ThreatFox IoCs
      const threatfoxData = threatfoxRes.status === 'fulfilled' ? threatfoxRes.value?.data || [] : [];
      threatfoxData.slice(0, limit).forEach(ioc => {
        const ageHours = ioc.first_seen ? Math.floor((now - new Date(ioc.first_seen)) / 3600000) : 999;
        const threat = {
          id: ioc.id || `tf-${Date.now()}-${Math.random()}`,
          indicator: ioc.ioc,
          type: ioc.ioc_type,
          source: 'ThreatFox',
          malwareFamily: ioc.malware_printable || null,
          threatActor: null,
          firstSeen: ioc.first_seen,
          lastSeen: ioc.last_seen,
          ageHours: ageHours,
          sourceReliability: SOURCE_RELIABILITY.threatfox,
          activeExploitation: ioc.threat_type === 'botnet_cc',
          pocAvailable: false,
          prevalence: (ioc.confidence_level || 0) >= 75 ? 'high' : 'medium',
          mitre: MITRE_TECHNIQUES[ioc.malware_printable?.toLowerCase()] || null,
          tags: ioc.tags || []
        };
        
        // Calculate relevance score
        const scoring = calculateRelevanceScore(threat);
        threat.relevanceScore = scoring.score;
        threat.scoringFactors = scoring.factors;
        
        // Get recommended action
        const action = getRecommendedAction({ ...threat, relevanceScore: scoring.score });
        threat.recommendedAction = action;
        
        // Determine relevance level
        threat.relevanceLevel = scoring.score >= 70 ? 'HIGH' : scoring.score >= 40 ? 'MEDIUM' : 'LOW';
        
        threats.push(threat);
      });
      
      // Process URLhaus
      const urlhausData = urlhausRes.status === 'fulfilled' ? urlhausRes.value?.urls || [] : [];
      urlhausData.slice(0, Math.floor(limit / 2)).forEach(url => {
        const ageHours = url.date_added ? Math.floor((now - new Date(url.date_added)) / 3600000) : 999;
        const threat = {
          id: url.id || `uh-${Date.now()}-${Math.random()}`,
          indicator: url.url,
          type: 'url',
          source: 'URLhaus',
          malwareFamily: url.threat || null,
          threatActor: null,
          firstSeen: url.date_added,
          lastSeen: null,
          ageHours: ageHours,
          sourceReliability: SOURCE_RELIABILITY.urlhaus,
          activeExploitation: url.url_status === 'online',
          pocAvailable: false,
          prevalence: 'medium',
          mitre: MITRE_TECHNIQUES[url.threat?.toLowerCase()] || null,
          tags: url.tags || []
        };
        
        const scoring = calculateRelevanceScore(threat);
        threat.relevanceScore = scoring.score;
        threat.scoringFactors = scoring.factors;
        threat.recommendedAction = getRecommendedAction({ ...threat, relevanceScore: scoring.score });
        threat.relevanceLevel = scoring.score >= 70 ? 'HIGH' : scoring.score >= 40 ? 'MEDIUM' : 'LOW';
        
        threats.push(threat);
      });
      
      // Sort by relevance score
      threats.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Deduplicate
      const seen = new Set();
      const dedupedThreats = threats.filter(t => {
        if (seen.has(t.indicator)) return false;
        seen.add(t.indicator);
        return true;
      });
      
      // Stats
      const stats = {
        total: dedupedThreats.length,
        high: dedupedThreats.filter(t => t.relevanceLevel === 'HIGH').length,
        medium: dedupedThreats.filter(t => t.relevanceLevel === 'MEDIUM').length,
        low: dedupedThreats.filter(t => t.relevanceLevel === 'LOW').length,
        actionRequired: dedupedThreats.filter(t => t.recommendedAction.priority === 'CRITICAL' || t.recommendedAction.priority === 'HIGH').length
      };
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        stats: stats,
        threats: dedupedThreats.slice(0, limit)
      });
      
    } catch (error) {
      console.error('Enriched threats error:', error);
      res.status(500).json({ error: 'Failed to fetch enriched threats' });
    }
  });
});

/**
 * RANSOMWARE INTELLIGENCE - Detailed ransomware tracking
 * GET /ransomwareIntel
 */
exports.ransomwareIntel = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching ransomware intelligence...');
      
      const [victimsRes, groupsRes] = await Promise.allSettled([
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://api.ransomware.live/groups').then(r => r.json())
      ]);
      
      const victims = victimsRes.status === 'fulfilled' && Array.isArray(victimsRes.value) ? victimsRes.value : [];
      const groups = groupsRes.status === 'fulfilled' && Array.isArray(groupsRes.value) ? groupsRes.value : [];
      
      const now = Date.now();
      
      // Enrich victims with time analysis
      const enrichedVictims = victims.slice(0, 100).map(v => {
        const discovered = new Date(v.discovered || v.published);
        const ageHours = Math.floor((now - discovered) / 3600000);
        
        // Detect sector
        let sector = 'unknown';
        const victimText = `${v.victim || ''} ${v.activity || ''} ${v.description || ''}`.toLowerCase();
        for (const [sectorName, keywords] of Object.entries(SECTOR_KEYWORDS)) {
          if (keywords.some(kw => victimText.includes(kw))) {
            sector = sectorName;
            break;
          }
        }
        
        return {
          victim: v.victim,
          group: v.group_name,
          country: v.country,
          sector: sector,
          discovered: v.discovered || v.published,
          ageHours: ageHours,
          isNew: ageHours <= 24,
          mitre: MITRE_TECHNIQUES[v.group_name?.toLowerCase()] || null
        };
      });
      
      // Group statistics
      const groupStats = {};
      victims.forEach(v => {
        const group = v.group_name || 'Unknown';
        if (!groupStats[group]) {
          groupStats[group] = { name: group, total: 0, last24h: 0, last7d: 0, countries: new Set(), sectors: new Set() };
        }
        groupStats[group].total++;
        
        const discovered = new Date(v.discovered || v.published);
        const ageHours = (now - discovered) / 3600000;
        if (ageHours <= 24) groupStats[group].last24h++;
        if (ageHours <= 168) groupStats[group].last7d++;
        if (v.country) groupStats[group].countries.add(v.country);
        
        // Detect sector for group targeting
        const victimText = `${v.victim || ''} ${v.activity || ''}`.toLowerCase();
        for (const [sectorName, keywords] of Object.entries(SECTOR_KEYWORDS)) {
          if (keywords.some(kw => victimText.includes(kw))) {
            groupStats[group].sectors.add(sectorName);
            break;
          }
        }
      });
      
      // Convert to array and sort
      const groupsArray = Object.values(groupStats).map(g => ({
        name: g.name,
        totalVictims: g.total,
        last24h: g.last24h,
        last7d: g.last7d,
        countriesTargeted: g.countries.size,
        sectorsTargeted: Array.from(g.sectors),
        activityLevel: g.last24h >= 3 ? 'CRITICAL' : g.last7d >= 5 ? 'HIGH' : g.last7d >= 1 ? 'MODERATE' : 'LOW',
        mitre: MITRE_TECHNIQUES[g.name.toLowerCase()] || null
      })).sort((a, b) => b.last7d - a.last7d);
      
      // Sector breakdown
      const sectorBreakdown = {};
      enrichedVictims.forEach(v => {
        const s = v.sector || 'unknown';
        sectorBreakdown[s] = (sectorBreakdown[s] || 0) + 1;
      });
      
      // Country breakdown
      const countryBreakdown = {};
      enrichedVictims.forEach(v => {
        const c = v.country || 'Unknown';
        countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;
      });
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        summary: {
          totalVictims: victims.length,
          last24h: enrichedVictims.filter(v => v.isNew).length,
          activeGroups: groupsArray.filter(g => g.last7d > 0).length,
          totalGroups: groups.length
        },
        recentVictims: enrichedVictims.slice(0, 50),
        groupIntelligence: groupsArray.slice(0, 15),
        sectorBreakdown: Object.entries(sectorBreakdown)
          .sort((a, b) => b[1] - a[1])
          .map(([sector, count]) => ({ sector, count })),
        countryBreakdown: Object.entries(countryBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([country, count]) => ({ country, count }))
      });
      
    } catch (error) {
      console.error('Ransomware intel error:', error);
      res.status(500).json({ error: 'Failed to fetch ransomware intelligence' });
    }
  });
});

/**
 * IOC ENRICHMENT - Deep lookup with context
 * POST /iocEnrichment { type, value }
 */
exports.iocEnrichment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const { type, value } = req.body;
      if (!type || !value) {
        return res.status(400).json({ error: 'Missing type or value' });
      }
      
      console.log(`IoC enrichment: ${type} = ${value}`);
      
      const results = {
        indicator: value,
        type: type,
        timestamp: new Date().toISOString(),
        verdict: 'UNKNOWN',
        confidence: 0,
        sources: [],
        context: {},
        recommendations: []
      };
      
      let hitCount = 0;
      let totalConfidence = 0;
      
      // ThreatFox lookup
      try {
        const tfRes = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'search_ioc', search_term: value })
        });
        const tfData = await tfRes.json();
        
        if (tfData.query_status === 'ok' && tfData.data?.length > 0) {
          hitCount++;
          totalConfidence += SOURCE_RELIABILITY.threatfox;
          const match = tfData.data[0];
          results.sources.push({
            name: 'ThreatFox',
            status: 'FOUND',
            confidence: SOURCE_RELIABILITY.threatfox,
            details: {
              malware: match.malware_printable,
              threatType: match.threat_type,
              firstSeen: match.first_seen,
              lastSeen: match.last_seen,
              confidenceLevel: match.confidence_level
            }
          });
          results.context.malwareFamily = match.malware_printable;
          results.context.threatType = match.threat_type;
        } else {
          results.sources.push({ name: 'ThreatFox', status: 'NOT_FOUND', confidence: 0 });
        }
      } catch (e) {
        results.sources.push({ name: 'ThreatFox', status: 'ERROR', error: e.message });
      }
      
      // URLhaus lookup (for URLs and domains)
      if (type === 'url' || type === 'domain') {
        try {
          const endpoint = type === 'url' ? 'https://urlhaus-api.abuse.ch/v1/url/' : 'https://urlhaus-api.abuse.ch/v1/host/';
          const uhRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: type === 'url' ? `url=${encodeURIComponent(value)}` : `host=${encodeURIComponent(value)}`
          });
          const uhData = await uhRes.json();
          
          if (uhData.query_status === 'ok') {
            hitCount++;
            totalConfidence += SOURCE_RELIABILITY.urlhaus;
            results.sources.push({
              name: 'URLhaus',
              status: 'FOUND',
              confidence: SOURCE_RELIABILITY.urlhaus,
              details: {
                urlStatus: uhData.url_status || uhData.host_status,
                threat: uhData.threat,
                dateAdded: uhData.date_added,
                blacklists: uhData.blacklists
              }
            });
            results.context.urlStatus = uhData.url_status || uhData.host_status;
          } else {
            results.sources.push({ name: 'URLhaus', status: 'NOT_FOUND', confidence: 0 });
          }
        } catch (e) {
          results.sources.push({ name: 'URLhaus', status: 'ERROR', error: e.message });
        }
      }
      
      // MalwareBazaar lookup (for hashes)
      if (type === 'hash') {
        try {
          const mbRes = await fetch('https://mb-api.abuse.ch/api/v1/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `query=get_info&hash=${value}`
          });
          const mbData = await mbRes.json();
          
          if (mbData.query_status === 'ok' && mbData.data?.length > 0) {
            hitCount++;
            totalConfidence += SOURCE_RELIABILITY.malwarebazaar;
            const match = mbData.data[0];
            results.sources.push({
              name: 'MalwareBazaar',
              status: 'FOUND',
              confidence: SOURCE_RELIABILITY.malwarebazaar,
              details: {
                fileName: match.file_name,
                fileType: match.file_type,
                fileSize: match.file_size,
                signature: match.signature,
                firstSeen: match.first_seen
              }
            });
            results.context.fileType = match.file_type;
            results.context.signature = match.signature;
          } else {
            results.sources.push({ name: 'MalwareBazaar', status: 'NOT_FOUND', confidence: 0 });
          }
        } catch (e) {
          results.sources.push({ name: 'MalwareBazaar', status: 'ERROR', error: e.message });
        }
      }
      
      // Calculate verdict
      if (hitCount >= 2) {
        results.verdict = 'MALICIOUS';
        results.confidence = Math.min(95, Math.round(totalConfidence / hitCount));
      } else if (hitCount === 1) {
        results.verdict = 'SUSPICIOUS';
        results.confidence = Math.round(totalConfidence / 1.5);
      } else {
        results.verdict = 'UNKNOWN';
        results.confidence = 0;
      }
      
      // Generate recommendations
      if (results.verdict === 'MALICIOUS') {
        results.recommendations = [
          { action: 'BLOCK', priority: 'CRITICAL', detail: 'Add to blocklist immediately' },
          { action: 'HUNT', priority: 'HIGH', detail: 'Search for this indicator in logs and endpoints' },
          { action: 'ALERT', priority: 'HIGH', detail: 'Notify SOC and incident response team' }
        ];
      } else if (results.verdict === 'SUSPICIOUS') {
        results.recommendations = [
          { action: 'INVESTIGATE', priority: 'HIGH', detail: 'Investigate systems that communicated with this indicator' },
          { action: 'MONITOR', priority: 'MEDIUM', detail: 'Add to watchlist for continued monitoring' }
        ];
      } else {
        results.recommendations = [
          { action: 'CONTINUE_MONITORING', priority: 'LOW', detail: 'No immediate threat identified, continue normal monitoring' }
        ];
      }
      
      // Add MITRE context if malware family known
      if (results.context.malwareFamily) {
        results.mitre = MITRE_TECHNIQUES[results.context.malwareFamily.toLowerCase()] || null;
      }
      
      res.status(200).json(results);
      
    } catch (error) {
      console.error('IoC enrichment error:', error);
      res.status(500).json({ error: 'IoC enrichment failed' });
    }
  });
});

/**
 * TIMELINE DATA - Trend analysis over time
 * GET /timeline?period=7d
 */
exports.timeline = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const period = req.query.period || '7d';
      const days = period === '24h' ? 1 : period === '30d' ? 30 : 7;
      console.log(`Generating timeline for ${days} days...`);
      
      const [ransomwareRes, threatfoxRes] = await Promise.allSettled([
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: days })
        }).then(r => r.json())
      ]);
      
      const ransomware = ransomwareRes.status === 'fulfilled' && Array.isArray(ransomwareRes.value) ? ransomwareRes.value : [];
      const threatfox = threatfoxRes.status === 'fulfilled' ? threatfoxRes.value?.data || [] : [];
      
      // Build daily breakdown
      const dailyData = {};
      const now = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = { ransomware: 0, iocs: 0, malware: {} };
      }
      
      // Count ransomware by day
      ransomware.forEach(v => {
        const date = (v.discovered || v.published || '').split(' ')[0];
        if (dailyData[date]) {
          dailyData[date].ransomware++;
        }
      });
      
      // Count IoCs by day
      threatfox.forEach(ioc => {
        const date = (ioc.first_seen || '').split(' ')[0];
        if (dailyData[date]) {
          dailyData[date].iocs++;
          const malware = ioc.malware_printable || 'Unknown';
          dailyData[date].malware[malware] = (dailyData[date].malware[malware] || 0) + 1;
        }
      });
      
      // Convert to array
      const timeline = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          ransomwareVictims: data.ransomware,
          newIoCs: data.iocs,
          topMalware: Object.entries(data.malware).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }))
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Detect anomalies
      const avgRansomware = timeline.reduce((sum, d) => sum + d.ransomwareVictims, 0) / timeline.length;
      const avgIoCs = timeline.reduce((sum, d) => sum + d.newIoCs, 0) / timeline.length;
      
      const anomalies = timeline.filter(d => 
        d.ransomwareVictims > avgRansomware * 2 || d.newIoCs > avgIoCs * 2
      ).map(d => ({
        date: d.date,
        type: d.ransomwareVictims > avgRansomware * 2 ? 'ransomware_spike' : 'ioc_spike',
        detail: d.ransomwareVictims > avgRansomware * 2 ? 
          `Ransomware victims ${Math.round(d.ransomwareVictims / avgRansomware)}x above average` :
          `IoCs ${Math.round(d.newIoCs / avgIoCs)}x above average`
      }));
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        period: period,
        days: days,
        timeline: timeline,
        averages: {
          ransomwarePerDay: Math.round(avgRansomware * 10) / 10,
          iocsPerDay: Math.round(avgIoCs)
        },
        anomalies: anomalies,
        trend: {
          ransomware: timeline[timeline.length - 1]?.ransomwareVictims > avgRansomware ? 'INCREASING' : 'STABLE',
          iocs: timeline[timeline.length - 1]?.newIoCs > avgIoCs ? 'INCREASING' : 'STABLE'
        }
      });
      
    } catch (error) {
      console.error('Timeline error:', error);
      res.status(500).json({ error: 'Failed to generate timeline' });
    }
  });
});

/**
 * CAMPAIGN INTELLIGENCE - Correlated threat campaigns
 * GET /campaigns
 */
exports.campaigns = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Detecting threat campaigns...');
      
      const [threatfoxRes, ransomwareRes] = await Promise.allSettled([
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: 7 })
        }).then(r => r.json()),
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json())
      ]);
      
      const threatfox = threatfoxRes.status === 'fulfilled' ? threatfoxRes.value?.data || [] : [];
      const ransomware = ransomwareRes.status === 'fulfilled' && Array.isArray(ransomwareRes.value) ? ransomwareRes.value : [];
      
      const now = Date.now();
      const campaigns = [];
      
      // Detect malware distribution campaigns
      const malwareClusters = {};
      threatfox.forEach(ioc => {
        const family = ioc.malware_printable;
        if (!family) return;
        
        if (!malwareClusters[family]) {
          malwareClusters[family] = {
            indicators: [],
            types: new Set(),
            firstSeen: null,
            lastSeen: null
          };
        }
        
        malwareClusters[family].indicators.push(ioc.ioc);
        malwareClusters[family].types.add(ioc.ioc_type);
        
        const seen = new Date(ioc.first_seen);
        if (!malwareClusters[family].firstSeen || seen < malwareClusters[family].firstSeen) {
          malwareClusters[family].firstSeen = seen;
        }
        if (!malwareClusters[family].lastSeen || seen > malwareClusters[family].lastSeen) {
          malwareClusters[family].lastSeen = seen;
        }
      });
      
      // Convert clusters to campaigns
      Object.entries(malwareClusters).forEach(([family, data]) => {
        if (data.indicators.length >= 10) {
          const isRecent = (now - data.lastSeen) < 72 * 3600000;
          campaigns.push({
            id: `malware-${family.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${family} Distribution Campaign`,
            type: 'malware_distribution',
            status: isRecent ? 'ACTIVE' : 'DORMANT',
            malwareFamily: family,
            indicatorCount: data.indicators.length,
            indicatorTypes: Array.from(data.types),
            firstSeen: data.firstSeen?.toISOString(),
            lastSeen: data.lastSeen?.toISOString(),
            sampleIndicators: data.indicators.slice(0, 5),
            mitre: MITRE_TECHNIQUES[family.toLowerCase()] || null,
            severity: data.indicators.length >= 50 ? 'CRITICAL' : data.indicators.length >= 20 ? 'HIGH' : 'MEDIUM'
          });
        }
      });
      
      // Detect ransomware campaigns
      const ransomwareGroups = {};
      ransomware.forEach(v => {
        const group = v.group_name;
        if (!group) return;
        
        if (!ransomwareGroups[group]) {
          ransomwareGroups[group] = {
            victims: [],
            countries: new Set(),
            sectors: new Set()
          };
        }
        
        ransomwareGroups[group].victims.push({
          name: v.victim,
          country: v.country,
          date: v.discovered || v.published
        });
        if (v.country) ransomwareGroups[group].countries.add(v.country);
        
        // Detect sector
        const text = `${v.victim || ''} ${v.activity || ''}`.toLowerCase();
        for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
          if (keywords.some(kw => text.includes(kw))) {
            ransomwareGroups[group].sectors.add(sector);
            break;
          }
        }
      });
      
      // Convert to campaigns
      Object.entries(ransomwareGroups).forEach(([group, data]) => {
        const recentVictims = data.victims.filter(v => {
          const date = new Date(v.date);
          return (now - date) < 7 * 24 * 3600000;
        });
        
        if (recentVictims.length >= 3) {
          campaigns.push({
            id: `ransomware-${group.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${group} Ransomware Campaign`,
            type: 'ransomware',
            status: 'ACTIVE',
            threatActor: group,
            victimCount: recentVictims.length,
            totalVictims: data.victims.length,
            countriesTargeted: Array.from(data.countries),
            sectorsTargeted: Array.from(data.sectors),
            recentVictims: recentVictims.slice(0, 5),
            mitre: MITRE_TECHNIQUES[group.toLowerCase()] || null,
            severity: recentVictims.length >= 10 ? 'CRITICAL' : recentVictims.length >= 5 ? 'HIGH' : 'MEDIUM'
          });
        }
      });
      
      // Sort by severity and activity
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      campaigns.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1;
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        campaigns: campaigns
      });
      
    } catch (error) {
      console.error('Campaigns error:', error);
      res.status(500).json({ error: 'Failed to detect campaigns' });
    }
  });
});

// ============================================
// EXISTING ENDPOINTS (Keep for compatibility)
// ============================================

exports.kevdata = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const response = await fetch(CISA_KEV_URL);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch KEV data' });
    }
  });
});

exports.subscribe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const { email, company, frequency, sector, watchlist } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });
      
      await db.collection('subscribers').doc(email).set({
        email, company: company || '', frequency: frequency || 'daily',
        sector: sector || 'general', watchlist: watchlist || [],
        active: true, source: 'threat-dashboard-v3',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Subscribe failed' });
    }
  });
});

exports.lead = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const { name, email, company, service, message } = req.body;
      if (!email || !name) return res.status(400).json({ error: 'Name and email required' });
      
      await db.collection('leads').add({
        name, email, company: company || '', service: service || '',
        message: message || '', source: 'threat-dashboard-v3',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Lead capture failed' });
    }
  });
});

// Export all functions
module.exports = {
  executiveDashboard: exports.executiveDashboard,
  enrichedThreats: exports.enrichedThreats,
  ransomwareIntel: exports.ransomwareIntel,
  iocEnrichment: exports.iocEnrichment,
  timeline: exports.timeline,
  campaigns: exports.campaigns,
  kevdata: exports.kevdata,
  subscribe: exports.subscribe,
  lead: exports.lead
};
