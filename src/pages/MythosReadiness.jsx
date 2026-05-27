import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Mythos Readiness Index — 12-question A–F assessment
 *
 * 4 pillars × 3 questions = 12 questions total
 * Each answer scored 0-3 (poor → excellent)
 * Pillar score = sum of 3 questions / 9 (normalized 0-1)
 * Total score = weighted average across pillars
 * Grade: 90+ A, 80+ B, 70+ C, 60+ D, <60 F
 */

const PILLARS = [
  {
    id: 'sla',
    name: 'SLA Compression',
    icon: '⏱',
    desc: 'Whether your patch windows are tight enough for AI-speed exploitation.',
    questions: [
      {
        id: 'sla_critical',
        text: 'What is your current SLA for critical, internet-facing CVEs (CVSS 9.0+ or KEV-listed)?',
        options: [
          { label: '24 hours or less', score: 3 },
          { label: '1–7 days', score: 2 },
          { label: '8–30 days', score: 1 },
          { label: 'No firm SLA / >30 days', score: 0 },
        ],
      },
      {
        id: 'sla_actual',
        text: 'How does your actual MTTR compare to your stated SLA for criticals?',
        options: [
          { label: 'Consistently meets or beats SLA', score: 3 },
          { label: 'Mostly within SLA, occasional misses', score: 2 },
          { label: 'Frequent misses, regular escalations', score: 1 },
          { label: "Don't measure / chronic backlog", score: 0 },
        ],
      },
      {
        id: 'sla_emergency',
        text: 'Do you have an emergency patch protocol for KEV/zero-day events?',
        options: [
          { label: 'Yes — tested in last 90 days', score: 3 },
          { label: 'Yes — documented, untested', score: 2 },
          { label: 'Informal process exists', score: 1 },
          { label: 'No defined emergency protocol', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'edge',
    name: 'Edge Exposure',
    icon: '🌐',
    desc: 'Whether you prioritise internet-facing assets first.',
    questions: [
      {
        id: 'edge_easm',
        text: 'How well do you map your external attack surface?',
        options: [
          { label: 'Continuous EASM with full asset coverage', score: 3 },
          { label: 'Periodic external scans, mostly complete', score: 2 },
          { label: 'Manual inventory, known gaps', score: 1 },
          { label: 'No formal external surface mapping', score: 0 },
        ],
      },
      {
        id: 'edge_priority',
        text: 'Are internet-facing CVEs prioritised separately from internal ones?',
        options: [
          { label: 'Yes — exposure-weighted scoring across the board', score: 3 },
          { label: 'Yes — separate SLA for edge assets', score: 2 },
          { label: 'Informally, in some teams', score: 1 },
          { label: 'No — flat prioritisation by CVSS only', score: 0 },
        ],
      },
      {
        id: 'edge_unmanaged',
        text: 'How quickly are unmanaged or shadow internet-facing assets detected and remediated?',
        options: [
          { label: 'Within hours of appearance', score: 3 },
          { label: 'Within days', score: 2 },
          { label: 'Within weeks', score: 1 },
          { label: 'Often discovered only after incident', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'detection',
    name: 'Detection Coverage',
    icon: '🛰',
    desc: 'Whether you can detect exploitation of unpatched hosts.',
    questions: [
      {
        id: 'detection_edr',
        text: 'EDR/XDR coverage across your asset estate?',
        options: [
          { label: '95%+ coverage with active monitoring', score: 3 },
          { label: '70–95% coverage, monitored', score: 2 },
          { label: '<70% coverage or partial monitoring', score: 1 },
          { label: 'No EDR or fragmented deployment', score: 0 },
        ],
      },
      {
        id: 'detection_exploit',
        text: 'Do you have detections for exploitation attempts on known-unpatched hosts?',
        options: [
          { label: 'Yes — exploit-class detections tied to VM data', score: 3 },
          { label: 'Yes — generic exploit attempt rules', score: 2 },
          { label: 'Some IDS/IPS rules, no VM correlation', score: 1 },
          { label: 'No exploitation-specific detection', score: 0 },
        ],
      },
      {
        id: 'detection_response',
        text: 'When a critical CVE is disclosed, how quickly can you isolate vulnerable hosts that cannot be patched immediately?',
        options: [
          { label: 'Automated containment within hours', score: 3 },
          { label: 'Manual isolation in 4–24 hours', score: 2 },
          { label: '1–3 days, requires multiple teams', score: 1 },
          { label: 'No defined containment workflow', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'ai',
    name: 'AI Triage Adoption',
    icon: '🤖',
    desc: 'Whether you are using AI to fight AI.',
    questions: [
      {
        id: 'ai_prioritization',
        text: 'How do you prioritise across a large vulnerability backlog?',
        options: [
          { label: 'AI/ML-driven scoring (EPSS, exposure, AI affinity)', score: 3 },
          { label: 'Composite scoring (KEV, EPSS, CVSS combined)', score: 2 },
          { label: 'Mostly CVSS-based with manual tuning', score: 1 },
          { label: 'Pure CVSS sort, no other signals', score: 0 },
        ],
      },
      {
        id: 'ai_analysis',
        text: 'Are you using LLMs or AI agents for triage, root-cause analysis, or patch research?',
        options: [
          { label: 'Yes — integrated into VM workflow', score: 3 },
          { label: 'Yes — used by analysts ad-hoc', score: 2 },
          { label: 'Piloting / evaluating', score: 1 },
          { label: 'No — manual triage only', score: 0 },
        ],
      },
      {
        id: 'ai_threat_model',
        text: 'Has your team formally updated its threat model to include autonomous AI exploitation (Mythos-class)?',
        options: [
          { label: 'Yes — AI-era threat model in production', score: 3 },
          { label: 'Yes — discussed and partially adopted', score: 2 },
          { label: 'Aware but not formally addressed', score: 1 },
          { label: 'Not yet considered', score: 0 },
        ],
      },
    ],
  },
];

const TOTAL_QUESTIONS = 12;

export default function MythosReadiness() {
  const [step, setStep] = useState('intro'); // intro | questions | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const flatQuestions = useMemo(() => {
    return PILLARS.flatMap(p => p.questions.map(q => ({ ...q, pillarId: p.id, pillarName: p.name })));
  }, []);

  const progress = ((currentQ) / TOTAL_QUESTIONS) * 100;

  const handleAnswer = (qId, score) => {
    const newAnswers = { ...answers, [qId]: score };
    setAnswers(newAnswers);
    if (currentQ < TOTAL_QUESTIONS - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 200);
    } else {
      setTimeout(() => setStep('result'), 200);
    }
  };

  const result = useMemo(() => {
    if (step !== 'result') return null;
    const pillarScores = PILLARS.map(p => {
      const sum = p.questions.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
      const max = p.questions.length * 3;
      return { id: p.id, name: p.name, icon: p.icon, score: Math.round((sum / max) * 100), raw: sum, max };
    });
    const total = Math.round(pillarScores.reduce((acc, p) => acc + p.score, 0) / pillarScores.length);
    const grade = total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';
    const gradeColor = total >= 80 ? 'text-green-400' : total >= 70 ? 'text-amber-400' : 'text-red-400';
    return { total, grade, gradeColor, pillarScores };
  }, [step, answers]);

  const restart = () => {
    setAnswers({});
    setCurrentQ(0);
    setStep('intro');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {step === 'intro' && <Intro onStart={() => setStep('questions')} />}
        {step === 'questions' && (
          <Questions
            question={flatQuestions[currentQ]}
            current={currentQ}
            total={TOTAL_QUESTIONS}
            progress={progress}
            selected={answers[flatQuestions[currentQ].id]}
            onAnswer={handleAnswer}
            onBack={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
          />
        )}
        {step === 'result' && result && <Result result={result} answers={answers} onRestart={restart} />}
      </div>
    </div>
  );
}

/* ── INTRO ── */
function Intro({ onStart }) {
  return (
    <div className="slide-in">
      <Link to="/mythos-defense" className="font-mono text-xs text-slate-500 hover:text-cyan-400 transition">
        ← Mythos Defense
      </Link>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-cyan-400/30 rounded-full text-xs font-mono text-cyan-300 mt-6 mb-6 bg-cyan-400/5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
        Free Assessment · No account required
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
        Mythos Readiness <span className="grad-text">Index.</span>
      </h1>
      <p className="text-lg text-slate-300 leading-relaxed mb-8">
        12 questions. 5 minutes. An A-through-F grade across the four pillars that determine
        whether your VM programme can survive contact with Mythos-class autonomous AI.
      </p>

      <div className="card-grad border border-slate-700/30 rounded-2xl p-6 mb-8">
        <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 font-semibold">// What you'll be assessed on</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {PILLARS.map(p => (
            <div key={p.id} className="flex gap-3 items-start">
              <span className="text-xl shrink-0">{p.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm mb-0.5">{p.name}</div>
                <div className="text-xs text-slate-400 leading-snug">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onStart}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-4 rounded-lg font-semibold text-base transition shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_8px_24px_rgba(34,211,238,0.15)]">
        Begin Assessment →
      </button>

      <div className="flex flex-wrap gap-5 text-xs font-mono text-slate-400 mt-5 justify-center">
        <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">✓</span> 5 min · 12 questions</span>
        <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">✓</span> No login required</span>
        <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">✓</span> A–F grade + recommendations</span>
      </div>
    </div>
  );
}

/* ── QUESTIONS ── */
function Questions({ question, current, total, progress, selected, onAnswer, onBack }) {
  return (
    <div>
      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2 text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider">{question.pillarName}</span>
          <span className="text-cyan-400 font-semibold">Question {current + 1} / {total}</span>
        </div>
        <div className="h-1 bg-slate-700/40 rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded transition-all duration-500"
               style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div key={question.id} className="slide-in">
        <h2 className="text-2xl md:text-3xl font-semibold text-white leading-snug mb-8 tracking-tight">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const isSelected = selected === opt.score;
            return (
              <button key={i} onClick={() => onAnswer(question.id, opt.score)}
                      className={`w-full text-left card-grad rounded-xl px-5 py-4 transition-all border group ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400/8'
                          : 'border-slate-700/30 hover:border-cyan-400/30 hover:bg-cyan-400/3'
                      }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-7 h-7 rounded-md border-2 shrink-0 flex items-center justify-center transition ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400 text-slate-900'
                      : 'border-slate-600 text-slate-500 group-hover:border-cyan-400/50'
                  }`}>
                    <span className="font-mono text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                  </div>
                  <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {current > 0 && (
          <button onClick={onBack}
                  className="mt-6 text-sm text-slate-400 hover:text-cyan-400 transition font-medium">
            ← Previous question
          </button>
        )}
      </div>
    </div>
  );
}

/* ── RESULT ── */
function Result({ result, answers, onRestart }) {
  const recommendations = generateRecommendations(result.pillarScores);
  const shareUrl = `https://cvepulse.com/mythos-readiness?grade=${result.grade}&score=${result.total}`;
  const shareText = `My VM programme scored ${result.grade} (${result.total}/100) on the Mythos Readiness Index. How does yours stack up against autonomous AI exploitation? @CVEPulse`;

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  const copyResult = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    alert('Copied to clipboard');
  };

  return (
    <div className="slide-in">
      <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-3 font-semibold text-center">
        // Mythos Readiness Index · Your result
      </div>

      {/* Big grade card */}
      <div className="card-grad border border-cyan-400/30 rounded-2xl p-10 text-center mb-8 relative overflow-hidden"
           style={{ boxShadow: '0 0 80px rgba(34,211,238,0.12)' }}>
        <div className={`text-9xl font-bold tracking-tight leading-none mb-3 ${result.gradeColor}`}>
          {result.grade}
        </div>
        <div className="text-2xl font-semibold text-white mb-1">{result.total} / 100</div>
        <div className="text-slate-400 text-sm">Mythos Readiness Score</div>

        <div className="mt-6 pt-6 border-t border-slate-700/30 max-w-md mx-auto">
          <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">// Verdict</div>
          <div className={`text-lg font-semibold ${result.gradeColor}`}>
            {getVerdict(result.total)}
          </div>
        </div>
      </div>

      {/* Pillar breakdown */}
      <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 font-semibold">// Pillar breakdown</h3>
      <div className="space-y-3 mb-10">
        {result.pillarScores.map(p => {
          const tone = p.score >= 80 ? 'green' : p.score >= 60 ? 'amber' : 'red';
          const fillClass = tone === 'green' ? 'from-green-500 to-green-400'
            : tone === 'amber' ? 'from-amber-500 to-amber-400'
            : 'from-red-500 to-red-400';
          const textClass = tone === 'green' ? 'text-green-400' : tone === 'amber' ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={p.id} className="card-grad border border-slate-700/30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-semibold text-white">{p.name}</span>
                </div>
                <span className={`font-mono font-bold text-lg ${textClass}`}>{p.score}/100</span>
              </div>
              <div className="h-1.5 bg-slate-700/40 rounded overflow-hidden">
                <div className={`h-full rounded bg-gradient-to-r ${fillClass} transition-all duration-700`}
                     style={{ width: `${p.score}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-4 font-semibold">// Personalised recommendations</h3>
      <div className="space-y-3 mb-10">
        {recommendations.map((r, i) => (
          <div key={i} className="card-grad border border-slate-700/30 rounded-xl p-5">
            <div className="flex gap-3 items-start">
              <span className="font-mono text-xs text-cyan-400 font-bold pt-1">{String(i + 1).padStart(2, '0')}.</span>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{r.title}</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{r.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="card-grad border border-slate-700/30 rounded-xl p-6 mb-6">
        <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-3 font-semibold">// Share your result</h3>
        <p className="text-sm text-slate-400 mb-4">Make your CISO see it. Make your peers run it.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={shareLinkedIn} className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
            Share on LinkedIn
          </button>
          <button onClick={shareTwitter} className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
            Share on X
          </button>
          <button onClick={copyResult} className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
            Copy link
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100/5 hover:bg-cyan-400/10 border border-slate-700/40 hover:border-cyan-400/30 rounded-lg text-sm font-medium text-white transition">
            Print / save as PDF
          </button>
        </div>
      </div>

      {/* Conversion CTA */}
      <div className="rounded-2xl border border-cyan-400/30 p-8 text-center"
           style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.08),rgba(15,23,42,0.6))' }}>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          Ready to score your <span className="text-cyan-400">actual backlog?</span>
        </h3>
        <p className="text-slate-400 mb-5 max-w-2xl mx-auto">
          The Readiness Index measures your programme. Mythos Lens measures your CVEs —
          uploads from Qualys, Tenable, or Rapid7, scored with the full MWS engine.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/mythos-lens" className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-5 py-2.5 rounded-lg font-semibold text-sm transition">
            Try Mythos Lens →
          </Link>
          <button onClick={onRestart} className="border border-slate-100/20 hover:border-cyan-400/30 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition">
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

function getVerdict(score) {
  if (score >= 90) return 'Mythos-ready. Lead the field.';
  if (score >= 80) return 'Strong posture. Close the remaining gaps.';
  if (score >= 70) return 'Solid foundation. Significant gaps remain.';
  if (score >= 60) return 'Material exposure. Mythos era requires action.';
  return 'Critical gaps. Treat as urgent priority.';
}

function generateRecommendations(pillarScores) {
  const recs = [];
  // Sort weakest first
  const weak = [...pillarScores].sort((a, b) => a.score - b.score);

  weak.forEach(p => {
    if (p.score >= 80) return; // skip strong pillars
    if (p.id === 'sla' && p.score < 80) {
      recs.push({
        title: 'Compress your critical SLA to ≤7 days for internet-facing assets',
        body: 'Mythos can weaponise a CVE within hours of disclosure. A 30-day SLA cedes too much exposure window. Start by separating internet-facing CVEs into a faster lane — many programmes find a 72-hour SLA achievable for KEV-listed externals.',
      });
    }
    if (p.id === 'edge' && p.score < 80) {
      recs.push({
        title: 'Stand up continuous EASM with exposure-weighted prioritisation',
        body: 'Mythos targets the edge first because the attack chain is shorter. If you cannot enumerate every internet-facing asset on demand, you cannot prioritise them. Qualys EASM, Censys, or Shodan Monitor are the standard options.',
      });
    }
    if (p.id === 'detection' && p.score < 80) {
      recs.push({
        title: 'Build exploit-class detections tied to your VM data',
        body: 'When patching cannot keep pace, detection is the second line. Correlate EDR exploit attempts against your unpatched-host inventory — even a 4-hour containment window beats 30-day patch SLA in the AI exploit era.',
      });
    }
    if (p.id === 'ai' && p.score < 80) {
      recs.push({
        title: 'Adopt AI-driven prioritisation now — start with EPSS and KEV',
        body: 'CVSS-only sorting is no longer viable at AI exploitation speeds. Move to composite scoring (EPSS + KEV + exposure + PoC) and pilot LLM-assisted triage. Mythos Lens applies a six-signal MWS model your team can adopt directly.',
      });
    }
  });

  if (recs.length === 0) {
    recs.push({
      title: 'Maintain your edge with continuous Mythos-class threat modelling',
      body: 'Your programme is in the top tier. Keep the lead by formalising AI-era threat modelling reviews quarterly, contributing to the EPSS feedback loop, and benchmarking against the Mythos Lens scoring engine for emerging signals.',
    });
  }

  return recs.slice(0, 4);
}
