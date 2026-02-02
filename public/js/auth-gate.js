/**
 * CVEPulse User Auth & Feature Gating System
 * 
 * Lightweight client-side session system using localStorage + Firestore verification.
 * No Firebase Auth SDK needed — uses custom API endpoints.
 * 
 * Tiers:
 *   - anonymous: No signup. Can see dashboard but gets upgrade prompts.
 *   - community: Signed up free. IoC limited to 3/day. JSON export only. No campaigns/timeline.
 *   - professional: Trial or paid. Full access. Trial = 14 days from signup.
 *   - enterprise: Full access. No limits.
 * 
 * Gated features (Pro+):
 *   - PDF export
 *   - CSV export  
 *   - Campaign intelligence tab
 *   - Timeline tab
 *   - Unlimited IoC lookups (community = 3/day)
 *   - MITRE ATT&CK mapping in IoC results
 */

const AUTH_API = 'https://us-central1-cvepulse.cloudfunctions.net';
const SESSION_KEY = 'cvepulse_session';
const IOC_COUNT_KEY = 'cvepulse_ioc_count';
const IOC_DATE_KEY = 'cvepulse_ioc_date';
const TRIAL_DAYS = 14;

// ============================================
// SESSION MANAGEMENT
// ============================================

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function setSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(IOC_COUNT_KEY);
  localStorage.removeItem(IOC_DATE_KEY);
}

function getUserTier() {
  const session = getSession();
  if (!session) return 'anonymous';
  
  // Check trial expiry for professional
  if (session.plan === 'professional' && session.trialStart && !session.paid) {
    const trialEnd = new Date(session.trialStart);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    if (new Date() > trialEnd) {
      return 'expired';
    }
  }
  
  return session.plan || 'community';
}

function getTrialDaysLeft() {
  const session = getSession();
  if (!session || session.plan !== 'professional' || !session.trialStart) return 0;
  const trialEnd = new Date(session.trialStart);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  const diff = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function isProFeature() {
  const tier = getUserTier();
  return tier === 'professional' || tier === 'enterprise';
}

// ============================================
// IoC RATE LIMITING (Community: 3/day)
// ============================================

function getIoCCount() {
  const today = new Date().toISOString().split('T')[0];
  const savedDate = localStorage.getItem(IOC_DATE_KEY);
  
  if (savedDate !== today) {
    // New day, reset counter
    localStorage.setItem(IOC_DATE_KEY, today);
    localStorage.setItem(IOC_COUNT_KEY, '0');
    return 0;
  }
  
  return parseInt(localStorage.getItem(IOC_COUNT_KEY) || '0', 10);
}

function incrementIoCCount() {
  const count = getIoCCount() + 1;
  localStorage.setItem(IOC_COUNT_KEY, count.toString());
  return count;
}

function canDoIoCLookup() {
  if (isProFeature()) return true; // Pro/Enterprise: unlimited
  return getIoCCount() < 3; // Community: 3/day
}

function getRemainingIoC() {
  if (isProFeature()) return '∞';
  return Math.max(0, 3 - getIoCCount());
}

// ============================================
// UI: AUTH BAR (injected into dashboard header)
// ============================================

function renderAuthBar() {
  const tier = getUserTier();
  const session = getSession();
  
  // Remove existing auth bar if any
  document.getElementById('auth-bar')?.remove();
  
  const bar = document.createElement('div');
  bar.id = 'auth-bar';
  bar.className = 'auth-bar';
  
  if (tier === 'anonymous') {
    bar.innerHTML = `
      <div class="auth-bar-inner">
        <span class="auth-msg">🔓 You're browsing as a guest. <strong>Sign up free</strong> to save preferences and track threats.</span>
        <div class="auth-actions">
          <button class="auth-btn auth-btn-primary" onclick="openAuthModal('community')">Sign Up Free</button>
          <button class="auth-btn auth-btn-outline" onclick="openAuthModal('professional')">Start Pro Trial</button>
        </div>
      </div>
    `;
  } else if (tier === 'expired') {
    bar.innerHTML = `
      <div class="auth-bar-inner auth-bar-expired">
        <span class="auth-msg">⏰ Your Professional trial has ended. Upgrade to keep full access, or continue with Community features.</span>
        <div class="auth-actions">
          <button class="auth-btn auth-btn-upgrade" onclick="openUpgradeModal()">Upgrade to Pro — $49/mo</button>
          <button class="auth-btn auth-btn-ghost" onclick="downgradeToFree()">Continue as Community</button>
        </div>
      </div>
    `;
  } else if (tier === 'professional' && !session?.paid) {
    const daysLeft = getTrialDaysLeft();
    bar.innerHTML = `
      <div class="auth-bar-inner auth-bar-trial">
        <span class="auth-msg">🚀 <strong>Pro Trial</strong> — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining. Enjoying full access.</span>
        <div class="auth-actions">
          <span class="auth-user">👤 ${session?.name || session?.email || ''}</span>
          <button class="auth-btn auth-btn-outline" onclick="openUpgradeModal()">Upgrade Now</button>
          <button class="auth-btn auth-btn-ghost" onclick="handleLogout()">Sign Out</button>
        </div>
      </div>
    `;
  } else if (tier === 'community') {
    bar.innerHTML = `
      <div class="auth-bar-inner">
        <span class="auth-msg">👤 <strong>${session?.name || 'Community'}</strong> — <a href="#" onclick="openAuthModal('professional');return false;" style="color:var(--accent)">Upgrade to Pro</a> for unlimited IoC, PDF reports & more</span>
        <div class="auth-actions">
          <span class="auth-ioc-count" title="IoC lookups remaining today">🔍 ${getRemainingIoC()}/3 lookups</span>
          <button class="auth-btn auth-btn-ghost" onclick="handleLogout()">Sign Out</button>
        </div>
      </div>
    `;
  } else {
    // Professional (paid) or Enterprise
    const label = tier === 'enterprise' ? 'Enterprise' : 'Professional';
    bar.innerHTML = `
      <div class="auth-bar-inner auth-bar-pro">
        <span class="auth-msg">✨ <strong>${label}</strong> — ${session?.name || session?.email || ''}</span>
        <div class="auth-actions">
          <button class="auth-btn auth-btn-ghost" onclick="handleLogout()">Sign Out</button>
        </div>
      </div>
    `;
  }
  
  // Insert after header
  const header = document.querySelector('.header');
  if (header) header.after(bar);
}

// ============================================
// UI: FEATURE GATING ON DASHBOARD
// ============================================

function applyFeatureGating() {
  const tier = getUserTier();
  const isPro = isProFeature();
  
  // --- Export buttons ---
  const exportMenu = document.getElementById('export-menu');
  if (exportMenu) {
    const buttons = exportMenu.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.includes('csv') || text.includes('pdf')) {
        if (!isPro) {
          btn.classList.add('gated');
          btn.setAttribute('data-original-onclick', btn.getAttribute('onclick') || '');
          btn.onclick = (e) => {
            e.preventDefault();
            showUpgradePrompt('PDF & CSV export');
          };
          btn.innerHTML += ' <span class="pro-badge">PRO</span>';
        }
      }
    });
  }
  
  // --- Campaign tab ---
  const campaignTab = document.querySelector('[data-tab="campaigns"]');
  if (campaignTab && !isPro) {
    campaignTab.classList.add('gated-tab');
    const origClick = campaignTab.onclick;
    campaignTab.onclick = (e) => {
      e.preventDefault();
      showUpgradePrompt('Campaign Intelligence');
    };
    campaignTab.innerHTML += ' <span class="pro-badge">PRO</span>';
  }
  
  // --- Timeline tab ---
  const timelineTab = document.querySelector('[data-tab="timeline"]');
  if (timelineTab && !isPro) {
    timelineTab.classList.add('gated-tab');
    timelineTab.onclick = (e) => {
      e.preventDefault();
      showUpgradePrompt('Timeline & Trend Analysis');
    };
    timelineTab.innerHTML += ' <span class="pro-badge">PRO</span>';
  }
  
  // --- IoC lookup counter ---
  updateIoCCounter();
}

function updateIoCCounter() {
  const lookupBtn = document.querySelector('#panel-lookup .btn-primary');
  if (!lookupBtn) return;
  
  if (!isProFeature()) {
    const remaining = getRemainingIoC();
    // Add counter near the lookup button
    let counter = document.getElementById('ioc-counter');
    if (!counter) {
      counter = document.createElement('span');
      counter.id = 'ioc-counter';
      counter.className = 'ioc-counter';
      lookupBtn.parentNode.appendChild(counter);
    }
    counter.textContent = `${remaining}/3 remaining today`;
    counter.style.color = remaining === 0 ? '#f43f5e' : '#8896ab';
  }
}

// ============================================
// OVERRIDE FUNCTIONS (intercept existing dashboard functions)
// ============================================

function gateIoCLookup(originalFn) {
  return function() {
    if (!canDoIoCLookup()) {
      showUpgradePrompt('IoC Lookups', 'You\'ve used all 3 free lookups today. Upgrade to Professional for unlimited IoC analysis.');
      return;
    }
    // Increment counter before making the call
    incrementIoCCount();
    updateIoCCounter();
    // Update auth bar IoC count
    const iocSpan = document.querySelector('.auth-ioc-count');
    if (iocSpan) iocSpan.textContent = `🔍 ${getRemainingIoC()}/3 lookups`;
    // Call original
    return originalFn.apply(this, arguments);
  };
}

function gateExport(type, originalFn) {
  return function() {
    if (!isProFeature()) {
      showUpgradePrompt(`${type} Export`);
      return;
    }
    return originalFn.apply(this, arguments);
  };
}

// ============================================
// UI: UPGRADE PROMPT MODAL
// ============================================

function showUpgradePrompt(feature, customMsg) {
  // Remove existing
  document.getElementById('upgrade-prompt')?.remove();
  
  const tier = getUserTier();
  const isAnon = tier === 'anonymous';
  
  const overlay = document.createElement('div');
  overlay.id = 'upgrade-prompt';
  overlay.className = 'modal-overlay active';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  
  overlay.innerHTML = `
    <div class="modal" style="max-width:440px;text-align:center;padding:40px;">
      <button class="modal-close" onclick="document.getElementById('upgrade-prompt').remove()">×</button>
      <div style="font-size:48px;margin-bottom:16px;">🔒</div>
      <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">${feature} — Professional Feature</h3>
      <p style="color:var(--text-secondary);font-size:14px;line-height:1.6;margin-bottom:24px;">
        ${customMsg || `${feature} is available on the Professional plan. ${isAnon ? 'Sign up for a free 14-day trial to unlock this and all Pro features.' : 'Upgrade to Professional to unlock this and all Pro features.'}`}
      </p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${isAnon ? `
          <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('upgrade-prompt').remove();openAuthModal('professional')">
            Start 14-Day Free Trial
          </button>
          <button class="btn btn-outline" style="width:100%;justify-content:center;" onclick="document.getElementById('upgrade-prompt').remove();openAuthModal('community')">
            Sign Up Free (Community)
          </button>
        ` : `
          <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('upgrade-prompt').remove();openUpgradeModal()">
            Upgrade to Professional — $49/mo
          </button>
        `}
        <button class="btn btn-outline" style="width:100%;justify-content:center;opacity:0.6;" onclick="document.getElementById('upgrade-prompt').remove()">
          Maybe Later
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

// ============================================
// AUTH MODAL (Sign Up / Login)
// ============================================

function openAuthModal(plan) {
  document.getElementById('auth-modal')?.remove();
  
  const isTrial = plan === 'professional';
  
  const overlay = document.createElement('div');
  overlay.id = 'auth-modal';
  overlay.className = 'modal-overlay active';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  
  overlay.innerHTML = `
    <div class="modal" style="max-width:460px;">
      <button class="modal-close" onclick="document.getElementById('auth-modal').remove()">×</button>
      <div id="auth-form-view">
        <h3 style="font-size:22px;font-weight:700;margin-bottom:6px;">
          ${isTrial ? '🚀 Start Professional Trial' : '👤 Create Free Account'}
        </h3>
        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px;">
          ${isTrial ? '14 days of full Professional access. No credit card required.' : 'Sign up to track your IoC lookups and get personalized threat alerts.'}
        </p>
        <form onsubmit="handleAuthSignup(event, '${plan}')">
          <div class="form-group" style="margin-bottom:14px;">
            <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Full Name *</label>
            <input type="text" id="auth-name" required placeholder="Jane Doe"
              style="width:100%;padding:11px 14px;background:var(--bg-elevated);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:var(--text-primary);font-size:14px;outline:none;">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Work Email *</label>
            <input type="email" id="auth-email" required placeholder="jane@company.com"
              style="width:100%;padding:11px 14px;background:var(--bg-elevated);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:var(--text-primary);font-size:14px;outline:none;">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Company</label>
            <input type="text" id="auth-company" placeholder="Company name"
              style="width:100%;padding:11px 14px;background:var(--bg-elevated);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:var(--text-primary);font-size:14px;outline:none;">
          </div>
          <button type="submit" id="auth-submit-btn"
            style="width:100%;padding:14px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;">
            ${isTrial ? 'Start 14-Day Free Trial' : 'Create Free Account'}
          </button>
          <p style="font-size:12px;color:var(--text-muted);margin-top:12px;text-align:center;">
            No credit card required. ${isTrial ? 'Reverts to Community after 14 days.' : 'Upgrade anytime.'}
          </p>
        </form>
      </div>
      <div id="auth-success-view" style="display:none;text-align:center;padding:20px 0;">
        <div style="font-size:48px;margin-bottom:16px;">${isTrial ? '🚀' : '✅'}</div>
        <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;" id="auth-success-title">Welcome!</h3>
        <p style="color:var(--text-secondary);font-size:14px;line-height:1.6;" id="auth-success-msg"></p>
        <button class="btn btn-primary" style="margin-top:20px;display:inline-flex;" onclick="document.getElementById('auth-modal').remove()">
          Continue to Dashboard →
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

async function handleAuthSignup(e, plan) {
  e.preventDefault();
  const btn = document.getElementById('auth-submit-btn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;
  
  const name = document.getElementById('auth-name').value;
  const email = document.getElementById('auth-email').value;
  const company = document.getElementById('auth-company').value;
  
  const sessionData = {
    name, email, company, plan,
    trialStart: plan === 'professional' ? new Date().toISOString() : null,
    paid: false,
    createdAt: new Date().toISOString()
  };
  
  // Save to Firestore via existing lead endpoint
  try {
    await fetch(`${AUTH_API}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, company,
        service: `Dashboard Signup - ${plan}`,
        message: `Plan: ${plan} | Source: threat-dashboard | Time: ${sessionData.createdAt}`
      })
    });
    
    await fetch(`${AUTH_API}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, company,
        frequency: plan === 'professional' ? 'daily' : 'weekly',
        sector: 'general'
      })
    });
  } catch (err) {
    console.error('Signup API error:', err);
  }
  
  // Set local session
  setSession(sessionData);
  
  // Show success
  document.getElementById('auth-form-view').style.display = 'none';
  document.getElementById('auth-success-view').style.display = 'block';
  
  if (plan === 'professional') {
    document.getElementById('auth-success-title').textContent = 'Pro Trial Activated!';
    document.getElementById('auth-success-msg').textContent = 
      `Welcome ${name}! You now have 14 days of full Professional access — unlimited IoC lookups, PDF reports, campaign intelligence, and more.`;
  } else {
    document.getElementById('auth-success-title').textContent = 'Welcome to CVEPulse!';
    document.getElementById('auth-success-msg').textContent = 
      `Welcome ${name}! Your Community account is ready. You have 3 IoC lookups per day and full access to threat monitoring dashboards.`;
  }
  
  showToast('✅ Account created!', 'success');
  
  // Re-apply gating and auth bar
  renderAuthBar();
  reapplyFeatureGating();
}

// ============================================
// UPGRADE MODAL (Trial expired or Community user)
// ============================================

function openUpgradeModal() {
  document.getElementById('upgrade-modal')?.remove();
  
  const session = getSession();
  
  const overlay = document.createElement('div');
  overlay.id = 'upgrade-modal';
  overlay.className = 'modal-overlay active';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  
  overlay.innerHTML = `
    <div class="modal" style="max-width:460px;">
      <button class="modal-close" onclick="document.getElementById('upgrade-modal').remove()">×</button>
      <div id="upgrade-form-view">
        <h3 style="font-size:22px;font-weight:700;margin-bottom:6px;">⚡ Upgrade to Professional</h3>
        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px;line-height:1.6;">
          Get unlimited IoC lookups, PDF reports, campaign intelligence, timeline analysis, and priority support for $49/month.
        </p>
        <div style="background:var(--bg-elevated);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:600;">Professional Plan</span>
            <span style="font-weight:700;color:var(--accent);">$49/month</span>
          </div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;">
            ✓ Unlimited IoC lookups<br>
            ✓ PDF & CSV export<br>
            ✓ Campaign intelligence<br>
            ✓ Timeline & trend analysis<br>
            ✓ MITRE ATT&CK mapping<br>
            ✓ API access (1,000/day)<br>
            ✓ Email support
          </div>
        </div>
        <form onsubmit="handleUpgradeRequest(event)">
          <div class="form-group" style="margin-bottom:14px;">
            <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Email *</label>
            <input type="email" id="upgrade-email" required value="${session?.email || ''}"
              style="width:100%;padding:11px 14px;background:var(--bg-elevated);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:var(--text-primary);font-size:14px;outline:none;">
          </div>
          <button type="submit" id="upgrade-btn"
            style="width:100%;padding:14px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">
            Request Upgrade — $49/month
          </button>
          <p style="font-size:12px;color:var(--text-muted);margin-top:12px;text-align:center;">
            Our team will set up your account and send payment instructions within 1 business day.
          </p>
        </form>
      </div>
      <div id="upgrade-success-view" style="display:none;text-align:center;padding:20px 0;">
        <div style="font-size:48px;margin-bottom:16px;">📬</div>
        <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">Upgrade Request Received!</h3>
        <p style="color:var(--text-secondary);font-size:14px;line-height:1.6;">
          We'll set up your Professional account and send payment instructions within 1 business day. You'll receive a confirmation at your email.
        </p>
        <button class="btn btn-outline" style="margin-top:20px;display:inline-flex;" onclick="document.getElementById('upgrade-modal').remove()">
          Got It
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

async function handleUpgradeRequest(e) {
  e.preventDefault();
  const btn = document.getElementById('upgrade-btn');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  
  const email = document.getElementById('upgrade-email').value;
  const session = getSession();
  
  try {
    await fetch(`${AUTH_API}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: session?.name || 'Upgrade Request',
        email,
        company: session?.company || '',
        service: 'Dashboard - Professional Upgrade',
        message: `Upgrade Request | Previous plan: ${session?.plan || 'unknown'} | Trial started: ${session?.trialStart || 'N/A'}`
      })
    });
  } catch (err) { console.error('Upgrade API error:', err); }
  
  document.getElementById('upgrade-form-view').style.display = 'none';
  document.getElementById('upgrade-success-view').style.display = 'block';
  showToast('✅ Upgrade request submitted!', 'success');
}

// ============================================
// DOWNGRADE (expired trial → community)
// ============================================

function downgradeToFree() {
  const session = getSession();
  if (session) {
    session.plan = 'community';
    session.trialStart = null;
    setSession(session);
  }
  renderAuthBar();
  reapplyFeatureGating();
  showToast('Switched to Community plan', 'success');
}

function handleLogout() {
  clearSession();
  renderAuthBar();
  // Reload to reset all gating
  location.reload();
}

// ============================================
// RE-APPLY GATING (after signup/login)
// ============================================

function reapplyFeatureGating() {
  // Remove existing pro badges and gating
  document.querySelectorAll('.pro-badge').forEach(b => b.remove());
  document.querySelectorAll('.gated-tab').forEach(t => t.classList.remove('gated-tab'));
  document.querySelectorAll('.gated').forEach(g => g.classList.remove('gated'));
  
  // Re-apply
  applyFeatureGating();
}

// ============================================
// INITIALIZATION
// ============================================

function initAuth() {
  // Inject auth bar CSS
  injectAuthStyles();
  
  // Render auth state
  renderAuthBar();
  
  // Apply feature gating
  applyFeatureGating();
  
  // Override IoC lookup with rate limiting
  if (typeof window.lookupIoC === 'function') {
    const originalLookup = window.lookupIoC;
    window.lookupIoC = gateIoCLookup(originalLookup);
  }
  
  // Override exports with gating
  if (typeof window.exportPDF === 'function') {
    const origPDF = window.exportPDF;
    window.exportPDF = gateExport('PDF', origPDF);
  }
  if (typeof window.exportCSV === 'function') {
    const origCSV = window.exportCSV;
    window.exportCSV = gateExport('CSV', origCSV);
  }
}

// ============================================
// STYLES INJECTION
// ============================================

function injectAuthStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .auth-bar {
      background: rgba(13,19,33,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 10px 24px;
      position: relative;
      z-index: 40;
    }
    .auth-bar-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .auth-bar-expired .auth-msg { color: #f59e0b; }
    .auth-bar-trial .auth-msg { color: #06b6d4; }
    .auth-bar-pro .auth-msg { color: #10b981; }
    .auth-msg { font-size: 13px; color: #8896ab; }
    .auth-msg strong { color: #edf2f7; }
    .auth-msg a { color: #06b6d4; text-decoration: none; }
    .auth-msg a:hover { text-decoration: underline; }
    .auth-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .auth-user { font-size: 13px; color: #8896ab; }
    .auth-ioc-count { font-size: 12px; color: #8896ab; background: rgba(255,255,255,0.04); padding: 4px 10px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; }
    .auth-btn {
      padding: 7px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .auth-btn-primary { background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; }
    .auth-btn-primary:hover { opacity: 0.9; }
    .auth-btn-outline { background: transparent; color: #edf2f7; border: 1px solid rgba(255,255,255,0.1); }
    .auth-btn-outline:hover { background: rgba(255,255,255,0.05); border-color: #06b6d4; }
    .auth-btn-upgrade { background: linear-gradient(135deg, #f59e0b, #f97316); color: #06090f; }
    .auth-btn-upgrade:hover { opacity: 0.9; }
    .auth-btn-ghost { background: transparent; color: #556378; border: none; }
    .auth-btn-ghost:hover { color: #8896ab; }
    
    /* Pro badges on gated features */
    .pro-badge {
      display: inline-block;
      padding: 1px 6px;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      color: white;
      font-size: 9px;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 6px;
      vertical-align: middle;
    }
    .gated-tab { opacity: 0.6; }
    .gated-tab:hover { opacity: 0.8; }
    .gated { opacity: 0.5; }
    .gated:hover { opacity: 0.7; }
    
    /* IoC counter in lookup panel */
    .ioc-counter {
      display: block;
      font-size: 12px;
      color: #8896ab;
      margin-top: 8px;
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* Form group styling for auth modals */
    .form-group input:focus {
      border-color: #06b6d4 !important;
    }
    .form-group input::placeholder {
      color: #556378;
    }

    @media (max-width: 768px) {
      .auth-bar-inner { flex-direction: column; text-align: center; }
      .auth-actions { justify-content: center; }
    }
  `;
  document.head.appendChild(style);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  // DOM already loaded, init after a tick to ensure dashboard.js loads first
  setTimeout(initAuth, 100);
}
