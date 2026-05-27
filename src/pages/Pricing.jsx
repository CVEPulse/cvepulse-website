import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: 'Free',
      tagline: 'Intelligence layer + assessment',
      price: 0,
      period: 'forever',
      cta: 'Open Dashboards',
      ctaTo: '/intelligence',
      ctaTone: 'ghost',
      features: [
        ['Three live intelligence dashboards', true],
        ['CVE Intelligence with MWS scoring', true],
        ['CVE Trends with AI-affinity overlay', true],
        ['KEV Tracker ranked by Mythos affinity', true],
        ['Mythos Readiness Index assessment', true],
        ['Mythos Lens demo dataset', true],
        ['CSV upload with your real backlog', false],
        ['Jira / ServiceNow export', false],
        ['Priority email support', false],
      ],
    },
    {
      name: 'Mythos Lens',
      tagline: 'For practitioners and small teams',
      price: annual ? 49 : 59,
      period: 'per user / month',
      cta: 'Start Trial',
      ctaTo: '#',
      ctaTone: 'primary',
      featured: true,
      badge: 'Most popular',
      features: [
        ['Everything in Free', true],
        ['Unlimited CSV uploads', true],
        ['Qualys / Tenable / Rapid7 import', true],
        ['Full MWS scoring engine', true],
        ['Priority filter & search', true],
        ['CSV / JSON / Markdown export', true],
        ['Jira / ServiceNow integration', true],
        ['Browser-only — no data stored', true],
        ['Email support', true],
      ],
    },
    {
      name: 'Enterprise',
      tagline: 'For organisations and regulated environments',
      price: 'Custom',
      period: 'volume + advisory',
      cta: 'Talk to Sales',
      ctaTo: 'mailto:business@cvepulse.com',
      ctaTone: 'ghost',
      features: [
        ['Everything in Mythos Lens', true],
        ['Unlimited users & uploads', true],
        ['SSO / SAML authentication', true],
        ['Dedicated tenancy option', true],
        ['SLA-backed support', true],
        ['Custom MWS weighting model', true],
        ['Advisory hours included', true],
        ['DPA, SOC 2 & GxP documentation', true],
        ['Direct line to engineering', true],
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/30">
            // Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Fair pricing. <span className="grad-text">No enterprise floor.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            CVEPulse exists because enterprise CTEM pricing has locked most security teams out of
            modern exposure defence. We charge what mid-market budgets can absorb.
          </p>
        </div>

        {/* BILLING TOGGLE */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/40">
            <button onClick={() => setAnnual(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      !annual ? 'bg-cyan-400 text-slate-900' : 'text-slate-300 hover:text-white'
                    }`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                      annual ? 'bg-cyan-400 text-slate-900' : 'text-slate-300 hover:text-white'
                    }`}>
              Annual
              <span className={`text-[0.65rem] font-mono px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                annual ? 'bg-slate-900/20 text-slate-900' : 'bg-green-500/15 text-green-400'
              }`}>Save 17%</span>
            </button>
          </div>
        </div>

        {/* TIERS */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {tiers.map(tier => <PricingCard key={tier.name} tier={tier} />)}
        </div>

        {/* COMPARISON */}
        <ComparisonTable />

        {/* FAQ */}
        <FAQ />

        {/* FINAL CTA */}
        <div className="rounded-2xl border border-cyan-400/30 p-12 text-center mt-16"
             style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.08),rgba(15,23,42,0.6))' }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 leading-tight">
            Not sure which tier? <span className="text-cyan-400">Start free.</span>
          </h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            The dashboards and Readiness Index are free in perpetuity. Upgrade when you need to score your real backlog.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/intelligence" className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition">
              Open Dashboards →
            </Link>
            <Link to="/mythos-readiness" className="border border-slate-100/20 hover:border-cyan-400/30 text-white px-6 py-3 rounded-lg font-medium transition">
              Take the Free Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ tier }) {
  const isPrimary = tier.ctaTone === 'primary';
  return (
    <div className={`card-grad rounded-2xl p-7 relative ${
      tier.featured
        ? 'border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(34,211,238,0.12)]'
        : 'border border-slate-700/30'
    }`}>
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-400 text-slate-900 text-[0.65rem] font-mono font-bold uppercase tracking-wider rounded-full">
          {tier.badge}
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{tier.name}</h3>
      <p className="text-sm text-slate-400 mb-5">{tier.tagline}</p>

      <div className="mb-6 pb-6 border-b border-slate-700/30">
        {typeof tier.price === 'number' ? (
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-white tracking-tight">${tier.price}</span>
            <span className="text-slate-400 text-sm">/{tier.period}</span>
          </div>
        ) : (
          <div>
            <span className="text-5xl font-bold text-white tracking-tight">{tier.price}</span>
            <div className="text-slate-400 text-sm mt-1">{tier.period}</div>
          </div>
        )}
      </div>

      {tier.ctaTo.startsWith('mailto:') ? (
        <a href={tier.ctaTo} className={`block text-center px-5 py-3 rounded-lg font-semibold text-sm mb-7 transition ${
          isPrimary
            ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-900 shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_8px_24px_rgba(34,211,238,0.15)]'
            : 'border border-slate-100/20 hover:border-cyan-400/30 text-white hover:bg-cyan-400/5'
        }`}>{tier.cta} →</a>
      ) : (
        <Link to={tier.ctaTo} className={`block text-center px-5 py-3 rounded-lg font-semibold text-sm mb-7 transition ${
          isPrimary
            ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-900 shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_8px_24px_rgba(34,211,238,0.15)]'
            : 'border border-slate-100/20 hover:border-cyan-400/30 text-white hover:bg-cyan-400/5'
        }`}>{tier.cta} →</Link>
      )}

      <ul className="space-y-2.5">
        {tier.features.map(([label, included], i) => (
          <li key={i} className={`flex gap-2.5 text-sm leading-snug ${included ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className={`shrink-0 mt-0.5 ${included ? 'text-cyan-400' : 'text-slate-700'} font-bold font-mono`}>
              {included ? '✓' : '×'}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="card-grad border border-slate-700/30 rounded-2xl p-8 mb-16">
      <h3 className="text-xl font-bold text-white mb-1">How does this compare to enterprise CTEM platforms?</h3>
      <p className="text-sm text-slate-400 mb-6">CVEPulse is built for the teams enterprise platforms leave behind. No naming names — the gap speaks for itself.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/30 text-left">
              <th className="font-mono text-xs text-slate-500 uppercase tracking-wider pb-3 font-semibold">Dimension</th>
              <th className="font-mono text-xs text-cyan-400 uppercase tracking-wider pb-3 font-semibold text-center">CVEPulse</th>
              <th className="font-mono text-xs text-slate-500 uppercase tracking-wider pb-3 font-semibold text-center">Enterprise CTEM</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Pricing model', 'Per-user, transparent', 'Quote-on-request'],
              ['Minimum annual commitment', 'None', 'Typically six-figure'],
              ['AI-era exploit scoring (MWS)', '✓ Built-in', 'Roadmap / partial'],
              ['Browser-only data handling', '✓ Native', 'Cloud-stored'],
              ['Free readiness self-assessment', '✓ 5 min', '✗'],
              ['Time to first value', 'Minutes', 'Weeks to months'],
              ['Designed for mid-market', '✓', '✗ Large enterprise'],
            ].map((row, i) => (
              <tr key={i} className="border-b border-slate-700/20 last:border-b-0">
                <td className="py-3 text-slate-300">{row[0]}</td>
                <td className="py-3 text-center font-semibold text-cyan-400">{row[1]}</td>
                <td className="py-3 text-center text-slate-400">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FAQ() {
  const items = [
    {
      q: 'Do you store our scanner data?',
      a: 'No. Mythos Lens runs entirely in your browser. CSV files are parsed in-memory, scored, displayed, and discarded when you close the tab. No upload to any server. This is an architectural choice — not a privacy promise — so security review is trivial.',
    },
    {
      q: 'How is this different from full enterprise CTEM platforms?',
      a: 'Enterprise platforms (XM Cyber, Tenable One, and similar) are comprehensive suites designed for large organisations with dedicated CTEM programme managers and significant budget. CVEPulse Lens is a focused prioritisation engine for the AI exploit era — built for teams who already have a scanner and need a sharper way to rank what comes out of it. Different scope, different audience.',
    },
    {
      q: 'What scanner formats do you support?',
      a: 'Qualys VMDR, Tenable Nessus / Tenable Vulnerability Management, and Rapid7 InsightVM out of the box. Any CSV with a CVE-ID column will work — we infer the rest from the CVE itself using EPSS, KEV, and NVD.',
    },
    {
      q: 'Can I cancel any time?',
      a: 'Yes. Monthly plans cancel at the next billing cycle. Annual plans are pro-rated. No retention calls.',
    },
    {
      q: 'Do you offer a free trial?',
      a: 'The dashboards and Readiness Index are free forever. The Lens live KEV demo is free. For real CSV uploads we offer a 14-day trial with full features — no credit card required to start.',
    },
    {
      q: 'How does the MWS scoring work?',
      a: 'Six weighted signals: CVSS (20%), EPSS (25%, heaviest), CISA KEV listing (20%), public PoC availability (15%), internet exposure (12%), and attack-class affinity (8%). The weights are transparent and the scoring engine is fully visible in every CVE detail view.',
    },
    {
      q: 'Is this GxP / SOX / HIPAA appropriate?',
      a: 'The Free and Lens tiers run client-side and never transmit your scanner data, which sidesteps most regulatory concerns. Enterprise tier includes formal DPA, SOC 2 Type II report, and documentation packages for GxP, SOX, and HIPAA review.',
    },
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">Frequently asked questions</h3>
      <p className="text-sm text-slate-400 mb-6">The honest answers we'd give a CISO on a vendor call.</p>
      <div className="space-y-3">
        {items.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-grad border border-slate-700/30 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
              className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-cyan-400/3 transition">
        <span className="font-semibold text-white">{q}</span>
        <span className={`text-cyan-400 text-xl font-light transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-700/20">
          {a}
        </div>
      )}
    </div>
  );
}
