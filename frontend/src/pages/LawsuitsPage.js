import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Filter, Scale, Star, CheckCircle, TrendingUp, AlertCircle, Info } from 'lucide-react';

const LawsuitsPage = () => {
  const navigate = useNavigate();
  const [lawsuits, setLawsuits] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredLawsuits, setFilteredLawsuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    Promise.all([fetchLawsuits(), fetchReviews()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    filterLawsuits();
  }, [lawsuits, searchTerm, categoryFilter, typeFilter]);

  const fetchLawsuits = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuits`);
      if (response.ok) {
        const data = await response.json();
        setLawsuits(data);
      }
    } catch (error) {
      console.error('Error fetching lawsuits:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuits/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const filterLawsuits = () => {
    let filtered = [...lawsuits];

    if (searchTerm) {
      filtered = filtered.filter(lawsuit =>
        lawsuit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawsuit.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawsuit.brief_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lawsuit => lawsuit.lawsuit_category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(lawsuit => lawsuit.lawsuit_type === typeFilter);
    }

    setFilteredLawsuits(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": "Credlocity Credit Repair Lawsuits",
    "description": "Legal actions filed by Credlocity on behalf of consumers against credit bureaus for inaccurate reporting and FCRA violations",
    "url": "https://credlocity.com/lawsuits",
    "serviceType": "Credit Repair Legal Services",
    "areaServed": "United States",
    "provider": {
      "@type": "Organization",
      "name": "Credlocity",
      "url": "https://credlocity.com"
    },
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  };

  return (
    <>
      <Helmet>
        <title>Credit Repair Lawsuits | Sue Credit Bureaus | Credlocity Legal Services</title>
        <meta 
          name="description" 
          content="Credlocity files lawsuits against credit bureaus for FCRA violations. Learn how to sue credit bureaus for inaccurate credit reporting. Free consultation available." 
        />
        <meta 
          name="keywords" 
          content="credit repair lawsuit, credit bureau lawsuit, how to sue credit bureau, FCRA lawsuit, credit repair legal action, sue Equifax, sue Experian, sue TransUnion, credit reporting lawsuit" 
        />
        <meta property="og:title" content="Credit Repair Lawsuits - Take Legal Action Against Credit Bureaus" />
        <meta property="og:description" content="View lawsuits filed by Credlocity against credit bureaus for FCRA violations and inaccurate credit reporting." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://credlocity.com/lawsuits" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Repair Lawsuits | Credlocity" />
        <meta name="twitter:description" content="Legal actions filed against credit bureaus for consumer protection." />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Scale className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Credit Repair Lawsuits
            </h1>
            <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto opacity-90">
              Taking Legal Action Against Credit Bureaus for Consumer Protection
            </p>
            <p className="text-lg max-w-4xl mx-auto opacity-80">
              Credlocity files lawsuits against credit bureaus under the Fair Credit Reporting Act (FCRA) 
              to protect consumers from inaccurate credit reporting and credit score damage.
            </p>
          </div>
        </div>

        {/* Important Legal Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Important Legal Disclosure</h3>
                <p className="text-gray-700 mb-3">
                  <strong>Credlocity is not a law firm and does not provide legal advice.</strong> Any information contained herein is not and shall not be considered legal advice. We operate as authorized representatives under Philadelphia Small Claims Court's unique justice system, which allows us to file and litigate small claims actions on behalf of our clients.
                </p>
                <p className="text-gray-700">
                  <strong>Note:</strong> Small claims actions can only result in monetary awards and cannot order defendants to take any action except payment. Before filing lawsuits, we always attempt the dispute process first.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How We Help Section */}
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Legal Process</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-bold text-xl mb-3">Dispute Process</h3>
                <p className="text-gray-600">We first attempt to resolve credit report errors through the formal dispute process with credit bureaus.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-bold text-xl mb-3">Small Claims Action</h3>
                <p className="text-gray-600">If disputes fail, we file small claims lawsuits as authorized representatives to seek monetary compensation for violations.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-bold text-xl mb-3">Attorney Referral</h3>
                <p className="text-gray-600">For cases requiring injunctive or equitable relief, we recommend qualified attorneys in our network.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Terms Explanation */}
        <div className="bg-blue-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Understanding Legal Relief Types</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <h3 className="font-bold text-xl text-gray-900">Injunctive Relief</h3>
                </div>
                <p className="text-gray-700">
                  A court order requiring a party to do something or stop doing something. For example, ordering a credit bureau to remove false information from your credit report. This type of relief requires filing in federal or state court, not small claims court.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <h3 className="font-bold text-xl text-gray-900">Equitable Relief</h3>
                </div>
                <p className="text-gray-700">
                  Court-ordered actions based on fairness rather than monetary compensation. Examples include ordering specific performance of a contract, preventing harm, or correcting injustices. Like injunctive relief, this requires federal or state court proceedings.
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-700 max-w-3xl mx-auto">
                When we determine that injunctive or equitable relief would better serve your case, we'll walk you through the process and recommend qualified attorneys from our network who can represent you in federal or state court.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{lawsuits.length}+</div>
                <div className="text-gray-600 text-sm">Lawsuits Filed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$5M+</div>
                <div className="text-gray-600 text-sm">Won for Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">17+</div>
                <div className="text-gray-600 text-sm">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 bg-blue-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Why File a Credit Bureau Lawsuit?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Hold Bureaus Accountable</h3>
                  <p className="text-gray-600 text-sm">Credit bureaus must follow FCRA laws. Legal action ensures compliance.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Improve Your Credit</h3>
                  <p className="text-gray-600 text-sm">Remove inaccurate items and boost your credit score.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Scale className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Get Compensation</h3>
                  <p className="text-gray-600 text-sm">Recover damages for harm caused by credit reporting errors.</p>
                </div>
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Success Stories: Lawsuit Clients
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.slice(0, 6).map((review, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(5)}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{review.testimonial_text}"</p>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{review.client_name}</p>
                        <p className="text-gray-500">{review.location}</p>
                      </div>
                      {review.before_score && review.after_score && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Score Increase</p>
                          <p className="font-bold text-green-600">
                            +{review.after_score - review.before_score} pts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search lawsuits (FCRA, Equifax, etc.)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Client">On Behalf of Client</option>
                  <option value="Industry">Credit Repair Industry</option>
                  <option value="Nationwide">Consumer Nationwide</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="FCRA">FCRA Violations</option>
                  <option value="FCBA">FCBA Violations</option>
                  <option value="FDCPA">FDCPA Violations</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading lawsuits...</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-6">
              {filteredLawsuits.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No lawsuits found</h3>
                  <p className="text-gray-500">
                    {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Check back soon for updates on our legal actions'}
                  </p>
                </div>
              ) : (
                filteredLawsuits.map((lawsuit) => (
                  <div
                    key={lawsuit.id}
                    onClick={() => navigate(`/lawsuits/${lawsuit.slug}`)}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex-1 hover:text-blue-600 transition">
                        {lawsuit.title}
                      </h2>
                      <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold whitespace-nowrap">
                        {lawsuit.lawsuit_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Case Number</span>
                        <p className="font-medium text-gray-900">{lawsuit.case_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Category</span>
                        <p className="font-medium text-gray-900">{lawsuit.lawsuit_category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Topic</span>
                        <p className="font-medium text-gray-900">{lawsuit.topic}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date Filed</span>
                        <p className="font-medium text-gray-900">{formatDate(lawsuit.date_filed)}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{lawsuit.brief_description}</p>

                    {lawsuit.related_company && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Related to:</span>
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                          {lawsuit.related_company}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <span className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-2">
                        View Full Details & Documents
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Have You Been Affected by Inaccurate Credit Reporting?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              You may have grounds for a lawsuit. Get a free consultation with our team today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
              >
                Start Your Free Trial
              </button>
              <button
                onClick={() => window.location.href = 'mailto:Admin@credlocity.com'}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
              >
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LawsuitsPage;