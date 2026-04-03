import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle2, Shield, DollarSign, FileText, AlertTriangle, Scale, TrendingUp, Users, Clock, BadgeCheck, Receipt, FileCheck, MessageSquare, ArrowRightLeft, Calculator, Share2, Copy, Check } from 'lucide-react';
import { TrialButton } from '../components/LeadButtons';

const competitors = [
  { name: "Lexington Law", price: "$139.95/mo", beaten: "$132.95/mo", path: "/vs-lexington-law", issues: "CFPB enforcement for illegal advance fees, 700+ BBB complaints", illegal: "Charged advance fees before services were rendered — a violation of the Telemarketing Sales Rule (TSR)" },
  { name: "CreditRepair.com", price: "$119.95/mo", beaten: "$113.95/mo", path: "/vs-creditrepair", issues: "D BBB rating, FTC scrutiny, 1.5/5 Trustpilot", illegal: "Charged setup fees equal to first month's payment before any work was completed" },
  { name: "The Credit People", price: "$119/mo", beaten: "$113.05/mo", path: "/vs-credit-people", issues: "C+ BBB rating, non-refundable $419 flat fee", illegal: "Collected non-refundable flat fees with no guaranteed results" },
  { name: "The Credit Pros", price: "$149/mo", beaten: "$141.55/mo", path: "/vs-credit-pros", issues: "Cancellation complaints, charges after cancellation", illegal: "Charged first work fees of $129–$149 and continued billing after cancellation requests" },
  { name: "Credit Saint", price: "$139.99/mo", beaten: "$132.99/mo", path: "/vs-credit-saint", issues: "$195 setup fee, 847 complaints, guarantee loopholes", illegal: "Charged a $195 initial work fee on every plan before any disputes were filed" },
  { name: "White Jacobs", price: "~$150-$500/mo", beaten: "5% less guaranteed", path: "/vs-white-jacobs", issues: "D+ BBB, hidden pricing, $1,500-$3,000 total costs", illegal: "Required upfront payments with undisclosed pricing and denied refunds despite guarantees" }
];

const qualificationSteps = [
  { icon: Receipt, title: "Recent Bank Statement", desc: "Provide your most recent bank or credit card statement showing the charge from your current credit repair company. This must be dated within the last 60 days." },
  { icon: MessageSquare, title: "Enrollment Circumstances", desc: "Tell us how you signed up — were you enrolled over the phone? Were fees charged before any work was done? Were you pressured or misled about pricing or results?" },
  { icon: FileCheck, title: "Service Agreement Copy", desc: "Provide a copy of the service agreement or contract you received from the other credit repair company. If you never received one, that itself may be a violation." }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How does Credlocity's price-beat guarantee work?", "acceptedAnswer": { "@type": "Answer", "text": "If you're currently paying another credit repair company, Credlocity will beat their price by 5%. Simply provide your most recent bank statement showing the charge, explain your enrollment circumstances, and share a copy of your service agreement. We'll calculate your new lower rate and apply it immediately when you switch." }},
    { "@type": "Question", "name": "Can I get a refund from my current credit repair company?", "acceptedAnswer": { "@type": "Answer", "text": "If your current credit repair company charged you illegal fees — such as advance fees before work was completed (a violation of the Telemarketing Sales Rule and CROA) — Credlocity will help you fight for a refund. Many companies have been found to charge illegal upfront fees, and consumers are entitled to recover those charges." }},
    { "@type": "Question", "name": "What qualifies as an illegal fee in credit repair?", "acceptedAnswer": { "@type": "Answer", "text": "Under the Credit Repair Organizations Act (CROA) and the Telemarketing Sales Rule (TSR), credit repair companies cannot charge you before they have fully performed the promised services. This means any setup fee, first work fee, or enrollment fee charged before disputes are completed may be illegal. Companies that enroll clients over the phone and charge fees are also in violation of TSR." }},
    { "@type": "Question", "name": "How do I switch from Lexington Law to Credlocity?", "acceptedAnswer": { "@type": "Answer", "text": "Switching from Lexington Law to Credlocity is simple: Cancel your Lexington Law subscription, then sign up for Credlocity's 30-day free trial. Provide your bank statement showing Lexington Law charges, your enrollment details, and your service agreement — and we'll beat their price by 5% plus help you recover any illegal fees they may have charged." }},
    { "@type": "Question", "name": "Is there a contract with Credlocity?", "acceptedAnswer": { "@type": "Answer", "text": "No. Credlocity is month-to-month with no long-term contracts. You also get a 30-day free trial and a 180-day money-back guarantee. You can cancel anytime with no hassle — unlike many competitors who make cancellation difficult." }},
    { "@type": "Question", "name": "How much can I save by switching to Credlocity?", "acceptedAnswer": { "@type": "Answer", "text": "With the 5% price-beat guarantee plus a 30-day free trial, the savings are significant. For example, switching from The Credit Pros ($149/mo) saves you $149 in the first month (free trial) plus $7.45/mo ongoing — that's over $186 saved in just the first 6 months, with better service, AI-powered disputes, and zero BBB complaints." }},
    { "@type": "Question", "name": "What if my credit repair company never gave me a service agreement?", "acceptedAnswer": { "@type": "Answer", "text": "Under CROA, credit repair companies are legally required to provide you with a written contract before performing any services. If your company never provided a service agreement, that itself is a federal violation. Credlocity can help you file complaints with the CFPB and FTC, and pursue recovery of fees paid under that illegal arrangement." }}
  ]
};

/* ─────────────────────────────────────────────
   Interactive Competitor Price Calculator
   ───────────────────────────────────────────── */
const PriceCalculator = ({ competitors }) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [months, setMonths] = useState(6);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: "Lexington Law", price: 139.95 },
    { label: "CreditRepair.com", price: 119.95 },
    { label: "The Credit People", price: 119 },
    { label: "The Credit Pros", price: 149 },
    { label: "Credit Saint", price: 139.99 },
    { label: "White Jacobs", price: 200 },
    { label: "Other company", price: 0 }
  ];

  const currentPrice = selectedCompetitor
    ? (presets.find(p => p.label === selectedCompetitor)?.price || parseFloat(customPrice) || 0)
    : (parseFloat(customPrice) || 0);

  const isCustom = selectedCompetitor === "Other company";
  const activePrice = isCustom ? (parseFloat(customPrice) || 0) : currentPrice;
  const beatPrice = activePrice > 0 ? (activePrice * 0.95).toFixed(2) : 0;
  const monthlySavings = activePrice > 0 ? (activePrice - parseFloat(beatPrice)).toFixed(2) : 0;
  const firstMonthSaving = activePrice; // Free trial
  const totalSavings = activePrice > 0 ? (firstMonthSaving + (parseFloat(monthlySavings) * (months - 1))).toFixed(2) : 0;
  const theirTotal = activePrice > 0 ? (activePrice * months).toFixed(2) : 0;
  const ourTotal = activePrice > 0 ? (parseFloat(beatPrice) * (months - 1)).toFixed(2) : 0; // First month free

  return (
    <section className="py-12 bg-gray-50" data-testid="price-calculator-section">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary-blue/10 text-primary-blue px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Calculator className="w-4 h-4" /> Interactive Tool
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-2">Competitor Price Calculator</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">See exactly how much you'll save by switching to Credlocity. Select your current company or enter your monthly price.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Calculator Inputs */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Your Current Company</label>
                <select
                  data-testid="calc-company-select"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                  value={selectedCompetitor}
                  onChange={e => { setSelectedCompetitor(e.target.value); if (e.target.value !== "Other company") setCustomPrice(''); }}
                >
                  <option value="">Select a company...</option>
                  {presets.map((p, i) => (
                    <option key={i} value={p.label}>{p.label}{p.price > 0 ? ` ($${p.price}/mo)` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {isCustom ? "Enter Your Monthly Rate" : "Their Monthly Rate"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    data-testid="calc-price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    value={isCustom ? customPrice : (currentPrice > 0 ? currentPrice : '')}
                    onChange={e => { setCustomPrice(e.target.value); if (!isCustom) setSelectedCompetitor("Other company"); }}
                    placeholder="0.00"
                    readOnly={!isCustom && selectedCompetitor !== ''}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">How Many Months?</label>
                <select
                  data-testid="calc-months-select"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                  value={months}
                  onChange={e => setMonths(parseInt(e.target.value))}
                >
                  {[3, 6, 9, 12].map(m => <option key={m} value={m}>{m} months</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {activePrice > 0 ? (
            <div className="p-6 md:p-8" data-testid="calc-results">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Their Cost */}
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                  <p className="text-xs text-red-500 uppercase tracking-wide font-medium mb-1">
                    {selectedCompetitor && selectedCompetitor !== "Other company" ? selectedCompetitor : "Your Current Company"}
                  </p>
                  <p className="text-3xl font-bold text-red-600 mb-2" data-testid="calc-their-total">${theirTotal}</p>
                  <p className="text-xs text-red-500">
                    ${activePrice.toFixed(2)}/mo x {months} months = <strong>${theirTotal}</strong>
                  </p>
                  <p className="text-xs text-red-400 mt-1">No free trial. No guarantee.</p>
                </div>
                {/* Our Cost */}
                <div className="bg-green-50 rounded-xl p-5 border-2 border-green-300 relative">
                  <span className="absolute -top-2.5 right-4 bg-green-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">YOU SAVE</span>
                  <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">Credlocity</p>
                  <p className="text-3xl font-bold text-green-700 mb-2" data-testid="calc-our-total">${ourTotal}</p>
                  <p className="text-xs text-green-600">
                    $0 first month (free trial) + ${beatPrice}/mo x {months - 1} months = <strong>${ourTotal}</strong>
                  </p>
                  <p className="text-xs text-green-500 mt-1">+ 180-day money-back guarantee</p>
                </div>
              </div>

              {/* Savings Summary */}
              <div className="bg-primary-blue rounded-xl p-6 text-white text-center">
                <p className="text-sm text-blue-200 mb-1">Your Total Savings Over {months} Months</p>
                <p className="text-4xl md:text-5xl font-bold mb-2" data-testid="calc-total-savings">${totalSavings}</p>
                <div className="flex items-center justify-center gap-6 text-sm text-blue-200 mt-2">
                  <span><strong className="text-white">${activePrice.toFixed(2)}</strong> saved in month 1 (free trial)</span>
                  <span><strong className="text-white">${monthlySavings}</strong>/mo saved after (5% beat)</span>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
                    <TrialButton variant="link" className="inline-flex items-center">
                      Switch Now — Save ${totalSavings} <ArrowRight className="w-4 h-4 ml-2" />
                    </TrialButton>
                  </Button>
                </div>

                {/* Share Your Savings */}
                <div className="mt-5 pt-5 border-t border-white/20" data-testid="share-savings-section">
                  <p className="text-xs text-blue-200 flex items-center justify-center gap-1 mb-3">
                    <Share2 className="w-3.5 h-3.5" /> Share your savings with friends & family
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {/* Twitter / X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm saving $${totalSavings} over ${months} months by switching to @Credlocity! They beat my credit repair price by 5% AND my first month is free. Check it out:`)}&url=${encodeURIComponent('https://www.credlocity.com/switch')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
                      data-testid="share-twitter"
                      title="Share on X (Twitter)"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.credlocity.com/switch')}&quote=${encodeURIComponent(`I'm saving $${totalSavings} by switching to Credlocity! They beat any credit repair company's price by 5%.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
                      data-testid="share-facebook"
                      title="Share on Facebook"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.credlocity.com/switch')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
                      data-testid="share-linkedin"
                      title="Share on LinkedIn"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    {/* Copy Link */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`I'm saving $${totalSavings} over ${months} months by switching to Credlocity! They beat my credit repair price by 5% and my first month is free. Switch & save: https://www.credlocity.com/switch`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
                      data-testid="share-copy"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-300 mt-2">Copied to clipboard!</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400" data-testid="calc-empty-state">
              <Calculator className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a company or enter your monthly rate to see your savings</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const SwitchAndSave = () => {
  return (
    <>
      <Helmet>
        <title>Switch Credit Repair Companies & Save 5% | Credlocity Price-Beat Guarantee</title>
        <meta name="description" content="Switching credit repair companies? Credlocity beats your current price by 5% guaranteed. If your company charged illegal fees, we'll help you fight for a refund. Switch from Lexington Law, CreditRepair.com, Credit Saint, and more." />
        <meta property="og:title" content="Switch Credit Repair Companies & Save 5% | Credlocity" />
        <meta property="og:description" content="We'll beat any credit repair company's price by 5%. Plus, if they charged you illegal fees, we'll help you get your money back." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.credlocity.com/switch" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-16 md:py-24" data-testid="switch-hero">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <p className="text-sm uppercase tracking-wider text-green-300 mb-3 font-medium">Credlocity Price-Beat Guarantee</p>
          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" data-testid="switch-h1">
            Switch & Save: We Beat Their Price by 5%
          </h1>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto mb-4">
            Paying too much for credit repair that isn't working? Credlocity will beat your current company's
            monthly rate by 5% — guaranteed. And if they charged you an illegal fee, we'll help you fight to get every penny back.
          </p>
          <p className="text-green-300 font-semibold text-lg mb-8">
            Plus, start with a 30-day free trial. Zero risk. Better results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
              <TrialButton variant="link" className="inline-flex items-center">
                Start Free 30-Day Trial <ArrowRight className="w-4 h-4 ml-2" />
              </TrialButton>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/credit-repair-reviews">Compare All Companies</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Offer — Two Pillars */}
      <section className="py-12 bg-white" data-testid="offer-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8 text-center">Our Promise to Switchers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pillar 1: Price Beat */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 relative" data-testid="price-beat-card">
              <span className="absolute -top-3 left-6 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">Guaranteed</span>
              <DollarSign className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-cinzel text-xl font-bold text-gray-900 mb-3">5% Price-Beat Guarantee</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Show us what you're currently paying, and we'll beat it by 5%. Not match it — <strong>beat it</strong>.
                Whether you're with Lexington Law at $139.95/mo, The Credit Pros at $149/mo, or any other company,
                your Credlocity rate will be 5% less than what you've been paying.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Combined with our <strong>30-day free trial</strong>, you save even more in your first month — because your first month is $0.
              </p>
            </div>
            {/* Pillar 2: Illegal Fee Recovery */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 relative" data-testid="fee-recovery-card">
              <span className="absolute -top-3 left-6 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">We Fight For You</span>
              <Scale className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="font-cinzel text-xl font-bold text-gray-900 mb-3">Illegal Fee Recovery Assistance</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Did your previous credit repair company charge you <strong>before completing any work</strong>? That may be a violation
                of the <Link to="/tsr-compliance" className="text-primary-blue underline font-medium">Telemarketing Sales Rule (TSR)</Link> and
                the <Link to="/fcra-guide" className="text-primary-blue underline font-medium">Credit Repair Organizations Act (CROA)</Link>.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Credlocity will help you <strong>file complaints with the CFPB and FTC</strong>, document the violations,
                and pursue recovery of every illegal fee they charged you. You shouldn't pay for services you didn't receive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Price Calculator */}
      <PriceCalculator competitors={competitors} />

      {/* How to Qualify */}
      <section className="py-12 bg-gray-50" data-testid="qualify-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-2">How to Qualify for the 5% Price-Beat</h2>
          <p className="text-gray-600 mb-8">To receive the 5% price-beat rate, simply provide the following three items when you switch to Credlocity:</p>
          <div className="space-y-4">
            {qualificationSteps.map((step, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4" data-testid={`qualify-step-${i}`}>
                <div className="flex-shrink-0 w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary-blue" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-primary-blue bg-primary-blue/10 px-2 py-0.5 rounded-full">STEP {i + 1}</span>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Important:</strong> The bank statement must be dated within the last 60 days and clearly show the charge from the
              credit repair company. If you were enrolled over the phone and charged before services were completed, that charge
              may qualify as an <strong>illegal fee</strong> under federal law — and we will help you pursue a refund at no additional cost.
            </p>
          </div>
        </div>
      </section>

      {/* Per-Competitor Switch Offers */}
      <section className="py-12 bg-white" data-testid="competitor-offers-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-2">Switching From a Specific Company?</h2>
          <p className="text-gray-600 mb-8">See exactly how much you'll save when you switch from each competitor to Credlocity.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {competitors.map((comp, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 hover:border-primary-blue hover:shadow-lg transition-all p-5" data-testid={`switch-card-${comp.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Switching from {comp.name}</h3>
                  <ArrowRightLeft className="w-4 h-4 text-primary-blue" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Their Price</p>
                    <p className="text-lg font-bold text-red-600 line-through">{comp.price}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Your Credlocity Price</p>
                    <p className="text-lg font-bold text-green-700">{comp.beaten}</p>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-red-700"><strong>Potential illegal fee:</strong> {comp.illegal}</p>
                </div>
                <Link to={comp.path} className="inline-flex items-center text-primary-blue hover:underline text-sm font-medium">
                  Read Full {comp.name} Comparison <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why the Fee May Be Illegal */}
      <section className="py-12 bg-red-50" data-testid="illegal-fees-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-red-800 mb-6">Was Your Fee Illegal? Know Your Rights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-600" /> Telemarketing Sales Rule (TSR)
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Under the TSR, credit repair companies <strong>cannot charge you any fee</strong> if you were solicited or
                enrolled over the phone — until the promised services have been <strong>fully performed</strong>.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                If your company called you, enrolled you over the phone, or charged your card before completing all
                disputed items, they may have violated federal law.
              </p>
              <Link to="/tsr-compliance" className="inline-flex items-center text-primary-blue hover:underline text-sm font-medium mt-3">
                Learn More About TSR <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" /> Credit Repair Organizations Act (CROA)
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                CROA requires credit repair companies to provide a <strong>written contract</strong> before performing any
                services, and prohibits charging fees <strong>before services are fully rendered</strong>.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                If you were never given a written contract, or were charged a "setup fee," "first work fee," or "enrollment fee"
                before disputes were completed, that's a potential CROA violation.
              </p>
              <Link to="/fcra-guide" className="inline-flex items-center text-primary-blue hover:underline text-sm font-medium mt-3">
                Learn More About Consumer Rights <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-xl border border-red-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Common Illegal Fee Patterns We've Seen</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Setup fees or enrollment fees charged at signup",
                "First work fees charged within days of enrollment",
                "$195+ initial work fees before any disputes filed",
                "Phone enrollment with immediate card charges",
                "Continued billing after cancellation requests",
                "Non-refundable flat fees with no guaranteed work",
                "Charges before any items are actually removed",
                "Late fees of $4.95–$19.95 for payment declines"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Credlocity After the Switch */}
      <section className="py-12 bg-primary-blue text-white" data-testid="why-credlocity-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold mb-8 text-center">What You Get When You Switch to Credlocity</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, title: "5% Lower Price + Free First Month", desc: "Your rate is 5% below what you were paying, and your first month is completely free with our 30-day trial." },
              { icon: Shield, title: "180-Day Money-Back Guarantee", desc: "If you're not satisfied within 180 days, you get a full refund. No other company offers this level of protection." },
              { icon: TrendingUp, title: "AI-Powered Metro2 Analysis", desc: "Our proprietary technology identifies errors that manual reviews miss — including Metro2 compliance violations and FCRA breaches." },
              { icon: BadgeCheck, title: "A+ BBB, Zero Complaints", desc: "16+ years, 79,000+ clients, not a single BBB complaint. That's the Credlocity track record." },
              { icon: Users, title: "Dedicated U.S.-Based Specialist", desc: "Monthly one-on-one credit reviews with your personal specialist — included in your rate, not an add-on." },
              { icon: Scale, title: "100% Legal Compliance", desc: "Fully TSR, CROA, FCRA, and FDCPA compliant. We never charge before work is done. All services initiated online." }
            ].map((item, i) => (
              <div key={i} className="text-center" data-testid={`benefit-${i}`}>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Switching Process */}
      <section className="py-12 bg-white" data-testid="process-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8 text-center">How to Switch in 3 Simple Steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Cancel Your Current Service", desc: "Contact your current credit repair company and cancel. Document any difficulty — cancellation issues are themselves a red flag and may support your case for fee recovery.", link: "/credit-repair-scams", linkLabel: "Spotting Red Flags" },
              { step: "2", title: "Sign Up for Credlocity's Free Trial", desc: "Start your 30-day free trial with Credlocity. No credit card charged for 30 days. We'll immediately begin analyzing your credit reports with our AI-powered Metro2 technology.", link: "/30-day-free-trial", linkLabel: "Free Trial Details" },
              { step: "3", title: "Submit Your Switching Documents", desc: "Provide your bank statement, enrollment details, and service agreement from the other company. We'll calculate your 5% price-beat rate and assess any illegal fee recovery options.", link: "/intake", linkLabel: "Get Started" }
            ].map((item, i) => (
              <div key={i} className="text-center" data-testid={`process-step-${i}`}>
                <div className="w-14 h-14 bg-primary-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.desc}</p>
                <Link to={item.link} className="text-primary-blue hover:underline text-xs font-medium inline-flex items-center gap-1">
                  {item.linkLabel} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50" data-testid="switch-faq-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8">Frequently Asked Questions About Switching</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6" data-testid={`switch-faq-${i}`}>
                <h3 className="font-semibold text-gray-900 mb-3 text-base">{faq.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Links */}
      <section className="py-10 bg-white" data-testid="crosslinks-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-xl font-bold text-primary-blue mb-6">Compare Credlocity to Your Current Company</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {competitors.map((c, i) => (
              <Link key={i} to={c.path} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-blue hover:shadow-md transition-all text-center group" data-testid={`crosslink-${c.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <p className="text-xs text-gray-500 mb-1">vs</p>
                <p className="text-xs font-semibold text-gray-900 group-hover:text-primary-blue">{c.name}</p>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6 pt-6 border-t">
            {[
              { to: "/credit-repair-reviews", label: "All Company Reviews" },
              { to: "/how-it-works", label: "How Credlocity Works" },
              { to: "/success-stories", label: "Client Success Stories" },
              { to: "/30-day-free-trial", label: "Free Trial Details" },
              { to: "/credit-scores", label: "Understanding Credit Scores" },
              { to: "/free-letters", label: "Free Dispute Letters" },
              { to: "/education-hub", label: "Credit Education Hub" },
              { to: "/intake", label: "Start Your Repair" }
            ].map((link, i) => (
              <Link key={i} to={link.to} className="text-xs text-primary-blue hover:underline flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-primary text-white text-center" data-testid="switch-final-cta">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Stop Overpaying. Start Getting Results.</h2>
          <p className="text-lg text-gray-200 mb-4 leading-relaxed">
            You deserve a credit repair company that's transparent, compliant, and actually gets results.
            Switch to Credlocity today — we'll beat your current price by 5%, give you 30 days free,
            and if your previous company broke the law, we'll help you get your money back.
          </p>
          <p className="text-green-300 font-semibold mb-8">A+ BBB | Zero Complaints | 236-Point Average Score Increase</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10" asChild>
              <TrialButton variant="link" className="inline-flex items-center">
                Switch Now — First Month Free <ArrowRight className="w-5 h-5 ml-2" />
              </TrialButton>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/credit-repair-reviews">Compare All Companies</Link>
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            All services initiated through our secure online platform in compliance with federal law.{' '}
            <Link to="/tsr-compliance" className="underline hover:text-white">TSR Compliance</Link> |{' '}
            <Link to="/fcra-guide" className="underline hover:text-white">FCRA Guide</Link> |{' '}
            <Link to="/free-letters" className="underline hover:text-white">Free Dispute Letters</Link>
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 bg-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> The 5% price-beat guarantee requires verification of your current credit repair charges via a
            bank or credit card statement dated within the last 60 days, a description of your enrollment circumstances, and a copy of
            your service agreement. The beaten price applies to your monthly Credlocity rate after the 30-day free trial period. Illegal
            fee recovery assistance is provided based on documented violations of the Telemarketing Sales Rule (TSR) and/or Credit
            Repair Organizations Act (CROA). Credlocity does not provide legal advice; we assist with documentation and filing complaints
            with appropriate federal agencies. Results of fee recovery efforts vary. Competitor pricing information is based on publicly
            available data and may change. All information current as of 2026.
          </p>
        </div>
      </section>
    </>
  );
};

export default SwitchAndSave;
