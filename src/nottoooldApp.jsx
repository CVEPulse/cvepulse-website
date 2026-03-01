import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Search, Mail, Phone, MapPin, CheckCircle, ArrowRight, Menu, X, AlertTriangle, Globe, Lock, Zap, Users, Award, ExternalLink, Target, Activity, Github, AlertCircle, Newspaper, Radio, RefreshCw, Bell, Eye, DollarSign } from 'lucide-react';
import ProfessionalSecurityDashboard from './ProfessionalSecurityDashboard';

// Phase 3 Components
// Pricing moved to standalone /pricing.html
import AlertsModal from './components/AlertsModal';
import WatchlistManager from './components/WatchlistManager';

const CVEPulseWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  
  // Phase 3 State
  const [showAlerts, setShowAlerts] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState(
    JSON.parse(localStorage.getItem('cvepulse_watchlist') || '[]')
  );

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
  ];

  const dashboardLinks = [
    { name: 'CVE Intelligence', href: '/cve-intelligence.html', tagline: 'Know what to fix', color: 'text-cyan-400', icon: '🔬' },
    { name: '🔥 CVE Trends', href: '/cvetrends.html', tagline: 'Know what to watch', color: 'text-orange-400', icon: '📈' },
    { name: 'KEV Dashboard', href: '/dashboard.html', tagline: "Know what's under attack", color: 'text-red-400', icon: '🛡️' },
    { name: 'Threat Intelligence', href: '/threat-dashboard.html', tagline: 'Know who is attacking', color: 'text-purple-400', icon: '🌐' },
  ];

  const services = [
    {
      icon: Shield,
      title: 'Vulnerability Management',
      description: 'Comprehensive VM program assessment, emergency response, and world-class attack surface management.',
      features: ['VM Assessment', 'Zero-Day Response', 'CTEM Management', 'Patch Governance'],
      categories: [
        {
          name: 'VM Program Assessment & Strategy',
          items: ['Current state assessment', 'Backlog assessment', 'World-class program delivery']
        },
        {
          name: 'Emergency & Zero-Day Response',
          items: ['Real-time prioritization', 'Zero-day management']
        },
        {
          name: 'Backlog Remediation & Contextualization',
          items: ['Systematic backlog reduction', 'Risk-based contextualization']
        },
        {
          name: 'Vulnerability Scanning & Implementation',
          items: ['Enterprise scanning', 'Scanner deployment']
        },
        {
          name: 'CTEM (Continuous Threat Exposure Management)',
          items: ['Program management', 'Configuration & automation']
        },
        {
          name: 'Attack Surface Management',
          items: ['EASM configuration', 'Full ASM strategy']
        },
        {
          name: 'Tool Selection & Integration',
          items: ['Vendor evaluation', 'Multi-tool orchestration']
        },
        {
          name: 'Cloud Security & VM',
          items: ['Multi-cloud strategy', 'DevSecOps integration']
        },
        {
          name: 'Threat Intelligence Integration',
          items: ['Threat-informed VM', 'Custom threat intel']
        },
        {
          name: 'Patch Governance',
          items: ['Patch management', 'ASM-driven prioritization']
        }
      ],
      engagementModels: [
        'Assessment & Consulting (fixed-price)',
        'Managed Services (retainers)',
        'Staff Augmentation (embedded experts)',
        'Advisory Services (strategic guidance)'
      ]
    },
    {
      icon: Target,
      title: 'Threat Intelligence',
      description: 'Sector-specific threat reports, dark web monitoring, and real-time IoC feeds for proactive defense.',
      features: ['Dark Web Monitoring', 'IoC Feeds', 'Threat Actor Tracking', 'Executive Briefings'],
      categories: [
        {
          name: 'Strategic Threat Intelligence',
          items: ['Executive briefings', 'Sector-specific reports (Finance, Healthcare, Manufacturing, Technology, Government, Retail, Energy)', 'Threat actor profiling']
        },
        {
          name: 'Tactical Threat Intelligence',
          items: ['IoC feeds (IP, domain, hash, email)', 'TIP implementation', 'SIEM integration (Sentinel, Splunk, QRadar)']
        },
        {
          name: 'Dark Web & Underground Monitoring',
          items: ['Dark web intelligence', 'Brand protection', 'Compromised credential monitoring']
        },
        {
          name: 'Threat Hunting & Research',
          items: ['Proactive hunting', 'Custom research', 'Vulnerability-threat correlation']
        },
        {
          name: 'Incident-Driven Intelligence',
          items: ['Post-incident analysis', 'IoC extraction']
        }
      ]
    },
    {
      icon: Lock,
      title: 'Application Threat Modeling',
      description: 'Enterprise-level threat modeling with custom SIEM use cases for Microsoft Sentinel and beyond.',
      features: ['STRIDE Analysis', 'Custom SIEM Rules', 'API Security', 'Cloud App Security'],
      categories: [
        {
          name: 'Enterprise Application Threat Modeling',
          items: ['STRIDE methodology', 'Custom SIEM use cases for Microsoft Sentinel', 'Generic SIEM use cases (Splunk, QRadar, LogRhythm)', 'SDLC integration']
        },
        {
          name: 'API & Microservices Threat Modeling',
          items: ['REST/GraphQL/SOAP security', 'Microservices architecture']
        },
        {
          name: 'Cloud Application Threat Modeling',
          items: ['Cloud-native apps', 'Multi-tenant security']
        }
      ]
    },
    {
      icon: Activity,
      title: 'SOC Monitoring',
      description: '24/7 security operations with managed detection, response, and threat hunting capabilities.',
      features: ['24/7 MDR', 'SIEM Management', 'Incident Response', 'Detection Engineering']
    }
  ];

  const stats = [
    { number: '500+', label: 'Vulnerabilities Tracked Daily' },
    { number: '24/7', label: 'Security Monitoring' },
    { number: '15min', label: 'Auto-Refresh Intelligence' },
    { number: '100%', label: 'Threat Coverage' }
  ];

  // Pricing now lives at /pricing.html (two-tab: Services + Dashboard Plans)

  // CVE Dashboard Component
  // CVE Dashboard Component - PROFESSIONAL SECURITY ANALYST DASHBOARD
  const CVEDashboard = () => {
    return <ProfessionalSecurityDashboard />;
  };

  const ThreatDashboard = () => {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sectorFilter, setSectorFilter] = useState('all');
    const [threatTypeFilter, setThreatTypeFilter] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [nextRefreshIn, setNextRefreshIn] = useState(15 * 60);

    const sectors = ['all', 'finance', 'healthcare', 'manufacturing', 'technology', 'government', 'retail', 'energy'];
    const threatTypes = ['all', 'ransomware', 'apt', 'malware', 'phishing', 'data-breach', 'ddos', 'insider-threat'];

    useEffect(() => {
      loadThreatData();
    }, []);

    useEffect(() => {
      if (!autoRefreshEnabled) return;
      const refreshInterval = setInterval(() => {
        loadThreatData();
      }, 15 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }, [autoRefreshEnabled]);

    useEffect(() => {
      if (!autoRefreshEnabled) return;
      const countdownInterval = setInterval(() => {
        setNextRefreshIn(prev => {
          if (prev <= 1) return 15 * 60;
          return prev - 1;
        });
      }, 1000);
      return () => countdownInterval;
    }, [autoRefreshEnabled]);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setAutoRefreshEnabled(false);
        } else {
          setAutoRefreshEnabled(true);
          setNextRefreshIn(15 * 60);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const handleManualRefresh = () => {
      setNextRefreshIn(15 * 60);
      loadThreatData();
    };

    const formatTimeAgo = (date) => {
      if (!date) return 'Never';
      const seconds = Math.floor((Date.now() - date) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    };

    const formatCountdown = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const loadThreatData = async () => {
      setLoading(true);

      const sampleThreats = [
        {
          id: 'THR-2024-001',
          name: 'LockBit 3.0 Ransomware Campaign',
          type: 'ransomware',
          severity: 'CRITICAL',
          sectors: ['finance', 'healthcare', 'manufacturing'],
          description: 'Active LockBit 3.0 ransomware campaign targeting financial institutions with double extortion tactics',
          indicators: ['45.142.212.61', 'lockbit3xcvrsudaq.onion', 'ransom.exe'],
          firstSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 47,
          darkWebMentions: 156,
          threatActor: 'LockBit Group',
          ttps: ['T1486', 'T1490', 'T1027'],
          confidence: 95
        },
        {
          id: 'THR-2024-002',
          name: 'APT29 (Cozy Bear) Spear Phishing',
          type: 'apt',
          severity: 'HIGH',
          sectors: ['government', 'technology', 'energy'],
          description: 'Russian APT29 conducting sophisticated spear-phishing targeting government contractors',
          indicators: ['malicious-doc.docm', '192.168.45.23', 'apt29-c2.example.com'],
          firstSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 12,
          darkWebMentions: 89,
          threatActor: 'APT29 (Cozy Bear)',
          ttps: ['T1566.001', 'T1059.001', 'T1071.001'],
          confidence: 88
        },
        {
          id: 'THR-2024-003',
          name: 'Qakbot Banking Trojan Resurgence',
          type: 'malware',
          severity: 'HIGH',
          sectors: ['finance', 'retail'],
          description: 'Qakbot malware campaign using hijacked email threads to distribute banking trojans',
          indicators: ['qakbot.dll', '103.56.149.78', 'a4b3c2d1e5f6g7h8'],
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 234,
          darkWebMentions: 421,
          threatActor: 'TA570',
          ttps: ['T1566.001', 'T1204.002', 'T1055'],
          confidence: 92
        },
        {
          id: 'THR-2024-004',
          name: 'Healthcare Data Breach - Black Basta',
          type: 'data-breach',
          severity: 'CRITICAL',
          sectors: ['healthcare'],
          description: 'Black Basta ransomware group leaked 2.3M patient records on dark web forum',
          indicators: ['blackbasta.onion', 'patient-data.7z', '87.120.254.12'],
          firstSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 8,
          darkWebMentions: 672,
          threatActor: 'Black Basta',
          ttps: ['T1486', 'T1567.002', 'T1078'],
          confidence: 97
        },
        {
          id: 'THR-2024-005',
          name: 'BEC Campaign Targeting CFOs',
          type: 'phishing',
          severity: 'MEDIUM',
          sectors: ['finance', 'manufacturing', 'retail'],
          description: 'Business Email Compromise campaign impersonating executives for wire transfer fraud',
          indicators: ['cfo-urgent@fake-domain.com', 'invoice-2024.pdf.exe'],
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 89,
          darkWebMentions: 23,
          threatActor: 'Scattered Spider',
          ttps: ['T1566.002', 'T1534', 'T1078.004'],
          confidence: 85
        },
        {
          id: 'THR-2024-006',
          name: 'Lazarus Group Crypto Exchange Attack',
          type: 'apt',
          severity: 'CRITICAL',
          sectors: ['finance', 'technology'],
          description: 'North Korean Lazarus Group targeting cryptocurrency exchanges with supply chain attack',
          indicators: ['lazarus-payload.bin', '45.67.89.123', 'crypto-stealer.js'],
          firstSeen: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 6,
          darkWebMentions: 134,
          threatActor: 'Lazarus Group (APT38)',
          ttps: ['T1195.002', 'T1071.001', 'T1573.001'],
          confidence: 93
        },
        {
          id: 'THR-2024-007',
          name: 'Industrial SCADA DDoS Attack',
          type: 'ddos',
          severity: 'HIGH',
          sectors: ['energy', 'manufacturing'],
          description: 'Coordinated DDoS attacks against industrial SCADA systems in energy sector',
          indicators: ['ddos-bot-network', '23.45.67.89', 'scada-flood.pcap'],
          firstSeen: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 15,
          darkWebMentions: 67,
          threatActor: 'Sandworm Team',
          ttps: ['T1498', 'T1499', 'T1583.006'],
          confidence: 81
        },
        {
          id: 'THR-2024-008',
          name: 'Insider Threat - Data Exfiltration',
          type: 'insider-threat',
          severity: 'HIGH',
          sectors: ['technology', 'finance'],
          description: 'Insider threat pattern detected: massive data exfiltration to personal cloud storage',
          indicators: ['unusual-upload-pattern', 'mega.nz', 'dropbox-api-abuse'],
          firstSeen: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          affectedOrgs: 31,
          darkWebMentions: 12,
          threatActor: 'Insider (Multiple)',
          ttps: ['T1048.003', 'T1567.002', 'T1530'],
          confidence: 76
        }
      ];

      const enrichedThreats = sampleThreats.map(threat => {
        const riskScore = calculateRiskScore(threat);
        const iocs = generateIOCs(threat);
        return { ...threat, riskScore, iocs };
      });

      const sorted = enrichedThreats.sort((a, b) => b.riskScore - a.riskScore);
      setThreats(sorted);
      setLastUpdated(Date.now());
      setLoading(false);
    };

    const calculateRiskScore = (threat) => {
      const severityWeight = { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 5 }[threat.severity] || 0;
      const confidenceWeight = (threat.confidence / 100) * 20;
      const impactWeight = Math.min(threat.affectedOrgs / 5, 20);
      const recencyWeight = Math.max(0, 20 - (Date.now() - new Date(threat.lastSeen)) / (1000 * 60 * 60 * 24));
      return Math.round(severityWeight + confidenceWeight + impactWeight + recencyWeight);
    };

    const generateIOCs = (threat) => {
      return threat.indicators.map((indicator, idx) => {
        let type = 'hash';
        if (indicator.includes('.')) {
          if (/^\d+\.\d+\.\d+\.\d+$/.test(indicator)) type = 'ip';
          else if (indicator.includes('.onion') || indicator.includes('.com')) type = 'domain';
          else type = 'file';
        } else if (/^[a-f0-9]{32,}$/i.test(indicator)) {
          type = 'hash';
        }
        return { value: indicator, type, id: `${threat.id}-IOC-${idx}` };
      });
    };

    const getSeverityColor = (severity) => {
      const colors = {
        CRITICAL: 'bg-red-100 text-red-800 border-red-300',
        HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
        MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        LOW: 'bg-green-100 text-green-800 border-green-300'
      };
      return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getThreatTypeColor = (type) => {
      const colors = {
        ransomware: 'bg-red-500/20 text-red-300 border-red-500',
        apt: 'bg-purple-500/20 text-purple-300 border-purple-500',
        malware: 'bg-orange-500/20 text-orange-300 border-orange-500',
        phishing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
        'data-breach': 'bg-pink-500/20 text-pink-300 border-pink-500',
        ddos: 'bg-blue-500/20 text-blue-300 border-blue-500',
        'insider-threat': 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
      };
      return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500';
    };

    const getIOCTypeIcon = (type) => {
      switch (type) {
        case 'ip': return '🌐';
        case 'domain': return '🔗';
        case 'hash': return '🔐';
        case 'file': return '📄';
        default: return '🔍';
      }
    };

    const filteredThreats = threats.filter(threat => {
      const matchesSearch = threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           threat.threatActor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'all' || threat.sectors.includes(sectorFilter);
      const matchesType = threatTypeFilter === 'all' || threat.type === threatTypeFilter;
      return matchesSearch && matchesSector && matchesType;
    });

    const topThreats = filteredThreats.slice(0, 8);
    const criticalCount = threats.filter(t => t.severity === 'CRITICAL').length;
    const aptCount = threats.filter(t => t.type === 'apt').length;
    const ransomwareCount = threats.filter(t => t.type === 'ransomware').length;
    const totalIOCs = threats.reduce((sum, t) => sum + t.indicators.length, 0);
    const totalDarkWebMentions = threats.reduce((sum, t) => sum + t.darkWebMentions, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Globe className="w-10 h-10 text-purple-400" />
                  <Activity className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Threat Intelligence
                  </h1>
                  <p className="text-slate-400 text-sm">Real-Time Threat Tracking | Dark Web | IoC Repository</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{aptCount}</div>
                  <div className="text-xs text-slate-400">APT Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{ransomwareCount}</div>
                  <div className="text-xs text-slate-400">Ransomware</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{totalIOCs}</div>
                  <div className="text-xs text-slate-400">IoCs</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search threats, actors, campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? 'All Sectors' : sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={threatTypeFilter}
                onChange={(e) => setThreatTypeFilter(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                {threatTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <span>Updated: {formatTimeAgo(lastUpdated)}</span>
                <span>•</span>
                <span>Next: {formatCountdown(nextRefreshIn)}</span>
                <button
                  onClick={handleManualRefresh}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Refresh now"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Threats Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading threat intelligence...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {topThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{threat.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getThreatTypeColor(threat.type)}`}>
                          {threat.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{threat.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-400">{threat.riskScore}</div>
                      <div className="text-xs text-slate-500">Risk Score</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                      <h4 className="text-white font-semibold mb-2 text-sm">Threat Intelligence</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Affected Organizations:</span>
                          <span className="text-orange-400 font-semibold">{threat.affectedOrgs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dark Web Mentions:</span>
                          <span className="text-pink-400 font-semibold">{threat.darkWebMentions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Confidence Level:</span>
                          <span className="text-green-400 font-semibold">{threat.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">First Seen:</span>
                          <span className="text-cyan-400">{new Date(threat.firstSeen).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Seen:</span>
                          <span className="text-cyan-400">{formatTimeAgo(new Date(threat.lastSeen).getTime())}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                      <h4 className="text-white font-semibold mb-2 text-sm">Targeted Sectors</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {threat.sectors.map((sector, sidx) => (
                          <span key={sidx} className="px-2 py-1 bg-blue-800/30 text-blue-200 text-xs rounded">
                            {sector.charAt(0).toUpperCase() + sector.slice(1)}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-white font-semibold mb-2 text-sm">MITRE ATT&CK TTPs</h4>
                      <div className="flex flex-wrap gap-2">
                        {threat.ttps.map((ttp, tidx) => (
                          <span key={tidx} className="px-2 py-1 bg-purple-800/30 text-purple-200 text-xs rounded font-mono">
                            {ttp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-700">
                    <h4 className="text-cyan-300 font-semibold mb-3 text-sm flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Indicators of Compromise (IoCs)
                    </h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      {threat.iocs.map((ioc, iidx) => (
                        <div key={iidx} className="bg-slate-900/50 rounded px-3 py-2 border border-slate-600">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400">{getIOCTypeIcon(ioc.type)} {ioc.type.toUpperCase()}</span>
                          </div>
                          <code className="text-cyan-400 text-xs font-mono break-all">{ioc.value}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>About Threat Intelligence</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              CVEPulse Threat Intelligence aggregates data from dark web forums, threat actor tracking, sector-specific 
              campaigns, and IoC repositories. Our risk scoring combines severity, confidence, affected organizations, 
              and recency to prioritize threats that matter most to your industry.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Home Page
  const HomePage = () => (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-4 py-1.5 rounded-full border border-cyan-400/20">Open-Source Intelligence Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 leading-tight">
            Prioritize the Vulnerabilities<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">That Actually Matter</span>
          </h1>
          <p className="text-lg md:text-xl text-center mb-10 text-slate-300 max-w-3xl mx-auto leading-relaxed">
            CVEPulse helps security teams cut through thousands of vulnerabilities by combining exploit intelligence, threat signals, and real-world risk context — through free operational dashboards and professional advisory services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => {
                const el = document.getElementById('dashboards-section');
                el && el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Eye className="w-5 h-5" />
              <span>Explore the Dashboards</span>
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="px-8 py-4 border border-slate-400 hover:border-white text-white rounded-lg font-semibold flex items-center space-x-2 transition-all"
            >
              <Mail className="w-5 h-5" />
              <span>Request a Consultation</span>
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                <div className="text-slate-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Problem Security Teams Face Every Day</h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Most vulnerability tools generate thousands of alerts. Very few help you understand which ones attackers are actually exploiting. CVEPulse exists to close that gap.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-semibold mb-2">Thousands of New CVEs</h3>
              <p className="text-slate-400 text-sm">NVD publishes 25,000+ CVEs per year. No team can investigate every one. You need signal, not noise.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="text-white font-semibold mb-2">Limited Patching Resources</h3>
              <p className="text-slate-400 text-sm">Patching windows are tight. Change management is slow. Every patch cycle requires hard prioritization choices.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">👁️</div>
              <h3 className="text-white font-semibold mb-2">Lack of Exploit Visibility</h3>
              <p className="text-slate-400 text-sm">CVSS scores tell you theoretical severity. They don't tell you if an exploit is live, a PoC is circulating, or attackers are actively targeting it.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-white font-semibold mb-2">Difficulty Prioritizing</h3>
              <p className="text-slate-400 text-sm">Without exploit intelligence, teams default to CVSS — patching 9.8s that may never be exploited while ignoring 7.5s under active attack.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-white font-semibold mb-2">Leadership Pressure</h3>
              <p className="text-slate-400 text-sm">CISOs need executive-ready reporting on what threats matter. Security teams need defensible prioritization, not just spreadsheets.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-white font-semibold mb-2">Expensive Tooling</h3>
              <p className="text-slate-400 text-sm">Enterprise vulnerability intelligence platforms cost $50K-$200K/year. Small and mid-size teams are left with raw feeds and manual work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SECURITY TEAMS USE CVEPULSE */}
      <section className="bg-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">How Security Teams Use CVEPulse</h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            From daily triage to executive briefings — CVEPulse fits into your existing security operations workflow.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-cyan-600/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Morning Vulnerability Triage</h3>
                <p className="text-slate-400 text-sm">Open CVE Intelligence to see overnight critical vulnerabilities scored by real-world risk, not just CVSS.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-orange-600/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Track Community Buzz</h3>
                <p className="text-slate-400 text-sm">Check CVE Trends to see what the security community is actively discussing before it hits your scanner.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-red-600/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Monitor Active Exploitation</h3>
                <p className="text-slate-400 text-sm">KEV Dashboard flags every CVE confirmed exploited in the wild with federal patching deadlines and SLA tracking.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Understand the Adversary</h3>
                <p className="text-slate-400 text-sm">Threat Intelligence surfaces threat actors targeting your sector with MITRE ATT&CK TTPs and IoCs.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-green-600/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Prioritize Patching</h3>
                <p className="text-slate-400 text-sm">Cross-reference dashboards to make defensible patch decisions backed by multiple intelligence sources.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Brief Leadership</h3>
                <p className="text-slate-400 text-sm">Share dashboard links with your CISO for instant visibility into the threat landscape — no report generation needed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Professional Advisory Services</h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Dashboards give you visibility. Our advisory services give you outcomes — from VM program maturity to zero-day response.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all border border-slate-700 hover:border-cyan-500">
                <service.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button 
              onClick={() => setCurrentPage('services')}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold inline-flex items-center space-x-2"
            >
              <span>View All Services</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section id="dashboards-section" className="bg-gradient-to-br from-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-3 text-white">Explore the CVEPulse Dashboards</h2>
          <p className="text-center text-slate-400 mb-4 max-w-2xl mx-auto text-lg">
            Four live dashboards. Four different questions answered. All free, no login required.
          </p>
          <p className="text-center text-cyan-400 mb-12 max-w-2xl mx-auto font-semibold italic">
            "Intelligence tells you what to fix. Trends tells you what to watch. KEV tells you what's under attack. Threat Intel tells you who is behind it."
          </p>
          <p className="text-center text-slate-500 mb-12 text-sm">
            All dashboards are free and available to the security community — no login, no paywall. Built by practitioners, for practitioners.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* CVE Intelligence */}
            <a href="/cve-intelligence.html" className="bg-slate-800 rounded-lg p-8 border border-cyan-500/30 hover:border-cyan-500 transition-all group block">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-10 h-10 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full uppercase tracking-wider">Risk Analysis</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">CVE Intelligence</h3>
              <p className="text-cyan-400 font-semibold text-sm mb-3">Know what to fix.</p>
              <p className="text-slate-400 text-sm mb-4">
                Every Critical and High severity CVE from the last 14 days, scored by real-world exploitability — CVSS, EPSS probability, CISA KEV status, and GitHub PoC availability. Built for teams who need to prioritize patches, not just see alerts.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">NVD API</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">EPSS Scores</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">CISA KEV</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">GitHub PoCs</span>
              </div>
              <div className="flex items-center text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </a>

            {/* CVE Trends */}
            <a href="/cvetrends.html" className="bg-slate-800 rounded-lg p-8 border border-orange-500/30 hover:border-orange-500 transition-all group block">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-10 h-10 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full uppercase tracking-wider">Community Signal</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🔥 CVE Trends</h3>
              <p className="text-orange-400 font-semibold text-sm mb-3">Know what to watch.</p>
              <p className="text-slate-400 text-sm mb-4">
                Which CVEs are making headlines? Track what BleepingComputer, The Hacker News, Reddit, and GitHub are buzzing about. Hype scores surface the vulnerabilities generating real community attention. The free alternative to CVETrends.com.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">Security News RSS</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">Reddit</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">GitHub PoCs</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">CISA KEV</span>
              </div>
              <div className="flex items-center text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </a>

            {/* KEV Dashboard */}
            <a href="/dashboard.html" className="bg-slate-800 rounded-lg p-8 border border-red-500/30 hover:border-red-500 transition-all group block">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-10 h-10 text-red-400" />
                <span className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full uppercase tracking-wider">Active Exploits</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">KEV Dashboard</h3>
              <p className="text-red-400 font-semibold text-sm mb-3">Know what's under attack.</p>
              <p className="text-slate-400 text-sm mb-4">
                CISA's Known Exploited Vulnerabilities catalog — every CVE confirmed exploited in the wild with federal patching deadlines, ransomware flags, EPSS probability scores, and overdue SLA tracking. The definitive list of what attackers are using right now.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">CISA KEV</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">EPSS Scores</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">SLA Tracking</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">Ransomware Flags</span>
              </div>
              <div className="flex items-center text-red-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </a>

            {/* Threat Intelligence */}
            <a href="/threat-dashboard.html" className="bg-slate-800 rounded-lg p-8 border border-purple-500/30 hover:border-purple-500 transition-all group block">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-10 h-10 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full uppercase tracking-wider">Threat Actors</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Threat Intelligence</h3>
              <p className="text-purple-400 font-semibold text-sm mb-3">Know who is attacking.</p>
              <p className="text-slate-400 text-sm mb-4">
                Sector-specific threat feeds, active threat actor tracking with MITRE ATT&CK TTPs, Indicators of Compromise, and dark web monitoring across Finance, Healthcare, Manufacturing, and Government.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">Threat Actors</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">MITRE ATT&CK</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">IoCs</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">Sector Feeds</span>
              </div>
              <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </a>
          </div>

          {/* How the dashboards work together */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-600 p-8 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Four Dashboards. One Complete Picture.</h3>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Each dashboard answers a different question. Together, they give you the full threat landscape — from technical risk to community signal to confirmed exploitation to who's behind the attack.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🔬</div>
                <div className="text-cyan-400 font-bold text-sm">Intelligence</div>
                <div className="text-slate-500 text-xs mt-1">Silent but dangerous — patch proactively</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-3xl mb-2">📢</div>
                <div className="text-orange-400 font-bold text-sm">Trending</div>
                <div className="text-slate-500 text-xs mt-1">Community buzz — monitor closely</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-3xl mb-2">⚔️</div>
                <div className="text-red-400 font-bold text-sm">KEV</div>
                <div className="text-slate-500 text-xs mt-1">Confirmed exploited — patch now</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🕵️</div>
                <div className="text-purple-400 font-bold text-sm">Threat Intel</div>
                <div className="text-slate-500 text-xs mt-1">Know the adversary — defend smarter</div>
              </div>
            </div>
          </div>

          {/* Services upsell */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-500/20 p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-3">Need More Than Dashboards?</h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Our free dashboards give you visibility. Our professional services give you action. From vulnerability management consulting to custom enterprise dashboards with API access, SLA integration, and executive reporting — we help security teams move from alerts to outcomes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/pricing.html" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold inline-flex items-center space-x-2 transition-all">
                <DollarSign className="w-4 h-4" />
                <span>View Plans & Pricing</span>
              </a>
              <button onClick={() => setCurrentPage('services')} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold inline-flex items-center space-x-2 transition-all">
                <Eye className="w-4 h-4" />
                <span>Explore Services</span>
              </button>
              <button onClick={() => setCurrentPage('contact')} className="px-6 py-3 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 rounded-lg font-semibold inline-flex items-center space-x-2 transition-all">
                <Mail className="w-4 h-4" />
                <span>Talk to Us</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Choose CVEPulse?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-cyan-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Intelligence</h3>
              <p className="text-slate-400">
                Powered by our live CVE and Threat Intelligence dashboards with 15-minute refresh cycles
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Expert Team</h3>
              <p className="text-slate-400">
                Seasoned security professionals with deep expertise in VM, threat intel, and SOC operations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Proven Methodology</h3>
              <p className="text-slate-400">
                Industry best practices combined with custom frameworks tailored to your business needs
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-cyan-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dashboards Are Just the Beginning
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Our free dashboards give you visibility. Our professional services give you results. Let's talk about what your team needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="/pricing.html"
            className="px-8 py-4 bg-white text-cyan-600 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all transform hover:scale-105"
          >
            View Pricing & Plans
          </a>
          <button
            onClick={() => setCurrentPage('contact')}
            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
          >
            Schedule a Consultation
          </button>
          </div>
        </div>
      </section>
    </div>
  );

  // Services Page
  const ServicesPage = () => (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">Professional Advisory Services</h1>
        <p className="text-xl text-center text-slate-400 mb-16 max-w-3xl mx-auto">
          Our free dashboards give your team visibility. Our advisory services help you turn that visibility into measurable security outcomes.
        </p>

        {/* VM Advisory */}
        <div className="mb-12 bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="flex items-start space-x-6 mb-6">
            <Shield className="w-14 h-14 text-cyan-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Vulnerability Management Advisory</h2>
              <p className="text-slate-400">Support organizations in building, assessing, or improving their vulnerability management programs — from policy to patching.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {['VM program maturity assessment', 'Risk-based prioritization framework', 'Remediation process & SLA design', 'Executive reporting & metrics', 'Tool optimization (Qualys, CrowdStrike, Rapid7)', 'Patch governance & compliance alignment'].map((item, i) => (
              <div key={i} className="flex items-center text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-cyan-400 mr-3 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Exposure Management */}
        <div className="mb-12 bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="flex items-start space-x-6 mb-6">
            <Target className="w-14 h-14 text-cyan-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Exposure Management Strategy</h2>
              <p className="text-slate-400">Help organizations understand their attack surface and align vulnerability data with real-world exposure for strategic risk reduction.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {['Asset visibility & coverage analysis', 'External attack surface review (EASM)', 'CTEM framework implementation', 'Prioritization strategy aligned to business risk', 'Integration with security tooling & CMDB', 'Continuous monitoring design'].map((item, i) => (
              <div key={i} className="flex items-center text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-cyan-400 mr-3 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Day Response */}
        <div className="mb-12 bg-slate-800 rounded-xl p-8 border border-red-500/20">
          <div className="flex items-start space-x-6 mb-6">
            <AlertTriangle className="w-14 h-14 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Zero-Day Response Advisory</h2>
              <p className="text-slate-400">Rapid guidance during critical vulnerability events — when a new zero-day drops and your leadership needs answers now.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {['Threat & impact analysis', 'Exposure validation & scope assessment', 'Remediation prioritization & workarounds', 'Executive communication & briefing support', 'Vendor advisory interpretation', 'Post-incident lessons learned'].map((item, i) => (
              <div key={i} className="flex items-center text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Threat Intel & App Security */}
        <div className="mb-12 bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="flex items-start space-x-6 mb-6">
            <Globe className="w-14 h-14 text-purple-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Threat Intelligence & Application Threat Modeling</h2>
              <p className="text-slate-400">Custom threat intelligence program design and STRIDE-based threat modeling for applications, APIs, and cloud architectures.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {['Threat intelligence program setup', 'IoC feed curation & automation', 'STRIDE threat modeling workshops', 'API & microservices security review', 'Cloud architecture threat analysis', 'MITRE ATT&CK mapping & coverage'].map((item, i) => (
              <div key={i} className="flex items-center text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Engagement CTA */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-500/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Strengthen Your Security Posture?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Every engagement starts with a conversation. Tell us about your team, your challenges, and where you need support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/pricing.html" className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all">
              View Pricing & Plans
            </a>
            <button onClick={() => setCurrentPage('contact')} className="px-8 py-4 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 rounded-lg font-bold text-lg transition-all">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // About Page
  const AboutPage = () => (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">About CVEPulse</h1>
        <p className="text-lg text-center text-slate-400 mb-16 max-w-2xl mx-auto">
          A practitioner-built intelligence platform focused on one goal: helping security teams prioritize the vulnerabilities that attackers actually exploit.
        </p>
        
        {/* Mission */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Why CVEPulse Exists</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            The vulnerability management industry has a prioritization problem. NVD publishes over 25,000 CVEs annually. Enterprise scanners flag thousands of findings. But most organizations lack the intelligence to distinguish between a theoretical risk and a vulnerability being actively weaponized.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            Expensive threat intelligence platforms address this — for teams with $100K+ budgets. Everyone else is left with CVSS scores, spreadsheets, and hope.
          </p>
          <p className="text-slate-300 leading-relaxed">
            CVEPulse was built to change that. Our free dashboards aggregate exploit intelligence, community signals, and threat context from 11+ authoritative sources — giving every security team the operational intelligence they need to make better decisions.
          </p>
        </div>

        {/* Founder Credibility */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-8 mb-8 border border-cyan-500/20">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Built by a Practitioner</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            CVEPulse was built by a vulnerability management leader with hands-on experience running enterprise cybersecurity programs for global organizations — not by a marketing team.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {[
              'Vulnerability management program leadership',
              'Attack surface management (EASM / CTEM)',
              'Application threat modeling (STRIDE)',
              'SIEM threat onboarding & detection engineering',
              'Zero-day response & emergency operations',
              'CXO-level security reporting & communication',
              'Tool expertise: Qualys VMDR, CrowdStrike Falcon',
              'Regulatory compliance: GxP, SOX, PCI DSS'
            ].map((item, i) => (
              <div key={i} className="flex items-center text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-cyan-400 mr-3 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm mt-6 italic">
            Every feature in CVEPulse exists because it solved a real problem in a real security operations environment.
          </p>
        </div>

        {/* Platform Philosophy */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Our Approach</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="text-2xl mr-4 mt-1">🎯</div>
              <div>
                <strong className="text-white">Exploitation over severity.</strong>
                <span className="text-slate-300"> We prioritize by real-world exploitation signals — CISA KEV, EPSS probability, PoC availability, community buzz — not just CVSS scores.</span>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-4 mt-1">🔓</div>
              <div>
                <strong className="text-white">Free for the community.</strong>
                <span className="text-slate-300"> All four dashboards are free, no login required. Intelligence shouldn't be gated behind enterprise contracts.</span>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-4 mt-1">🔧</div>
              <div>
                <strong className="text-white">Operational, not academic.</strong>
                <span className="text-slate-300"> Every dashboard is designed for daily use by security analysts, not annual reports. 15-minute refresh cycles, actionable scoring, zero setup.</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentPage('contact')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all mr-4"
          >
            Get in Touch
          </button>
          <a href="/pricing.html" className="px-8 py-4 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 rounded-lg font-bold text-lg transition-all inline-block">
            View Services & Pricing
          </a>
        </div>
      </div>
    </div>
  );

  // Contact Page
  const ContactPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      company: '',
      phone: '',
      service: '',
      message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitError(null);
      
      try {
        const response = await fetch('https://us-central1-cvepulse.cloudfunctions.net/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company: formData.company,
            phone: formData.phone,
            service: formData.service,
            message: formData.message,
            source: 'main-website-contact'
          })
        });
        
        if (response.ok) {
          setSubmitted(true);
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        // Still show success to user (data may have been saved)
        // Also save locally as backup
        const contacts = JSON.parse(localStorage.getItem('cvepulse_contacts') || '[]');
        contacts.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('cvepulse_contacts', JSON.stringify(contacts));
        setSubmitted(true);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4 text-white">Contact Us</h1>
          <p className="text-xl text-center text-slate-400 mb-16">
            Ready to enhance your security posture? Get in touch with our team.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-cyan-400 mt-1" />
                    <div>
                      <h3 className="text-white font-semibold">Email</h3>
                      <a href="mailto:business@cvepulse.com" className="text-slate-400 hover:text-cyan-400">
                        business@cvepulse.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-cyan-400 mt-1" />
                    <div>
                      <h3 className="text-white font-semibold">Locations</h3>
                      <p className="text-slate-400">London, UK</p>
                      <p className="text-slate-400">Delhi, India</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Prefer to schedule a call?</h2>
                <p className="text-cyan-50 mb-6">
                  Book a 30-minute consultation with our security experts
                </p>
                <button
                  onClick={() => window.location.href = 'mailto:business@cvepulse.com?subject=Security%20Consultation%20Request&body=Hi%20CVEPulse%20Team%2C%0A%0AI%20would%20like%20to%20schedule%20a%20security%20consultation.%0A%0APlease%20let%20me%20know%20available%20times.%0A%0AThank%20you'}
                  className="px-8 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Schedule a Call
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-slate-400">
                    We've received your message and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Service Interest</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select a service...</option>
                      <option value="vm">Vulnerability Management</option>
                      <option value="threat-intel">Threat Intelligence</option>
                      <option value="app-security">Application Threat Modeling</option>
                      <option value="soc">SOC Monitoring</option>
                      <option value="managed">Fully Managed Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
                      placeholder="Tell us about your security needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4 ${submitting ? 'bg-cyan-800 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'} text-white rounded-lg font-bold text-lg transition-all`}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Privacy Policy Page
  // Platform Page
  const PlatformPage = () => (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-4 py-1.5 rounded-full border border-cyan-400/20">Platform Overview</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-6 mb-4">The CVEPulse Intelligence Platform</h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            CVEPulse aggregates vulnerability intelligence, exploit signals, and threat context into operational dashboards designed for security teams. No enterprise contract required.
          </p>
        </div>

        {/* What the platform does */}
        <div className="bg-slate-800 rounded-xl p-8 mb-12 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">What CVEPulse Helps You Do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🔍', title: 'Track Emerging Vulnerabilities', desc: 'See new Critical and High CVEs as they appear in NVD, scored by real-world risk factors beyond CVSS.' },
              { icon: '⚔️', title: 'Identify Actively Exploited CVEs', desc: 'Cross-reference CISA KEV, EPSS predictions, and GitHub PoCs to know what attackers are actually using.' },
              { icon: '🎯', title: 'Prioritize Remediation', desc: 'Stop chasing CVSS 9.8s that nobody exploits. Focus patching effort on vulnerabilities with active exploitation signals.' },
              { icon: '🕵️', title: 'Understand Threat Activity', desc: 'Monitor threat actors, MITRE ATT&CK techniques, and IoCs targeting your sector.' },
              { icon: '📢', title: 'Track Community Signal', desc: 'Know what security journalists, Reddit communities, and GitHub researchers are discussing before it hits your inbox.' },
              { icon: '📊', title: 'Support Security Operations', desc: 'Use dashboards for daily triage, weekly reporting, and executive briefings with zero setup or integration required.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-4">
                <span className="text-2xl mt-1">{item.icon}</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard components */}
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Four Dashboards. Four Questions Answered.</h2>
        <div className="space-y-6 mb-12">
          {dashboardLinks.map((d) => (
            <a key={d.href} href={d.href} className="flex items-start bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all group block">
              <span className="text-3xl mr-5 mt-1">{d.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-xl font-bold ${d.color}`}>{d.name}</h3>
                  <span className="text-xs text-slate-500 italic">{d.tagline}</span>
                </div>
                <p className="text-slate-400 text-sm">
                  {d.name === 'CVE Intelligence' && 'Aggregates vulnerability data from NVD, EPSS, CISA KEV, and GitHub to calculate an intelligence score that reflects real-world risk — helping security teams understand which CVEs require immediate action.'}
                  {d.name === '🔥 CVE Trends' && 'Shows vulnerabilities gaining traction across security journalism, Reddit practitioner communities, and GitHub PoC repositories — surfacing the CVEs the security community is actively researching and discussing.'}
                  {d.name === 'KEV Dashboard' && 'Tracks every vulnerability in CISA\'s Known Exploited Vulnerabilities catalog with federal patching deadlines, ransomware flags, EPSS scores, and SLA tracking — representing confirmed active risk.'}
                  {d.name === 'Threat Intelligence' && 'Surfaces signals from threat actor activity, sector-specific targeting, MITRE ATT&CK technique mapping, and Indicators of Compromise across Finance, Healthcare, Manufacturing, and Government.'}
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 ${d.color} opacity-0 group-hover:opacity-100 transition-opacity mt-2`} />
            </a>
          ))}
        </div>

        {/* Data sources */}
        <div className="bg-slate-800 rounded-xl p-8 mb-12 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Intelligence Sources</h2>
          <p className="text-slate-400 mb-6">CVEPulse aggregates data from 11+ free, authoritative intelligence sources — updated every 15 minutes.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['CISA KEV', 'NVD API 2.0', 'EPSS Scores', 'BleepingComputer', 'The Hacker News', 'Dark Reading', 'SecurityWeek', 'The Record', 'CISA Advisories', 'Reddit (4 subs)', 'GitHub PoCs'].map((src, i) => (
              <div key={i} className="bg-slate-900/50 rounded-lg px-3 py-2 text-sm text-slate-300 text-center border border-slate-600">
                {src}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => {
              setCurrentPage('home');
              setTimeout(() => {
                const el = document.getElementById('dashboards-section');
                el && el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-lg transition-all mr-4"
          >
            Explore the Dashboards
          </button>
          <button onClick={() => setCurrentPage('contact')} className="px-8 py-4 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 rounded-lg font-bold text-lg transition-all">
            Request a Consultation
          </button>
        </div>
      </div>
    </div>
  );

  // Insights Page (placeholder for blog/content)
  const InsightsPage = () => (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-4 py-1.5 rounded-full border border-cyan-400/20">Security Insights</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-6 mb-4">Insights & Analysis</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Vulnerability intelligence analysis, exploit trend reporting, and patch prioritization strategies from the CVEPulse team.
          </p>
        </div>

        {/* Upcoming content cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { title: 'Top Exploited Vulnerabilities This Month', desc: 'A monthly roundup of the most actively exploited CVEs based on KEV additions, EPSS trends, and community signal.', tag: 'Monthly Report', coming: true },
            { title: 'Lessons From Recent Zero-Day Incidents', desc: 'Analysis of how organizations responded to major zero-days — what worked, what didn\'t, and how to prepare for the next one.', tag: 'Analysis', coming: true },
            { title: 'Patch Prioritization: Beyond CVSS', desc: 'A practical framework for prioritizing remediation using exploit probability, community signal, and business context.', tag: 'Guide', coming: true },
            { title: 'CVEPulse Intelligence Summaries', desc: 'Weekly summaries of emerging threats, trending vulnerabilities, and notable KEV additions with operational context.', tag: 'Weekly', coming: true },
          ].map((post, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{post.tag}</span>
                {post.coming && <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">Coming Soon</span>}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
              <p className="text-slate-400 text-sm">{post.desc}</p>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-500/20 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">Stay Updated</h3>
          <p className="text-slate-400 mb-6">
            Insights are coming soon. In the meantime, explore our live dashboards for real-time vulnerability intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/cve-intelligence.html" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all">
              CVE Intelligence Dashboard
            </a>
            <a href="/cvetrends.html" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all">
              🔥 CVE Trends Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const PrivacyPage = () => (
    <div className="min-h-screen bg-slate-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="bg-slate-800 rounded-lg p-8 space-y-6 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            <p className="leading-relaxed">
              At CVEPulse, we collect information you provide through our contact forms.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              Questions? Email: <a href="mailto:business@cvepulse.com" className="text-cyan-400 hover:text-cyan-300">business@cvepulse.com</a>
            </p>
          </section>
          <p className="text-sm text-slate-400 mt-8">Last updated: January 2026</p>
        </div>
      </div>
    </div>
  );

  // Terms of Service Page
  const TermsPage = () => (
    <div className="min-h-screen bg-slate-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="bg-slate-800 rounded-lg p-8 space-y-6 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By using CVEPulse, you agree to these terms.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Services</h2>
            <p className="leading-relaxed">
              CVEPulse provides cybersecurity intelligence services.
            </p>
          </section>
          <p className="text-sm text-slate-400 mt-8">Last updated: January 2026</p>
        </div>
      </div>
    </div>
  );

  // Main Navigation Bar with Pricing Button
  const NavigationBar = () => (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer flex-shrink-0" onClick={() => setCurrentPage('home')}>
            <Shield className="w-7 h-7 text-cyan-400" />
            <span className="text-xl font-bold text-white tracking-tight">CVEPulse</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Home */}
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Home
            </button>

            {/* Platform */}
            <button
              onClick={() => setCurrentPage('platform')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'platform' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Platform
            </button>

            {/* Dashboards Dropdown */}
            <div className="relative" onMouseEnter={() => setShowDashboardDropdown(true)} onMouseLeave={() => setShowDashboardDropdown(false)}>
              <button className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center space-x-1">
                <span>Dashboards</span>
                <svg className={`w-4 h-4 transition-transform ${showDashboardDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showDashboardDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl shadow-black/20 py-2 z-50">
                  {dashboardLinks.map((d) => (
                    <a
                      key={d.href}
                      href={d.href}
                      className="flex items-start px-4 py-3 hover:bg-slate-700/50 transition-colors group"
                    >
                      <span className="text-lg mr-3 mt-0.5">{d.icon}</span>
                      <div>
                        <div className={`text-sm font-semibold ${d.color} group-hover:brightness-110`}>{d.name}</div>
                        <div className="text-xs text-slate-400">{d.tagline}</div>
                      </div>
                    </a>
                  ))}
                  <div className="border-t border-slate-600 mt-2 pt-2 px-4 pb-1">
                    <span className="text-xs text-slate-500">All dashboards are free — no login required</span>
                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            <button
              onClick={() => setCurrentPage('services')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'services' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Services
            </button>

            {/* About */}
            <button
              onClick={() => setCurrentPage('about')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'about' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              About
            </button>

            {/* Insights */}
            <button
              onClick={() => setCurrentPage('insights')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'insights' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Insights
            </button>

            {/* Contact */}
            <button
              onClick={() => setCurrentPage('contact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'contact' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Contact
            </button>

            {/* Pricing CTA */}
            <a
              href="/pricing.html"
              className="ml-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center space-x-1"
            >
              <span>Pricing</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-300 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-1 border-t border-slate-700">
            <button
              onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${currentPage === 'home' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              Home
            </button>

            <div className="px-4 py-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dashboards</span>
            </div>
            {dashboardLinks.map((d) => (
              <a key={d.href} href={d.href} className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700">
                <span className="mr-2">{d.icon}</span>
                <span>{d.name}</span>
                <span className="ml-auto text-xs text-slate-500">{d.tagline}</span>
              </a>
            ))}

            <div className="border-t border-slate-700 mt-2 pt-2">
              <button onClick={() => { setCurrentPage('platform'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700">Platform</button>
              <button onClick={() => { setCurrentPage('services'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700">Services</button>
              <button onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700">About</button>
              <button onClick={() => { setCurrentPage('insights'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700">Insights</button>
              <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700">Contact</button>
              <a href="/pricing.html" className="block px-4 py-2 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md text-sm font-semibold text-center">Pricing</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Footer
  const Footer = () => (
    <footer className="bg-slate-800 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold text-white">CVEPulse</span>
            </div>
            <p className="text-slate-400 text-sm mb-3">
              Free real-time CVE intelligence and professional cybersecurity services.
            </p>
            <p className="text-slate-500 text-xs italic">
              "Intelligence tells you what to fix. Trends tells you what to watch."
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Free Dashboards</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/cve-intelligence.html" className="hover:text-cyan-400">CVE Intelligence</a></li>
              <li><a href="/cvetrends.html" className="hover:text-orange-400">🔥 CVE Trends</a></li>
              <li><a href="/dashboard.html" className="hover:text-red-400">KEV Dashboard</a></li>
              <li><a href="/threat-dashboard.html" className="hover:text-purple-400">Threat Intelligence</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/vulnerability-management.html" className="hover:text-cyan-400">Vulnerability Management</a></li>
              <li><a href="/threat-intelligence.html" className="hover:text-cyan-400">Threat Intelligence</a></li>
              <li><a href="/threat-modelling.html" className="hover:text-cyan-400">Threat Modeling</a></li>
              <li><a href="/soc-monitoring.html" className="hover:text-cyan-400">SOC Monitoring</a></li>
              <li><a href="/pricing.html" className="hover:text-cyan-400">Pricing & Plans</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setCurrentPage('platform')}>Platform</li>
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setCurrentPage('about')}>About Us</li>
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setCurrentPage('insights')}>Insights</li>
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setCurrentPage('contact')}>Contact</li>
              <li><a href="mailto:business@cvepulse.com" className="hover:text-cyan-400">business@cvepulse.com</a></li>
              <li><a href="/privacy.html" className="hover:text-cyan-400">Privacy Policy</a></li>
              <li><a href="/terms.html" className="hover:text-cyan-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-6 text-center text-slate-400 text-sm">
          <p>&copy; 2026 CVEPulse. All rights reserved. Free CVE intelligence dashboards for the security community.</p>
        </div>
      </div>
    </footer>
  );

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'services':
        return <ServicesPage />;
      case 'platform':
        return <PlatformPage />;
      case 'insights':
        return <InsightsPage />;
      case 'cve-dashboard':
        return <CVEDashboard />;
      case 'threat-dashboard':
        return <ThreatDashboard />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavigationBar />
      {renderPage()}
      <Footer />
      
      {/* Phase 3 Modals */}
      <AlertsModal 
        isOpen={showAlerts} 
        onClose={() => setShowAlerts(false)} 
      />
      <WatchlistManager 
        isOpen={showWatchlist} 
        onClose={() => setShowWatchlist(false)}
        onWatchlistChange={setWatchlist}
      />
    </div>
  );
};

export default CVEPulseWebsite;
