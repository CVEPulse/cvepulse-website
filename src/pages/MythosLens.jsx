import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchIntelligence } from '../lib/cveFetcher';

/**
 * Mythos Lens — CSV upload + MWS scoring engine
 *
 * Free demo: LIVE CISA KEV catalog scored server-side (real, current data)
 * Paid: real CSV upload from Qualys / Tenable / Rapid7
 *
 * Browser-only execution for uploads — no data leaves the device.
 */

export default function MythosLens() {
  const [mode, setMode] = useState('demo'); // demo | upload | results
  const [cves, setCves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoError, setDemoError] = useState(null);

  const loadDemo = useCallback(async () => {
    setLoadingDemo(true);
    setDemoError(null);
    try {
      // Server-side endpoint returns pre-scored, pre-sorted CISA KEV data
      const data = await fetchIntelligence();
      const cvesWithAsset = (data.scored || []).map(c => ({
        ...c,
        asset: `${c.vendor} · ${c.product}`,
      }));
      setCves(cvesWithAsset);
      setMode('results');
    } catch (err) {
      console.error('Demo load failed', err);
      setDemoError('Could not load live KEV data right now. Please try again in a moment.');
    } finally {
      setLoadingDemo(false);
    }
  }, []);

  const handleFile = useCallback(async (file) => {
    setUploadError(null);
    setUploading(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setUploadError('No CVE rows detected. Make sure your CSV has a CVE-ID column.');
        setUploading(false);
        return;
      }
      // Upload triggers paywall
      setShowPaywall(true);
      setUploading(false);
    } catch (err) {
      setUploadError(err.message || 'Failed to parse file.');
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const filtered = useMemo(() => {
    let list = cves;
    if (filter === 'critical') list = list.filter(c => c.mws.score >= 85);
    else if (filter === 'kev') list = list.filter(c => c.isKev);
    else if (filter === 'edge') list = list.filter(c => c.isInternetFacing);
    else if (filter === 'poc') list = list.filter(c => c.hasPoc);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.asset || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [cves, filter, search]);

  const stats = useMemo(() => {
    if (cves.length === 0) return null;
    return {
      total: cves.length,
      critical: cves.filter(c => c.mws.score >= 85).length,
      high: cves.filter(c => c.mws.score >= 70 && c.mws.score < 85).length,
      kev: cves.filter(c => c.isKev).length,
      edge: cves.filter(c => c.isInternetFacing).length,
      avgMws: Math.round(cves.reduce((a, c) => a + c.mws.score, 0) / cves.length),
    };
  }, [cves]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-12">
        <Link to="/mythos-defense" className="font-mono text-xs text-slate-500 hover:text-cyan-400 transition">
          ← Mythos Defense
        </Link>
        <div className="flex justify-between items-start mt-3 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Mythos <span className="grad-text">Lens.</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg max-w-2xl">
              Score your full vulnerability backlog with the Mythos Weaponization Score —
              <span className="text-cyan-400"> browser-only, no data leaves your device.</span>
            </p>
          </div>
        </div>

        {mode === 'demo' && <ModeSelector onDemo={loadDemo} onUpload={() => setMode('upload')}
                                          loadingDemo={loadingDemo} demoError={demoError} />}

        {mode === 'upload' && (
          <UploadZone onFile={handleFile} onDrop={onDrop} onDemoFallback={loadDemo}
                      uploadError={uploadError} uploading={uploading} onBack={() => setMode('demo')} />
        )}

        {mode === 'results' && stats && (
          <>
            <ResultsHeader stats={stats} onReset={() => { setCves([]); setMode('demo'); }} />
            <FiltersBar filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
            <ResultsTable cves={filtered} onSelect={setSelected} />
            <ExportBar cves={filtered} onExport={(fmt) => exportCves(filtered, fmt)} />
          </>
        )}

        {selected && <DetailModal cve={selected} onClose={() => setSelected(null)} />}
        {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      </div>
    </div>
  );
}

/* ── MODE SELECTOR ── */
function ModeSelector({ onDemo, onUpload, loadingDemo, demoError }) {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-5 mt-4">
        <button onClick={onDemo} disabled={loadingDemo}
                className="card-grad border border-cyan-400/30 hover:border-cyan-400/50 rounded-2xl p-8 text-left transition group hover:bg-cyan-400/5 disabled:opacity-60 disabled:cursor-wait">
          <div className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wider font-semibold mb-4 px-2 py-0.5 rounded text-green-400 bg-green-500/10 border border-green-500/25">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Free · Live CISA KEV data
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Score the live KEV catalog</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Fetches the 30 most recently-added CISA Known Exploited Vulnerabilities — current, real data — and
            scores each one with the full MWS engine. See the Lens output against actual threats your team
            is dealing with right now.
          </p>
          <span className="inline-flex items-center gap-2 text-cyan-400 font-semibold text-sm group-hover:translate-x-1 transition">
            {loadingDemo ? 'Loading live KEV data...' : 'Run Live Demo →'}
          </span>
        </button>

        <button onClick={onUpload}
                className="card-grad border border-slate-700/30 hover:border-cyan-400/30 rounded-2xl p-8 text-left transition group">
          <div className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wider font-semibold mb-4 px-2 py-0.5 rounded text-cyan-400 bg-cyan-400/10 border border-cyan-400/25">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Paid · Real backlog
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Upload Your CSV</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Drop a Qualys, Tenable, or Rapid7 export. Every CVE scored with the full MWS engine.
            Browser-only — your scanner data never leaves your device.
          </p>
          <span className="inline-flex items-center gap-2 text-cyan-400 font-semibold text-sm group-hover:translate-x-1 transition">
            Upload CSV →
          </span>
        </button>
      </div>
      {demoError && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {demoError}
        </div>
      )}
    </div>
  );
}

/* ── UPLOAD ── */
function UploadZone({ onFile, onDrop, onDemoFallback, uploadError, uploading, onBack }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="mt-4">
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-cyan-400 transition mb-4">
        ← Back
      </button>

      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
           onDragLeave={() => setDragOver(false)}
           onDrop={e => { setDragOver(false); onDrop(e); }}
           className={`card-grad rounded-2xl border-2 border-dashed p-16 text-center transition ${
             dragOver ? 'border-cyan-400 bg-cyan-400/5' : 'border-slate-600/40'
           }`}>
        <div className="text-6xl mb-4">📂</div>
        <h3 className="text-2xl font-bold text-white mb-2">Drop your CSV here</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Qualys, Tenable, Rapid7, or any CSV with a CVE-ID column. Files stay in your browser.
        </p>
        <label className="inline-block cursor-pointer">
          <input type="file" accept=".csv,text/csv" className="hidden"
                 onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
          <span className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition inline-block">
            {uploading ? 'Processing...' : 'Choose File'}
          </span>
        </label>

        {uploadError && (
          <div className="mt-5 inline-block px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {uploadError}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-slate-500">
        Just want to see what it looks like?{' '}
        <button onClick={onDemoFallback} className="text-cyan-400 hover:text-cyan-300 font-medium underline">
          Load demo dataset instead
        </button>
      </div>
    </div>
  );
}

/* ── RESULTS HEADER ── */
function ResultsHeader({ stats, onReset }) {
  return (
    <>
      <div className="rounded-2xl p-6 md:p-8 border border-cyan-400/30 mt-4 mb-6"
           style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.06) 0%,rgba(34,211,238,0.08) 100%)' }}>
        <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
          // Mythos Lens · Backlog analysis
        </div>
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
              Of <span className="text-white">{stats.total}</span> CVEs in your backlog,
              {' '}<span className="text-red-400">{stats.critical}</span> are Mythos-class targets.
            </h3>
            <p className="text-slate-300 leading-relaxed">
              These are the CVEs Mythos would weaponise first — score 85+, KEV-listed, public PoC,
              or internet-facing RCE. Fix these before anything else.
            </p>
          </div>
          <button onClick={onReset}
                  className="text-sm text-slate-400 hover:text-cyan-400 transition border border-slate-700/40 hover:border-cyan-400/30 px-4 py-2 rounded-lg whitespace-nowrap">
            Reset / new upload
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatTile label="Total CVEs" val={stats.total} />
        <StatTile label="MWS ≥ 85" val={stats.critical} tone="red" />
        <StatTile label="MWS 70–84" val={stats.high} tone="amber" />
        <StatTile label="KEV listed" val={stats.kev} tone="red" />
        <StatTile label="Internet-facing" val={stats.edge} tone="cyan" />
      </div>
    </>
  );
}

function StatTile({ label, val, tone }) {
  const valColor = tone === 'red' ? 'text-red-400' : tone === 'amber' ? 'text-amber-400' : tone === 'cyan' ? 'text-cyan-400' : 'text-white';
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl p-4">
      <div className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-wider mb-1.5">{label}</div>
      <div className={`text-3xl font-bold leading-none ${valColor}`}>{val}</div>
    </div>
  );
}

/* ── FILTERS ── */
function FiltersBar({ filter, setFilter, search, setSearch }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {[
        { id: 'all', label: 'All', desc: '' },
        { id: 'critical', label: 'MWS ≥ 85', desc: 'Mythos targets' },
        { id: 'kev', label: 'KEV', desc: 'Actively exploited' },
        { id: 'edge', label: 'Internet-facing', desc: 'Edge first' },
        { id: 'poc', label: 'PoC public', desc: 'Working exploit' },
      ].map(f => (
        <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition border ${
                  filter === f.id
                    ? 'bg-cyan-400 text-slate-900 border-cyan-400'
                    : 'bg-slate-800/40 text-slate-300 border-slate-700/40 hover:border-cyan-400/30'
                }`}>
          {f.label}
          {f.desc && <span className={`ml-2 text-xs font-mono ${filter === f.id ? 'text-slate-700' : 'text-slate-500'}`}>{f.desc}</span>}
        </button>
      ))}
      <div className="flex-1"></div>
      <input
        type="text"
        placeholder="Search CVE / asset / description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-slate-800/40 border border-slate-700/40 focus:border-cyan-400 outline-none text-slate-100 placeholder:text-slate-500 px-4 py-2 rounded-lg text-sm w-72 transition"
      />
    </div>
  );
}

/* ── RESULTS TABLE ── */
function ResultsTable({ cves, onSelect }) {
  if (cves.length === 0) {
    return (
      <div className="card-grad border border-slate-700/30 rounded-xl p-10 text-center text-slate-400">
        No CVEs match the current filters.
      </div>
    );
  }
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[140px_1fr_140px_70px_80px_70px] gap-3 px-5 py-3 bg-slate-950/60 border-b border-slate-700/30 font-mono text-[0.7rem] text-slate-500 uppercase tracking-wider font-semibold">
        <div>CVE ID</div>
        <div>Vulnerability</div>
        <div>Asset</div>
        <div>EPSS</div>
        <div className="text-center">Status</div>
        <div className="text-right">MWS</div>
      </div>
      {cves.map(cve => {
        const tone = cve.mws.tier;
        const mwsColor = tone === 'critical' ? 'text-red-400' : tone === 'high' ? 'text-orange-400' : tone === 'medium' ? 'text-amber-400' : 'text-slate-400';
        return (
          <button key={cve.id} onClick={() => onSelect(cve)}
                  className="w-full grid grid-cols-[140px_1fr_140px_70px_80px_70px] gap-3 px-5 py-3.5 border-b border-slate-700/20 last:border-b-0 items-center text-sm hover:bg-cyan-400/5 transition text-left">
            <div className="font-mono text-cyan-400 font-medium text-[0.85rem]">{cve.id}</div>
            <div className="text-slate-300 truncate" title={cve.description}>{cve.description}</div>
            <div className="font-mono text-slate-400 text-xs truncate">{cve.asset || '—'}</div>
            <div className="font-mono text-slate-300 text-[0.85rem]">{cve.epss.toFixed(2)}</div>
            <div className="text-center">
              {cve.isKev ? (
                <span className="inline-block px-2 py-0.5 rounded font-mono text-[0.62rem] font-semibold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">KEV</span>
              ) : cve.hasPoc ? (
                <span className="inline-block px-2 py-0.5 rounded font-mono text-[0.62rem] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">PoC</span>
              ) : (
                <span className="text-slate-600 text-xs">—</span>
              )}
            </div>
            <div className={`font-mono font-bold text-right text-[0.95rem] ${mwsColor}`}>{cve.mws.score}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ── DETAIL MODAL ── */
function DetailModal({ cve, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="card-grad border border-cyan-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700/30 flex justify-between items-start gap-4">
          <div>
            <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-1">{cve.id}</div>
            <div className="text-lg font-semibold text-white leading-snug">{cve.description}</div>
            {cve.asset && <div className="font-mono text-xs text-slate-500 mt-2">Asset: {cve.asset}</div>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <div className={`text-6xl font-bold leading-none ${cve.mws.tier === 'critical' ? 'text-red-400' : cve.mws.tier === 'high' ? 'text-orange-400' : 'text-amber-400'}`}>
              {cve.mws.score}
            </div>
            <div className="font-mono text-xs text-slate-500 uppercase tracking-wider">/ 100 · MWS</div>
          </div>
          <div className="font-medium text-cyan-400 italic mb-4">{cve.mws.verdict}</div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {cve.mws.tags.map((t, i) => (
              <span key={i} className={`font-mono text-[0.66rem] px-2 py-1 rounded uppercase tracking-wider font-semibold border ${
                t.tone === 'red' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : t.tone === 'amber' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
              }`}>{t.label}</span>
            ))}
          </div>

          <h4 className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-3">// MWS Breakdown</h4>
          <div className="space-y-2.5 mb-6">
            <SignalBar label="CVSS Base" value={cve.cvss.toFixed(1)} score={cve.mws.breakdown.cvss.score} weight="20%" />
            <SignalBar label="EPSS" value={cve.epss.toFixed(2)} score={cve.mws.breakdown.epss.score} weight="25%" />
            <SignalBar label="CISA KEV" value={cve.isKev ? 'Listed' : 'Not listed'} score={cve.mws.breakdown.kev.score} weight="20%" />
            <SignalBar label="Public PoC" value={cve.hasPoc ? 'Available' : 'None'} score={cve.mws.breakdown.poc.score} weight="15%" />
            <SignalBar label="Exposure" value={cve.isInternetFacing ? 'Internet-facing' : 'Internal only'} score={cve.mws.breakdown.exposure.score} weight="12%" />
            <SignalBar label="Attack Class" value={cve.mws.breakdown.attackClass.value} score={cve.mws.breakdown.attackClass.score} weight="8%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalBar({ label, value, score, weight }) {
  return (
    <div>
      <div className="flex justify-between items-baseline text-xs mb-1">
        <span className="text-slate-300 font-medium">{label} <span className="text-slate-500 font-mono">· {weight}</span></span>
        <span className="font-mono text-slate-300">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-700/40 rounded overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded transition-all"
             style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}

/* ── EXPORT BAR ── */
function ExportBar({ cves, onExport }) {
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl p-5 mt-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-1 font-semibold">// Export {cves.length} CVEs</div>
        <div className="text-sm text-slate-400">Take this prioritised list straight to Jira, ServiceNow, or your CISO.</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onExport('csv')}
                className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
          CSV
        </button>
        <button onClick={() => onExport('json')}
                className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
          JSON
        </button>
        <button onClick={() => onExport('markdown')}
                className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
          Markdown
        </button>
        <button onClick={() => window.print()}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-900 rounded-lg text-sm font-semibold transition">
          Print / PDF
        </button>
      </div>
    </div>
  );
}

/* ── PAYWALL ── */
function Paywall({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="card-grad border border-cyan-400/30 rounded-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-3xl mx-auto mb-5">🔒</div>
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Real uploads require a plan</h3>
        <p className="text-slate-400 mb-6 leading-relaxed">
          Demo data is free forever. Real CSV uploads from your scanner data require a Mythos Lens
          subscription — fair pricing, no enterprise floor.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link to="/pricing" className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-5 py-3 rounded-lg font-semibold transition">
            See Pricing →
          </Link>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-cyan-400 transition py-2">
            Continue with demo data
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HELPERS ── */
function parseCSV(text) {
  // Simple CSV parser - handles common Qualys/Tenable/Rapid7 formats
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const cveCol = header.findIndex(h => h.includes('cve') || h.includes('id'));
  if (cveCol === -1) throw new Error('No CVE-ID column detected. Expected a column named "CVE", "CVE-ID", or similar.');

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
    return { id: cols[cveCol], raw: cols };
  }).filter(c => /^CVE-\d{4}-\d+$/i.test(c.id));
}

function exportCves(cves, format) {
  if (format === 'csv') {
    const rows = [
      ['CVE-ID', 'Description', 'Asset', 'CVSS', 'EPSS', 'KEV', 'PoC', 'Internet-facing', 'Attack Class', 'MWS', 'Verdict'],
      ...cves.map(c => [
        c.id, `"${c.description.replace(/"/g, "''")}"`, c.asset || '',
        c.cvss, c.epss, c.isKev ? 'YES' : '', c.hasPoc ? 'YES' : '',
        c.isInternetFacing ? 'YES' : '', c.mws.breakdown.attackClass.value,
        c.mws.score, `"${c.mws.verdict}"`,
      ]),
    ];
    download('mythos-lens-export.csv', rows.map(r => r.join(',')).join('\n'), 'text/csv');
  }
  if (format === 'json') {
    download('mythos-lens-export.json', JSON.stringify(cves, null, 2), 'application/json');
  }
  if (format === 'markdown') {
    const md = [
      '# Mythos Lens — Prioritised CVE Backlog',
      '',
      `Total: **${cves.length}** | Generated: ${new Date().toISOString()}`,
      '',
      '| CVE | Asset | MWS | KEV | EPSS | Verdict |',
      '|-----|-------|-----|-----|------|---------|',
      ...cves.map(c => `| ${c.id} | ${c.asset || '—'} | **${c.mws.score}** | ${c.isKev ? '✓' : '—'} | ${c.epss.toFixed(2)} | ${c.mws.verdict} |`),
    ].join('\n');
    download('mythos-lens-export.md', md, 'text/markdown');
  }
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
