import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, CreditCard, TrendingUp, BookOpen, ChevronDown, ChevronRight, X, Star, Check, ArrowRight, BarChart3, Users, Award, Building2, Sliders, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useInView } from '../../hooks/useInView';
import { useCountUp } from '../../hooks/useCountUp';
import { toast } from 'sonner';
import api from '../../utils/api';

/* ═══════════════════════════════════════════
   CSS-IN-JS STYLES (keyframes + animations)
   ═══════════════════════════════════════════ */
const injectStyles = () => {
  if (document.getElementById('cb-animations')) return;
  const style = document.createElement('style');
  style.id = 'cb-animations';
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {
      @keyframes cb-fadeSlideUp {
        from { opacity: 0; transform: translateY(32px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes cb-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes cb-float2 {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes cb-float3 {
        0%, 100% { transform: translateY(-4px); }
        50% { transform: translateY(6px); }
      }
      @keyframes cb-pulse-badge {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
      }
      @keyframes cb-ticker {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes cb-slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes cb-progress {
        from { width: 0%; }
        to { width: 100%; }
      }
      .cb-hero-h1 { animation: cb-fadeSlideUp 0.8s ease-out both; }
      .cb-hero-sub { animation: cb-fadeSlideUp 0.8s ease-out 0.15s both; }
      .cb-hero-cta { animation: cb-fadeSlideUp 0.8s ease-out 0.3s both; }
      .cb-hero-badges { animation: cb-fadeSlideUp 0.8s ease-out 0.45s both; }
      .cb-hero-score { animation: cb-fadeSlideUp 0.8s ease-out 0.55s both; }
      .cb-float-1 { animation: cb-float 4s ease-in-out infinite; }
      .cb-float-2 { animation: cb-float2 5s ease-in-out 0.7s infinite; }
      .cb-float-3 { animation: cb-float3 4.5s ease-in-out 1.4s infinite; }
      .cb-float-4 { animation: cb-float 5.5s ease-in-out 2.1s infinite; }
      .cb-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
      .cb-reveal.cb-visible { opacity: 1; transform: translateY(0); }
      .cb-pulse { animation: cb-pulse-badge 2s ease-in-out infinite; }
      .cb-ticker-track { animation: cb-ticker 30s linear infinite; }
      .cb-ticker-track:hover { animation-play-state: paused; }
      .cb-sticky-enter { animation: cb-slideUp 0.4s ease-out both; }
      .cb-progress-bar { animation: cb-progress 4s linear; }
      .cb-plan-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      .cb-plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
      .cb-product-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
      .cb-product-card:hover { transform: translateY(-4px); box-shadow: 0 0 24px rgba(59,130,246,0.25); border-color: #3b82f6; }
      .cb-faq-arrow { transition: transform 0.3s ease; }
      .cb-faq-arrow.cb-open { transform: rotate(180deg); }
      .cb-faq-body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.3s ease; }
      .cb-faq-body.cb-expanded { max-height: 600px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .cb-reveal { opacity: 1; transform: none; }
      .cb-hero-h1, .cb-hero-sub, .cb-hero-cta, .cb-hero-badges, .cb-hero-score { animation: none; opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

/* ═══════════════════════════════════════════
   SECTION REVEAL WRAPPER
   ═══════════════════════════════════════════ */
const RevealSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.unobserve(el); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} className={`cb-reveal ${visible ? 'cb-visible' : ''} ${className}`}>{children}</div>;
};

/* ═══════════════════════════════════════════
   ANIMATED CREDIT SCORE
   ═══════════════════════════════════════════ */
const AnimatedScore = () => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const score = useCountUp(720, 2500, inView);
  const startScore = 520;
  const display = inView ? Math.max(startScore, startScore + Math.round((score / 720) * (720 - startScore))) : startScore;
  const pct = ((display - 300) / 550) * 100;
  const color = display < 580 ? '#ef4444' : display < 670 ? '#f59e0b' : display < 740 ? '#22c55e' : '#16a34a';
  return (
    <div ref={ref} className="cb-hero-score inline-flex flex-col items-center" data-testid="credit-score-counter">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${pct * 3.27} 327`} strokeLinecap="round" className="transition-all duration-300" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums">{display}</span>
          <span className="text-xs text-slate-400 mt-1 tracking-wider uppercase">FICO Score</span>
        </div>
      </div>
      <p className="text-sm text-cyan-300 mt-3 font-medium">Average client improvement</p>
    </div>
  );
};

/* ═══════════════════════════════════════════
   STAT COUNTER
   ═══════════════════════════════════════════ */
const StatCounter = ({ end, suffix = '', prefix = '', label }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const count = useCountUp(end, 2000, inView);
  return (
    <div ref={ref} className="text-center px-4 py-6" data-testid={`stat-${label.replace(/\s/g, '-').toLowerCase()}`}>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums">
        {prefix}{typeof end === 'number' ? (end >= 1000 ? `${Math.floor(count / 1000)},${String(count % 1000).padStart(3, '0')}` : count) : end}{suffix}
      </div>
      <p className="text-slate-300 text-sm mt-2 tracking-wide">{label}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════
   CREDIT SCORE SIMULATOR
   ═══════════════════════════════════════════ */
const SCORE_IMPACT = {
  starter:  [0, 18, 34, 48, 60, 71, 80, 88, 95, 101, 106, 110],
  standard: [0, 24, 45, 63, 79, 93, 105, 115, 124, 131, 137, 142],
  premium:  [0, 30, 56, 78, 97, 113, 127, 139, 149, 157, 164, 170],
  elite:    [0, 36, 67, 93, 115, 134, 150, 164, 175, 185, 193, 200],
};

const CreditScoreSimulator = () => {
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [months, setMonths] = useState(6);
  const [startScore, setStartScore] = useState(520);

  const impact = SCORE_IMPACT[selectedPlan][months - 1] || 0;
  const projectedScore = Math.min(startScore + impact, 850);
  const scorePct = ((projectedScore - 300) / 550) * 100;
  const startPct = ((startScore - 300) / 550) * 100;
  const color = projectedScore < 580 ? '#ef4444' : projectedScore < 670 ? '#f59e0b' : projectedScore < 740 ? '#22c55e' : '#16a34a';
  const plan = PLANS.find(p => p.key === selectedPlan);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto" data-testid="credit-score-simulator">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
          <Sliders className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Credit Score Simulator</h3>
          <p className="text-sm text-slate-400">See your projected improvement with on-time payments</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Current Score Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Current Credit Score</label>
            <div className="flex items-center gap-4">
              <input
                type="range" min={300} max={750} value={startScore}
                onChange={e => setStartScore(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400"
                data-testid="sim-score-slider"
              />
              <span className="text-xl font-bold text-white tabular-nums w-12 text-right" data-testid="sim-current-score">{startScore}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1"><span>300</span><span>750</span></div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Select Your Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {PLANS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlan(p.key)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedPlan === p.key ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  data-testid={`sim-plan-${p.key}`}
                >
                  {p.label} ({p.limit})
                </button>
              ))}
            </div>
          </div>

          {/* Month Slider */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Months of On-Time Payments</label>
            <div className="flex items-center gap-4">
              <input
                type="range" min={1} max={12} value={months}
                onChange={e => setMonths(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400"
                data-testid="sim-months-slider"
              />
              <span className="text-xl font-bold text-white tabular-nums w-12 text-right" data-testid="sim-months-value">{months} mo</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1"><span>1 month</span><span>12 months</span></div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
              {/* Start score arc (dimmed) */}
              <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="8" strokeDasharray={`${startPct * 3.27} 327`} strokeLinecap="round" />
              {/* Projected score arc */}
              <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${scorePct * 3.27} 327`} strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums" data-testid="sim-projected-score">{projectedScore}</span>
              <span className="text-xs text-slate-400 mt-1 tracking-wider uppercase">Projected</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">
              +{impact} <span className="text-sm text-slate-400 font-normal">point improvement</span>
            </p>
            <p className="text-sm text-slate-500">with {plan?.label} plan over {months} month{months > 1 ? 's' : ''}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">{startScore} <ArrowRight className="w-3 h-3 inline" /> {projectedScore}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-4 text-center max-w-xs">*Projections based on average client results with consistent on-time payments. Individual results may vary based on your complete credit profile.</p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PLANS DATA
   ═══════════════════════════════════════════ */
const PLANS = [
  { key: 'starter', label: 'Starter', limit: '$750', limitNum: 750, fee: '$9', feeNum: 9, annualFee: 68, features: ['$750 credit limit', 'Monthly bureau reporting', 'Online account access', 'Payment reminders'] },
  { key: 'standard', label: 'Standard', limit: '$1,500', limitNum: 1500, fee: '$15', feeNum: 15, annualFee: 68, popular: true, features: ['$1,500 credit limit', 'Monthly bureau reporting', 'Online account access', 'Payment reminders', 'Priority support', 'Credit score tracking'] },
  { key: 'premium', label: 'Premium', limit: '$2,500', limitNum: 2500, fee: '$25', feeNum: 25, annualFee: 68, features: ['$2,500 credit limit', 'Monthly bureau reporting', 'Online account access', 'Payment reminders', 'Priority support', 'Credit score tracking', 'Financial education bundle'] },
  { key: 'elite', label: 'Elite', limit: '$3,500', limitNum: 3500, fee: '$35', feeNum: 35, annualFee: 68, best: true, features: ['$3,500 credit limit', 'Monthly bureau reporting', 'Online account access', 'Payment reminders', 'Dedicated advisor', 'Credit score tracking', 'Full education library', 'Expedited reporting'] },
];

/* ═══════════════════════════════════════════
   FAQ DATA
   ═══════════════════════════════════════════ */
const FAQ_GROUPS = [
  {
    title: 'About the Account',
    items: [
      { q: 'Do you check my credit to open an account?', a: 'No. There is no hard inquiry and no minimum credit score required to open a Credlocity Credit Builder account. We believe everyone deserves a path to better credit, regardless of where they are today. Our application process uses a soft pull that does not affect your credit score in any way. Whether you have a 450 or a 750, you can open an account and start building positive payment history immediately.' },
      { q: 'How does the Credit Builder account work?', a: 'When you open a Credit Builder account, you receive a revolving credit line ($750 to $3,500 depending on your plan). You can use this credit line to purchase financial education products from our digital store. Each month, you make a payment on your balance, and we report your on-time payments to all three major credit bureaus: Equifax, Experian, and TransUnion. Over time, this builds a strong payment history, which is the single most important factor in your FICO score (35% of your total score).' },
      { q: 'What happens if I miss a payment?', a: 'Late payments are reported to the credit bureaus and may negatively impact your credit score. We strongly recommend setting up autopay to protect your progress. If you anticipate difficulty making a payment, contact us before the due date and we can discuss options. We want to see you succeed and will work with you whenever possible.' },
    ]
  },
  {
    title: 'Credit Reporting',
    items: [
      { q: 'Which credit bureaus do you report to?', a: 'We report to all three major credit bureaus: Equifax, Experian, and TransUnion. This is critical because lenders may check any one of these bureaus when you apply for credit. By reporting to all three, you ensure your positive payment history is visible everywhere it matters. Reports are submitted monthly using the Metro 2 industry-standard format used by major banks and financial institutions.' },
      { q: 'How soon will I see results on my credit report?', a: 'Most clients see their Credit Builder account appear on their credit reports within 30 to 60 days of their first reported payment. The full impact on your credit score depends on your overall credit profile, but many clients see measurable improvement within 3 to 6 months of consistent on-time payments. Our average client improves their score by approximately 200 points over the life of their account.' },
      { q: 'Does payment history really affect my credit score that much?', a: 'Absolutely. Payment history is the single most influential factor in your FICO score, accounting for 35% of the total calculation. By making consistent, on-time payments on your Credit Builder account, you are directly building the most important component of your creditworthiness. This is why our program is so effective: it targets the factor that matters most.' },
    ]
  },
  {
    title: 'Costs & Plans',
    items: [
      { q: 'How much does a Credit Builder account cost?', a: 'There is a one-time annual membership fee of $68.00 due at enrollment, which covers account setup, credit bureau reporting infrastructure, and account maintenance for twelve months. In addition, monthly plan fees range from $9 per month (Starter, $750 credit limit) to $35 per month (Elite, $3,500 credit limit). There are no hidden fees, no penalty interest rates, and no security deposit required. The annual membership fee automatically renews each year on your enrollment anniversary date.' },
      { q: 'Can I upgrade or downgrade my plan later?', a: 'Yes. You can request a plan change at any time by contacting our support team. Upgrades take effect at the start of your next billing cycle. Downgrades may require paying down your balance to within the new credit limit before the change takes effect. There are no fees for changing plans.' },
    ]
  }
];

/* ═══════════════════════════════════════════
   SOCIAL PROOF ITEMS
   ═══════════════════════════════════════════ */
const TESTIMONIALS = [
  'Maria from Philadelphia raised her score 87 points in 4 months.',
  'James in Houston went from 510 to 695 in 6 months with the Standard plan.',
  'Angela from Miami got approved for her first mortgage after using Credit Builder for 8 months.',
  'Carlos in Chicago improved his score by 120 points and qualified for an auto loan.',
  'Destiny from Atlanta built her credit from scratch to 710 in just 5 months.',
  'Robert in Dallas paid off his balance and saw his score jump 95 points.',
  'Keisha from Detroit went from no credit history to 680 in under a year.',
  'David in Phoenix used the Elite plan and improved his score by 150 points.',
];

/* ═══════════════════════════════════════════
   TRUST BADGES
   ═══════════════════════════════════════════ */
const TRUST_BADGES = [
  { text: 'No Hard Inquiry', cls: 'cb-float-1' },
  { text: 'Reports to All 3 Bureaus', cls: 'cb-float-2' },
  { text: 'No Minimum Score Required', cls: 'cb-float-3' },
  { text: '17+ Years Experience', cls: 'cb-float-4' },
];

/* ═══════════════════════════════════════════
   HOW IT WORKS STEPPER DATA
   ═══════════════════════════════════════════ */
const STEPS = [
  { num: 1, title: 'Open Your Account', desc: 'Choose a plan from $750 to $3,500 in available credit. No hard inquiry, no minimum credit score required. Complete our simple application in under 5 minutes and get approved instantly. Your account is activated immediately so you can start building credit right away.', icon: CreditCard },
  { num: 2, title: 'Shop Our Digital Store', desc: 'Use your credit line to purchase financial education resources from the Credlocity Digital Store. From FCRA consumer rights guides to comprehensive credit mastery courses, every purchase helps you learn while building your credit at the same time.', icon: BookOpen },
  { num: 3, title: 'Build Your Credit', desc: 'Each monthly payment you make is reported to Equifax, Experian, and TransUnion using the Metro 2 industry-standard format. Watch your credit score grow as you build positive payment history. Most clients see improvement within 30 to 60 days of their first reported payment.', icon: TrendingUp },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function CreditBuilderPublicStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaqs, setOpenFaqs] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [signupPlan, setSignupPlan] = useState('standard');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [signupForm, setSignupForm] = useState({
    first_name: '', last_name: '', middle_name: '', email: '', phone: '',
    date_of_birth: '', full_ssn: '', ssn_last_four: '',
    address_line1: '', address_line2: '', city: '', state: '', zip_code: '',
    password: '', confirm_password: ''
  });
  const heroRef = useRef(null);
  const stepTimerRef = useRef(null);
  const progressRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => { injectStyles(); }, []);

  // Fetch products
  useEffect(() => {
    api.get('/credit-builder/products').then(r => setProducts(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Sticky bar on scroll past hero
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current || stickyDismissed) return;
      const rect = heroRef.current.getBoundingClientRect();
      setShowSticky(rect.bottom < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [stickyDismissed]);

  // Auto-advance stepper
  const startStepTimer = useCallback(() => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    setStepProgress(0);
    const start = Date.now();
    const dur = 4000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / dur) * 100, 100);
      setStepProgress(pct);
      if (pct < 100) { progressRef.current = requestAnimationFrame(tick); }
      else { setActiveStep(s => (s + 1) % 3); }
    };
    progressRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    startStepTimer();
    return () => { if (progressRef.current) cancelAnimationFrame(progressRef.current); };
  }, [activeStep, startStepTimer]);

  const goToStep = (i) => { setActiveStep(i); };

  const toggleFaq = (key) => setOpenFaqs(p => ({ ...p, [key]: !p[key] }));

  const openSignup = (plan = 'standard') => { setSignupPlan(plan); setShowSignup(true); setSignupSuccess(null); };

  const handleSignup = async (e) => {
    e.preventDefault();
    const f = signupForm;
    if (f.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (f.password !== f.confirm_password) { toast.error('Passwords do not match'); return; }
    // Format DOB from YYYY-MM-DD to MMDDYYYY
    let dob = f.date_of_birth;
    if (dob && dob.includes('-')) {
      const [y, m, d] = dob.split('-');
      dob = `${m}${d}${y}`;
    }
    setSignupLoading(true);
    try {
      const res = await api.post('/credit-builder/signup', {
        ...f, date_of_birth: dob, plan_tier: signupPlan,
        ssn_last_four: f.full_ssn.replace(/\D/g, '').slice(-4)
      });
      setSignupSuccess(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally { setSignupLoading(false); }
  };

  const updateSignup = (field, value) => setSignupForm(p => ({ ...p, [field]: value }));

  // Touch handlers for stepper
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setActiveStep(s => Math.min(s + 1, 2));
      else setActiveStep(s => Math.max(s - 1, 0));
    }
  };

  const CATEGORIES = { credit_education: 'Credit Education', financial_literacy: 'Financial Literacy', legal_guides: 'Legal Guides', bundles: 'Bundles' };

  // Schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialProduct',
        name: 'Credlocity Credit Builder Account',
        description: 'Build your credit with a revolving credit line reported to all three major credit bureaus. No hard inquiry, no minimum credit score required.',
        provider: { '@type': 'Organization', name: 'Credlocity', url: 'https://credlocity.com' },
        feesAndCommissionsSpecification: 'Monthly fees from $9 to $35 depending on credit limit tier.'
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_GROUPS.flatMap(g => g.items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://credlocity.com/' },
          { '@type': 'ListItem', position: 2, name: 'Credit Builder', item: 'https://credlocity.com/credit-builder-store' }
        ]
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Credit Builder Account | Build Your Credit Score | Credlocity</title>
        <meta name="description" content="Open a Credlocity Credit Builder account with no hard inquiry and no minimum credit score. Reports to Equifax, Experian & TransUnion monthly. Plans from $9/mo." />
        <meta name="keywords" content="credit builder, build credit, credit builder account, no hard inquiry, credit score improvement, Credlocity, revolving credit, credit bureau reporting" />
        <link rel="canonical" href="https://credlocity.com/credit-builder-store" />
        <meta property="og:title" content="Credit Builder Account | Credlocity" />
        <meta property="og:description" content="Build your credit with no hard inquiry. Reports to all 3 bureaus. Plans from $9/month." />
        <meta property="og:url" content="https://credlocity.com/credit-builder-store" />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Builder Account | Credlocity" />
        <meta name="twitter:description" content="Build your credit with no hard inquiry. Reports to all 3 bureaus. Plans from $9/month." />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white" data-testid="credit-builder-store">

        {/* ══════════ SECTION 1: HERO ══════════ */}
        <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16 pb-24 px-4" data-testid="hero-section">
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="cb-hero-h1 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Build Your Credit Score{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">With Confidence</span>
            </h1>
            <p className="cb-hero-sub text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Open a Credlocity Credit Builder Account and invest in your financial education while building positive payment history reported to all three major credit bureaus every month.
            </p>
            <div className="cb-hero-cta flex flex-wrap justify-center gap-4 mb-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 text-lg rounded-full shadow-lg shadow-blue-600/30 transition-all" data-testid="hero-cta-btn" onClick={() => openSignup()}>
                Get Started Today <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800 px-8 py-3 text-lg rounded-full" data-testid="hero-learn-more-btn" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </Button>
            </div>
            {/* Trust Badges */}
            <div className="cb-hero-badges flex flex-wrap justify-center gap-3 mb-14" data-testid="trust-badges">
              {TRUST_BADGES.map((b, i) => (
                <span key={i} className={`${b.cls} inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium px-4 py-2 rounded-full`}>
                  <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" /> {b.text}
                </span>
              ))}
            </div>
            {/* Animated Credit Score */}
            <AnimatedScore />
          </div>
        </section>

        {/* ══════════ SECTION 2: STATS BAR ══════════ */}
        <RevealSection>
          <section className="bg-slate-900/80 border-y border-slate-800" data-testid="stats-section">
            <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-800">
              <StatCounter end={79000} suffix="+" label="Clients Served" />
              <StatCounter end={17} suffix="+" label="Years in Business" />
              <StatCounter end={3} label="Bureaus We Report To" />
              <div className="text-center px-4 py-6" data-testid="stat-bbb-rating">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">A+</div>
                <p className="text-slate-300 text-sm mt-2 tracking-wide">BBB Rating</p>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 3: HOW IT WORKS ══════════ */}
        <RevealSection>
          <section id="how-it-works" className="py-20 px-4" data-testid="how-it-works-section">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">How It Works</h2>
              <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">Three simple steps to start building your credit today</p>

              {/* Step Indicators */}
              <div className="flex justify-center gap-2 sm:gap-6 mb-10">
                {STEPS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goToStep(i)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full border transition-all text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 ${activeStep === i ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                    data-testid={`step-btn-${i + 1}`}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === i ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-400'}`}>{s.num}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-none" style={{ width: `${stepProgress}%` }} data-testid="step-progress-bar" />
              </div>

              {/* Step Content */}
              <div className="max-w-2xl mx-auto" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {STEPS.map((s, i) => (
                  <div key={i} className={`transition-all duration-500 ${activeStep === i ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -translate-y-4 pointer-events-none'}`} style={{ display: activeStep === i ? 'block' : 'none' }}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <s.icon className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4">{s.title}</h3>
                      <p className="text-slate-300 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 4: WHY NO HARD INQUIRY ══════════ */}
        <RevealSection>
          <section className="py-20 px-4 bg-slate-900/50" data-testid="no-hard-inquiry-section">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">Why No Hard Inquiry?</h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8">A Smarter Way to Build Credit</h3>
              <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
                <p>
                  Unlike traditional credit cards and secured cards that require a hard pull on your credit report, the Credlocity Credit Builder Account uses a soft inquiry during the application process. This means your credit score is never affected when you apply. Whether your score is 400 or 800, you can open an account and begin building positive payment history immediately. Our program is designed for people who have been turned away by banks, are rebuilding after bankruptcy, or are establishing credit for the very first time.
                </p>
                <p>
                  A hard inquiry can lower your credit score by 5 to 10 points and stays on your report for two years. When you are already working to improve your credit, every point matters. By eliminating this barrier, we make it possible for anyone to access a legitimate <Link to="/credit-building" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">credit-building</Link> tool without risking further damage to their score. This is one of the key reasons our clients choose Credlocity over secured credit cards and other alternatives.
                </p>
                <p>
                  Our Credit Builder program differs from secured cards in several important ways. First, there is no security deposit required. Second, we report to all three major bureaus monthly, whereas many secured card issuers report to only one or two. Third, your credit line is used to purchase educational resources that help you understand <Link to="/credit-scores" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">how credit scores work</Link> and how to manage your finances more effectively. It is an investment in your financial future, not just a line of credit. Learn more about your <Link to="/fcra-guide" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">rights under the Fair Credit Reporting Act</Link>.
                </p>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 5: PLAN TIERS ══════════ */}
        <RevealSection>
          <section className="py-20 px-4" data-testid="plans-section">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">Choose Your Plan</h2>
              <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">Select the credit limit that fits your budget and goals. Upgrade anytime.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map(p => (
                  <div key={p.key} className={`cb-plan-card relative bg-slate-900 border rounded-2xl overflow-hidden ${p.popular ? 'border-blue-500 ring-1 ring-blue-500/50' : p.best ? 'border-amber-500 ring-1 ring-amber-500/40' : 'border-slate-800'}`} data-testid={`plan-${p.key}`}>
                    {p.popular && <div className="absolute -top-0 left-0 right-0 bg-blue-600 text-center text-xs font-bold py-1 tracking-widest uppercase cb-pulse">Most Popular</div>}
                    {p.best && <div className="absolute -top-0 left-0 right-0 bg-amber-500 text-slate-900 text-center text-xs font-bold py-1 tracking-widest uppercase">Best Value</div>}
                    <div className={`p-6 sm:p-8 ${(p.popular || p.best) ? 'pt-10' : ''}`}>
                      <h3 className="font-bold text-lg mb-1 text-slate-100">{p.label}</h3>
                      <p className="text-3xl sm:text-4xl font-bold mb-1">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{p.limit}</span>
                      </p>
                      <p className="text-sm text-slate-500 mb-4">credit limit</p>
                      <p className="text-xl font-semibold text-white">{p.fee}<span className="text-sm text-slate-500 font-normal">/month</span></p>
                      <p className="text-xs text-slate-500 mb-6">+ $68 annual membership fee</p>
                      <ul className="space-y-2 mb-6">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full rounded-full ${p.popular ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30' : p.best ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}`} data-testid={`apply-${p.key}`} onClick={() => openSignup(p.key)}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 5b: CREDIT SCORE SIMULATOR ══════════ */}
        <RevealSection>
          <section className="py-20 px-4 bg-slate-900/50" data-testid="simulator-section">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">Score Simulator</h2>
              <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">See how your credit score could improve with each plan</p>
              <CreditScoreSimulator />
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 6: DIGITAL STORE ══════════ */}
        <RevealSection>
          <section className="py-20 px-4 bg-slate-900/50" data-testid="store-section">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">Our Digital Store</h2>
              <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">Use your credit line to purchase financial education resources</p>
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
              ) : products.length === 0 ? (
                <p className="text-center text-slate-500">No products available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="cb-product-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden" data-testid={`product-${p.id}`}>
                      <div className="p-6">
                        <div className="w-full h-20 bg-slate-800 rounded-xl mb-4 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-600" />
                        </div>
                        <span className="inline-block text-[10px] font-semibold tracking-wider uppercase bg-blue-500/20 text-cyan-300 px-2 py-0.5 rounded mb-2">{CATEGORIES[p.category] || p.category}</span>
                        <h3 className="font-semibold text-sm text-slate-100 mb-1">{p.name}</h3>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{p.description}</p>
                        <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">${p.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 7: SOCIAL PROOF TICKER ══════════ */}
        <RevealSection>
          <section className="py-10 overflow-hidden border-y border-slate-800" data-testid="social-proof-section">
            <div className="relative">
              <div className="cb-ticker-track flex whitespace-nowrap">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-3 mx-8 text-sm text-slate-400">
                    <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 8: BUREAU REPORTING EXPLAINER ══════════ */}
        <RevealSection>
          <section className="py-20 px-4" data-testid="bureau-reporting-section">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">Bureau Reporting</h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8">How Your Payments Build Your Score</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {['Equifax', 'Experian', 'TransUnion'].map((bureau, i) => (
                  <div key={bureau} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                    <Building2 className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">{bureau}</h4>
                    <p className="text-sm text-slate-400">Monthly Metro 2 format reporting to ensure your on-time payments are recorded accurately.</p>
                  </div>
                ))}
              </div>
              <div className="prose prose-invert prose-slate max-w-none space-y-5 text-slate-300 leading-relaxed">
                <p>
                  Every month, Credlocity reports your account information to Equifax, Experian, and TransUnion using the Metro 2 data format. This is the same standard used by major banks, credit unions, and financial institutions across the United States. Your payment history, balance, credit limit, and account status are all included in these reports.
                </p>
                <p>
                  Payment history is the single most important factor in your FICO score, accounting for approximately 35% of the total calculation. By making consistent, on-time payments on your Credit Builder account, you are directly building the most influential component of your creditworthiness. Additionally, your credit utilization ratio (how much of your available credit you are using) accounts for another 30% of your score. Keeping your balance low relative to your credit limit demonstrates responsible credit management to lenders.
                </p>
                <p>
                  For more information about how credit scores are calculated and what you can do to improve yours, visit our <Link to="/credit-scores" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Credit Scores Guide</Link> or explore our <Link to="/education-hub" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Education Hub</Link> for comprehensive financial literacy resources.
                </p>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 9: FAQ ACCORDION ══════════ */}
        <RevealSection>
          <section className="py-20 px-4 bg-slate-900/50" data-testid="faq-section">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-center mb-2 text-cyan-400 tracking-widest uppercase">Frequently Asked Questions</h2>
              <p className="text-center text-slate-400 mb-12">Everything you need to know about the Credit Builder program</p>
              {FAQ_GROUPS.map((group, gi) => (
                <div key={gi} className="mb-8">
                  <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">{group.title}</h3>
                  <div className="space-y-3">
                    {group.items.map((faq, fi) => {
                      const key = `${gi}-${fi}`;
                      const isOpen = !!openFaqs[key];
                      return (
                        <div key={key} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80" data-testid={`faq-${gi}-${fi}`}>
                          <button
                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset"
                            onClick={() => toggleFaq(key)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleFaq(key)}
                            aria-expanded={isOpen}
                            aria-controls={`faq-body-${key}`}
                          >
                            <span className="font-semibold text-sm sm:text-base text-slate-100 pr-4">{faq.q}</span>
                            <ChevronDown className={`w-5 h-5 text-cyan-400 flex-shrink-0 cb-faq-arrow ${isOpen ? 'cb-open' : ''}`} />
                          </button>
                          <div id={`faq-body-${key}`} className={`cb-faq-body ${isOpen ? 'cb-expanded' : ''}`} role="region">
                            <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{faq.a}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 10: FINAL CTA BANNER ══════════ */}
        <RevealSection>
          <section className="relative py-24 px-4 overflow-hidden" data-testid="final-cta-section">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-90" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">Ready to Start Building Your Credit?</h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">Join over 79,000 clients who have improved their credit scores with Credlocity. No hard inquiry. No minimum score. Start today.</p>
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-4 text-lg font-bold rounded-full shadow-xl" data-testid="final-cta-btn" onClick={() => openSignup()}>
                Apply Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </section>
        </RevealSection>

        {/* ══════════ SECTION 11: STICKY BOTTOM BAR ══════════ */}
        {showSticky && !stickyDismissed && (
          <div className="fixed bottom-0 left-0 right-0 z-50 cb-sticky-enter" data-testid="sticky-cta-bar">
            <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700 px-4 py-3">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <p className="text-sm sm:text-base text-slate-200 font-medium">Ready to build your credit?</p>
                <div className="flex items-center gap-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6" data-testid="sticky-cta-btn" onClick={() => openSignup()}>
                    Get Started
                  </Button>
                  <button
                    onClick={() => setStickyDismissed(true)}
                    className="text-slate-500 hover:text-slate-300 p-1 focus:outline-none"
                    aria-label="Dismiss"
                    data-testid="sticky-dismiss-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SIGNUP MODAL ══════════ */}
        {showSignup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-testid="signup-modal">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !signupLoading && setShowSignup(false)} />
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h2 className="font-bold text-lg text-white">Create Your Account</h2>
                  <p className="text-xs text-slate-400">{PLANS.find(p => p.key === signupPlan)?.label} Plan - {PLANS.find(p => p.key === signupPlan)?.limit} Credit Limit</p>
                </div>
                <button onClick={() => !signupLoading && setShowSignup(false)} className="text-slate-500 hover:text-white" data-testid="close-signup-modal"><X className="w-5 h-5" /></button>
              </div>

              {signupSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-400" /></div>
                  <h3 className="text-xl font-bold text-white mb-2">Account Created!</h3>
                  <p className="text-sm text-slate-400 mb-4">{signupSuccess.message}</p>
                  <div className="bg-slate-800 rounded-xl p-4 text-left space-y-2 mb-6">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Account Number</span><span className="font-mono text-cyan-400">{signupSuccess.account_number}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Email</span><span className="text-white">{signupSuccess.email}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Plan</span><span className="text-white">{signupSuccess.plan_tier?.charAt(0).toUpperCase() + signupSuccess.plan_tier?.slice(1)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Credit Limit</span><span className="text-cyan-400 font-bold">${signupSuccess.credit_limit?.toLocaleString()}</span></div>
                  </div>
                  <p className="text-xs text-slate-500">Check your email for login details and next steps.</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-500 rounded-full" onClick={() => setShowSignup(false)}>Close</Button>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="p-5 space-y-4">
                  {/* Plan selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Selected Plan</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PLANS.map(p => (
                        <button key={p.key} type="button" onClick={() => setSignupPlan(p.key)}
                          className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${signupPlan === p.key ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                          data-testid={`signup-plan-${p.key}`}>
                          {p.label}<br /><span className="text-[10px] opacity-70">{p.limit}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">$68 annual membership + {PLANS.find(p => p.key === signupPlan)?.fee}/mo</p>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-slate-400 mb-1">First Name *</label>
                      <Input value={signupForm.first_name} onChange={e => updateSignup('first_name', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-first-name" required /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Last Name *</label>
                      <Input value={signupForm.last_name} onChange={e => updateSignup('last_name', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-last-name" required /></div>
                  </div>
                  <div><label className="block text-xs text-slate-400 mb-1">Email *</label>
                    <Input type="email" value={signupForm.email} onChange={e => updateSignup('email', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-email" required /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Phone *</label>
                    <Input type="tel" value={signupForm.phone} onChange={e => updateSignup('phone', e.target.value)} placeholder="(215) 555-0100" className="bg-slate-800 border-slate-700 text-white" data-testid="signup-phone" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-slate-400 mb-1">Date of Birth *</label>
                      <Input type="date" value={signupForm.date_of_birth} onChange={e => updateSignup('date_of_birth', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-dob" required /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Social Security # *</label>
                      <Input type="text" inputMode="numeric" maxLength={11} placeholder="XXX-XX-XXXX"
                        value={signupForm.full_ssn} onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 9);
                          if (v.length > 5) v = v.slice(0,3) + '-' + v.slice(3,5) + '-' + v.slice(5);
                          else if (v.length > 3) v = v.slice(0,3) + '-' + v.slice(3);
                          updateSignup('full_ssn', v);
                        }}
                        className="bg-slate-800 border-slate-700 text-white font-mono" data-testid="signup-ssn" required /></div>
                  </div>

                  {/* Address */}
                  <div><label className="block text-xs text-slate-400 mb-1">Street Address *</label>
                    <Input value={signupForm.address_line1} onChange={e => updateSignup('address_line1', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-address" required /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block text-xs text-slate-400 mb-1">City *</label>
                      <Input value={signupForm.city} onChange={e => updateSignup('city', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-city" required /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">State *</label>
                      <Input maxLength={2} value={signupForm.state} onChange={e => updateSignup('state', e.target.value.toUpperCase())} placeholder="PA" className="bg-slate-800 border-slate-700 text-white" data-testid="signup-state" required /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">ZIP *</label>
                      <Input maxLength={5} inputMode="numeric" value={signupForm.zip_code} onChange={e => updateSignup('zip_code', e.target.value.replace(/\D/g, '').slice(0,5))} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-zip" required /></div>
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-slate-400 mb-1">Password *</label>
                      <div className="relative">
                        <Input type={showPass ? 'text' : 'password'} value={signupForm.password} onChange={e => updateSignup('password', e.target.value)} className="bg-slate-800 border-slate-700 text-white pr-10" data-testid="signup-password" required minLength={8} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Confirm Password *</label>
                      <Input type="password" value={signupForm.confirm_password} onChange={e => updateSignup('confirm_password', e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="signup-confirm-password" required /></div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 rounded-full py-3 text-base" disabled={signupLoading} data-testid="signup-submit-btn">
                    {signupLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating Account...</> : <>
                      <CreditCard className="w-4 h-4 mr-2" />Create Account - {PLANS.find(p => p.key === signupPlan)?.label} Plan
                    </>}
                  </Button>
                  <p className="text-[10px] text-slate-500 text-center leading-relaxed">By creating an account, you agree to our Terms of Service. You will need to sign a Credit Builder Agreement after account creation. Annual membership fee of $68 applies.</p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
