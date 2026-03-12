import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Star, TrendingUp, Award, ChevronLeft, Play, 
  MapPin, Calendar, DollarSign, Building2, User,
  ExternalLink, FileText, Newspaper, Gavel, Link2,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format currency
const formatCurrency = (amount) => {
  if (!amount) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Star Rating Component
const StarRating = ({ rating = 5, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );
};

// Linked Review Card
const LinkedReviewCard = ({ review, type }) => {
  if (!review) return null;
  
  const isAttorney = review.is_attorney_review;
  
  return (
    <Card className="border-2 border-yellow-300 bg-yellow-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">
            {isAttorney ? "Attorney&apos;s Perspective" : "Client&apos;s Story"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isAttorney ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {isAttorney ? (
              <Building2 className="w-6 h-6 text-purple-600" />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{review.client_name}</h4>
            {review.attorney_firm_name && (
              <p className="text-sm text-gray-500">{review.attorney_firm_name}</p>
            )}
            {review.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {review.location}
              </p>
            )}
            <p className="text-gray-700 mt-3 line-clamp-3">&quot;{review.testimonial_text}&quot;</p>
            
            {(review.attorney_settlement_amount || review.settlement_details?.amount) && (
              <Badge className="bg-green-600 text-white mt-3">
                <DollarSign className="w-3 h-3 mr-1" />
                Settlement: {formatCurrency(review.attorney_settlement_amount || review.settlement_details?.amount)}
              </Badge>
            )}
            
            <Link 
              to={`/success-stories/${review.story_slug || review.id}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-3 text-sm"
            >
              Read Full Story <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Attached Content Section
const AttachedContentSection = ({ blogs, pressReleases, lawsuitDocs }) => {
  const hasContent = (blogs?.length > 0) || (pressReleases?.length > 0) || (lawsuitDocs?.length > 0);
  
  if (!hasContent) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Related Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blogs */}
        {blogs?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Blog Posts
            </h4>
            <div className="space-y-2">
              {blogs.map((blog) => (
                <Link 
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <p className="font-medium text-blue-600">{blog.title}</p>
                  {blog.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{blog.excerpt}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Press Releases */}
        {pressReleases?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Newspaper className="w-4 h-4" /> Press Releases
            </h4>
            <div className="space-y-2">
              {pressReleases.map((pr) => (
                <Link 
                  key={pr.id}
                  to={`/press/${pr.slug}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <p className="font-medium text-blue-600">{pr.title}</p>
                  {pr.date && <p className="text-xs text-gray-400">{formatDate(pr.date)}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Lawsuit Documents */}
        {lawsuitDocs?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Gavel className="w-4 h-4" /> Case Documents
            </h4>
            <div className="space-y-2">
              {lawsuitDocs.map((doc, idx) => (
                <a 
                  key={idx}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-blue-600">View Document {idx + 1}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Related Reviews Section
const RelatedReviewsSection = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Similar Success Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Link 
              key={review.id}
              to={`/success-stories/${review.story_slug || review.id}`}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                review.is_attorney_review ? 'bg-purple-100' : 'bg-blue-100'
              }`}>
                {review.is_attorney_review ? (
                  <Building2 className="w-5 h-5 text-purple-600" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{review.client_name}</p>
                <p className="text-sm text-gray-500 truncate">{review.location}</p>
              </div>
              {review.after_score > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Score: {review.after_score}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SuccessStoryDetail = () => {
  const { slug: storySlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storySlug) {
      fetchStory();
    }
  }, [storySlug]);

  const fetchStory = async () => {
    try {
      // First try the new full-review endpoint
      let response = await fetch(`${API_URL}/api/review-linking/full-review/${storySlug}`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        // Fallback to reviews endpoint
        response = await fetch(`${API_URL}/api/reviews`);
        if (response.ok) {
          const reviews = await response.json();
          const review = reviews.find(r => r.story_slug === storySlug || r.id === storySlug);
          if (review) {
            setData({ review, linked_review: null, attached_blogs: [], attached_press_releases: [], related_reviews: [] });
          } else {
            setError('Story not found');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching story:', err);
      setError('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading success story...</p>
        </div>
      </main>
    );
  }

  if (error || !data?.review) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Story Not Found</h1>
          <p className="text-gray-500 mb-6">{error || 'The story you are looking for does not exist.'}</p>
          <Link to="/success-stories">
            <Button>View All Success Stories</Button>
          </Link>
        </div>
      </main>
    );
  }

  const { review, linked_review, attached_blogs, attached_press_releases, related_reviews, schema_data } = data;
  const isAttorney = review.is_attorney_review;
  const settlementAmount = review.attorney_settlement_amount || review.settlement_details?.amount;
  const hasVideo = review.video_url || review.attorney_profile_video_url;
  const videoUrl = review.video_url || review.attorney_profile_video_url;

  // SEO data
  const pageTitle = review.seo_meta_title || review.story_title || `${review.client_name}&apos;s Success Story | Credlocity`;
  const pageDescription = review.seo_meta_description || review.testimonial_text?.slice(0, 160);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {schema_data && (
          <script type="application/ld+json">
            {JSON.stringify(schema_data)}
          </script>
        )}
      </Helmet>
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className={`py-16 ${isAttorney ? 'bg-gradient-to-r from-purple-800 to-indigo-900' : 'bg-gradient-to-r from-blue-800 to-indigo-900'} text-white`}>
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <Link to="/success-stories" className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-6">
              <ChevronLeft className="w-4 h-4" />
              Back to Success Stories
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isAttorney ? 'bg-purple-200' : 'bg-blue-200'
                }`}>
                  {isAttorney ? (
                    <Building2 className="w-10 h-10 text-purple-700" />
                  ) : (
                    <User className="w-10 h-10 text-blue-700" />
                  )}
                </div>
                <div>
                  <Badge className={isAttorney ? 'bg-purple-500' : 'bg-blue-500'}>
                    {isAttorney ? 'Attorney Review' : 'Client Success Story'}
                  </Badge>
                  <h1 className="text-3xl font-bold mt-2">{review.client_name}</h1>
                  {review.attorney_firm_name && (
                    <p className="text-white/80">{review.attorney_firm_name}</p>
                  )}
                  {review.location && (
                    <p className="text-white/60 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {review.location}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 md:ml-auto">
                {review.rating && (
                  <div className="text-center">
                    <StarRating rating={review.rating} size="lg" />
                    <p className="text-white/60 text-sm mt-1">{review.rating}/5 Rating</p>
                  </div>
                )}
                
                {review.before_score > 0 && review.after_score > 0 && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-2xl font-bold">
                      <span className="text-red-300">{review.before_score}</span>
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      <span className="text-green-400">{review.after_score}</span>
                    </div>
                    <p className="text-white/60 text-sm">Credit Score</p>
                  </div>
                )}
                
                {settlementAmount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(settlementAmount)}</p>
                    <p className="text-white/60 text-sm">Settlement Won</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Testimonial */}
              <Card>
                <CardContent className="p-8">
                  <blockquote className="text-xl text-gray-700 leading-relaxed">
                    &quot;{review.testimonial_text}&quot;
                  </blockquote>
                  
                  {review.full_story && (
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="font-semibold text-lg mb-4">Full Story</h3>
                      <div className="prose prose-gray max-w-none">
                        {review.full_story.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 text-gray-700">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Meta */}
                  <div className="mt-8 pt-6 border-t flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <StarRating rating={review.rating || 5} size="sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Video Section */}
              {hasVideo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Video Testimonial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Video Testimonial"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <a 
                            href={videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Play className="w-8 h-8" />
                            Watch Video
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Settlement Details */}
              {review.settlement_details && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="w-5 h-5" />
                      Case Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {review.settlement_details.defendant_name && (
                        <div>
                          <p className="text-sm text-gray-500">Defendant</p>
                          <p className="font-medium">{review.settlement_details.defendant_name}</p>
                        </div>
                      )}
                      {review.settlement_details.case_type && (
                        <div>
                          <p className="text-sm text-gray-500">Case Type</p>
                          <p className="font-medium uppercase">{review.settlement_details.case_type}</p>
                        </div>
                      )}
                      {review.settlement_details.settlement_date && (
                        <div>
                          <p className="text-sm text-gray-500">Settlement Date</p>
                          <p className="font-medium">{formatDate(review.settlement_details.settlement_date)}</p>
                        </div>
                      )}
                      {review.settlement_details.amount && (
                        <div>
                          <p className="text-sm text-gray-500">Settlement Amount</p>
                          <p className="font-medium text-green-600">{formatCurrency(review.settlement_details.amount)}</p>
                        </div>
                      )}
                    </div>
                    {review.settlement_details.case_summary && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-2">Case Summary</p>
                        <p className="text-gray-700">{review.settlement_details.case_summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Linked Review */}
              {linked_review && (
                <LinkedReviewCard review={linked_review} type={isAttorney ? 'client' : 'attorney'} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">Ready for Your Success Story?</h3>
                  <p className="text-blue-100 mb-4 text-sm">
                    Join thousands who have improved their credit and won their cases.
                  </p>
                  <Link to="/get-started">
                    <Button className="w-full bg-white text-blue-700 hover:bg-blue-50">
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Attached Content */}
              <AttachedContentSection 
                blogs={attached_blogs}
                pressReleases={attached_press_releases}
                lawsuitDocs={review.attached_content?.lawsuit_doc_urls}
              />

              {/* Related Stories */}
              <RelatedReviewsSection reviews={related_reviews} />

              {/* Trust Indicators */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Verified Story
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Identity verified
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Results documented
                    </li>
                    {settlementAmount > 0 && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Settlement confirmed
                      </li>
                    )}
                    {linked_review && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Corroborating review linked
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SuccessStoryDetail;
