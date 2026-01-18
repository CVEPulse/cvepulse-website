# CVEPulse Firebase Backend

Complete backend for CVEPulse vulnerability alert system with real email notifications, Slack/Teams integration, and scheduled checks.

## Features

- ✅ **Email Subscription API** - Subscribe users to alerts
- ✅ **Lead Capture API** - Capture consultation requests
- ✅ **Immediate Alerts** - Send alerts when new CVEs are added to CISA KEV
- ✅ **Daily Digest** - Daily summary email at 8 AM EST
- ✅ **Weekly Summary** - Weekly report on Mondays at 9 AM EST
- ✅ **Slack Integration** - Send alerts to Slack channels
- ✅ **Teams Integration** - Send alerts to Microsoft Teams
- ✅ **Custom Webhooks** - Send to any endpoint
- ✅ **Watchlist Filtering** - Only alert on specific vendors

## Setup Instructions

### 1. Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 2. Initialize Firebase Project

```bash
# Create new project at https://console.firebase.google.com
# Then initialize in this directory
firebase init

# Select:
# - Functions
# - Firestore
# - Hosting
```

### 3. Configure Email Provider

Choose ONE email provider:

#### Option A: SendGrid (Recommended for Production)

```bash
# Get API key from https://sendgrid.com
firebase functions:config:set sendgrid.key="SG.your-api-key"
```

#### Option B: Gmail (For Testing)

```bash
# Use App Password from Google Account settings
firebase functions:config:set email.user="your@gmail.com" email.pass="your-app-password"
```

#### Option C: Mailgun

```bash
firebase functions:config:set mailgun.user="postmaster@your-domain.mailgun.org" mailgun.pass="your-key"
```

### 4. Set Admin Email

```bash
firebase functions:config:set admin.email="maya@cvepulse.com"
```

### 5. Deploy

```bash
# Deploy functions
cd functions
npm install
cd ..
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore

# Deploy hosting (optional)
firebase deploy --only hosting
```

## API Endpoints

After deployment, your endpoints will be:

```
POST https://your-project.cloudfunctions.net/subscribe
POST https://your-project.cloudfunctions.net/unsubscribe
POST https://your-project.cloudfunctions.net/lead
GET  https://your-project.cloudfunctions.net/stats
```

If using Firebase Hosting with rewrites:
```
POST https://your-domain.com/api/subscribe
POST https://your-domain.com/api/unsubscribe
POST https://your-domain.com/api/lead
GET  https://your-domain.com/api/stats
```

## Scheduled Functions

These run automatically:

| Function | Schedule | Description |
|----------|----------|-------------|
| `checkKEV` | Every hour | Checks CISA KEV for new CVEs, sends immediate alerts |
| `dailyDigest` | 8 AM EST daily | Sends daily summary to daily subscribers |
| `weeklySummary` | 9 AM EST Monday | Sends weekly report to weekly subscribers |

## Dashboard Integration

Update your dashboard.html to use the real API:

```javascript
// Replace the handleSubscribe function:
async function handleSubscribe(e) {
  e.preventDefault();
  
  const data = {
    email: document.getElementById('sub-email').value,
    company: document.getElementById('sub-company').value,
    frequency: document.getElementById('sub-frequency').value,
    watchlist: watchlist,
    integrations: integrations
  };
  
  try {
    const response = await fetch('https://YOUR-PROJECT.cloudfunctions.net/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
      showSuccess('✅ Subscribed! Check your email for confirmation.');
    } else {
      showError(result.error || 'Subscription failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

// Replace the handleContactForm function:
async function handleContactForm(e) {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    company: document.getElementById('contact-company').value,
    service: document.getElementById('contact-service').value,
    message: document.getElementById('contact-message').value
  };
  
  try {
    const response = await fetch('https://YOUR-PROJECT.cloudfunctions.net/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
      showSuccess('✅ Request submitted! We will contact you soon.');
      closeModal('contact-modal');
    } else {
      showError(result.error || 'Submission failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}
```

## Firestore Collections

The backend creates these collections:

### `subscribers`
```javascript
{
  email: "user@company.com",
  company: "Company Name",
  frequency: "immediate" | "daily" | "weekly",
  watchlist: ["Microsoft", "Cisco"],
  integrations: {
    slack: "https://hooks.slack.com/...",
    teams: "https://outlook.office.com/webhook/...",
    webhook: "https://your-endpoint.com/..."
  },
  active: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastAlertSent: Timestamp | null
}
```

### `leads`
```javascript
{
  name: "John Doe",
  email: "john@company.com",
  company: "Company Name",
  service: "vm" | "ti" | "soc" | "consulting",
  message: "...",
  status: "new" | "contacted" | "qualified" | "closed",
  createdAt: Timestamp
}
```

### `kev_data`
```javascript
// Document: latest_stats
{
  total: 1200,
  overdue: 45,
  critical: 23,
  newLast24h: 3,
  lastChecked: Timestamp
}

// Document: known_cves
{
  cves: ["CVE-2024-1234", "CVE-2024-5678", ...],
  updatedAt: Timestamp
}
```

## Monitoring

```bash
# View function logs
firebase functions:log

# View specific function
firebase functions:log --only checkKEV
```

## Cost Estimates

Firebase free tier (Spark) includes:
- 125K function invocations/month
- 40K GB-seconds compute/month
- 1GB Firestore storage

For CVEPulse with ~1000 subscribers:
- ~720 hourly KEV checks/month
- ~30 daily digest sends/month
- ~4 weekly summaries/month
- Total: ~1000-5000 invocations/month = **FREE**

## Troubleshooting

### Emails not sending
1. Check function logs: `firebase functions:log --only dailyDigest`
2. Verify email config: `firebase functions:config:get`
3. Check SendGrid/Gmail for blocks

### Scheduled functions not running
1. Verify Cloud Scheduler is enabled in GCP Console
2. Check function deployment status
3. Check IAM permissions

### CORS errors
The functions include CORS handling. If issues persist, verify your domain is allowed.

## Support

For issues or questions:
- Email: support@cvepulse.com
- Dashboard: https://cvepulse.com/dashboard.html
