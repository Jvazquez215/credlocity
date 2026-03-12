import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Video, Gavel, Building2, Users, Award, 
  Loader2, Search, Eye, CheckCircle, XCircle,
  TrendingUp, RefreshCw, Plus, Edit, Trash2,
  AlertTriangle, ExternalLink
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Star Rating Display
const StarRating = ({ rating = 5 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ))}
  </div>
);

// Tab Button Component
const TabButton = ({ active, onClick, children, count, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
      active 
        ? 'border-blue-600 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
    {count !== undefined && (
      <span className={`px-2 py-0.5 text-xs rounded-full ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600'
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Review Card Component
const ReviewCard = ({ review, type, onView, onApprove, onReject, onEdit, onDelete }) => {
  const getReviewerName = () => {
    return review.client_name || review.reviewer_name || review.name || review.company_name || 'Anonymous';
  };

  const getReviewText = () => {
    return review.testimonial_text || review.review_text || review.content || review.review || '';
  };

  const getLocation = () => {
    return review.location || review.city || '';
  };

  const getDate = () => {
    const date = review.created_at || review.date || review.published_at;
    return date ? new Date(date).toLocaleDateString() : '';
  };

  const getStatus = () => {
    if (review.approval_status) return review.approval_status;
    if (review.status) return review.status;
    if (review.show_on_success_stories) return 'approved';
    return 'pending';
  };

  const status = getStatus();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              type === 'attorney' ? 'bg-amber-100' :
              type === 'partner' ? 'bg-green-100' :
              type === 'creditRepair' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              {type === 'attorney' ? <Gavel className="w-5 h-5 text-amber-600" /> :
               type === 'partner' ? <Building2 className="w-5 h-5 text-green-600" /> :
               type === 'creditRepair' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
               <Users className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-900">{getReviewerName()}</h3>
                <StarRating rating={review.rating || 5} />
                {review.has_recorded_video && (
                  <Badge className="bg-purple-100 text-purple-700">
                    <Video className="w-3 h-3 mr-1" /> Video
                  </Badge>
                )}
                {review.worked_with_attorney && (
                  <Badge className="bg-amber-100 text-amber-700">
                    <Gavel className="w-3 h-3 mr-1" /> Lawsuit
                  </Badge>
                )}
                <Badge className={
                  status === 'approved' ? 'bg-green-100 text-green-700' :
                  status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {getLocation()} {getLocation() && getDate() && '•'} {getDate()}
              </p>
              <p className="text-gray-700 mt-2 line-clamp-2">
                "{getReviewText()}"
              </p>
              {review.before_score && review.after_score && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-red-500 font-medium">{review.before_score}</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">{review.after_score}</span>
                  <Badge variant="outline" className="bg-green-50">
                    +{review.after_score - review.before_score} pts
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => onView?.(review)} title="View">
              <Eye className="w-4 h-4" />
            </Button>
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={() => onEdit(review)} title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {status === 'pending' && onApprove && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onApprove(review.id)}
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onReject(review.id)}
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Unified Reviews Page
const UnifiedReviewsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // All reviews combined
  const [allReviews, setAllReviews] = useState([]);
  const [clientReviews, setClientReviews] = useState([]);
  const [attorneyReviews, setAttorneyReviews] = useState([]);
  const [partnerReviews, setPartnerReviews] = useState([]);
  const [creditRepairReviews, setCreditRepairReviews] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    client: 0,
    attorney: 0,
    partner: 0,
    creditRepair: 0,
    pending: 0,
    approved: 0
  });

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      // Fetch all review types in parallel
      const [reviewsRes, attorneyRes, partnerRes, creditRepairRes] = await Promise.all([
        fetch(`${API_URL}/api/reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/attorney-reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/outsource-reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/credit-repair-reviews`).then(r => r.ok ? r.json() : { reviews: [] }).catch(() => ({ reviews: [] }))
      ]);

      // Process reviews - tag each with its type
      const clientOnly = (reviewsRes || []).map(r => ({ ...r, _type: 'client' }));
      const attorneyOnly = (attorneyRes || []).map(r => ({ ...r, _type: 'attorney' }));
      const partnerOnly = (partnerRes || []).map(r => ({ ...r, _type: 'partner' }));
      const creditRepairOnly = (creditRepairRes.reviews || creditRepairRes || []).map(r => ({ ...r, _type: 'creditRepair' }));
      
      // Combine all reviews
      const combined = [...clientOnly, ...attorneyOnly, ...partnerOnly, ...creditRepairOnly];
      
      setAllReviews(combined);
      setClientReviews(clientOnly);
      setAttorneyReviews(attorneyOnly);
      setPartnerReviews(partnerOnly);
      setCreditRepairReviews(creditRepairOnly);
      
      // Calculate stats
      const pendingCount = combined.filter(r => 
        r.approval_status === 'pending' || (!r.approval_status && !r.show_on_success_stories)
      ).length;
      const approvedCount = combined.filter(r => 
        r.approval_status === 'approved' || r.show_on_success_stories
      ).length;

      setStats({
        total: combined.length,
        client: clientOnly.length,
        attorney: attorneyOnly.length,
        partner: partnerOnly.length,
        creditRepair: creditRepairOnly.length,
        pending: pendingCount,
        approved: approvedCount
      });

      toast.success(`Loaded ${combined.length} reviews`);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/approve/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', publish_immediately: true })
      });
      if (res.ok) {
        toast.success('Review approved');
        fetchAllReviews();
      } else {
        // Try standard reviews endpoint
        const res2 = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ show_on_success_stories: true })
        });
        if (res2.ok) {
          toast.success('Review approved');
          fetchAllReviews();
        }
      }
    } catch (err) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/approve/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', publish_immediately: false })
      });
      if (res.ok) {
        toast.success('Review rejected');
        fetchAllReviews();
      }
    } catch (err) {
      toast.error('Failed to reject review');
    }
  };

  const handleView = (review) => {
    console.log('View review:', review);
    // Could open a modal or navigate to detail page
  };

  const handleEdit = (review) => {
    if (review._type === 'client') {
      navigate(`/admin/reviews/edit/${review.id}`);
    } else if (review._type === 'partner') {
      navigate(`/admin/outsource-reviews/edit/${review.id}`);
    }
  };

  // Filter reviews based on active tab, search and status
  const getFilteredReviews = () => {
    let reviews = [];
    
    switch (activeTab) {
      case 'all':
        reviews = allReviews;
        break;
      case 'client':
        reviews = clientReviews;
        break;
      case 'attorney':
        reviews = attorneyReviews;
        break;
      case 'partner':
        reviews = partnerReviews;
        break;
      case 'creditRepair':
        reviews = creditRepairReviews;
        break;
      case 'pending':
        reviews = allReviews.filter(r => 
          r.approval_status === 'pending' || (!r.approval_status && !r.show_on_success_stories)
        );
        break;
      default:
        reviews = allReviews;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      reviews = reviews.filter(review => {
        const name = (review.client_name || review.reviewer_name || review.name || review.company_name || '').toLowerCase();
        const text = (review.testimonial_text || review.review_text || review.content || review.review || '').toLowerCase();
        return name.includes(query) || text.includes(query);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      reviews = reviews.filter(review => {
        const status = review.approval_status || (review.show_on_success_stories ? 'approved' : 'pending');
        return status === statusFilter;
      });
    }

    return reviews;
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Proof & Reviews</h1>
          <p className="text-gray-500">Manage all reviews across the platform</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchAllReviews} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/admin/reviews/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Total Reviews" value={stats.total} icon={Star} color="blue" />
        <StatCard title="Client Reviews" value={stats.client} icon={Users} color="blue" />
        <StatCard title="Attorney Reviews" value={stats.attorney} icon={Gavel} color="amber" />
        <StatCard title="Partner Reviews" value={stats.partner} icon={Building2} color="green" />
        <StatCard title="Credit Repair" value={stats.creditRepair} icon={AlertTriangle} color="red" />
        <StatCard title="Pending" value={stats.pending} icon={Award} color="amber" subtitle="Needs approval" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="green" />
      </div>

      {/* Main Content Card */}
      <Card>
        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex overflow-x-auto">
            <TabButton 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
              count={stats.total}
              icon={Star}
            >
              All Reviews
            </TabButton>
            <TabButton 
              active={activeTab === 'client'} 
              onClick={() => setActiveTab('client')}
              count={stats.client}
              icon={Users}
            >
              Client Reviews
            </TabButton>
            <TabButton 
              active={activeTab === 'attorney'} 
              onClick={() => setActiveTab('attorney')}
              count={stats.attorney}
              icon={Gavel}
            >
              Attorney Reviews
            </TabButton>
            <TabButton 
              active={activeTab === 'partner'} 
              onClick={() => setActiveTab('partner')}
              count={stats.partner}
              icon={Building2}
            >
              Partner Reviews
            </TabButton>
            <TabButton 
              active={activeTab === 'creditRepair'} 
              onClick={() => setActiveTab('creditRepair')}
              count={stats.creditRepair}
              icon={AlertTriangle}
            >
              Credit Repair Reviews
            </TabButton>
            <TabButton 
              active={activeTab === 'pending'} 
              onClick={() => setActiveTab('pending')}
              count={stats.pending}
              icon={Award}
            >
              Pending Approval
            </TabButton>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reviews by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start collecting reviews from your clients'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Showing {filteredReviews.length} of {stats.total} reviews
              </p>
              {filteredReviews.map((review, index) => (
                <ReviewCard
                  key={review.id || index}
                  review={review}
                  type={review._type}
                  onView={handleView}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/review-approval')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium">Review Approval Queue</h3>
              <p className="text-sm text-gray-500">Manage pending reviews</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/review-linking')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Review Linking</h3>
              <p className="text-sm text-gray-500">Link reviews to attorneys</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/review-categories')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Review Categories</h3>
              <p className="text-sm text-gray-500">Manage review types</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedReviewsPage;
