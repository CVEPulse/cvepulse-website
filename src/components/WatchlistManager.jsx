import React, { useState, useEffect } from 'react';
import { X, Eye, Plus, Trash2, Key, Copy, Check } from 'lucide-react';

const WatchlistManager = ({ isOpen, onClose, onWatchlistChange }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [newVendor, setNewVendor] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const popularVendors = [
    'Microsoft', 'Cisco', 'Fortinet', 'Ivanti', 'Palo Alto Networks',
    'VMware', 'Adobe', 'Apache', 'Citrix', 'Oracle', 'SAP', 'Juniper',
    'F5', 'SonicWall', 'Atlassian', 'Zoom', 'Salesforce', 'Google'
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cvepulse_watchlist') || '[]');
    setWatchlist(saved);
    setApiKey(localStorage.getItem('cvepulse_api_key') || '');
  }, [isOpen]);

  const addVendor = (vendor) => {
    const v = vendor.trim();
    if (!v || watchlist.includes(v)) return;
    
    const updated = [...watchlist, v];
    setWatchlist(updated);
    localStorage.setItem('cvepulse_watchlist', JSON.stringify(updated));
    setNewVendor('');
    onWatchlistChange?.(updated);
  };

  const removeVendor = (vendor) => {
    const updated = watchlist.filter(v => v !== vendor);
    setWatchlist(updated);
    localStorage.setItem('cvepulse_watchlist', JSON.stringify(updated));
    onWatchlistChange?.(updated);
  };

  const generateApiKey = () => {
    const key = 'cvp_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    setApiKey(key);
    localStorage.setItem('cvepulse_api_key', key);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Vendor Watchlist
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Vendor */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Track Specific Vendors</label>
            <p className="text-xs text-slate-500 mb-3">
              Add vendors to your watchlist to filter vulnerabilities and get targeted alerts.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addVendor(newVendor)}
                placeholder="Enter vendor name (e.g., Microsoft)"
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={() => addVendor(newVendor)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Watchlist */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Your Watchlist ({watchlist.length})
            </h3>
            {watchlist.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No vendors in watchlist yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {watchlist.map((vendor) => (
                  <span
                    key={vendor}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-400"
                  >
                    <Eye className="w-3 h-3" />
                    {vendor}
                    <button
                      onClick={() => removeVendor(vendor)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Popular Vendors */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Popular Vendors</h3>
            <div className="flex flex-wrap gap-2">
              {popularVendors
                .filter(v => !watchlist.includes(v))
                .slice(0, 12)
                .map((vendor) => (
                  <button
                    key={vendor}
                    onClick={() => addVendor(vendor)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-sm text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-all"
                  >
                    + {vendor}
                  </button>
                ))}
            </div>
          </div>

          {/* API Access */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white">API Access</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${apiKey ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {apiKey ? 'Active' : 'Free Tier'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Access CVEPulse data programmatically. Generate an API key to integrate with your security tools.
            </p>

            {apiKey ? (
              <div className="bg-slate-900 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-cyan-400 break-all">{apiKey}</code>
                  <button
                    onClick={copyApiKey}
                    className="ml-2 px-2 py-1 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-500 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : null}

            <button
              onClick={generateApiKey}
              className="w-full py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"
            >
              {apiKey ? 'Regenerate API Key' : 'Generate API Key'}
            </button>

            {/* API Endpoints Info */}
            <div className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-cyan-400 mb-2">API Endpoints:</p>
              <div className="space-y-1 text-xs text-slate-400 font-mono">
                <p>GET /api/v1/kev - All KEV vulnerabilities</p>
                <p>GET /api/v1/kev/new - New this week</p>
                <p>GET /api/v1/kev/&#123;cveId&#125; - Specific CVE</p>
                <p>GET /api/v1/watchlist - Your watchlist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistManager;
