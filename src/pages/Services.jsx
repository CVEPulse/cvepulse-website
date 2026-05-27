import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/30">
            // Advisory Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            When dashboards <span className="grad-text">aren't enough.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Direct engagement when your team needs hands-on expertise — programme assessment, exposure
            management strategy, or zero-day response support. Delivered by practitioners who have shipped
            this work in regulated environments.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          <ServiceDetail
            id="i."
            tag="VM Programme Assessment"
            title={<>VM Programme <span className="grad-text">Assessment</span></>}
            desc="Current-state review, backlog contextualisation, SLA strategy, and a delivery roadmap built for your scanner stack and regulatory profile."
            deliverables={[
              'Current-state programme assessment',
              'SLA framework rebuild for AI-era threat model',
              'Backlog cohort analysis (pre/post scanner migration)',
              'Owner scorecard & accountability model',
              'CISO executive summary deck',
            ]}
            duration="4–6 weeks"
            audience="VM directors · CISOs · Heads of Security Engineering"
          />
          <ServiceDetail
            id="ii."
            tag="Exposure Management"
            title={<>Continuous Threat <span className="grad-text">Exposure Management</span></>}
            desc="CTEM programme design and rollout aligned to your crown-jewel assets, exploit intelligence, and AI-era threat models. Five-stage Gartner methodology, executed by people who have shipped it."
            deliverables={[
              'CTEM scope, cadence and governance model',
              'Crown-jewel asset register & criticality scoring',
              'EASM + scanner integration architecture',
              'Five-stage Gartner workflow (scope → discover → prioritise → validate → mobilise)',
              'CISO and executive reporting templates',
            ]}
            duration="6–10 weeks"
            audience="CISOs · CTEM programme leads · GRC heads"
            featured
          />
          <ServiceDetail
            id="iii."
            tag="Zero-Day Response"
            title={<>Zero-Day & Critical <span className="grad-text">Response</span></>}
            desc="Real-time prioritisation, emergency change protocols, and rapid remediation playbooks for when a Mythos-class CVE drops at midnight on a Friday — and your CISO is on a flight."
            deliverables={[
              'Emergency change & exception protocol',
              'KEV / Mythos-class triage playbook',
              'On-call response model & escalation matrix',
              '48-hour war-room support during active events',
              'Post-incident review framework',
            ]}
            duration="Retainer-based · or 2–3 weeks set-up"
            audience="VM ops leads · IR partners · CISOs in regulated industries"
          />
        </div>

        {/* ENGAGEMENT MODEL */}
        <div className="card-grad border border-slate-700/30 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-[1fr_2fr] gap-10">
            <div>
              <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-3 font-semibold">// Engagement Model</div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3 leading-tight">Practitioner-led, not consultant-led.</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every engagement is delivered by someone who has run this work inside a real VM/ASM team —
                in pharma, finance, or healthcare environments with GxP, SOX, and FDA constraints.
                No SDR-to-PM-to-junior-consultant handoff.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <EngagementStep num="01" title="Scoping call" body="Free, 30 minutes. We map your environment, scanner stack, and constraints. If we're not the right fit, we'll say so." />
              <EngagementStep num="02" title="Fixed-scope proposal" body="Within 5 working days. Clear deliverables, fixed price, fixed timeline. No T&M creep." />
              <EngagementStep num="03" title="Kick-off & discovery" body="Week 1. Stakeholder interviews, data access, scanner integration. We come prepared." />
              <EngagementStep num="04" title="Delivery & handover" body="Iterative weekly. Working sessions, not deck reviews. You leave with capability, not a binder." />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-cyan-400/30 p-12 text-center"
             style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.08),rgba(15,23,42,0.6))' }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 leading-tight">
            Ready for a <span className="text-cyan-400">scoping call?</span>
          </h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Free, no-obligation, 30 minutes. We'll tell you whether an engagement makes sense — or whether
            the dashboards and Mythos Lens get you 80% of the way there.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="mailto:business@cvepulse.com?subject=CVEPulse%20Advisory%20-%20Scoping%20Call" className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition">
              Email business@cvepulse.com →
            </a>
            <Link to="/mythos-readiness" className="border border-slate-100/20 hover:border-cyan-400/30 text-white px-6 py-3 rounded-lg font-medium transition">
              Take the Free Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceDetail({ id, tag, title, desc, deliverables, duration, audience, featured }) {
  return (
    <div className={`card-grad rounded-2xl p-7 ${
      featured ? 'border-2 border-cyan-400/40 shadow-[0_0_60px_rgba(34,211,238,0.1)]' : 'border border-slate-700/30'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold">{id}</div>
        <div className="font-mono text-[0.65rem] px-2 py-0.5 rounded uppercase tracking-wider font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/25">
          {tag}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight leading-tight">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-5">{desc}</p>

      <div className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-wider mb-2.5 font-semibold">// Deliverables</div>
      <ul className="space-y-2 mb-5">
        {deliverables.map((d, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-300 leading-snug">
            <span className="text-cyan-400 font-mono text-xs font-bold pt-0.5 shrink-0">→</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-700/30 pt-4 space-y-2 text-xs">
        <div className="flex gap-2">
          <span className="font-mono text-slate-500 uppercase tracking-wider">Duration:</span>
          <span className="text-slate-300">{duration}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-mono text-slate-500 uppercase tracking-wider">Built for:</span>
          <span className="text-slate-300">{audience}</span>
        </div>
      </div>
    </div>
  );
}

function EngagementStep({ num, title, body }) {
  return (
    <div>
      <div className="font-mono text-xs text-cyan-400 font-bold mb-1.5">// {num}</div>
      <div className="font-semibold text-white mb-1 text-sm">{title}</div>
      <div className="text-xs text-slate-400 leading-relaxed">{body}</div>
    </div>
  );
}
