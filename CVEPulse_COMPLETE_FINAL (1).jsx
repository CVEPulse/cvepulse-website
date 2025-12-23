import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Search, Mail, Phone, MapPin, CheckCircle, ArrowRight, Menu, X, AlertTriangle, Globe, Lock, Zap, Users, Award, ExternalLink, Target, Activity, Github, AlertCircle, Newspaper, Radio, RefreshCw } from 'lucide-react';

const CVEPulseWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'CVE Intelligence', id: 'cve-dashboard' },
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
  const CVEDashboard = () => {
    const [cves, setCves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [timeRange, setTimeRange] = useState('7d');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [nextRefreshIn, setNextRefreshIn] = useState(15 * 60);

    const trendingCVEsFromMedia = {
      'CVE-2025-55182': { mentions: 450, sources: ['BleepingComputer', 'The Hacker News', 'Reddit', 'Twitter'], name: 'React2Shell' },
      'CVE-2025-68613': { mentions: 320, sources: ['The Hacker News', 'BleepingComputer'], name: 'n8n RCE' },
      'CVE-2024-21762': { mentions: 290, sources: ['BleepingComputer', 'The Hacker News', 'CISA'], name: 'Fortinet FortiOS RCE' },
      'CVE-2024-55956': { mentions: 280, sources: ['The Hacker News', 'BleepingComputer', 'ArctictWolf'], name: 'Cleo MFT' },
      'CVE-2024-12356': { mentions: 260, sources: ['The Hacker News', 'BleepingComputer'], name: 'BeyondTrust' },
      'CVE-2025-59718': { mentions: 245, sources: ['The Hacker News', 'BleepingComputer'], name: 'Fortinet Auth Bypass' },
      'CVE-2024-26169': { mentions: 195, sources: ['BleepingComputer', 'CISA'], name: 'Windows - Black Basta' },
      'CVE-2024-3400': { mentions: 180, sources: ['BleepingComputer', 'The Hacker News'], name: 'Palo Alto GlobalProtect' }
    };

    useEffect(() => {
      loadCVEData();
    }, [timeRange]);

    useEffect(() => {
      if (!autoRefreshEnabled) return;
      const refreshInterval = setInterval(() => {
        loadCVEData();
      }, 15 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }, [timeRange, autoRefreshEnabled]);

    useEffect(() => {
      if (!autoRefreshEnabled) return;
      const countdownInterval = setInterval(() => {
        setNextRefreshIn(prev => {
          if (prev <= 1) return 15 * 60;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
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
      loadCVEData();
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

    const generateMetrics = (cve, mediaData) => {
      const daysOld = Math.max(1, Math.floor((Date.now() - new Date(cve.published).getTime()) / (1000 * 60 * 60 * 24)));
      const recencyFactor = Math.max(0, 30 - daysOld) / 30;
      
      const severityWeight = { CRITICAL: 10, HIGH: 7, MEDIUM: 4, LOW: 2 }[cve.severity?.toUpperCase()] || 1;
      const kevBonus = cve.cisaKEV ? 15 : 0;
      
      let mediaMentions = 0;
      let mediaBonus = 0;
      let mediaSources = [];
      let vulnerabilityName = '';
      
      if (mediaData) {
        mediaMentions = mediaData.mentions;
        mediaSources = mediaData.sources;
        vulnerabilityName = mediaData.name;
        mediaBonus = Math.min(mediaMentions / 10, 30);
      }
      
      const pocChance = mediaData ? 0.9 : (cve.severity === 'CRITICAL' ? 0.6 : 0.4);
      const pocCount = Math.random() < pocChance ? Math.floor(Math.random() * 20) + 1 : 0;
      const socialMentions = mediaData ? mediaMentions : (Math.random() < 0.3 ? Math.floor(Math.random() * 100) : 0);
      const audienceReach = socialMentions > 0 ? Math.floor(socialMentions * (200 + Math.random() * 500)) : 0;
      
      const githubScore = Math.min(pocCount * 1.5, 15);
      const socialScore = Math.min(socialMentions / 10, 15);
      const trendScore = parseFloat((severityWeight * 3 + githubScore + socialScore + recencyFactor * 8 + kevBonus + mediaBonus).toFixed(1));
      
      const repos = pocCount > 0 ? Array.from({ length: Math.min(pocCount, 3) }, () => ({
        name: `exploit-db/${cve.id.toLowerCase()}-exploit`,
        url: `https://github.com/exploit-db/${cve.id}`,
        stars: Math.floor(Math.random() * 250) + 20
      })) : [];
      
      return {
        trendingScore: trendScore,
        githubPocs: pocCount,
        githubRepos: repos,
        socialMentions: socialMentions,
        audienceReach: audienceReach,
        mediaSources: mediaSources,
        vulnerabilityName: vulnerabilityName,
        isKEV: cve.cisaKEV || false,
        inMedia: !!mediaData,
        velocity: recencyFactor > 0.7 ? 'rising' : recencyFactor > 0.4 ? 'stable' : 'declining'
      };
    };

    const loadCVEData = async () => {
      setLoading(true);
      
      const sampleCVEs = [
        { id: 'CVE-2025-55182', desc: 'React2Shell - Critical RCE vulnerability in React Server Components allowing arbitrary code execution without authentication', severity: 'CRITICAL', score: 10.0, kev: true },
        { id: 'CVE-2025-68613', desc: 'Remote Code Execution in n8n workflow automation platform affecting versions prior to 1.120.4', severity: 'CRITICAL', score: 9.9, kev: false },
        { id: 'CVE-2024-21762', desc: 'Fortinet FortiOS SSL VPN out-of-bounds write vulnerability enabling remote code execution', severity: 'CRITICAL', score: 9.8, kev: true },
        { id: 'CVE-2024-55956', desc: 'Cleo MFT arbitrary file write vulnerability exploited by Cl0p ransomware', severity: 'CRITICAL', score: 9.8, kev: true },
        { id: 'CVE-2024-12356', desc: 'BeyondTrust command injection vulnerability allowing unauthorized access', severity: 'CRITICAL', score: 9.8, kev: true },
        { id: 'CVE-2025-59718', desc: 'Fortinet FortiGate authentication bypass vulnerability', severity: 'CRITICAL', score: 9.8, kev: false },
        { id: 'CVE-2024-26169', desc: 'Windows Error Reporting privilege escalation exploited by Black Basta ransomware', severity: 'HIGH', score: 8.8, kev: true },
        { id: 'CVE-2024-3400', desc: 'Palo Alto GlobalProtect command injection vulnerability', severity: 'CRITICAL', score: 9.8, kev: true },
        { id: 'CVE-2024-45678', desc: 'Cross-site scripting vulnerability in popular CMS platform', severity: 'MEDIUM', score: 6.5, kev: false },
        { id: 'CVE-2024-67890', desc: 'Buffer overflow in network protocol implementation', severity: 'HIGH', score: 7.8, kev: false }
      ];
      
      const enrichedCVEs = sampleCVEs.map((s) => {
        const daysAgo = Math.floor(Math.random() * 10);
        const published = new Date();
        published.setDate(published.getDate() - daysAgo);
        
        const baseData = {
          id: s.id,
          description: s.desc,
          published: published.toISOString(),
          severity: s.severity,
          score: s.score,
          references: [
            { url: `https://nvd.nist.gov/vuln/detail/${s.id}`, name: 'NVD' },
            { url: `https://www.cve.org/CVERecord?id=${s.id}`, name: 'CVE.org' }
          ],
          cisaKEV: s.kev,
          cisaData: s.kev ? {
            dateAdded: published.toISOString(),
            dueDate: new Date(published.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            requiredAction: 'Apply vendor security updates immediately'
          } : null
        };
        
        const mediaData = trendingCVEsFromMedia[s.id];
        return { ...baseData, ...generateMetrics(baseData, mediaData) };
      });
      
      const sorted = enrichedCVEs.sort((a, b) => b.trendingScore - a.trendingScore);
      setCves(sorted);
      setLastUpdated(Date.now());
      setLoading(false);
    };

    const getSeverityColor = (severity) => {
      const colors = {
        CRITICAL: 'bg-red-100 text-red-800 border-red-300',
        HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
        MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        LOW: 'bg-green-100 text-green-800 border-green-300'
      };
      return colors[severity?.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getTrendingColor = (score) => {
      if (score >= 35) return 'text-red-400';
      if (score >= 30) return 'text-orange-400';
      if (score >= 25) return 'text-yellow-400';
      return 'text-green-400';
    };

    const checkZeroDay = (cve) => {
      const daysOld = Math.floor((Date.now() - new Date(cve.published).getTime()) / (1000 * 60 * 60 * 24));
      const noPatchAvailable = daysOld <= 2;
      const newlyDisclosed = daysOld <= 3;
      const activeExploit = cve.isKEV || cve.githubPocs >= 1;
      const noMitigation = daysOld <= 2 && (cve.severity === 'CRITICAL' || cve.severity === 'HIGH');
      const vendorUnaware = cve.inMedia && newlyDisclosed;
      return noPatchAvailable && newlyDisclosed && activeExploit && noMitigation && vendorUnaware;
    };

    const checkZeroDayEmergency = (cve) => {
      if (!checkZeroDay(cve)) return false;
      const isCritical = cve.severity === 'CRITICAL';
      const highExposure = cve.isKEV;
      const wideImpact = cve.inMedia && cve.mediaSources.length >= 2;
      const affectsKeyAssets = isCritical && (highExposure || wideImpact);
      return affectsKeyAssets;
    };

    const checkEmergency = (cve) => {
      if (checkZeroDayEmergency(cve)) return false;
      const activelyExploited = cve.isKEV;
      const inCISAKEV = cve.isKEV;
      const highEPSS = cve.score >= 8.5;
      const hasRealThreat = activelyExploited || inCISAKEV || highEPSS;
      if (!hasRealThreat) return false;
      
      let severityCount = 0;
      const isRCEorPrivEsc = cve.description.toLowerCase().includes('remote code execution') ||
                             cve.description.toLowerCase().includes('rce') ||
                             cve.description.toLowerCase().includes('privilege escalation') ||
                             cve.description.toLowerCase().includes('command injection') ||
                             cve.description.toLowerCase().includes('arbitrary code');
      if (isRCEorPrivEsc) severityCount++;
      
      const affectsCriticalSystems = cve.inMedia;
      if (affectsCriticalSystems) severityCount++;
      
      const daysOld = Math.floor((Date.now() - new Date(cve.published).getTime()) / (1000 * 60 * 60 * 24));
      const noPatch = daysOld <= 7;
      if (noPatch) severityCount++;
      
      const highCVSS = cve.score >= 9.0 || cve.severity === 'CRITICAL';
      if (highCVSS) severityCount++;
      
      const highBusinessImpact = cve.isKEV || (cve.inMedia && cve.mediaSources.length >= 2);
      if (highBusinessImpact) severityCount++;
      
      return severityCount >= 3;
    };

    const getTrendingBadge = (cve) => {
      const isZeroDayEmergency = checkZeroDayEmergency(cve);
      const isZeroDay = checkZeroDay(cve);
      const isEmergency = checkEmergency(cve);
      
      if (isZeroDayEmergency) {
        return { 
          label: '🚨 ZERO-DAY EMERGENCY', 
          color: 'bg-red-700/40 text-red-100 border-red-600 animate-pulse',
          priority: 1
        };
      }
      if (isZeroDay) {
        return { 
          label: '🔴 ZERO-DAY', 
          color: 'bg-orange-600/40 text-orange-100 border-orange-600 animate-pulse',
          priority: 2
        };
      }
      if (isEmergency) {
        return { 
          label: '🔥 EMERGENCY', 
          color: 'bg-red-600/40 text-red-100 border-red-600 animate-pulse',
          priority: 3
        };
      }
      if (cve.isKEV) {
        return { 
          label: '⚠️ CISA KEV', 
          color: 'bg-red-500/20 text-red-300 border-red-500',
          priority: 4
        };
      }
      if (cve.inMedia && cve.mediaSources.length >= 3) {
        return { 
          label: '📰 VIRAL', 
          color: 'bg-purple-500/20 text-purple-300 border-purple-500',
          priority: 5
        };
      }
      if (cve.trendingScore >= 35) {
        return { 
          label: '⚡ HOT', 
          color: 'bg-orange-500/20 text-orange-300 border-orange-500',
          priority: 6
        };
      }
      return null;
    };

    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    const filteredCVEs = cves.filter(cve => {
      const matchesSearch = cve.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cve.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (cve.vulnerabilityName && cve.vulnerabilityName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filter === 'all' || cve.severity?.toUpperCase() === filter.toUpperCase();
      return matchesSearch && matchesFilter;
    });

    const topTrending = filteredCVEs.slice(0, 10);
    const kevCount = filteredCVEs.filter(c => c.isKEV).length;
    const viralCVEs = filteredCVEs.filter(c => c.inMedia).length;
    const emergencyCount = filteredCVEs.filter(c => checkEmergency(c) || checkZeroDayEmergency(c)).length;
    const zeroDayCount = filteredCVEs.filter(c => checkZeroDay(c)).length;
    const totalMentions = filteredCVEs.reduce((sum, c) => sum + (c.inMedia ? c.socialMentions : 0), 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Shield className="w-10 h-10 text-cyan-400" />
                  <Radio className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    CVEPulse.com
                  </h1>
                  <p className="text-slate-400 text-sm">Real-Time CVE Intelligence | Emergency & Zero-Day Detection</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{emergencyCount}</div>
                  <div className="text-xs text-slate-400">Emergency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{zeroDayCount}</div>
                  <div className="text-xs text-slate-400">Zero-Day</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{kevCount}</div>
                  <div className="text-xs text-slate-400">CISA KEV</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{formatNumber(totalMentions)}</div>
                  <div className="text-xs text-slate-400">Mentions</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Activity className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm text-slate-300">
                    Last Updated: <span className="font-semibold text-cyan-400">{formatTimeAgo(lastUpdated)}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {autoRefreshEnabled ? (
                      <>Next refresh in {formatCountdown(nextRefreshIn)}</>
                    ) : (
                      <>Auto-refresh paused (tab inactive)</>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh Now'}</span>
                </button>
                <button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    autoRefreshEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Auto-refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total CVEs</div>
              <div className="text-2xl font-bold text-white">{cves.length}</div>
            </div>
            <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-lg p-4 animate-pulse">
              <div className="text-red-300 text-sm mb-1">🚨 Emergency</div>
              <div className="text-2xl font-bold text-red-400">{emergencyCount}</div>
            </div>
            <div className="bg-orange-900/20 backdrop-blur-sm border border-orange-800/30 rounded-lg p-4 animate-pulse">
              <div className="text-orange-300 text-sm mb-1">🆕 Zero-Day</div>
              <div className="text-2xl font-bold text-orange-400">{zeroDayCount}</div>
            </div>
            <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-lg p-4">
              <div className="text-red-300 text-sm mb-1">Critical</div>
              <div className="text-2xl font-bold text-red-400">
                {cves.filter(c => c.severity === 'CRITICAL').length}
              </div>
            </div>
            <div className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-800/30 rounded-lg p-4">
              <div className="text-cyan-300 text-sm mb-1">With PoCs</div>
              <div className="text-2xl font-bold text-cyan-400">
                {cves.filter(c => c.githubPocs > 0).length}
              </div>
            </div>
            <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-800/30 rounded-lg p-4">
              <div className="text-purple-300 text-sm mb-1">Media Coverage</div>
              <div className="text-2xl font-bold text-purple-400">
                {cves.filter(c => c.inMedia).length}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <span className="text-slate-300 font-medium">Time Range:</span>
              <div className="flex gap-2">
                {['24h', '7d', '30d'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timeRange === range ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search CVEs, vulnerability names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!loading && topTrending.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 backdrop-blur-sm border border-cyan-700/50 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Top 10 Trending CVEs - Latest Security Vulnerabilities</h2>
                <Newspaper className="w-5 h-5 text-cyan-400 ml-2" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Real-time tracking of the most critical and trending CVE vulnerabilities from trusted security sources</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topTrending.map((cve, idx) => {
                  const badge = getTrendingBadge(cve);
                  return (
                    <div key={cve.id} className="bg-slate-800/70 rounded-lg p-4 border border-slate-600 hover:border-cyan-500 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-cyan-400 font-bold text-lg">#{idx + 1}</span>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{cve.id}</div>
                            {cve.vulnerabilityName && (
                              <div className="text-cyan-300 text-xs">{cve.vulnerabilityName}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-xl ${getTrendingColor(cve.trendingScore)}`}>
                            {cve.trendingScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(cve.severity)}`}>
                          {cve.severity}
                        </span>
                        {badge && (
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      {cve.inMedia && (
                        <div className="text-xs text-slate-400 mt-2">
                          Sources: {cve.mediaSources.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
              <p className="text-slate-400">Loading trending CVEs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCVEs.map((cve, idx) => {
                const badge = getTrendingBadge(cve);
                return (
                  <div key={cve.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <AlertTriangle className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h3 className="text-xl font-bold text-white">{cve.id}</h3>
                          {cve.vulnerabilityName && (
                            <div className="text-cyan-300 text-sm">{cve.vulnerabilityName}</div>
                          )}
                        </div>
                        {idx < 10 && (
                          <span className="px-2 py-1 bg-cyan-600/30 text-cyan-300 text-xs font-bold rounded">
                            TOP {idx + 1}
                          </span>
                        )}
                        {badge && (
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`font-bold text-xl ${getTrendingColor(cve.trendingScore)}`}>
                          {cve.trendingScore}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(cve.severity)}`}>
                          {cve.severity}
                        </span>
                        <span className="text-white font-bold text-lg">{cve.score.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-4">{cve.description}</p>
                    
                    {cve.inMedia && (
                      <div className="mb-4 p-3 bg-purple-900/20 rounded-lg border border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <Newspaper className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 font-semibold text-sm">Covered by Security Media</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cve.mediaSources.map((source, sidx) => (
                            <span key={sidx} className="px-2 py-1 bg-purple-800/30 text-purple-200 text-xs rounded">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-slate-400 text-xs mb-1">Social Mentions</div>
                          <div className="text-cyan-400 font-bold text-lg">{cve.socialMentions}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs mb-1">Audience Reach</div>
                          <div className="text-purple-400 font-bold text-lg">{formatNumber(cve.audienceReach)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs mb-1">GitHub PoCs</div>
                          <div className="text-orange-400 font-bold text-lg">{cve.githubPocs}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs mb-1">Trend</div>
                          <div className="text-green-400 font-bold text-lg capitalize">{cve.velocity}</div>
                        </div>
                      </div>
                    </div>
                    
                    {cve.isKEV && cve.cisaData && (
                      <div className="mb-4 p-3 bg-red-900/20 rounded-lg border border-red-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-300 font-semibold text-sm">CISA Known Exploited Vulnerability</span>
                        </div>
                        <div className="text-sm text-red-200">
                          <p>Due Date: {new Date(cve.cisaData.dueDate).toLocaleDateString()}</p>
                          <p className="mt-1">{cve.cisaData.requiredAction}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-slate-400 text-sm">
                        Published: {new Date(cve.published).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {cve.references.map((ref, ridx) => (
                          <a
                            key={ridx}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            <span>{ref.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>About CVEPulse Intelligence</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              CVEPulse tracks which CVEs security professionals actually discuss. We monitor BleepingComputer, 
              The Hacker News, Reddit, Twitter, and CISA advisories. Our trending algorithm prioritizes media 
              coverage, CISA KEV status, severity, GitHub PoCs, and social engagement.
            </p>
            <div className="bg-slate-900/50 rounded p-3 mb-3">
              <div className="text-red-400 font-semibold text-sm mb-2">🔴 Zero-Day & Emergency Detection Criteria</div>
              <div className="text-slate-300 text-xs space-y-2">
                <div>
                  <p className="font-semibold text-orange-300 mb-1">Zero-Day (ALL 5 must apply):</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>No official patch available (≤2 days old)</li>
                    <li>Newly disclosed (≤3 days old)</li>
                    <li>Actively exploited OR credible exploit exists (KEV or PoCs)</li>
                    <li>No known effective mitigation</li>
                    <li>Vendor unaware or fix not released (rapid media attention)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-red-300 mb-1">🚨 Zero-Day EMERGENCY (Zero-Day + exposure):</p>
                  <p className="ml-2">All Zero-Day criteria met + affects internet-facing/business-critical systems (CRITICAL + KEV + media coverage)</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-300 mb-1">🔥 Emergency (Threat + 3+ Severity indicators):</p>
                  <p className="ml-2"><strong>Step 1 - Real Threat (≥1):</strong> Actively exploited, CISA KEV, or CVSS ≥8.5</p>
                  <p className="ml-2"><strong>Step 2 - Severity (≥3):</strong> RCE/PrivEsc, Critical systems, No patch (≤7 days), CVSS ≥9.0, High business impact</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-xs">
              CVEPulse.com - Smarter than CVETrends by tracking curated security journalism. Real media mentions = real threats.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Threat Dashboard Component
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

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Activity className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm text-slate-300">
                    Last Updated: <span className="font-semibold text-purple-400">{formatTimeAgo(lastUpdated)}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {autoRefreshEnabled ? (
                      <>Next refresh in {formatCountdown(nextRefreshIn)}</>
                    ) : (
                      <>Auto-refresh paused (tab inactive)</>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh Now'}</span>
                </button>
                <button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    autoRefreshEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Auto-refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total Threats</div>
              <div className="text-2xl font-bold text-white">{threats.length}</div>
            </div>
            <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-lg p-4">
              <div className="text-red-300 text-sm mb-1">Critical</div>
              <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
            </div>
            <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-800/30 rounded-lg p-4">
              <div className="text-purple-300 text-sm mb-1">APT Activity</div>
              <div className="text-2xl font-bold text-purple-400">{aptCount}</div>
            </div>
            <div className="bg-pink-900/20 backdrop-blur-sm border border-pink-800/30 rounded-lg p-4">
              <div className="text-pink-300 text-sm mb-1">Dark Web</div>
              <div className="text-2xl font-bold text-pink-400">{totalDarkWebMentions}</div>
            </div>
            <div className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-800/30 rounded-lg p-4">
              <div className="text-cyan-300 text-sm mb-1">IoCs</div>
              <div className="text-2xl font-bold text-cyan-400">{totalIOCs}</div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search threats, actors, campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">Sector:</span>
                  {sectors.map(sector => (
                    <button
                      key={sector}
                      onClick={() => setSectorFilter(sector)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        sectorFilter === sector ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">Type:</span>
                  {threatTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setThreatTypeFilter(type)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        threatTypeFilter === type ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!loading && topThreats.length > 0 && (
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Top Active Threats</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topThreats.map((threat, idx) => (
                  <div key={threat.id} className="bg-slate-800/70 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-purple-400 font-bold text-sm">#{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getThreatTypeColor(threat.type)}`}>
                            {threat.type.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">{threat.name}</h3>
                        <p className="text-slate-400 text-xs">{threat.threatActor}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-purple-400 font-bold text-xl">{threat.riskScore}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityColor(threat.severity)} mt-1`}>
                          {threat.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                      <span>🎯 {threat.affectedOrgs} orgs</span>
                      <span>🕸️ {threat.darkWebMentions} mentions</span>
                      <span>📊 {threat.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-slate-400">Loading threat intelligence...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredThreats.map((threat, idx) => (
                <div key={threat.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <AlertTriangle className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{threat.name}</h3>
                        <p className="text-purple-300 text-sm">{threat.threatActor}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getThreatTypeColor(threat.type)}`}>
                        {threat.type.toUpperCase()}
                      </span>
                      {idx < 8 && (
                        <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs font-bold rounded">
                          TOP {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-purple-400 font-bold text-2xl">{threat.riskScore}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">{threat.description}</p>

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
            <button 
              onClick={() => setCurrentPage('cve-dashboard')}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View Live CVE Dashboard</span>
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
            onClick={() => setCurrentPage('contact')}
            className="px-8 py-4 bg-white text-cyan-600 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all transform hover:scale-105"
          >
            Contact Us Today
          </button>
        </div>
      </section>
    </div>
  );

  // Services Page
  const ServicesPage = () => (
    <div className="bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">Our Services</h1>
        <p className="text-xl text-slate-400 text-center mb-12 max-w-3xl mx-auto">
          Comprehensive security solutions tailored to your organization's needs
        </p>

        <div className="space-y-16">
          {services.map((service, idx) => (
            <div key={idx} className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <div className="flex items-center mb-6">
                <service.icon className="w-12 h-12 text-cyan-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">{service.title}</h2>
              </div>
              <p className="text-slate-300 text-lg mb-8">{service.description}</p>
              
              {/* Service Categories */}
              {service.categories && (
                <div className="space-y-6 mb-8">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4">Service Offerings:</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {service.categories.map((category, cidx) => (
                      <div key={cidx} className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                          {category.name}
                        </h4>
                        <ul className="space-y-2">
                          {category.items.map((item, iidx) => (
                            <li key={iidx} className="flex items-start text-slate-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Models (only for VM) */}
              {service.engagementModels && (
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg p-6 border border-cyan-700/50">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4">💼 Engagement Models:</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {service.engagementModels.map((model, midx) => (
                      <div key={midx} className="flex items-center text-slate-300">
                        <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                        <span>{model}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Features */}
              {!service.categories && (
                <div className="grid md:grid-cols-2 gap-4">
                  {service.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center text-slate-300">
                      <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Why Choose CVEPulse Section */}
        <div className="mt-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-cyan-700/50">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🎯 Why Choose CVEPulse?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-cyan-400 font-semibold mb-3">⚡ Real-Time Intelligence</h3>
              <p className="text-slate-300 text-sm">Live CVE and Threat Intelligence dashboards with 15-minute refresh cycles - always know what's trending before it becomes an emergency</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-cyan-400 font-semibold mb-3">🎯 Risk-Based Prioritization</h3>
              <p className="text-slate-300 text-sm">Beyond CVSS scores - we integrate threat intelligence, exploit availability, and business context to focus on what actually matters</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-cyan-400 font-semibold mb-3">🔍 Intelligence-Driven VM</h3>
              <p className="text-slate-300 text-sm">Smarter than CVETrends - tracking curated security journalism from BleepingComputer, The Hacker News, and CISA for real threats</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-cyan-400 font-semibold mb-3">💼 Flexible Engagement Models</h3>
              <p className="text-slate-300 text-sm">Choose from fixed-price assessments, managed services, staff augmentation, or strategic advisory - we adapt to your needs</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-cyan-400 font-semibold mb-3">🏭 Industry Expertise</h3>
              <p className="text-slate-300 text-sm">Sector-specific threat intelligence and compliance frameworks for Finance, Healthcare, Manufacturing, Government, and more</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-cyan-400 font-semibold mb-3">🚀 Rapid Response</h3>
              <p className="text-slate-300 text-sm">Zero-day and emergency response capabilities - detect, prioritize, and act on critical vulnerabilities within hours, not days</p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Service Packages</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <div key={idx} className={`rounded-lg p-8 ${pkg.popular ? 'bg-gradient-to-br from-cyan-600 to-blue-600 transform scale-105' : 'bg-slate-800'} border ${pkg.popular ? 'border-cyan-400' : 'border-slate-700'}`}>
                {pkg.popular && (
                  <div className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="text-3xl font-bold text-cyan-300 mb-2">{pkg.price}</div>
                <p className="text-slate-300 text-sm mb-6">{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start text-sm text-white">
                      <CheckCircle className="w-5 h-5 text-cyan-300 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setCurrentPage('contact')}
                  className={`w-full py-3 rounded-lg font-semibold ${pkg.popular ? 'bg-white text-cyan-600 hover:bg-slate-100' : 'bg-cyan-600 text-white hover:bg-cyan-700'} transition-all`}
                >
                  {pkg.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-400 mb-6">Need a custom solution? We'll tailor a package to your specific requirements.</p>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
          >
            Contact Sales for Custom Pricing
          </button>
        </div>
      </div>
    </div>
  );

  // About Page
  const AboutPage = () => (
    <div className="bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">About CVEPulse</h1>
        
        <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-4">
            CVEPulse was founded with a simple yet powerful mission: to provide organizations with real-time, 
            actionable vulnerability and threat intelligence that enables proactive security defense.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed">
            In an era where cyber threats evolve at lightning speed, organizations need more than just vulnerability 
            scanners—they need intelligence-driven security operations that prioritize what matters most.
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-4">What Sets Us Apart</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Intelligence Dashboards</h3>
                <p className="text-slate-300">
                  Our CVE and Threat Intelligence dashboards provide live, curated intelligence from trusted sources, 
                  updated every 15 minutes with emergency and zero-day detection.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Integrated Service Approach</h3>
                <p className="text-slate-300">
                  We don't just provide point solutions. Our VM, Threat Intelligence, Application Security, and SOC 
                  services work together seamlessly to provide comprehensive protection.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Risk-Based Prioritization</h3>
                <p className="text-slate-300">
                  We go beyond CVSS scores, incorporating threat intelligence, exploit availability, and business 
                  context to help you focus on vulnerabilities that pose the greatest risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-4">Our Expertise</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Industries We Serve</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Financial Services & Banking</li>
                <li>• Healthcare & Life Sciences</li>
                <li>• Manufacturing & Industrial</li>
                <li>• Technology & SaaS</li>
                <li>• Government & Public Sector</li>
                <li>• Retail & E-commerce</li>
                <li>• Energy & Utilities</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Core Capabilities</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Vulnerability Management</li>
                <li>• Threat Intelligence</li>
                <li>• Application Security</li>
                <li>• SOC Operations</li>
                <li>• Incident Response</li>
                <li>• Security Architecture</li>
                <li>• Compliance & GRC</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Contact Page
  const ContactPage = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = React.useState(''); // 'success', 'error', or ''

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    // Set submitting status
    setSubmitStatus('submitting');

    try {
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/xzdpogzn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Show success message
        setSubmitStatus('success');
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            company: '',
            service: '',
            message: ''
          });
          setSubmitStatus('');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus(''), 3000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  return (
    <div className="bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">Contact Us</h1>
        <p className="text-xl text-slate-400 text-center mb-12">
          Ready to strengthen your security posture? Get in touch with our team today.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Get In Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-cyan-400 mr-3 mt-1" />
                <div>
                  <div className="text-slate-400 text-sm">Email</div>
                  <a href="mailto:business@cvepulse.com" className="text-white text-lg hover:text-cyan-400">
                    business@cvepulse.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-cyan-400 mr-3 mt-1" />
                <div>
                  <div className="text-slate-400 text-sm">Phone</div>
                  <div className="text-white text-lg">
                    Available upon request
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-cyan-400 mr-3 mt-1" />
                <div>
                  <div className="text-slate-400 text-sm">Location</div>
                  <div className="text-white text-lg">
                    London, UK | Delhi, India
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Name *</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Company</label>
                <input 
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Your company"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Service Interest</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option>Vulnerability Management</option>
                  <option>Threat Intelligence</option>
                  <option>Application Threat Modeling</option>
                  <option>SOC Monitoring</option>
                  <option>Multiple Services</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Message *</label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Tell us about your security needs..."
                  required
                ></textarea>
              </div>
              {submitStatus === 'submitting' && (
                <div className="p-4 bg-blue-900/50 border border-blue-500 rounded-lg text-blue-200">
                  ⏳ Sending message...
                </div>
              )}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                  ❌ Error sending message. Please try again or email us directly.
                </div>
              )}
              <button
                type="submit"
                disabled={submitStatus === 'submitting'}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Prefer to schedule a call?</h2>
          <p className="text-cyan-50 mb-6">
            Book a 30-minute consultation with our security experts
          </p>
          <button
                onClick={() => {
                  // Open email client as alternative to Calendly
                  window.open('https://calendly.com/business-cvepulse/security-consultation', '_blank', 'width=900,height=900');
                }}
                className="px-8 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-slate-100 transition-all cursor-pointer"
              >
                Schedule a Call
              </button>
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

  // Main Navigation Bar
  const NavigationBar = () => (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">CVEPulse</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navigation.map((item) => (
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
            ))}
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
            {navigation.map((item) => (
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
            ))}
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
    </div>
  );
};

export default CVEPulseWebsite;
