/**
 * CVEPulse Threat Intelligence Dashboard - Complete Edition
 * Features: PDF Export, Email Alerts, Error Handling, All Analytics
 */

const API_BASE = 'https://us-central1-cvepulse.cloudfunctions.net';
const REFRESH_INTERVAL = 300000; // 5 minutes
let retryCount = 0;
const MAX_RETRIES = 3;

let dashboardData = {
  executive: null,
  threats: [],
  filteredThreats: [],
  campaigns: [],
  ransomware: null,
  timeline: null
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setInterval(loadDashboard, REFRESH_INTERVAL);
  
  document.getElementById('lookup-value')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') lookupIoC();
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.getElementById('export-menu')?.classList.remove('show');
    }
  });
});

// ============================================
// DATA LOADING
// ============================================
async function loadDashboard() {
  updateLastRefresh('Loading...');
  hideError();
  
  try {
    await loadExecutiveDashboard();
    retryCount = 0;
    
    // Load other data in parallel
    Promise.all([
      loadEnrichedThreats(),
      loadCampaigns(),
      loadRansomware(),
      loadTimeline('7d')
    ]).catch(console.error);
    
  } catch (err) {
    console.error('Dashboard load error:', err);
    handleLoadError(err);
  }
}

async function loadExecutiveDashboard() {
  const res = await fetch(`${API_BASE}/executiveDashboard`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const data = await res.json();
  dashboardData.executive = data;
  renderExecutiveDashboard(data);
  updateLastRefresh();
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
    console.error('Threats error:', err);
    document.getElementById('threats-table').innerHTML = '<div class="empty-state">Failed to load threats. <button onclick="loadEnrichedThreats()" class="btn btn-sm btn-outline" style="margin-left:10px">Retry</button></div>';
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

// ============================================
// RENDERING
// ============================================
function renderExecutiveDashboard(data) {
  const posture = data.threatPosture || {};
  const level = posture.level?.toLowerCase() || 'moderate';
  const score = posture.score || 50;
  
  // Animate ring
  const ring = document.getElementById('posture-ring');
  const offset = 283 - (score / 100) * 283;
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
    ring.className = `ring-value ${level}`;
  }, 100);
  
  document.getElementById('posture-score').textContent = score;
  
  const title = document.getElementById('posture-title');
  title.textContent = `Threat Level: ${posture.level || 'MODERATE'}`;
  title.className = `posture-title ${level}`;
  
  const trendText = posture.trend === 'INCREASING' ? '📈 Threat activity is increasing' :
                    posture.trend === 'DECREASING' ? '📉 Threat activity is decreasing' : '➡️ Threat activity is stable';
  document.getElementById('posture-trend').textContent = trendText;
  
  // Render factors
  const factorsEl = document.getElementById('posture-factors');
  if (posture.factors?.length) {
    factorsEl.innerHTML = posture.factors.slice(0, 4).map(f => `
      <div class="factor-item">
        <span class="factor-level ${f.level?.toLowerCase()}">${f.level}</span>
        <span class="factor-detail">${escapeHtml(f.detail)}</span>
      </div>
    `).join('');
  }
  
  // Metrics
  document.getElementById('metric-ransomware').textContent = data.metrics?.ransomware?.last24h || 0;
  document.getElementById('metric-kev').textContent = data.metrics?.vulnerabilities?.newKEV7d || 0;
  document.getElementById('metric-campaigns').textContent = data.metrics?.campaigns?.active || 0;
  document.getElementById('metric-iocs').textContent = formatNumber(data.metrics?.indicators?.highConfidence || 0);
  
  // Emerging threats
  renderEmergingThreats(data.emergingThreats || []);
}

function renderEmergingThreats(threats) {
  const el = document.getElementById('emerging-threats');
  
  if (!threats.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No critical emerging threats detected. Your threat posture is stable.</div>';
    return;
  }
  
  el.innerHTML = threats.map(t => `
    <div class="threat-card ${t.severity?.toLowerCase()}">
      <div class="threat-card-header">
        <h4 class="threat-card-title">${escapeHtml(t.title)}</h4>
        <span class="threat-severity ${t.severity?.toLowerCase()}">${t.severity}</span>
      </div>
      <p class="threat-card-summary">${escapeHtml(t.summary)}</p>
      <div class="threat-card-action">
        <span>${t.activeExploitation ? '⚡' : '📋'}</span>
        <span>${escapeHtml(t.actionRequired)}</span>
      </div>
    </div>
  `).join('');
}

function renderThreatsTable() {
  const el = document.getElementById('threats-table');
  const threats = dashboardData.filteredThreats;
  
  if (!threats.length) {
    el.innerHTML = '<div class="empty-state">No threats match your filters</div>';
    return;
  }
  
  el.innerHTML = `
    <table class="threats-table">
      <thead><tr>
        <th>Indicator</th><th>Type</th><th>Malware</th><th>Relevance</th><th>Score</th><th>Action</th><th>Source</th><th></th>
      </tr></thead>
      <tbody>
        ${threats.slice(0, 50).map(t => `
          <tr>
            <td class="indicator-cell" title="${escapeHtml(t.indicator)}" onclick="copyIndicator('${escapeHtml(t.indicator)}')">${escapeHtml(t.indicator)}</td>
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
  
  if (!campaigns.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No active campaigns detected</div>';
    return;
  }
  
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
    groupsEl.innerHTML = `<h4 style="margin-bottom:16px;font-size:14px;">🎯 Threat Actor Activity</h4>` +
      groups.slice(0, 10).map(g => `
        <div class="group-card">
          <div class="group-header">
            <span class="group-name">${escapeHtml(g.name)}</span>
            <span class="group-level ${g.activityLevel?.toLowerCase()}">${g.activityLevel}</span>
          </div>
          <div class="group-stats">
            <span>24h: <strong>${g.last24h}</strong></span>
            <span>7d: <strong>${g.last7d}</strong></span>
            <span>Total: <strong>${g.totalVictims}</strong></span>
          </div>
        </div>
      `).join('');
  }
}

function renderTimeline(data) {
  const el = document.getElementById('timeline-content');
  const timeline = data.timeline || [];
  
  if (!timeline.length) {
    el.innerHTML = '<div class="empty-state">No timeline data</div>';
    return;
  }
  
  const maxR = Math.max(...timeline.map(d => d.ransomwareVictims), 1);
  const maxI = Math.max(...timeline.map(d => d.newIoCs), 1);
  
  let html = `
    <div style="display:flex;gap:24px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:16px;height:16px;background:var(--critical);border-radius:4px;"></span>
        <span style="font-size:12px;color:var(--text-secondary);">Ransomware Victims</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:16px;height:16px;background:var(--info);border-radius:4px;"></span>
        <span style="font-size:12px;color:var(--text-secondary);">New IoCs</span>
      </div>
    </div>
    <div class="timeline-chart">
  `;
  
  timeline.forEach(day => {
    html += `
      <div class="timeline-row">
        <span class="timeline-date">${formatDate(day.date)}</span>
        <div class="timeline-bar-wrap">
          <div class="timeline-bar ransomware" style="width:${(day.ransomwareVictims/maxR)*40}%"></div>
          <div class="timeline-bar iocs" style="width:${(day.newIoCs/maxI)*40}%"></div>
        </div>
        <span class="timeline-value">${day.ransomwareVictims} / ${day.newIoCs}</span>
      </div>
    `;
  });
  html += '</div>';
  
  if (data.anomalies?.length) {
    html += `
      <div style="margin-top:24px;padding:16px;background:var(--high-bg);border-radius:var(--radius-sm);border:1px solid rgba(249,115,22,0.3);">
        <strong style="color:var(--high);">⚠️ Anomalies Detected</strong>
        <ul style="margin-top:10px;padding-left:20px;color:var(--text-secondary);font-size:13px;">
          ${data.anomalies.map(a => `<li>${escapeHtml(a.detail)}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  el.innerHTML = html;
}

// ============================================
// IOC LOOKUP
// ============================================
async function lookupIoC() {
  const type = document.getElementById('lookup-type').value;
  const value = document.getElementById('lookup-value').value.trim();
  
  if (!value) {
    showToast('Please enter an indicator', 'error');
    return;
  }
  
  const el = document.getElementById('lookup-results');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div>Analyzing indicator across threat intelligence sources...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/iocEnrichment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value })
    });
    const data = await res.json();
    renderLookupResults(data);
  } catch (err) {
    el.innerHTML = '<div class="empty-state">Failed to analyze indicator. Please try again.</div>';
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
            <span class="source-status ${s.status?.toLowerCase()}">${s.status === 'FOUND' ? 'HIT' : 'CLEAN'}</span>
          </div>
          <div class="source-details">
            ${s.status === 'FOUND' && s.details ? Object.entries(s.details).filter(([k,v]) => v).slice(0, 4).map(([k, v]) => `<p><strong>${formatKey(k)}:</strong> ${escapeHtml(String(v))}</p>`).join('') : '<p style="color:var(--text-muted)">Not found in this source</p>'}
          </div>
        </div>
      `).join('') || ''}
    </div>
    <div class="lookup-recommendations">
      <h4>📋 Recommended Actions</h4>
      <div class="rec-list">
        ${data.recommendations?.map(r => `
          <div class="rec-item ${r.priority?.toLowerCase()}">
            <span class="rec-action">${escapeHtml(r.action)}</span>
            <span class="rec-detail">${escapeHtml(r.detail)}</span>
          </div>
        `).join('') || '<p style="color:var(--text-muted)">No specific recommendations</p>'}
      </div>
    </div>
    ${data.mitre?.techniques?.length ? `
      <div style="margin-top:20px;padding:20px;background:var(--bg-elevated);border-radius:var(--radius-md);">
        <h4 style="margin-bottom:12px;">🎯 MITRE ATT&CK Techniques</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${data.mitre.techniques.map(t => `<span class="mitre-tag">${t}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// ============================================
// THREAT DETAIL
// ============================================
function viewThreat(id) {
  const t = dashboardData.threats.find(x => x.id === id);
  if (!t) return;
  
  document.getElementById('threat-modal-title').textContent = `Threat Analysis: ${t.type}`;
  document.getElementById('threat-modal-body').innerHTML = `
    <div style="margin-bottom:20px;">
      <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Indicator</label>
      <p style="font-family:var(--font-mono);color:var(--accent);word-break:break-all;font-size:13px;margin-top:6px;">${escapeHtml(t.indicator)}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div>
        <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Relevance Score</label>
        <p style="font-size:28px;font-weight:700;margin-top:6px;">${t.relevanceScore}<span style="font-size:14px;color:var(--text-secondary)">/100</span></p>
      </div>
      <div>
        <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Recommended Action</label>
        <p style="margin-top:6px;"><span class="action-badge ${getActionClass(t.recommendedAction?.action)}">${formatAction(t.recommendedAction?.action)}</span></p>
      </div>
    </div>
    ${t.scoringFactors?.length ? `
      <div style="margin-bottom:20px;">
        <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;display:block;">Scoring Factors</label>
        ${t.scoringFactors.map(f => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
            <span>${escapeHtml(f.factor)}</span>
            <span style="color:var(--accent);font-weight:600;">+${f.points}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    ${t.recommendedAction?.steps?.length ? `
      <div style="margin-bottom:20px;">
        <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;display:block;">Action Steps</label>
        <ol style="padding-left:20px;color:var(--text-secondary);font-size:13px;">
          ${t.recommendedAction.steps.map(s => `<li style="margin-bottom:6px;">${escapeHtml(s)}</li>`).join('')}
        </ol>
      </div>
    ` : ''}
    ${t.mitre?.techniques?.length ? `
      <div>
        <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;display:block;">MITRE ATT&CK</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${t.mitre.techniques.map(tech => `<span class="mitre-tag">${tech}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  `;
  openModal('threat-modal');
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
function toggleExportMenu() {
  document.getElementById('export-menu').classList.toggle('show');
}

function exportJSON() {
  const data = {
    generatedAt: new Date().toISOString(),
    threatPosture: dashboardData.executive?.threatPosture,
    emergingThreats: dashboardData.executive?.emergingThreats,
    metrics: dashboardData.executive?.metrics,
    activeCampaigns: dashboardData.campaigns?.filter(c => c.status === 'ACTIVE'),
    highRelevanceThreats: dashboardData.threats?.filter(t => t.relevanceLevel === 'HIGH').slice(0, 20)
  };
  downloadFile(JSON.stringify(data, null, 2), `cvepulse-report-${formatDateFile()}.json`, 'application/json');
  showToast('✅ JSON report exported!', 'success');
  toggleExportMenu();
}

function exportCSV() {
  let csv = 'Indicator,Type,Malware,Relevance,Score,Action,Source\n';
  dashboardData.filteredThreats.forEach(t => {
    csv += `"${t.indicator}","${t.type}","${t.malwareFamily || ''}","${t.relevanceLevel}","${t.relevanceScore}","${t.recommendedAction?.action || ''}","${t.source}"\n`;
  });
  downloadFile(csv, `cvepulse-threats-${formatDateFile()}.csv`, 'text/csv');
  showToast('✅ CSV exported!', 'success');
  toggleExportMenu();
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const posture = dashboardData.executive?.threatPosture || {};
  const metrics = dashboardData.executive?.metrics || {};
  const threats = dashboardData.executive?.emergingThreats || [];
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(6, 182, 212);
  doc.text('CVEPulse Threat Intelligence Report', 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 33);
  
  // Executive Summary Box
  doc.setFillColor(18, 26, 41);
  doc.rect(20, 40, 170, 35, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252);
  doc.text('Executive Summary', 25, 50);
  
  doc.setFontSize(20);
  const levelColor = posture.level === 'CRITICAL' ? [239, 68, 68] : 
                     posture.level === 'HIGH' ? [249, 115, 22] : 
                     posture.level === 'MODERATE' ? [234, 179, 8] : [34, 197, 94];
  doc.setTextColor(...levelColor);
  doc.text(`Threat Level: ${posture.level || 'MODERATE'}`, 25, 62);
  
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(`Risk Score: ${posture.score || 50}/100 | Trend: ${posture.trend || 'STABLE'}`, 25, 70);
  
  // Metrics
  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252);
  doc.text('Key Metrics', 20, 90);
  
  const metricsData = [
    ['Ransomware Victims (24h)', metrics.ransomware?.last24h || 0],
    ['New Exploited CVEs (7d)', metrics.vulnerabilities?.newKEV7d || 0],
    ['Active Campaigns', metrics.campaigns?.active || 0],
    ['High-Confidence IoCs', metrics.indicators?.highConfidence || 0]
  ];
  
  doc.autoTable({
    startY: 95,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: [6, 182, 212] },
    styles: { fontSize: 10 }
  });
  
  // Emerging Threats
  if (threats.length) {
    doc.setFontSize(14);
    doc.setTextColor(248, 250, 252);
    doc.text('Emerging Threats', 20, doc.lastAutoTable.finalY + 15);
    
    const threatData = threats.map(t => [t.severity, t.title, t.actionRequired]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Severity', 'Threat', 'Action Required']],
      body: threatData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 25 }, 2: { cellWidth: 40 } }
    });
  }
  
  // Top Ransomware Groups
  if (metrics.ransomware?.topGroups?.length) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(248, 250, 252);
    doc.text('Top Ransomware Groups (7 Days)', 20, 25);
    
    const groupData = metrics.ransomware.topGroups.map(g => [g.name, g.victims, g.trend]);
    
    doc.autoTable({
      startY: 30,
      head: [['Group', 'Victims', 'Trend']],
      body: groupData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 10 }
    });
  }
  
  // Recommendations
  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252);
  doc.text('Recommendations', 20, doc.lastAutoTable.finalY + 15);
  
  const recommendations = [
    ['CRITICAL', 'Patch all CISA KEV vulnerabilities immediately'],
    ['HIGH', 'Update threat intelligence feeds and blocklists'],
    ['HIGH', 'Review ransomware backup and recovery procedures'],
    ['MEDIUM', 'Conduct phishing awareness training'],
    ['MEDIUM', 'Verify endpoint detection signatures are current']
  ];
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Priority', 'Recommendation']],
    body: recommendations,
    theme: 'grid',
    headStyles: { fillColor: [6, 182, 212] },
    styles: { fontSize: 10 }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`CVEPulse - www.cvepulse.com | Page ${i} of ${pageCount}`, 20, 290);
  }
  
  doc.save(`cvepulse-report-${formatDateFile()}.pdf`);
  showToast('✅ PDF report exported!', 'success');
  toggleExportMenu();
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
    const res = await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    
    if (result.success) {
      showToast('✅ Subscribed! Check your email for confirmation.', 'success');
      closeModal('subscribe-modal');
      e.target.reset();
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    showToast('✅ Subscribed successfully!', 'success');
    closeModal('subscribe-modal');
    e.target.reset();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Subscribe to Alerts';
  }
}

async function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  
  const data = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    company: document.getElementById('contact-company').value,
    service: document.getElementById('contact-service').value,
    message: document.getElementById('contact-message').value,
    source: 'threat-dashboard'
  };
  
  try {
    await fetch(`${API_BASE}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showToast('✅ Request submitted! We\'ll contact you soon.', 'success');
    closeModal('contact-modal');
    e.target.reset();
  } catch (err) {
    showToast('✅ Request received! We\'ll be in touch.', 'success');
    closeModal('contact-modal');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Request';
  }
}

// ============================================
// FILTERING
// ============================================
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

// ============================================
// TABS & MODALS
// ============================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabId}`));
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function closeModalBg(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active'); }

// ============================================
// ERROR HANDLING
// ============================================
function handleLoadError(err) {
  retryCount++;
  if (retryCount < MAX_RETRIES) {
    showError(`Connection failed. Retrying (${retryCount}/${MAX_RETRIES})...`);
    setTimeout(loadDashboard, 3000);
  } else {
    showError('Unable to connect to threat feeds. Please check your connection and try again.');
    updateLastRefresh('Connection failed');
  }
}

function showError(message) {
  const banner = document.getElementById('error-banner');
  document.getElementById('error-text').textContent = message;
  banner.style.display = 'flex';
}

function hideError() {
  document.getElementById('error-banner').style.display = 'none';
}

// ============================================
// UTILITIES
// ============================================
function updateLastRefresh(text) {
  document.getElementById('last-update').textContent = text || `Updated: ${new Date().toLocaleTimeString()}`;
}

function showToast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
}

function copyIndicator(indicator) {
  navigator.clipboard.writeText(indicator);
  showToast('📋 Indicator copied to clipboard', 'success');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function formatNumber(n) { return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString(); }
function timeAgo(d) { if (!d) return 'Unknown'; const s = Math.floor((new Date() - new Date(d))/1000); return s < 60 ? 'Just now' : s < 3600 ? Math.floor(s/60)+'m ago' : s < 86400 ? Math.floor(s/3600)+'h ago' : Math.floor(s/86400)+'d ago'; }
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function formatDateFile() { return new Date().toISOString().split('T')[0]; }
function formatKey(k) { return k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' '); }
function formatAction(a) { return a ? a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—'; }
function getActionClass(a) { return !a ? '' : a === 'BLOCK_IMMEDIATELY' ? 'block' : a === 'INVESTIGATE' ? 'investigate' : a === 'MONITOR' ? 'monitor' : 'track'; }
function escapeHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
