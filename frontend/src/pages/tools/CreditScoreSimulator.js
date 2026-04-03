import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  ArrowRight, TrendingUp, TrendingDown, Minus, RotateCcw,
  AlertTriangle, CheckCircle2, CreditCard, Clock, Search,
  FileText, Shield, Zap, ChevronRight, Info
} from 'lucide-react';
import useSEO from '../../hooks/useSEO';
import { TrialButton } from '../../components/LeadButtons';

/* ─────────────────────────────────────────
   SCORE MODEL — simplified FICO-like weighting
   ───────────────────────────────────────── */
const SCORE_WEIGHTS = {
  paymentHistory: 0.35,   // 35%
  utilization: 0.30,      // 30%
  creditAge: 0.15,        // 15%
  creditMix: 0.10,        // 10%
  newCredit: 0.10          // 10%
};

function calculateScore(profile) {
  let score = 300;
  // Payment history: 0-100% on-time → 0-250 points
  const onTimeRate = profile.totalAccounts > 0
    ? Math.max(0, (profile.totalAccounts - profile.latePayments) / profile.totalAccounts)
    : 1;
  let paymentPts = onTimeRate * 200;
  // Collections have heavy penalty
  paymentPts -= profile.collections * 40;
  paymentPts = Math.max(0, paymentPts);
  score += paymentPts;

  // Utilization: lower is better (0-10% ideal)
  const util = profile.creditLimit > 0 ? (profile.creditBalance / profile.creditLimit) * 100 : 0;
  let utilPts = 0;
  if (util <= 1) utilPts = 165;
  else if (util <= 10) utilPts = 150;
  else if (util <= 30) utilPts = 120;
  else if (util <= 50) utilPts = 80;
  else if (util <= 75) utilPts = 40;
  else utilPts = 10;
  score += utilPts;

  // Credit age: longer is better
  score += Math.min(profile.avgAccountAge * 8, 82);

  // Credit mix: variety helps
  const mixTypes = [profile.hasMortgage, profile.hasAutoLoan, profile.hasCreditCards, profile.hasStudentLoan].filter(Boolean).length;
  score += mixTypes * 13;

  // New credit: fewer recent inquiries/new accounts = better
  score += Math.max(0, 55 - profile.hardInquiries * 8 - profile.newAccounts * 12);

  // Charge-offs and bankruptcies
  score -= profile.chargeOffs * 50;
  score -= profile.publicRecords * 100;

  return Math.round(Math.min(850, Math.max(300, score)));
}

function getScoreRating(score) {
  if (score >= 800) return { label: 'Exceptional', color: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-500' };
  if (score >= 740) return { label: 'Very Good', color: 'text-green-600', bg: 'bg-green-500', ring: 'ring-green-500' };
  if (score >= 670) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-500', ring: 'ring-blue-500' };
  if (score >= 580) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-500' };
  return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-500' };
}

function getScoreBarPct(score) {
  return Math.round(((score - 300) / 550) * 100);
}

/* ─────────────────────────────────────────
   WHAT-IF SCENARIOS
   ───────────────────────────────────────── */
const SCENARIOS = [
  {
    id: 'removeCollection',
    label: 'Remove a collection account',
    icon: AlertTriangle,
    apply: (p) => ({ ...p, collections: Math.max(0, p.collections - 1) }),
    description: 'Simulates successfully disputing and removing one collection account from your report.',
    category: 'remove'
  },
  {
    id: 'removeLatePayment',
    label: 'Remove a late payment',
    icon: Clock,
    apply: (p) => ({ ...p, latePayments: Math.max(0, p.latePayments - 1) }),
    description: 'Simulates removing one late payment via goodwill letter or dispute.',
    category: 'remove'
  },
  {
    id: 'removeInquiry',
    label: 'Remove a hard inquiry',
    icon: Search,
    apply: (p) => ({ ...p, hardInquiries: Math.max(0, p.hardInquiries - 1) }),
    description: 'Simulates removing one hard inquiry (unauthorized or disputed).',
    category: 'remove'
  },
  {
    id: 'removeChargeOff',
    label: 'Remove a charge-off',
    icon: AlertTriangle,
    apply: (p) => ({ ...p, chargeOffs: Math.max(0, p.chargeOffs - 1) }),
    description: 'Simulates removing a charge-off account from your report.',
    category: 'remove'
  },
  {
    id: 'payDown50',
    label: 'Pay down credit cards to 30% utilization',
    icon: CreditCard,
    apply: (p) => ({ ...p, creditBalance: Math.min(p.creditBalance, p.creditLimit * 0.30) }),
    description: 'Reduces your credit card balance to 30% of your limit — the commonly recommended threshold.',
    category: 'improve'
  },
  {
    id: 'payDown10',
    label: 'Pay down credit cards to 10% utilization',
    icon: CreditCard,
    apply: (p) => ({ ...p, creditBalance: Math.min(p.creditBalance, p.creditLimit * 0.10) }),
    description: 'Reduces your balance to under 10% — the "excellent" utilization zone.',
    category: 'improve'
  },
  {
    id: 'payDownZero',
    label: 'Pay off all credit card debt',
    icon: CreditCard,
    apply: (p) => ({ ...p, creditBalance: 0 }),
    description: 'Simulates paying off your entire credit card balance.',
    category: 'improve'
  },
  {
    id: 'addCreditCard',
    label: 'Open a new credit card ($5,000 limit)',
    icon: CreditCard,
    apply: (p) => ({
      ...p,
      totalAccounts: p.totalAccounts + 1,
      newAccounts: p.newAccounts + 1,
      hardInquiries: p.hardInquiries + 1,
      creditLimit: p.creditLimit + 5000,
      hasCreditCards: true
    }),
    description: 'Opening a new card adds an inquiry short-term but improves utilization and mix long-term.',
    category: 'action'
  },
];

const DEFAULT_PROFILE = {
  totalAccounts: 6,
  latePayments: 2,
  collections: 1,
  chargeOffs: 0,
  publicRecords: 0,
  creditBalance: 4500,
  creditLimit: 12000,
  avgAccountAge: 4,
  hardInquiries: 3,
  newAccounts: 1,
  hasMortgage: false,
  hasAutoLoan: true,
  hasCreditCards: true,
  hasStudentLoan: false,
};

const PROFILE_FIELDS = [
  { name: 'totalAccounts', label: 'Total accounts', min: 0, max: 30, step: 1 },
  { name: 'latePayments', label: 'Late payments', min: 0, max: 20, step: 1 },
  { name: 'collections', label: 'Collection accounts', min: 0, max: 10, step: 1 },
  { name: 'chargeOffs', label: 'Charge-offs', min: 0, max: 10, step: 1 },
  { name: 'publicRecords', label: 'Public records (bankruptcy)', min: 0, max: 3, step: 1 },
  { name: 'creditBalance', label: 'Total credit card balance', min: 0, max: 100000, step: 100, prefix: '$' },
  { name: 'creditLimit', label: 'Total credit limit', min: 500, max: 200000, step: 500, prefix: '$' },
  { name: 'avgAccountAge', label: 'Average account age (years)', min: 0, max: 30, step: 0.5 },
  { name: 'hardInquiries', label: 'Hard inquiries (last 2 years)', min: 0, max: 15, step: 1 },
  { name: 'newAccounts', label: 'New accounts (last year)', min: 0, max: 10, step: 1 },
];

const TOGGLE_FIELDS = [
  { name: 'hasMortgage', label: 'Mortgage' },
  { name: 'hasAutoLoan', label: 'Auto Loan' },
  { name: 'hasCreditCards', label: 'Credit Cards' },
  { name: 'hasStudentLoan', label: 'Student Loans' },
];

/* ─────────────────────────────────────────
   SCORE GAUGE COMPONENT
   ───────────────────────────────────────── */
const ScoreGauge = ({ score, label, size = 'lg' }) => {
  const rating = getScoreRating(score);
  const pct = getScoreBarPct(score);
  const isLg = size === 'lg';

  return (
    <div className="text-center">
      <div className={`relative ${isLg ? 'w-48 h-48' : 'w-32 h-32'} mx-auto`}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke={score >= 740 ? '#22c55e' : score >= 670 ? '#3b82f6' : score >= 580 ? '#f59e0b' : '#ef4444'}
            strokeWidth="10"
            strokeDasharray={`${pct * 3.27} 327`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${isLg ? 'text-4xl' : 'text-2xl'} font-bold ${rating.color}`}>{score}</span>
          <span className={`${isLg ? 'text-xs' : 'text-[10px]'} text-gray-500 font-medium`}>{rating.label}</span>
        </div>
      </div>
      {label && <p className="text-sm text-gray-500 mt-2 font-medium">{label}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────── */
const CreditScoreSimulator = () => {
  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });
  const [activeScenarios, setActiveScenarios] = useState(new Set());
  const [showProfile, setShowProfile] = useState(false);

  useSEO({
    title: 'Credit Score Simulator — What-If Calculator | Credlocity',
    description: 'See how removing collections, paying down balances, or disputing items could affect your credit score. Free interactive credit score simulator.',
  });

  const baseScore = useMemo(() => calculateScore(profile), [profile]);

  const simulatedProfile = useMemo(() => {
    let p = { ...profile };
    for (const scenarioId of activeScenarios) {
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      if (scenario) p = scenario.apply(p);
    }
    return p;
  }, [profile, activeScenarios]);

  const simulatedScore = useMemo(() => calculateScore(simulatedProfile), [simulatedProfile]);
  const scoreDiff = simulatedScore - baseScore;

  const utilization = profile.creditLimit > 0 ? Math.round((profile.creditBalance / profile.creditLimit) * 100) : 0;
  const simUtilization = simulatedProfile.creditLimit > 0 ? Math.round((simulatedProfile.creditBalance / simulatedProfile.creditLimit) * 100) : 0;

  const toggleScenario = (id) => {
    setActiveScenarios(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetAll = () => {
    setActiveScenarios(new Set());
    setProfile({ ...DEFAULT_PROFILE });
  };

  const updateField = (name, value) => {
    setProfile(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Credit Score Simulator — What-If Calculator | Credlocity</title>
        <meta name="description" content="Free credit score simulator. See how removing collections, late payments, or paying down credit cards could change your FICO score." />
        <link rel="canonical" href="https://credlocity.com/tools/credit-score-simulator" />
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section className="bg-primary-blue text-white py-16" data-testid="hero-section">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-5">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Interactive What-If Simulator</span>
          </div>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold mb-4" data-testid="page-title">
            Credit Score Simulator
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto">
            Enter your credit profile, then toggle scenarios to see how disputing items, 
            paying down debt, or opening new accounts could affect your score.
          </p>
        </div>
      </section>

      {/* ═══ MAIN SIMULATOR ═══ */}
      <section className="py-12 bg-gray-50" data-testid="simulator-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT: Score Display */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Score Comparison Card */}
                <Card className="border-0 shadow-lg overflow-hidden" data-testid="score-card">
                  <CardContent className="p-0">
                    <div className="bg-white p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">Your Score</h2>
                        <button onClick={resetAll} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1" data-testid="reset-btn">
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>

                      {activeScenarios.size === 0 ? (
                        <ScoreGauge score={baseScore} label="Current Estimate" />
                      ) : (
                        <div className="flex items-center justify-center gap-6">
                          <ScoreGauge score={baseScore} label="Current" size="sm" />
                          <div className="flex flex-col items-center">
                            <ArrowRight className="w-5 h-5 text-gray-300" />
                          </div>
                          <ScoreGauge score={simulatedScore} label="After Changes" size="sm" />
                        </div>
                      )}

                      {scoreDiff !== 0 && (
                        <div className={`mt-4 p-3 rounded-xl text-center ${scoreDiff > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`} data-testid="score-diff">
                          <div className="flex items-center justify-center gap-2">
                            {scoreDiff > 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
                            <span className={`text-2xl font-bold ${scoreDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scoreDiff > 0 ? '+' : ''}{scoreDiff} points
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Estimated change with {activeScenarios.size} scenario{activeScenarios.size !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-50 p-4 border-t grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Utilization</p>
                        <p className={`text-sm font-bold ${utilization <= 30 ? 'text-green-600' : utilization <= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {utilization}%{activeScenarios.size > 0 && simUtilization !== utilization && <span className="text-xs text-gray-400 font-normal"> → {simUtilization}%</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Collections</p>
                        <p className="text-sm font-bold text-gray-900">
                          {profile.collections}{activeScenarios.size > 0 && simulatedProfile.collections !== profile.collections && <span className="text-xs text-green-600 font-normal"> → {simulatedProfile.collections}</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Late Payments</p>
                        <p className="text-sm font-bold text-gray-900">
                          {profile.latePayments}{activeScenarios.size > 0 && simulatedProfile.latePayments !== profile.latePayments && <span className="text-xs text-green-600 font-normal"> → {simulatedProfile.latePayments}</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Inquiries</p>
                        <p className="text-sm font-bold text-gray-900">
                          {profile.hardInquiries}{activeScenarios.size > 0 && simulatedProfile.hardInquiries !== profile.hardInquiries && <span className="text-xs text-green-600 font-normal"> → {simulatedProfile.hardInquiries}</span>}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                {activeScenarios.size > 0 && scoreDiff > 0 && (
                  <Card className="border-0 shadow-md bg-primary-blue text-white" data-testid="cta-card">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2">Want these results for real?</h3>
                      <p className="text-blue-200 text-sm mb-4">Our credit specialists can help you dispute items and implement these changes.</p>
                      <TrialButton className="w-full bg-secondary-green hover:bg-secondary-light text-white" data-testid="cta-trial">
                        Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                      </TrialButton>
                      <Button className="w-full mt-2 bg-white/15 hover:bg-white/25 text-white border border-white/30" asChild>
                        <Link to="/free-credit-report-review" data-testid="cta-review">
                          Get Free Credit Review
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* RIGHT: Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Editor Toggle */}
              <Card className="border-0 shadow-md" data-testid="profile-section">
                <CardContent className="p-0">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
                    data-testid="toggle-profile"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary-blue" />
                      </div>
                      <div className="text-left">
                        <h2 className="font-bold text-gray-900">Your Credit Profile</h2>
                        <p className="text-sm text-gray-500">Adjust to match your real credit situation</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showProfile ? 'rotate-90' : ''}`} />
                  </button>

                  {showProfile && (
                    <div className="border-t p-5 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {PROFILE_FIELDS.map(field => (
                          <div key={field.name}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={profile[field.name]}
                                onChange={(e) => updateField(field.name, e.target.value)}
                                className="flex-1 accent-primary-blue"
                                data-testid={`slider-${field.name}`}
                              />
                              <span className="text-sm font-mono font-bold text-gray-800 w-16 text-right" data-testid={`value-${field.name}`}>
                                {field.prefix || ''}{typeof profile[field.name] === 'number' && profile[field.name] >= 1000 ? profile[field.name].toLocaleString() : profile[field.name]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Account Types (Credit Mix)</label>
                        <div className="flex flex-wrap gap-2">
                          {TOGGLE_FIELDS.map(field => (
                            <button
                              key={field.name}
                              onClick={() => setProfile(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${profile[field.name] ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              data-testid={`toggle-${field.name}`}
                            >
                              {profile[field.name] ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Minus className="w-3 h-3 inline mr-1" />}
                              {field.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What-If Scenarios */}
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-1">What-If Scenarios</h2>
                <p className="text-sm text-gray-500 mb-5">Toggle scenarios to see how each action could change your score.</p>

                {/* Dispute & Remove */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Dispute & Remove Items</h3>
                  <div className="space-y-2">
                    {SCENARIOS.filter(s => s.category === 'remove').map(scenario => {
                      const isActive = activeScenarios.has(scenario.id);
                      const isDisabled = !isActive && (
                        (scenario.id === 'removeCollection' && profile.collections === 0) ||
                        (scenario.id === 'removeLatePayment' && profile.latePayments === 0) ||
                        (scenario.id === 'removeInquiry' && profile.hardInquiries === 0) ||
                        (scenario.id === 'removeChargeOff' && profile.chargeOffs === 0)
                      );
                      // Calculate individual impact
                      let singleProfile = scenario.apply({ ...profile });
                      const impact = calculateScore(singleProfile) - baseScore;

                      return (
                        <button
                          key={scenario.id}
                          onClick={() => !isDisabled && toggleScenario(scenario.id)}
                          disabled={isDisabled}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition text-left ${
                            isActive ? 'bg-green-50 border-green-300 ring-1 ring-green-300' : isDisabled ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                          data-testid={`scenario-${scenario.id}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-100'}`}>
                            <scenario.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${isActive ? 'text-green-800' : 'text-gray-900'}`}>{scenario.label}</p>
                            <p className="text-xs text-gray-500 truncate">{scenario.description}</p>
                          </div>
                          {!isDisabled && (
                            <span className={`text-sm font-bold flex-shrink-0 ${impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {impact > 0 ? '+' : ''}{impact} pts
                            </span>
                          )}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pay Down Debt */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Pay Down Debt</h3>
                  <div className="space-y-2">
                    {SCENARIOS.filter(s => s.category === 'improve').map(scenario => {
                      const isActive = activeScenarios.has(scenario.id);
                      let singleProfile = scenario.apply({ ...profile });
                      const impact = calculateScore(singleProfile) - baseScore;

                      return (
                        <button
                          key={scenario.id}
                          onClick={() => toggleScenario(scenario.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition text-left ${
                            isActive ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                          data-testid={`scenario-${scenario.id}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
                            <scenario.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${isActive ? 'text-blue-800' : 'text-gray-900'}`}>{scenario.label}</p>
                            <p className="text-xs text-gray-500 truncate">{scenario.description}</p>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {impact > 0 ? '+' : ''}{impact} pts
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            {isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Other Actions */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Other Actions</h3>
                  <div className="space-y-2">
                    {SCENARIOS.filter(s => s.category === 'action').map(scenario => {
                      const isActive = activeScenarios.has(scenario.id);
                      let singleProfile = scenario.apply({ ...profile });
                      const impact = calculateScore(singleProfile) - baseScore;

                      return (
                        <button
                          key={scenario.id}
                          onClick={() => toggleScenario(scenario.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition text-left ${
                            isActive ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-300' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                          data-testid={`scenario-${scenario.id}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-purple-500' : 'bg-gray-100'}`}>
                            <scenario.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${isActive ? 'text-purple-800' : 'text-gray-900'}`}>{scenario.label}</p>
                            <p className="text-xs text-gray-500 truncate">{scenario.description}</p>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {impact > 0 ? '+' : ''}{impact} pts
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
                            {isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm" data-testid="disclaimer">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 leading-relaxed">
                  This simulator provides <strong>estimates only</strong> based on simplified FICO scoring factors. 
                  Actual credit scores depend on many additional variables. For an accurate assessment of your credit 
                  and a personalized action plan, <Link to="/free-credit-report-review" className="underline font-medium">get a free credit report review</Link> from our specialists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW SCORES WORK ═══ */}
      <section className="py-16 bg-white" data-testid="how-scores-work">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">How Credit Scores Are Calculated</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { factor: 'Payment History', pct: '35%', desc: 'On-time payments, late payments, collections, charge-offs', color: 'bg-blue-500' },
              { factor: 'Amounts Owed', pct: '30%', desc: 'Credit utilization ratio — how much of your available credit you use', color: 'bg-green-500' },
              { factor: 'Length of History', pct: '15%', desc: 'Average age of your accounts, oldest account age', color: 'bg-purple-500' },
              { factor: 'Credit Mix', pct: '10%', desc: 'Variety of account types — mortgage, auto, credit cards, student loans', color: 'bg-amber-500' },
              { factor: 'New Credit', pct: '10%', desc: 'Hard inquiries and recently opened accounts', color: 'bg-red-500' },
            ].map((item, i) => (
              <Card key={i} className="border border-gray-200 hover:shadow-md transition-shadow" data-testid={`factor-${i}`}>
                <CardContent className="p-5 text-center">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-sm">{item.pct}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.factor}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCORE RANGES ═══ */}
      <section className="py-16 bg-gray-50" data-testid="score-ranges">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Credit Score Ranges</h2>
          <div className="space-y-3">
            {[
              { range: '800 – 850', label: 'Exceptional', color: 'bg-emerald-500', desc: 'Best rates, instant approvals, premium credit cards' },
              { range: '740 – 799', label: 'Very Good', color: 'bg-green-500', desc: 'Excellent rates, easy approval for most products' },
              { range: '670 – 739', label: 'Good', color: 'bg-blue-500', desc: 'Competitive rates, approved for most loans' },
              { range: '580 – 669', label: 'Fair', color: 'bg-amber-500', desc: 'Higher rates, may need secured cards or co-signer' },
              { range: '300 – 579', label: 'Poor', color: 'bg-red-500', desc: 'Difficulty getting approved, highest interest rates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200" data-testid={`range-${i}`}>
                <div className={`w-3 h-12 ${item.color} rounded-full flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{item.range}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 bg-primary-blue text-white" data-testid="final-cta">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-cinzel text-3xl font-bold mb-4">Ready to Improve Your Real Score?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Simulating is the first step. Let our credit specialists review your actual report and 
            build a personalized plan to get your score where it needs to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10 py-6" asChild>
              <Link to="/free-credit-report-review" data-testid="final-cta-review">
                Get Free Credit Review <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <TrialButton size="lg" className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-lg px-10 py-6" data-testid="final-cta-trial">
              Start Free Trial
            </TrialButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreditScoreSimulator;
