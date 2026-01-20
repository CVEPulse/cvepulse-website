/**
 * CVEPulse Firebase Cloud Functions
 * 
 * Features:
 * - Email subscription management
 * - Lead capture
 * - Real-time CISA KEV monitoring
 * - Email alerts (immediate, daily, weekly)
 * - Slack/Teams webhook notifications
 * - Scheduled KEV checking
 * - KEV Data proxy (bypasses CORS)
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
const SITE_URL = 'https://cvepulse.web.app';

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Proxy to fetch CISA KEV data (bypasses CORS)
 * GET /kevdata
 */
exports.kevdata = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Fetching CISA KEV data...');
      const response = await fetch(CISA_KEV_URL);
      if (!response.ok) {
        throw new Error(`CISA API returned ${response.status}`);
      }
      const data = await response.json();
      console.log(`Fetched ${data.vulnerabilities?.length || 0} vulnerabilities`);
      res.status(200).json(data);
    } catch (error) {
      console.error('KEV fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch KEV data' });
    }
  });
});

/**
 * Subscribe to alerts
 * POST /subscribe
 */
exports.subscribe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      const { email, company, frequency, watchlist, integrations } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
      }
      const existing = await db.collection('subscribers').doc(email).get();
      const subscriberData = {
        email,
        company: company || '',
        frequency: frequency || 'daily',
        watchlist: watchlist || [],
        integrations: integrations || {},
        active: true,
        createdAt: existing.exists ? existing.data().createdAt : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAlertSent: null
      };
      await db.collection('subscribers').doc(email).set(subscriberData, { merge: true });
      
      const transporter = getEmailTransport();
      if (transporter) {
        await transporter.sendMail({
          from: `CVEPulse Alerts <${FROM_EMAIL}>`,
          to: email,
          subject: '🔥 Welcome to CVEPulse Alerts',
          html: generateWelcomeEmail(subscriberData)
        });
      }
      
      await db.collection('activity_log').add({
        type: 'subscription',
        email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.status(200).json({ success: true, message: 'Subscribed successfully', frequency: subscriberData.frequency });
    } catch (error) {
      console.error('Subscribe error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * Unsubscribe from alerts
 * POST /unsubscribe
 */
exports.unsubscribe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email required' });
      }
      await db.collection('subscribers').doc(email).update({
        active: false,
        unsubscribedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * Submit lead/contact form
 * POST /lead
 */
exports.lead = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      const { name, email, company, service, message } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: 'Name and email required' });
      }
      const leadData = {
        name, email,
        company: company || '',
        service: service || '',
        message: message || '',
        status: 'new',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const leadRef = await db.collection('leads').add(leadData);
      
      const transporter = getEmailTransport();
      if (transporter) {
        const adminEmail = process.env.ADMIN_EMAIL || FROM_EMAIL;
        await transporter.sendMail({
          from: `CVEPulse <${FROM_EMAIL}>`,
          to: adminEmail,
          subject: `🎯 New Lead: ${company || name}`,
          html: generateLeadNotificationEmail(leadData)
        });
        await transporter.sendMail({
          from: `CVEPulse <${FROM_EMAIL}>`,
          to: email,
          subject: '✅ We received your request - CVEPulse',
          html: generateLeadConfirmationEmail(leadData)
        });
      }
      return res.status(200).json({ success: true, message: 'Request submitted successfully', leadId: leadRef.id });
    } catch (error) {
      console.error('Lead error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * Get current KEV stats
 * GET /stats
 */
exports.stats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const statsDoc = await db.collection('kev_data').doc('latest_stats').get();
      if (statsDoc.exists) {
        return res.status(200).json(statsDoc.data());
      }
      const stats = await fetchAndProcessKEV();
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// ============================================
// SCHEDULED FUNCTIONS
// ============================================

exports.checkKEV = functions.pubsub
  .schedule('every 1 hours')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running scheduled KEV check...');
    try {
      const { newCVEs, stats } = await fetchAndProcessKEV();
      if (newCVEs.length > 0) {
        console.log(`Found ${newCVEs.length} new CVEs, sending immediate alerts...`);
        await sendImmediateAlerts(newCVEs);
      }
      await db.collection('kev_data').doc('latest_stats').set({
        ...stats,
        lastChecked: admin.firestore.FieldValue.serverTimestamp()
      });
      return null;
    } catch (error) {
      console.error('KEV check error:', error);
      return null;
    }
  });

exports.dailyDigest = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Sending daily digest...');
    try {
      const subscribers = await db.collection('subscribers')
        .where('active', '==', true)
        .where('frequency', '==', 'daily')
        .get();
      if (subscribers.empty) return null;
      
      const { kevData, stats } = await fetchAndProcessKEV();
      const last24h = kevData.filter(v => {
        const added = new Date(v.dateAdded);
        return (new Date() - added) / 36e5 <= 24;
      });
      
      const transporter = getEmailTransport();
      if (!transporter) return null;
      
      for (const doc of subscribers.docs) {
        const sub = doc.data();
        try {
          await transporter.sendMail({
            from: `CVEPulse Alerts <${FROM_EMAIL}>`,
            to: sub.email,
            subject: `📊 CVEPulse Daily Digest - ${stats.total} Active KEVs`,
            html: generateDailyDigestEmail(sub, kevData, last24h, stats)
          });
          await doc.ref.update({ lastAlertSent: admin.firestore.FieldValue.serverTimestamp() });
        } catch (e) {
          console.error(`Failed to send to ${sub.email}:`, e);
        }
      }
      return null;
    } catch (error) {
      console.error('Daily digest error:', error);
      return null;
    }
  });

exports.weeklySummary = functions.pubsub
  .schedule('0 9 * * 1')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Sending weekly summary...');
    try {
      const subscribers = await db.collection('subscribers')
        .where('active', '==', true)
        .where('frequency', '==', 'weekly')
        .get();
      if (subscribers.empty) return null;
      
      const { kevData, stats } = await fetchAndProcessKEV();
      const last7d = kevData.filter(v => {
        const added = new Date(v.dateAdded);
        return (new Date() - added) / 864e5 <= 7;
      });
      
      const transporter = getEmailTransport();
      if (!transporter) return null;
      
      for (const doc of subscribers.docs) {
        const sub = doc.data();
        try {
          await transporter.sendMail({
            from: `CVEPulse Alerts <${FROM_EMAIL}>`,
            to: sub.email,
            subject: `📈 CVEPulse Weekly Summary - ${last7d.length} New CVEs`,
            html: generateWeeklySummaryEmail(sub, kevData, last7d, stats)
          });
          await doc.ref.update({ lastAlertSent: admin.firestore.FieldValue.serverTimestamp() });
        } catch (e) {
          console.error(`Failed to send to ${sub.email}:`, e);
        }
      }
      return null;
    } catch (error) {
      console.error('Weekly summary error:', error);
      return null;
    }
  });

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchAndProcessKEV() {
  const response = await fetch(CISA_KEV_URL);
  const data = await response.json();
  const kevData = data.vulnerabilities || [];
  
  const now = new Date();
  let newCVEs = [];
  let overdue = 0, critical = 0, newCount = 0;
  
  const lastKnownDoc = await db.collection('kev_data').doc('known_cves').get();
  const knownCVEs = lastKnownDoc.exists ? lastKnownDoc.data().cves || [] : [];
  
  kevData.forEach(v => {
    const due = new Date(v.dueDate);
    const added = new Date(v.dateAdded);
    const daysLeft = Math.ceil((due - now) / 864e5);
    const hoursAgo = Math.floor((now - added) / 36e5);
    
    if (daysLeft < 0) overdue++;
    if (daysLeft >= 0 && daysLeft <= 7) critical++;
    if (hoursAgo <= 24) newCount++;
    
    if (!knownCVEs.includes(v.cveID)) {
      newCVEs.push({ ...v, _daysLeft: daysLeft, _hoursAgo: hoursAgo });
    }
  });
  
  await db.collection('kev_data').doc('known_cves').set({
    cves: kevData.map(v => v.cveID),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { kevData, newCVEs, stats: { total: kevData.length, overdue, critical, newLast24h: newCount, newDetected: newCVEs.length } };
}

async function sendImmediateAlerts(newCVEs) {
  const subscribers = await db.collection('subscribers')
    .where('active', '==', true)
    .where('frequency', '==', 'immediate')
    .get();
  if (subscribers.empty) return;
  
  const transporter = getEmailTransport();
  if (!transporter) return;
  
  for (const doc of subscribers.docs) {
    const sub = doc.data();
    let relevantCVEs = newCVEs;
    if (sub.watchlist?.length > 0) {
      relevantCVEs = newCVEs.filter(v => 
        sub.watchlist.some(w => v.vendorProject.toLowerCase().includes(w.toLowerCase()))
      );
    }
    if (relevantCVEs.length === 0) continue;
    
    try {
      await transporter.sendMail({
        from: `CVEPulse Alerts <${FROM_EMAIL}>`,
        to: sub.email,
        subject: `🚨 URGENT: ${relevantCVEs.length} New CVE${relevantCVEs.length > 1 ? 's' : ''} Added to CISA KEV`,
        html: generateImmediateAlertEmail(sub, relevantCVEs)
      });
      
      if (sub.integrations?.slack) await sendSlackAlert(sub.integrations.slack, relevantCVEs);
      if (sub.integrations?.teams) await sendTeamsAlert(sub.integrations.teams, relevantCVEs);
      if (sub.integrations?.webhook) await sendWebhookAlert(sub.integrations.webhook, relevantCVEs);
      
      await doc.ref.update({ lastAlertSent: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) {
      console.error(`Failed to alert ${sub.email}:`, e);
    }
  }
}

async function sendSlackAlert(webhookUrl, cves) {
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🚨 CVEPulse Alert: New CISA KEV Vulnerabilities' } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${cves.length} new vulnerabilities* require immediate attention.` } }
  ];
  cves.slice(0, 5).forEach(cve => {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*<https://nvd.nist.gov/vuln/detail/${cve.cveID}|${cve.cveID}>*\n${cve.vendorProject} - ${cve.product}\nDue: ${cve.dueDate}` } });
  });
  blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Dashboard' }, url: SITE_URL + '/dashboard.html' }] });
  await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blocks }) });
}

async function sendTeamsAlert(webhookUrl, cves) {
  const card = {
    '@type': 'MessageCard', '@context': 'http://schema.org/extensions', themeColor: 'FF4444',
    summary: `CVEPulse: ${cves.length} New CISA KEV Vulnerabilities`,
    sections: [{ activityTitle: '🚨 CVEPulse Alert', activitySubtitle: `${cves.length} new vulnerabilities added to CISA KEV`,
      facts: cves.slice(0, 5).map(cve => ({ name: cve.cveID, value: `${cve.vendorProject} - ${cve.product} (Due: ${cve.dueDate})` })) }],
    potentialAction: [{ '@type': 'OpenUri', name: 'View Dashboard', targets: [{ os: 'default', uri: SITE_URL + '/dashboard.html' }] }]
  };
  await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(card) });
}

async function sendWebhookAlert(webhookUrl, cves) {
  await fetch(webhookUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'new_kev_vulnerabilities', timestamp: new Date().toISOString(), count: cves.length,
      vulnerabilities: cves.map(v => ({ cveID: v.cveID, vendor: v.vendorProject, product: v.product, dateAdded: v.dateAdded, dueDate: v.dueDate, description: v.shortDescription })) })
  });
}

// ============================================
// EMAIL TEMPLATES
// ============================================

function generateWelcomeEmail(sub) {
  const frequencyExplain = {
    'immediate': '<strong style="color:#ef4444">⚡ Immediate Alerts</strong> — You\'ll receive an email within 1 hour whenever CISA adds new vulnerabilities to the KEV catalog. These are actively exploited threats requiring urgent attention.',
    'daily': '<strong style="color:#f97316">📊 Daily Digest</strong> — Every morning at 8 AM EST, you\'ll receive a summary of the current threat landscape including any new CVEs from the past 24 hours.',
    'weekly': '<strong style="color:#22c55e">📈 Weekly Summary</strong> — Every Monday at 9 AM EST, you\'ll receive a comprehensive weekly report of vulnerability activity.'
  };
  
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#0891b2,#22d3ee);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}.content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb}.footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px;border-radius:0 0 8px 8px}.button{display:inline-block;background:#0891b2;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin:10px 0}.alert-box{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:15px;margin:15px 0}</style></head><body><div class="container"><div class="header"><h1>🔥 Welcome to CVEPulse Alerts</h1><p>Real-Time Vulnerability Intelligence</p></div><div class="content"><p>Hi${sub.company ? ' ' + sub.company : ''},</p><p>You're now subscribed to <strong>CVEPulse vulnerability alerts</strong>. We monitor CISA's Known Exploited Vulnerabilities (KEV) catalog and will keep you informed about critical security threats.</p><div class="alert-box"><h3 style="margin-top:0;color:#0891b2">📬 Your Alert Settings</h3>${frequencyExplain[sub.frequency] || frequencyExplain['daily']}<p style="margin-top:15px;margin-bottom:0"><strong>Watchlist:</strong> ${sub.watchlist?.length > 0 ? sub.watchlist.join(', ') : 'All vendors (no filter)'}</p></div><h3>What We Monitor:</h3><ul><li>✅ New CISA KEV vulnerabilities (actively exploited)</li><li>✅ EPSS exploitation probability scores</li><li>✅ Remediation deadlines per BOD 22-01</li><li>✅ Threat intelligence from NVD</li></ul><p style="text-align:center"><a href="${SITE_URL}/dashboard.html" class="button">View Live Dashboard</a></p><p style="font-size:12px;color:#6b7280;margin-top:20px">💡 <strong>Tip:</strong> Add alerts@cvepulse.com to your contacts to ensure our alerts don't end up in spam.</p></div><div class="footer"><p>CVEPulse - Real-Time Vulnerability Intelligence</p><p><a href="${SITE_URL}/unsubscribe?email=${sub.email}" style="color:#9ca3af">Unsubscribe</a> | <a href="${SITE_URL}/preferences?email=${sub.email}" style="color:#9ca3af">Update Preferences</a></p></div></div></body></html>`;
}

function generateImmediateAlertEmail(sub, cves) {
  const cveRows = cves.slice(0, 10).map(cve => `<tr><td style="padding:12px;border-bottom:1px solid #e5e7eb"><a href="https://nvd.nist.gov/vuln/detail/${cve.cveID}" style="color:#0891b2;font-weight:bold">${cve.cveID}</a></td><td style="padding:12px;border-bottom:1px solid #e5e7eb">${cve.vendorProject}</td><td style="padding:12px;border-bottom:1px solid #e5e7eb">${cve.product}</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#ef4444;font-weight:bold">${cve.dueDate}</td></tr>`).join('');
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:700px;margin:0 auto}.header{background:linear-gradient(135deg,#dc2626,#f97316);color:white;padding:30px;text-align:center}.content{background:#fff;padding:30px;border:1px solid #e5e7eb}.footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px}.button{display:inline-block;background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:6px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#1f2937;color:#22d3ee;padding:12px;text-align:left}</style></head><body><div class="container"><div class="header"><h1>🚨 URGENT: New CISA KEV Vulnerabilities</h1><p style="font-size:18px;margin-top:10px">${cves.length} new vulnerabilities require immediate action</p></div><div class="content"><p>Hi${sub.company ? ' ' + sub.company : ''},</p><p><strong>CISA has added ${cves.length} new vulnerabilities</strong> to the Known Exploited Vulnerabilities catalog.</p><table><thead><tr><th>CVE ID</th><th>Vendor</th><th>Product</th><th>Due Date</th></tr></thead><tbody>${cveRows}</tbody></table><p style="text-align:center;margin-top:30px"><a href="${SITE_URL}/dashboard.html" class="button">View Full Details</a></p></div><div class="footer"><p>CVEPulse - Real-Time Vulnerability Intelligence</p></div></div></body></html>`;
}

function generateDailyDigestEmail(sub, kevData, last24h, stats) {
  const topPriority = kevData.slice(0, 5);
  const cveItems = topPriority.map(cve => {
    const daysLeft = Math.ceil((new Date(cve.dueDate) - new Date()) / 864e5);
    const isUrgent = daysLeft < 0 || daysLeft <= 3;
    return `<div style="background:#f9fafb;border-left:4px solid ${isUrgent ? '#ef4444' : '#0891b2'};padding:15px;margin:10px 0"><strong><a href="https://nvd.nist.gov/vuln/detail/${cve.cveID}" style="color:#0891b2">${cve.cveID}</a></strong><br>${cve.vendorProject} - ${cve.product}<br><span style="color:${isUrgent ? '#ef4444' : '#6b7280'}">${daysLeft < 0 ? Math.abs(daysLeft) + ' days overdue' : daysLeft + ' days remaining'}</span></div>`;
  }).join('');
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:700px;margin:0 auto}.header{background:linear-gradient(135deg,#0891b2,#22d3ee);color:white;padding:30px;text-align:center}.stats{display:flex;justify-content:space-around;background:#1f2937;color:white;padding:20px}.stat{text-align:center}.stat-value{font-size:32px;font-weight:bold}.content{background:#fff;padding:30px;border:1px solid #e5e7eb}.footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px}.button{display:inline-block;background:#0891b2;color:white;padding:12px 24px;text-decoration:none;border-radius:6px}</style></head><body><div class="container"><div class="header"><h1>📊 CVEPulse Daily Digest</h1><p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div><div class="stats"><div class="stat"><div class="stat-value" style="color:#ef4444">${stats.overdue}</div><div>Overdue</div></div><div class="stat"><div class="stat-value" style="color:#f97316">${stats.critical}</div><div>Due ≤7 Days</div></div><div class="stat"><div class="stat-value" style="color:#22c55e">${last24h.length}</div><div>New Today</div></div><div class="stat"><div class="stat-value">${stats.total}</div><div>Total KEV</div></div></div><div class="content"><p>Hi${sub.company ? ' ' + sub.company : ''},</p><p>Here's your daily vulnerability intelligence summary.</p><h3>🔥 Top Priority Vulnerabilities</h3>${cveItems}<p style="text-align:center;margin-top:30px"><a href="${SITE_URL}/dashboard.html" class="button">View Full Dashboard</a></p></div><div class="footer"><p>CVEPulse - Real-Time Vulnerability Intelligence</p></div></div></body></html>`;
}

function generateWeeklySummaryEmail(sub, kevData, last7d, stats) {
  return generateDailyDigestEmail(sub, kevData, last7d, { ...stats, newLast24h: last7d.length }).replace('Daily Digest', 'Weekly Summary').replace('New Today', 'New This Week');
}

function generateLeadNotificationEmail(lead) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#7c3aed;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0}.content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb}.field{margin:10px 0}.field strong{color:#374151}</style></head><body><div class="container"><div class="header"><h2>🎯 New Lead from CVEPulse</h2></div><div class="content"><div class="field"><strong>Name:</strong> ${lead.name}</div><div class="field"><strong>Email:</strong> ${lead.email}</div><div class="field"><strong>Company:</strong> ${lead.company || 'Not provided'}</div><div class="field"><strong>Service Interest:</strong> ${lead.service || 'Not specified'}</div><div class="field"><strong>Message:</strong><br>${lead.message || 'No message'}</div><div class="field"><strong>Submitted:</strong> ${new Date().toLocaleString()}</div></div></div></body></html>`;
}

function generateLeadConfirmationEmail(lead) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#0891b2,#22d3ee);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}.content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb}.footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px;border-radius:0 0 8px 8px}</style></head><body><div class="container"><div class="header"><h1>✅ Request Received</h1></div><div class="content"><p>Hi ${lead.name},</p><p>Thank you for your interest in CVEPulse services. We've received your consultation request and will be in touch within 24-48 hours.</p><p><strong>What you requested:</strong> ${lead.service || 'General consultation'}</p><p>In the meantime, feel free to explore our live vulnerability dashboard at <a href="${SITE_URL}/dashboard.html">cvepulse.com/dashboard</a></p><p>Best regards,<br>The CVEPulse Team</p></div><div class="footer"><p>CVEPulse - Real-Time Vulnerability Intelligence</p></div></div></body></html>`;
}

module.exports = {
  kevdata: exports.kevdata,
  subscribe: exports.subscribe,
  unsubscribe: exports.unsubscribe,
  lead: exports.lead,
  stats: exports.stats,
  checkKEV: exports.checkKEV,
  dailyDigest: exports.dailyDigest,
  weeklySummary: exports.weeklySummary
};
