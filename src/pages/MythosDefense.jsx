import React from 'react';
import { Link } from 'react-router-dom';

export default function MythosDefense() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <style>{`
        body { background: radial-gradient(ellipse 1200px 600px at 50% -20%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(180deg, #0B1226 0%, #0F172A 100%); background-attachment: fixed; }
        .grad-text { background: linear-gradient(135deg,#67E8F9,#06B6D4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .card-grad { background: linear-gradient(180deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.6) 100%); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pulse-dot { animation: pulse 1.5s infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 pt-6 pb-12">
        <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
          <span className="mx-2 text-slate-700">/</span>
          <span className="text-cyan-400 font-medium">Mythos Defense</span>
        </div>

        {/* HERO */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start pb-16 border-b border-slate-700/30">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-red-400/35 rounded-full text-xs font-mono text-red-400 mb-6 bg-red-400/8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" style={{ boxShadow: '0 0 8px #F87171' }}></span>
              ⚠ AI Exploit Threat · Active
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-none tracking-tight text-white mb-6">
              The <span className="text-red-400">AI weaponization</span> gap is{' '}
              <span className="grad-text">your problem now.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
              Anthropic's Mythos model can autonomously discover zero-day vulnerabilities and develop working
              exploits with an <strong className="text-white font-semibold">83% first-attempt success rate.</strong>{' '}
              CVEPulse gives you two purpose-built tools to measure and close your exposure — starting with a
              free 5-minute assessment.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/mythos-readiness"
                    className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_8px_24px_rgba(34,211,238,0.15)]">
                Take the Free Assessment →
              </Link>
              <Link to="/mythos-lens"
                    className="bg-slate-100/5 hover:bg-slate-100/10 border border-slate-100/20 hover:border-cyan-400/30 text-white px-6 py-3 rounded-lg font-medium transition">
                Try Mythos Lens Demo
              </Link>
            </div>
          </div>

          <ThreatCard />
        </div>

        {/* GAP STRIP */}
        <div className="my-16 -mx-8 px-8 py-12 border-y border-slate-700/30"
             style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.06),rgba(15,23,42,0.6) 50%,rgba(34,211,238,0.06))' }}>
          <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 items-center">
            <GapStat val="Hours" tone="red" lbl={<>Mythos exploit window<br/>disclosure → working exploit</>} />
            <span className="text-2xl text-slate-600 font-light text-center">vs.</span>
            <GapStat val="83%" tone="amber" lbl={<>First-attempt success rate<br/>autonomous AI exploitation</>} />
            <span className="text-2xl text-slate-600 font-light text-center">vs.</span>
            <GapStat val="30 days" tone="cyan" lbl={<>Industry-standard SLA<br/>for critical patches</>} />
          </div>
        </div>

        {/* WHAT IS MYTHOS */}
        <SectionHeader eyebrow="Section I · The Threat Model"
                       title={<>The model that <span className="grad-text">changed the threat model.</span></>}
                       sub="Mythos isn't an incremental risk — it's a category shift. The vulnerability management playbook written before April 2026 has expired." />
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-5 text-base text-slate-300 leading-relaxed">
            <p>Anthropic's <strong className="text-white">Claude Mythos</strong> (disclosed April 2026) is an autonomous AI system capable of discovering zero-day vulnerabilities in production systems and generating working exploit code — with an <span className="text-cyan-400 font-medium">83% first-attempt success rate</span>.</p>
            <p>This isn't a research demo. It operates at <strong className="text-white">machine speed and machine scale</strong>. A vulnerability that previously required a skilled human researcher days or weeks to weaponise can now be exploited within <span className="text-cyan-400 font-medium">hours of disclosure</span>.</p>
            <p>For VM programmes still operating on 14–30 day SLA frameworks, this is a <strong className="text-white">category shift</strong> — not an incremental risk increase.</p>
            <p>CVEPulse's Mythos Defense suite gives you two things: a clear picture of <strong className="text-white">where you stand today</strong> (Readiness Index) and a prioritised view of <strong className="text-white">which of your CVEs are most at risk</strong> (Mythos Lens).</p>
          </div>
          <div className="card-grad border-l-[3px] border-cyan-400 rounded-r-xl p-8 text-xl text-slate-100 font-medium leading-snug">
            "The vulnerability management playbook written before April 2026{' '}
            <span className="text-cyan-400 font-semibold">has expired</span>. What replaces it is the question
            this platform was built to answer."
            <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mt-5 pt-4 border-t border-slate-700/30 font-semibold">
              — CVEPulse Editorial · 04.09.2026
            </div>
          </div>
        </div>

        {/* MWS BREAKDOWN */}
        <SectionHeader eyebrow="Section II · The Scoring Engine"
                       title={<>Mythos Weaponization Score <span className="grad-text">(MWS).</span></>}
                       sub={<>A composite score from 0 to 100 built from six weighted signals. Answers one question: <em className="text-cyan-400 not-italic">how attractive is this CVE to a Mythos-class autonomous attacker?</em></>} />
        <div className="grid md:grid-cols-[340px_1fr] gap-12 mb-20">
          <ScoreCard />
          <div className="space-y-4">
            <SignalRow num="01" name="CVSS Base Score" weight="20%" value="7.8"
                       desc="Raw severity from the National Vulnerability Database. Necessary, never sufficient."
                       source="NVD" fillPct={78} />
            <SignalRow num="02" name="EPSS Score" weight="25%" value="0.97"
                       desc="Exploit Prediction Scoring System. Probability of exploitation in the wild within 30 days. Highest-weighted signal."
                       source="FIRST.org EPSS v3" fillPct={97} tone="amber" highlight="· Heaviest signal" />
            <SignalRow num="03" name="CISA KEV Listing" weight="20%" value="YES"
                       desc="Known Exploited Vulnerability — CISA confirmed active exploitation. Binary signal."
                       source="CISA KEV catalog" fillPct={100} tone="danger" highlight="· Binary" />
            <SignalRow num="04" name="Public PoC Available" weight="15%" value="YES"
                       desc="Working exploit code is publicly published. Dramatically lowers the bar for AI-assisted exploitation."
                       source="GitHub PoC, ExploitDB" fillPct={100} tone="danger" />
            <SignalRow num="05" name="Internet-Facing Exposure" weight="12%" value="YES"
                       desc="Is the affected host directly reachable from the public internet? External exposure collapses the attack chain."
                       source="EASM enumeration" fillPct={100} tone="amber" />
            <SignalRow num="06" name="Attack Class Affinity" weight="8%" value="RCE"
                       desc="Vulnerability classes show measurably different Mythos exploit affinity. RCE, auth bypass, LFI are highest."
                       source="Mythos benchmark" fillPct={90} />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-16 text-center border border-cyan-400/30 relative overflow-hidden mb-12"
             style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.08) 0%,rgba(15,23,42,0.6) 100%)' }}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">
            Know your risk. <span className="text-cyan-400">Before Mythos does.</span>
          </h2>
          <p className="text-slate-300 mb-8 text-lg">Start with the free assessment. Upgrade when you need the full picture.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/mythos-readiness" className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition">
              Take the Free Assessment →
            </Link>
            <Link to="/mythos-lens" className="bg-transparent border border-slate-100/20 hover:border-cyan-400/30 text-white px-6 py-3 rounded-lg font-medium transition">
              Explore Mythos Lens
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreatCard() {
  const items = [
    ['Disclosed', 'April 7, 2026'],
    ['Source', 'Anthropic'],
    ['Classification', 'Autonomous AI', 'danger'],
    ['Capability', '0-day discovery'],
    ['Exploit success', '83% first try', 'danger'],
    ['Time-to-weaponise', 'Hours', 'danger'],
    ['Industry SLA', '14–30 days', 'warn'],
    ['Highest-risk class', 'RCE / Auth', 'danger'],
    ['Available defences', 'Few. So far.', 'ok'],
  ];
  return (
    <aside className="card-grad border border-red-400/20 rounded-2xl p-7 relative overflow-hidden">
      <div className="font-mono text-xs text-red-400 uppercase tracking-wider mb-5 font-semibold">
        // Mythos Threat Profile
      </div>
      <ul className="space-y-0">
        {items.map(([label, value, tone], i) => (
          <li key={i} className="flex justify-between items-baseline py-2.5 border-b border-slate-700/30 last:border-b-0 text-sm">
            <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">{label}</span>
            <span className={`font-semibold text-right ${
              tone === 'danger' ? 'text-red-400'
                : tone === 'warn' ? 'text-amber-400'
                : tone === 'ok' ? 'text-green-400'
                : 'text-white'
            }`}>{value}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div className="pt-16 pb-8 max-w-3xl">
      <div className="inline-block font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/30">
        // {eyebrow}
      </div>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">{title}</h2>
      {sub && <p className="text-slate-400 leading-relaxed">{sub}</p>}
    </div>
  );
}

function GapStat({ val, tone, lbl }) {
  const colors = { red: 'text-red-400', amber: 'text-amber-400', cyan: 'text-cyan-400' };
  return (
    <div className="text-center">
      <div className={`text-5xl md:text-6xl font-bold leading-none tracking-tight mb-2 ${colors[tone]}`}>{val}</div>
      <div className="font-mono text-xs text-slate-400 uppercase tracking-wider leading-relaxed">{lbl}</div>
    </div>
  );
}

function ScoreCard() {
  return (
    <div className="card-grad border border-cyan-400/30 rounded-2xl p-8 sticky top-6"
         style={{ boxShadow: '0 0 60px rgba(34,211,238,0.1)' }}>
      <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-2 font-semibold">// Worked example</div>
      <div className="text-base font-semibold text-slate-200 mb-1">CVE-2026-0411</div>
      <div className="text-sm text-slate-400 mb-6">Linux kernel qdisc UAF — RCE</div>
      <div className="text-7xl font-extrabold text-red-400 leading-none tracking-tight mb-2">94</div>
      <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-6">out of 100 · MWS</div>
      <div className="py-4 border-y border-slate-700/30">
        <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">// Verdict</div>
        <div className="text-base text-red-400 font-semibold">A textbook Mythos target.</div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-5">
        <Tag tone="red">RCE</Tag>
        <Tag tone="red">KEV listed</Tag>
        <Tag tone="amber">EPSS 0.97</Tag>
        <Tag tone="amber">PoC public</Tag>
        <Tag tone="cyan">Internet-facing</Tag>
      </div>
    </div>
  );
}

function Tag({ tone, children }) {
  const styles = {
    red: 'bg-red-500/12 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/12 text-amber-400 border-amber-500/30',
    cyan: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  };
  return (
    <span className={`font-mono text-[0.65rem] px-2 py-1 rounded uppercase tracking-wider font-semibold border ${styles[tone]}`}>
      {children}
    </span>
  );
}

function SignalRow({ num, name, weight, value, desc, source, fillPct, tone, highlight }) {
  const fillClass = tone === 'danger' ? 'bg-gradient-to-r from-orange-400 to-red-400'
    : tone === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-400'
    : 'bg-gradient-to-r from-cyan-500 to-cyan-400';
  return (
    <div className="card-grad border border-slate-700/30 hover:border-cyan-400/30 rounded-xl p-6 transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-cyan-400/12 border border-cyan-400/30 text-cyan-400 font-mono font-semibold text-xs flex items-center justify-center">
            {num}
          </div>
          <h5 className="text-base text-white font-semibold tracking-tight">
            {name}
            {highlight && <span className="ml-2 font-mono text-xs text-cyan-400 font-medium">{highlight}</span>}
          </h5>
        </div>
        <div className="font-mono text-xs text-cyan-400 font-medium">{weight} weight</div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 ml-10">{desc}</p>
      <div className="flex items-center gap-4 ml-10">
        <span className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-wider">SOURCE · {source}</span>
        <div className="flex-1 max-w-[200px] flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-700/30 rounded overflow-hidden">
            <div className={`h-full rounded ${fillClass}`} style={{ width: `${fillPct}%` }}></div>
          </div>
          <span className="font-mono text-xs text-white font-semibold min-w-[40px] text-right">{value}</span>
        </div>
      </div>
    </div>
  );
}
