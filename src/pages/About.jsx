import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-8 pt-16 pb-12">
        <div className="inline-block font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/30">
          // About
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
          Built from <span className="grad-text">the practitioner's chair.</span>
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed mb-12">
          CVEPulse is a vulnerability intelligence platform for the AI exploit era. Built by VM and ASM
          directors who manage six-figure backlogs in regulated environments — pharma, finance, healthcare.
          Built for the teams who can't afford enterprise CTEM platforms but can't afford to ignore Mythos either.
        </p>

        <div className="space-y-10">
          <Section eyebrow="The problem">
            <p>For two decades, vulnerability management ran on a comfortable assumption: that the gap between disclosure and exploitation was wide enough for a thirty-day SLA to mean something.</p>
            <p>That assumption ended in <span className="text-cyan-400 font-medium">April 2026</span> when Anthropic disclosed Mythos — an AI system that autonomously discovers zero-day vulnerabilities and develops working exploits with an 83% first-attempt success rate.</p>
            <p>Most VM programmes have not adjusted. They are still managing by CVSS, still running quarterly steering committees, still treating the backlog as something to <em className="text-slate-200">burn down</em> rather than something to <em className="text-slate-200">weight against active threat.</em></p>
          </Section>

          <Section eyebrow="The platforms that exist already">
            <p>Tenable One. XM Cyber. Wiz. Excellent products — built for organisations that can absorb significant annual commitments, multi-month deployments, and dedicated CTEM programme management.</p>
            <p>That leaves a gap. Most VM teams are running Qualys, Tenable Nessus, or Rapid7 — and need a <em className="text-slate-200">sharper way to rank what comes out of those scanners</em> against modern AI-era exploit signals. They don't need another full-stack platform. They need a focused tool.</p>
          </Section>

          <Section eyebrow="What CVEPulse is">
            <p>Three free dashboards (CVE Intelligence, CVE Trends, KEV Tracker) — every CVE scored with the Mythos Weaponization Score so you can see what AI-era prioritisation actually looks like.</p>
            <p>A free <Link to="/mythos-readiness" className="text-cyan-400 hover:text-cyan-300 font-medium">Mythos Readiness Index</Link> — twelve questions, five minutes, A-through-F grade across the four pillars that determine whether your programme can survive contact with autonomous AI.</p>
            <p>A paid <Link to="/mythos-lens" className="text-cyan-400 hover:text-cyan-300 font-medium">Mythos Lens</Link> — upload your real Qualys, Tenable, or Rapid7 export and get every CVE scored against the same six-signal MWS engine. Browser-only. Your scanner data never leaves the device.</p>
            <p>And direct <Link to="/services" className="text-cyan-400 hover:text-cyan-300 font-medium">advisory engagement</Link> when the dashboards aren't enough — programme assessment, CTEM rollout, zero-day response support.</p>
          </Section>

          <Section eyebrow="What CVEPulse isn't">
            <p>It is not a scanner. It does not replace Qualys or Tenable.</p>
            <p>It is not a full enterprise CTEM platform. If your organisation has the budget and team to run a complete CTEM suite, CVEPulse is unlikely to be the right primary tool.</p>
            <p>It is not a venture-funded growth machine. There are no SDR teams, no marketing automation cadences, no upsell loops. Two CTAs, fair pricing, no enterprise floor.</p>
          </Section>

          <Section eyebrow="The principles">
            <ul className="space-y-3 list-none">
              <li className="flex gap-3 items-start">
                <span className="font-mono text-cyan-400 font-bold text-sm shrink-0 pt-1">i.</span>
                <span><strong className="text-white">Practitioner-built.</strong> Every feature ships only if a working VM director would actually use it on a Monday morning.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-mono text-cyan-400 font-bold text-sm shrink-0 pt-1">ii.</span>
                <span><strong className="text-white">Intelligence-first.</strong> KEV, EPSS, NVD, public PoC signals, exposure context — combined into composite scores that mean something. Not just CVSS repeated.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-mono text-cyan-400 font-bold text-sm shrink-0 pt-1">iii.</span>
                <span><strong className="text-white">Mythos-ready.</strong> The first platform with dedicated tooling for AI-era exploit velocity. The Readiness Index and Mythos Lens are not bolt-ons. They are the thesis.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-mono text-cyan-400 font-bold text-sm shrink-0 pt-1">iv.</span>
                <span><strong className="text-white">Mid-market priced.</strong> Fair pricing. No enterprise floor. The Free tier exists in perpetuity because the intelligence layer is the public good that funds everything else.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-mono text-cyan-400 font-bold text-sm shrink-0 pt-1">v.</span>
                <span><strong className="text-white">Browser-only by default.</strong> Your scanner data does not leave your device. Architectural choice, not a privacy claim. Makes vendor security review trivial.</span>
              </li>
            </ul>
          </Section>

          <Section eyebrow="Where we work from">
            <p>CVEPulse is published continuously from <span className="text-slate-200">London</span> and <span className="text-slate-200">Bangalore</span>. Engagements served globally. We are happy to operate under your DPA, NDA, and security review process.</p>
          </Section>
        </div>

        {/* CONTACT */}
        <div className="card-grad border border-slate-700/30 rounded-2xl p-8 mt-12">
          <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 font-semibold">// Get in touch</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-slate-500 w-24">Business</span>
              <a href="mailto:business@cvepulse.com" className="text-cyan-400 hover:text-cyan-300 font-medium">business@cvepulse.com</a>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500 w-24">Press</span>
              <a href="mailto:press@cvepulse.com" className="text-cyan-400 hover:text-cyan-300 font-medium">press@cvepulse.com</a>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500 w-24">Security</span>
              <a href="mailto:security@cvepulse.com" className="text-cyan-400 hover:text-cyan-300 font-medium">security@cvepulse.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ eyebrow, children }) {
  return (
    <section>
      <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-3 font-semibold">// {eyebrow}</div>
      <div className="space-y-3 text-base text-slate-300 leading-relaxed">{children}</div>
    </section>
  );
}
