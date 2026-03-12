import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Star, TrendingUp, Award, Users, Loader2, DollarSign, 
  Gavel, Building2, ChevronRight, ExternalLink, Play,
  MapPin, Calendar, Shield, User, MessageSquarePlus
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Star rating component
const StarRating = ({ rating = 5, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );
};

// Settlement Badge Component
const SettlementBadge = ({ amount, type = 'settlement' }) => {
  if (!amount) return null;
  
  return (
    <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs px-2 py-1">
      <DollarSign className="w-3 h-3 mr-1" />
      {type === 'lawsuit' ? 'Lawsuit Won' : 'Settlement'}: {formatCurrency(amount)}
    </Badge>
  );
};

// Category Icon mapping
const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'cases-settled-won':
      return <Gavel className="w-6 h-6" />;
    case 'attorney-testimonials':
      return <Building2 className="w-6 h-6" />;
    case 'lawsuit-victories':
      return <Award className="w-6 h-6" />;
    default:
      return <Users className="w-6 h-6" />;
  }
};

// Review Card Component with Settlement Badge
const ReviewCard = ({ review, showSettlementBadge = true }) => {
  const settlementAmount = review.attorney_settlement_amount || 
                          review.settlement_details?.amount ||
                          review.settlement_amount;
  
  const hasVideo = review.video_url || review.attorney_profile_video_url;
  const isAttorneyReview = review.is_attorney_review;
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isAttorneyReview ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              {isAttorneyReview ? (
                <Building2 className="w-6 h-6 text-purple-600" />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{review.client_name}</h4>
              {review.attorney_firm_name && (
                <p className="text-sm text-gray-500">{review.attorney_firm_name}</p>
              )}
              {review.location && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {review.location}
                </p>
              )}
            </div>
          </div>
          <StarRating rating={review.rating || 5} />
        </div>

        {/* Settlement Badge */}
        {showSettlementBadge && settlementAmount > 0 && (
          <div className="mb-3">
            <SettlementBadge 
              amount={settlementAmount} 
              type={review.settlement_details?.case_type === 'lawsuit' ? 'lawsuit' : 'settlement'} 
            />
          </div>
        )}

        {/* Credit Score Improvement */}
        {review.before_score > 0 && review.after_score > 0 && (
          <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Credit Score</span>
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-medium">{review.before_score}</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-bold">{review.after_score}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                +{review.after_score - review.before_score}
              </Badge>
            </div>
          </div>
        )}

        {/* Testimonial */}
        <p className="text-gray-700 flex-grow line-clamp-4 mb-4">
          &quot;{review.testimonial_text}&quot;
        </p>

        {/* Video indicator */}
        {hasVideo && (
          <div className="flex items-center gap-2 text-purple-600 text-sm mb-4">
            <Play className="w-4 h-4" />
            <span>Video testimonial available</span>
          </div>
        )}

        {/* Linked review indicator */}
        {review.linked_client_review_id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4 text-sm">
            <span className="text-yellow-700">
              🔗 Linked to client: {review.linked_client_review_name}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-xs text-gray-400">
            {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
          </span>
          <Link 
            to={`/success-stories/${review.story_slug || review.id}`}
            className="text-primary-blue hover:underline text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            Read Full Story <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Category Section Component
const CategorySection = ({ category, reviews }) => {
  const [showAll, setShowAll] = useState(false);
  const displayReviews = showAll ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${
            category.slug === 'cases-settled-won' ? 'bg-green-100 text-green-600' :
            category.slug === 'attorney-testimonials' ? 'bg-purple-100 text-purple-600' :
            category.slug === 'lawsuit-victories' ? 'bg-orange-100 text-orange-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {getCategoryIcon(category.slug)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            <p className="text-gray-500 text-sm">{category.description}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-1">
          {reviews.length} {reviews.length === 1 ? 'Story' : 'Stories'}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayReviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            showSettlementBadge={category.slug === 'cases-settled-won' || category.slug === 'lawsuit-victories'}
          />
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className="px-8"
          >
            {showAll ? 'Show Less' : `View All ${reviews.length} Stories`}
          </Button>
        </div>
      )}
    </section>
  );
};

const SuccessStoriesDynamic = () => {
  const [categories, setCategories] = useState([]);
  const [reviewsByCategory, setReviewsByCategory] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesRes = await fetch(`${API_URL}/api/review-linking/categories`);
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.categories || []);
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/review-linking/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
      
      // Fetch reviews for each category
      const reviewsMap = {};
      for (const cat of categoriesData.categories || []) {
        const res = await fetch(`${API_URL}/api/review-linking/by-category/${cat.slug}`);
        const data = await res.json();
        reviewsMap[cat.slug] = data.reviews || [];
      }
      setReviewsByCategory(reviewsMap);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load success stories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading success stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  // Calculate total reviews across all categories
  const totalReviews = Object.values(reviewsByCategory).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="success-stories-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-yellow-500 text-yellow-900 mb-4">Real Results</Badge>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Real stories from real clients and attorneys. See how Credlocity has helped
            thousands improve their credit scores and win cases.
          </p>
          
          {/* Stats Row */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-400">{stats.total_reviews}</p>
                <p className="text-blue-200">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-400">{stats.reviews_with_settlement}</p>
                <p className="text-blue-200">Cases Won</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">{stats.attorney_reviews}</p>
                <p className="text-blue-200">Attorney Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-300">{stats.linked_reviews}</p>
                <p className="text-blue-200">Linked Stories</p>
              </div>
            </div>
          )}
          
          {/* Leave Review Button */}
          <div className="mt-10">
            <Link to="/leave-review">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Leave an Honest Review
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 py-4">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`#${cat.slug}`}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                {getCategoryIcon(cat.slug)}
                {cat.name}
                <Badge variant="secondary" className="ml-1">{cat.count}</Badge>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories with reviews */}
        {categories.map((category) => (
          <div key={category.slug} id={category.slug}>
            <CategorySection 
              category={category} 
              reviews={reviewsByCategory[category.slug] || []} 
            />
          </div>
        ))}

        {totalReviews === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories yet</h3>
            <p className="text-gray-500">Be the first to share your success story!</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of clients who have improved their credit scores and won cases with Credlocity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/get-started">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/attorneys">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Attorney Network
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Footer Links */}
      <section className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold mb-6 text-center">Explore More</h3>
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-medium mb-3 text-gray-400">By Category</h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <a href={`#${cat.slug}`} className="text-gray-300 hover:text-white">
                      {cat.name} ({cat.count})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-400">Popular Pages</h4>
              <ul className="space-y-2">
                <li><Link to="/reviews" className="text-gray-300 hover:text-white">Credit Repair Reviews</Link></li>
                <li><Link to="/lawsuits" className="text-gray-300 hover:text-white">Consumer Lawsuits</Link></li>
                <li><Link to="/attorneys" className="text-gray-300 hover:text-white">Attorney Network</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-400">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link to="/press" className="text-gray-300 hover:text-white">Press Releases</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-400">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/fcra" className="text-gray-300 hover:text-white">FCRA Rights</Link></li>
                <li><Link to="/fdcpa" className="text-gray-300 hover:text-white">FDCPA Violations</Link></li>
                <li><Link to="/tcpa" className="text-gray-300 hover:text-white">TCPA Cases</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessStoriesDynamic;
