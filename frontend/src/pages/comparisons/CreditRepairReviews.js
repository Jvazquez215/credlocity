import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, CheckCircle2, XCircle, Star, Shield, Award, Clock, DollarSign, Users, TrendingUp, AlertTriangle, Scale, Zap, BadgeCheck } from 'lucide-react';
import { TrialButton } from '../../components/LeadButtons';

const companies = [
  {
    name: "Credlocity",
    slug: null,
    highlight: true,
    price: "$0 first month, $179.95/mo",
    trial: "30 days free",
    bbb: "A+",
    complaints: "0",
    yelp: "5.0",
    trustpilot: "5.0",
    guarantee: "180-day",
    years: "16+",
    ai: true,
    tsr: true,
    tracker: true,
    upfront: false,
    avgIncrease: "236 pts"
  },
  {
    name: "Lexington Law",
    slug: "/vs-lexington-law",
    price: "$119.95-$139.95/mo",
    trial: "None",
    bbb: "Not Accredited (D-)",
    complaints: "700+",
    yelp: "2.0",
    trustpilot: "2.4",
    guarantee: "None",
    years: "20",
    ai: false,
    tsr: false,
    tracker: false,
    upfront: true,
    avgIncrease: "N/A",
    issue: "CFPB enforcement action for illegal advance fees. Not BBB accredited with 700+ complaints in 3 years. Charges late fees of $4.95-$19.95."
  },
  {
    name: "CreditRepair.com",
    slug: "/vs-creditrepair",
    price: "$69.95-$119.95/mo",
    trial: "None",
    bbb: "D",
    complaints: "800+",
    yelp: "2.0",
    trustpilot: "1.5",
    guarantee: "Limited",
    years: "14",
    ai: false,
    tsr: false,
    tracker: true,
    upfront: true,
    avgIncrease: "~40 pts",
    issue: "D BBB rating. 1.5/5 Trustpilot score from 630+ reviews. FTC scrutiny for deceptive advertising. Charges setup fees before work begins."
  },
  {
    name: "The Credit People",
    slug: "/vs-credit-people",
    price: "$99-$119/mo or $419 flat",
    trial: "7 days",
    bbb: "C+ (Not Accredited)",
    complaints: "22+",
    yelp: "3.0",
    trustpilot: "3.0",
    guarantee: "Satisfaction",
    years: "17",
    ai: false,
    tsr: true,
    tracker: false,
    upfront: false,
    avgIncrease: "N/A",
    issue: "C+ BBB rating, not accredited. Flat fee ($419) is non-refundable. BBB reviews consistently report 1-star ratings for no results."
  },
  {
    name: "The Credit Pros",
    slug: "/vs-credit-pros",
    price: "$129-$149/mo + setup",
    trial: "None",
    bbb: "Not Accredited",
    complaints: "Significant",
    yelp: "2.5",
    trustpilot: "4.9",
    guarantee: "60-day",
    years: "17",
    ai: true,
    tsr: true,
    tracker: true,
    upfront: true,
    avgIncrease: "N/A",
    issue: "Highest pricing in industry ($129-$149/mo + equal setup fee). Widespread cancellation complaints — consumers report being charged after canceling."
  },
  {
    name: "Credit Saint",
    slug: "/vs-credit-saint",
    price: "$79.99-$139.99/mo + $195",
    trial: "None",
    bbb: "A+ (Accredited)",
    complaints: "847 total",
    yelp: "2.0",
    trustpilot: "4.6",
    guarantee: "90-day",
    years: "19",
    ai: false,
    tsr: true,
    tracker: false,
    upfront: true,
    avgIncrease: "N/A",
    issue: "$195 initial work fee on ALL plans. 847 documented complaints. 90-day guarantee frequently denied using 'services provided' clause."
  },
  {
    name: "White Jacobs",
    slug: "/vs-white-jacobs",
    price: "Not disclosed",
    trial: "None",
    bbb: "D+ (Not Accredited)",
    complaints: "22+",
    yelp: "3.0",
    trustpilot: "N/A",
    guarantee: "Disputed",
    years: "13",
    ai: false,
    tsr: true,
    tracker: false,
    upfront: true,
    avgIncrease: "70% removal claimed",
    issue: "Pricing not publicly disclosed. D+ BBB rating. Complaints cite paying $1,500-$3,000+ with no results. Limited independent reviews."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is the best credit repair company in 2026?", "acceptedAnswer": { "@type": "Answer", "text": "Based on BBB rating (A+), complaint history (zero since 2008), consumer ratings (5.0 stars), money-back guarantee (180 days), and free trial (30 days), Credlocity is the top-rated credit repair company in 2026. They also use AI-powered Metro2 analysis and have served 79,000+ clients." }},
    { "@type": "Question", "name": "How much does credit repair cost?", "acceptedAnswer": { "@type": "Answer", "text": "Credit repair typically costs $69.95 to $179.95 per month. Many companies also charge setup fees of $129-$195. Credlocity charges $179.95/month but includes a 30-day free trial (no charges for first month), no setup fee, and a 180-day money-back guarantee — making it the best value for risk-averse consumers." }},
    { "@type": "Question", "name": "Is credit repair a scam?", "acceptedAnswer": { "@type": "Answer", "text": "Legitimate credit repair is not a scam. It's protected under the Credit Repair Organizations Act (CROA). However, some companies violate federal law by charging upfront fees or making false promises. Look for companies with A+ BBB ratings, no complaints, free trials, and money-back guarantees. Credlocity meets all these criteria." }},
    { "@type": "Question", "name": "Which credit repair company has the best BBB rating?", "acceptedAnswer": { "@type": "Answer", "text": "Credlocity holds an A+ BBB rating with zero complaints since 2008. Credit Saint also has an A+ BBB rating but has 847 documented complaints. Other companies like Lexington Law (not accredited), CreditRepair.com (D rating), and White Jacobs (D+ rating) fall far behind." }},
    { "@type": "Question", "name": "Can I repair my credit for free?", "acceptedAnswer": { "@type": "Answer", "text": "You can dispute errors on your credit report for free directly with the bureaus. However, professional credit repair companies like Credlocity use advanced strategies including Metro2 compliance analysis, FCRA Section 611 disputes, and FDCPA validation — techniques that typically achieve better results than self-disputes. Credlocity offers a 30-day free trial so you can try professional repair at no cost." }}
  ]
};

const CreditRepairReviews = () => {
  return (
    <>
      <Helmet>
        <title>Best Credit Repair Companies 2026 | Reviews & Comparison | Credlocity</title>
        <meta name="description" content="Compare the top 7 credit repair companies in 2026. Unbiased reviews of Credlocity, Lexington Law, CreditRepair.com, Credit Saint, The Credit Pros, The Credit People, and White Jacobs. See BBB ratings, pricing, complaints, and results." />
        <meta property="og:title" content="Best Credit Repair Companies 2026 | Side-by-Side Reviews" />
        <meta property="og:description" content="Honest comparison of 7 credit repair companies. See who has the best BBB rating, lowest complaints, strongest guarantee, and real results." />
        <link rel="canonical" href="https://www.credlocity.com/credit-repair-reviews" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-16 md:py-24" data-testid="reviews-hero">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <p className="text-sm uppercase tracking-wider text-green-300 mb-3 font-medium">Updated for 2026</p>
          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" data-testid="reviews-h1">
            Best Credit Repair Companies 2026
          </h1>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
            An honest, data-driven comparison of the top 7 credit repair companies. We analyzed BBB ratings, CFPB complaints,
            Trustpilot reviews, pricing, guarantees, and real client outcomes. Here's what we found.
          </p>
        </div>
      </section>

      {/* What to Look For */}
      <section className="py-10 bg-blue-50 border-b" data-testid="criteria-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-primary-blue mb-6 text-center">What to Look for in a Credit Repair Company</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "No Upfront Fees", desc: "CROA prohibits charging before work is done — yet many companies still do it" },
              { icon: Award, label: "A+ BBB, Zero Complaints", desc: "Rating alone isn't enough — check complaint volume too" },
              { icon: Clock, label: "Free Trial (30+ Days)", desc: "A real trial proves confidence in their results" },
              { icon: DollarSign, label: "Money-Back Guarantee", desc: "180-day guarantee is the gold standard in credit repair" }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border">
                <item.icon className="w-7 h-7 text-primary-blue mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.label}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master Comparison Table */}
      <section className="py-12 bg-white" data-testid="master-table-section">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-2 text-center">Side-by-Side Comparison: All 7 Companies</h2>
          <p className="text-gray-600 text-center mb-8">Data sourced from BBB, CFPB, Trustpilot, Yelp, and each company's official website.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[1100px]" data-testid="master-comparison-table">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-3 font-semibold text-gray-900 w-32">Company</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Monthly Price</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Free Trial</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">BBB Grade</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Complaints</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Trustpilot</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Yelp</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Guarantee</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">AI Tech</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">No Upfront Fee</th>
                  <th className="py-4 px-2 font-semibold text-gray-900 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((co, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${co.highlight ? 'bg-green-50 font-medium' : 'hover:bg-gray-50'}`} data-testid={`company-row-${co.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <td className="py-4 px-3">
                      <span className={co.highlight ? 'text-green-700 font-bold' : 'text-gray-900 font-medium'}>{co.name}</span>
                      {co.highlight && <span className="block text-xs text-green-600 font-medium">#1 Rated</span>}
                    </td>
                    <td className="py-4 px-2 text-center text-xs">{co.price}</td>
                    <td className="py-4 px-2 text-center">{co.trial === "None" ? <span className="text-red-500 text-xs font-medium">None</span> : <span className="text-green-600 font-medium text-xs">{co.trial}</span>}</td>
                    <td className="py-4 px-2 text-center text-xs">{co.bbb.includes("A+") ? <span className="text-green-600 font-bold">{co.bbb}</span> : <span className="text-red-500">{co.bbb}</span>}</td>
                    <td className="py-4 px-2 text-center text-xs">{co.complaints === "0" ? <span className="text-green-600 font-bold">0</span> : <span className="text-red-500">{co.complaints}</span>}</td>
                    <td className="py-4 px-2 text-center text-xs">{parseFloat(co.trustpilot) >= 4.5 ? <span className="text-green-600 font-bold">{co.trustpilot}</span> : co.trustpilot}</td>
                    <td className="py-4 px-2 text-center text-xs">{parseFloat(co.yelp) >= 4.5 ? <span className="text-green-600 font-bold">{co.yelp}</span> : co.yelp}</td>
                    <td className="py-4 px-2 text-center text-xs">{co.guarantee === "180-day" ? <span className="text-green-600 font-bold">{co.guarantee}</span> : co.guarantee}</td>
                    <td className="py-4 px-2 text-center">{co.ai ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                    <td className="py-4 px-2 text-center">{!co.upfront ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                    <td className="py-4 px-2 text-center">
                      {co.slug ? (
                        <Link to={co.slug} className="text-primary-blue hover:underline text-xs font-semibold">Full Review</Link>
                      ) : (
                        <span className="text-xs text-green-600 font-bold">Our Pick</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Switch & Save Banner */}
      <section className="py-10 bg-gradient-to-r from-green-600 to-green-700 text-white" data-testid="hub-switch-banner">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-cinzel text-xl md:text-2xl font-bold mb-3">Currently Paying Another Company? We'll Beat Their Price by 5%</h2>
          <p className="text-sm text-green-100 leading-relaxed max-w-2xl mx-auto mb-2">
            Show us your recent bank statement, enrollment details, and service agreement — and Credlocity
            will beat your current rate by 5%, guaranteed. Plus, start with a 30-day free trial.
          </p>
          <p className="text-sm text-green-200 mb-6">
            If they charged you illegal advance fees, we'll help you fight for a refund.
          </p>
          <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-bold" asChild>
            <Link to="/switch" data-testid="hub-switch-cta">Learn About Switch & Save <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>

      {/* Individual Company Breakdowns */}
      <section className="py-12 bg-gray-50" data-testid="breakdowns-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8">Detailed Company Breakdowns</h2>
          {companies.filter(c => c.slug).map((co, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 mb-6 last:mb-0 hover:shadow-md transition-shadow" data-testid={`breakdown-${co.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="font-cinzel text-xl font-bold text-gray-900">{co.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">BBB: <strong>{co.bbb.split('(')[0].trim()}</strong></span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Trustpilot: <strong>{co.trustpilot}</strong></span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Yelp: <strong>{co.yelp}</strong></span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{co.years} years</span>
                </div>
              </div>
              {co.issue && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{co.issue}</span>
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Monthly Price</div><div className="font-medium text-xs mt-1">{co.price}</div></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Free Trial</div><div className={`font-medium text-xs mt-1 ${co.trial === "None" ? "text-red-500" : "text-green-600"}`}>{co.trial}</div></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Guarantee</div><div className="font-medium text-xs mt-1">{co.guarantee}</div></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Complaints</div><div className={`font-medium text-xs mt-1 ${co.complaints === "0" ? "text-green-600" : "text-red-500"}`}>{co.complaints}</div></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Avg. Increase</div><div className="font-medium text-xs mt-1">{co.avgIncrease}</div></div>
              </div>
              <Link to={co.slug} className="inline-flex items-center text-primary-blue hover:underline font-semibold text-sm">
                Read Full Credlocity vs. {co.name} Comparison <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Credlocity Wins */}
      <section className="py-12 bg-primary-blue text-white" data-testid="why-credlocity-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold mb-8 text-center">Why Credlocity Is Rated #1</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, title: "236-Point Average Score Increase", desc: "Our proprietary AI-powered Metro2 compliance analysis identifies errors that manual reviews miss — including FCRA violations, FDCPA breaches, and Metro2 formatting errors. This technology-first approach consistently delivers the highest removal rates in the industry." },
              { icon: Shield, title: "Zero BBB Complaints Since 2008", desc: "While Lexington Law has 700+, CreditRepair.com has 800+, and Credit Saint has 847 — Credlocity has maintained a perfect BBB record across 16+ years and 79,000+ clients. That's not marketing — that's accountability." },
              { icon: DollarSign, title: "30-Day Trial + 180-Day Guarantee", desc: "The longest free trial and strongest guarantee in the credit repair industry. No other company offers both. You literally cannot lose money trying Credlocity. Start today, pay nothing for 30 days." },
              { icon: Scale, title: "100% Legally Compliant", desc: "Fully TSR, CROA, FCRA, and FDCPA compliant. All services initiated online — never over the phone. While competitors face CFPB and FTC enforcement actions, Credlocity has a spotless regulatory record." },
              { icon: Users, title: "Community-Driven Ownership", desc: "Hispanic-owned, Women-owned, LGBTQAI+-owned. Founded in Philadelphia by CEO Joeziel Vazquez, Credlocity understands the unique credit challenges facing diverse communities. Bilingual support available." },
              { icon: Zap, title: "Monthly 1-on-1 Credit Reviews", desc: "Every client gets a dedicated U.S.-based credit specialist and monthly one-on-one reviews — included in your monthly fee, never an add-on. Most competitors charge extra or don't offer this at all." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50" data-testid="faq-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8">Frequently Asked Questions About Credit Repair</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6" data-testid={`hub-faq-${i}`}>
                <h3 className="font-semibold text-gray-900 mb-3 text-base">{item.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-xl font-bold text-primary-blue mb-6">Related Credit Education Resources</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { to: "/credit-repair-scams", label: "How to Spot Credit Repair Scams" },
              { to: "/credit-scores", label: "Understanding Credit Scores" },
              { to: "/fcra-guide", label: "Your FCRA Rights" },
              { to: "/how-it-works", label: "How Credlocity Works" },
              { to: "/success-stories", label: "Client Success Stories" },
              { to: "/30-day-free-trial", label: "Free Trial Details" },
              { to: "/free-letters", label: "Free Dispute Letter Templates" },
              { to: "/education-hub", label: "Credit Education Hub" }
            ].map((link, i) => (
              <Link key={i} to={link.to} className="p-3 bg-gray-50 rounded-lg border hover:border-primary-blue hover:shadow-sm transition-all text-xs font-medium text-gray-700 hover:text-primary-blue flex items-center gap-2">
                <ArrowRight className="w-3 h-3 flex-shrink-0" /> {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary text-white text-center" data-testid="reviews-cta">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="text-lg text-gray-200 mb-4 leading-relaxed">
            Join 79,000+ clients who chose Credlocity over the competition. A+ BBB, zero complaints,
            30-day free trial, 180-day guarantee, and AI-powered technology.
          </p>
          <p className="text-green-300 font-semibold mb-8">Average credit score increase: 236 points</p>
          <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10" asChild>
            <TrialButton variant="link" className="inline-flex items-center">
              Start Free Trial — $0 Today <ArrowRight className="w-5 h-5 ml-2" />
            </TrialButton>
          </Button>
          <p className="text-xs text-gray-400 mt-6">In accordance with federal regulations, all services are initiated online. <Link to="/tsr-compliance" className="underline hover:text-white">TSR Compliance</Link></p>
        </div>
      </section>
    </>
  );
};

export default CreditRepairReviews;
