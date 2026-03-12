import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  AlertTriangle, Shield, CheckCircle, Building2, Search, 
  Star, MessageSquare, ChevronRight, Users, Play, Video,
  Clock, ExternalLink, Flag, Twitter, Facebook, Instagram, Linkedin
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Social Icon Links Component
const SocialIcons = ({ complaint, size = "w-4 h-4" }) => {
  const socials = [
    { key: 'social_twitter', icon: Twitter, color: 'text-[#1DA1F2]', label: 'Twitter' },
    { key: 'social_facebook', icon: Facebook, color: 'text-[#4267B2]', label: 'Facebook' },
    { key: 'social_instagram', icon: Instagram, color: 'text-[#E4405F]', label: 'Instagram' },
    { key: 'social_linkedin', icon: Linkedin, color: 'text-[#0077B5]', label: 'LinkedIn' },
    { key: 'social_tiktok', icon: () => <span className="font-bold text-xs">TT</span>, color: 'text-black', label: 'TikTok' },
    { key: 'social_threads', icon: () => <span className="font-bold">@</span>, color: 'text-black', label: 'Threads' },
    { key: 'social_bluesky', icon: () => <span className="font-bold text-xs">BS</span>, color: 'text-blue-500', label: 'Bluesky' }
  ];

  const activeSocials = socials.filter(s => complaint[s.key]);
  
  if (activeSocials.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {activeSocials.map(({ key, icon: Icon, color, label }) => (
        <a
          key={key}
          href={complaint[key].startsWith('http') ? complaint[key] : `https://${complaint[key]}`}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className={`${color} hover:opacity-70 transition-opacity`}
        >
          {typeof Icon === 'function' ? <Icon /> : <Icon className={size} />}
        </a>
      ))}
    </div>
  );
};

// Star Rating Display
const StarRating = ({ rating, size = "w-4 h-4" }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

// Review Card Component
const ReviewCard = ({ review, compact = false }) => {
  const hasVideo = review.video_review_url;
  
  return (
    <div className={`bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
            {review.display_name?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{review.display_name || 'Anonymous'}</span>
              <SocialIcons complaint={review} />
              {hasVideo && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <Play className="w-3 h-3" /> Video
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {review.complainant_city && `${review.complainant_city}, `}{review.complainant_state} • {formatDate(review.published_at)}
            </p>
          </div>
        </div>
        <StarRating rating={review.star_rating || 1} />
      </div>

      {review.complaint_types?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {review.complaint_types.slice(0, 3).map((type, i) => (
            <span 
              key={i}
              className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      <p className={`text-gray-700 ${compact ? 'line-clamp-2 text-sm' : 'line-clamp-3'} mb-4`}>
        {review.complaint_details}
      </p>

      {review.amount_paid && (
        <div className="text-sm text-red-600 font-medium mb-3">
          ${review.amount_paid.toLocaleString()} lost
        </div>
      )}

      {review.admin_findings && !compact && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs mb-1">
            <Shield className="w-3 h-3" />
            Credlocity Findings
          </div>
          <p className="text-xs text-blue-700 line-clamp-2">{review.admin_findings}</p>
        </div>
      )}

      <Link 
        to={`/credit-repair-reviews/review/${review.seo?.url_slug || review.id}`}
        className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1"
      >
        Read entire story <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

// Company Section Component
const CompanySection = ({ company, reviews, maxShow = 5 }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, maxShow);
  
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{company.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              {company.avg_rating > 0 && (
                <>
                  <span>•</span>
                  <StarRating rating={Math.round(company.avg_rating)} size="w-3 h-3" />
                  <span>{company.avg_rating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {reviews.length > maxShow && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All ${reviews.length}`}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} compact />
        ))}
      </div>
    </div>
  );
};

const CreditRepairReviews = () => {
  const { companySlug, reviewSlug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/credit-repair/reviews-page-data`);
      if (response.ok) {
        const data = await response.json();
        setPageData(data);
      }
    } catch (err) {
      console.error('Error fetching page data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group companies that have reviews
  const companiesWithReviews = pageData?.companies?.filter(c => 
    pageData?.complaints_by_company?.[c.id]?.length > 0
  ) || [];

  const filteredCompanies = companiesWithReviews.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Credit Repair Company Reviews & Complaints | Credlocity</title>
        <meta name="description" content="Read real consumer complaints and reviews about credit repair companies. The BBB for credit repair - find out which companies have the most complaints and protect yourself from scams." />
        <meta name="keywords" content="credit repair reviews, credit repair complaints, credit repair scams, credit repair company ratings, credit repair fraud, best credit repair companies, lexington law reviews, creditrepair.com reviews" />
        <meta property="og:title" content="Credit Repair Company Reviews & Consumer Complaints" />
        <meta property="og:description" content="Real consumer reviews and complaints about credit repair companies. Make informed decisions before hiring a credit repair service." />
        <link rel="canonical" href="https://credlocity.com/credit-repair-reviews" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Credit Repair Company Reviews",
            "description": "Consumer complaints and reviews about credit repair companies - The BBB for Credit Repair",
            "publisher": {
              "@type": "Organization",
              "name": "Credlocity Business Group LLC"
            }
          })}
        </script>
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
                <Shield className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-medium">The BBB for Credit Repair & Debt Settlement</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Credit Repair Company Reviews
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Real complaints from real consumers. Research credit repair companies before 
                trusting them with your credit and your money.
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{pageData?.stats?.total_complaints || 0}</p>
                <p className="text-blue-200 text-sm">Reviews Filed</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{pageData?.stats?.total_companies || 0}</p>
                <p className="text-blue-200 text-sm">Companies Tracked</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">100%</p>
                <p className="text-blue-200 text-sm">Verified Reviews</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">Free</p>
                <p className="text-blue-200 text-sm">To Report</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bad Experience CTA Box */}
        <section className="py-8 bg-gradient-to-r from-red-600 to-red-700">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Been Scammed by a Credit Repair Company?
                </h2>
                <p className="text-red-100">
                  Share your experience and help protect other consumers. Your story matters.
                </p>
              </div>
              <Link to="/submit-complaint">
                <Button className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 py-6 text-lg">
                  <Flag className="w-5 h-5 mr-2" />
                  File a Complaint
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="bg-white border-b py-6 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search credit repair companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : (
              <>
                {/* Companies with Reviews */}
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <CompanySection 
                      key={company.id}
                      company={company}
                      reviews={pageData?.complaints_by_company?.[company.id] || []}
                      maxShow={5}
                    />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500 mb-6">Be the first to share your experience</p>
                    <Link to="/submit-complaint">
                      <Button className="bg-red-600 hover:bg-red-700">
                        Submit a Review
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Recent Reviews Sidebar (for companies without dedicated sections) */}
                {pageData?.recent_complaints?.length > 0 && (
                  <div className="mt-12 pt-12 border-t">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-blue-600" />
                      Recent Reviews
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pageData.recent_complaints.slice(0, 6).map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Why Credlocity Section */}
        <section className="py-16 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Why Choose Credlocity for Your Credit Repair?
            </h2>
            <p className="text-blue-200 text-center mb-12 max-w-2xl mx-auto">
              Unlike the companies being reviewed here, Credlocity stands behind our service with 
              industry-leading guarantees and transparency.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl mb-3">🆓</div>
                <h3 className="font-bold text-lg mb-2">30-Day Free Trial</h3>
                <p className="text-blue-200 text-sm">
                  Try our service completely free. No credit card required.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-bold text-lg mb-2">180-Day Money Back</h3>
                <p className="text-blue-200 text-sm">
                  100% money back guarantee for 180 days. No questions asked.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-bold text-lg mb-2">Investigative Journalism</h3>
                <p className="text-blue-200 text-sm">
                  We expose fraud and scams in the credit repair industry.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="font-bold text-lg mb-2">Exclusive Attorney Network</h3>
                <p className="text-blue-200 text-sm">
                  Access to our network of consumer protection attorneys.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-bold text-lg mb-2">Trusted Affiliates</h3>
                <p className="text-blue-200 text-sm">
                  Partnerships with realtors, mortgage companies, and influencers.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-bold text-lg mb-2">Transparent Process</h3>
                <p className="text-blue-200 text-sm">
                  See exactly what we're doing to repair your credit.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/get-started">
                <Button className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 py-6 text-lg">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How We Protect Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              How We Protect Consumers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Collect Reviews</h3>
                <p className="text-sm text-gray-600">
                  We gather consumer reviews and verify the details before publishing.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Investigate & Document</h3>
                <p className="text-sm text-gray-600">
                  Our team researches companies and documents patterns of behavior.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Inform the Public</h3>
                <p className="text-sm text-gray-600">
                  Published reviews help consumers make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CreditRepairReviews;
