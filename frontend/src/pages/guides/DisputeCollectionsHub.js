import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Scale,
  FileText, AlertTriangle, Shield, Target, XCircle, Phone,
  Building2, Clock, DollarSign, Search, Send, BookOpen, Zap,
  ChevronRight
} from 'lucide-react';
import useSEO from '../../hooks/useSEO';
import { TrialButton } from '../../components/LeadButtons';
import { AGENCY_LIST } from './collectionAgencyData';

const DISPUTE_METHODS = [
  {
    title: 'Debt Validation Letter (FDCPA § 809)',
    desc: 'Within 30 days of a collector\'s first contact, you have the right to demand written verification of the debt. The collector must stop all collection activity until they provide: the amount of the debt, the name of the original creditor, and proof that you actually owe it.',
    best: 'First step for ANY collection account. Use this before any other dispute method.',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    title: 'Credit Bureau Dispute (FCRA § 611)',
    desc: 'File a dispute directly with Equifax, Experian, and TransUnion. The bureau must investigate within 30 days by contacting the data furnisher (the collector). If the collector cannot verify the account, it must be deleted from your report.',
    best: 'Best when the collector is reporting inaccurate information (wrong balance, wrong dates, wrong account status).',
    icon: Search,
    color: 'bg-green-500'
  },
  {
    title: '609 Disclosure Request (FCRA § 609)',
    desc: 'Demand the credit bureau provide verifiable proof that the information on your report is accurate and belongs to you. This puts the burden on the bureau to produce original documentation — which they often cannot do for collection accounts.',
    best: 'Effective for older debts, purchased debts, and accounts where the collector may lack documentation.',
    icon: BookOpen,
    color: 'bg-purple-500'
  },
  {
    title: 'Direct Furnisher Dispute (FCRA § 623)',
    desc: 'After disputing with the bureau, go directly to the collection agency. Under § 623, the furnisher must investigate your dispute and correct or delete inaccurate information. If they fail to investigate, that is a violation.',
    best: 'Use this as a follow-up after a bureau dispute is verified. Escalates pressure directly on the collector.',
    icon: Send,
    color: 'bg-amber-500'
  },
  {
    title: 'Pay-for-Delete Negotiation',
    desc: 'Negotiate with the collector to delete the account from your credit report in exchange for payment (full or settled). This is NOT guaranteed by law — it is a business negotiation. Get any agreement IN WRITING before paying.',
    best: 'When you owe the debt and just want it off your report. More effective with original creditors than debt buyers.',
    icon: DollarSign,
    color: 'bg-red-500'
  },
  {
    title: 'CFPB & AG Complaints',
    desc: 'File official complaints with the Consumer Financial Protection Bureau (CFPB) and your state Attorney General. These agencies have enforcement power and companies MUST respond to CFPB complaints within 15 days.',
    best: 'When the collector is violating the FDCPA, refuses to validate, or continues reporting disputed information.',
    icon: Shield,
    color: 'bg-indigo-500'
  }
];

const TIMELINE_ITEMS = [
  { period: '0-30 Days', title: 'Immediate Action', steps: ['Pull all 3 credit reports', 'Identify collection accounts and dates', 'Send debt validation letters to each collector (certified mail)', 'Document everything'] },
  { period: '30-60 Days', title: 'Bureau Disputes', steps: ['File disputes with all 3 credit bureaus', 'Send 609 disclosure requests', 'Follow up on validation letters (did they respond in time?)', 'File CFPB complaint if collector failed to validate'] },
  { period: '60-90 Days', title: 'Escalation', steps: ['Send § 623 direct furnisher disputes', 'Review bureau investigation results', 'Send follow-up disputes with new evidence', 'Negotiate pay-for-delete if debt is valid and you want to settle'] },
  { period: '90+ Days', title: 'Resolution', steps: ['Review updated credit reports', 'Dispute any remaining inaccurate items', 'Consult consumer rights attorney if FDCPA violations occurred', 'Consider professional credit repair for complex cases'] },
];

const FAQS = [
  { q: 'How long do collections stay on my credit report?', a: 'Collection accounts generally remain on your credit report for 7 years from the date of first delinquency on the ORIGINAL account — not from when the collection was reported. After 7 years, the bureau must remove it. However, many collections can be removed earlier through successful disputes, validation failures, or negotiations.' },
  { q: 'Will paying a collection improve my credit score?', a: 'It depends. Under newer FICO scoring models (FICO 9 and VantageScore 3.0+), paid collections are treated more favorably than unpaid ones. However, under older models still used by many lenders, a paid collection is still a negative mark. The best outcome is getting the collection REMOVED entirely via dispute or pay-for-delete negotiation.' },
  { q: 'Can I dispute a collection I actually owe?', a: 'Yes. You can always dispute ANY information on your credit report that you believe is inaccurate, unverifiable, or incomplete — even if you do owe the debt. The burden of proof is on the collector and the bureau to verify the information is 100% accurate. Errors in dates, balances, account numbers, or creditor names are all valid grounds for dispute.' },
  { q: 'What is the difference between a debt collector and a debt buyer?', a: 'A debt collector collects debts on BEHALF of the original creditor (contingency collection) — the original creditor still owns the debt. A debt buyer PURCHASES the debt from the original creditor, usually for pennies on the dollar, and then tries to collect the full amount. Debt buyers (like LVNV, Midland, PRA) typically have weaker documentation because they bought debts in bulk — this makes them more vulnerable to validation disputes.' },
  { q: 'Should I talk to a debt collector on the phone?', a: 'We recommend limiting phone contact with collectors. Anything you say can be used to restart the statute of limitations or be construed as acknowledging the debt. Instead: 1) Get the collector\'s name, company, and mailing address. 2) Say "I dispute this debt and request written verification." 3) Hang up. 4) Follow up with a written debt validation letter via certified mail. Written communication creates a paper trail that protects you.' },
  { q: 'What happens if a collector violates the FDCPA?', a: 'If a collector violates the FDCPA, you can sue them in federal or state court. You can recover: actual damages (emotional distress, lost wages, etc.), statutory damages up to $1,000 per lawsuit, and attorney fees. Many FDCPA attorneys work on contingency (no upfront cost). Common violations include: calling before 8am or after 9pm, threatening arrest, calling your workplace after being told not to, and failing to validate debts.' },
];

const DisputeCollectionsHub = () => {
  const [openFaq, setOpenFaq] = useState(null);

  useSEO({
    title: 'How to Dispute Collections on Your Credit Report — Complete Guide | Credlocity',
    description: 'Step-by-step guide to disputing collection accounts on your credit report. Learn your rights under FCRA and FDCPA, dispute methods, and how to get collections removed.',
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How to Dispute Collections on Your Credit Report — Complete Guide | Credlocity</title>
        <meta name="description" content="Complete guide to disputing and removing collection accounts from your credit report. Covers FCRA, FDCPA, debt validation, bureau disputes, and agency-specific strategies." />
        <link rel="canonical" href="https://credlocity.com/how-to-dispute-collections" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Dispute Collections on Your Credit Report",
          "author": { "@type": "Organization", "name": "Credlocity" },
          "publisher": { "@type": "Organization", "name": "Credlocity" },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
        })}</script>
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section className="bg-primary-blue text-white py-16 md:py-24" data-testid="hero-section">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <Scale className="w-4 h-4 text-yellow-300" />
            <span>FCRA & FDCPA Dispute Guide</span>
          </div>
          <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="page-title">
            How to Dispute Collections on Your Credit Report
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Collection accounts can devastate your credit score. But you have powerful legal rights 
            under the FCRA and FDCPA to challenge, dispute, and remove them.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8 py-6" asChild>
              <Link to="/free-letters" data-testid="hero-letters">
                Get Free Dispute Templates <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-lg px-8 py-6" asChild>
              <a href="#dispute-methods" data-testid="hero-methods">
                Read the Guide <BookOpen className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ WHY COLLECTIONS APPEAR ═══ */}
      <section className="py-16 bg-white" data-testid="why-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6 text-center">Why Collection Accounts Appear on Your Report</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Clock, title: 'Unpaid Debts', desc: 'After 90-180 days without payment, the original creditor may send the account to a third-party collection agency or sell it to a debt buyer.' },
              { icon: AlertTriangle, title: 'Errors & Identity Issues', desc: 'Billing errors, insurance processing mistakes, identity mix-ups, or debts that belong to someone else can all result in incorrect collections.' },
              { icon: DollarSign, title: 'Medical & Utility Debts', desc: 'Medical bills, utility debts, and government fines frequently go to collections — often without the consumer being properly notified.' },
            ].map((item, i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary-blue" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <p className="text-gray-800">
              <strong>Key fact:</strong> A single collection account can drop your credit score by <strong>75-100 points</strong> or more, 
              depending on the rest of your credit profile. Removing it can provide an equally dramatic improvement.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ YOUR LEGAL RIGHTS ═══ */}
      <section className="py-16 bg-gray-50" data-testid="rights-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6 text-center">Your Legal Rights Against Collection Agencies</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Two federal laws protect you: the <strong>Fair Credit Reporting Act (FCRA)</strong> and 
            the <strong>Fair Debt Collection Practices Act (FDCPA)</strong>.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">FCRA — Your Credit Report Rights</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'Right to dispute inaccurate information (§ 611)',
                    'Right to request disclosure of file contents (§ 609)',
                    'Bureau must investigate within 30 days',
                    'Unverified items must be deleted',
                    'Collections fall off after 7 years from original delinquency',
                  ].map((right, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {right}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to="/fcra-guide" data-testid="fcra-link">Read Full FCRA Guide <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">FDCPA — Your Rights Against Collectors</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'Right to demand debt validation within 30 days (§ 809)',
                    'Right to stop all contact via cease letter (§ 805)',
                    'Right to sue for violations — up to $1,000 per case (§ 813)',
                    'Collectors cannot call before 8am or after 9pm',
                    'Collectors cannot threaten arrest or use abusive language',
                  ].map((right, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {right}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to="/fdcpa-guide" data-testid="fdcpa-link">Read Full FDCPA Guide <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ DISPUTE METHODS ═══ */}
      <section id="dispute-methods" className="py-16 bg-white scroll-mt-20" data-testid="methods-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">6 Methods to Dispute Collection Accounts</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">Each method targets a different angle. The most effective approach combines multiple methods.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DISPUTE_METHODS.map((method, i) => (
              <Card key={i} className="border border-gray-200 hover:shadow-lg transition-shadow" data-testid={`method-${i}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mb-4`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{method.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{method.desc}</p>
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700"><strong>Best for:</strong> {method.best}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DISPUTE TIMELINE ═══ */}
      <section className="py-16 bg-gray-50" data-testid="timeline-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Dispute Timeline: What to Do and When</h2>
          <div className="space-y-6">
            {TIMELINE_ITEMS.map((item, i) => (
              <Card key={i} className="border-0 shadow-md" data-testid={`timeline-${i}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-10 bg-primary-blue text-white rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {item.period.split(' ')[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <span className="text-xs text-gray-500">({item.period})</span>
                      </div>
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {item.steps.map((step, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0 mt-0.5" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FREE LETTERS CTA ═══ */}
      <section className="py-10 bg-white" data-testid="free-letters-cta">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-blue via-primary-blue/95 to-primary-blue/85 text-white p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-cinzel text-2xl md:text-3xl font-bold mb-2">Want a Custom Free Letter?</h3>
                <p className="text-gray-200 text-sm md:text-base max-w-xl">
                  Browse our collection of professionally written dispute letter templates. Fill in your details, generate a personalized PDF, and mail it — all 100% free, no signup required.
                </p>
              </div>
              <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8 whitespace-nowrap flex-shrink-0" asChild>
                <Link to="/free-letters" className="inline-flex items-center gap-2" data-testid="free-letters-btn">
                  Browse Free Letters <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COLLECTION AGENCIES DIRECTORY ═══ */}
      <section className="py-16 bg-gray-50" data-testid="agencies-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">Dispute Guides by Collection Agency</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Each agency has different practices and vulnerabilities. Click on the agency on your credit report for a targeted dispute strategy.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENCY_LIST.map(agency => (
              <Link
                key={agency.slug}
                to={`/dispute/${agency.slug}`}
                className="group p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-blue hover:shadow-lg transition-all"
                data-testid={`agency-${agency.slug}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-gray-400 group-hover:text-primary-blue" />
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-blue text-sm">{agency.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{agency.description.slice(0, 100)}...</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-600 font-medium">{agency.cfpbComplaints} CFPB complaints</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-blue" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQs ═══ */}
      <section className="py-16 bg-white" data-testid="faq-section">
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
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RELATED GUIDES ═══ */}
      <section className="py-12 bg-gray-50" data-testid="related-guides">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-6 text-center">Related Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/fdcpa-guide', title: 'FDCPA Rights Guide', desc: 'Your rights against debt collectors', icon: Shield },
              { to: '/fcra-guide', title: 'FCRA Guide', desc: 'Your credit report rights', icon: FileText },
              { to: '/609-dispute-letter', title: '609 Dispute Letter', desc: 'Section 609 disclosure requests', icon: BookOpen },
              { to: '/free-credit-report-review', title: 'Free Credit Review', desc: 'Expert analysis of your report', icon: Target },
            ].map((guide, i) => (
              <Link key={i} to={guide.to} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-blue hover:shadow-md transition group" data-testid={`guide-${i}`}>
                <guide.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary-blue">{guide.title}</h3>
                  <p className="text-xs text-gray-500">{guide.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 bg-primary-blue text-white" data-testid="final-cta">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Need Professional Help?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Disputing collections is time-consuming. Our credit specialists handle the entire process — 
            from validation letters to bureau disputes to negotiation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrialButton size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10 py-6" data-testid="final-trial">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </TrialButton>
            <Button size="lg" className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-lg px-10 py-6" asChild>
              <Link to="/free-credit-report-review" data-testid="final-review">
                Get Free Credit Review
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DisputeCollectionsHub;
