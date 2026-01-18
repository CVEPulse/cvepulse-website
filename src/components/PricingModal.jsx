import React, { useState } from 'react';
import { X, Shield, Target, Lock, Activity, Check, ArrowRight } from 'lucide-react';

const PricingModal = ({ isOpen, onClose }) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    size: '',
    message: ''
  });

  const plans = [
    {
      name: 'Free',
      description: 'Get started with basic intelligence',
      features: [
        { text: 'Live KEV Dashboard', included: true },
        { text: 'EPSS Scores', included: true },
        { text: 'Browser Alerts', included: true },
        { text: '1 CSV Export/day', included: true },
        { text: '3 Watchlist Vendors', included: true },
        { text: 'PDF Reports', included: false },
        { text: 'Slack/Teams Alerts', included: false },
        { text: 'API Access', included: false },
      ],
      cta: 'Current Plan',
      ctaDisabled: true
    },
    {
      name: 'Pro',
      description: 'For security professionals',
      popular: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited Exports', included: true },
        { text: 'PDF Executive Reports', included: true },
        { text: '20 Watchlist Vendors', included: true },
        { text: 'Slack/Teams Alerts', included: true },
        { text: 'Priority Email Digest', included: true },
        { text: 'Email Support', included: true },
        { text: 'API Access', included: false },
      ],
      cta: 'Get Quote'
    },
    {
      name: 'Team',
      description: 'For security teams',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Up to 10 Users', included: true },
        { text: 'Unlimited Watchlist', included: true },
        { text: 'API Access (10K/mo)', included: true },
        { text: 'Custom Alerts', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Onboarding Call', included: true },
        { text: '10% Consultancy Discount', included: true },
      ],
      cta: 'Get Quote'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      features: [
        { text: 'Everything in Team', included: true },
        { text: 'Unlimited Users', included: true },
        { text: 'Unlimited API', included: true },
        { text: 'White-label Reports', included: true },
        { text: 'Custom Integrations', included: true },
        { text: 'Dedicated Support', included: true },
        { text: 'SLA Guarantee', included: true },
        { text: '25% Consultancy Discount', included: true },
      ],
      cta: 'Contact Sales'
    }
  ];

  const services = [
    { icon: Shield, name: 'Vulnerability Assessment', desc: 'Complete infrastructure & application security assessment' },
    { icon: Target, name: 'Zero-Day Response', desc: 'Emergency incident response & mitigation' },
    { icon: Lock, name: 'Threat Intelligence', desc: 'Sector-specific threat reports & dark web monitoring' },
    { icon: Activity, name: 'Application Threat Modeling', desc: 'STRIDE analysis & custom SIEM use cases' },
    { icon: Shield, name: 'SOC Monitoring', desc: '24/7 managed detection & response' },
    { icon: Target, name: 'Fully Managed Security', desc: 'Complete security program with vCISO advisory' },
  ];

  const openQuoteForm = (service) => {
    setSelectedService(service);
    setShowQuoteForm(true);
    setFormSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const leadData = {
      ...formData,
      service: selectedService,
      timestamp: new Date().toISOString()
    };

    // Store locally
    const leads = JSON.parse(localStorage.getItem('cvepulse_leads') || '[]');
    leads.push(leadData);
    localStorage.setItem('cvepulse_leads', JSON.stringify(leads));

    // Try to send to backend
    try {
      await fetch('https://YOUR_FIREBASE_PROJECT.cloudfunctions.net/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
    } catch (e) {
      console.log('Backend not available, lead saved locally');
    }

    setFormSubmitted(true);
    setFormData({ name: '', email: '', company: '', phone: '', size: '', message: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-2xl font-bold text-white">💼 Plans & Services</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showQuoteForm ? (
            <>
              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-xl p-5 transition-all hover:-translate-y-1 ${
                      plan.popular
                        ? 'bg-gradient-to-br from-cyan-500/20 to-slate-800 border-2 border-cyan-500'
                        : 'bg-slate-900 border border-slate-700 hover:border-cyan-500/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-slate-900 text-xs font-bold rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                    
                    <div className="text-2xl font-bold text-cyan-400 mb-4">
                      {plan.name === 'Free' ? '₹0' : 'Contact Us'}
                      {plan.name === 'Free' && <span className="text-sm font-normal text-slate-500">/forever</span>}
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className={feature.included ? 'text-green-400' : 'text-slate-600'}>
                            {feature.included ? '✓' : '✕'}
                          </span>
                          <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => !plan.ctaDisabled && openQuoteForm(plan.name + ' Plan')}
                      disabled={plan.ctaDisabled}
                      className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
                        plan.ctaDisabled
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Consultancy Services */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Professional Security Services
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Beyond the dashboard, CVEPulse offers comprehensive cybersecurity consultancy services.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => openQuoteForm(service.name)}
                      className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-left group"
                    >
                      <service.icon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {service.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{service.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Quote Form */
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setShowQuoteForm(false)}
                className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-1"
              >
                ← Back to Plans
              </button>
              
              <div className="bg-slate-900 rounded-lg p-4 mb-6 text-center">
                <span className="text-slate-400 text-sm">Selected:</span>
                <div className="text-cyan-400 font-bold text-lg">{selectedService}</div>
              </div>

              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="john@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Acme Corp"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Company Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tell us about your needs</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
                      placeholder="Describe your security challenges..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-cyan-500 text-slate-900 rounded-lg font-bold hover:bg-cyan-400 transition-colors"
                  >
                    Request Quote →
                  </button>
                  
                  <p className="text-center text-xs text-slate-500">
                    We'll respond within 24 hours. No spam, ever.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Request Submitted!</h3>
                  <p className="text-slate-400 mb-6">
                    We'll get back to you within 24 hours at the email provided.
                  </p>
                  <button
                    onClick={() => {
                      setShowQuoteForm(false);
                      setFormSubmitted(false);
                    }}
                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
