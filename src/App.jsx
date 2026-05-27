import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import './styles/global.css';

// Lazy load all pages for performance
const Home = lazy(() => import('./pages/Home'));
const MythosDefense = lazy(() => import('./pages/MythosDefense'));
const MythosReadiness = lazy(() => import('./pages/MythosReadiness'));
const MythosLens = lazy(() => import('./pages/MythosLens'));

// Free dashboards
const CVEIntelligence = lazy(() => import('./pages/CVEIntelligence'));
const CVETrends = lazy(() => import('./pages/CVETrends'));
const KEVTracker = lazy(() => import('./pages/KEVTracker'));

// Marketing pages
const Pricing = lazy(() => import('./pages/Pricing'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Insights = lazy(() => import('./pages/Insights'));

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-8">
      <div className="text-center max-w-2xl">
        <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-3">// 404</div>
        <h1 className="text-5xl font-bold mb-4 text-white tracking-tight">Page not found.</h1>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist — or it's been moved.</p>
        <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-semibold">← Back to home</Link>
      </div>
    </div>
  );
}

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

          {/* Mythos Defense suite */}
          <Route path="/mythos-defense" element={<MythosDefense />} />
          <Route path="/mythos-readiness" element={<MythosReadiness />} />
          <Route path="/mythos-lens" element={<MythosLens />} />

          {/* Free dashboards - Mythos enhanced */}
          <Route path="/cve-intelligence" element={<CVEIntelligence />} />
          <Route path="/intelligence" element={<CVEIntelligence />} />
          <Route path="/cvetrends" element={<CVETrends />} />
          <Route path="/cve-trends" element={<CVETrends />} />
          <Route path="/kev" element={<KEVTracker />} />
          <Route path="/kev-tracker" element={<KEVTracker />} />

          {/* Marketing & company */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/insights" element={<Insights />} />

          {/* Legal placeholders */}
          <Route path="/terms" element={<NotFound />} />
          <Route path="/privacy" element={<NotFound />} />
          <Route path="/security" element={<NotFound />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
