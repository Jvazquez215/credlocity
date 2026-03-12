import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Scale, DollarSign, Users, Shield, TrendingUp, FileText, 
  CheckCircle, ArrowRight, Briefcase, Award, Clock, Gavel,
  Building2, Phone, Mail, Globe, Linkedin, Star, Quote
} from 'lucide-react';

const AttorneyPartners = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    firm_name: '',
    linkedin_handle: '',
    website: '',
    email: '',
    phone: '',
    bar_number: '',
    bar_state: '',
    has_insurance: '',
    ever_suspended: '',
    suspension_details: '',
    main_practice_area: '',
    additional_practice_areas: [],
    how_heard_about_us: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [attorneyReviews, setAttorneyReviews] = useState([]);

  // Fetch attorney testimonials from CMS
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews?review_category=attorney_testimonials`);
        if (response.ok) {
          const data = await response.json();
          setAttorneyReviews(data.slice(0, 6)); // Show up to 6 reviews
        }
      } catch (err) {
        console.error('Error fetching attorney reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  const practiceAreas = [
    'Consumer Protection',
    'FDCPA (Fair Debt Collection)',
    'FCRA (Fair Credit Reporting)',
    'TCPA (Telephone Consumer Protection)',
    'Class Action',
    'Personal Injury',
    'Employment Law',
    'Real Estate Law',
    'Bankruptcy',
    'General Civil Litigation',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'additional_practice_areas') {
      const areas = [...formData.additional_practice_areas];
      if (checked) {
        areas.push(value);
      } else {
        const index = areas.indexOf(value);
        if (index > -1) areas.splice(index, 1);
      }
      setFormData({ ...formData, additional_practice_areas: areas });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/attorneys/public/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in joining the Credlocity Attorney Network. 
            Our team will review your application and contact you within <strong>24-48 hours</strong>.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">What Happens Next:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. We verify your bar membership and credentials</li>
              <li>2. Our team reviews your application</li>
              <li>3. You'll receive an approval email with login credentials</li>
              <li>4. Access the Attorney Marketplace and start receiving cases</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Attorney Referral Network | Consumer Law Cases | Credlocity</title>
        <meta name="description" content="Join Credlocity's Attorney Referral Network. Access pre-qualified FDCPA, FCRA, and TCPA cases. Earn $500+ per case with transparent commission structure. No upfront costs." />
        <meta name="keywords" content="attorney referral network, consumer law cases, FDCPA attorney, FCRA attorney, TCPA attorney, credit repair attorney, debt collection attorney, consumer protection lawyer" />
        <meta property="og:title" content="Join Credlocity's Attorney Referral Network" />
        <meta property="og:description" content="Access high-value consumer protection cases. FDCPA, FCRA, TCPA violations with strong evidence packages." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://credlocity.com/partners/attorneys" />
        
        {/* Schema.org structured data for Attorney Network */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Credlocity Attorney Referral Network",
            "description": "Legal case referral network specializing in consumer protection, FDCPA, FCRA, and TCPA cases",
            "serviceType": "Legal Case Referral",
            "areaServed": "United States",
            "provider": {
              "@type": "Organization",
              "name": "Credlocity Business Group LLC",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1500 Chestnut Street, Suite 2",
                "addressLocality": "Philadelphia",
                "addressRegion": "PA",
                "postalCode": "19102",
                "addressCountry": "US"
              }
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDE0ek0zNiAyNnYySDI0di0yaDE0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
                <Scale className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium">Attorney Referral Network</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Grow Your Practice with 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"> Pre-Qualified Cases</span>
              </h1>
              
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Join Credlocity's exclusive attorney network and gain access to a steady stream of 
                high-value consumer protection cases. Our clients have already documented violations—
                you focus on winning.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No Upfront Costs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Pre-Screened Cases</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Transparent Fees</span>
                </div>
              </div>

              <a 
                href="#apply" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold px-8 py-4 rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg hover:shadow-xl"
              >
                Apply to Join Network
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold mb-6">Quick Network Stats</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-1">$2.5M+</div>
                    <div className="text-sm text-gray-400">Settlements This Year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-1">150+</div>
                    <div className="text-sm text-gray-400">Active Attorneys</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-1">89%</div>
                    <div className="text-sm text-gray-400">Case Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-1">$8,500</div>
                    <div className="text-sm text-gray-400">Avg. Settlement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Case Types Available in Our Marketplace
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We specialize in consumer protection violations. All cases come with documented evidence and pre-screened clients.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">FDCPA Violations</h3>
              <p className="text-gray-600 mb-4">
                Debt collector harassment, calls at prohibited hours, false threats, third-party disclosure violations.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                Avg. Settlement: $5,000 - $15,000
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">FCRA Violations</h3>
              <p className="text-gray-600 mb-4">
                Inaccurate reporting, failure to investigate disputes, mixed credit files, unauthorized inquiries.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                Avg. Settlement: $3,000 - $25,000
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-600 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Phone className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">TCPA Violations</h3>
              <p className="text-gray-600 mb-4">
                Robocalls without consent, repeated calls after opt-out, autodialer violations, prerecorded messages.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                Avg. Settlement: $500 - $1,500/call
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Gavel className="w-16 h-16 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">Class Action Opportunities</h3>
                <p className="text-amber-800">
                  We also identify potential class action cases involving systematic violations affecting multiple consumers. 
                  These cases offer significantly higher settlement potential and are available through our competitive bidding system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How the Attorney Marketplace Works
            </h2>
            <p className="text-lg text-gray-600">
              A transparent, efficient process from case discovery to settlement
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Apply & Get Approved",
                description: "Submit your application with bar credentials. We verify and approve within 24-48 hours.",
                icon: <Award className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Browse Cases",
                description: "Access our marketplace with detailed case summaries, evidence strength scores, and estimated values.",
                icon: <Briefcase className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Pledge or Bid",
                description: "Standard cases: Pledge immediately. High-value cases: Submit competitive bids with bonus offers.",
                icon: <DollarSign className="w-8 h-8" />
              },
              {
                step: "04",
                title: "Work & Settle",
                description: "Receive full case package, work with client, and settle. We handle our commission at closing.",
                icon: <CheckCircle className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 h-full border-2 border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="text-5xl font-bold text-blue-100 mb-4">{item.step}</div>
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-gray-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Transparent Fee Structure
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Our fee is simple: a flat $500 referral fee + commission on settlement. No hidden costs.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-6 text-yellow-400">Commission Tiers</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-300">Under $5,000</span>
                    <span className="font-bold text-white">$500 flat fee only</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-300">$5,001 - $7,999</span>
                    <span className="font-bold text-white">$500 + 3%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-300">$8,000 - $10,999</span>
                    <span className="font-bold text-white">$500 + 4%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-300">$11,000 - $14,999</span>
                    <span className="font-bold text-white">$500 + 5%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-300">$15,000 - $19,999</span>
                    <span className="font-bold text-white">$500 + 10%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-300">$20,000+</span>
                    <span className="font-bold text-white">$500 + 10% + 5%/tier</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Example Calculation</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Settlement Amount:</span>
                    <span className="text-white font-bold">$12,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Referral Fee (non-negotiable):</span>
                    <span className="text-white">$500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commission (5% of $12,000):</span>
                    <span className="text-white">$600</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between">
                    <span className="text-yellow-400 font-bold">Total to Credlocity:</span>
                    <span className="text-yellow-400 font-bold">$1,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400 font-bold">Your Share:</span>
                    <span className="text-green-400 font-bold">$10,900</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  * Attorney fees and costs collected separately from defendant as allowed by statute
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Network Requirements
            </h2>
            <p className="text-lg text-gray-600">
              We maintain high standards to protect our clients and your reputation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Active Bar License", desc: "Must be in good standing in at least one U.S. jurisdiction" },
              { title: "Professional Liability Insurance", desc: "Minimum coverage required for consumer protection cases" },
              { title: "No Disciplinary History", desc: "No suspensions, disbarments, or pending disciplinary actions" },
              { title: "Consumer Law Experience", desc: "Preferred experience in FDCPA, FCRA, TCPA, or related areas" },
              { title: "Case Update Commitment", desc: "Agree to provide status updates every 30 days on active cases" },
              { title: "Ethical Practice Agreement", desc: "Sign our terms of service and ethical practice guidelines" }
            ].map((req, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{req.title}</h4>
                  <p className="text-sm text-gray-600">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Apply to Join the Network
            </h2>
            <p className="text-lg text-blue-100">
              Complete the application below. We'll review and respond within 24-48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Firm Information */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Firm Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name *</label>
                  <input
                    type="text"
                    name="firm_name"
                    value={formData.firm_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Linkedin className="w-4 h-4 inline mr-1" />
                    LinkedIn Handle
                  </label>
                  <input
                    type="text"
                    name="linkedin_handle"
                    value={formData.linkedin_handle}
                    onChange={handleChange}
                    placeholder="e.g., john-smith-attorney"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Firm Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bar Information */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Bar Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bar Number *</label>
                  <input
                    type="text"
                    name="bar_number"
                    value={formData.bar_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bar State *</label>
                  <select
                    name="bar_state"
                    value={formData.bar_state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="DC">District of Columbia</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compliance Questions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Compliance Questions
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have professional liability (malpractice) insurance? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="has_insurance"
                        value="yes"
                        checked={formData.has_insurance === 'yes'}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="has_insurance"
                        value="no"
                        checked={formData.has_insurance === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you ever been suspended or disciplined by your state bar? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="ever_suspended"
                        value="yes"
                        checked={formData.ever_suspended === 'yes'}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="ever_suspended"
                        value="no"
                        checked={formData.ever_suspended === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                  
                  {formData.ever_suspended === 'yes' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please provide details:
                      </label>
                      <textarea
                        name="suspension_details"
                        value={formData.suspension_details}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Explain the circumstances and resolution..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Practice Area */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Practice Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Practice Area *
                  </label>
                  <select
                    name="main_practice_area"
                    value={formData.main_practice_area}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Primary Practice Area</option>
                    {practiceAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Practice Areas (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {practiceAreas.filter(a => a !== formData.main_practice_area).map(area => (
                      <label key={area} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="additional_practice_areas"
                          value={area}
                          checked={formData.additional_practice_areas.includes(area)}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How did you hear about us?
                  </label>
                  <select
                    name="how_heard_about_us"
                    value={formData.how_heard_about_us}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an option</option>
                    <option value="google">Google Search</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral from Colleague</option>
                    <option value="bar_association">Bar Association</option>
                    <option value="social_media">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting, you agree to our Terms of Service and Privacy Policy. 
                We will verify your bar membership before approval.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Attorney Testimonials Section */}
      {attorneyReviews.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                What Attorneys Say About Us
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Hear from attorneys who have grown their practice with Credlocity's referral network
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attorneyReviews.map((review, index) => (
                <div 
                  key={review.id || index} 
                  className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {review.client_photo_url ? (
                      <img 
                        src={review.client_photo_url} 
                        alt={review.client_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                        {review.client_name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{review.client_name}</h4>
                      {review.attorney_firm_name && (
                        <p className="text-sm text-blue-600">{review.attorney_firm_name}</p>
                      )}
                      {review.location && (
                        <p className="text-sm text-gray-500">{review.location}</p>
                      )}
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Video testimonial button */}
                  {(review.attorney_profile_video_url || review.video_url) && (
                    <div className="mb-4">
                      <a 
                        href={review.attorney_profile_video_url || review.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Watch Video Testimonial
                      </a>
                    </div>
                  )}
                  
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                    <p className="text-gray-700 italic pl-6 leading-relaxed">
                      "{review.testimonial_text || review.review_text}"
                    </p>
                  </div>

                  {/* Settlement amount */}
                  {review.attorney_settlement_amount && (
                    <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Client Recovery:</span>
                        <span className="font-bold text-green-700">
                          ${review.attorney_settlement_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Points breakdown */}
                  {(review.credlocity_points_gained || review.attorney_points_gained || (review.before_score && review.after_score)) && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div className="text-sm font-medium text-gray-700">Client Credit Improvement:</div>
                      
                      {review.credlocity_points_gained && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Credlocity Credit Repair:</span>
                          <span className="font-semibold text-blue-600">+{review.credlocity_points_gained} pts</span>
                        </div>
                      )}
                      
                      {review.attorney_points_gained && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Attorney Legal Action:</span>
                          <span className="font-semibold text-green-600">+{review.attorney_points_gained} pts</span>
                        </div>
                      )}
                      
                      {!review.credlocity_points_gained && !review.attorney_points_gained && review.before_score && review.after_score && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Total Improvement:</span>
                          <span className="font-semibold text-green-600">
                            +{review.after_score - review.before_score} pts
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Link to client review */}
                  {review.linked_client_review_name && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <a 
                        href={`/success-stories/${review.linked_client_review_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Users className="w-4 h-4" />
                        Read {review.linked_client_review_name}'s Story
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How quickly can I start receiving cases?",
                a: "Once approved (typically 24-48 hours), you can immediately access our case marketplace and start pledging or bidding on cases."
              },
              {
                q: "What makes your cases different from other referral networks?",
                a: "Our cases come from our credit repair clients who have already documented their experiences. We pre-screen all cases for merit, provide evidence summaries, and handle client communication throughout the process."
              },
              {
                q: "Is the $500 referral fee negotiable?",
                a: "No, the $500 referral fee is non-negotiable and is due upon successful settlement. This ensures quality case flow and maintains our screening standards."
              },
              {
                q: "What happens if I need to withdraw from a case?",
                a: "You must notify us within 48 hours if you cannot proceed with a pledged case. Repeated withdrawals may affect your standing in the network."
              },
              {
                q: "How do the 30-day case updates work?",
                a: "Every 30 days, you'll receive a notification to update the status of your active cases. This helps us keep clients informed and ensures cases are progressing."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AttorneyPartners;
