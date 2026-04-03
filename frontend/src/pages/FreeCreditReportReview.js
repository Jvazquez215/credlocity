import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ArrowRight, CheckCircle2, FileSearch, ClipboardList, Phone,
  Shield, Star, Clock, ChevronDown, ChevronUp, BarChart3,
  FileText, Users, Target, Award, ExternalLink, Zap
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { TrialButton, ConsultButton } from '../components/LeadButtons';

const SCOREFUSION_URL = 'https://credlocity.scorexer.com/scorefusion/scorefusion-signup.jsp?code=50a153cc-c';

const WHATS_INCLUDED = [
  {
    icon: FileSearch,
    title: 'Complete Credit Report Review',
    desc: 'Our certified credit specialists analyze all three bureaus — Equifax, Experian, and TransUnion — line by line to identify errors, inaccuracies, outdated accounts, and items that can be legally disputed.',
    color: 'bg-blue-500'
  },
  {
    icon: ClipboardList,
    title: 'Custom Credit Action Plan',
    desc: 'A personalized, step-by-step roadmap tailored to YOUR credit profile. We prioritize which items to dispute first, which accounts to address, and strategies to maximize your score improvement.',
    color: 'bg-emerald-500'
  },
  {
    icon: BarChart3,
    title: 'Credit Audit Report',
    desc: 'A detailed written report documenting every negative item, its impact on your score, the legal basis for disputing it, and our professional recommendation for each account.',
    color: 'bg-purple-500'
  },
  {
    icon: Phone,
    title: '30-Minute Q&A Session',
    desc: 'Pick our brain. Ask anything about your credit, your rights, dispute strategies, or how to reach your goals. No sales pitch — just real answers from real credit professionals.',
    color: 'bg-amber-500'
  }
];

const STEPS = [
  { step: 1, title: 'Order Your Credit Report', desc: 'Get your comprehensive 3-bureau credit report through ScoreFusion for $49.95. This gives us the detailed data we need to perform your review.', icon: FileText },
  { step: 2, title: 'We Review Everything', desc: 'Our team performs a thorough line-by-line analysis of all three bureaus, identifying every error, inaccuracy, and disputable item on your report.', icon: FileSearch },
  { step: 3, title: 'Receive Your Action Plan & Audit', desc: 'We deliver your Custom Credit Action Plan and Credit Audit Report — a complete roadmap showing exactly what to dispute and how.', icon: ClipboardList },
  { step: 4, title: '30-Minute Strategy Call', desc: 'Hop on a call with our team. Ask questions, get clarity on your report, and learn what steps will have the biggest impact on your score.', icon: Phone }
];

const FAQS = [
  { q: 'Why do I need to order a credit report?', a: 'To perform an accurate review, we need to see exactly what the bureaus are reporting. The ScoreFusion report pulls all three bureaus (Equifax, Experian, TransUnion) with full details — this is the same data creditors and lenders see. The $49.95 covers the cost of pulling your report.' },
  { q: 'What is a Credit Action Plan?', a: 'Your Credit Action Plan is a prioritized, step-by-step strategy document customized to your unique credit profile. It identifies which negative items to dispute first, suggests account management strategies, and outlines a timeline for expected improvements. Think of it as your personal credit repair blueprint.' },
  { q: 'What does the Credit Audit Report include?', a: 'The Credit Audit Report is a detailed document that lists every negative item on your credit report, explains how each item affects your score, identifies the legal basis for disputing it (FCRA, FDCPA, etc.), and provides our professional recommendation for each account — dispute, negotiate, pay, or wait.' },
  { q: 'How long does the review take?', a: 'Once we receive your credit report, our team typically completes your review within 2-3 business days. You will receive both your Credit Action Plan and Credit Audit Report, followed by scheduling your 30-minute Q&A call.' },
  { q: 'Is the 30-minute call a sales pitch?', a: 'Absolutely not. The 30-minute session is YOUR time. Ask us anything — about specific items on your report, your legal rights, dispute strategies, credit-building tactics, or anything else. If you want to learn about our full credit repair services afterward, we are happy to discuss, but there is zero pressure.' },
  { q: 'Can I dispute items myself after receiving the plan?', a: 'Yes! Your Credit Action Plan gives you everything you need to dispute items on your own. We also offer free dispute letter templates at our Free Letters page that you can customize and send. Of course, if you would like professional help, we offer full-service credit repair as well.' },
  { q: 'What if I already have my credit report?', a: 'If you already have a recent 3-bureau credit report (within the last 30 days), contact us and we may be able to work with that. However, the ScoreFusion report format provides the most detailed data for our analysis.' },
];

const TESTIMONIALS = [
  { name: 'Marcus T.', location: 'Philadelphia, PA', text: 'The action plan was a game-changer. I knew exactly what to dispute and in what order. My score went up 87 points in 4 months.', score: '+87 points' },
  { name: 'Destiny R.', location: 'Atlanta, GA', text: 'I thought my credit was beyond repair. The audit report showed me 11 items that could be legally disputed. Worth every penny.', score: '11 items removed' },
  { name: 'Carlos M.', location: 'New York, NY', text: 'The 30-minute call alone was worth it. I learned more about my rights in that call than years of Googling.', score: 'Qualified for mortgage' }
];

const FreeCreditReportReview = () => {
  const [openFaq, setOpenFaq] = useState(null);

  useSEO({
    title: 'Free Credit Report Review + Custom Action Plan | Credlocity',
    description: 'Get a free professional credit report review, custom credit action plan, credit audit report, and 30-minute Q&A session. Order your 3-bureau report and let our experts analyze it.',
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Free Credit Report Review + Custom Action Plan | Credlocity</title>
        <meta name="description" content="Get a free professional credit report review, custom credit action plan, credit audit report, and 30-minute Q&A session from Credlocity's certified credit specialists." />
        <link rel="canonical" href="https://credlocity.com/free-credit-report-review" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Free Credit Report Review",
          "provider": { "@type": "Organization", "name": "Credlocity" },
          "description": "Professional credit report review with custom action plan, credit audit report, and 30-minute Q&A consultation.",
          "offers": { "@type": "Offer", "price": "49.95", "priceCurrency": "USD", "description": "Includes 3-bureau credit report via ScoreFusion" }
        })}</script>
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section className="relative bg-primary-blue text-white overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.3),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/5 to-transparent" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Professional Review + Custom Action Plan</span>
              </div>
              <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="page-title">
                Free Credit Report Review
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Get a line-by-line expert review of your credit report, a <strong>Custom Credit Action Plan</strong>, 
                a <strong>Credit Audit Report</strong>, and <strong>30 minutes</strong> to pick our brain — all included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8 py-6" asChild>
                  <a href={SCOREFUSION_URL} target="_blank" rel="noopener noreferrer" data-testid="hero-cta-order">
                    Order Your Report — $49.95 <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <ConsultButton size="lg" className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/30 text-lg px-8 py-6" data-testid="hero-cta-consult">
                  Have Questions? Talk to Us
                </ConsultButton>
              </div>
              <p className="text-blue-200 text-sm mt-4">
                $49.95 covers your 3-bureau credit report via ScoreFusion. Everything else is free.
              </p>
            </div>
            <div className="hidden md:flex flex-col gap-4">
              {WHATS_INCLUDED.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all">
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-blue-200 text-xs">Included free</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT'S INCLUDED (DETAILED) ═══ */}
      <section className="py-20 bg-gray-50" data-testid="whats-included">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-3">Everything You Get</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              For $49.95 (the cost of your 3-bureau credit report), you receive all four of these services — completely free.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {WHATS_INCLUDED.map((item, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-xl transition-shadow" data-testid={`included-card-${i}`}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 bg-white" data-testid="how-it-works">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-3">How It Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Four simple steps to getting clarity on your credit and a plan to fix it.</p>
          </div>
          <div className="space-y-0">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-6 md:gap-8" data-testid={`step-${s.step}`}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {s.step}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-0.5 h-full bg-blue-200 my-2" />}
                </div>
                <div className="pb-12">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-lg">{s.desc}</p>
                  {s.step === 1 && (
                    <Button className="mt-4 bg-secondary-green hover:bg-secondary-light text-white" asChild>
                      <a href={SCOREFUSION_URL} target="_blank" rel="noopener noreferrer" data-testid="step1-cta">
                        Order ScoreFusion Report <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VALUE COMPARISON ═══ */}
      <section className="py-20 bg-gray-50" data-testid="value-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-3">The Value You Are Getting</h2>
            <p className="text-gray-600">Elsewhere, these services cost hundreds. With Credlocity, they are included.</p>
          </div>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-primary-blue text-white p-6 text-center">
                <p className="text-sm uppercase tracking-wide text-blue-200 mb-1">Your Total Cost</p>
                <p className="text-5xl font-bold">$49.95</p>
                <p className="text-blue-200 text-sm mt-1">3-Bureau Credit Report via ScoreFusion</p>
              </div>
              <div className="p-6 md:p-8">
                <div className="space-y-4">
                  {[
                    { item: '3-Bureau Credit Report (Equifax, Experian, TransUnion)', value: '$49.95', tag: 'Included' },
                    { item: 'Professional Credit Report Review', value: '$150+', tag: 'FREE' },
                    { item: 'Custom Credit Action Plan', value: '$200+', tag: 'FREE' },
                    { item: 'Credit Audit Report', value: '$100+', tag: 'FREE' },
                    { item: '30-Minute Expert Q&A Session', value: '$75+', tag: 'FREE' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0" />
                        <span className="text-gray-800 font-medium text-sm md:text-base">{row.item}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-gray-400 line-through text-sm">{i > 0 ? row.value : ''}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{row.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                  <p className="text-green-800 font-semibold">Total value: <span className="line-through text-gray-400">$575+</span> — You pay only <span className="text-green-700 text-xl font-bold">$49.95</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 bg-white" data-testid="testimonials-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-10 text-center">Real Results From Real People</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-0 shadow-md" data-testid={`testimonial-${i}`}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.location}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">{t.score}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CREDLOCITY ═══ */}
      <section className="py-16 bg-gray-50" data-testid="why-credlocity">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Why Trust Credlocity?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'FCRA Certified', desc: 'Our team knows federal credit law inside and out.' },
              { icon: Award, title: 'No Upfront Fees', desc: 'We never charge before services are performed — it is the law.' },
              { icon: Users, title: 'Real Humans', desc: 'No bots, no AI scripts. Real specialists review your report.' },
              { icon: Target, title: 'Proven Results', desc: 'Thousands of items disputed and removed across the country.' }
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary-blue" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQs ═══ */}
      <section className="py-20 bg-white" data-testid="faq-section">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden" data-testid={`faq-${i}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Helmet>
            <script type="application/ld+json">{JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": FAQS.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
              }))
            })}</script>
          </Helmet>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 bg-primary-blue text-white" data-testid="final-cta">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Credit?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Order your 3-bureau credit report and let our experts build your personalized action plan. 
            Knowledge is power — and it starts with knowing exactly what is on your report.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10 py-6" asChild>
              <a href={SCOREFUSION_URL} target="_blank" rel="noopener noreferrer" data-testid="final-cta-order">
                Order Your Report — $49.95 <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <ConsultButton size="lg" className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-lg px-10 py-6" data-testid="final-cta-consult">
              Book Free Consultation
            </ConsultButton>
          </div>
          <p className="text-blue-300 text-sm mt-6">
            Already have a recent credit report? <Link to="/contact" className="underline hover:text-white">Contact us</Link> and we will work with it.
          </p>
        </div>
      </section>
    </div>
  );
};

export default FreeCreditReportReview;
