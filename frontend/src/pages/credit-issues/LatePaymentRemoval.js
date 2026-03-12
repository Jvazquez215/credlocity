import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  Clock, CheckCircle2, FileText, Scale, AlertTriangle, 
  BookOpen, Gavel, ArrowRight, Phone, TrendingDown,
  Quote, ChevronDown, ChevronUp, Mail, Shield, Target
} from 'lucide-react';

const LatePaymentRemoval = () => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await api.get('/blogs?related_page=late-payment-removal&limit=4');
        setRelatedBlogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRelatedBlogs();
  }, []);

  const latePaymentImpact = [
    { days: "30 days late", impact: "-60 to -80 points", severity: "Moderate" },
    { days: "60 days late", impact: "-70 to -90 points", severity: "Significant" },
    { days: "90 days late", impact: "-80 to -110 points", severity: "Severe" },
    { days: "120+ days late", impact: "-90 to -120+ points", severity: "Critical" }
  ];

  const removalStrategies = [
    {
      title: "Goodwill Letter Strategy",
      description: "A formal request to creditors asking them to remove late payment notations as a gesture of goodwill.",
      effectiveness: "Best for: First-time late payments with otherwise good history",
      details: [
        "Address to the creditor's executive customer relations department",
        "Explain circumstances that led to the late payment",
        "Highlight your positive payment history before and after",
        "Request removal as a one-time courtesy"
      ]
    },
    {
      title: "FCBA Billing Error Dispute",
      description: "Challenge late payments that resulted from billing errors under the Fair Credit Billing Act.",
      effectiveness: "Best for: Payments made on time but posted late, incorrect billing statements",
      details: [
        "Must dispute within 60 days of receiving the erroneous statement",
        "Creditor must acknowledge within 30 days",
        "Investigation must complete within 90 days",
        "Cannot report as delinquent during investigation"
      ]
    },
    {
      title: "Metro2 Compliance Challenge",
      description: "Challenge inaccurate reporting based on Metro2 credit reporting standards.",
      effectiveness: "Best for: Incorrect dates, amounts, or account status codes",
      details: [
        "Metro2 is the industry standard for credit reporting",
        "Errors in compliance code reporting are common",
        "Incorrect 'Date of First Delinquency' is frequently disputed",
        "Account status codes must accurately reflect payment history"
      ]
    },
    {
      title: "FCRA Direct Dispute",
      description: "File disputes directly with credit bureaus citing specific inaccuracies.",
      effectiveness: "Best for: Any late payment with verifiable errors",
      details: [
        "Bureaus must investigate within 30 days",
        "Must contact furnisher to verify accuracy",
        "Unverifiable information must be removed",
        "Can dispute directly with furnisher under FCRA § 623"
      ]
    }
  ];

  const fcbaRights = [
    {
      section: "15 U.S.C. § 1666",
      title: "Billing Error Resolution",
      description: "Creditors must correct billing errors or explain why the bill is correct within two billing cycles (max 90 days)."
    },
    {
      section: "15 U.S.C. § 1666a",
      title: "Creditor Duties",
      description: "During investigation, creditor cannot report account as delinquent or close account."
    },
    {
      section: "15 U.S.C. § 1666b",
      title: "Payment Timing",
      description: "Creditors must credit payments on the day received. Late fees cannot be charged if payment arrived on time."
    }
  ];

  const landmarkCases = [
    {
      name: "Gorman v. Wolpoff & Abramson, LLP",
      citation: "584 F.3d 1147 (9th Cir. 2009)",
      holding: "Furnishers have a duty to conduct a reasonable investigation when notified of a dispute by a consumer.",
      significance: "Established that furnishers cannot simply parrot back the same information without investigation."
    },
    {
      name: "Saunders v. Branch Banking & Trust Co.",
      citation: "526 F.3d 142 (4th Cir. 2008)",
      holding: "A furnisher's investigation must be more than perfunctory; it must be reasonable.",
      significance: "Consumers can sue furnishers for inadequate investigation of disputes."
    },
    {
      name: "Chiang v. Verizon New England Inc.",
      citation: "595 F.3d 26 (1st Cir. 2010)",
      holding: "Consumer does not need to provide perfect notice of an error; reasonable notice is sufficient.",
      significance: "Disputes don't need to be perfectly worded to trigger investigation duties."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Late Payment Removal | Goodwill Letters & FCBA Disputes | Credlocity</title>
        <meta 
          name="description" 
          content="Remove late payments from your credit report using goodwill letters, FCBA disputes, and Metro2 compliance challenges. Even one late payment can cost 60-110 points." 
        />
        <link rel="canonical" href="https://www.credlocity.com/late-payment-removal" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Late Payment Removal: Complete Guide to Removing Late Payments",
            "author": { "@type": "Organization", "name": "Credlocity" },
            "publisher": { "@type": "Organization", "name": "Credlocity" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="late-payment-removal-page">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224154-26032ffc0d07')] bg-cover bg-center"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Payment History = 35% of Score</span>
              </div>
              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Late Payment Removal
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Even one 30-day late payment can drop your score 60-110 points. We use proven strategies to remove them permanently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8" asChild>
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                    Start Free Consultation
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" asChild>
                  <a href="tel:+12151234567"><Phone className="w-5 h-5 mr-2" />Call Now</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-2xl font-bold text-center text-gray-900 mb-8">
              Score Impact by Late Payment Severity
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {latePaymentImpact.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">{item.impact}</div>
                  <p className="font-medium text-gray-900">{item.days}</p>
                  <p className="text-sm text-gray-500">{item.severity}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Understanding Late Payments */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8">
                Understanding Late Payment Reporting
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  Payment history is the <strong>single most important factor</strong> in your credit score, comprising 35% of your FICO score calculation. Creditors report late payments to credit bureaus in 30-day increments: 30, 60, 90, and 120+ days late.
                </p>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8">
                  <h3 className="font-semibold text-xl mb-3 text-amber-800">Important Timing Note</h3>
                  <p className="text-gray-700">
                    A payment is not reported late until it is <strong>30 days past the due date</strong>. Grace periods (typically 15-21 days) do not count toward the 30-day mark. However, late fees may still apply during the grace period.
                  </p>
                </div>

                <p className="text-lg leading-relaxed mb-6">
                  Late payments remain on your credit report for <strong>7 years from the date of the late payment</strong>, not from when the account was closed or paid. However, the impact diminishes over time—a late payment from 5 years ago hurts far less than one from 5 months ago.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Removal Strategies */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
                  Proven Late Payment Removal Strategies
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  We use multiple approaches depending on your specific situation to maximize removal success.
                </p>
              </div>

              <div className="space-y-6">
                {removalStrategies.map((strategy, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-100 transition"
                    >
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900">{strategy.title}</h3>
                        <p className="text-gray-600 mt-1">{strategy.description}</p>
                        <p className="text-sm text-secondary-green mt-2 font-medium">{strategy.effectiveness}</p>
                      </div>
                      {expandedSection === index ? (
                        <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
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

        {/* FCBA Section */}
        <section className="py-16 bg-primary-blue text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                  <Gavel className="w-5 h-5" />
                  <span className="text-sm font-semibold">Federal Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  Fair Credit Billing Act (FCBA)
                </h2>
                <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                  15 U.S.C. § 1666 — Protects consumers against billing errors and ensures fair resolution of disputes with creditors.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {fcbaRights.map((right, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <span className="bg-white/20 text-white text-sm font-mono px-3 py-1 rounded mb-4 inline-block">
                      {right.section}
                    </span>
                    <h3 className="font-semibold text-xl mb-3">{right.title}</h3>
                    <p className="text-gray-200">{right.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-white/5 rounded-xl p-8">
                <div className="flex items-start gap-4">
                  <Quote className="w-12 h-12 flex-shrink-0 opacity-50" />
                  <div>
                    <p className="text-lg italic mb-4">
                      "A creditor may not treat a payment on a credit card account under an open end consumer credit plan as late for any purpose, unless the creditor has adopted reasonable procedures designed to ensure that each periodic statement... is mailed or delivered to the consumer not later than 21 days before the payment due date."
                    </p>
                    <p className="font-semibold">— 15 U.S.C. § 1666b(a)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Law */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  Relevant Case Law
                </h2>
              </div>
              <div className="space-y-6">
                {landmarkCases.map((case_, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
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
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8 text-center">
                Related Credit Issues
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/collection-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <TrendingDown className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Collection Removal</h3>
                  <p className="text-gray-600 text-sm">Remove collections using FDCPA violations.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
                <Link to="/charge-off-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <FileText className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Charge-Off Removal</h3>
                  <p className="text-gray-600 text-sm">Challenge charge-offs through verification disputes.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
                <Link to="/hard-inquiry-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Target className="w-10 h-10 text-indigo-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Hard Inquiry Removal</h3>
                  <p className="text-gray-600 text-sm">Remove unauthorized hard inquiries.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">
              Don't Let Late Payments Hold You Back
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our 68% success rate on late payment removal speaks for itself. Start today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8" asChild>
                <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                  Start Free Trial
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" asChild>
                <a href="https://calendly.com/credlocity/oneonone" target="_blank" rel="noopener noreferrer">
                  Book Consultation
                </a>
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
                        <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Read Article <ArrowRight className="w-4 h-4 ml-1" /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Check back soon for articles about late payment removal strategies.</p>
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

export default LatePaymentRemoval;
