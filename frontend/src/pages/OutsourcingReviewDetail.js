import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, Building2, UserCheck, Play, Star, CheckCircle2,
  TrendingUp, Clock, Award, Quote, ExternalLink
} from 'lucide-react';
import api from '../utils/api';

const OutsourcingReviewDetail = () => {
  const { slug } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await api.get(`/outsource/client-reviews/slug/${slug}`);
        setReview(response.data);
      } catch (err) {
        console.error('Error fetching review:', err);
        setError('Review not found');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [slug]);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    return url;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !review) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review Not Found</h1>
            <p className="text-gray-600 mb-6">The outsourcing partner review you're looking for doesn't exist.</p>
            <Link to="/outsourcing">
              <Button className="bg-primary-blue hover:bg-primary-dark">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Outsourcing
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Generate SEO content
  const metaTitle = review.seo_meta_title || `${review.company_name} - Credlocity Outsourcing Partner Review`;
  const metaDescription = review.seo_meta_description || 
    `Read how ${review.company_name} transformed their credit repair business with Credlocity's outsourcing services. ${review.testimonial_text.substring(0, 100)}...`;
  const metaKeywords = review.seo_keywords || `${review.company_name}, credit repair outsourcing, outsourcing partner review, credlocity partner`;

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Service",
      "name": "Credlocity Credit Repair Outsourcing",
      "provider": {
        "@type": "Organization",
        "name": "Credlocity"
      }
    },
    "author": {
      "@type": "Organization",
      "name": review.company_name
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "reviewBody": review.testimonial_text
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <link rel="canonical" href={`https://www.credlocity.com/outsourcing/reviews/${review.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.credlocity.com/outsourcing/reviews/${review.slug}`} />
        {review.company_logo_url && <meta property="og:image" content={review.company_logo_url} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-primary-blue">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to="/outsourcing" className="text-gray-500 hover:text-primary-blue">Outsourcing</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{review.company_name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link to="/outsourcing" className="inline-flex items-center gap-2 text-gray-200 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Outsourcing
              </Link>
              
              <div className="flex items-start gap-6">
                {review.company_logo_url ? (
                  <img 
                    src={review.company_logo_url} 
                    alt={`${review.company_name} logo`}
                    className="w-24 h-24 object-contain bg-white rounded-xl p-2 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                )}
                <div>
                  {review.featured && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300 bg-amber-900/30 px-3 py-1 rounded-full mb-3">
                      <Star className="w-4 h-4 fill-amber-400" /> Featured Partner
                    </span>
                  )}
                  <h1 className="font-cinzel text-3xl md:text-4xl font-bold mb-2">
                    {review.company_name}
                  </h1>
                  <p className="text-xl text-gray-200">Credlocity Outsourcing Partner</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Video Section */}
                  {((review.video_type === 'youtube' && review.youtube_embed_url) || 
                    (review.video_type === 'file' && review.video_file_url)) && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      {showVideo ? (
                        <div className="aspect-video">
                          {review.video_type === 'youtube' ? (
                            <iframe
                              src={getEmbedUrl(review.youtube_embed_url)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`Video review from ${review.company_name}`}
                            />
                          ) : (
                            <video
                              src={review.video_file_url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div 
                          className="aspect-video bg-gradient-to-br from-primary-blue to-blue-800 flex items-center justify-center cursor-pointer group"
                          onClick={() => setShowVideo(true)}
                        >
                          <div className="text-center text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 transition-colors">
                              <Play className="w-10 h-10 text-white ml-1" />
                            </div>
                            <p className="font-semibold text-lg">Watch Video Testimonial</p>
                            <p className="text-sm text-gray-200">Hear directly from {review.ceo_name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Testimonial Quote */}
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 w-12 h-12 text-primary-blue/10" />
                      <blockquote className="text-xl text-gray-700 italic pl-6 leading-relaxed">
                        "{review.testimonial_text}"
                      </blockquote>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                      {review.ceo_photo_url ? (
                        <img 
                          src={review.ceo_photo_url} 
                          alt={review.ceo_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserCheck className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{review.ceo_name}</p>
                        <p className="text-gray-600">{review.ceo_title || 'CEO'}, {review.company_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Full Story */}
                  {review.full_story && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">Their Story</h2>
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: review.full_story }}
                      />
                    </div>
                  )}

                  {/* Switched From */}
                  {review.switched_from_another && review.previous_company_name && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                      <h3 className="font-cinzel text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        Why They Switched to Credlocity
                      </h3>
                      <p className="text-green-800 mb-2">
                        <strong>Previous Provider:</strong> {review.previous_company_name}
                      </p>
                      {review.why_they_switched && (
                        <p className="text-green-700 italic">"{review.why_they_switched}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Results Stats */}
                  {review.results_stats && Object.keys(review.results_stats).length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="font-cinzel text-lg font-bold text-gray-900 mb-4">Results at a Glance</h3>
                      <div className="space-y-4">
                        {review.results_stats.disputes_processed && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-primary-blue" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{review.results_stats.disputes_processed}</p>
                              <p className="text-sm text-gray-500">Disputes Processed</p>
                            </div>
                          </div>
                        )}
                        {review.results_stats.deletion_rate && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{review.results_stats.deletion_rate}</p>
                              <p className="text-sm text-gray-500">Deletion Rate</p>
                            </div>
                          </div>
                        )}
                        {review.results_stats.months_partnered && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{review.results_stats.months_partnered} Months</p>
                              <p className="text-sm text-gray-500">Partnership Duration</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA Card */}
                  <div className="bg-primary-blue text-white rounded-xl p-6">
                    <Award className="w-12 h-12 mb-4" />
                    <h3 className="font-cinzel text-xl font-bold mb-2">Ready to Partner?</h3>
                    <p className="text-blue-100 mb-4">
                      Join {review.company_name} and other successful CROs who trust Credlocity for their outsourcing needs.
                    </p>
                    <Link to="/outsourcing#inquiry-form">
                      <Button className="w-full bg-white text-primary-blue hover:bg-gray-100">
                        Get Started Today
                      </Button>
                    </Link>
                  </div>

                  {/* More Reviews */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-cinzel text-lg font-bold text-gray-900 mb-4">More Success Stories</h3>
                    <Link 
                      to="/outsourcing#reviews-section"
                      className="flex items-center justify-between text-primary-blue hover:underline"
                    >
                      <span>View All Partner Reviews</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl font-bold mb-4">
              Start Your Outsourcing Partnership Today
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join credit repair organizations across the country who trust Credlocity for professional dispute processing.
            </p>
            <Link to="/outsourcing#inquiry-form">
              <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-12 py-6">
                Submit Partnership Inquiry
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default OutsourcingReviewDetail;