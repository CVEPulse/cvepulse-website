import React, { useState, useEffect } from 'react';

// CVE Data Fetcher - Fetches real CVE data from public APIs
class CVEDataFetcher {
  constructor() {
    this.cache = {
      trending: null,
      emergency: null,
      lastUpdate: null
    };
  }

  async fetchRecentCVEs() {
    try {
      const days = 7;
      const endDate = new Date();
      const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000);
      
      const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate.toISOString()}&pubEndDate=${endDate.toISOString()}&resultsPerPage=100`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.vulnerabilities.map(item => {
        const cve = item.cve;
        const cvssData = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV3?.[0] || cve.metrics?.cvssMetricV2?.[0];
        
        return {
          id: cve.id,
          description: cve.descriptions.find(d => d.lang === 'en')?.value || 'No description',
          cvssScore: cvssData?.cvssData?.baseScore || 0,
          severity: cvssData?.cvssData?.baseSeverity || 'UNKNOWN',
          published: cve.published,
          lastModified: cve.lastModified,
          references: cve.references || []
        };
      });
    } catch (error) {
      console.error('Error fetching CVEs:', error);
      return [];
    }
  }

  async searchGitHubPoCs(cveId) {
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${cveId}+poc+OR+exploit&sort=stars&order=desc&per_page=5`);
      const data = await response.json();
      
      return {
        count: data.total_count || 0,
        repos: data.items?.slice(0, 3).map(repo => ({
          name: repo.full_name,
          stars: repo.stargazers_count,
          url: repo.html_url
        })) || []
      };
    } catch (error) {
      console.error('Error searching GitHub:', error);
      return { count: 0, repos: [] };
    }
  }

  calculateTrendingScore(cve, githubData) {
    let score = 0;
    
    score += (cve.cvssScore / 10) * 40;
    
    if (githubData.count > 0) {
      score += Math.min(githubData.count * 2, 30);
    }
    
    if (cve.severity === 'CRITICAL') score *= 1.5;
    else if (cve.severity === 'HIGH') score *= 1.3;
    
    const daysOld = (Date.now() - new Date(cve.published)) / (1000 * 60 * 60 * 24);
    score += Math.max(20 - daysOld * 2, 0);
    
    return Math.round(score);
  }

  async getTrendingCVEs() {
    try {
      const cves = await this.fetchRecentCVEs();
      const scoredCVEs = [];
      
      for (const cve of cves.slice(0, 20)) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const githubData = await this.searchGitHubPoCs(cve.id);
        const score = this.calculateTrendingScore(cve, githubData);
        
        scoredCVEs.push({
          ...cve,
          trendingScore: score,
          githubRepos: githubData.count,
          pocLinks: githubData.repos
        });
      }
      
      return scoredCVEs
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting trending CVEs:', error);
      return [];
    }
  }

  async getEmergencyCVEs() {
    try {
      const cves = await this.fetchRecentCVEs();
      
      return cves.filter(cve => {
        const daysOld = (Date.now() - new Date(cve.published)) / (1000 * 60 * 60 * 24);
        return (cve.severity === 'CRITICAL' || cve.cvssScore >= 9.0) && daysOld <= 7;
      });
    } catch (error) {
      console.error('Error getting emergency CVEs:', error);
      return [];
    }
  }
}

// Trending CVEs Component
export function TrendingCVEs() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendingData();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(loadTrendingData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTrendingData = async () => {
    try {
      setLoading(true);
      const fetcher = new CVEDataFetcher();
      const data = await fetcher.getTrendingCVEs();
      setTrending(data);
      setError(null);
    } catch (err) {
      setError('Failed to load trending CVEs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>🔥 Trending CVEs</h2>
        <div style={styles.loading}>Loading trending vulnerabilities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>🔥 Trending CVEs</h2>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔥 Trending CVEs</h2>
      <p style={styles.subtitle}>Top 10 trending vulnerabilities based on CVSS score, GitHub activity, and recency</p>
      
      <div style={styles.grid}>
        {trending.map((cve, index) => (
          <div key={cve.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.rank}>#{index + 1}</span>
              <span style={{...styles.badge, ...styles[`severity${cve.severity}`]}}>
                {cve.severity}
              </span>
            </div>
            
            <h3 style={styles.cveId}>{cve.id}</h3>
            
            <p style={styles.description}>
              {cve.description.substring(0, 150)}...
            </p>
            
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Trending Score</span>
                <span style={styles.trendingScore}>{cve.trendingScore}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>CVSS</span>
                <span style={styles.cvssScore}>{cve.cvssScore}</span>
              </div>
              {cve.githubRepos > 0 && (
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>PoCs</span>
                  <span style={styles.pocCount}>📦 {cve.githubRepos}</span>
                </div>
              )}
            </div>
            
            {cve.pocLinks.length > 0 && (
              <div style={styles.pocLinks}>
                <strong>Exploit PoCs:</strong>
                {cve.pocLinks.map(poc => (
                  <a 
                    key={poc.url} 
                    href={poc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.pocLink}
                  >
                    {poc.name} (⭐ {poc.stars})
                  </a>
                ))}
              </div>
            )}
            
            <div style={styles.published}>
              Published: {new Date(cve.published).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Emergency CVEs Component
export function EmergencyCVEs() {
  const [emergency, setEmergency] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergencyData();
    
    const interval = setInterval(loadEmergencyData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadEmergencyData = async () => {
    try {
      const fetcher = new CVEDataFetcher();
      const data = await fetcher.getEmergencyCVEs();
      setEmergency(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>🚨 Emergency Feed</h2>
        <div style={styles.loading}>Loading critical vulnerabilities...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚨 Emergency & Critical CVEs</h2>
      <p style={styles.subtitle}>CVSS ≥ 9.0 or Critical severity (Last 7 days)</p>
      
      {emergency.length === 0 ? (
        <div style={styles.noData}>No critical CVEs in the last 7 days</div>
      ) : (
        <div style={styles.timeline}>
          {emergency.map(cve => (
            <div key={cve.id} style={styles.emergencyCard}>
              <span style={styles.criticalBadge}>CRITICAL</span>
              <h3 style={styles.cveId}>{cve.id}</h3>
              <p style={styles.description}>{cve.description.substring(0, 200)}...</p>
              <div style={styles.emergencyMeta}>
                <span>CVSS: <strong>{cve.cvssScore}</strong></span>
                <span>Published: {new Date(cve.published).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a1a1a'
  },
  subtitle: {
    color: '#666',
    marginBottom: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  rank: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ff6b35'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  severityCRITICAL: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  severityHIGH: {
    backgroundColor: '#fd7e14',
    color: 'white'
  },
  severityMEDIUM: {
    backgroundColor: '#ffc107',
    color: 'black'
  },
  severityLOW: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  cveId: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#2c3e50'
  },
  description: {
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  metrics: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  metric: {
    display: 'flex',
    flexDirection: 'column'
  },
  metricLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase'
  },
  trendingScore: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ff6b35'
  },
  cvssScore: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#dc3545'
  },
  pocCount: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#007bff'
  },
  pocLinks: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '13px'
  },
  pocLink: {
    display: 'block',
    color: '#007bff',
    textDecoration: 'none',
    marginTop: '4px'
  },
  published: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#888'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  emergencyCard: {
    backgroundColor: '#fff5f5',
    border: '2px solid #dc3545',
    borderRadius: '8px',
    padding: '16px'
  },
  criticalBadge: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'inline-block'
  },
  emergencyMeta: {
    display: 'flex',
    gap: '20px',
    marginTop: '12px',
    fontSize: '13px',
    color: '#666'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  }
};

export default TrendingCVEs;
