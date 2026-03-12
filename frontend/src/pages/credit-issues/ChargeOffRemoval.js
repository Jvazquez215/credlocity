import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  FileText, CheckCircle2, Scale, AlertTriangle, 
  BookOpen, Gavel, ArrowRight, Phone, TrendingDown,
  Quote, ChevronDown, ChevronUp, Shield, Clock, Target
} from 'lucide-react';

const ChargeOffRemoval = () => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await api.get('/blogs?related_page=charge-off-removal&limit=4');
        setRelatedBlogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRelatedBlogs();
  }, []);

  const chargeOffTypes = [
    {
      type: "Revolving Account Charge-Off",
      description: "Credit cards charged off after 180 days of non-payment",
      impact: "Can reduce score by 100-150 points",
      recovery: "Account may be sold to collections, creating double-negative reporting"
    },
    {
      type: "Installment Loan Charge-Off",
      description: "Auto loans, personal loans, or student loans written off as losses",
      impact: "Severely damages credit mix and payment history",
      recovery: "Deficiency balance may be pursued separately"
    },
    {
      type: "Retail Account Charge-Off",
      description: "Store credit cards and financing written off",
      impact: "Similar to revolving charge-offs but often with smaller limits",
      recovery: "May affect ability to shop at that retailer"
    }
  ];

  const removalStrategies = [
    {
      title: "FCRA Verification Dispute",
      description: "Challenge the accuracy of charge-off reporting under the Fair Credit Reporting Act.",
      details: [
        "Dispute incorrect charge-off dates (must be DOFD + 7 years)",
        "Challenge incorrect balance amounts",
        "Verify account ownership chain if debt was sold",
        "Request method of verification from bureaus"
      ]
    },
    {
      title: "Direct Creditor Negotiation",
      description: "Negotiate with original creditors for removal in exchange for payment.",
      details: [
        "Offer lump sum settlement for deletion",
        "Request paid charge-off be updated to 'Paid as Agreed'",
        "Negotiate 'Pay for Delete' agreement in writing",
        "Use hardship programs offered by creditors"
      ]
    },
    {
      title: "Account Validation Challenge",
      description: "Challenge the creditor's ability to verify the account details.",
      details: [
        "Request complete account documentation",
        "Challenge chain of custody if account was sold",
        "Verify original signed agreement exists",
        "Dispute if creditor cannot produce documentation"
      ]
    },
    {
      title: "Statute of Limitations Defense",
      description: "Challenge charge-offs past the statute of limitations for legal action.",
      details: [
        "SOL varies by state (3-6 years typically)",
        "Time-barred debts cannot be sued upon",
        "Can still remain on credit report until 7-year mark",
        "Use SOL as leverage in settlement negotiations"
      ]
    }
  ];

  const fcraProvisions = [
    {
      section: "§ 611(a)(1)(A)",
      title: "Dispute Investigation Requirements",
      quote: "If the completeness or accuracy of any item of information contained in a consumer's file... is disputed by the consumer... the agency shall, free of charge, conduct a reasonable reinvestigation to determine whether the disputed information is inaccurate."
    },
    {
      section: "§ 623(a)(8)(E)",
      title: "Accuracy Requirements for Furnishers",
      quote: "A person that furnishes information to a consumer reporting agency shall not furnish information relating to a consumer to any consumer reporting agency if... the person has been notified by the consumer... that specific information is inaccurate."
    },
    {
      section: "§ 605(a)(4)",
      title: "Reporting Time Limits",
      quote: "No consumer reporting agency may make any consumer report containing... accounts placed for collection or charged to profit and loss which antedate the report by more than seven years."
    }
  ];

  const caselaw = [
    {
      name: "Johnson v. MBNA America Bank, NA",
      citation: "357 F.3d 426 (4th Cir. 2004)",
      holding: "Creditors cannot report a charged-off debt as both 'charged off' and 'in collection' simultaneously as this double-reports the same debt.",
      significance: "Prevents creditors from double-dipping on negative reporting."
    },
    {
      name: "Stevenson v. TRW Inc.",
      citation: "987 F.2d 288 (5th Cir. 1993)",
      holding: "Credit reporting agencies must follow reasonable procedures to assure maximum possible accuracy of credit reports.",
      significance: "Establishes liability for inaccurate charge-off reporting."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Charge-Off Removal | Verification Disputes & Creditor Negotiations | Credlocity</title>
        <meta name="description" content="Remove charge-offs from your credit report using FCRA verification disputes, creditor negotiations, and account validation challenges. 71% success rate." />
        <link rel="canonical" href="https://www.credlocity.com/charge-off-removal" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Charge-Off Removal: Complete Guide",
            "author": { "@type": "Organization", "name": "Credlocity" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="charge-off-removal-page">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-red-700 via-red-600 to-rose-500 text-white py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Severe Credit Impact</span>
              </div>
              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Charge-Off Removal
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Charge-offs signal severe delinquency to lenders and can drop your score by 110+ points. We challenge them using verification disputes and creditor negotiations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8" asChild>
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                    Start Free Consultation
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" asChild>
                  <a href="tel:+12151234567"><Phone className="w-5 h-5 mr-2" />Call Now</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">-110</div>
                <p className="text-sm text-gray-600">Average Score<br/>Impact</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">7</div>
                <p className="text-sm text-gray-600">Years on<br/>Report</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-green mb-2">71%</div>
                <p className="text-sm text-gray-600">Our Success<br/>Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">180</div>
                <p className="text-sm text-gray-600">Days Before<br/>Charge-Off</p>
              </div>
            </div>
          </div>
        </section>

        {/* What is a Charge-Off */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8">
                What is a Charge-Off?
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  A charge-off occurs when a creditor writes off your debt as a loss after typically <strong>180 days of non-payment</strong>. This is an accounting action—the creditor removes the debt from their books, but <strong>you still legally owe the money</strong>.
                </p>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
                  <h3 className="font-semibold text-xl mb-3 text-red-800">Critical Understanding</h3>
                  <p className="text-gray-700">
                    A charge-off does NOT mean the debt is forgiven. The creditor may pursue collection internally, sell the debt to a collection agency, or sue you. You may end up with BOTH a charge-off AND a collection account on your report for the same debt.
                  </p>
                </div>

                <h3 className="font-semibold text-xl mb-4">Types of Charge-Offs:</h3>
                <div className="grid gap-4">
                  {chargeOffTypes.map((type, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border">
                      <h4 className="font-semibold text-lg mb-2">{type.type}</h4>
                      <p className="text-gray-600 mb-2">{type.description}</p>
                      <p className="text-red-600 text-sm mb-1"><strong>Impact:</strong> {type.impact}</p>
                      <p className="text-gray-500 text-sm"><strong>Recovery:</strong> {type.recovery}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Removal Strategies */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Charge-Off Removal Strategies
              </h2>
              <div className="space-y-6">
                {removalStrategies.map((strategy, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === index ? null : index)} className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-100 transition">
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900">{strategy.title}</h3>
                        <p className="text-gray-600 mt-1">{strategy.description}</p>
                      </div>
                      {expandedSection === index ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                    </button>
                    {expandedSection === index && (
                      <div className="px-6 pb-6 border-t">
                        <ul className="mt-4 space-y-3">
                          {strategy.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FCRA Section */}
        <section className="py-16 bg-primary-blue text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                  <Gavel className="w-5 h-5" />
                  <span className="text-sm font-semibold">Federal Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  Fair Credit Reporting Act (FCRA)
                </h2>
                <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                  15 U.S.C. § 1681 — Your primary tool for challenging inaccurate charge-off reporting.
                </p>
              </div>

              <div className="space-y-6">
                {fcraProvisions.map((provision, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <span className="bg-white/20 text-white text-sm font-mono px-3 py-1 rounded mb-4 inline-block">{provision.section}</span>
                    <h3 className="font-semibold text-xl mb-3">{provision.title}</h3>
                    <blockquote className="border-l-4 border-secondary-light pl-4 italic text-gray-200">
                      "{provision.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Case Law */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-8 text-center">Relevant Case Law</h2>
              <div className="space-y-6">
                {caselaw.map((case_, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      <Scale className="w-10 h-10 text-secondary-light flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-xl mb-1">{case_.name}</h3>
                        <p className="text-secondary-light text-sm mb-3">{case_.citation}</p>
                        <p className="text-gray-300 mb-2"><strong>Holding:</strong> {case_.holding}</p>
                        <p className="text-sm text-gray-400"><strong className="text-secondary-light">Significance:</strong> {case_.significance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Issues */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8 text-center">Related Credit Issues</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/collection-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <TrendingDown className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Collection Removal</h3>
                  <p className="text-gray-600 text-sm">Remove collections using FDCPA violations.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
                <Link to="/late-payment-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Clock className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Late Payment Removal</h3>
                  <p className="text-gray-600 text-sm">Remove late payments through goodwill letters.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
                <Link to="/bankruptcy-credit-repair" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Scale className="w-10 h-10 text-purple-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Bankruptcy Repair</h3>
                  <p className="text-gray-600 text-sm">Rebuild credit after Chapter 7 or 13.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-rose-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">Ready to Remove Charge-Offs?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Our 71% success rate demonstrates our expertise in charge-off removal.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8" asChild>
                <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" asChild>
                <a href="https://calendly.com/credlocity/oneonone" target="_blank" rel="noopener noreferrer">Book Consultation</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Related Blogs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">Related Blogs</h2>
              {loadingBlogs ? (
                <div className="text-center py-8 text-gray-500">Loading related articles...</div>
              ) : relatedBlogs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedBlogs.map((blog, index) => (
                    <Link key={index} to={`/blog/${blog.slug}`} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition group">
                      {blog.featured_image && <img src={blog.featured_image} alt={blog.title} className="w-full h-48 object-cover" />}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">{blog.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{blog.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Check back soon for articles about charge-off removal.</p>
                  <Link to="/blog" className="text-primary-blue font-medium mt-4 inline-block hover:underline">Browse All Articles →</Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ChargeOffRemoval;
