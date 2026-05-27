import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchEnrichedKEV } from '../lib/cveFetcher';
import { calculateMWS, inferAttackClass } from '../lib/mythosScoring';

/**
 * KEV Tracker - CISA Known Exploited Vulnerabilities
 *
 * Mythos overlay: every KEV-listed CVE is by definition exploited by humans.
 * The MWS overlay tells you which ones are MOST attractive to autonomous AI -
 * i.e. which KEV entries Mythos would weaponize next, before humans do at scale.
 */

export default function KEVTracker() {
  const [kev, setKev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('mythos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    fetchEnrichedKEV()
      .then(data => {
        if (!alive) return;
        const scored = data.vulnerabilities.map(v => {
          const attackClass = inferAttackClass({ description: v.description });
          return {
            ...v,
            attackClass,
            mws: calculateMWS({ ...v, attackClass }),
          };
        }).sort((a, b) => b.mws.score - a.mws.score);
        setKev({ ...data, vulnerabilities: scored });
        setLoading(false);
      })
      .catch(err => {
        console.error('KEV fetch failed', err);
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!kev) return [];
    let list = kev.vulnerabilities;
    if (filter === 'mythos') list = list.filter(v => v.mws.score >= 75);
    else if (filter === 'recent') {
      list = list.slice().sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    } else if (filter === 'ransomware') list = list.filter(v => v.ransomwareUse);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.vendor.toLowerCase().includes(q) ||
        v.product.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 50);
  }, [kev, filter, search]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-12">
        <Link to="/" className="font-mono text-xs text-slate-500 hover:text-cyan-400 transition">
          ← cvepulse.com
        </Link>
        <div className="flex justify-between items-start mt-3 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              KEV <span className="grad-text">Tracker</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              CISA Known Exploited Vulnerabilities — ranked by{' '}
              <span className="text-cyan-400">Mythos affinity</span>, not just date added.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-green-400 uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" style={{ boxShadow: '0 0 8px #4ADE80' }}></span> Live · CISA upstream
          </div>
        </div>

        {!loading && kev && <KEVInsight kev={kev} />}

        {/* STATS BAR */}
        {!loading && kev && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <StatCard label="Total KEV" val={kev.count} sub={`v${kev.catalogVersion}`} />
            <StatCard label="High Mythos affinity" val={kev.vulnerabilities.filter(v => v.mws.score >= 80).length} sub="MWS ≥ 80" tone="red" />
            <StatCard label="Ransomware-linked" val={kev.vulnerabilities.filter(v => v.ransomwareUse).length} sub="CISA confirmed" tone="amber" />
            <StatCard label="RCE class" val={kev.vulnerabilities.filter(v => v.attackClass === 'RCE').length} sub="Top Mythos target" tone="cyan" />
          </div>
        )}

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mt-7 mb-4 items-center">
          {[
            { id: 'mythos', label: 'Mythos Priority', desc: 'MWS ≥ 75' },
            { id: 'recent', label: 'Recently Added', desc: 'By CISA date' },
            { id: 'ransomware', label: 'Ransomware Use', desc: 'Confirmed' },
            { id: 'all', label: 'All KEV', desc: 'Full catalog' },
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
            placeholder="Search vendor, product, CVE..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-800/40 border border-slate-700/40 focus:border-cyan-400 outline-none text-slate-100 placeholder:text-slate-500 px-4 py-2 rounded-lg text-sm w-64 transition"
          />
        </div>

        {/* RESULTS */}
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <div className="card-grad border border-slate-700/30 rounded-xl p-10 text-center text-slate-400">
            No KEV entries match these filters.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {filtered.map(v => <KEVCard key={v.id} v={v} />)}
          </div>
        )}

        <ConversionCTA count={kev?.vulnerabilities.filter(v => v.mws.score >= 75).length || 0} />
      </div>
    </div>
  );
}

function KEVInsight({ kev }) {
  const high = kev.vulnerabilities.filter(v => v.mws.score >= 80).length;
  const ransomware = kev.vulnerabilities.filter(v => v.ransomwareUse).length;
  const rce = kev.vulnerabilities.filter(v => v.attackClass === 'RCE').length;

  return (
    <div className="rounded-2xl p-6 md:p-8 border border-red-500/20 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.08) 0%,rgba(34,211,238,0.06) 100%)' }}>
      <div className="font-mono text-xs text-red-400 uppercase tracking-wider mb-2 font-semibold">
        // KEV × Mythos · Active exploit overlay
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
        Of <span className="text-red-400">{kev.count}</span> actively-exploited CVEs,{' '}
        <span className="text-amber-400">{high}</span> are Mythos-class targets.
      </h3>
      <p className="text-slate-300 leading-relaxed max-w-3xl">
        Every KEV entry is being exploited by humans <em className="text-slate-200 not-italic">today</em>.
        The ones with high MWS scores are the next wave — vulnerabilities Mythos can weaponize
        autonomously, at scale, faster than any threat actor crew can. {rce} are RCE-class.
        {' '}{ransomware} are linked to active ransomware campaigns.
      </p>
    </div>
  );
}

function StatCard({ label, val, sub, tone }) {
  const valColor = tone === 'red' ? 'text-red-400' : tone === 'amber' ? 'text-amber-400' : tone === 'cyan' ? 'text-cyan-400' : 'text-white';
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl p-4">
      <div className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-bold leading-none ${valColor}`}>{val}</div>
      <div className="font-mono text-[0.65rem] text-slate-500 mt-1.5">{sub}</div>
    </div>
  );
}

function KEVCard({ v }) {
  const tone = v.mws.tier;
  const mwsColor = tone === 'critical' ? 'text-red-400' : tone === 'high' ? 'text-orange-400' : 'text-amber-400';
  const dateAdded = new Date(v.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const dueDate = new Date(v.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="card-grad border border-slate-700/30 hover:border-cyan-400/30 rounded-xl p-5 transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-mono text-cyan-400 font-medium text-sm">{v.id}</div>
          <div className="text-xs text-slate-500 mt-0.5">{v.vendor} · {v.product}</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold font-mono leading-none ${mwsColor}`}>{v.mws.score}</div>
          <div className="font-mono text-[0.6rem] text-slate-500 uppercase tracking-wider mt-0.5">MWS</div>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white mb-1.5 leading-snug">{v.name}</h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{v.description}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {v.attackClass !== 'UNKNOWN' && (
          <span className={`font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
            v.attackClass === 'RCE' || v.attackClass === 'AUTH_BYPASS'
              ? 'bg-red-500/12 text-red-400 border border-red-500/25'
              : 'bg-amber-500/12 text-amber-400 border border-amber-500/25'
          }`}>{v.attackClass.replace('_', ' ')}</span>
        )}
        {v.ransomwareUse && (
          <span className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold bg-red-500/12 text-red-400 border border-red-500/25">
            Ransomware
          </span>
        )}
        {v.epss > 0.8 && (
          <span className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold bg-amber-500/12 text-amber-400 border border-amber-500/25">
            EPSS {v.epss.toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex justify-between text-[0.7rem] font-mono text-slate-500 pt-3 border-t border-slate-700/30">
        <span>Added: <span className="text-slate-300">{dateAdded}</span></span>
        <span>FCEB Due: <span className="text-slate-300">{dueDate}</span></span>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-3 mt-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card-grad border border-slate-700/30 rounded-xl p-5 h-44 animate-pulse">
          <div className="h-4 w-32 bg-slate-700/30 rounded mb-3"></div>
          <div className="h-3 w-full bg-slate-700/30 rounded mb-2"></div>
          <div className="h-3 w-3/4 bg-slate-700/30 rounded"></div>
        </div>
      ))}
    </div>
  );
}

function ConversionCTA({ count }) {
  return (
    <div className="mt-10 rounded-2xl border border-cyan-400/30 p-8 text-center"
         style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.06),rgba(15,23,42,0.6))' }}>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
        KEV gives you {count}+ Mythos targets to track. <span className="text-cyan-400">Your scanner shows 40,000+.</span>
      </h3>
      <p className="text-slate-400 mb-5 max-w-2xl mx-auto">
        Mythos Lens applies this same MWS scoring to your full backlog — including non-KEV CVEs that
        Mythos would still target first based on EPSS, PoC, and exposure signals.
      </p>
      <Link to="/mythos-lens" className="inline-block bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-5 py-2.5 rounded-lg font-semibold text-sm transition">
        Try Mythos Lens Demo →
      </Link>
    </div>
  );
}
