import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Scale,
  FileText, AlertTriangle, Shield, Target, XCircle, Phone,
  ExternalLink, ChevronRight, Building2, MapPin, Calendar, Info
} from 'lucide-react';
import useSEO from '../../hooks/useSEO';
import { TrialButton } from '../../components/LeadButtons';
import { COLLECTION_AGENCIES, AGENCY_LIST } from './collectionAgencyData';

const DISPUTE_STEPS = [
  { step: 1, title: 'Pull your credit reports', desc: 'Get your reports from all three bureaus (Equifax, Experian, TransUnion) and identify every account this collector has reported.' },
  { step: 2, title: 'Send a Debt Validation Letter', desc: 'Within 30 days of first contact, send a written dispute via certified mail requesting full validation of the debt under Section 809 of the FDCPA.' },
  { step: 3, title: 'Request original documentation', desc: 'Demand the original signed agreement, complete payment history, chain of ownership (if debt was sold), and proof of their authority to collect.' },
  { step: 4, title: 'Dispute with credit bureaus', desc: 'File disputes with all three credit bureaus under Sections 609 and 611 of the FCRA. Request that the bureau verify the account with the data furnisher.' },
  { step: 5, title: 'Document everything', desc: 'Keep copies of all letters, certified mail receipts, phone call logs (date, time, representative name, what was said), and responses.' },
  { step: 6, title: 'Escalate if necessary', desc: 'If the collector violates the FDCPA or fails to validate, file complaints with the CFPB, your state Attorney General, and consult a consumer rights attorney.' },
];

const DisputeCollectionAgency = () => {
  const { slug } = useParams();
  const agency = COLLECTION_AGENCIES[slug];
  const [openFaq, setOpenFaq] = useState(null);

  if (!agency) return <Navigate to="/how-to-dispute-collections" replace />;

  const otherAgencies = AGENCY_LIST.filter(a => a.slug !== slug);

  useSEO({
    title: `How to Dispute ${agency.name} — Remove From Credit Report | Credlocity`,
    description: `Step-by-step guide to disputing ${agency.name} on your credit report. Learn your rights, common violations, dispute strategies, and how to get ${agency.name} removed.`,
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How to Dispute {agency.name} — Remove From Credit Report | Credlocity</title>
        <meta name="description" content={`Complete guide to disputing ${agency.name}. Common complaints, FDCPA violations, step-by-step dispute process, and free letter templates.`} />
        <link rel="canonical" href={`https://credlocity.com/dispute/${agency.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `How to Dispute ${agency.name}`,
          "author": { "@type": "Organization", "name": "Credlocity" },
          "publisher": { "@type": "Organization", "name": "Credlocity" },
          "description": `Step-by-step guide to disputing and removing ${agency.name} from your credit report.`
        })}</script>
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section className="bg-primary-blue text-white py-16 md:py-20" data-testid="hero-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-blue-200 mb-4">
            <Link to="/how-to-dispute-collections" className="hover:text-white">Dispute Collections</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{agency.name}</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight" data-testid="page-title">
            How to Dispute {agency.name}
          </h1>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl">
            Complete guide to disputing {agency.name} on your credit report — your rights, their common practices, 
            and the exact steps to get them removed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
              <Link to="/free-letters" data-testid="hero-cta-letters">
                Get Free Dispute Templates <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white/15 hover:bg-white/25 text-white border border-white/30" asChild>
              <Link to="/fdcpa-guide" data-testid="hero-cta-fdcpa">
                Know Your FDCPA Rights <Scale className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ COMPANY OVERVIEW ═══ */}
      <section className="py-12 bg-gray-50" data-testid="overview-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-0 shadow-md">
              <CardContent className="p-6">
                <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-3">Who Is {agency.name}?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{agency.description}</p>
                {agency.aka.length > 0 && (
                  <p className="text-sm text-gray-500">
                    <strong>Also known as:</strong> {agency.aka.join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary-blue" />
                  <span className="text-gray-600"><strong>HQ:</strong> {agency.headquarters}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                  <span className="text-gray-600"><strong>Founded:</strong> {agency.founded}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600"><strong>CFPB Complaints:</strong> {agency.cfpbComplaints}</span>
                </div>
                <hr />
                <h3 className="font-semibold text-gray-900 text-sm">Types of Debts They Collect</h3>
                <ul className="space-y-1">
                  {agency.whatTheyCollect.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ COMMON COMPLAINTS ═══ */}
      <section className="py-12 bg-white" data-testid="complaints-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-6">Common Complaints Against {agency.name}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {agency.commonComplaints.map((complaint, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100" data-testid={`complaint-${i}`}>
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{complaint}</p>
              </div>
            ))}
          </div>
          {agency.knownViolations && (
            <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-200" data-testid="violations-box">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Regulatory Actions & Known Violations</h3>
                  <p className="text-sm text-amber-700 leading-relaxed">{agency.knownViolations}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ DISPUTE STRATEGY ═══ */}
      <section className="py-12 bg-gray-50" data-testid="strategy-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-6">Dispute Strategy for {agency.name}</h2>
          <Card className="border-0 shadow-md mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Key Strategy</h3>
                  <p className="text-gray-700 leading-relaxed">{agency.disputeStrategy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="font-bold text-gray-900 mb-4">Specific Tips for Disputing {agency.name}</h3>
          <div className="space-y-3">
            {agency.specificTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200" data-testid={`tip-${i}`}>
                <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STEP-BY-STEP PROCESS ═══ */}
      <section className="py-12 bg-white" data-testid="steps-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8 text-center">
            How to Dispute {agency.name}: Step by Step
          </h2>
          <div className="space-y-0">
            {DISPUTE_STEPS.map((s, i) => (
              <div key={i} className="flex gap-6" data-testid={`step-${s.step}`}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  {i < DISPUTE_STEPS.length - 1 && <div className="w-0.5 h-full bg-blue-200 my-1" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FREE LETTERS CTA ═══ */}
      <section className="py-10 bg-gray-50" data-testid="free-letters-cta">
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

      {/* ═══ RELATED GUIDES ═══ */}
      <section className="py-12 bg-white" data-testid="related-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-6">Other Collection Agencies to Dispute</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {otherAgencies.map(a => (
              <Link
                key={a.slug}
                to={`/dispute/${a.slug}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition group"
                data-testid={`related-${a.slug}`}
              >
                <Building2 className="w-5 h-5 text-gray-400 group-hover:text-primary-blue flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-blue">{a.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/how-to-dispute-collections" data-testid="back-to-hub">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Dispute Collections Guide
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/fdcpa-guide" data-testid="fdcpa-link">
                <Scale className="w-4 h-4 mr-2" /> FDCPA Rights Guide
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/609-dispute-letter" data-testid="609-link">
                <FileText className="w-4 h-4 mr-2" /> 609 Dispute Letter Guide
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 bg-primary-blue text-white" data-testid="final-cta">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-cinzel text-3xl font-bold mb-4">Need Professional Help Disputing {agency.name}?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Our credit specialists have experience disputing accounts from {agency.name} and can handle the entire process for you.
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

export default DisputeCollectionAgency;
