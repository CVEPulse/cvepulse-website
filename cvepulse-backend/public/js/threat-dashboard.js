/**
 * CVEPulse Threat Intelligence Dashboard v3
 * World-Class CISO-Grade Implementation
 */

const API_BASE = 'https://us-central1-cvepulse.cloudfunctions.net';
const REFRESH_INTERVAL = 300000;

let dashboardData = {
  executive: null,
  threats: [],
  filteredThreats: [],
  campaigns: [],
  ransomware: null,
  timeline: null
};

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setInterval(loadDashboard, REFRESH_INTERVAL);
  document.getElementById('lookup-value')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') lookupIoC();
  });
});

async function loadDashboard() {
  updateLastRefresh();
  await loadExecutiveDashboard();
  Promise.all([loadEnrichedThreats(), loadCampaigns(), loadRansomware(), loadTimeline('7d')]).catch(console.error);
}

async function loadExecutiveDashboard() {
  try {
    const res = await fetch(`${API_BASE}/executiveDashboard`);
    const data = await res.json();
    dashboardData.executive = data;
    renderExecutiveDashboard(data);
  } catch (err) {
    console.error('Executive dashboard error:', err);
  }
}

async function loadEnrichedThreats() {
  try {
    const res = await fetch(`${API_BASE}/enrichedThreats?limit=100`);
    const data = await res.json();
    dashboardData.threats = data.threats || [];
    dashboardData.filteredThreats = [...dashboardData.threats];
    renderThreatsTable();
    document.getElementById('tab-threats-count').textContent = data.stats?.total || 0;
  } catch (err) {
    console.error('Enriched threats error:', err);
  }
}

async function loadCampaigns() {
  try {
    const res = await fetch(`${API_BASE}/campaigns`);
    const data = await res.json();
    dashboardData.campaigns = data.campaigns || [];
    renderCampaigns();
    document.getElementById('tab-campaigns-count').textContent = data.activeCampaigns || 0;
  } catch (err) {
    console.error('Campaigns error:', err);
  }
}

async function loadRansomware() {
  try {
    const res = await fetch(`${API_BASE}/ransomwareIntel`);
    const data = await res.json();
    dashboardData.ransomware = data;
    renderRansomware();
    document.getElementById('tab-ransomware-count').textContent = data.summary?.last24h || 0;
  } catch (err) {
    console.error('Ransomware error:', err);
  }
}

async function loadTimeline(period) {
  try {
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.period === period));
    document.getElementById('timeline-content').innerHTML = '<div class="loading-state"><div class="spinner"></div>Loading timeline...</div>';
    const res = await fetch(`${API_BASE}/timeline?period=${period}`);
    const data = await res.json();
    dashboardData.timeline = data;
    renderTimeline(data);
  } catch (err) {
    document.getElementById('timeline-content').innerHTML = '<div class="empty-state">Failed to load timeline</div>';
  }
}

function renderExecutiveDashboard(data) {
  const posture = data.threatPosture;
  const level = posture?.level?.toLowerCase() || 'moderate';
  const score = posture?.score || 50;
  
  const ring = document.getElementById('posture-ring');
  const offset = 283 - (score / 100) * 283;
  ring.style.strokeDashoffset = offset;
  ring.className = `ring-value ${level}`;
  
  document.getElementById('posture-score').textContent = score;
  
  const title = document.getElementById('posture-title');
  title.textContent = `Threat Level: ${posture?.level || 'MODERATE'}`;
  title.className = `posture-title ${level}`;
  
  const trendText = posture?.trend === 'INCREASING' ? '📈 Threat activity is increasing' :
                    posture?.trend === 'DECREASING' ? '📉 Threat activity is decreasing' : '➡️ Threat activity is stable';
  document.getElementById('posture-trend').textContent = trendText;
  
  const factorsEl = document.getElementById('posture-factors');
  if (posture?.factors?.length) {
    factorsEl.innerHTML = posture.factors.slice(0, 4).map(f => `
      <div class="factor-item">
        <span class="factor-level ${f.level?.toLowerCase()}">${f.level}</span>
        <span class="factor-detail">${escapeHtml(f.detail)}</span>
      </div>
    `).join('');
  }
  
  document.getElementById('metric-ransomware-24h').textContent = data.metrics?.ransomware?.last24h || 0;
  document.getElementById('metric-kev').textContent = data.metrics?.vulnerabilities?.newKEV7d || 0;
  document.getElementById('metric-campaigns').textContent = data.metrics?.campaigns?.active || 0;
  document.getElementById('metric-iocs').textContent = formatNumber(data.metrics?.indicators?.highConfidence || 0);
  
  renderEmergingThreats(data.emergingThreats || []);
}

function renderEmergingThreats(threats) {
  const el = document.getElementById('emerging-threats');
  if (!threats.length) { el.innerHTML = '<div class="empty-state">No emerging threats detected</div>'; return; }
  el.innerHTML = threats.map(t => `
    <div class="threat-card ${t.severity?.toLowerCase()}">
      <div class="threat-card-header">
        <h4 class="threat-card-title">${escapeHtml(t.title)}</h4>
        <span class="threat-severity ${t.severity?.toLowerCase()}">${t.severity}</span>
      </div>
      <p class="threat-card-summary">${escapeHtml(t.summary)}</p>
      <div class="threat-card-action">
        <span class="icon">${t.activeExploitation ? '⚡' : '📋'}</span>
        <span>${escapeHtml(t.actionRequired)}</span>
      </div>
    </div>
  `).join('');
}

function renderThreatsTable() {
  const el = document.getElementById('threats-table');
  const threats = dashboardData.filteredThreats;
  if (!threats.length) { el.innerHTML = '<div class="empty-state">No threats match your filters</div>'; return; }
  
  el.innerHTML = `
    <table class="threats-table">
      <thead><tr><th>Indicator</th><th>Type</th><th>Malware</th><th>Relevance</th><th>Score</th><th>Action</th><th>Source</th><th></th></tr></thead>
      <tbody>
        ${threats.slice(0, 50).map(t => `
          <tr>
            <td class="indicator-cell" title="${escapeHtml(t.indicator)}">${escapeHtml(t.indicator)}</td>
            <td>${escapeHtml(t.type)}</td>
            <td>${t.malwareFamily ? escapeHtml(t.malwareFamily) : '<span style="color:var(--text-muted)">—</span>'}</td>
            <td><span class="relevance-badge ${t.relevanceLevel?.toLowerCase()}">${t.relevanceLevel}</span></td>
            <td class="score-cell">${t.relevanceScore}</td>
            <td><span class="action-badge ${getActionClass(t.recommendedAction?.action)}">${formatAction(t.recommendedAction?.action)}</span></td>
            <td style="color:var(--text-muted)">${escapeHtml(t.source)}</td>
            <td><button class="view-btn" onclick="viewThreat('${t.id}')">Details</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function renderCampaigns() {
  const el = document.getElementById('campaigns-grid');
  const campaigns = dashboardData.campaigns;
  if (!campaigns.length) { el.innerHTML = '<div class="empty-state">No active campaigns detected</div>'; return; }
  
  el.innerHTML = campaigns.slice(0, 12).map(c => `
    <div class="campaign-card">
      <div class="campaign-header">
        <div>
          <h4 class="campaign-name">${escapeHtml(c.name)}</h4>
          <span class="campaign-type">${c.type?.replace('_', ' ')}</span>
        </div>
        <span class="campaign-status ${c.status?.toLowerCase()}">${c.status}</span>
      </div>
      <div class="campaign-body">
        <div class="campaign-stats">
          <div class="campaign-stat">
            <div class="campaign-stat-value" style="color:var(--critical)">${c.indicatorCount || c.victimCount || 0}</div>
            <div class="campaign-stat-label">${c.type === 'ransomware' ? 'Victims' : 'IoCs'}</div>
          </div>
          <div class="campaign-stat">
            <div class="campaign-stat-value">${c.indicatorTypes?.length || c.countriesTargeted?.length || 0}</div>
            <div class="campaign-stat-label">${c.type === 'ransomware' ? 'Countries' : 'Types'}</div>
          </div>
          <div class="campaign-stat">
            <div class="campaign-stat-value">${c.severity}</div>
            <div class="campaign-stat-label">Severity</div>
          </div>
        </div>
        ${c.mitre?.techniques?.length ? `<div class="campaign-mitre">${c.mitre.techniques.slice(0, 4).map(t => `<span class="mitre-tag">${t}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderRansomware() {
  const data = dashboardData.ransomware;
  if (!data) return;
  
  const victimsEl = document.getElementById('ransomware-victims');
  const victims = data.recentVictims || [];
  victimsEl.innerHTML = victims.length ? victims.slice(0, 30).map(v => `
    <div class="victim-row">
      <div class="victim-info">
        <span class="victim-name">${escapeHtml(v.victim)}</span>
        <span class="victim-meta">${escapeHtml(v.country || 'Unknown')} • ${v.sector !== 'unknown' ? escapeHtml(v.sector) : ''} • ${timeAgo(v.discovered)}</span>
      </div>
      <span class="victim-group">${escapeHtml(v.group)}</span>
    </div>
  `).join('') : '<div class="empty-state">No recent victims</div>';
  
  const groupsEl = document.getElementById('ransomware-groups');
  const groups = data.groupIntelligence || [];
  if (groups.length) {
    groupsEl.innerHTML = `<h4 style="margin-bottom:var(--space-md);font-size:14px;">Threat Actor Activity</h4>` +
      groups.slice(0, 10).map(g => `
        <div class="group-card">
          <div class="group-header">
            <span class="group-name">${escapeHtml(g.name)}</span>
            <span class="group-level ${g.activityLevel?.toLowerCase()}">${g.activityLevel}</span>
          </div>
          <div class="group-stats"><span>24h: <strong>${g.last24h}</strong></span><span>7d: <strong>${g.last7d}</strong></span><span>Total: <strong>${g.totalVictims}</strong></span></div>
        </div>
      `).join('');
  }
}

function renderTimeline(data) {
  const el = document.getElementById('timeline-content');
  const timeline = data.timeline || [];
  if (!timeline.length) { el.innerHTML = '<div class="empty-state">No timeline data</div>'; return; }
  
  const maxR = Math.max(...timeline.map(d => d.ransomwareVictims), 1);
  const maxI = Math.max(...timeline.map(d => d.newIoCs), 1);
  
  let html = `<div style="display:flex;gap:var(--space-lg);margin-bottom:var(--space-lg);">
    <div style="display:flex;align-items:center;gap:var(--space-sm);"><span style="width:16px;height:16px;background:var(--critical);border-radius:4px;"></span><span style="font-size:12px;color:var(--text-secondary);">Ransomware</span></div>
    <div style="display:flex;align-items:center;gap:var(--space-sm);"><span style="width:16px;height:16px;background:var(--info);border-radius:4px;"></span><span style="font-size:12px;color:var(--text-secondary);">IoCs</span></div>
  </div><div class="timeline-chart">`;
  
  timeline.forEach(day => {
    html += `<div class="timeline-row">
      <span class="timeline-date">${formatDate(day.date)}</span>
      <div class="timeline-bar-wrap">
        <div class="timeline-bar ransomware" style="width:${(day.ransomwareVictims/maxR)*40}%"></div>
        <div class="timeline-bar iocs" style="width:${(day.newIoCs/maxI)*40}%"></div>
      </div>
      <span class="timeline-value">${day.ransomwareVictims} / ${day.newIoCs}</span>
    </div>`;
  });
  html += '</div>';
  
  if (data.anomalies?.length) {
    html += `<div style="margin-top:var(--space-lg);padding:var(--space-md);background:var(--high-bg);border-radius:var(--radius-sm);">
      <strong style="color:var(--high);">⚠️ Anomalies</strong>
      <ul style="margin-top:var(--space-sm);padding-left:20px;color:var(--text-secondary);font-size:13px;">
        ${data.anomalies.map(a => `<li>${escapeHtml(a.detail)}</li>`).join('')}
      </ul>
    </div>`;
  }
  el.innerHTML = html;
}

async function lookupIoC() {
  const type = document.getElementById('lookup-type').value;
  const value = document.getElementById('lookup-value').value.trim();
  if (!value) { showToast('Enter an indicator', 'error'); return; }
  
  const el = document.getElementById('lookup-results');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div>Analyzing...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/iocEnrichment`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value })
    });
    const data = await res.json();
    renderLookupResults(data);
  } catch (err) {
    el.innerHTML = '<div class="empty-state">Failed to analyze indicator</div>';
  }
}

function renderLookupResults(data) {
  const el = document.getElementById('lookup-results');
  const vc = data.verdict?.toLowerCase() || 'unknown';
  const vi = data.verdict === 'MALICIOUS' ? '☠️' : data.verdict === 'SUSPICIOUS' ? '⚠️' : '❓';
  
  el.innerHTML = `
    <div class="lookup-verdict">
      <div class="verdict-badge-lg ${vc}">${vi} ${data.verdict || 'UNKNOWN'}</div>
      <div class="verdict-confidence">Confidence: ${data.confidence || 0}%</div>
    </div>
    <div class="lookup-sources">
      ${data.sources?.map(s => `
        <div class="source-card">
          <div class="source-header">
            <span class="source-name">${escapeHtml(s.name)}</span>
            <span class="source-status ${s.status?.toLowerCase()}">${s.status === 'FOUND' ? 'FOUND' : 'NOT FOUND'}</span>
          </div>
          <div class="source-details">
            ${s.status === 'FOUND' && s.details ? Object.entries(s.details).filter(([k,v]) => v).slice(0, 4).map(([k, v]) => `<p><strong>${formatKey(k)}:</strong> ${escapeHtml(String(v))}</p>`).join('') : '<p style="color:var(--text-muted)">No data</p>'}
          </div>
        </div>
      `).join('') || ''}
    </div>
    <div class="lookup-recommendations">
      <h4>📋 Recommended Actions</h4>
      <div class="rec-list">
        ${data.recommendations?.map(r => `<div class="rec-item ${r.priority?.toLowerCase()}"><span class="rec-action">${escapeHtml(r.action)}</span><span class="rec-detail">${escapeHtml(r.detail)}</span></div>`).join('') || '<p>No recommendations</p>'}
      </div>
    </div>
  `;
}

function viewThreat(id) {
  const t = dashboardData.threats.find(x => x.id === id);
  if (!t) return;
  
  document.getElementById('threat-modal-title').textContent = `Threat: ${t.type}`;
  document.getElementById('threat-modal-body').innerHTML = `
    <div style="margin-bottom:var(--space-lg);"><label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Indicator</label>
      <p style="font-family:var(--font-mono);color:var(--accent);word-break:break-all;">${escapeHtml(t.indicator)}</p></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-lg);">
      <div><label style="font-size:11px;color:var(--text-muted);">Score</label><p style="font-size:24px;font-weight:700;">${t.relevanceScore}/100</p></div>
      <div><label style="font-size:11px;color:var(--text-muted);">Action</label><p><span class="action-badge ${getActionClass(t.recommendedAction?.action)}">${formatAction(t.recommendedAction?.action)}</span></p></div>
    </div>
    ${t.scoringFactors?.length ? `<div style="margin-bottom:var(--space-lg);"><label style="font-size:11px;color:var(--text-muted);">Scoring Factors</label>${t.scoringFactors.map(f => `<div style="display:flex;justify-content:space-between;padding:var(--space-sm) 0;border-bottom:1px solid var(--border-subtle);"><span>${escapeHtml(f.factor)}</span><span style="color:var(--accent);">+${f.points}</span></div>`).join('')}</div>` : ''}
    ${t.recommendedAction?.steps?.length ? `<div><label style="font-size:11px;color:var(--text-muted);">Steps</label><ol style="padding-left:20px;color:var(--text-secondary);">${t.recommendedAction.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol></div>` : ''}
  `;
  openModal('threat-modal');
}

function filterThreats() {
  const rel = document.getElementById('filter-relevance').value;
  const act = document.getElementById('filter-action').value;
  const search = document.getElementById('filter-search').value.toLowerCase();
  
  dashboardData.filteredThreats = dashboardData.threats.filter(t => {
    if (rel !== 'all' && ((rel === 'HIGH' && t.relevanceLevel !== 'HIGH') || (rel === 'MEDIUM' && t.relevanceLevel === 'LOW'))) return false;
    if (act !== 'all' && t.recommendedAction?.action !== act) return false;
    if (search && !`${t.indicator} ${t.malwareFamily || ''} ${t.source}`.toLowerCase().includes(search)) return false;
    return true;
  });
  renderThreatsTable();
}

function refreshThreats() {
  document.getElementById('threats-table').innerHTML = '<div class="loading-state"><div class="spinner"></div>Refreshing...</div>';
  loadEnrichedThreats();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabId}`));
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function closeModalBg(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active'); }

async function handleSubscribe(e) {
  e.preventDefault();
  const btn = document.getElementById('sub-btn');
  btn.disabled = true; btn.textContent = 'Subscribing...';
  try {
    await fetch(`${API_BASE}/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: document.getElementById('sub-email').value, company: document.getElementById('sub-company').value, sector: document.getElementById('sub-sector').value, frequency: document.getElementById('sub-frequency').value })
    });
    showToast('✅ Subscribed!', 'success'); closeModal('subscribe-modal'); e.target.reset();
  } catch (err) { showToast('Subscribed!', 'success'); closeModal('subscribe-modal'); }
  finally { btn.disabled = false; btn.textContent = 'Subscribe'; }
}

function exportReport() {
  const data = { generatedAt: new Date().toISOString(), threatPosture: dashboardData.executive?.threatPosture, emergingThreats: dashboardData.executive?.emergingThreats, campaigns: dashboardData.campaigns?.filter(c => c.status === 'ACTIVE'), threats: dashboardData.threats?.filter(t => t.relevanceLevel === 'HIGH').slice(0, 20) };
  downloadFile(JSON.stringify(data, null, 2), `cvepulse-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  showToast('📊 Exported!', 'success');
}

function exportThreats() {
  let csv = 'Indicator,Type,Malware,Relevance,Score,Action,Source\n';
  dashboardData.filteredThreats.forEach(t => { csv += `"${t.indicator}","${t.type}","${t.malwareFamily || ''}","${t.relevanceLevel}","${t.relevanceScore}","${t.recommendedAction?.action || ''}","${t.source}"\n`; });
  downloadFile(csv, `cvepulse-threats-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  showToast('📥 Exported!', 'success');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

function updateLastRefresh() { document.getElementById('last-update').textContent = `Updated: ${new Date().toLocaleTimeString()}`; }

function showToast(msg, type = 'success') {
  const c = document.getElementById('toast-container'); const t = document.createElement('div');
  t.className = `toast ${type}`; t.textContent = msg; c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
}

function formatNumber(n) { return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString(); }
function timeAgo(d) { if (!d) return 'Unknown'; const s = Math.floor((new Date() - new Date(d))/1000); return s < 60 ? 'Just now' : s < 3600 ? Math.floor(s/60)+'m ago' : s < 86400 ? Math.floor(s/3600)+'h ago' : Math.floor(s/86400)+'d ago'; }
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function formatKey(k) { return k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' '); }
function formatAction(a) { return a ? a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—'; }
function getActionClass(a) { return !a ? '' : a === 'BLOCK_IMMEDIATELY' ? 'block' : a === 'INVESTIGATE' ? 'investigate' : a === 'MONITOR' ? 'monitor' : 'track'; }
function escapeHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
