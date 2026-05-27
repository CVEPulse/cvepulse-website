import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchKEV, fetchRecentCVEs } from '../lib/cveFetcher';

export default function Home() {
  const [liveCounts, setLiveCounts] = useState({
    kevTotal: null,
    recentCount: null,
    todayCount: null,
  });

  useEffect(() => {
    let alive = true;
    Promise.allSettled([fetchKEV(), fetchRecentCVEs(50)])
      .then(([kevRes, recentRes]) => {
        if (!alive) return;
        const kevTotal = kevRes.status === 'fulfilled' ? kevRes.value.count : null;
        const recent = recentRes.status === 'fulfilled' ? recentRes.value : [];
        const recentCount = recent.length || null;
        // Count CVEs published in last 24h
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const todayCount = recent.filter(c => new Date(c.published).getTime() > dayAgo).length || null;
        setLiveCounts({ kevTotal, recentCount, todayCount });
      });
    return () => { alive = false; };
  }, []);

  // Format with thousands separator, fall back to placeholder
  const fmt = (n) => n === null ? '—' : n.toLocaleString();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ANNOUNCE */}
      <div className="border-b border-slate-700/30 py-2.5 text-center text-sm text-slate-300"
           style={{ background: 'linear-gradient(90deg,rgba(34,211,238,0.06),rgba(34,211,238,0.12),rgba(34,211,238,0.06))' }}>
        <span className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 font-mono text-xs font-semibold tracking-wider uppercase mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span> New
        </span>
        The Mythos era is here.{' '}
        <Link to="/mythos-readiness" className="text-cyan-400 font-medium border-b border-cyan-400/30">
          Take the free Readiness Assessment →
        </Link>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-cyan-400/30 rounded-full text-xs font-mono text-cyan-300 mb-7 bg-cyan-400/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
              For VM directors · CISOs · Security teams
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight text-white mb-6">
              Vulnerability intelligence for the{' '}
              <span className="grad-text">AI exploit era.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
              <strong className="text-white font-semibold">Free CVE intelligence dashboards</strong> with built-in Mythos
              risk scoring. A free Readiness assessment. A paid prioritisation engine for your real backlog.
              Built for security teams who need to move faster than autonomous AI exploitation —
              without seven-figure platform pricing.
            </p>
            <div className="flex gap-3 flex-wrap mb-9">
              <Link to="/intelligence"
                    className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_8px_24px_rgba(34,211,238,0.15)]">
                Open Free Dashboards →
              </Link>
              <Link to="/mythos-readiness"
                    className="bg-slate-100/5 hover:bg-slate-100/10 border border-slate-100/20 hover:border-cyan-400/30 text-white px-6 py-3 rounded-lg font-medium transition">
                Take 5-min Readiness Test
              </Link>
            </div>
            <div className="flex flex-wrap gap-5 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">✓</span> No login required</span>
              <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">✓</span> Browser-only processing</span>
              <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">✓</span> Built by VM practitioners</span>
            </div>
          </div>

          {/* PRODUCT MOCKUP */}
          <ProductMockup />
        </div>
      </section>

      {/* TRUST LOGOS */}
      <div className="border-y border-slate-700/30 bg-slate-950/40 py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-10 justify-center">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">// Powered by trusted intelligence sources</span>
          <div className="flex flex-wrap gap-10 items-center">
            {['NVD', 'CISA KEV', 'EPSS', 'MITRE', 'GitHub PoC', 'ExploitDB'].map(name => (
              <span key={name} className="font-semibold text-slate-400 hover:text-slate-200 transition flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-700 inline-flex items-center justify-center font-mono text-[0.55rem] font-bold text-slate-300">
                  {name[0]}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARDS */}
      <SectionHeader
        eyebrow="Section I · Intelligence Layer"
        title={<>Three free dashboards. <span className="grad-text">Always live.</span></>}
        sub="No login. No throttle. Each dashboard now includes Mythos risk scoring — see which vulnerabilities autonomous AI would target first."
      />
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-5 mb-24">
        <DashCard to="/cve-intelligence" icon="CVE INTEL" title="CVE Intelligence"
                  question='"What new CVEs matter most to me today?"'
                  numbers={[
                    { v: fmt(liveCounts.recentCount), l: 'Tracked (7d)' },
                    { v: fmt(liveCounts.todayCount), l: 'New today', cyan: true },
                    { v: '3', l: 'Sources' },
                  ]}
                  enhancement="+ Mythos Risk Score on every CVE" />
        <DashCard to="/cvetrends" icon="CVE TRENDS" title="CVE Trends"
                  question='"Which trending CVEs would Mythos prioritise?"'
                  numbers={[
                    { v: 'MWS', l: 'Hype × AI', cyan: true },
                    { v: '6 sig', l: 'Composite' },
                    { v: '5m', l: 'Refresh' },
                  ]}
                  enhancement="+ AI-affinity overlay on hype score" />
        <DashCard to="/kev" icon="KEV NOW" title="KEV Tracker"
                  question='"Which KEV CVEs are AI-weaponizable today?"'
                  numbers={[
                    { v: fmt(liveCounts.kevTotal), l: 'Listed' },
                    { v: 'Hourly', l: 'Sync', cyan: true },
                    { v: 'CISA', l: 'Upstream' },
                  ]}
                  enhancement="+ Mythos likelihood per CVE" />
      </div>

      {/* GAP STRIP */}
      <div className="border-y border-slate-700/30 py-16 px-8"
           style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.06) 0%,rgba(15,23,42,0.6) 50%,rgba(34,211,238,0.06) 100%)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 items-center">
          <GapStat val="Hours" tone="red" lbl={<>Mythos exploit window<br/>disclosure → working exploit</>} />
          <span className="text-2xl text-slate-600 font-light text-center">vs.</span>
          <GapStat val="83%" tone="amber" lbl={<>First-attempt success rate<br/>autonomous AI exploitation</>} />
          <span className="text-2xl text-slate-600 font-light text-center">vs.</span>
          <GapStat val="30 days" tone="cyan" lbl={<>Industry-standard SLA<br/>for critical patches</>} />
        </div>
      </div>

      {/* MYTHOS DEFENSE */}
      <SectionHeader
        eyebrow="Section II · Mythos Defense Suite"
        title={<>Two tools. <span className="grad-text">One mission.</span></>}
        sub="Built specifically around the AI-era exploit threat model. The first is free, takes five minutes, and tells you where you stand. The second is paid, runs against your real scanner data, and tells you what to fix first."
      />
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-6 mb-24">
        <ToolCard
          tier="free" tierLabel="Free · No account"
          name="Mythos Readiness" nameAccent="Index"
          tagline="A 12-question self-assessment"
          grade={{ text: 'A–F', tone: 'green' }}
          question='"How ready is my VM programme to survive AI-speed exploitation?"'
          desc={<>Grades you across four pillars: <strong className="text-slate-200">SLA compression, edge exposure, detection coverage,</strong> and <strong className="text-slate-200">AI triage adoption.</strong></>}
          features={[
            'Pillar-by-pillar scoring with personalised gap analysis',
            'Shareable PDF readiness report for board and CISO briefings',
            'No account required to receive your grade or PDF',
          ]}
          ctaText="Begin Assessment →" ctaTo="/mythos-readiness"
          meta={<>5 min · A–F grade<br/>Free in perpetuity</>}
        />
        <ToolCard
          tier="paid" tierLabel="Paid · Demo is free"
          name="Mythos" nameAccent="Lens"
          tagline="A prioritisation engine for your backlog"
          grade={{ text: 'MWS', tone: 'cyan' }}
          question='"Out of my 40,000 open CVEs, which 50 should I fix first?"'
          desc={<>Upload a CSV from <strong className="text-slate-200">Qualys, Tenable, or Rapid7</strong>. Each CVE scored with the Mythos Weaponization Score.</>}
          features={[
            'Six-signal MWS: CVSS + EPSS + KEV + PoC + exposure + class',
            'Filterable priority table with click-through CVE detail',
            'One-click export to Jira, ServiceNow, or board PDF',
          ]}
          ctaText="Try the Demo →" ctaTo="/mythos-lens" ctaGhost
          meta={<>Browser-only<br/>No data stored</>}
        />
      </div>

      {/* WHY */}
      <SectionHeader
        eyebrow="Section III · Why CVEPulse"
        title={<>Built from the practitioner's chair — <span className="grad-text">not the marketing deck.</span></>}
      />
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-5 mb-24">
        <WhyCard num="01" title="Practitioner-built" body="Designed by VM and ASM directors managing six-figure backlogs in regulated environments — pharma, finance, healthcare." />
        <WhyCard num="02" title="Intelligence-first" body="KEV, EPSS, NVD, public PoC, exposure context — combined into composite scores that mean something. Not just CVSS repeated." />
        <WhyCard num="03" title="Mythos-ready" body="The first platform with dedicated tooling for AI-era exploit velocity. The Readiness Index and Mythos Lens are the thesis." />
        <WhyCard num="04" title="Mid-market priced" body="Enterprise CTEM platforms are designed for organisations with seven-figure security budgets. CVEPulse brings exposure defence to the rest of us." />
      </div>

      {/* CTA */}
      <div className="mx-8 max-w-7xl lg:mx-auto rounded-2xl p-16 text-center border border-cyan-400/30 relative overflow-hidden mb-12"
           style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.08) 0%,rgba(15,23,42,0.6) 100%)' }}>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Know your risk. <span className="text-cyan-400">Before Mythos does.</span>
        </h2>
        <p className="text-slate-300 mb-8 text-lg">Five minutes. No account required. A grade you can take to your CISO.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/mythos-readiness"
                className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition">
            Take the Free Assessment →
          </Link>
          <Link to="/intelligence"
                className="bg-transparent border border-slate-100/20 hover:border-cyan-400/30 text-white px-6 py-3 rounded-lg font-medium transition">
            Open the Dashboards
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── COMPONENTS ── */

function ProductMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle,rgba(34,211,238,0.4),transparent 70%)', filter: 'blur(40px)' }}></div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-100/15"
           style={{
             background: 'linear-gradient(135deg,#13203A 0%,#0F172A 100%)',
             boxShadow: '0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(34,211,238,0.1),0 0 80px rgba(34,211,238,0.15)',
           }}>
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/60 border-b border-slate-700/30">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></span>
          <span className="ml-3 px-2.5 py-0.5 bg-slate-900/70 border border-slate-700/30 rounded font-mono text-[0.7rem] text-slate-400">
            <span className="text-amber-400">●</span> cvepulse.com/mythos-lens · illustrative preview
          </span>
          <span className="ml-auto font-mono text-[0.65rem] text-amber-400 uppercase tracking-wider">Preview</span>
        </div>

        <div className="p-5">
          {/* Tabs */}
          <div className="flex gap-5 mb-5 border-b border-slate-700/30 pb-3">
            {[['Mythos Lens', true], ['Priorities'], ['Heatmap'], ['Export']].map(([t, active], i) => (
              <span key={i} className={`text-[0.74rem] font-mono uppercase tracking-wider font-medium pb-2 ${
                active ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-3' : 'text-slate-400'
              }`}>{t}</span>
            ))}
          </div>

          {/* KPI Stats — illustrative preview */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total CVEs', val: '—', delta: 'your backlog', up: true },
              { label: 'MWS ≥ 85', val: '—', delta: 'Mythos targets', up: true, highlight: true },
              { label: 'KEV Listed', val: '—', delta: 'CISA confirmed', up: true },
              { label: 'Avg SLA', val: '—', delta: 'patch window', up: false },
            ].map((s, i) => (
              <div key={i} className={`p-3.5 rounded-lg border ${s.highlight
                ? 'bg-cyan-400/5 border-cyan-400/30'
                : 'bg-slate-900/50 border-slate-700/30'}`}>
                <div className="font-mono text-[0.62rem] text-slate-500 uppercase tracking-wider mb-1.5">{s.label}</div>
                <div className={`text-2xl font-bold leading-none ${s.highlight ? 'text-cyan-400' : 'text-white'}`}>{s.val}</div>
                <div className="font-mono text-[0.65rem] mt-1.5 text-slate-500">{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-slate-950/50 border border-slate-700/30 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_70px_80px_60px] gap-2 px-3.5 py-2.5 bg-slate-900/60 border-b border-slate-700/30 font-mono text-[0.62rem] text-slate-500 uppercase tracking-wider font-medium">
              <div>CVE ID</div><div>Vulnerability</div><div>EPSS</div><div>KEV</div><div>MWS</div>
            </div>
            {[
              { cve: 'CVE-2024-3400', desc: 'Palo Alto PAN-OS GlobalProtect — RCE', epss: '0.94', kev: 'YES', mws: '96', mwsTone: 'red', featured: true },
              { cve: 'CVE-2024-21887', desc: 'Ivanti Connect Secure command injection', epss: '0.97', kev: 'YES', mws: '94', mwsTone: 'red' },
              { cve: 'CVE-2024-1709', desc: 'ConnectWise ScreenConnect auth bypass', epss: '0.93', kev: 'YES', mws: '92', mwsTone: 'red' },
              { cve: 'CVE-2023-46805', desc: 'Ivanti Connect Secure auth bypass', epss: '0.92', kev: 'YES', mws: '90', mwsTone: 'red' },
              { cve: 'CVE-2024-27198', desc: 'JetBrains TeamCity auth bypass', epss: '0.86', kev: 'YES', mws: '87', mwsTone: 'orange' },
            ].map((r, i) => (
              <div key={i}
                   className={`grid grid-cols-[80px_1fr_70px_80px_60px] gap-2 px-3.5 py-2.5 border-b border-slate-700/30 last:border-b-0 items-center text-[0.74rem] ${
                     r.featured ? 'bg-cyan-400/5' : ''
                   }`}>
                <div className="font-mono text-cyan-400 font-medium">{r.cve}</div>
                <div className="text-slate-300">{r.desc}</div>
                <div className="font-mono text-slate-300">{r.epss}</div>
                <div>
                  <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[0.6rem] font-semibold uppercase tracking-wider border ${
                    r.kev === 'YES'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-slate-100/5 text-slate-500 border-slate-700/30'
                  }`}>{r.kev}</span>
                </div>
                <div className={`font-mono font-semibold text-right ${
                  r.mwsTone === 'red' ? 'text-red-400' : r.mwsTone === 'orange' ? 'text-orange-400' : 'text-amber-400'
                }`}>{r.mws}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-24 pb-12 text-center">
      <div className="inline-block font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/30">
        // {eyebrow}
      </div>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">
        {title}
      </h2>
      {sub && <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function DashCard({ to, icon, title, question, numbers, enhancement }) {
  return (
    <Link to={to} className="card-grad border border-slate-100/15 rounded-2xl p-7 transition hover:border-cyan-400/30 hover:-translate-y-0.5 block group relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-60 transition"
           style={{ background: 'linear-gradient(90deg,transparent,#22D3EE,transparent)' }}></div>
      <div className="flex justify-between items-start mb-5">
        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center font-mono text-[0.62rem] font-semibold text-cyan-400 leading-tight whitespace-pre-line text-center">{icon.replace(' ', '\n')}</div>
        <div className="flex items-center gap-1.5 font-mono text-[0.66rem] text-green-400 uppercase tracking-wider font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" style={{ boxShadow: '0 0 8px #4ADE80' }}></span> Live
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 italic mb-3 leading-relaxed">{question}</p>
      <div className="text-[0.7rem] font-mono text-cyan-400 mb-5 inline-block px-2 py-0.5 bg-cyan-400/8 rounded border border-cyan-400/20">
        {enhancement}
      </div>
      <div className="flex gap-5 py-4 border-y border-slate-700/30 mb-5">
        {numbers.map((n, i) => (
          <div key={i} className="flex-1">
            <div className={`text-2xl font-bold font-mono leading-none ${n.cyan ? 'text-cyan-400' : 'text-white'}`}>{n.v}</div>
            <div className="font-mono text-[0.62rem] text-slate-500 uppercase tracking-wider mt-1.5">{n.l}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 font-mono">
        Open Dashboard <span className="group-hover:translate-x-1 transition">→</span>
      </div>
    </Link>
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

function ToolCard({ tier, tierLabel, name, nameAccent, tagline, grade, question, desc, features, ctaText, ctaTo, ctaGhost, meta }) {
  return (
    <article className="card-grad border border-slate-100/15 rounded-2xl overflow-hidden hover:border-cyan-400/30 transition flex flex-col">
      <div className="p-7 pb-5 flex justify-between items-start border-b border-slate-700/30">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wider font-semibold mb-2.5 px-2 py-0.5 rounded ${
            tier === 'free'
              ? 'text-green-400 bg-green-500/10 border border-green-500/25'
              : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/25'
          }`}>
            <span className={`w-2 h-2 rounded-full ${tier === 'free' ? 'bg-green-400' : 'bg-cyan-400'}`}></span> {tierLabel}
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mb-1">{name} <span className="text-cyan-400">{nameAccent}</span></div>
          <div className="text-sm text-slate-400">{tagline}</div>
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${
          grade.tone === 'green'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-base font-mono font-semibold'
        }`}>{grade.text}</div>
      </div>
      <div className="p-7 flex-1">
        <div className="bg-cyan-400/5 border-l-[3px] border-cyan-400 px-4 py-3.5 mb-5 rounded-r-lg italic text-slate-200 text-[0.95rem]">
          <span className="block font-mono text-[0.65rem] text-cyan-400 uppercase tracking-wider not-italic font-semibold mb-1">// Answers</span>
          {question}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-5">{desc}</p>
        <div className="flex flex-col gap-2.5">
          {features.map((f, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-300 leading-snug">
              <span className="text-cyan-400 font-mono text-xs font-bold pt-0.5">✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-7 py-5 bg-slate-950/40 border-t border-slate-700/30 flex justify-between items-center">
        <Link to={ctaTo}
              className={`px-5 py-2.5 rounded-md font-semibold text-sm transition ${
                ctaGhost
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/25 hover:bg-cyan-400/20'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-900'
              }`}>
          {ctaText}
        </Link>
        <div className="font-mono text-[0.7rem] text-slate-500 text-right leading-relaxed">{meta}</div>
      </div>
    </article>
  );
}

function WhyCard({ num, title, body }) {
  return (
    <div className="card-grad border border-slate-100/15 rounded-2xl p-7">
      <div className="font-mono text-xs text-cyan-400 mb-4 font-semibold tracking-wider">// {num}</div>
      <h4 className="text-lg font-semibold text-white mb-2 tracking-tight">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
