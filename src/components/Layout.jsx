import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { pathname } = useLocation();
  const isActive = (p) => pathname === p;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/85 border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center gap-8">
        <Link to="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-[0.7rem] font-bold text-slate-900">CV</span>
          CVE<span className="text-cyan-400">Pulse</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
          <NavLink to="/intelligence" active={isActive('/intelligence') || pathname.startsWith('/cve-intelligence') || pathname.startsWith('/cvetrends') || pathname.startsWith('/kev')}>Intelligence</NavLink>
          <NavLink to="/mythos-defense" active={pathname.startsWith('/mythos')} badge="NEW">Mythos Defense</NavLink>
          <NavLink to="/services" active={isActive('/services')}>Services</NavLink>
          <NavLink to="/insights" active={isActive('/insights')}>Insights</NavLink>
          <NavLink to="/pricing" active={isActive('/pricing')}>Pricing</NavLink>
          <NavLink to="/about" active={isActive('/about')}>About</NavLink>
        </div>
        <Link to="/mythos-readiness"
              className="ml-auto bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-4 py-2 rounded-md text-sm font-semibold transition">
          Free Assessment →
        </Link>
      </div>
    </nav>
  );
}

function NavLink({ to, active, badge, children }) {
  return (
    <Link to={to}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition relative ${
            active ? 'text-cyan-400 bg-cyan-400/8' : 'text-slate-300 hover:text-white hover:bg-slate-100/5'
          }`}>
      {children}
      {badge && (
        <span className="ml-1.5 px-1 py-0.5 bg-cyan-400 text-slate-900 text-[0.55rem] font-mono font-semibold rounded uppercase tracking-wider">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-slate-950/60 border-t border-slate-700/30 px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-10 pb-10 border-b border-slate-700/30">
          <div>
            <Link to="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-[0.7rem] font-bold text-slate-900">CV</span>
              CVE<span className="text-cyan-400">Pulse</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Vulnerability intelligence for the AI exploit era. Free dashboards, Mythos Readiness tools,
              and CTEM advisory for security teams who move at AI speed.
            </p>
          </div>
          <FooterCol title="Intelligence" links={[
            ['CVE Intelligence', '/cve-intelligence'],
            ['CVE Trends', '/cvetrends'],
            ['KEV Tracker', '/kev'],
          ]} />
          <FooterCol title="Mythos Defense" links={[
            ['Readiness Index', '/mythos-readiness'],
            ['Mythos Lens', '/mythos-lens'],
            ['Field Notes', '/insights/mythos'],
          ]} />
          <FooterCol title="Company" links={[
            ['Services', '/services'],
            ['Pricing', '/pricing'],
            ['About', '/about'],
            ['Contact', 'mailto:business@cvepulse.com'],
          ]} />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500 flex-wrap gap-3">
          <div>© 2026 CVEPulse · Built for the AI exploit era</div>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-cyan-400 transition">Terms</Link>
            <Link to="/privacy" className="hover:text-cyan-400 transition">Privacy</Link>
            <Link to="/security" className="hover:text-cyan-400 transition">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h5 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 font-semibold">// {title}</h5>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith('mailto:')
              ? <a href={href} className="text-sm text-slate-300 hover:text-cyan-400 transition">{label}</a>
              : <Link to={href} className="text-sm text-slate-300 hover:text-cyan-400 transition">{label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}
