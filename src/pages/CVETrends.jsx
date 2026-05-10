import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchEnrichedCVEs } from '../lib/cveFetcher';
import { calculateMWS, inferAttackClass } from '../lib/mythosScoring';

/**
 * CVE Trends - what's gaining momentum, with Mythos overlay
 *
 * Key insight: a CVE can be "trending" because of social hype but
 * have low actual Mythos affinity, OR be quietly explosive (high MWS, no buzz yet).
 * The Mythos overlay reveals which trending CVEs are also AI-attractive.
 */

const HYPE_BUCKETS = [
  { id: 'rising', label: 'Rising Fast', desc: 'High EPSS recently' },
  { id: 'mythos', label: 'AI-Magnetic', desc: 'High MWS · trending' },
  { id: 'quiet', label: 'Quiet Threat', desc: 'High MWS · low buzz' },
  { id: 'all', label: 'All Trending', desc: 'Full feed' },
];

export default function CVETrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState('mythos');

  useEffect(() => {
    let alive = true;
    fetchEnrichedCVEs(100)
      .then(cves => {
        if (!alive) return;
        // Calculate "hype score" - simplified: epss * (recency factor) * (poc availability)
        const enriched = cves.map(c => {
          const ageDays = Math.max(1, (Date.now() - new Date(c.published).getTime()) / (1000 * 60 * 60 * 24));
          const recency = Math.max(0.1, Math.min(1, 7 / ageDays));
          const hype = Math.round((c.epss * 70 + (c.hasPoc ? 20 : 0) + (c.isKev ? 10 : 0)) * recency);
          const attackClass = inferAttackClass(c);
          return {
            ...c,
            attackClass,
            hype,
            mws: calculateMWS({ ...c, attackClass }),
          };
        }).sort((a, b) => b.hype - a.hype);
        setData(enriched);
        setLoading(false);
      })
      .catch(err => {
        console.error('Trends fetch failed', err);
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (bucket === 'rising') return data.filter(c => c.hype >= 60).slice(0, 30);
    if (bucket === 'mythos') return data.filter(c => c.mws.score >= 70 && c.hype >= 40).slice(0, 30);
    if (bucket === 'quiet') return data.filter(c => c.mws.score >= 75 && c.hype < 50).slice(0, 30);
    return data.slice(0, 50);
  }, [data, bucket]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <style>{`
        body { background: radial-gradient(ellipse 1200px 600px at 50% -20%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(180deg, #0B1226 0%, #0F172A 100%); background-attachment: fixed; }
        .grad-text { background: linear-gradient(135deg,#67E8F9,#06B6D4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .card-grad { background: linear-gradient(180deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.6) 100%); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-dot { animation: pulse 2s infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 pt-12 pb-12">
        {/* HEADER */}
        <Link to="/" className="font-mono text-xs text-slate-500 hover:text-cyan-400 transition">
          ← cvepulse.com
        </Link>
        <div className="flex justify-between items-start mt-3 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              CVE <span className="grad-text">Trends</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              What's gaining momentum — cross-referenced with{' '}
              <span className="text-cyan-400">Mythos affinity</span> to separate noise from signal.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-green-400 uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" style={{ boxShadow: '0 0 8px #4ADE80' }}></span> Live
          </div>
        </div>

        {/* INSIGHT */}
        {!loading && data && <TrendsInsight data={data} />}

        {/* BUCKET FILTER */}
        <div className="flex flex-wrap gap-2 mt-8 mb-4">
          {HYPE_BUCKETS.map(b => (
            <button key={b.id} onClick={() => setBucket(b.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition border ${
                      bucket === b.id
                        ? 'bg-cyan-400 text-slate-900 border-cyan-400'
                        : 'bg-slate-800/40 text-slate-300 border-slate-700/40 hover:border-cyan-400/30'
                    }`}>
              {b.label}
              <span className={`ml-2 text-xs font-mono ${bucket === b.id ? 'text-slate-700' : 'text-slate-500'}`}>{b.desc}</span>
            </button>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-grad border border-slate-700/30 rounded-xl p-6 h-48 animate-pulse">
                <div className="h-4 w-24 bg-slate-700/30 rounded mb-3"></div>
                <div className="h-3 w-full bg-slate-700/30 rounded mb-2"></div>
                <div className="h-3 w-3/4 bg-slate-700/30 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filtered.map(cve => <TrendCard key={cve.id} cve={cve} />)}
          </div>
        )}

        {/* CONVERSION */}
        <ConversionCTA />
      </div>
    </div>
  );
}

function TrendsInsight({ data }) {
  const aiMagnetic = data.filter(c => c.mws.score >= 70 && c.hype >= 40).length;
  const quietThreats = data.filter(c => c.mws.score >= 75 && c.hype < 50).length;
  const topThreat = data.find(c => c.mws.score >= 80);

  return (
    <div className="rounded-2xl p-6 md:p-8 border border-cyan-400/30 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.06) 0%,rgba(34,211,238,0.08) 100%)' }}>
      <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
        // Hype × Mythos · Why this matters
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
        <span className="text-red-400">{aiMagnetic} CVEs</span> are both trending and AI-magnetic.
        {quietThreats > 0 && <> Plus <span className="text-amber-400">{quietThreats}</span> quiet threats nobody's watching.</>}
      </h3>
      <p className="text-slate-300 leading-relaxed max-w-3xl">
        Hype is a lagging indicator. Mythos affinity is leading. The CVEs that hurt you most are
        often the ones with high Mythos scores and <em className="text-slate-200 not-italic">low</em> social buzz —
        because attackers find them before defenders do.
      </p>
      {topThreat && (
        <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-950/40 border border-slate-700/40">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Top Mythos threat:</span>
          <span className="font-mono text-cyan-400 font-semibold">{topThreat.id}</span>
          <span className="text-red-400 font-mono font-bold">MWS {topThreat.mws.score}</span>
        </div>
      )}
    </div>
  );
}

function TrendCard({ cve }) {
  const tone = cve.mws.tier;
  const mwsColor = tone === 'critical' ? 'text-red-400' : tone === 'high' ? 'text-orange-400' : tone === 'medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="card-grad border border-slate-700/30 hover:border-cyan-400/30 rounded-xl p-5 transition group">
      <div className="flex justify-between items-start mb-3">
        <span className="font-mono text-cyan-400 font-medium text-sm">{cve.id}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-wider">Hype</span>
          <span className="font-mono text-sm font-bold text-amber-400">{cve.hype}</span>
        </div>
      </div>
      <p className="text-sm text-slate-200 leading-snug mb-4 line-clamp-2 min-h-[2.5rem]">{cve.description}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {cve.mws.tags.slice(0, 3).map((t, i) => (
          <span key={i} className={`font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
            t.tone === 'red' ? 'bg-red-500/12 text-red-400 border border-red-500/25'
              : t.tone === 'amber' ? 'bg-amber-500/12 text-amber-400 border border-amber-500/25'
              : 'bg-cyan-400/8 text-cyan-400 border border-cyan-400/25'
          }`}>{t.label}</span>
        ))}
      </div>

      <div className="flex justify-between items-end pt-3 border-t border-slate-700/30">
        <div>
          <div className="font-mono text-[0.62rem] text-slate-500 uppercase tracking-wider">Mythos Score</div>
          <div className={`text-2xl font-bold font-mono leading-none mt-0.5 ${mwsColor}`}>{cve.mws.score}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[0.62rem] text-slate-500 uppercase tracking-wider">EPSS</div>
          <div className="text-sm font-mono text-slate-300">{cve.epss.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

function ConversionCTA() {
  return (
    <div className="mt-10 rounded-2xl border border-cyan-400/30 p-8 text-center"
         style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.06),rgba(15,23,42,0.6))' }}>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
        Trending tells you what's <em>loud</em>. <span className="text-cyan-400">Mythos Lens tells you what's dangerous.</span>
      </h3>
      <p className="text-slate-400 mb-5 max-w-2xl mx-auto">
        Apply the same Mythos scoring model to your real backlog. Find the quiet threats your scanner ranks low
        and your hype feed never mentions — but Mythos would target first.
      </p>
      <Link to="/mythos-lens" className="inline-block bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-5 py-2.5 rounded-lg font-semibold text-sm transition">
        Try Mythos Lens Demo →
      </Link>
    </div>
  );
}
