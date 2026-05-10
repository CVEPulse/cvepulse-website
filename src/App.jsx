import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/Layout';

// Lazy load pages for performance - only loads what visitor needs
const Home = lazy(() => import('./pages/Home'));
const MythosDefense = lazy(() => import('./pages/MythosDefense'));
const CVEIntelligence = lazy(() => import('./pages/CVEIntelligence'));
const CVETrends = lazy(() => import('./pages/CVETrends'));
const KEVTracker = lazy(() => import('./pages/KEVTracker'));

// Stub pages - replace with your existing components
const Stub = ({ title }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-8">
    <div className="text-center max-w-2xl">
      <h1 className="text-4xl font-bold mb-4 text-white">{title}</h1>
      <p className="text-slate-400 mb-6">This page exists in your current site — keep your existing component or wire it up here.</p>
      <a href="/" className="text-cyan-400 hover:text-cyan-300 font-semibold">← Back to home</a>
    </div>
  </div>
);

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="font-mono text-sm uppercase tracking-wider">Loading...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mythos-defense" element={<MythosDefense />} />

          {/* Free dashboards - Mythos enhanced */}
          <Route path="/cve-intelligence" element={<CVEIntelligence />} />
          <Route path="/intelligence" element={<CVEIntelligence />} />
          <Route path="/cvetrends" element={<CVETrends />} />
          <Route path="/kev" element={<KEVTracker />} />

          {/* Existing pages - swap stubs for your real components */}
          <Route path="/services" element={<Stub title="Services" />} />
          <Route path="/insights" element={<Stub title="Insights" />} />
          <Route path="/pricing" element={<Stub title="Pricing" />} />
          <Route path="/about" element={<Stub title="About" />} />
          <Route path="/mythos-readiness" element={<Stub title="Mythos Readiness Index" />} />
          <Route path="/mythos-lens" element={<Stub title="Mythos Lens" />} />

          <Route path="*" element={<Stub title="404 — Page not found" />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
