import React, { useState, useEffect } from 'react';
import { X, Bell, MessageSquare, Mail, Smartphone, Check, AlertTriangle } from 'lucide-react';

const AlertsModal = ({ isOpen, onClose }) => {
  const [slackWebhook, setSlackWebhook] = useState('');
  const [teamsWebhook, setTeamsWebhook] = useState('');
  const [email, setEmail] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  
  const [preferences, setPreferences] = useState({
    zeroDay: true,
    newKev: true,
    ransomware: true,
    highEpss: false
  });

  const [testResults, setTestResults] = useState({
    slack: null,
    teams: null,
    email: null,
    push: null
  });

  useEffect(() => {
    // Load saved settings
    setSlackWebhook(localStorage.getItem('cvepulse_slack_webhook') || '');
    setTeamsWebhook(localStorage.getItem('cvepulse_teams_webhook') || '');
    setEmail(localStorage.getItem('cvepulse_email_subscribed') || '');
    
    const savedPrefs = JSON.parse(localStorage.getItem('cvepulse_alert_prefs') || '{}');
    setPreferences({
      zeroDay: savedPrefs.zeroDay !== false,
      newKev: savedPrefs.newKev !== false,
      ransomware: savedPrefs.ransomware !== false,
      highEpss: savedPrefs.highEpss === true
    });

    // Check push notification status
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
      setPushEnabled(Notification.permission === 'granted');
    }
  }, [isOpen]);

  const saveSlackWebhook = () => {
    if (slackWebhook && !slackWebhook.startsWith('https://hooks.slack.com/')) {
      setTestResults({ ...testResults, slack: { success: false, message: 'Invalid Slack webhook URL' } });
      return;
    }
    localStorage.setItem('cvepulse_slack_webhook', slackWebhook);
    setTestResults({ ...testResults, slack: { success: true, message: 'Webhook saved!' } });
  };

  const saveTeamsWebhook = () => {
    if (teamsWebhook && !teamsWebhook.includes('webhook.office.com') && !teamsWebhook.includes('outlook.office.com')) {
      setTestResults({ ...testResults, teams: { success: false, message: 'Invalid Teams webhook URL' } });
      return;
    }
    localStorage.setItem('cvepulse_teams_webhook', teamsWebhook);
    setTestResults({ ...testResults, teams: { success: true, message: 'Webhook saved!' } });
  };

  const testSlackWebhook = async () => {
    if (!slackWebhook) {
      setTestResults({ ...testResults, slack: { success: false, message: 'Enter webhook URL first' } });
      return;
    }

    setTestResults({ ...testResults, slack: { success: null, message: 'Testing...' } });

    // Due to CORS, provide curl command
    const curlCommand = `curl -X POST -H 'Content-Type: application/json' -d '{"text":"🛡️ CVEPulse Test Alert - Connection successful!"}' '${slackWebhook}'`;
    
    setTestResults({
      ...testResults,
      slack: {
        success: true,
        message: 'CORS prevents direct testing. Run this command:',
        curl: curlCommand
      }
    });
  };

  const testTeamsWebhook = async () => {
    if (!teamsWebhook) {
      setTestResults({ ...testResults, teams: { success: false, message: 'Enter webhook URL first' } });
      return;
    }

    const curlCommand = `curl -X POST -H 'Content-Type: application/json' -d '{"text":"🛡️ CVEPulse Test Alert - Connection successful!"}' '${teamsWebhook}'`;
    
    setTestResults({
      ...testResults,
      teams: {
        success: true,
        message: 'CORS prevents direct testing. Run this command:',
        curl: curlCommand
      }
    });
  };

  const subscribeEmail = async () => {
    if (!email || !email.includes('@')) {
      setTestResults({ ...testResults, email: { success: false, message: 'Enter valid email' } });
      return;
    }

    setTestResults({ ...testResults, email: { success: null, message: 'Subscribing...' } });

    try {
      const response = await fetch('https://YOUR_FIREBASE_PROJECT.cloudfunctions.net/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preferences })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('cvepulse_email_subscribed', email);
        setTestResults({ ...testResults, email: { success: true, message: data.message } });
      } else {
        setTestResults({ ...testResults, email: { success: false, message: data.error } });
      }
    } catch (e) {
      // Backend not deployed yet
      localStorage.setItem('cvepulse_email_subscribed', email);
      setTestResults({
        ...testResults,
        email: { success: true, message: 'Saved locally. Deploy backend for full functionality.' }
      });
    }
  };

  const enablePushNotifications = async () => {
    if (!('Notification' in window)) {
      setTestResults({ ...testResults, push: { success: false, message: 'Browser not supported' } });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        setPushEnabled(true);
        localStorage.setItem('cvepulse_push_enabled', 'true');
        
        // Show welcome notification
        new Notification('CVEPulse Alerts Enabled! 🛡️', {
          body: 'You will now receive alerts for critical vulnerabilities.',
          icon: '/favicon.ico'
        });

        setTestResults({ ...testResults, push: { success: true, message: 'Notifications enabled!' } });
      } else {
        setTestResults({ ...testResults, push: { success: false, message: 'Permission denied' } });
      }
    } catch (e) {
      setTestResults({ ...testResults, push: { success: false, message: 'Failed to enable' } });
    }
  };

  const testPushNotification = () => {
    if (Notification.permission !== 'granted') return;

    new Notification('🚨 CVEPulse Test Alert', {
      body: 'CVE-2025-0282 - Ivanti Connect Secure\nZero-Day: No patch available',
      icon: '/favicon.ico',
      requireInteraction: true
    });

    setTestResults({ ...testResults, push: { success: true, message: 'Test notification sent!' } });
  };

  const savePreferences = () => {
    localStorage.setItem('cvepulse_alert_prefs', JSON.stringify(preferences));
    alert('Preferences saved!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Alert Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Slack Integration */}
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">Slack</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${slackWebhook ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {slackWebhook ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <input
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none mb-2"
            />
            <div className="flex gap-2">
              <button onClick={saveSlackWebhook} className="px-3 py-1.5 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">Save</button>
              <button onClick={testSlackWebhook} className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-500">Test</button>
            </div>
            {testResults.slack && (
              <div className={`mt-2 p-2 rounded text-xs ${testResults.slack.success ? 'bg-green-500/20 text-green-400' : testResults.slack.success === false ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                {testResults.slack.message}
                {testResults.slack.curl && (
                  <pre className="mt-2 p-2 bg-slate-900 rounded text-xs overflow-x-auto">{testResults.slack.curl}</pre>
                )}
              </div>
            )}
          </div>

          {/* Teams Integration */}
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">Microsoft Teams</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${teamsWebhook ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {teamsWebhook ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <input
              type="url"
              value={teamsWebhook}
              onChange={(e) => setTeamsWebhook(e.target.value)}
              placeholder="https://outlook.office.com/webhook/..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none mb-2"
            />
            <div className="flex gap-2">
              <button onClick={saveTeamsWebhook} className="px-3 py-1.5 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">Save</button>
              <button onClick={testTeamsWebhook} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-500">Test</button>
            </div>
            {testResults.teams && (
              <div className={`mt-2 p-2 rounded text-xs ${testResults.teams.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {testResults.teams.message}
                {testResults.teams.curl && (
                  <pre className="mt-2 p-2 bg-slate-900 rounded text-xs overflow-x-auto">{testResults.teams.curl}</pre>
                )}
              </div>
            )}
          </div>

          {/* Email Subscription */}
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white">Email Alerts</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${email ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {email ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none mb-2"
            />
            <button onClick={subscribeEmail} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500">
              Subscribe
            </button>
            {testResults.email && (
              <div className={`mt-2 p-2 rounded text-xs ${testResults.email.success ? 'bg-green-500/20 text-green-400' : testResults.email.success === false ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                {testResults.email.message}
              </div>
            )}
          </div>

          {/* Browser Push Notifications */}
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-400" />
                <span className="font-semibold text-white">Browser Notifications</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                pushPermission === 'granted' ? 'bg-green-500/20 text-green-400' : 
                pushPermission === 'denied' ? 'bg-red-500/20 text-red-400' : 
                'bg-slate-700 text-slate-400'
              }`}>
                {pushPermission === 'granted' ? 'Enabled' : pushPermission === 'denied' ? 'Blocked' : 'Not Enabled'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Get instant alerts even when this tab is in the background.</p>
            <div className="flex gap-2">
              {pushPermission !== 'granted' ? (
                <button
                  onClick={enablePushNotifications}
                  disabled={pushPermission === 'denied'}
                  className={`px-3 py-1.5 rounded text-sm ${
                    pushPermission === 'denied' 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-orange-600 text-white hover:bg-orange-500'
                  }`}
                >
                  {pushPermission === 'denied' ? 'Check Browser Settings' : 'Enable Notifications'}
                </button>
              ) : (
                <button onClick={testPushNotification} className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-500">
                  Send Test
                </button>
              )}
            </div>
            {testResults.push && (
              <div className={`mt-2 p-2 rounded text-xs ${testResults.push.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {testResults.push.message}
              </div>
            )}
          </div>

          {/* Alert Preferences */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Alert Triggers
            </h3>
            <div className="space-y-3">
              {[
                { key: 'zeroDay', label: 'Zero-Day Vulnerabilities', desc: 'Critical with no patch' },
                { key: 'newKev', label: 'New KEV Additions', desc: 'Added to CISA catalog' },
                { key: 'ransomware', label: 'Ransomware-Linked', desc: 'Known ransomware use' },
                { key: 'highEpss', label: 'High EPSS Score (≥70%)', desc: 'High exploit probability' },
              ].map((pref) => (
                <label key={pref.key} className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-sm text-white group-hover:text-cyan-400 transition-colors">{pref.label}</div>
                    <div className="text-xs text-slate-500">{pref.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[pref.key]}
                    onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                    className="w-5 h-5 accent-cyan-500"
                  />
                </label>
              ))}
            </div>
            <button onClick={savePreferences} className="mt-4 w-full py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsModal;
