import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Search, Mail, Phone, MapPin, CheckCircle, ArrowRight, Menu, X, AlertTriangle, Globe, Lock, Zap, Users, Award, ExternalLink, Target, Activity, Github, AlertCircle, Newspaper, Radio, RefreshCw, Bell, Eye, DollarSign } from 'lucide-react';
import ProfessionalSecurityDashboard from './ProfessionalSecurityDashboard';

// Phase 3 Components
import PricingModal from './components/PricingModal';
import AlertsModal from './components/AlertsModal';
import WatchlistManager from './components/WatchlistManager';

const CVEPulseWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Phase 3 State
  const [showPricing, setShowPricing] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState(
    JSON.parse(localStorage.getItem('cvepulse_watchlist') || '[]')
  );

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'CVE Intelligence', id: 'cve-dashboard', href: '/dashboard.html' },
    { name: 'Threat Intelligence', id: 'threat-dashboard' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
    { name: 'Privacy', id: 'privacy' },
    { name: 'Terms', id: 'terms' }
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

  const packages = [
    {
      name: 'Starter',
      price: 'Custom',
      description: 'Perfect for SMBs and startups',
      features: [
        'VM Assessment',
        'Basic Threat Intelligence Feed',
        'SOC Alert Monitoring (Business Hours)',
        'Monthly Reports',
        'Email Support'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: 'Custom',
      description: 'Ideal for mid-market enterprises',
      features: [
        'VM Program Management',
        'Sector-Specific Threat Intelligence',
        'Dark Web Monitoring',
        '24/7 SOC Monitoring',
        'Incident Response Support',
        'Quarterly Executive Briefings'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large enterprises and regulated industries',
      features: [
        'Complete VM Program',
        'Custom Threat Intelligence',
        'Application Threat Modeling',
        '24/7 MDR with Threat Hunting',
        'Dedicated Security Team',
        'Unlimited Incident Response',
        'vCISO Advisory'
      ],
      cta: 'Schedule Demo'
    }
  ];

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
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            CVEPulse
          </h1>
          <p className="text-2xl md:text-3xl text-center mb-4 text-slate-200">
            Real-Time CVE Intelligence | Emergency & Zero-Day Detection
          </p>
          <p className="text-xl text-center mb-10 text-slate-300 max-w-3xl mx-auto">
            Comprehensive vulnerability management, threat intelligence, and SOC services powered by real-time intelligence
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/dashboard.html"
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View Live CVE Dashboard</span>
            </a>
            <button 
              onClick={() => setShowPricing(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <DollarSign className="w-5 h-5" />
              <span>View Pricing</span>
            </button>
            <button 
              onClick={() => setCurrentPage('contact')}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Sales</span>
            </button>
          </div>
        </div>
      </section>

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

      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Our Services</h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Comprehensive security solutions from vulnerability management to 24/7 SOC monitoring
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

      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Live Intelligence Dashboards</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 rounded-lg p-8 border border-cyan-500/30 hover:border-cyan-500 transition-all cursor-pointer" onClick={() => setCurrentPage('cve-dashboard')}>
              <AlertTriangle className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">CVE Intelligence Dashboard</h3>
              <p className="text-slate-400 mb-4">
                Real-time tracking of trending CVEs from BleepingComputer, The Hacker News, Reddit & CISA. 
                Auto-refreshes every 15 minutes with emergency and zero-day detection.
              </p>
              <div className="flex items-center text-cyan-400 font-semibold">
                <span>Access Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-8 border border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer" onClick={() => setCurrentPage('threat-dashboard')}>
              <Globe className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Threat Intelligence Dashboard</h3>
              <p className="text-slate-400 mb-4">
                Sector-specific threat feeds, dark web monitoring, IoC repository, and live threat actor tracking 
                across Finance, Healthcare, Manufacturing, and more.
              </p>
              <div className="flex items-center text-purple-400 font-semibold">
                <span>Access Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
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
            Ready to Transform Your Security Posture?
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Schedule a consultation to discuss how CVEPulse can protect your organization
          </p>
          <button 
            onClick={() => setShowPricing(true)}
            className="px-8 py-4 bg-white text-cyan-600 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all transform hover:scale-105"
          >
            View Pricing & Services
          </button>
        </div>
      </section>
    </div>
  );

  // Services Page
  const ServicesPage = () => (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-4 text-white">Our Services</h1>
        <p className="text-xl text-center text-slate-400 mb-16 max-w-3xl mx-auto">
          Comprehensive cybersecurity services powered by real-time intelligence and delivered by expert professionals
        </p>

        {services.map((service, idx) => (
          <div key={idx} className="mb-16 bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="flex items-start space-x-6 mb-8">
              <service.icon className="w-16 h-16 text-cyan-400 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">{service.title}</h2>
                <p className="text-slate-400 text-lg">{service.description}</p>
              </div>
            </div>

            {service.categories && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {service.categories.map((category, cidx) => (
                  <div key={cidx} className="bg-slate-900 rounded-lg p-5 border border-slate-700">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">{category.name}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, iidx) => (
                        <li key={iidx} className="flex items-start text-slate-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {service.engagementModels && (
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Engagement Models</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {service.engagementModels.map((model, midx) => (
                    <div key={midx} className="flex items-center text-slate-300 text-sm">
                      <ArrowRight className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                      {model}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="text-center mt-12">
          <button 
            onClick={() => setShowPricing(true)}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            Get a Quote
          </button>
        </div>
      </div>
    </div>
  );

  // About Page
  const AboutPage = () => (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-8 text-white">About CVEPulse</h1>
        
        <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            CVEPulse was founded with a simple mission: to democratize access to real-time vulnerability 
            and threat intelligence. We believe every organization, regardless of size, deserves 
            enterprise-grade security insights.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Our platform aggregates data from multiple trusted sources including CISA, NVD, 
            BleepingComputer, The Hacker News, and dark web intelligence to provide a comprehensive 
            view of the threat landscape.
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">What Sets Us Apart</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">Real-Time Intelligence:</strong>
                <span className="text-slate-300"> Our dashboards update every 15 minutes with the latest CVE and threat data.</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">Actionable Insights:</strong>
                <span className="text-slate-300"> We don't just provide data – we provide prioritized recommendations for action.</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">Expert Services:</strong>
                <span className="text-slate-300"> Our consultancy team brings decades of combined experience in vulnerability management and threat intelligence.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Global Presence</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🇬🇧 United Kingdom</h3>
              <p className="text-slate-400">London Operations</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🇮🇳 India</h3>
              <p className="text-slate-400">Delhi Operations</p>
            </div>
          </div>
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

    const handleSubmit = (e) => {
      e.preventDefault();
      // Store in localStorage
      const contacts = JSON.parse(localStorage.getItem('cvepulse_contacts') || '[]');
      contacts.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('cvepulse_contacts', JSON.stringify(contacts));
      setSubmitted(true);
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
                  onClick={() => window.open('https://calendly.com/business-cvepulse/security-consultation', '_blank')}
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
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-lg transition-all"
                  >
                    Send Message
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
              Questions? Email: business@cvepulse.com
            </p>
          </section>
          <p className="text-sm text-slate-400 mt-8">Last updated: December 2024</p>
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
          <p className="text-sm text-slate-400 mt-8">Last updated: December 2024</p>
        </div>
      </div>
    </div>
  );

  // Main Navigation Bar with Pricing Button
  const NavigationBar = () => (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">CVEPulse</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.filter(item => !['privacy', 'terms'].includes(item.id)).map((item) => (
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {item.name}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              )
            ))}
            {/* Pricing Button */}
            <button
              onClick={() => setShowPricing(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-1"
            >
              <DollarSign className="w-4 h-4" />
              <span>Pricing</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.filter(item => !['privacy', 'terms'].includes(item.id)).map((item) => (
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  className="block w-full text-left px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {item.name}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              )
            ))}
            <button
              onClick={() => {
                setShowPricing(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium"
            >
              💼 Pricing
            </button>
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
            <p className="text-slate-400 text-sm">
              Real-time CVE and threat intelligence for proactive security defense.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li onClick={() => setCurrentPage("services")} className="hover:text-cyan-400 cursor-pointer">Vulnerability Management</li>
              <li onClick={() => setCurrentPage("services")} className="hover:text-cyan-400 cursor-pointer">Threat Intelligence</li>
              <li onClick={() => setCurrentPage("services")} className="hover:text-cyan-400 cursor-pointer">Application Security</li>
              <li onClick={() => setCurrentPage("services")} className="hover:text-cyan-400 cursor-pointer">SOC Monitoring</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setCurrentPage('about')}>About Us</li>
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setCurrentPage('contact')}>Contact</li>
              <li className="hover:text-cyan-400 cursor-pointer" onClick={() => setShowPricing(true)}>Pricing</li>
              <li onClick={() => setCurrentPage("privacy")} className="hover:text-cyan-400 cursor-pointer">Privacy Policy</li>
              <li onClick={() => setCurrentPage("terms")} className="hover:text-cyan-400 cursor-pointer">Terms of Service</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>business@cvepulse.com</li>
              <li>London, UK | Delhi, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-6 text-center text-slate-400 text-sm">
          <p>&copy; 2024 CVEPulse. All rights reserved.</p>
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
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
      />
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
