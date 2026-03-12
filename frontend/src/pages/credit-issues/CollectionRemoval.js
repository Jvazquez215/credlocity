import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  Shield, CheckCircle2, FileText, Scale, AlertTriangle, 
  BookOpen, Gavel, ArrowRight, Phone, Clock, TrendingUp,
  Quote, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';

const CollectionRemoval = () => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [expandedStatute, setExpandedStatute] = useState(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await api.get('/blogs?related_page=collection-removal&limit=4');
        setRelatedBlogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRelatedBlogs();
  }, []);

  const fdcpaViolations = [
    {
      section: "§ 1692e",
      title: "False or Misleading Representations",
      description: "Collectors cannot use false, deceptive, or misleading representations.",
      examples: [
        "Threatening legal action they cannot or do not intend to take",
        "Misrepresenting the amount of debt",
        "Claiming to be attorneys when they are not",
        "Falsely implying the consumer committed a crime"
      ]
    },
    {
      section: "§ 1692f",
      title: "Unfair Practices",
      description: "Collectors cannot use unfair or unconscionable means to collect debts.",
      examples: [
        "Collecting amounts not authorized by agreement or law",
        "Depositing post-dated checks early",
        "Threatening to take property without legal right",
        "Using postcards for debt communication"
      ]
    },
    {
      section: "§ 1692g",
      title: "Validation of Debts",
      description: "Within 5 days of initial contact, collectors must provide written validation notice.",
      examples: [
        "Amount of the debt",
        "Name of the creditor",
        "30-day dispute window notice",
        "Consumer's right to request verification"
      ]
    },
    {
      section: "§ 1692c",
      title: "Communication Restrictions",
      description: "Strict rules about when and how collectors can contact consumers.",
      examples: [
        "Cannot call before 8am or after 9pm",
        "Must stop calling workplace if told employer disapproves",
        "Cannot contact consumers represented by attorneys",
        "Must cease communication upon written request"
      ]
    }
  ];

  const cfpbRegulations = [
    {
      rule: "Regulation F (12 CFR Part 1006)",
      description: "Effective November 2021, limits debt collectors to 7 calls per week per debt and prohibits calls within 7 days of a conversation.",
      impact: "Collections agencies that violate call frequency limits face potential CFPB enforcement actions and private lawsuits."
    },
    {
      rule: "Clear & Prominent Disclosure",
      description: "All collection communications must include clear identification that the message is from a debt collector.",
      impact: "Failure to identify themselves violates FDCPA and provides grounds for dispute."
    },
    {
      rule: "Time-Barred Debt Rules",
      description: "Collectors must disclose if debt is past the statute of limitations and cannot sue on time-barred debts.",
      impact: "Many old collections can be challenged if collectors threaten legal action on expired debts."
    }
  ];

  const landmarkCases = [
    {
      name: "Jerman v. Carlisle, McNellie, Rini, Kramer & Ulrich LPA",
      citation: "559 U.S. 573 (2010)",
      court: "U.S. Supreme Court",
      holding: "The bona fide error defense in FDCPA does not apply to violations resulting from a debt collector's mistaken interpretation of the law.",
      significance: "Debt collectors cannot escape liability by claiming they didn't know the law."
    },
    {
      name: "Heintz v. Jenkins",
      citation: "514 U.S. 291 (1995)",
      court: "U.S. Supreme Court",
      holding: "The FDCPA applies to attorneys who regularly engage in debt collection activities.",
      significance: "Collection law firms must follow the same rules as collection agencies."
    },
    {
      name: "Henson v. Santander Consumer USA Inc.",
      citation: "582 U.S. 79 (2017)",
      court: "U.S. Supreme Court",
      holding: "Companies that purchase debt and collect for their own accounts are not 'debt collectors' under FDCPA.",
      significance: "Distinguishes debt buyers from third-party collectors, though debt buyers may still violate state laws."
    },
    {
      name: "Rotkiske v. Klemm",
      citation: "589 U.S. ___ (2019)",
      court: "U.S. Supreme Court",
      holding: "FDCPA's one-year statute of limitations runs from the date of violation, not discovery.",
      significance: "Consumers must act quickly once they discover potential violations."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Collection Account Removal | FDCPA Violations & Dispute Strategies | Credlocity</title>
        <meta 
          name="description" 
          content="Expert collection removal using FDCPA violations, debt validation, and pay-for-delete negotiations. Learn federal laws protecting your rights. 73% success rate." 
        />
        <link rel="canonical" href="https://www.credlocity.com/collection-removal" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="Collection Account Removal Services | Credlocity" />
        <meta property="og:description" content="Remove collections from your credit report using FDCPA violations and expert dispute strategies. Federal law protects your rights." />
        <meta property="og:url" content="https://www.credlocity.com/collection-removal" />
        <meta property="og:type" content="article" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Collection Account Removal: Complete Guide to FDCPA Rights",
            "description": "Comprehensive guide to removing collection accounts using federal law protections",
            "author": {
              "@type": "Organization",
              "name": "Credlocity"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Credlocity",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.credlocity.com/logo.png"
              }
            }
          })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Collection Account Removal",
            "provider": {
              "@type": "Organization",
              "name": "Credlocity"
            },
            "description": "Professional removal of collection accounts from credit reports",
            "areaServed": "United States"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="collection-removal-page">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-blue via-primary-secondary to-primary-dark text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f')] bg-cover bg-center"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Shield className="w-5 h-5 text-secondary-light" />
                <span className="text-sm font-medium">FDCPA Protected Rights</span>
              </div>
              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Collection Account Removal
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Leverage federal law violations to remove collections permanently. Each collection can drop your score 50-100 points.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8"
                  asChild
                >
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                    Start Free Consultation
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-blue"
                  asChild
                >
                  <a href="tel:+12151234567">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-12 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">-80</div>
                <p className="text-sm text-gray-600">Average Score Impact<br/>Per Collection</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">7</div>
                <p className="text-sm text-gray-600">Years on<br/>Credit Report</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-green mb-2">73%</div>
                <p className="text-sm text-gray-600">Our Success<br/>Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">$1000</div>
                <p className="text-sm text-gray-600">Max FDCPA<br/>Statutory Damages</p>
              </div>
            </div>
          </div>
        </section>

        {/* What is a Collection */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8">
                What is a Collection Account?
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  A collection account appears on your credit report when an original creditor sells or transfers your unpaid debt to a third-party collection agency. This typically happens after 90-180 days of non-payment. The original account may show as "charged off" while the new collection account appears separately.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  <strong>The impact is severe:</strong> A single collection can cause a 50-100 point drop in your credit score, and multiple collections compound this damage. Even after paying a collection, it remains on your credit report for 7 years from the date of first delinquency (DOFD).
                </p>
                
                <div className="bg-blue-50 border-l-4 border-primary-blue p-6 my-8">
                  <h3 className="font-semibold text-xl mb-3 text-primary-blue">Critical Insight</h3>
                  <p className="text-gray-700">
                    Many consumers believe paying a collection removes it from their report. <strong>This is false.</strong> Paid collections remain for 7 years. However, FICO 9 and VantageScore 3.0+ ignore paid collections, while older scoring models still count them negatively.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FDCPA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-primary-blue/10 px-4 py-2 rounded-full mb-4">
                  <Gavel className="w-5 h-5 text-primary-blue" />
                  <span className="text-sm font-semibold text-primary-blue">Federal Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
                  Fair Debt Collection Practices Act (FDCPA)
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  15 U.S.C. § 1692 et seq. — The primary federal law protecting consumers from abusive debt collection practices. Enacted in 1977, it provides powerful tools for disputing collections.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {fdcpaViolations.map((violation, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <button 
                      onClick={() => setExpandedStatute(expandedStatute === index ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-start hover:bg-gray-50 transition"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-primary-blue text-white text-sm font-mono px-3 py-1 rounded">
                            {violation.section}
                          </span>
                        </div>
                        <h3 className="font-semibold text-xl text-gray-900">{violation.title}</h3>
                        <p className="text-gray-600 mt-2">{violation.description}</p>
                      </div>
                      {expandedStatute === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedStatute === index && (
                      <div className="px-6 pb-6 border-t bg-gray-50">
                        <h4 className="font-semibold text-sm text-gray-700 mt-4 mb-3">Common Violations:</h4>
                        <ul className="space-y-2">
                          {violation.examples.map((example, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0 mt-1" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-gradient-to-r from-primary-blue to-primary-secondary rounded-xl p-8 text-white">
                <div className="flex items-start gap-4">
                  <Quote className="w-12 h-12 flex-shrink-0 opacity-50" />
                  <div>
                    <p className="text-lg italic mb-4">
                      "It is the purpose of this subchapter to eliminate abusive debt collection practices by debt collectors, to insure that those debt collectors who refrain from using abusive debt collection practices are not competitively disadvantaged, and to promote consistent State action to protect consumers against debt collection abuses."
                    </p>
                    <p className="font-semibold">— 15 U.S.C. § 1692(e), Congressional Findings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CFPB Regulations */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                  <BookOpen className="w-5 h-5 text-green-700" />
                  <span className="text-sm font-semibold text-green-700">Consumer Protection</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
                  CFPB Rules & Regulations
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  The Consumer Financial Protection Bureau enforces federal consumer financial laws and provides additional protections beyond the FDCPA.
                </p>
              </div>

              <div className="space-y-6">
                {cfpbRegulations.map((reg, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border-l-4 border-secondary-green">
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">{reg.rule}</h3>
                    <p className="text-gray-700 mb-3">{reg.description}</p>
                    <p className="text-sm text-secondary-green font-medium">
                      <strong>Impact:</strong> {reg.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Landmark Cases */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                  <Scale className="w-5 h-5 text-secondary-light" />
                  <span className="text-sm font-semibold">Case Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  Landmark Court Decisions
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  These Supreme Court cases shape how the FDCPA is interpreted and enforced today.
                </p>
              </div>

              <div className="grid gap-6">
                {landmarkCases.map((case_, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-shrink-0">
                        <Gavel className="w-10 h-10 text-secondary-light" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-1">{case_.name}</h3>
                        <p className="text-secondary-light text-sm mb-2">{case_.citation} • {case_.court}</p>
                        <p className="text-gray-300 mb-3"><strong>Holding:</strong> {case_.holding}</p>
                        <p className="text-sm text-gray-400">
                          <strong className="text-secondary-light">Significance:</strong> {case_.significance}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-12 text-center">
                Our Collection Removal Process
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Comprehensive Credit Analysis",
                    description: "We obtain and analyze your credit reports from all three bureaus, identifying every collection account and evaluating each for potential violations."
                  },
                  {
                    step: 2,
                    title: "Violation Identification",
                    description: "Our experts examine each collection for FDCPA violations, FCRA errors, and verification issues. We look for improper validation, incorrect amounts, wrong dates, and procedural failures."
                  },
                  {
                    step: 3,
                    title: "Debt Validation Requests",
                    description: "We send certified debt validation letters under FDCPA § 1692g, forcing collectors to prove they have the legal right to collect and that the debt is valid."
                  },
                  {
                    step: 4,
                    title: "Bureau Disputes",
                    description: "Simultaneously, we file detailed disputes with Experian, Equifax, and TransUnion citing specific FCRA violations and demanding investigation."
                  },
                  {
                    step: 5,
                    title: "Creditor Negotiations",
                    description: "When appropriate, we negotiate pay-for-delete agreements or settlement arrangements that include deletion from your credit reports."
                  },
                  {
                    step: 6,
                    title: "Follow-Up & Escalation",
                    description: "We track all responses, re-dispute when necessary, and escalate to CFPB complaints or attorney referral if collectors violate your rights."
                  }
                ].map((step, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold text-xl">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Credit Issues */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8 text-center">
                Related Credit Issues
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/late-payment-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Clock className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Late Payment Removal</h3>
                  <p className="text-gray-600 text-sm">Remove late payments through goodwill letters and FCBA disputes.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
                <Link to="/charge-off-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <FileText className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Charge-Off Removal</h3>
                  <p className="text-gray-600 text-sm">Challenge charge-offs using verification disputes and creditor negotiations.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
                <Link to="/identity-theft-credit-repair" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Shield className="w-10 h-10 text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Identity Theft Resolution</h3>
                  <p className="text-gray-600 text-sm">Expert FCRA 605B process for fraud victims.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-blue to-primary-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">
              Ready to Remove Collections From Your Credit Report?
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Start your free consultation today. No upfront fees. 30-day free trial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8"
                asChild
              >
                <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                  Start Free Trial
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-blue"
                asChild
              >
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
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">
                Related Blogs
              </h2>
              {loadingBlogs ? (
                <div className="text-center py-8 text-gray-500">Loading related articles...</div>
              ) : relatedBlogs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedBlogs.map((blog, index) => (
                    <Link 
                      key={index}
                      to={`/blog/${blog.slug}`}
                      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition group"
                    >
                      {blog.featured_image && (
                        <img 
                          src={blog.featured_image} 
                          alt={blog.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{blog.excerpt}</p>
                        <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">
                          Read Article <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Check back soon for articles about collection removal strategies.</p>
                  <Link to="/blog" className="text-primary-blue font-medium mt-4 inline-block hover:underline">
                    Browse All Articles →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CollectionRemoval;
