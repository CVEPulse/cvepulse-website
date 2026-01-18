import React from 'react';

// PDF Report Generator - Opens printable HTML in new window
const generatePDFReport = (vulnerabilities, stats) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Categorize vulnerabilities
  const zeroDays = vulnerabilities?.filter(v => v.isZeroDay && !v.patchAvailable) || [];
  const overdue = vulnerabilities?.filter(v => v.daysDue < 0) || [];
  const ransomware = vulnerabilities?.filter(v => v.knownRansomwareCampaignUse === 'Known') || [];
  const newThisWeek = vulnerabilities?.filter(v => {
    const days = (Date.now() - new Date(v.dateAdded)) / (1000 * 60 * 60 * 24);
    return days <= 7;
  }) || [];

  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CVEPulse Executive Security Brief - ${dateStr}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 40px; 
          color: #1a1a2e;
          line-height: 1.6;
          max-width: 900px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #22d3ee;
          margin-bottom: 30px;
        }
        .logo { font-size: 28px; font-weight: 800; color: #0f172a; }
        .logo span { color: #22d3ee; }
        .date { color: #64748b; font-size: 14px; }
        .classification {
          background: #fef2f2;
          border: 2px solid #ef4444;
          color: #991b1b;
          padding: 8px 16px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          border-radius: 4px;
        }
        h1 { font-size: 24px; margin-bottom: 8px; color: #0f172a; }
        h2 { 
          font-size: 18px; 
          color: #0f172a; 
          margin: 30px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 20px 0;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .summary-card.critical { border-left: 4px solid #ef4444; }
        .summary-card.high { border-left: 4px solid #f97316; }
        .summary-card.medium { border-left: 4px solid #eab308; }
        .summary-card.info { border-left: 4px solid #22d3ee; }
        .summary-value { font-size: 32px; font-weight: 800; }
        .summary-value.critical { color: #ef4444; }
        .summary-value.high { color: #f97316; }
        .summary-value.medium { color: #eab308; }
        .summary-value.info { color: #22d3ee; }
        .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
        .action-list {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .action-list h3 { color: #166534; font-size: 14px; margin-bottom: 12px; }
        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #dcfce7;
        }
        .action-item:last-child { border-bottom: none; }
        .action-priority {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          color: white;
        }
        .p1 { background: #ef4444; }
        .p2 { background: #f97316; }
        .p3 { background: #eab308; color: #1a1a2e; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 12px;
        }
        th {
          background: #0f172a;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        tr:nth-child(even) { background: #f8fafc; }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          margin-right: 4px;
        }
        .badge-critical { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
        .badge-high { background: #fff7ed; color: #f97316; border: 1px solid #fed7aa; }
        .badge-ransomware { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #64748b;
          text-align: center;
        }
        .no-print { margin-top: 30px; text-align: center; }
        .print-btn {
          background: #22d3ee;
          color: #0f172a;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
        .print-btn:hover { background: #06b6d4; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
          .summary-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media screen and (max-width: 600px) {
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
          .header { flex-direction: column; gap: 16px; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">CVE<span>Pulse</span></div>
          <div class="date">Executive Security Brief • ${dateStr}</div>
        </div>
        <div class="classification">CONFIDENTIAL</div>
      </div>
      
      <h1>Vulnerability Intelligence Summary</h1>
      <p style="color: #64748b; margin-bottom: 20px;">
        Active threats from CISA Known Exploited Vulnerabilities catalog requiring immediate attention.
      </p>
      
      <div class="summary-grid">
        <div class="summary-card critical">
          <div class="summary-value critical">${zeroDays.length}</div>
          <div class="summary-label">Zero-Day (No Patch)</div>
        </div>
        <div class="summary-card high">
          <div class="summary-value high">${overdue.length}</div>
          <div class="summary-label">Overdue</div>
        </div>
        <div class="summary-card medium">
          <div class="summary-value medium">${newThisWeek.length}</div>
          <div class="summary-label">New This Week</div>
        </div>
        <div class="summary-card info">
          <div class="summary-value info">${ransomware.length}</div>
          <div class="summary-label">Ransomware Linked</div>
        </div>
      </div>
      
      <div class="action-list">
        <h3>🎯 Priority Actions Required</h3>
        ${zeroDays.length > 0 ? `
          <div class="action-item">
            <span class="action-priority p1">P1</span>
            <div>
              <strong>BLOCK/ISOLATE:</strong> ${zeroDays.length} zero-day vulnerabilit${zeroDays.length === 1 ? 'y' : 'ies'} without patches
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                ${zeroDays.slice(0, 5).map(v => v.cveID || v.id).join(', ')}${zeroDays.length > 5 ? '...' : ''}
              </div>
            </div>
          </div>
        ` : ''}
        ${overdue.length > 0 ? `
          <div class="action-item">
            <span class="action-priority p1">P1</span>
            <div>
              <strong>ESCALATE:</strong> ${overdue.length} overdue KEV${overdue.length === 1 ? '' : 's'} past CISA deadline
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Federal compliance at risk</div>
            </div>
          </div>
        ` : ''}
        ${ransomware.length > 0 ? `
          <div class="action-item">
            <span class="action-priority p2">P2</span>
            <div>
              <strong>PATCH IMMEDIATELY:</strong> ${ransomware.length} ransomware-linked CVE${ransomware.length === 1 ? '' : 's'}
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Active ransomware campaigns targeting these vulnerabilities</div>
            </div>
          </div>
        ` : ''}
        ${newThisWeek.length > 0 ? `
          <div class="action-item">
            <span class="action-priority p3">P3</span>
            <div>
              <strong>START PATCHING:</strong> ${newThisWeek.length} new KEV${newThisWeek.length === 1 ? '' : 's'} added this week
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Begin remediation within 21 days per CISA directive</div>
            </div>
          </div>
        ` : ''}
        ${zeroDays.length === 0 && overdue.length === 0 && ransomware.length === 0 && newThisWeek.length === 0 ? `
          <div class="action-item">
            <span class="action-priority" style="background: #22c55e;">✓</span>
            <div>
              <strong>ALL CLEAR:</strong> No immediate actions required
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Continue regular patching cadence</div>
            </div>
          </div>
        ` : ''}
      </div>
      
      ${vulnerabilities && vulnerabilities.length > 0 ? `
        <h2>🚨 Critical Vulnerabilities - Immediate Action Required</h2>
        <table>
          <thead>
            <tr>
              <th>CVE ID</th>
              <th>Vendor / Product</th>
              <th>Status</th>
              <th>EPSS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${vulnerabilities.slice(0, 15).map(v => `
              <tr>
                <td><strong>${v.cveID || v.id}</strong></td>
                <td>
                  ${v.vendorProject || 'Unknown'}<br>
                  <span style="color: #64748b; font-size: 11px;">${v.product || ''}</span>
                </td>
                <td>
                  ${v.isZeroDay && !v.patchAvailable ? '<span class="badge badge-critical">Zero-Day</span>' : ''}
                  ${v.daysDue < 0 ? '<span class="badge badge-high">Overdue</span>' : ''}
                  ${v.knownRansomwareCampaignUse === 'Known' ? '<span class="badge badge-ransomware">Ransomware</span>' : ''}
                </td>
                <td>${v.epss ? (v.epss * 100).toFixed(0) + '%' : 'N/A'}</td>
                <td><strong>${v.isZeroDay && !v.patchAvailable ? 'BLOCK' : 'PATCH'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
      
      <div class="footer">
        <p>Generated by CVEPulse • www.cvepulse.com</p>
        <p>Data sources: CISA Known Exploited Vulnerabilities (KEV) Catalog, FIRST EPSS</p>
        <p style="margin-top: 8px;">This report is confidential and intended for internal security team use only.</p>
      </div>
      
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">
          🖨️ Print / Save as PDF
        </button>
        <p style="margin-top: 12px; font-size: 12px; color: #64748b;">
          Use your browser's print function and select "Save as PDF"
        </p>
      </div>
    </body>
    </html>
  `;

  // Open in new window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(reportHTML);
  printWindow.document.close();
};

// Export both the function and a button component
const PDFReportButton = ({ vulnerabilities, stats, className }) => {
  return (
    <button
      onClick={() => generatePDFReport(vulnerabilities, stats)}
      className={className || "px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center gap-2"}
    >
      📄 PDF Report
    </button>
  );
};

export { generatePDFReport, PDFReportButton };
export default PDFReportButton;
