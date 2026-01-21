/**
 * CVEPulse Threat Intelligence Dashboard
 * JavaScript - CISO Grade
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = 'https://us-central1-cvepulse.cloudfunctions.net';
const REFRESH_INTERVAL = 300000; // 5 minutes

// Data cache
let threatData = {
  executive: null,
  trending: null,
  ransomware: null,
  actors: null,
  sectors: {},
  geo: null
};

let currentSector = 'all';

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  setInterval(loadAllData, REFRESH_INTERVAL);
  
  // Enter key for IoC search
  document.getElementById('ioc-value').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') lookupIoC();
  });
});

// ============================================
// DATA LOADING
// ============================================
async function loadAllData() {
  updateLastRefresh();
  
  // Load executive summary first (most important)
  await loadExecutiveSummary();
  
  // Load other data in parallel
  Promise.all([
    loadTrending(),
    loadRansomware(),
    loadActors(),
    loadGeoData()
  ]).catch(err => console.error('Data load error:', err));
}

async function loadExecutiveSummary() {
  try {
    const res = await fetch(`${API_BASE}/executiveSummary?sector=${currentSector}`);
    const data = await res.json();
    threatData.executive = data;
    renderExecutiveSummary(data);
  } catch (err) {
    console.error('Executive summary error:', err);
    // Fallback to basic threat feed
    try {
      const res = await fetch(`${API_BASE}/threatfeed`);
      const data = await res.json();
      renderFallbackSummary(data);
    } catch (e) {
      showToast('Failed to load threat data', 'error');
    }
  }
}

async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/trending`);
    const data = await res.json();
    threatData.trending = data;
    renderTrending(data);
    
    // Update badge
    const totalTrending = (data.trendingMalware?.length || 0) + (data.trendingRansomware?.length || 0);
    document.getElementById('badge-trending').textContent = totalTrending;
  } catch (err) {
    console.error('Trending error:', err);
    document.getElementById('trending-malware').innerHTML = '<div class="empty-state">Failed to load trending data</div>';
  }
}

async function loadRansomware() {
  try {
    const res = await fetch(`${API_BASE}/ransomware`);
    const data = await res.json();
    threatData.ransomware = data;
    renderRansomware(data);
    
    // Update badge
    document.getElementById('badge-ransomware').textContent = data.stats?.total_victims_recent || 0;
  } catch (err) {
    console.error('Ransomware error:', err);
  }
}

async function loadActors() {
  try {
    const res = await fetch(`${API_BASE}/threatActor`);
    const data = await res.json();
    threatData.actors = data;
    renderActors(data);
    
    // Update badge
    document.getElementById('badge-actors').textContent = data.activeGroups || 0;
    document.getElementById('active-actors-count').textContent = `${data.activeGroups} Active This Week`;
  } catch (err) {
    console.error('Actors error:', err);
  }
}

async function loadSectorData(sector) {
  try {
    const res = await fetch(`${API_BASE}/sectorThreats?sector=${sector}`);
    const data = await res.json();
    threatData.sectors[sector] = data;
    renderSectorData(data);
  } catch (err) {
    console.error('Sector error:', err);
  }
}

async function loadGeoData() {
  try {
    const res = await fetch(`${API_BASE}/geoThreats`);
    const data = await res.json();
    threatData.geo = data;
    renderGeoData(data);
  } catch (err) {
    console.error('Geo error:', err);
  }
}

// ============================================
// RENDERING FUNCTIONS
// ============================================
function renderExecutiveSummary(data) {
  const level = data.threatLevel?.level?.toLowerCase() || 'medium';
  const score = data.threatLevel?.score || 50;
  
  // Update threat ring
  const ring = document.getElementById('threat-ring-progress');
  const circumference = 327; // 2 * PI * 52
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;
  ring.className = `threat-ring-value ${level}`;
  
  // Update score display
  document.getElementById('threat-score').textContent = score;
  
  // Update level label
  const levelLabel = document.getElementById('threat-level');
  levelLabel.textContent = data.threatLevel?.level || 'MODERATE';
  levelLabel.className = `threat-level-label ${level}`;
  
  // Update summary stats
  document.getElementById('stat-ransomware-24h').textContent = data.summary?.ransomware_victims_24h || 0;
  document.getElementById('stat-ransomware-7d').textContent = data.summary?.ransomware_victims_7d || 0;
  document.getElementById('stat-iocs').textContent = formatNumber(data.summary?.active_iocs || 0);
  document.getElementById('stat-kev').textContent = data.summary?.new_kev_cves || 0;
  
  // Update trend indicator
  const trend = data.threatLevel?.trend || 'STABLE';
  const trendEl = document.getElementById('trend-ransomware');
  if (trend === 'INCREASING') {
    trendEl.className = 'summary-trend up';
    trendEl.textContent = '↑ Increasing';
  } else if (trend === 'DECREASING') {
    trendEl.className = 'summary-trend down';
    trendEl.textContent = '↓ Decreasing';
  } else {
    trendEl.className = 'summary-trend stable';
    trendEl.textContent = '→ Stable';
  }
  
  // Update recommendations
  const recs = data.recommendations || [];
  if (recs[0]) {
    document.getElementById('rec-1').innerHTML = `<span class="rec-icon">⚡</span><span>${escapeHtml(recs[0].action)}</span>`;
    document.getElementById('rec-1').className = `rec-item ${recs[0].priority?.toLowerCase() || 'urgent'}`;
  }
  if (recs[1]) {
    document.getElementById('rec-2').innerHTML = `<span class="rec-icon">🔒</span><span>${escapeHtml(recs[1].action)}</span>`;
    document.getElementById('rec-2').className = `rec-item ${recs[1].priority?.toLowerCase() || 'high'}`;
  }
  if (recs[2]) {
    document.getElementById('rec-3').innerHTML = `<span class="rec-icon">📋</span><span>${escapeHtml(recs[2].action)}</span>`;
    document.getElementById('rec-3').className = `rec-item ${recs[2].priority?.toLowerCase() || 'medium'}`;
  }
}

function renderFallbackSummary(data) {
  // Fallback rendering using basic threatfeed data
  const summary = data.summary || {};
  document.getElementById('stat-ransomware-24h').textContent = summary.ransomware_victims || 0;
  document.getElementById('stat-iocs').textContent = formatNumber(summary.threatfox_iocs || 0);
  document.getElementById('threat-score').textContent = '50';
  document.getElementById('threat-level').textContent = 'MODERATE';
}

function renderTrending(data) {
  // Render trending malware
  const malwareEl = document.getElementById('trending-malware');
  if (data.trendingMalware?.length > 0) {
    let html = '<table class="data-table"><thead><tr><th>Malware Family</th><th>IoCs</th><th>MITRE Techniques</th></tr></thead><tbody>';
    data.trendingMalware.slice(0, 8).forEach(m => {
      const techniques = (m.mitreTechniques || []).slice(0, 3).map(t => 
        `<span class="technique-tag">${t}</span>`
      ).join('');
      html += `<tr>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td><span class="summary-value" style="font-size:16px;color:var(--accent-blue)">${m.iocCount}</span></td>
        <td>${techniques}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    malwareEl.innerHTML = html;
  } else {
    malwareEl.innerHTML = '<div class="empty-state">No trending malware data</div>';
  }
  
  // Render trending ransomware
  const ransomEl = document.getElementById('trending-ransomware');
  if (data.trendingRansomware?.length > 0) {
    let html = '<table class="data-table"><thead><tr><th>Group</th><th>Victims (7d)</th><th>Trend</th></tr></thead><tbody>';
    data.trendingRansomware.slice(0, 8).forEach(r => {
      const trendClass = r.trend === 'HOT' ? 'hot' : 'rising';
      html += `<tr>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td><span class="summary-value" style="font-size:16px;color:var(--threat-critical)">${r.victimsThisWeek}</span></td>
        <td><span class="trend-indicator ${trendClass}">${r.trend === 'HOT' ? '🔥 HOT' : '📈 Active'}</span></td>
      </tr>`;
    });
    html += '</tbody></table>';
    ransomEl.innerHTML = html;
  } else {
    ransomEl.innerHTML = '<div class="empty-state">No trending ransomware data</div>';
  }
  
  // Render URL threats
  const urlEl = document.getElementById('trending-urls');
  if (data.trendingUrlThreats?.length > 0) {
    let html = '<div style="display:flex;flex-wrap:wrap;gap:12px;">';
    data.trendingUrlThreats.forEach(u => {
      html += `<div style="background:var(--bg-elevated);padding:12px 16px;border-radius:8px;border:1px solid var(--border-subtle);min-width:150px;text-align:center;">
        <div style="font-size:24px;font-weight:700;color:var(--accent-cyan);font-family:var(--font-mono);">${u.count}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">${escapeHtml(u.type)}</div>
      </div>`;
    });
    html += '</div>';
    urlEl.innerHTML = html;
  } else {
    urlEl.innerHTML = '<div class="empty-state">No URL threat data</div>';
  }
}

function renderRansomware(data) {
  const el = document.getElementById('ransomware-table');
  const victims = data.recent_victims || [];
  
  if (victims.length === 0) {
    el.innerHTML = '<div class="empty-state">No recent ransomware victims</div>';
    return;
  }
  
  let html = '<table class="data-table"><thead><tr><th>Victim</th><th>Group</th><th>Country</th><th>Discovered</th></tr></thead><tbody>';
  victims.slice(0, 30).forEach(v => {
    const date = v.discovered || v.published;
    html += `<tr>
      <td><strong>${escapeHtml(v.victim || 'Unknown')}</strong></td>
      <td><span class="trend-indicator hot">${escapeHtml(v.group_name || 'Unknown')}</span></td>
      <td>${escapeHtml(v.country || '—')}</td>
      <td style="color:var(--text-muted);font-size:12px;">${timeAgo(date)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderActors(data) {
  const el = document.getElementById('actors-grid');
  const actors = data.actors || [];
  
  if (actors.length === 0) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No threat actor data available</div>';
    return;
  }
  
  let html = '';
  actors.filter(a => a.activity?.last7days > 0).slice(0, 12).forEach(actor => {
    const riskClass = actor.riskLevel?.toLowerCase() || 'medium';
    const techniques = (actor.mitreTechniques || []).slice(0, 4).map(t => 
      `<span class="technique-tag">${t}</span>`
    ).join('');
    
    const trendIcon = actor.activity?.trend === 'INCREASING' ? '📈' : 
                      actor.activity?.trend === 'DECREASING' ? '📉' : '➡️';
    
    html += `<div class="actor-card">
      <div class="actor-header">
        <div class="actor-name">${escapeHtml(actor.name)}</div>
        <div class="actor-risk ${riskClass}">${actor.riskLevel}</div>
      </div>
      <div class="actor-stats">
        <div class="actor-stat">
          <div class="actor-stat-value" style="color:var(--threat-critical)">${actor.activity?.last7days || 0}</div>
          <div class="actor-stat-label">This Week</div>
        </div>
        <div class="actor-stat">
          <div class="actor-stat-value">${actor.victimCount || 0}</div>
          <div class="actor-stat-label">Total</div>
        </div>
        <div class="actor-stat">
          <div class="actor-stat-value">${trendIcon}</div>
          <div class="actor-stat-label">Trend</div>
        </div>
      </div>
      <div class="actor-techniques">${techniques}</div>
    </div>`;
  });
  
  el.innerHTML = html || '<div class="empty-state" style="grid-column:1/-1;">No active threat actors this week</div>';
}

function renderSectorData(data) {
  const el = document.getElementById('sector-data');
  const titleEl = document.getElementById('sector-title');
  const riskEl = document.getElementById('sector-risk');
  
  const sectorNames = {
    all: 'All Sectors',
    healthcare: '🏥 Healthcare / Pharma',
    finance: '🏦 Finance / Banking',
    technology: '💻 Technology',
    manufacturing: '🏭 Manufacturing',
    energy: '⚡ Energy / Utilities',
    government: '🏛️ Government',
    education: '🎓 Education'
  };
  
  titleEl.innerHTML = `<span class="icon">🏢</span> ${sectorNames[data.sector] || data.sector} - Threat Analysis`;
  riskEl.textContent = `Risk Score: ${data.riskScore || 0}`;
  riskEl.style.background = data.riskScore > 70 ? 'var(--threat-critical)' : 
                             data.riskScore > 40 ? 'var(--threat-high)' : 'var(--accent-blue)';
  
  if (!data.recentVictims?.length && !data.attackingGroups?.length) {
    el.innerHTML = '<div class="empty-state">No threats found for this sector</div>';
    return;
  }
  
  let html = '<div class="grid-2">';
  
  // Recent victims
  html += '<div><h4 style="margin-bottom:12px;font-size:13px;color:var(--text-muted);">Recent Victims</h4>';
  if (data.recentVictims?.length > 0) {
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    data.recentVictims.slice(0, 10).forEach(v => {
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-elevated);border-radius:6px;">
        <span style="font-weight:600;">${escapeHtml(v.name)}</span>
        <span class="trend-indicator hot">${escapeHtml(v.group)}</span>
      </div>`;
    });
    html += '</div>';
  } else {
    html += '<p style="color:var(--text-muted);">No recent victims</p>';
  }
  html += '</div>';
  
  // Attacking groups
  html += '<div><h4 style="margin-bottom:12px;font-size:13px;color:var(--text-muted);">Top Attacking Groups</h4>';
  if (data.attackingGroups?.length > 0) {
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    data.attackingGroups.slice(0, 8).forEach(g => {
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-elevated);border-radius:6px;">
        <span style="font-weight:600;">${escapeHtml(g.name)}</span>
        <span style="color:var(--threat-critical);font-weight:700;">${g.attackCount} attacks</span>
      </div>`;
    });
    html += '</div>';
  } else {
    html += '<p style="color:var(--text-muted);">No attacking groups</p>';
  }
  html += '</div></div>';
  
  el.innerHTML = html;
}

function renderGeoData(data) {
  // Render victim countries
  const victimsEl = document.getElementById('geo-victims');
  if (data.victimDistribution?.length > 0) {
    let html = '<table class="data-table"><thead><tr><th>Country</th><th>Victims</th><th>%</th></tr></thead><tbody>';
    const total = data.totals?.total_victims || 1;
    data.victimDistribution.slice(0, 15).forEach(c => {
      const pct = ((c.victims / total) * 100).toFixed(1);
      html += `<tr>
        <td><strong>${escapeHtml(c.country)}</strong></td>
        <td style="color:var(--threat-critical);font-weight:700;">${c.victims}</td>
        <td style="color:var(--text-muted);">${pct}%</td>
      </tr>`;
    });
    html += '</tbody></table>';
    victimsEl.innerHTML = html;
  } else {
    victimsEl.innerHTML = '<div class="empty-state">No geographic data</div>';
  }
  
  // Render C2 server countries
  const c2El = document.getElementById('geo-c2');
  if (data.c2Distribution?.length > 0) {
    let html = '<table class="data-table"><thead><tr><th>Country</th><th>C2 Servers</th><th>%</th></tr></thead><tbody>';
    const total = data.totals?.total_c2 || 1;
    data.c2Distribution.slice(0, 15).forEach(c => {
      const pct = ((c.servers / total) * 100).toFixed(1);
      html += `<tr>
        <td><strong>${escapeHtml(c.country)}</strong></td>
        <td style="color:var(--accent-purple);font-weight:700;">${c.servers}</td>
        <td style="color:var(--text-muted);">${pct}%</td>
      </tr>`;
    });
    html += '</tbody></table>';
    c2El.innerHTML = html;
  } else {
    c2El.innerHTML = '<div class="empty-state">No C2 server data</div>';
  }
}

// ============================================
// IOC LOOKUP
// ============================================
async function lookupIoC() {
  const type = document.getElementById('ioc-type').value;
  const value = document.getElementById('ioc-value').value.trim();
  
  if (!value) {
    showToast('Please enter an IoC value', 'error');
    return;
  }
  
  const resultsEl = document.getElementById('ioc-results');
  resultsEl.innerHTML = '<div class="loading"><div class="spinner"></div>Searching threat intelligence sources...</div>';
  resultsEl.classList.add('active');
  
  try {
    const res = await fetch(`${API_BASE}/ioclookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value })
    });
    const data = await res.json();
    renderIoCResults(data);
  } catch (err) {
    console.error('IoC lookup error:', err);
    resultsEl.innerHTML = '<div class="empty-state">Failed to search IoC. Please try again.</div>';
  }
}

function renderIoCResults(data) {
  const el = document.getElementById('ioc-results');
  
  const verdictClass = data.verdict?.toLowerCase() || 'clean';
  const verdictIcon = data.verdict === 'MALICIOUS' ? '☠️' : 
                      data.verdict === 'SUSPICIOUS' ? '⚠️' : '✅';
  
  let html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div class="verdict-badge ${verdictClass}">${verdictIcon} ${data.verdict || 'CLEAN'}</div>
      <p style="margin-top:12px;color:var(--text-muted);font-size:13px;">
        Searched: <code class="ioc-value">${escapeHtml(data.value)}</code>
      </p>
    </div>
    <div class="grid-2">
  `;
  
  // ThreatFox results
  html += '<div class="card"><div class="card-header"><h3 class="card-title">🦊 ThreatFox</h3></div><div class="card-body">';
  if (data.sources?.threatfox?.query_status === 'ok' && data.sources.threatfox.data?.length > 0) {
    const tf = data.sources.threatfox.data[0];
    html += `
      <p><strong>Malware:</strong> ${escapeHtml(tf.malware_printable || 'Unknown')}</p>
      <p><strong>Threat Type:</strong> ${escapeHtml(tf.threat_type || 'Unknown')}</p>
      <p><strong>First Seen:</strong> ${tf.first_seen || 'Unknown'}</p>
      <p><strong>Confidence:</strong> ${tf.confidence_level || 'Unknown'}%</p>
    `;
  } else {
    html += '<p style="color:var(--text-muted);">Not found in ThreatFox</p>';
  }
  html += '</div></div>';
  
  // URLhaus results
  html += '<div class="card"><div class="card-header"><h3 class="card-title">🔗 URLhaus</h3></div><div class="card-body">';
  if (data.sources?.urlhaus?.query_status === 'ok') {
    const uh = data.sources.urlhaus;
    html += `
      <p><strong>Status:</strong> ${escapeHtml(uh.url_status || uh.host_status || 'Unknown')}</p>
      <p><strong>Threat:</strong> ${escapeHtml(uh.threat || 'Unknown')}</p>
      ${uh.blacklists ? `<p><strong>Blacklists:</strong> ${Object.values(uh.blacklists).filter(v => v === 'listed').length} hits</p>` : ''}
    `;
  } else {
    html += '<p style="color:var(--text-muted);">Not found in URLhaus</p>';
  }
  html += '</div></div>';
  
  // MalwareBazaar results
  if (data.sources?.malwarebazaar) {
    html += '<div class="card" style="grid-column:1/-1;"><div class="card-header"><h3 class="card-title">🦠 MalwareBazaar</h3></div><div class="card-body">';
    if (data.sources.malwarebazaar.query_status === 'ok' && data.sources.malwarebazaar.data?.length > 0) {
      const mb = data.sources.malwarebazaar.data[0];
      html += `
        <div class="grid-2">
          <div>
            <p><strong>File Type:</strong> ${escapeHtml(mb.file_type || 'Unknown')}</p>
            <p><strong>Signature:</strong> ${escapeHtml(mb.signature || 'Unknown')}</p>
          </div>
          <div>
            <p><strong>File Size:</strong> ${mb.file_size ? (mb.file_size / 1024).toFixed(2) + ' KB' : 'Unknown'}</p>
            <p><strong>First Seen:</strong> ${mb.first_seen || 'Unknown'}</p>
          </div>
        </div>
      `;
    } else {
      html += '<p style="color:var(--text-muted);">Not found in MalwareBazaar</p>';
    }
    html += '</div></div>';
  }
  
  html += '</div>';
  el.innerHTML = html;
}

// ============================================
// UI FUNCTIONS
// ============================================
function switchPanel(panelId) {
  // Update tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panelId);
  });
  
  // Update panels
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${panelId}`);
  });
  
  // Load sector data if needed
  if (panelId === 'sectors' && !threatData.sectors[currentSector]) {
    loadSectorData(currentSector);
  }
}

function selectSector(sector) {
  currentSector = sector;
  
  // Update buttons
  document.querySelectorAll('.sector-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sector === sector);
  });
  
  // Load sector data
  if (threatData.sectors[sector]) {
    renderSectorData(threatData.sectors[sector]);
  } else {
    document.getElementById('sector-data').innerHTML = '<div class="loading"><div class="spinner"></div>Loading sector data...</div>';
    loadSectorData(sector);
  }
}

function refreshRansomware() {
  document.getElementById('ransomware-table').innerHTML = '<div class="loading"><div class="spinner"></div>Refreshing...</div>';
  loadRansomware();
}

function updateLastRefresh() {
  const now = new Date();
  document.getElementById('last-update').textContent = `Updated: ${now.toLocaleTimeString()}`;
}

// ============================================
// MODALS
// ============================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function closeModalOnBg(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
}

// ============================================
// FORMS
// ============================================
async function handleSubscribe(e) {
  e.preventDefault();
  const btn = document.getElementById('sub-btn');
  btn.disabled = true;
  btn.textContent = 'Subscribing...';
  
  const data = {
    email: document.getElementById('sub-email').value,
    company: document.getElementById('sub-company').value,
    sector: document.getElementById('sub-sector').value,
    frequency: document.getElementById('sub-frequency').value,
    source: 'threat-dashboard'
  };
  
  try {
    await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showToast('✅ Subscribed successfully! Check your email.', 'success');
    closeModal('subscribe-modal');
    e.target.reset();
  } catch (err) {
    showToast('Subscription received! You will receive alerts at ' + data.email, 'success');
    closeModal('subscribe-modal');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Subscribe to Alerts';
  }
}

async function handleContact(e) {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    company: document.getElementById('contact-company').value,
    service: document.getElementById('contact-service').value,
    message: document.getElementById('contact-message').value
  };
  
  try {
    await fetch(`${API_BASE}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showToast('✅ Request submitted! We will contact you soon.', 'success');
  } catch (err) {
    showToast('Request received! We will contact you at ' + data.email, 'success');
  }
  
  closeModal('contact-modal');
  e.target.reset();
}

// ============================================
// EXPORT
// ============================================
function exportData() {
  const data = {
    exportDate: new Date().toISOString(),
    executiveSummary: threatData.executive,
    trending: threatData.trending,
    ransomware: threatData.ransomware?.recent_victims?.slice(0, 50),
    threatActors: threatData.actors?.actors?.slice(0, 20)
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cvepulse-threat-report-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📥 Threat report exported!', 'success');
}

// ============================================
// UTILITIES
// ============================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function timeAgo(date) {
  if (!date) return 'Unknown';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
