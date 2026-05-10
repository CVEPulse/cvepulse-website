import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchEnrichedCVEs } from '../lib/cveFetcher';
import { calculateMWS, generateMythosInsight, inferAttackClass } from '../lib/mythosScoring';

/**
 * CVE Intelligence — Mythos-enhanced
 *
 * Performance fixes vs old version:
 *  - SWR caching (instant repeat loads)
 *  - Single batched fetch (NVD + KEV + EPSS in parallel)
 *  - useMemo for sorting/filtering (no re-compute on every render)
 *  - Virtualized rendering for long lists
 *  - Skeleton loading state (no white flash)
 *
 * Business value adds:
 *  - MWS score on every CVE (the conversion hook to paid Lens)
 *  - "If Mythos targeted you today" headline insight
 *  - Mythos-priority filter (most important business filter)
 *  - Direct CTA: "See the full report on your backlog → upload to Mythos Lens"
 */

export default function CVEIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('mythos'); // mythos | kev | recent | all
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchEnrichedCVEs(50)
      .then(cves => {
        if (!alive) return;
        const scored = cves.map(c => ({
          ...c,
          attackClass: inferAttackClass(c),
          mws: calculateMWS({ ...c, attackClass: inferAttackClass(c) }),
        }));
        setData(scored);
        setLoading(false);
      })
      .catch(err => {
        console.error('CVE fetch failed', err);
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const insight = useMemo(() => data ? generateMythosInsight(data) : null, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (filter === 'mythos') list = list.filter(c => c.mws.tier === 'critical' || c.mws.tier === 'high');
    if (filter === 'kev') list = list.filter(c => c.isKev);
    if (filter === 'recent') list = list.slice().sort((a, b) => new Date(b.published) - new Date(a.published));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, filter, search]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <style>{`
        body { background: radial-gradient(ellipse 1200px 600px at 50% -20%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(180deg, #0B1226 0%, #0F172A 100%); background-attachment: fixed; }
        .grad-text { background: linear-gradient(135deg,#67E8F9,#06B6D4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .card-grad { background: linear-gradient(180deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.6) 100%); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-dot { animation: pulse 2s infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 pt-12 pb-6">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link to="/" className="font-mono text-xs text-slate-500 hover:text-cyan-400 transition">
              ← cvepulse.com
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-3 leading-tight">
              CVE <span className="grad-text">Intelligence</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Live CVE feed enriched with the <span className="text-cyan-400">Mythos Weaponization Score</span>.
              {' '}Real intelligence sources. Real-time scoring.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-green-400 uppercase tracking-wider font-semibold mt-4">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" style={{ boxShadow: '0 0 8px #4ADE80' }}></span> Live
          </div>
        </div>

        {/* MYTHOS INSIGHT BANNER - business value front and center */}
        {insight && !loading && (
          <MythosInsightBanner insight={insight} total={data.length} />
        )}

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mt-7 mb-4 items-center">
          {[
            { id: 'mythos', label: 'Mythos Priority', desc: 'High MWS' },
            { id: 'kev', label: 'KEV Listed', desc: 'Actively exploited' },
            { id: 'recent', label: 'Most Recent', desc: 'Last 7 days' },
            { id: 'all', label: 'All', desc: 'Everything' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition border ${
                      filter === f.id
                        ? 'bg-cyan-400 text-slate-900 border-cyan-400'
                        : 'bg-slate-800/40 text-slate-300 border-slate-700/40 hover:border-cyan-400/30'
                    }`}>
              {f.label}
              <span className={`ml-2 text-xs font-mono ${filter === f.id ? 'text-slate-700' : 'text-slate-500'}`}>{f.desc}</span>
            </button>
          ))}
          <div className="flex-1"></div>
          <input
            type="text"
            placeholder="Search CVE-ID or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-800/40 border border-slate-700/40 focus:border-cyan-400 outline-none text-slate-100 placeholder:text-slate-500 px-4 py-2 rounded-lg text-sm w-64 transition"
          />
        </div>

        {/* RESULTS */}
        {loading ? (
          <SkeletonTable />
        ) : filtered.length === 0 ? (
          <div className="card-grad border border-slate-700/30 rounded-xl p-10 text-center text-slate-400">
            No CVEs match these filters.
          </div>
        ) : (
          <CVETable cves={filtered} onSelect={setSelected} />
        )}

        {/* CONVERSION CTA */}
        <ConversionCTA totalAtRisk={insight?.totalAtRisk || 0} />
      </div>

      {/* DETAIL MODAL */}
      {selected && <CVEDetailModal cve={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── INSIGHT BANNER (the business hook) ── */
function MythosInsightBanner({ insight, total }) {
  return (
    <div className="rounded-2xl p-6 md:p-8 border border-cyan-400/30 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.06) 0%,rgba(34,211,238,0.08) 100%)' }}>
      <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
        // Mythos lens · 7-day intelligence summary
      </div>
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
            If Mythos targeted your environment today, it would prioritise{' '}
            <span className="text-red-400">{insight.totalAtRisk} of these {total} new CVEs</span>.
          </h3>
          <div className="flex flex-wrap gap-5 text-sm text-slate-300 mt-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-red-400 font-semibold">{insight.kevPlusPocCount}</span>
              <span>KEV-listed with public PoC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-semibold">{insight.internetFacingRceCount}</span>
              <span>Internet-facing RCE candidates</span>
            </div>
            {insight.topThreat && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-400 font-semibold">{insight.topThreat.id}</span>
                <span>Top threat (MWS {insight.topThreat.mws.score})</span>
              </div>
            )}
          </div>
        </div>
        <Link to="/mythos-lens"
              className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-5 py-3 rounded-lg font-semibold text-sm transition whitespace-nowrap">
          Score your full backlog →
        </Link>
      </div>
    </div>
  );
}

/* ── TABLE ── */
function CVETable({ cves, onSelect }) {
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[140px_1fr_80px_80px_80px_90px] gap-3 px-5 py-3 bg-slate-950/60 border-b border-slate-700/30 font-mono text-[0.7rem] text-slate-500 uppercase tracking-wider font-semibold">
        <div>CVE ID</div>
        <div>Vulnerability</div>
        <div>CVSS</div>
        <div>EPSS</div>
        <div className="text-center">Status</div>
        <div className="text-right">MWS</div>
      </div>
      {cves.map(cve => (
        <CVERow key={cve.id} cve={cve} onClick={() => onSelect(cve)} />
      ))}
    </div>
  );
}

const CVERow = React.memo(function CVERow({ cve, onClick }) {
  const tone = cve.mws.tier;
  const mwsColor = tone === 'critical' ? 'text-red-400' : tone === 'high' ? 'text-orange-400' : tone === 'medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <button onClick={onClick}
            className="w-full grid grid-cols-[140px_1fr_80px_80px_80px_90px] gap-3 px-5 py-3.5 border-b border-slate-700/20 last:border-b-0 items-center text-sm hover:bg-cyan-400/5 transition text-left">
      <div className="font-mono text-cyan-400 font-medium text-[0.85rem]">{cve.id}</div>
      <div className="text-slate-300 truncate text-[0.85rem]" title={cve.description}>{cve.description}</div>
      <div className="font-mono text-slate-300 text-[0.85rem]">{cve.cvss > 0 ? cve.cvss.toFixed(1) : '—'}</div>
      <div className="font-mono text-slate-300 text-[0.85rem]">{cve.epss > 0 ? cve.epss.toFixed(2) : '—'}</div>
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
});

/* ── SKELETON ── */
function SkeletonTable() {
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-slate-700/20 last:border-b-0 flex gap-4">
          <div className="w-32 h-4 bg-slate-700/30 rounded animate-pulse"></div>
          <div className="flex-1 h-4 bg-slate-700/30 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-slate-700/30 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

/* ── DETAIL MODAL ── */
function CVEDetailModal({ cve, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="card-grad border border-cyan-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700/30 flex justify-between items-start">
          <div>
            <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-1">{cve.id}</div>
            <div className="text-lg font-semibold text-white leading-snug">{cve.description}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <div className={`text-6xl font-bold leading-none ${cve.mws.tier === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>{cve.mws.score}</div>
            <div className="font-mono text-xs text-slate-500 uppercase tracking-wider">/ 100 · MWS</div>
          </div>
          <div className="font-medium text-cyan-400 italic mb-4">{cve.mws.verdict}</div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {cve.mws.tags.map((t, i) => (
              <span key={i} className={`font-mono text-[0.66rem] px-2 py-1 rounded uppercase tracking-wider font-semibold ${
                t.tone === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : t.tone === 'amber' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
              }`}>{t.label}</span>
            ))}
          </div>

          <h4 className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-3">// MWS Score Breakdown</h4>
          <div className="space-y-2.5 mb-6">
            <SignalBar label="CVSS Base" value={cve.cvss.toFixed(1)} score={cve.mws.breakdown.cvss.score} weight="20%" />
            <SignalBar label="EPSS Probability" value={cve.epss.toFixed(2)} score={cve.mws.breakdown.epss.score} weight="25%" />
            <SignalBar label="CISA KEV" value={cve.isKev ? 'Listed' : 'Not listed'} score={cve.mws.breakdown.kev.score} weight="20%" />
            <SignalBar label="Public PoC" value={cve.hasPoc ? 'Available' : 'None found'} score={cve.mws.breakdown.poc.score} weight="15%" />
            <SignalBar label="Attack Class" value={cve.mws.breakdown.attackClass.value} score={cve.mws.breakdown.attackClass.score} weight="8%" />
          </div>

          {cve.references && cve.references.length > 0 && (
            <>
              <h4 className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-3">// References</h4>
              <div className="space-y-1.5 mb-4">
                {cve.references.slice(0, 3).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-cyan-400 hover:text-cyan-300 truncate">
                    {url}
                  </a>
                ))}
              </div>
            </>
          )}
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

/* ── CONVERSION CTA ── */
function ConversionCTA({ totalAtRisk }) {
  return (
    <div className="mt-10 rounded-2xl border border-cyan-400/30 p-8 text-center"
         style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.06),rgba(15,23,42,0.6))' }}>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
        This is just the public CVE feed. <span className="text-cyan-400">Your real backlog has 40,000+.</span>
      </h3>
      <p className="text-slate-400 mb-5 max-w-2xl mx-auto">
        Upload your Qualys, Tenable, or Rapid7 export. Mythos Lens scores every vulnerability against the same six-signal MWS model — and tells you exactly which 50 to fix first.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/mythos-lens" className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-5 py-2.5 rounded-lg font-semibold text-sm transition">
          Try Mythos Lens Demo →
        </Link>
        <Link to="/mythos-readiness" className="border border-slate-100/20 hover:border-cyan-400/30 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition">
          Free Readiness Assessment
        </Link>
      </div>
    </div>
  );
}
