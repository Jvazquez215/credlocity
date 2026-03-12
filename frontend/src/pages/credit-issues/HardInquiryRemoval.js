import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  Target, CheckCircle2, FileText, Scale, AlertTriangle, 
  BookOpen, Gavel, ArrowRight, Phone, TrendingDown,
  Quote, ChevronDown, ChevronUp, Shield, Clock, Search
} from 'lucide-react';

const HardInquiryRemoval = () => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await api.get('/blogs?related_page=hard-inquiry-removal&limit=4');
        setRelatedBlogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRelatedBlogs();
  }, []);

  const inquiryTypes = [
    {
      type: "Hard Inquiry",
      also: "Hard Pull",
      description: "Occurs when you apply for credit and authorize a lender to check your credit",
      impact: "5-10 points per inquiry, lasting up to 12 months for scoring purposes",
      stays: "2 years on credit report",
      examples: "Credit card applications, mortgage applications, auto loans, personal loans"
    },
    {
      type: "Soft Inquiry",
      also: "Soft Pull",
      description: "Background checks that don't affect your credit score",
      impact: "No score impact whatsoever",
      stays: "May appear on some reports but doesn't affect credit decisions",
      examples: "Pre-approval offers, employment checks, personal credit monitoring"
    }
  ];

  const removalStrategies = [
    {
      title: "Unauthorized Inquiry Dispute",
      description: "Challenge inquiries you never authorized or applied for.",
      effectiveness: "Most effective—unauthorized inquiries must be removed",
      details: [
        "Under FCRA, inquiries require 'permissible purpose'",
        "You must have authorized the credit check",
        "Dispute directly with the creditor AND bureaus",
        "Request proof of authorization from the creditor"
      ]
    },
    {
      title: "Rate Shopping Protection",
      description: "Multiple inquiries for same loan type within window count as one.",
      effectiveness: "Ensures proper scoring—FICO treats rate shopping inquiries as single inquiry",
      details: [
        "Mortgage inquiries: 45-day window under FICO",
        "Auto loan inquiries: 45-day window",
        "Student loan inquiries: 45-day window",
        "Older FICO versions: 14-day window",
        "Challenge if rate shopping inquiries counted separately"
      ]
    },
    {
      title: "Promotional/Prescreened Inquiry Removal",
      description: "Remove inquiries that should have been coded as soft pulls.",
      effectiveness: "Effective when creditor miscoded inquiry type",
      details: [
        "Pre-approval checks should be soft inquiries",
        "Insurance quotes should be soft inquiries",
        "Account reviews by existing creditors should be soft",
        "Dispute miscoded inquiries with documentation"
      ]
    },
    {
      title: "Creditor Goodwill Request",
      description: "Ask creditors to remove inquiries as a customer courtesy.",
      effectiveness: "Success varies—works best with existing relationship",
      details: [
        "Call creditor's customer service department",
        "Explain you're trying to improve credit for major purchase",
        "Ask if they can remove inquiry as courtesy",
        "More successful if you're an existing customer"
      ]
    }
  ];

  const fcraProvisions = [
    {
      section: "§ 604",
      title: "Permissible Purposes",
      description: "Credit reports can only be accessed for permissible purposes, which include legitimate credit applications, employment screening (with consent), insurance underwriting, and court-ordered access.",
      quote: "A consumer reporting agency may furnish a consumer report... only in accordance with the written instructions of the consumer to whom it relates."
    },
    {
      section: "§ 611",
      title: "Dispute Procedures",
      description: "Consumers have the right to dispute any inaccurate information, including inquiries. Bureaus must investigate within 30 days and remove unverifiable information.",
      quote: "If the completeness or accuracy of any item of information contained in a consumer's file... is disputed... the agency shall conduct a reasonable reinvestigation."
    },
    {
      section: "§ 616/617",
      title: "Civil Liability",
      description: "Companies that pull credit without permissible purpose may be liable for actual damages, statutory damages up to $1,000, and attorney's fees.",
      quote: "Any person who willfully fails to comply with any requirement imposed under this subchapter with respect to any consumer is liable to that consumer."
    }
  ];

  const inquiryFacts = [
    {
      myth: "Every inquiry drops your score significantly",
      reality: "Each inquiry typically causes only a 5-10 point drop, and the impact diminishes after 12 months"
    },
    {
      myth: "Checking your own credit hurts your score",
      reality: "Self-checks are soft inquiries and never affect your score"
    },
    {
      myth: "All inquiries stay for 7 years",
      reality: "Inquiries stay for only 2 years, not 7 like other negative items"
    },
    {
      myth: "You can't remove authorized inquiries",
      reality: "While difficult, goodwill requests and error corrections can remove some authorized inquiries"
    }
  ];

  const caselaw = [
    {
      name: "Trikas v. Universal Card Services Corp.",
      citation: "351 F. Supp. 2d 37 (E.D.N.Y. 2005)",
      holding: "Credit card company that pulled consumer's credit report without permissible purpose violated FCRA. Consumer awarded statutory and punitive damages.",
      significance: "Companies cannot access your credit without authorization—violations are actionable."
    },
    {
      name: "Phillips v. Grendahl",
      citation: "312 F.3d 357 (8th Cir. 2002)",
      holding: "Individual who accessed credit report for personal reasons without permissible purpose liable under FCRA.",
      significance: "Even individuals, not just companies, can be held liable for unauthorized credit pulls."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hard Inquiry Removal | Unauthorized Inquiry Disputes | Credlocity</title>
        <meta name="description" content="Remove unauthorized hard inquiries from your credit report. Learn how to dispute inquiries, understand rate shopping windows, and protect your credit score." />
        <link rel="canonical" href="https://www.credlocity.com/hard-inquiry-removal" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Hard Inquiry Removal: Complete Guide",
            "author": { "@type": "Organization", "name": "Credlocity" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="hard-inquiry-removal-page">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-indigo-800 via-indigo-700 to-purple-600 text-white py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">New Credit Factor</span>
              </div>
              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Hard Inquiry Removal
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Each unauthorized hard inquiry can cost you 5-10 points. Multiple inquiries compound the damage and signal risk to lenders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8" asChild>
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                    Start Free Consultation
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-700" asChild>
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
                <div className="text-4xl font-bold text-indigo-600 mb-2">-5</div>
                <p className="text-sm text-gray-600">Points per<br/>Inquiry (avg)</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">2</div>
                <p className="text-sm text-gray-600">Years on<br/>Report</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-green mb-2">62%</div>
                <p className="text-sm text-gray-600">Our Success<br/>Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">10%</div>
                <p className="text-sm text-gray-600">Of FICO<br/>Score</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hard vs Soft */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Hard vs. Soft Inquiries
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {inquiryTypes.map((type, index) => (
                  <div key={index} className={`rounded-xl p-6 ${index === 0 ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {index === 0 ? (
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-xl">{type.type}</h3>
                        <p className="text-sm text-gray-500">Also called: {type.also}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{type.description}</p>
                    <div className="space-y-2 text-sm">
                      <p><strong className={index === 0 ? 'text-red-600' : 'text-green-600'}>Score Impact:</strong> {type.impact}</p>
                      <p><strong>Duration:</strong> {type.stays}</p>
                      <p><strong>Examples:</strong> {type.examples}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Myths vs Reality */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Inquiry Myths vs. Reality
              </h2>
              <div className="space-y-4">
                {inquiryFacts.map((fact, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">✗</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-red-600 font-medium line-through">{fact.myth}</p>
                        <div className="flex items-start gap-2 mt-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700"><strong className="text-green-600">Reality:</strong> {fact.reality}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Removal Strategies */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Inquiry Removal Strategies
              </h2>
              <div className="space-y-6">
                {removalStrategies.map((strategy, index) => (
                  <div key={index} className="bg-white rounded-xl overflow-hidden shadow">
                    <button onClick={() => setExpandedSection(expandedSection === index ? null : index)} className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition">
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900">{strategy.title}</h3>
                        <p className="text-gray-600 mt-1">{strategy.description}</p>
                        <p className="text-sm text-indigo-600 mt-2 font-medium">{strategy.effectiveness}</p>
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
        <section className="py-16 bg-indigo-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                  <Gavel className="w-5 h-5" />
                  <span className="text-sm font-semibold">Federal Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  FCRA Inquiry Protections
                </h2>
              </div>

              <div className="space-y-6">
                {fcraProvisions.map((provision, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <span className="bg-white/20 text-white text-sm font-mono px-3 py-1 rounded mb-4 inline-block">{provision.section}</span>
                    <h3 className="font-semibold text-xl mb-3">{provision.title}</h3>
                    <p className="text-gray-200 mb-4">{provision.description}</p>
                    <blockquote className="border-l-4 border-secondary-light pl-4 italic text-gray-300">
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
                <Link to="/identity-theft-credit-repair" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Shield className="w-10 h-10 text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Identity Theft Resolution</h3>
                  <p className="text-gray-600 text-sm">Remove fraudulent inquiries from theft.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">Ready to Remove Unauthorized Inquiries?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Let us challenge inquiries you never authorized. Start your free consultation today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8" asChild>
                <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-700" asChild>
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
                  <p className="text-gray-600">Check back soon for articles about inquiry removal.</p>
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

export default HardInquiryRemoval;
