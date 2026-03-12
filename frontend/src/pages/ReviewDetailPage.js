import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  AlertTriangle, Shield, CheckCircle, Building2, Star, 
  ChevronLeft, Play, MessageSquare, MapPin, Calendar,
  Twitter, Facebook, Instagram, Linkedin, DollarSign, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
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

// Star Rating Display
const StarRating = ({ rating, size = "w-6 h-6" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

// Social Icon Links Component
const SocialIcons = ({ review, size = "w-5 h-5" }) => {
  const socials = [
    { key: 'social_twitter', icon: Twitter, color: 'bg-[#1DA1F2]', hoverColor: 'hover:bg-[#1a8cd8]', label: 'Twitter' },
    { key: 'social_facebook', icon: Facebook, color: 'bg-[#4267B2]', hoverColor: 'hover:bg-[#365899]', label: 'Facebook' },
    { key: 'social_instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', hoverColor: 'hover:from-purple-600 hover:to-pink-600', label: 'Instagram' },
    { key: 'social_linkedin', icon: Linkedin, color: 'bg-[#0077B5]', hoverColor: 'hover:bg-[#006097]', label: 'LinkedIn' },
    { key: 'social_tiktok', icon: () => <span className="font-bold text-sm">TT</span>, color: 'bg-black', hoverColor: 'hover:bg-gray-800', label: 'TikTok' },
    { key: 'social_threads', icon: () => <span className="font-bold text-lg">@</span>, color: 'bg-black', hoverColor: 'hover:bg-gray-800', label: 'Threads' },
    { key: 'social_bluesky', icon: () => <span className="font-bold text-sm">BS</span>, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', label: 'Bluesky' }
  ];

  const activeSocials = socials.filter(s => review[s.key]);
  
  if (activeSocials.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Verify on:</span>
      {activeSocials.map(({ key, icon: Icon, color, hoverColor, label }) => (
        <a
          key={key}
          href={review[key].startsWith('http') ? review[key] : `https://${review[key]}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`View on ${label}`}
          className={`${color} ${hoverColor} text-white p-2 rounded-full transition-colors flex items-center justify-center`}
        >
          {typeof Icon === 'function' ? <Icon /> : <Icon className={size} />}
        </a>
      ))}
    </div>
  );
};

// Related Review Card
const RelatedReviewCard = ({ review }) => (
  <Link 
    to={`/credit-repair-reviews/review/${review.seo?.url_slug || review.id}`}
    className="block bg-white rounded-lg border hover:shadow-md transition-shadow p-4"
  >
    <div className="flex items-center gap-2 mb-2">
      <span className="font-medium">{review.display_name}</span>
      <StarRating rating={review.star_rating || 1} size="w-3 h-3" />
    </div>
    <p className="text-sm text-gray-600 line-clamp-2">{review.complaint_details}</p>
    <p className="text-xs text-gray-400 mt-2">
      {review.complainant_city && `${review.complainant_city}, `}{review.complainant_state}
    </p>
  </Link>
);

const ReviewDetailPage = () => {
  const { reviewSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reviewSlug) {
      fetchReview();
    }
  }, [reviewSlug]);

  const fetchReview = async () => {
    try {
      const response = await fetch(`${API_URL}/api/credit-repair/reviews/${reviewSlug}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Review not found');
      }
    } catch (err) {
      console.error('Error fetching review:', err);
      setError('Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading review...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !data?.review) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Review Not Found</h1>
            <p className="text-gray-500 mb-6">{error || 'The review you are looking for does not exist.'}</p>
            <Link to="/credit-repair-reviews">
              <Button>View All Reviews</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { review, company, related_reviews, credlocity_benefits } = data;
  const seo = review.seo || {};

  return (
    <>
      <Helmet>
        <title>{seo.meta_title || `${company?.name} Review by ${review.display_name} | Credlocity`}</title>
        <meta name="description" content={seo.meta_description || review.complaint_details?.substring(0, 160)} />
        <meta property="og:title" content={seo.og_title || `${company?.name} Review`} />
        <meta property="og:description" content={seo.og_description || review.complaint_details?.substring(0, 160)} />
        <link rel="canonical" href={`https://credlocity.com/credit-repair-reviews/review/${seo.url_slug || review.id}`} />
        
        {/* Review Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": {
              "@type": "Organization",
              "name": company?.name,
              "description": company?.description
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": review.star_rating || 1,
              "bestRating": 5,
              "worstRating": 1
            },
            "author": {
              "@type": "Person",
              "name": review.display_name
            },
            "datePublished": review.published_at,
            "reviewBody": review.complaint_details,
            "publisher": {
              "@type": "Organization",
              "name": "Credlocity Business Group LLC"
            }
          })}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <Link to="/credit-repair-reviews" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <ChevronLeft className="w-4 h-4" />
              Back to All Reviews
            </Link>
          </div>
        </div>

        {/* Review Content */}
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Review */}
              <div className="lg:col-span-2">
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold">
                        {review.display_name?.[0] || '?'}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">{review.display_name}'s Review</h1>
                        <p className="text-blue-200 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {review.complainant_city && `${review.complainant_city}, `}{review.complainant_state}
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4" />
                          {formatDate(review.published_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <StarRating rating={review.star_rating || 1} />
                      <span className="text-lg">{review.star_rating || 1}/5</span>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Review of</p>
                        <p className="font-bold text-lg">{company?.name}</p>
                      </div>
                    </div>
                    {review.amount_paid && (
                      <div className="bg-red-100 px-4 py-2 rounded-lg">
                        <p className="text-xs text-red-600">Amount Lost</p>
                        <p className="text-xl font-bold text-red-700">
                          ${review.amount_paid.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Social Verification */}
                    <SocialIcons review={review} />

                    {/* Complaint Types */}
                    {review.complaint_types?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {review.complaint_types.map((type, i) => (
                          <span 
                            key={i}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Video Review */}
                    {review.video_review_url && (
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Play className="w-6 h-6 text-purple-600" />
                          <h3 className="font-bold text-purple-800">Video Review</h3>
                        </div>
                        <a 
                          href={review.video_review_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Watch on {review.video_review_platform || 'Video Platform'}
                        </a>
                      </div>
                    )}

                    {/* Review Content */}
                    <div>
                      <h2 className="font-bold text-lg mb-3">The Story</h2>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {review.complaint_details}
                        </p>
                      </div>
                    </div>

                    {/* Fair Resolution */}
                    {review.fair_resolution && (
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                        <h3 className="font-bold text-amber-800 mb-2">What Would Make This Right?</h3>
                        <p className="text-amber-700">{review.fair_resolution}</p>
                      </div>
                    )}

                    {/* Admin Findings */}
                    {review.admin_findings && (
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-6 h-6 text-blue-600" />
                          <h3 className="font-bold text-blue-800">Credlocity Findings</h3>
                        </div>
                        <p className="text-blue-700">{review.admin_findings}</p>
                      </div>
                    )}

                    {/* Company Response */}
                    {review.company_response && (
                      <div className="bg-gray-50 rounded-xl p-6 border">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-6 h-6 text-gray-600" />
                          <h3 className="font-bold text-gray-800">Company Response</h3>
                        </div>
                        <p className="text-gray-700">{review.company_response}</p>
                      </div>
                    )}
                  </div>
                </article>

                {/* Related Reviews */}
                {related_reviews?.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">More Reviews of {company?.name}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {related_reviews.map((r) => (
                        <RelatedReviewCard key={r.id} review={r} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Why Credlocity */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Why Credlocity Card */}
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Why Credlocity is Different
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">🆓</div>
                        <div>
                          <p className="font-semibold">{credlocity_benefits?.free_trial}</p>
                          <p className="text-blue-200 text-sm">Start without risk</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">💰</div>
                        <div>
                          <p className="font-semibold">{credlocity_benefits?.money_back_guarantee}</p>
                          <p className="text-blue-200 text-sm">No questions asked</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">🔍</div>
                        <div>
                          <p className="font-semibold text-sm">{credlocity_benefits?.investigative_journalism}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">⚖️</div>
                        <div>
                          <p className="font-semibold text-sm">{credlocity_benefits?.attorney_network}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">🤝</div>
                        <div>
                          <p className="font-semibold text-sm">{credlocity_benefits?.affiliate_network}</p>
                        </div>
                      </div>
                    </div>
                    <Link to="/get-started">
                      <Button className="w-full mt-6 bg-white text-blue-900 hover:bg-blue-50 font-bold">
                        Start Your Free Trial
                      </Button>
                    </Link>
                  </div>

                  {/* File Complaint CTA */}
                  <div className="bg-red-600 text-white rounded-2xl p-6">
                    <AlertTriangle className="w-10 h-10 mb-4" />
                    <h3 className="font-bold text-lg mb-2">
                      Had a Similar Experience?
                    </h3>
                    <p className="text-red-100 text-sm mb-4">
                      Your story can help protect other consumers from bad credit repair companies.
                    </p>
                    <Link to="/submit-complaint">
                      <Button variant="secondary" className="w-full bg-white text-red-600 hover:bg-red-50">
                        File Your Complaint
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ReviewDetailPage;
