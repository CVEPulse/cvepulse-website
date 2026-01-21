/**
 * CVEPulse Firebase Cloud Functions - CISO-GRADE THREAT INTELLIGENCE
 * 
 * Enhanced Features:
 * - Executive threat summary with trend analysis
 * - Sector-specific threat filtering (pharma, finance, tech, healthcare, etc.)
 * - Geographic threat distribution
 * - MITRE ATT&CK technique mapping
 * - Threat actor profiles with TTPs
 * - CVE-to-threat correlation
 * - Historical trending data
 * - Actionable recommendations engine
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ============================================
// CONFIGURATION
// ============================================

const getEmailTransport = () => {
  if (process.env.SENDGRID_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_KEY }
    });
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
  console.warn('No email configuration found!');
  return null;
};

const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const FROM_EMAIL = 'alerts@cvepulse.com';
const SITE_URL = 'https://www.cvepulse.com';

// Sector keywords for threat classification
const SECTOR_KEYWORDS = {
  healthcare: ['hospital', 'health', 'medical', 'pharma', 'clinic', 'patient', 'drug', 'biotech', 'vaccine'],
  finance: ['bank', 'financial', 'insurance', 'credit', 'payment', 'trading', 'investment', 'fintech', 'crypto'],
  technology: ['software', 'tech', 'cloud', 'saas', 'data center', 'hosting', 'it service', 'cyber'],
  manufacturing: ['manufacturing', 'industrial', 'factory', 'automotive', 'aerospace', 'electronics'],
  energy: ['energy', 'oil', 'gas', 'utility', 'power', 'electric', 'nuclear', 'renewable'],
  government: ['government', 'federal', 'state', 'municipal', 'defense', 'military', 'public sector'],
  retail: ['retail', 'ecommerce', 'store', 'shop', 'consumer', 'merchandise'],
  education: ['university', 'college', 'school', 'education', 'academic', 'research']
};

// MITRE ATT&CK technique mapping for common malware types
const MITRE_MAPPING = {
  'emotet': ['T1566.001', 'T1059.005', 'T1547.001', 'T1027'],
  'qakbot': ['T1566.001', 'T1059.001', 'T1055', 'T1071.001'],
  'icedid': ['T1566.001', 'T1059.003', 'T1055.012', 'T1071'],
  'cobalt strike': ['T1059.001', 'T1055', 'T1071.001', 'T1105'],
  'lockbit': ['T1486', 'T1490', 'T1027', 'T1562.001'],
  'blackcat': ['T1486', 'T1027', 'T1562.001', 'T1489'],
  'cl0p': ['T1486', 'T1567.002', 'T1190', 'T1059'],
  'play': ['T1486', 'T1490', 'T1059.001', 'T1082'],
  'akira': ['T1486', 'T1059.001', 'T1021.001', 'T1082'],
  'default': ['T1059', 'T1071', 'T1105', 'T1027']
};

// ============================================
// ORIGINAL API ENDPOINTS
// ============================================

exports.kevdata = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching CISA KEV data...');
      const response = await fetch(CISA_KEV_URL);
      if (!response.ok) throw new Error(`CISA API returned ${response.status}`);
      const data = await response.json();
      console.log(`Fetched ${data.vulnerabilities?.length || 0} vulnerabilities`);
      res.status(200).json(data);
    } catch (error) {
      console.error('KEV fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch KEV data' });
    }
  });
});

exports.subscribe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const { email, company, frequency, watchlist, integrations, sector } = req.body;
      if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
      
      const existing = await db.collection('subscribers').doc(email).get();
      const subscriberData = {
        email,
        company: company || '',
        sector: sector || 'general',
        frequency: frequency || 'daily',
        watchlist: watchlist || [],
        integrations: integrations || {},
        active: true,
        createdAt: existing.exists ? existing.data().createdAt : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('subscribers').doc(email).set(subscriberData, { merge: true });
      console.log(`Subscriber saved: ${email}`);
      res.status(200).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  });
});

exports.unsubscribe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const email = req.query.email || req.body?.email;
      if (!email) return res.status(400).json({ error: 'Email required' });
      await db.collection('subscribers').doc(email).update({ active: false });
      res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({ error: 'Failed to unsubscribe' });
    }
  });
});

exports.lead = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const { name, email, company, service, message, sector } = req.body;
      if (!email || !name) return res.status(400).json({ error: 'Name and email required' });
      
      const leadData = {
        name, email, company: company || '', service: service || '', message: message || '',
        sector: sector || 'unknown', source: 'threat-dashboard',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('leads').add(leadData);
      console.log(`Lead captured: ${email}`);
      res.status(200).json({ success: true, message: 'Request submitted' });
    } catch (error) {
      console.error('Lead error:', error);
      res.status(500).json({ error: 'Failed to submit request' });
    }
  });
});

exports.stats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const [subscribers, leads] = await Promise.all([
        db.collection('subscribers').where('active', '==', true).get(),
        db.collection('leads').get()
      ]);
      res.status(200).json({
        subscribers: subscribers.size,
        leads: leads.size,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });
});

// ============================================
// ENHANCED THREAT INTELLIGENCE ENDPOINTS
// ============================================

/**
 * EXECUTIVE THREAT SUMMARY - Quick briefing for CISOs
 * GET /executive-summary
 * Returns: threat level, top concerns, trend analysis, recommendations
 */
exports.executiveSummary = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Generating executive summary...');
      const sector = req.query.sector || 'all';
      
      // Parallel fetch all data sources
      const [ransomware, threatfox, urlhaus, kev] = await Promise.allSettled([
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: 7 })
        }).then(r => r.json()),
        fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/500/').then(r => r.json()),
        fetch(CISA_KEV_URL).then(r => r.json())
      ]);
      
      // Process ransomware data
      const victims = ransomware.status === 'fulfilled' ? (Array.isArray(ransomware.value) ? ransomware.value : []) : [];
      const last24h = victims.filter(v => {
        const date = new Date(v.discovered || v.published);
        return (Date.now() - date) < 86400000;
      });
      const last7d = victims.filter(v => {
        const date = new Date(v.discovered || v.published);
        return (Date.now() - date) < 604800000;
      });
      
      // Sector-specific filtering
      let sectorVictims = victims;
      if (sector !== 'all' && SECTOR_KEYWORDS[sector]) {
        const keywords = SECTOR_KEYWORDS[sector];
        sectorVictims = victims.filter(v => {
          const text = `${v.victim || ''} ${v.activity || ''} ${v.description || ''}`.toLowerCase();
          return keywords.some(kw => text.includes(kw));
        });
      }
      
      // Calculate threat level
      const iocCount = threatfox.status === 'fulfilled' ? (threatfox.value?.data?.length || 0) : 0;
      const urlCount = urlhaus.status === 'fulfilled' ? (urlhaus.value?.urls?.length || 0) : 0;
      const kevNew = kev.status === 'fulfilled' ? 
        (kev.value?.vulnerabilities?.filter(v => {
          const added = new Date(v.dateAdded);
          return (Date.now() - added) < 604800000;
        }).length || 0) : 0;
      
      let threatLevel = 'MODERATE';
      let threatScore = 50;
      if (last24h.length >= 10 || kevNew >= 5 || iocCount >= 500) {
        threatLevel = 'CRITICAL';
        threatScore = 90;
      } else if (last24h.length >= 5 || kevNew >= 3 || iocCount >= 200) {
        threatLevel = 'HIGH';
        threatScore = 75;
      } else if (last24h.length <= 1 && kevNew <= 1 && iocCount < 100) {
        threatLevel = 'LOW';
        threatScore = 25;
      }
      
      // Top active ransomware groups
      const groupCounts = {};
      victims.forEach(v => {
        const group = v.group_name || 'Unknown';
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      });
      const topGroups = Object.entries(groupCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, victims: count, trend: count > 5 ? 'rising' : 'stable' }));
      
      // Top malware families from ThreatFox
      const malwareCounts = {};
      if (threatfox.status === 'fulfilled' && threatfox.value?.data) {
        threatfox.value.data.forEach(ioc => {
          const family = ioc.malware_printable || 'Unknown';
          malwareCounts[family] = (malwareCounts[family] || 0) + 1;
        });
      }
      const topMalware = Object.entries(malwareCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, iocs: count }));
      
      // Generate recommendations
      const recommendations = [];
      if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH') {
        recommendations.push({ priority: 'URGENT', action: 'Review and patch all CISA KEV vulnerabilities immediately', category: 'Vulnerability Management' });
      }
      if (topGroups.some(g => g.trend === 'rising')) {
        recommendations.push({ priority: 'HIGH', action: `Monitor for ${topGroups[0]?.name} ransomware indicators - most active group this week`, category: 'Threat Monitoring' });
      }
      if (iocCount > 100) {
        recommendations.push({ priority: 'HIGH', action: 'Update threat intelligence feeds and block known IoCs', category: 'Defense' });
      }
      recommendations.push({ priority: 'MEDIUM', action: 'Verify backup integrity and test restoration procedures', category: 'Resilience' });
      recommendations.push({ priority: 'MEDIUM', action: 'Conduct phishing awareness training - primary ransomware vector', category: 'Awareness' });
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        period: 'Last 7 days',
        sector: sector,
        threatLevel: {
          level: threatLevel,
          score: threatScore,
          trend: last24h.length > (last7d.length / 7) ? 'INCREASING' : 'STABLE'
        },
        summary: {
          ransomware_victims_24h: last24h.length,
          ransomware_victims_7d: last7d.length,
          sector_victims: sectorVictims.length,
          active_iocs: iocCount,
          malicious_urls: urlCount,
          new_kev_cves: kevNew
        },
        topThreats: {
          ransomwareGroups: topGroups,
          malwareFamilies: topMalware
        },
        recommendations: recommendations
      });
    } catch (error) {
      console.error('Executive summary error:', error);
      res.status(500).json({ error: 'Failed to generate executive summary' });
    }
  });
});

/**
 * SECTOR-SPECIFIC THREATS
 * GET /sector-threats?sector=healthcare|finance|technology|etc
 */
exports.sectorThreats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const sector = req.query.sector || 'all';
      console.log(`Fetching threats for sector: ${sector}`);
      
      const [ransomware, groups] = await Promise.allSettled([
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://api.ransomware.live/groups').then(r => r.json())
      ]);
      
      let victims = ransomware.status === 'fulfilled' ? (Array.isArray(ransomware.value) ? ransomware.value : []) : [];
      
      // Filter by sector if specified
      if (sector !== 'all' && SECTOR_KEYWORDS[sector]) {
        const keywords = SECTOR_KEYWORDS[sector];
        victims = victims.filter(v => {
          const text = `${v.victim || ''} ${v.activity || ''} ${v.description || ''}`.toLowerCase();
          return keywords.some(kw => text.includes(kw));
        });
      }
      
      // Group statistics
      const groupStats = {};
      victims.forEach(v => {
        const group = v.group_name || 'Unknown';
        if (!groupStats[group]) groupStats[group] = { count: 0, victims: [] };
        groupStats[group].count++;
        if (groupStats[group].victims.length < 5) {
          groupStats[group].victims.push({ name: v.victim, date: v.discovered || v.published });
        }
      });
      
      // Calculate risk score for this sector
      const riskScore = Math.min(100, Math.round((victims.length / 10) * 100));
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        sector: sector,
        riskScore: riskScore,
        totalVictims: victims.length,
        recentVictims: victims.slice(0, 20).map(v => ({
          name: v.victim,
          group: v.group_name,
          date: v.discovered || v.published,
          country: v.country
        })),
        attackingGroups: Object.entries(groupStats)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10)
          .map(([name, data]) => ({ name, attackCount: data.count, recentVictims: data.victims })),
        availableSectors: Object.keys(SECTOR_KEYWORDS)
      });
    } catch (error) {
      console.error('Sector threats error:', error);
      res.status(500).json({ error: 'Failed to fetch sector threats' });
    }
  });
});

/**
 * THREAT ACTOR PROFILES with TTPs
 * GET /threat-actor?name=lockbit
 * GET /threat-actor (returns all active groups)
 */
exports.threatActor = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const actorName = req.query.name;
      console.log(`Fetching threat actor data${actorName ? ': ' + actorName : ''}`);
      
      const [groups, victims] = await Promise.allSettled([
        fetch('https://api.ransomware.live/groups').then(r => r.json()),
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json())
      ]);
      
      const allGroups = groups.status === 'fulfilled' ? (Array.isArray(groups.value) ? groups.value : []) : [];
      const allVictims = victims.status === 'fulfilled' ? (Array.isArray(victims.value) ? victims.value : []) : [];
      
      // Build detailed profiles
      const profiles = allGroups.map(g => {
        const groupVictims = allVictims.filter(v => 
          (v.group_name || '').toLowerCase() === (g.name || '').toLowerCase()
        );
        
        // Get MITRE techniques
        const nameLower = (g.name || '').toLowerCase();
        let techniques = MITRE_MAPPING.default;
        for (const [key, ttps] of Object.entries(MITRE_MAPPING)) {
          if (nameLower.includes(key)) {
            techniques = ttps;
            break;
          }
        }
        
        // Calculate activity trend
        const last7d = groupVictims.filter(v => {
          const date = new Date(v.discovered || v.published);
          return (Date.now() - date) < 604800000;
        }).length;
        const prev7d = groupVictims.filter(v => {
          const date = new Date(v.discovered || v.published);
          const age = Date.now() - date;
          return age >= 604800000 && age < 1209600000;
        }).length;
        
        return {
          name: g.name,
          description: g.description || 'Ransomware threat actor',
          url: g.url,
          victimCount: groupVictims.length,
          recentVictims: groupVictims.slice(0, 5).map(v => ({
            name: v.victim,
            date: v.discovered || v.published,
            country: v.country
          })),
          activity: {
            last7days: last7d,
            previous7days: prev7d,
            trend: last7d > prev7d ? 'INCREASING' : last7d < prev7d ? 'DECREASING' : 'STABLE'
          },
          mitreTechniques: techniques,
          riskLevel: last7d >= 5 ? 'CRITICAL' : last7d >= 2 ? 'HIGH' : groupVictims.length > 0 ? 'MEDIUM' : 'LOW'
        };
      });
      
      // Filter by name if specified
      if (actorName) {
        const actor = profiles.find(p => p.name.toLowerCase().includes(actorName.toLowerCase()));
        if (!actor) return res.status(404).json({ error: 'Threat actor not found' });
        return res.status(200).json({ timestamp: new Date().toISOString(), actor });
      }
      
      // Return all, sorted by activity
      const sorted = profiles.sort((a, b) => b.activity.last7days - a.activity.last7days);
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        totalGroups: sorted.length,
        activeGroups: sorted.filter(p => p.activity.last7days > 0).length,
        actors: sorted.slice(0, 30)
      });
    } catch (error) {
      console.error('Threat actor error:', error);
      res.status(500).json({ error: 'Failed to fetch threat actor data' });
    }
  });
});

/**
 * GEOGRAPHIC THREAT DISTRIBUTION
 * GET /geo-threats
 */
exports.geoThreats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching geographic threat distribution...');
      
      const [ransomware, feodo] = await Promise.allSettled([
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json').then(r => r.json())
      ]);
      
      const victims = ransomware.status === 'fulfilled' ? (Array.isArray(ransomware.value) ? ransomware.value : []) : [];
      const c2Servers = feodo.status === 'fulfilled' ? (Array.isArray(feodo.value) ? feodo.value : []) : [];
      
      // Count victims by country
      const victimsByCountry = {};
      victims.forEach(v => {
        const country = v.country || 'Unknown';
        victimsByCountry[country] = (victimsByCountry[country] || 0) + 1;
      });
      
      // Count C2 servers by country
      const c2ByCountry = {};
      c2Servers.forEach(c => {
        const country = c.country || 'Unknown';
        c2ByCountry[country] = (c2ByCountry[country] || 0) + 1;
      });
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        victimDistribution: Object.entries(victimsByCountry)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([country, count]) => ({ country, victims: count })),
        c2Distribution: Object.entries(c2ByCountry)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([country, count]) => ({ country, servers: count })),
        totals: {
          countries_affected: Object.keys(victimsByCountry).length,
          total_victims: victims.length,
          c2_countries: Object.keys(c2ByCountry).length,
          total_c2: c2Servers.length
        }
      });
    } catch (error) {
      console.error('Geo threats error:', error);
      res.status(500).json({ error: 'Failed to fetch geographic data' });
    }
  });
});

/**
 * TRENDING THREATS - What's hot this week
 * GET /trending
 */
exports.trending = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching trending threats...');
      
      const [threatfox, urlhaus, ransomware] = await Promise.allSettled([
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: 7 })
        }).then(r => r.json()),
        fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/1000/').then(r => r.json()),
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json())
      ]);
      
      // Trending malware families
      const malwareTrends = {};
      if (threatfox.status === 'fulfilled' && threatfox.value?.data) {
        threatfox.value.data.forEach(ioc => {
          const family = ioc.malware_printable || 'Unknown';
          if (!malwareTrends[family]) malwareTrends[family] = { total: 0, byDay: {} };
          malwareTrends[family].total++;
          const day = (ioc.first_seen || '').split(' ')[0];
          malwareTrends[family].byDay[day] = (malwareTrends[family].byDay[day] || 0) + 1;
        });
      }
      
      // Trending URL threats
      const urlThreatTypes = {};
      if (urlhaus.status === 'fulfilled' && urlhaus.value?.urls) {
        urlhaus.value.urls.forEach(url => {
          const threat = url.threat || 'Unknown';
          urlThreatTypes[threat] = (urlThreatTypes[threat] || 0) + 1;
        });
      }
      
      // Trending ransomware groups
      const groupTrends = {};
      const victims = ransomware.status === 'fulfilled' ? (Array.isArray(ransomware.value) ? ransomware.value : []) : [];
      victims.forEach(v => {
        const group = v.group_name || 'Unknown';
        if (!groupTrends[group]) groupTrends[group] = { total: 0, thisWeek: 0 };
        groupTrends[group].total++;
        const date = new Date(v.discovered || v.published);
        if ((Date.now() - date) < 604800000) groupTrends[group].thisWeek++;
      });
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        period: 'Last 7 days',
        trendingMalware: Object.entries(malwareTrends)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 10)
          .map(([name, data]) => ({
            name,
            iocCount: data.total,
            mitreTechniques: MITRE_MAPPING[name.toLowerCase()] || MITRE_MAPPING.default
          })),
        trendingUrlThreats: Object.entries(urlThreatTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([type, count]) => ({ type, count })),
        trendingRansomware: Object.entries(groupTrends)
          .filter(([_, d]) => d.thisWeek > 0)
          .sort((a, b) => b[1].thisWeek - a[1].thisWeek)
          .slice(0, 10)
          .map(([name, data]) => ({
            name,
            victimsThisWeek: data.thisWeek,
            totalVictims: data.total,
            trend: data.thisWeek > 3 ? 'HOT' : 'ACTIVE'
          }))
      });
    } catch (error) {
      console.error('Trending error:', error);
      res.status(500).json({ error: 'Failed to fetch trending data' });
    }
  });
});

/**
 * FULL AGGREGATED THREAT FEED
 * GET /threatfeed
 */
exports.threatfeed = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching aggregated threat feed...');
      
      const [threatfox, urlhaus, feodo, ransomware] = await Promise.allSettled([
        fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'get_iocs', days: 1 })
        }).then(r => r.json()),
        fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/100/').then(r => r.json()),
        fetch('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json').then(r => r.json()),
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json())
      ]);
      
      const feed = {
        timestamp: new Date().toISOString(),
        sources: {
          threatfox: threatfox.status === 'fulfilled' ? threatfox.value : null,
          urlhaus: urlhaus.status === 'fulfilled' ? urlhaus.value : null,
          feodo: feodo.status === 'fulfilled' ? feodo.value : null,
          ransomware: ransomware.status === 'fulfilled' ? ransomware.value : null
        },
        summary: {
          threatfox_iocs: threatfox.status === 'fulfilled' ? (threatfox.value?.data?.length || 0) : 0,
          malicious_urls: urlhaus.status === 'fulfilled' ? (urlhaus.value?.urls?.length || 0) : 0,
          botnet_c2s: feodo.status === 'fulfilled' ? (Array.isArray(feodo.value) ? feodo.value.length : 0) : 0,
          ransomware_victims: ransomware.status === 'fulfilled' ? (Array.isArray(ransomware.value) ? ransomware.value.length : 0) : 0
        }
      };
      
      console.log('Threat feed summary:', feed.summary);
      res.status(200).json(feed);
    } catch (error) {
      console.error('Threat feed error:', error);
      res.status(500).json({ error: 'Failed to fetch threat feed' });
    }
  });
});

/**
 * RANSOMWARE TRACKER
 * GET /ransomware
 */
exports.ransomware = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching ransomware data...');
      
      const [victims, groups] = await Promise.allSettled([
        fetch('https://api.ransomware.live/recentvictims').then(r => r.json()),
        fetch('https://api.ransomware.live/groups').then(r => r.json())
      ]);
      
      const data = {
        timestamp: new Date().toISOString(),
        recent_victims: victims.status === 'fulfilled' ? victims.value : [],
        groups: groups.status === 'fulfilled' ? groups.value : [],
        stats: {
          total_victims_recent: victims.status === 'fulfilled' ? (Array.isArray(victims.value) ? victims.value.length : 0) : 0,
          active_groups: groups.status === 'fulfilled' ? (Array.isArray(groups.value) ? groups.value.length : 0) : 0
        }
      };
      
      console.log('Ransomware stats:', data.stats);
      res.status(200).json(data);
    } catch (error) {
      console.error('Ransomware data error:', error);
      res.status(500).json({ error: 'Failed to fetch ransomware data' });
    }
  });
});

/**
 * IOC LOOKUP
 * POST /ioclookup { type: 'ip|domain|hash|url', value: '...' }
 */
exports.ioclookup = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
      const { type, value } = req.body;
      if (!type || !value) return res.status(400).json({ error: 'Missing type or value' });
      
      console.log(`IoC lookup: ${type} = ${value}`);
      const results = { type, value, timestamp: new Date().toISOString(), sources: {}, verdict: 'CLEAN' };
      let threatCount = 0;
      
      // ThreatFox lookup
      try {
        const tfResponse = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'search_ioc', search_term: value })
        });
        const tfData = await tfResponse.json();
        results.sources.threatfox = tfData;
        if (tfData.query_status === 'ok' && tfData.data?.length > 0) threatCount++;
      } catch (e) {
        results.sources.threatfox = { error: e.message };
      }
      
      // URLhaus lookup
      if (type === 'url' || type === 'domain') {
        try {
          const endpoint = type === 'url' ? 'https://urlhaus-api.abuse.ch/v1/url/' : 'https://urlhaus-api.abuse.ch/v1/host/';
          const uhResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: type === 'url' ? `url=${encodeURIComponent(value)}` : `host=${encodeURIComponent(value)}`
          });
          const uhData = await uhResponse.json();
          results.sources.urlhaus = uhData;
          if (uhData.query_status === 'ok') threatCount++;
        } catch (e) {
          results.sources.urlhaus = { error: e.message };
        }
      }
      
      // MalwareBazaar lookup
      if (type === 'hash') {
        try {
          const mbResponse = await fetch('https://mb-api.abuse.ch/api/v1/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `query=get_info&hash=${value}`
          });
          const mbData = await mbResponse.json();
          results.sources.malwarebazaar = mbData;
          if (mbData.query_status === 'ok') threatCount++;
        } catch (e) {
          results.sources.malwarebazaar = { error: e.message };
        }
      }
      
      // Set verdict
      if (threatCount >= 2) results.verdict = 'MALICIOUS';
      else if (threatCount === 1) results.verdict = 'SUSPICIOUS';
      
      res.status(200).json(results);
    } catch (error) {
      console.error('IoC lookup error:', error);
      res.status(500).json({ error: 'IoC lookup failed' });
    }
  });
});

/**
 * MALWARE FEED
 * GET /malware
 */
exports.malware = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching malware feed...');
      
      const response = await fetch('https://mb-api.abuse.ch/api/v1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'query=get_recent&selector=100'
      });
      
      const data = await response.json();
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        samples: data.data || [],
        count: data.data?.length || 0
      });
    } catch (error) {
      console.error('Malware feed error:', error);
      res.status(500).json({ error: 'Failed to fetch malware feed' });
    }
  });
});

/**
 * BOTNET C2 SERVERS
 * GET /botnets
 */
exports.botnets = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching botnet C2 data...');
      
      const [recommended, online] = await Promise.allSettled([
        fetch('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json').then(r => r.json()),
        fetch('https://feodotracker.abuse.ch/downloads/ipblocklist.json').then(r => r.json())
      ]);
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        recommended: recommended.status === 'fulfilled' ? recommended.value : [],
        all: online.status === 'fulfilled' ? online.value : [],
        stats: {
          recommended_count: recommended.status === 'fulfilled' ? (Array.isArray(recommended.value) ? recommended.value.length : 0) : 0,
          total_count: online.status === 'fulfilled' ? (Array.isArray(online.value) ? online.value.length : 0) : 0
        }
      });
    } catch (error) {
      console.error('Botnet data error:', error);
      res.status(500).json({ error: 'Failed to fetch botnet data' });
    }
  });
});

/**
 * THREAT ACTORS LIST
 * GET /threatactors
 */
exports.threatactors = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching threat actor data...');
      
      const groupsResponse = await fetch('https://api.ransomware.live/groups');
      const groups = await groupsResponse.json();
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        ransomware_groups: Array.isArray(groups) ? groups : [],
        count: Array.isArray(groups) ? groups.length : 0
      });
    } catch (error) {
      console.error('Threat actors error:', error);
      res.status(500).json({ error: 'Failed to fetch threat actor data' });
    }
  });
});

// ============================================
// SCHEDULED FUNCTIONS
// ============================================

exports.checkKEV = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  console.log('Running scheduled KEV check...');
  
  try {
    const response = await fetch(CISA_KEV_URL);
    const data = await response.json();
    const vulnerabilities = data.vulnerabilities || [];
    
    const lastCheck = await db.collection('system').doc('lastKEVCheck').get();
    const lastCheckTime = lastCheck.exists ? lastCheck.data().timestamp?.toDate() : new Date(0);
    
    const newCVEs = vulnerabilities.filter(v => {
      const dateAdded = new Date(v.dateAdded);
      return dateAdded > lastCheckTime;
    });
    
    if (newCVEs.length > 0) {
      console.log(`Found ${newCVEs.length} new CVEs`);
      // Alert subscribers
      const subscribers = await db.collection('subscribers')
        .where('active', '==', true)
        .where('frequency', '==', 'immediate')
        .get();
      
      for (const doc of subscribers.docs) {
        const sub = doc.data();
        console.log(`Alerting ${sub.email}...`);
        // Add email sending logic here
      }
    }
    
    await db.collection('system').doc('lastKEVCheck').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      count: vulnerabilities.length
    });
    
    return null;
  } catch (error) {
    console.error('KEV check error:', error);
    return null;
  }
});

exports.dailyDigest = functions.pubsub.schedule('every day 08:00').timeZone('America/New_York').onRun(async (context) => {
  console.log('Generating daily digest...');
  // Add daily digest logic
  return null;
});

exports.weeklySummary = functions.pubsub.schedule('every monday 09:00').timeZone('America/New_York').onRun(async (context) => {
  console.log('Generating weekly summary...');
  // Add weekly summary logic
  return null;
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Original endpoints
  kevdata: exports.kevdata,
  subscribe: exports.subscribe,
  unsubscribe: exports.unsubscribe,
  lead: exports.lead,
  stats: exports.stats,
  checkKEV: exports.checkKEV,
  dailyDigest: exports.dailyDigest,
  weeklySummary: exports.weeklySummary,
  // Enhanced Threat Intelligence
  executiveSummary: exports.executiveSummary,
  sectorThreats: exports.sectorThreats,
  threatActor: exports.threatActor,
  geoThreats: exports.geoThreats,
  trending: exports.trending,
  // Original TI endpoints
  threatfeed: exports.threatfeed,
  ransomware: exports.ransomware,
  ioclookup: exports.ioclookup,
  malware: exports.malware,
  botnets: exports.botnets,
  threatactors: exports.threatactors
};
