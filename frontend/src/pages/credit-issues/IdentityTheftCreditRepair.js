import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  Shield, CheckCircle2, FileText, Scale, AlertTriangle, 
  BookOpen, Gavel, ArrowRight, Phone, Lock,
  Quote, ChevronDown, ChevronUp, Clock, Target, UserX
} from 'lucide-react';

const IdentityTheftCreditRepair = () => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await api.get('/blogs?related_page=identity-theft-credit-repair&limit=4');
        setRelatedBlogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRelatedBlogs();
  }, []);

  const identityTheftTypes = [
    {
      type: "New Account Fraud",
      description: "Criminals open new credit accounts using your personal information",
      impact: "Multiple hard inquiries, collection accounts, charge-offs under your name",
      signs: "Credit denials, calls from unknown creditors, accounts you don't recognize"
    },
    {
      type: "Account Takeover",
      description: "Criminals gain access to your existing accounts and make unauthorized charges",
      impact: "Maxed out cards, late payments, negative marks on existing accounts",
      signs: "Statements with unrecognized charges, password reset emails, locked accounts"
    },
    {
      type: "Synthetic Identity Fraud",
      description: "Your SSN combined with fake information to create a new 'person'",
      impact: "Delayed impact—may not appear until synthetic identity defaults",
      signs: "Credit report shows addresses you've never lived at, unknown employers"
    },
    {
      type: "Tax Identity Theft",
      description: "Someone files a tax return using your SSN to claim your refund",
      impact: "IRS issues, employment verification problems, credit application denials",
      signs: "IRS notices about multiple returns, W-2 from unknown employer"
    }
  ];

  const recoveryProcess = [
    {
      title: "Step 1: File an Identity Theft Report",
      description: "Create an official record of the identity theft with the FTC and local police.",
      details: [
        "File at IdentityTheft.gov to get an FTC Identity Theft Report",
        "File a police report with your local law enforcement",
        "Request copies of both reports for your records",
        "These reports unlock enhanced dispute rights under FCRA"
      ]
    },
    {
      title: "Step 2: Place Fraud Alerts & Credit Freezes",
      description: "Prevent further damage by alerting bureaus and freezing your credit.",
      details: [
        "Initial fraud alert: 1 year, one bureau notifies others",
        "Extended fraud alert: 7 years, requires identity theft report",
        "Credit freeze: Prevents new account openings entirely",
        "Freezes are free under federal law (post-Equifax breach legislation)"
      ]
    },
    {
      title: "Step 3: Request FCRA 605B Block",
      description: "The most powerful tool for identity theft victims—permanent removal of fraudulent accounts.",
      details: [
        "Under FCRA § 605B, bureaus must block reporting of fraud-related items",
        "Must submit identity theft report and proof of identity",
        "4 business days to block information from reports",
        "Cannot be reinserted without certification of accuracy"
      ]
    },
    {
      title: "Step 4: Dispute with Creditors & Bureaus",
      description: "Challenge every fraudulent account with all parties involved.",
      details: [
        "Send disputes to all three credit bureaus with supporting documents",
        "Contact creditors' fraud departments directly",
        "Request complete transaction history for fraudulent accounts",
        "Demand deletion, not just 'disputed by consumer' notation"
      ]
    },
    {
      title: "Step 5: Monitor & Protect Going Forward",
      description: "Implement ongoing protection to prevent future fraud.",
      details: [
        "Enroll in free credit monitoring services",
        "Consider identity theft protection services",
        "Review credit reports quarterly at minimum",
        "Opt out of prescreened credit offers (OptOutPrescreen.com)"
      ]
    }
  ];

  const fcraProtections = [
    {
      section: "§ 605B",
      title: "Block of Information Resulting From Identity Theft",
      description: "Credit bureaus must block reporting of any information resulting from identity theft within 4 business days of receiving proper documentation.",
      quote: "A consumer reporting agency shall block the reporting of any information in the file of a consumer that the consumer identifies as information that resulted from an alleged identity theft."
    },
    {
      section: "§ 605A",
      title: "Fraud Alerts",
      description: "Consumers have the right to place initial (1-year) or extended (7-year) fraud alerts, requiring creditors to take reasonable steps to verify identity before opening new accounts.",
      quote: "A consumer reporting agency shall include an alert in the file of a consumer... that notifies users of the consumer report that the consumer may be a victim of fraud."
    },
    {
      section: "§ 609(e)",
      title: "Information Available to Victims",
      description: "Identity theft victims have the right to obtain records from creditors showing what accounts were opened fraudulently and all transaction records.",
      quote: "A business entity that has provided credit to... a person who has allegedly made unauthorized use of... a consumer's means of identification shall provide a copy of application and business transaction records."
    }
  ];

  const ftcRules = [
    {
      rule: "Identity Theft Rules (Red Flags Rule)",
      description: "Requires financial institutions to implement programs to detect, prevent, and mitigate identity theft.",
      impact: "Creditors who fail to detect obvious signs of fraud may be liable for resulting damages."
    },
    {
      rule: "Free Annual Credit Reports",
      description: "Identity theft victims are entitled to additional free credit reports beyond the standard annual report.",
      impact: "Can request free reports when placing fraud alerts or after being a fraud victim."
    },
    {
      rule: "Disposal Rule",
      description: "Businesses must properly dispose of consumer report information to prevent identity theft.",
      impact: "Companies that improperly dispose of your information may be liable if theft results."
    }
  ];

  const caselaw = [
    {
      name: "Sloane v. Equifax Information Services, LLC",
      citation: "510 F.3d 495 (4th Cir. 2007)",
      holding: "Credit bureaus cannot verify disputed information by simply accepting the creditor's automated response. They must conduct a reasonable investigation into claims of identity theft.",
      significance: "Establishes that bureaus must look beyond automated systems when fraud is alleged."
    },
    {
      name: "Cushman v. Trans Union Corp.",
      citation: "115 F.3d 220 (3d Cir. 1997)",
      holding: "A credit bureau's failure to verify account information and reliance on automated dispute resolution can constitute a willful violation of the FCRA.",
      significance: "Consumers can recover punitive damages for bureaus' willful failures in fraud disputes."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Identity Theft Credit Repair | FCRA 605B Process | Credlocity</title>
        <meta name="description" content="Expert identity theft resolution using FCRA 605B credit blocks. Remove fraudulent accounts, recover your identity, and restore your credit. 89% success rate." />
        <link rel="canonical" href="https://www.credlocity.com/identity-theft-credit-repair" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Identity Theft Credit Repair: Complete Recovery Guide",
            "author": { "@type": "Organization", "name": "Credlocity" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="identity-theft-credit-repair-page">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-600 text-white py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">FCRA 605B Protection</span>
              </div>
              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Identity Theft Credit Repair
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                15 million Americans are victims of identity theft annually. We use specialized federal procedures to remove fraudulent accounts and restore your credit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8" asChild>
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">
                    Start Recovery Now
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700" asChild>
                  <a href="tel:+12151234567"><Phone className="w-5 h-5 mr-2" />Emergency Line</a>
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
                <div className="text-4xl font-bold text-blue-600 mb-2">15M</div>
                <p className="text-sm text-gray-600">Americans<br/>Affected/Year</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">-150</div>
                <p className="text-sm text-gray-600">Average Score<br/>Damage</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-green mb-2">89%</div>
                <p className="text-sm text-gray-600">Our Success<br/>Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">4</div>
                <p className="text-sm text-gray-600">Days to<br/>Block</p>
              </div>
            </div>
          </div>
        </section>

        {/* Types of Identity Theft */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Types of Identity Theft
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {identityTheftTypes.map((type, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <UserX className="w-8 h-8 text-red-500" />
                      <h3 className="font-semibold text-xl">{type.type}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{type.description}</p>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-red-600">Impact:</strong> {type.impact}</p>
                      <p><strong className="text-blue-600">Warning Signs:</strong> {type.signs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recovery Process */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-8 text-center">
                Identity Theft Recovery Process
              </h2>
              <div className="space-y-6">
                {recoveryProcess.map((step, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === index ? null : index)} className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-100 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl text-gray-900">{step.title}</h3>
                          <p className="text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                      {expandedSection === index ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                    </button>
                    {expandedSection === index && (
                      <div className="px-6 pb-6 border-t ml-14">
                        <ul className="mt-4 space-y-3">
                          {step.details.map((detail, i) => (
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

        {/* FCRA Protections */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                  <Gavel className="w-5 h-5" />
                  <span className="text-sm font-semibold">Federal Law</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                  FCRA Identity Theft Protections
                </h2>
                <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                  The Fair Credit Reporting Act provides powerful tools specifically for identity theft victims.
                </p>
              </div>

              <div className="space-y-6">
                {fcraProtections.map((protection, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <span className="bg-secondary-green text-white text-sm font-mono px-3 py-1 rounded mb-4 inline-block">{protection.section}</span>
                    <h3 className="font-semibold text-xl mb-3">{protection.title}</h3>
                    <p className="text-gray-200 mb-4">{protection.description}</p>
                    <blockquote className="border-l-4 border-secondary-light pl-4 italic text-gray-300">
                      "{protection.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FTC Rules */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                  <BookOpen className="w-5 h-5 text-green-700" />
                  <span className="text-sm font-semibold text-green-700">FTC Consumer Protection</span>
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
                  FTC Rules & Regulations
                </h2>
              </div>

              <div className="space-y-6">
                {ftcRules.map((rule, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border-l-4 border-secondary-green">
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">{rule.rule}</h3>
                    <p className="text-gray-700 mb-3">{rule.description}</p>
                    <p className="text-sm text-secondary-green font-medium"><strong>Impact:</strong> {rule.impact}</p>
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
                  <p className="text-gray-600 text-sm">Remove fraudulent collections.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
                <Link to="/hard-inquiry-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <Target className="w-10 h-10 text-indigo-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Inquiry Removal</h3>
                  <p className="text-gray-600 text-sm">Remove unauthorized hard inquiries.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
                <Link to="/charge-off-removal" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group">
                  <FileText className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-blue transition">Charge-Off Removal</h3>
                  <p className="text-gray-600 text-sm">Remove fraudulent charge-offs.</p>
                  <span className="text-primary-blue font-medium text-sm mt-3 inline-flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">Don't Let Identity Thieves Win</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Our 89% success rate on identity theft cases means we know how to fight for you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8" asChild>
                <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700" asChild>
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
                  <p className="text-gray-600">Check back soon for articles about identity theft recovery.</p>
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

export default IdentityTheftCreditRepair;
