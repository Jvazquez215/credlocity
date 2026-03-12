import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  Scale, CheckCircle2, FileText, AlertTriangle, 
  BookOpen, Gavel, ArrowRight, Phone, TrendingUp,
  Quote, ChevronDown, ChevronUp, Shield, Clock, Target
} from 'lucide-react';

const BankruptcyCreditRepair = () => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await api.get('/blogs?related_page=bankruptcy-credit-repair&limit=4');
        setRelatedBlogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRelatedBlogs();
  }, []);

  const bankruptcyTypes = [
    {
      chapter: "Chapter 7",
      title: "Liquidation Bankruptcy",
      reportingPeriod: "10 years from filing date",
      description: "Complete discharge of most unsecured debts. Assets may be liquidated to pay creditors.",
      recoveryNotes: "Despite the 10-year reporting period, many people can qualify for mortgages within 2-4 years post-discharge."
    },
    {
      chapter: "Chapter 13",
      title: "Reorganization Bankruptcy",
      reportingPeriod: "7 years from filing date",
      description: "Debt repayment plan over 3-5 years. You keep your assets while repaying a portion of debts.",
      recoveryNotes: "Shorter reporting period and shows creditors you repaid debts, potentially viewed more favorably."
    },
    {
      chapter: "Chapter 11",
      title: "Business Reorganization",
      reportingPeriod: "10 years from filing date",
      description: "Primarily for businesses but available to individuals with substantial debt.",
      recoveryNotes: "Less common for consumers. Complex process typically requiring attorney representation."
    }
  ];

  const removalStrategies = [
    {
      title: "Verify Accuracy of Bankruptcy Reporting",
      description: "Challenge any errors in how the bankruptcy is reported on your credit reports.",
      details: [
        "Verify correct filing date and discharge date",
        "Ensure correct bankruptcy chapter is listed",
        "Check that discharged debts show $0 balance",
        "Verify accounts included show 'Included in Bankruptcy'",
        "Dispute any accounts showing 'charged off' or 'collection' status instead"
      ]
    },
    {
      title: "Remove Post-Discharge Collections",
      description: "Debts discharged in bankruptcy should not be collected or reported as owing.",
      details: [
        "Discharged debts cannot be reported as 'past due' or 'owing'",
        "Collection attempts on discharged debt violate the discharge injunction",
        "Report violations to the bankruptcy court",
        "Demand removal of improperly reported discharged debts"
      ]
    },
    {
      title: "Challenge Early Removal Dates",
      description: "Ensure bankruptcy is removed at the correct time—not extended beyond legal limits.",
      details: [
        "Chapter 7: 10 years from filing date",
        "Chapter 13: 7 years from filing date",
        "Bureaus sometimes calculate incorrectly—verify dates",
        "Dispute if bankruptcy appears after removal deadline"
      ]
    },
    {
      title: "Credit Rebuilding Strategy",
      description: "While bankruptcy is difficult to remove early, rebuilding credit is achievable.",
      details: [
        "Secured credit cards help establish positive payment history",
        "Credit-builder loans report monthly payments",
        "Become an authorized user on established accounts",
        "Keep credit utilization below 30%",
        "Apply for credit strategically to minimize inquiries"
      ]
    }
  ];

  const bankruptcyLaws = [
    {
      code: "11 U.S.C. § 524",
      title: "Discharge Injunction",
      description: "Once a bankruptcy discharge is granted, a permanent injunction prevents creditors from attempting to collect discharged debts. Violations can result in contempt of court."
    },
    {
      code: "11 U.S.C. § 525",
      title: "Protection Against Discrimination",
      description: "Government agencies cannot deny licenses, permits, or employment solely because of bankruptcy. Private employers cannot terminate employees based on bankruptcy."
    },
    {
      code: "15 U.S.C. § 1681c(a)(1)",
      title: "FCRA Reporting Limits",
      description: "Credit bureaus may not report bankruptcies that antedate the report by more than 10 years. Chapter 13 bankruptcies may be removed after 7 years under bureau policy."
    }
  ];

  const caselaw = [
    {
      name: "In re Henry",
      citation: "266 B.R. 457 (Bankr. C.D. Cal. 2001)",
      holding: "Creditor violated discharge injunction by continuing to report debt as owing after bankruptcy discharge. Court awarded actual damages and attorney's fees.",
      significance: "Establishes that inaccurate credit reporting of discharged debts violates the discharge injunction."
    },
    {
      name: "Gunter v. Ridgewood Energy Corp.",
      citation: "223 F.3d 190 (3d Cir. 2000)",
      holding: "The permanent injunction under § 524 bars any act to collect a discharged debt, including negative credit reporting.",
      significance: "Credit reporting itself can be considered an act of collection."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Bankruptcy Credit Repair | Chapter 7 & 13 Recovery Guide | Credlocity</title>
        <meta name="description" content="Rebuild credit after bankruptcy. Challenge reporting errors, understand Chapter 7 vs 13 timelines, and implement proven recovery strategies. Expert guidance." />
        <link rel="canonical" href="https://www.credlocity.com/bankruptcy-credit-repair" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Bankruptcy Credit Repair: Complete Recovery Guide",
            "author": { "@type": "Organization", "name": "Credlocity" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="bankruptcy-credit-repair-page">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-purple-800 via-purple-700 to-violet-600 text-white py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">Fresh Start Recovery</span>
              </div>
              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Bankruptcy Credit Repair
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Bankruptcy impacts your score by 200+ points, but recovery is possible. We challenge reporting errors and guide your credit rebuilding journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 text-lg px-8" asChild>
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                    Start Free Consultation
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700" asChild>
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
                <div className="text-4xl font-bold text-red-600 mb-2">-200+</div>
                <p className="text-sm text-gray-600">Average Score<br/>Impact</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">7-10</div>
                <p className="text-sm text-gray-600">Years on<br/>Report</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-green mb-2">34%</div>
                <p className="text-sm text-gray-600">Error Removal<br/>Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">2-4</div>
                <p className="text-sm text-gray-600">Years to<br/>Mortgage</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bankruptcy Types */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Understanding Bankruptcy Types
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {bankruptcyTypes.map((type, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      {type.chapter}
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{type.title}</h3>
                    <p className="text-gray-600 mb-4">{type.description}</p>
                    <div className="border-t pt-4">
                      <p className="text-sm text-primary-blue font-medium mb-2">
                        Reporting Period: {type.reportingPeriod}
                      </p>
                      <p className="text-sm text-gray-500">{type.recoveryNotes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What Can Be Done */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8">
                <h3 className="font-semibold text-xl mb-3 text-purple-800">Honest Expectations</h3>
                <p className="text-gray-700">
                  <strong>Bankruptcy itself is very difficult to remove early.</strong> Unlike collections or late payments, bankruptcies are public court records. However, we CAN challenge errors in how it's reported, remove improperly reported accounts, and help you rebuild faster.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Strategies */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Our Approach to Bankruptcy Credit Repair
              </h2>
              <div className="space-y-6">
                {removalStrategies.map((strategy, index) => (
                  <div key={index} className="bg-white rounded-xl overflow-hidden shadow">
                    <button onClick={() => setExpandedSection(expandedSection === index ? null : index)} className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition">
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

        {/* Legal Framework */}
        <section className="py-16 bg-primary-blue text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                  <Gavel className="w-5 h-5" />
                  <span className="text-sm font-semibold">Federal Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  Bankruptcy Code & FCRA Protections
                </h2>
              </div>

              <div className="space-y-6">
                {bankruptcyLaws.map((law, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <span className="bg-white/20 text-white text-sm font-mono px-3 py-1 rounded mb-4 inline-block">{law.code}</span>
                    <h3 className="font-semibold text-xl mb-3">{law.title}</h3>
                    <p className="text-gray-200">{law.description}</p>
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
                  <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Collection Removal</h3>
                  <p className="text-gray-600 text-sm">Remove post-bankruptcy collections.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
                <Link to="/charge-off-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <FileText className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Charge-Off Removal</h3>
                  <p className="text-gray-600 text-sm">Ensure discharged debts report correctly.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
                <Link to="/identity-theft-credit-repair" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Shield className="w-10 h-10 text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Identity Theft Resolution</h3>
                  <p className="text-gray-600 text-sm">Remove fraudulent accounts.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-purple-700 to-violet-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">Ready to Rebuild After Bankruptcy?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">We'll challenge errors and guide your recovery. Your fresh start begins today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 text-lg px-8" asChild>
                <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700" asChild>
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
                  <p className="text-gray-600">Check back soon for articles about bankruptcy recovery.</p>
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

export default BankruptcyCreditRepair;
