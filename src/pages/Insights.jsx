import React from 'react';

const POSTS = [
  {
    slug: 'mythos-fieldnotes',
    category: 'Field Notes',
    title: 'Mythos Field Notes — what changed in April 2026',
    deck: 'A practitioner reading of Anthropic\'s Mythos disclosure, what it means for VM programmes, and the four pillars of readiness.',
    date: 'April 9, 2026',
    readTime: '8 min',
    featured: true,
  },
  {
    slug: 'mws-explained',
    category: 'Engineering',
    title: 'How the Mythos Weaponization Score is calculated',
    deck: 'A transparent walkthrough of the six-signal MWS composite — weights, sources, and why we picked them.',
    date: 'April 12, 2026',
    readTime: '6 min',
  },
  {
    slug: 'sla-compression',
    category: 'Strategy',
    title: 'Why your 30-day SLA is now your biggest exposure',
    deck: 'The math of AI-speed exploitation, and the practical case for separating internet-facing assets into a 72-hour patch lane.',
    date: 'April 15, 2026',
    readTime: '5 min',
  },
  {
    slug: 'cvss-isnt-enough',
    category: 'Strategy',
    title: 'CVSS-only prioritisation has a Mythos problem',
    deck: 'When EPSS, KEV, and PoC availability are all available, sorting on CVSS alone is no longer a defensible choice.',
    date: 'April 18, 2026',
    readTime: '7 min',
  },
  {
    slug: 'browser-only-architecture',
    category: 'Engineering',
    title: 'Why Mythos Lens runs entirely in your browser',
    deck: 'The architectural case for client-side scoring — and what we deliberately gave up to make CISO security review a formality.',
    date: 'April 22, 2026',
    readTime: '5 min',
  },
  {
    slug: 'practitioner-vs-platform',
    category: 'Field Notes',
    title: 'Why mid-market security teams need a different platform',
    deck: 'Enterprise CTEM platforms are excellent products for organisations that can afford them. Most can\'t. Here\'s the gap.',
    date: 'April 26, 2026',
    readTime: '6 min',
  },
];

export default function Insights() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/30">
            // Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Field notes from the <span className="grad-text">AI exploit era.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Practitioner analysis on Mythos, MWS, AI-era prioritisation strategy, and the architectural
            choices behind CVEPulse. Written by people running this work — not by a content team.
          </p>
        </div>

        {/* Featured */}
        {featured && (
          <div className="block card-grad border border-cyan-400/30 rounded-2xl p-8 md:p-10 mb-8 opacity-95">
            <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-end">
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                    Featured · {featured.category}
                  </span>
                  <span className="font-mono text-[0.65rem] text-slate-500">{featured.date} · {featured.readTime}</span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    Coming soon
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 leading-tight">{featured.title}</h2>
                <p className="text-slate-400 leading-relaxed text-lg">{featured.deck}</p>
              </div>
              <div className="flex md:justify-end">
                <a href="mailto:subscribe@cvepulse.com?subject=Notify%20me%20when%20Mythos%20Field%20Notes%20publishes"
                   className="text-cyan-400 font-semibold inline-flex items-center gap-2 text-sm hover:text-cyan-300 transition">
                  Notify me when published →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Rest */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(post => <PostCard key={post.slug} post={post} />)}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-cyan-400/30 p-12 text-center mt-14"
             style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.08),rgba(15,23,42,0.6))' }}>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3 leading-tight">
            Get field notes <span className="text-cyan-400">in your inbox.</span>
          </h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            One email per piece. No marketing sequences. Unsubscribe in one click.
          </p>
          <a href="mailto:subscribe@cvepulse.com?subject=Subscribe%20to%20CVEPulse%20Field%20Notes"
             className="inline-block bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition">
            Subscribe →
          </a>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="block card-grad border border-slate-700/30 rounded-xl p-6 opacity-90">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-mono text-[0.62rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100/5 text-slate-300 border border-slate-700/40">
          {post.category}
        </span>
        <span className="font-mono text-[0.62rem] text-slate-500">{post.readTime}</span>
      </div>
      <h3 className="text-lg font-semibold text-white tracking-tight mb-2 leading-snug">{post.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.deck}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-slate-500">{post.date}</span>
        <span className="font-mono text-amber-400 font-medium">Coming soon</span>
      </div>
    </div>
  );
}
