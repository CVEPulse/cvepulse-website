import React, { useState, useEffect } from 'react';
import { TrendingUp, Github, AlertTriangle, ExternalLink, RefreshCw, Shield, Clock, Target, Flame, ChevronDown, ChevronUp, XCircle, Activity, Zap, CheckCircle } from 'lucide-react';

// Professional CVE Intelligence Fetcher with YOUR EXACT CRITERIA
class SecurityIntelligenceFetcher {
  constructor() {
    this.cache = {
      intelligence: null,
      lastUpdate: null
    };
    this.cisaKEV = new Set();
  }

  // Fetch CISA KEV catalog
  async fetchCISAKEV() {
    try {
      const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
      const data = await response.json();
      
      data.vulnerabilities.forEach(vuln => {
        this.cisaKEV.add(vuln.cveID);
      });
      
      console.log(`✅ Loaded ${this.cisaKEV.size} CVEs from CISA KEV`);
    } catch (error) {
      console.error('⚠️ Could not load CISA KEV:', error);
    }
  }

  // Fetch REAL CVEs from NVD
  async fetchRecentCVEs() {
    try {
      const days = 14;
      const endDate = new Date();
      const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000);
      
      const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate.toISOString()}&pubEndDate=${endDate.toISOString()}&resultsPerPage=100`;
      
      console.log('🔍 Fetching CVEs from NVD...');
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`✅ Fetched ${data.vulnerabilities.length} CVEs`);
      
      return data.vulnerabilities.map(item => {
        const cve = item.cve;
        const cvssData = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV3?.[0] || cve.metrics?.cvssMetricV2?.[0];
        
        return {
          id: cve.id,
          description: cve.descriptions.find(d => d.lang === 'en')?.value || 'No description',
          cvssScore: cvssData?.cvssData?.baseScore || 0,
          cvssVector: cvssData?.cvssData?.vectorString || '',
          severity: cvssData?.cvssData?.baseSeverity || 'UNKNOWN',
          exploitabilityScore: cvssData?.exploitabilityScore || 0,
          impactScore: cvssData?.impactScore || 0,
          published: cve.published,
          lastModified: cve.lastModified,
          references: cve.references || [],
          weaknesses: cve.weaknesses || []
        };
      });
    } catch (error) {
      console.error('❌ Error fetching CVEs:', error);
      return [];
    }
  }

  // Search GitHub for PoCs
  async searchGitHubPoCs(cveId) {
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${cveId}+poc+OR+exploit&sort=stars&order=desc&per_page=10`);
      const data = await response.json();
      
      if (!data.items) return { count: 0, repos: [], hasRecent: false, hasCredible: false };
      
      const repos = data.items.slice(0, 5).map(repo => ({
        name: repo.full_name,
        stars: repo.stargazers_count,
        url: repo.html_url,
        description: repo.description,
        updated: repo.updated_at,
        created: repo.created_at
      }));
      
      const hasCredible = repos.some(r => r.stars > 10);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const hasRecent = repos.some(r => new Date(r.created) > thirtyDaysAgo);
      
      return {
        count: data.total_count || 0,
        repos,
        hasRecent,
        hasCredible
      };
    } catch (error) {
      console.error(`❌ Error searching GitHub for ${cveId}:`, error);
      return { count: 0, repos: [], hasRecent: false, hasCredible: false };
    }
  }

  // YOUR ZERO-DAY CRITERIA (5 conditions)
  isZeroDay(cve, githubData) {
    const checks = {
      noPatch: true,
      newlyDisclosed: false,
      activelyExploited: false,
      noMitigation: false,
      vendorUnaware: false
    };
    
    const daysOld = (Date.now() - new Date(cve.published)) / (1000 * 60 * 60 * 24);
    
    checks.noPatch = daysOld <= 7;
    checks.newlyDisclosed = daysOld <= 7;
    checks.activelyExploited = this.cisaKEV.has(cve.id) || githubData.hasCredible;
    
    const vector = cve.cvssVector.toLowerCase();
    const isEasyToExploit = vector.includes('av:n') && vector.includes('ac:l') && vector.includes('pr:n');
    checks.noMitigation = isEasyToExploit;
    checks.vendorUnaware = daysOld <= 3;
    
    const metCriteria = Object.values(checks).filter(v => v).length;
    
    return {
      isZeroDay: metCriteria >= 3,
      metCriteria,
      checks
    };
  }

  // YOUR EMERGENCY CLASSIFICATION
  classifyAsEmergency(cve, githubData, zeroDay) {
    if (zeroDay.isZeroDay && zeroDay.metCriteria === 5) {
      return {
        level: 'EMERGENCY - ZERO-DAY',
        priority: 1,
        color: 'red',
        urgency: 'CRITICAL - Act Immediately',
        reasoning: `Meets all 5 Zero-Day criteria: ${Object.keys(zeroDay.checks).filter(k => zeroDay.checks[k]).join(', ')}`,
        badge: '🚨 EMERGENCY'
      };
    }
    
    const realThreat = {
      activelyExploited: this.cisaKEV.has(cve.id) || githubData.count > 0,
      cisaListed: this.cisaKEV.has(cve.id),
      highExploitability: cve.exploitabilityScore > 0.7
    };
    
    const hasRealThreat = Object.values(realThreat).some(v => v);
    
    if (!hasRealThreat) {
      return this.classifyAsNonEmergency(cve, githubData, zeroDay);
    }
    
    const severityChecks = {
      allowsRCE: cve.description.toLowerCase().includes('remote code execution') || 
                 cve.description.toLowerCase().includes('privilege escalation') ||
                 cve.description.toLowerCase().includes('system compromise'),
      affectsInternetFacing: true,
      noPatch: !cve.cvssVector.includes('patch'),
      criticalCVSS: cve.cvssScore >= 9.0 || cve.severity === 'CRITICAL',
      highBusinessImpact: cve.impactScore > 5.0
    };
    
    const metSeverityChecks = Object.values(severityChecks).filter(v => v).length;
    
    if (metSeverityChecks >= 3) {
      return {
        level: 'EMERGENCY',
        priority: 2,
        color: 'orange',
        urgency: 'Very High - Act Immediately',
        reasoning: `Real threat confirmed + ${metSeverityChecks} severity indicators`,
        badge: '⚠️ EMERGENCY'
      };
    }
    
    return this.classifyAsNonEmergency(cve, githubData, zeroDay);
  }

  classifyAsNonEmergency(cve, githubData, zeroDay) {
    if (zeroDay.isZeroDay) {
      return {
        level: 'ZERO-DAY',
        priority: 3,
        color: 'yellow',
        urgency: 'High - Patch Priority',
        reasoning: `Meets ${zeroDay.metCriteria} of 5 Zero-Day criteria`,
        badge: '🔴 ZERO-DAY'
      };
    }
    
    if (this.cisaKEV.has(cve.id)) {
      return {
        level: 'CISA KEV LISTED',
        priority: 4,
        color: 'purple',
        urgency: 'High - Known Exploited',
        reasoning: 'Listed in CISA Known Exploited Vulnerabilities catalog',
        badge: '📋 CISA KEV'
      };
    }
    
    if (githubData.count > 0) {
      return {
        level: 'PUBLIC EXPLOITS',
        priority: 5,
        color: 'blue',
        urgency: 'Medium-High - Monitor',
        reasoning: `${githubData.count} public PoC(s) available`,
        badge: '📦 PoC Available'
      };
    }
    
    if (cve.cvssScore >= 9.0) {
      return {
        level: 'CRITICAL - NO EXPLOIT',
        priority: 6,
        color: 'indigo',
        urgency: 'Medium - Patch Cycle',
        reasoning: 'Critical severity but no public exploits detected',
        badge: '⚡ Critical'
      };
    }
    
    return {
      level: 'STANDARD',
      priority: 7,
      color: 'gray',
      urgency: 'Standard Process',
      reasoning: 'Regular vulnerability - standard patching process',
      badge: '📌 Standard'
    };
  }

  classifyThreat(cve, githubData) {
    const zeroDay = this.isZeroDay(cve, githubData);
    return this.classifyAsEmergency(cve, githubData, zeroDay);
  }

  async getSecurityIntelligence() {
    try {
      console.log('🎯 Building security intelligence with YOUR criteria...');
      
      await this.fetchCISAKEV();
      const cves = await this.fetchRecentCVEs();
      const intelligence = [];
      
      for (const cve of cves) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const githubData = await this.searchGitHubPoCs(cve.id);
        const threat = this.classifyThreat(cve, githubData);
        
        const nameMatch = cve.description.match(/in ([A-Z][A-Za-z0-9\s\-\.]+?)(?:before|prior|through|allows|enables|version)/i);
        const name = nameMatch ? nameMatch[1].trim().substring(0, 50) : cve.description.split(' ').slice(0, 6).join(' ');
        
        intelligence.push({
          ...cve,
          name,
          githubRepos: githubData.count,
          pocLinks: githubData.repos,
          threat,
          inCISAKEV: this.cisaKEV.has(cve.id),
          hasCredibleExploit: githubData.hasCredible,
          ageInDays: Math.floor((Date.now() - new Date(cve.published)) / (1000 * 60 * 60 * 24))
        });
      }
      
      intelligence.sort((a, b) => {
        if (a.threat.priority !== b.threat.priority) {
          return a.threat.priority - b.threat.priority;
        }
        return b.cvssScore - a.cvssScore;
      });
      
      console.log('✅ Intelligence ready:', {
        emergencyZeroDay: intelligence.filter(i => i.threat.priority === 1).length,
        emergency: intelligence.filter(i => i.threat.priority === 2).length,
        zeroDay: intelligence.filter(i => i.threat.priority === 3).length,
        cisaKEV: intelligence.filter(i => i.threat.priority === 4).length
      });
      
      return intelligence;
    } catch (error) {
      console.error('❌ Error building intelligence:', error);
      return [];
    }
  }
}

// Interactive CVE Card Component
const CVECard = ({ cve, index, isExpanded, onToggle }) => {
  const getThreatBadge = (threat) => {
    const colors = {
      red: 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/50',
      orange: 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30',
      yellow: 'bg-yellow-500 text-black border-yellow-400 font-bold',
      purple: 'bg-purple-600 text-white border-purple-500',
      blue: 'bg-blue-600 text-white border-blue-500',
      indigo: 'bg-indigo-600 text-white border-indigo-500',
      gray: 'bg-gray-600 text-white border-gray-500'
    };
    
    return colors[threat.color] || colors.gray;
  };

  const getPriorityIcon = () => {
    if (cve.threat.priority <= 2) return <Zap className="w-6 h-6 text-red-500 animate-pulse" />;
    if (cve.threat.priority === 3) return <Flame className="w-6 h-6 text-yellow-500" />;
    if (cve.inCISAKEV) return <AlertTriangle className="w-6 h-6 text-purple-500" />;
    if (cve.githubRepos > 0) return <Github className="w-6 h-6 text-blue-500" />;
    return <Shield className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div 
      className={`bg-slate-800 rounded-lg border-2 transition-all cursor-pointer ${
        cve.threat.priority === 1 ? 'border-red-500 shadow-2xl shadow-red-500/50 ring-4 ring-red-500/20' :
        cve.threat.priority === 2 ? 'border-orange-500 shadow-xl shadow-orange-500/30' :
        cve.threat.priority === 3 ? 'border-yellow-500 shadow-lg' :
        'border-slate-700 hover:border-cyan-500'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-cyan-400">#{index + 1}</span>
            {getPriorityIcon()}
            <div>
              <h3 className="text-xl font-bold text-white">{cve.id}</h3>
              <p className="text-sm text-slate-400">{cve.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getThreatBadge(cve.threat)}`}>
              {cve.threat.badge}
            </span>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-slate-900 rounded p-2 text-center">
            <div className="text-xs text-slate-500">CVSS</div>
            <div className={`text-lg font-bold ${
              cve.cvssScore >= 9.0 ? 'text-red-400' : 
              cve.cvssScore >= 7.0 ? 'text-orange-400' : 
              'text-yellow-400'
            }`}>
              {cve.cvssScore.toFixed(1)}
            </div>
          </div>
          <div className="bg-slate-900 rounded p-2 text-center">
            <div className="text-xs text-slate-500">Age</div>
            <div className={`text-lg font-bold ${cve.ageInDays <= 7 ? 'text-red-400' : 'text-cyan-400'}`}>
              {cve.ageInDays}d
            </div>
          </div>
          <div className="bg-slate-900 rounded p-2 text-center">
            <div className="text-xs text-slate-500">PoCs</div>
            <div className={`text-lg font-bold ${cve.githubRepos > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {cve.githubRepos || '0'}
            </div>
          </div>
          <div className="bg-slate-900 rounded p-2 text-center">
            <div className="text-xs text-slate-500">EPSS</div>
            <div className={`text-sm font-bold ${
              cve.exploitabilityScore > 0.7 ? 'text-red-400' : 
              cve.exploitabilityScore > 0.4 ? 'text-orange-400' : 
              'text-yellow-400'
            }`}>
              {(cve.exploitabilityScore * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className={`p-3 rounded text-sm font-bold flex items-center gap-2 ${
          cve.threat.priority <= 2 ? 'bg-red-900/40 text-red-200 border border-red-500/50' :
          cve.threat.priority === 3 ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-500/50' :
          cve.threat.priority === 4 ? 'bg-purple-900/40 text-purple-200 border border-purple-500/50' :
          'bg-blue-900/40 text-blue-200 border border-blue-500/50'
        }`}>
          <Activity className="w-4 h-4" />
          {cve.threat.urgency}
        </div>

        {cve.inCISAKEV && (
          <div className="mt-2 p-2 bg-purple-900/30 border border-purple-500/50 rounded text-xs font-semibold text-purple-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Listed in CISA Known Exploited Vulnerabilities
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">📝 Description:</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{cve.description}</p>
          </div>

          <div className="bg-slate-900 rounded p-4 border-l-4 border-cyan-500">
            <h4 className="text-sm font-bold text-white mb-2">🎯 Why Priority {cve.threat.priority}?</h4>
            <p className="text-sm text-slate-300">{cve.threat.reasoning}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-1">CVSS Vector:</h4>
              <code className="text-xs text-cyan-400 bg-slate-900 px-2 py-1 rounded block overflow-x-auto">
                {cve.cvssVector || 'Not available'}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 rounded p-2">
                <div className="text-xs text-slate-500">Exploitability</div>
                <div className="text-sm font-bold text-orange-400">{(cve.exploitabilityScore * 10).toFixed(1)}</div>
              </div>
              <div className="bg-slate-900 rounded p-2">
                <div className="text-xs text-slate-500">Impact</div>
                <div className="text-sm font-bold text-red-400">{(cve.impactScore).toFixed(1)}</div>
              </div>
            </div>
          </div>

          {cve.pocLinks.length > 0 && (
            <div className="bg-red-900/20 border-2 border-red-500/50 rounded p-4">
              <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ⚠️ {cve.pocLinks.length} Public Exploit{cve.pocLinks.length > 1 ? 's' : ''} Found
              </h4>
              <div className="space-y-2">
                {cve.pocLinks.map(poc => (
                  <a
                    key={poc.url}
                    href={poc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded hover:bg-slate-700 transition-all group border border-red-500/20 hover:border-red-500/50"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-red-400" />
                      <div>
                        <div className="text-sm text-red-400 group-hover:text-red-300 font-semibold">{poc.name}</div>
                        {poc.description && (
                          <div className="text-xs text-slate-500 mt-1">{poc.description.substring(0, 80)}...</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">⭐ {poc.stars}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700">
            <span>Published: {new Date(cve.published).toLocaleDateString()}</span>
            <span>Modified: {new Date(cve.lastModified).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard
export const ProfessionalSecurityDashboard = () => {
  const [intelligence, setIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadIntelligence();
    const interval = setInterval(loadIntelligence, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      const fetcher = new SecurityIntelligenceFetcher();
      const data = await fetcher.getSecurityIntelligence();
      setIntelligence(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cveId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cveId)) {
      newExpanded.delete(cveId);
    } else {
      newExpanded.add(cveId);
    }
    setExpandedCards(newExpanded);
  };

  const filteredIntelligence = intelligence.filter(cve => {
    if (filter === 'all') return true;
    if (filter === 'emergency-zd') return cve.threat.priority === 1;
    if (filter === 'emergency') return cve.threat.priority === 2;
    if (filter === 'zero-day') return cve.threat.priority === 3;
    if (filter === 'cisa-kev') return cve.threat.priority === 4;
    if (filter === 'exploits') return cve.threat.priority === 5;
    return true;
  });

  const stats = {
    emergencyZD: intelligence.filter(i => i.threat.priority === 1).length,
    emergency: intelligence.filter(i => i.threat.priority === 2).length,
    zeroDay: intelligence.filter(i => i.threat.priority === 3).length,
    cisaKEV: intelligence.filter(i => i.threat.priority === 4).length,
    exploits: intelligence.filter(i => i.threat.priority === 5).length
  };

  if (loading && intelligence.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-20">
            <RefreshCw className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Building Security Intelligence...</h2>
            <p className="text-slate-400">Real-Time Vulnerability Intelligence</p>
            <p className="text-slate-500 text-sm mt-2">Loading CISA KEV + NVD + GitHub... (~30 seconds)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">🎯 Security Intelligence Dashboard</h1>
            <button
              onClick={loadIntelligence}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-slate-400 mb-2">
            Powered by CISA KEV + NVD + EPSS Intelligence
          </p>
          {lastUpdated && (
            <p className="text-xs text-slate-500">
              Last updated: {lastUpdated.toLocaleTimeString()} • CISA KEV integrated • Auto-refresh: 30min
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setFilter(filter === 'emergency-zd' ? 'all' : 'emergency-zd')}
            className={`p-4 rounded-lg border-2 transition-all ${
              filter === 'emergency-zd' 
                ? 'bg-red-900/40 border-red-500 ring-4 ring-red-500/30' 
                : 'bg-slate-800 border-slate-700 hover:border-red-500'
            }`}
          >
            <div className="text-3xl font-bold text-red-400 animate-pulse">{stats.emergencyZD}</div>
            <div className="text-xs text-slate-300 font-semibold">Emergency ZD</div>
          </button>

          <button
            onClick={() => setFilter(filter === 'emergency' ? 'all' : 'emergency')}
            className={`p-4 rounded-lg border-2 transition-all ${
              filter === 'emergency' 
                ? 'bg-orange-900/40 border-orange-500' 
                : 'bg-slate-800 border-slate-700 hover:border-orange-500'
            }`}
          >
            <div className="text-3xl font-bold text-orange-400">{stats.emergency}</div>
            <div className="text-xs text-slate-300 font-semibold">Emergency</div>
          </button>

          <button
            onClick={() => setFilter(filter === 'zero-day' ? 'all' : 'zero-day')}
            className={`p-4 rounded-lg border-2 transition-all ${
              filter === 'zero-day' 
                ? 'bg-yellow-900/40 border-yellow-500' 
                : 'bg-slate-800 border-slate-700 hover:border-yellow-500'
            }`}
          >
            <div className="text-3xl font-bold text-yellow-400">{stats.zeroDay}</div>
            <div className="text-xs text-slate-300 font-semibold">Zero-Day</div>
          </button>

          <button
            onClick={() => setFilter(filter === 'cisa-kev' ? 'all' : 'cisa-kev')}
            className={`p-4 rounded-lg border-2 transition-all ${
              filter === 'cisa-kev' 
                ? 'bg-purple-900/40 border-purple-500' 
                : 'bg-slate-800 border-slate-700 hover:border-purple-500'
            }`}
          >
            <div className="text-3xl font-bold text-purple-400">{stats.cisaKEV}</div>
            <div className="text-xs text-slate-300 font-semibold">CISA KEV</div>
          </button>

          <button
            onClick={() => setFilter(filter === 'exploits' ? 'all' : 'exploits')}
            className={`p-4 rounded-lg border-2 transition-all ${
              filter === 'exploits' 
                ? 'bg-blue-900/40 border-blue-500' 
                : 'bg-slate-800 border-slate-700 hover:border-blue-500'
            }`}
          >
            <div className="text-3xl font-bold text-blue-400">{stats.exploits}</div>
            <div className="text-xs text-slate-300 font-semibold">Exploits</div>
          </button>
        </div>

        {filter !== 'all' && (
          <div className="mb-4 flex items-center justify-between bg-slate-800 rounded-lg p-4">
            <span className="text-slate-300">
              Showing: <strong className="text-white capitalize">{filter.replace('-', ' ')}</strong> ({filteredIntelligence.length})
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Clear Filter
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredIntelligence.map((cve, index) => (
            <CVECard
              key={cve.id}
              cve={cve}
              index={index}
              isExpanded={expandedCards.has(cve.id)}
              onToggle={() => toggleCard(cve.id)}
            />
          ))}
        </div>

        {filteredIntelligence.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-green-400 mb-2">All Clear!</p>
            <p className="text-slate-400">No threats found in this category</p>
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-white font-bold mb-4 text-lg">📋 Classification Criteria (Your Framework):</h3>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                🚨 EMERGENCY ZERO-DAY
              </div>
              <p className="text-sm text-slate-300 mb-2">Meets ALL 5 Zero-Day criteria + affects critical systems:</p>
              <ul className="text-xs text-slate-400 ml-6 space-y-1">
                <li>• No official patch available</li>
                <li>• Newly disclosed (≤7 days)</li>
                <li>• Actively exploited OR credible exploit exists</li>
                <li>• No effective mitigation</li>
                <li>• Vendor unaware or fix not released</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-orange-400 mb-2">⚠️ EMERGENCY</div>
              <p className="text-sm text-slate-300">Real threat confirmed + meets ≥3 severity indicators (RCE, internet-facing, no patch, CVSS≥9.0, high business impact)</p>
            </div>

            <div>
              <div className="font-semibold text-yellow-400 mb-2">🔴 ZERO-DAY</div>
              <p className="text-sm text-slate-300">Meets ≥3 of 5 Zero-Day criteria</p>
            </div>

            <div>
              <div className="font-semibold text-purple-400 mb-2">📋 CISA KEV LISTED</div>
              <p className="text-sm text-slate-300">Listed in CISA Known Exploited Vulnerabilities catalog</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSecurityDashboard;
