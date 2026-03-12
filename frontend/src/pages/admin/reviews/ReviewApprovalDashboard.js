import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, Video, Link2, Clock,
  Loader2, Search, Filter, MessageSquare, User,
  Star, TrendingUp, Gavel, Mail, Phone, MapPin,
  ExternalLink, Play, ChevronDown, ChevronRight,
  Trash2, Send, RefreshCw, AlertCircle, Copy, Tag,
  ClipboardList, Heart, Award, Sparkles
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Review Categories
const REVIEW_CATEGORIES = {
  signup_process: { label: 'Sign-Up Process', icon: ClipboardList, color: 'blue' },
  results: { label: 'Results & Outcomes', icon: TrendingUp, color: 'green' },
  customer_service: { label: 'Customer Service', icon: Heart, color: 'pink' },
  overall_service: { label: 'Overall Service', icon: Award, color: 'purple' },
  follow_up_update: { label: 'Follow-Up Update', icon: RefreshCw, color: 'orange' }
};

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

// Category Badge
const CategoryBadge = ({ category }) => {
  const cat = REVIEW_CATEGORIES[category];
  if (!cat) return null;
  
  const Icon = cat.icon;
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    pink: 'bg-pink-100 text-pink-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700'
  };
  
  return (
    <Badge className={colorClasses[cat.color]}>
      <Icon className="w-3 h-3 mr-1" />
      {cat.label}
    </Badge>
  );
};

// Review Detail Modal
const ReviewDetailModal = ({ review, onClose, onApprove, onReject, onGenerateFollowUp }) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === 'approve') {
        await onApprove(review.id, adminNotes);
      } else {
        await onReject(review.id, adminNotes);
      }
      onClose();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFollowUp = async () => {
    setGeneratingFollowUp(true);
    try {
      await onGenerateFollowUp(review.id);
    } catch (err) {
      console.error('Generate follow-up failed:', err);
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Review Details</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{review.client_name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                {review.contact_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {review.contact_email}
                  </span>
                )}
                {review.contact_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {review.contact_phone}
                  </span>
                )}
                {review.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {review.location}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={review.rating} />
                {review.review_category && <CategoryBadge category={review.review_category} />}
                {review.is_follow_up && (
                  <Badge className="bg-orange-100 text-orange-700">
                    <RefreshCw className="w-3 h-3 mr-1" /> Update #{review.update_number || 1}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Category Info */}
          {review.review_category && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">Review Category: </span>
              <CategoryBadge category={review.review_category} />
            </div>
          )}

          {/* Credit Score */}
          {review.before_score && review.after_score && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Credit Score Improvement</h4>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-red-500">{review.before_score}</span>
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{review.after_score}</span>
                <Badge className="bg-green-600 text-white">
                  +{review.after_score - review.before_score} points
                </Badge>
              </div>
            </div>
          )}

          {/* Lawsuit Info */}
          {review.worked_with_attorney && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-2">
                <Gavel className="w-4 h-4" /> Lawsuit Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {review.attorney_name && (
                  <div>
                    <span className="text-gray-500">Attorney:</span>
                    <span className="ml-2 font-medium">{review.attorney_name}</span>
                  </div>
                )}
                {review.settlement_details?.defendant_name && (
                  <div>
                    <span className="text-gray-500">Defendant:</span>
                    <span className="ml-2 font-medium">{review.settlement_details.defendant_name}</span>
                  </div>
                )}
                {review.settlement_details?.amount && (
                  <div>
                    <span className="text-gray-500">Settlement:</span>
                    <span className="ml-2 font-medium text-green-600">
                      ${review.settlement_details.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {review.settlement_details?.case_type && (
                  <div>
                    <span className="text-gray-500">Case Type:</span>
                    <span className="ml-2 font-medium uppercase">{review.settlement_details.case_type}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Text */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Review</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">&quot;{review.testimonial_text}&quot;</p>
            </div>
          </div>

          {/* Full Story */}
          {review.full_story && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Full Story</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{review.full_story}</p>
              </div>
            </div>
          )}

          {/* Video */}
          {(review.has_recorded_video || review.video_url || review.recorded_video_path) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Video className="w-4 h-4" /> Video Review
              </h4>
              {review.recorded_video_path ? (
                <video 
                  src={`${API_URL}${review.recorded_video_path}`} 
                  controls 
                  className="w-full max-h-64 rounded-lg bg-black"
                />
              ) : review.video_url ? (
                <a 
                  href={review.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Video ({review.video_url})
                </a>
              ) : (
                <Badge className="bg-purple-100 text-purple-700">
                  <Play className="w-3 h-3 mr-1" /> Video uploaded - pending processing
                </Badge>
              )}
            </div>
          )}

          {/* Social Links */}
          {review.client_social_links && Object.keys(review.client_social_links).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Social Links</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(review.client_social_links).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {platform}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Source & Metadata */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <div className="flex flex-wrap gap-4">
              <span>Source: <Badge variant="outline">{review.source || 'Unknown'}</Badge></span>
              <span>Submitted: {new Date(review.created_at).toLocaleString()}</span>
              {review.consent_to_publish && <Badge className="bg-green-100 text-green-700">Consent to publish</Badge>}
              {review.consent_to_contact && <Badge className="bg-blue-100 text-blue-700">Consent to contact</Badge>}
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h4>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this review (optional)"
              className="min-h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {/* Generate Follow-Up Link - Only show for approved reviews that aren't follow-ups */}
            <div>
              {review.approval_status === 'approved' && !review.is_follow_up && (
                <Button 
                  variant="outline"
                  onClick={handleGenerateFollowUp}
                  disabled={generatingFollowUp}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  {generatingFollowUp ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Generate Follow-Up Link
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {review.approval_status === 'pending' && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => handleAction('reject')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction('approve')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve & Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Link Generator Modal
const GenerateLinkModal = ({ onClose, onGenerate }) => {
  const [formData, setFormData] = useState({
    client_id: `client-${Date.now()}`, // Auto-generate a client ID
    client_name: '',
    client_email: '',
    client_phone: '',
    expires_days: 30
  });
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  const handleGenerate = async () => {
    if (!formData.client_name) {
      toast.error('Client name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: formData.client_id || `client-${Date.now()}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data.link);
        // Call onGenerate to refresh data, but don't close modal
        if (onGenerate) onGenerate();
        toast.success('Review link generated!');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to generate link');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink?.link_url) {
      navigator.clipboard.writeText(generatedLink.link_url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Generate Review Link</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <div className="p-6 space-y-4">
          {!generatedLink ? (
            <>
              <div>
                <label className="text-sm font-medium">Client Name *</label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client Email</label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client Phone</label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link Expires In</label>
                <select
                  value={formData.expires_days}
                  onChange={(e) => setFormData({...formData, expires_days: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                  Generate Link
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Link Generated!</h3>
                <p className="text-sm text-green-600">Send this link to {generatedLink.client_name}</p>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <label className="text-xs text-gray-500">Review Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={generatedLink.link_url}
                    readOnly
                    className="text-sm"
                  />
                  <Button size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Expires: {new Date(generatedLink.expires_at).toLocaleDateString()}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={() => setGeneratedLink(null)}>
                  Generate Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewApprovalDashboard = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewLinks, setReviewLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [linkFilter, setLinkFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pending reviews
      const reviewsRes = await fetch(`${API_URL}/api/client-reviews/pending-approval`);
      const reviewsData = await reviewsRes.json();
      setPendingReviews(reviewsData.reviews || []);

      // Fetch review links
      const linksRes = await fetch(`${API_URL}/api/client-reviews/review-links`);
      const linksData = await linksRes.json();
      setReviewLinks(linksData.links || []);

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/client-reviews/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId, notes) => {
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/approve/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          admin_notes: notes,
          publish_immediately: true
        })
      });

      if (res.ok) {
        toast.success('Review approved and published!');
        fetchData();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (err) {
      toast.error('Failed to approve review');
      throw err;
    }
  };

  const handleReject = async (reviewId, notes) => {
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/approve/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          admin_notes: notes,
          publish_immediately: false
        })
      });

      if (res.ok) {
        toast.success('Review rejected');
        fetchData();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (err) {
      toast.error('Failed to reject review');
      throw err;
    }
  };

  const handleRevokeLink = async (linkId) => {
    if (!confirm('Are you sure you want to revoke this link?')) return;

    try {
      const res = await fetch(`${API_URL}/api/client-reviews/review-link/${linkId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Link revoked');
        fetchData();
      } else {
        throw new Error('Failed to revoke');
      }
    } catch (err) {
      toast.error('Failed to revoke link');
    }
  };

  const handleGenerateFollowUp = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/generate-follow-up-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_review_id: reviewId,
          expires_days: 30
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Copy link to clipboard
        navigator.clipboard.writeText(data.link.link_url);
        toast.success('Follow-up link generated and copied to clipboard!');
        fetchData();
        setSelectedReview(null);
      } else {
        throw new Error('Failed to generate follow-up link');
      }
    } catch (err) {
      toast.error('Failed to generate follow-up link');
      throw err;
    }
  };

  const filteredLinks = reviewLinks.filter(link => {
    if (linkFilter === 'all') return true;
    return link.status === linkFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Approval</h1>
          <p className="text-gray-500">Manage client reviews and review links</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowGenerateModal(true)}>
            <Link2 className="w-4 h-4 mr-2" />
            Generate Review Link
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.pending_approval}</div>
              <div className="text-sm text-gray-500">Pending Approval</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved_reviews}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected_reviews}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.reviews_with_video}</div>
              <div className="text-sm text-gray-500">With Video</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.pending_links}</div>
              <div className="text-sm text-gray-500">Active Links</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total_reviews}</div>
              <div className="text-sm text-gray-500">Total Reviews</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'pending' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Reviews ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'links' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Review Links ({reviewLinks.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <div className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">All Caught Up!</h3>
                <p className="text-gray-500">No reviews pending approval</p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map(review => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{review.client_name}</h3>
                          <StarRating rating={review.rating} />
                          {review.review_category && <CategoryBadge category={review.review_category} />}
                          {review.is_follow_up && (
                            <Badge className="bg-orange-100 text-orange-700">
                              <RefreshCw className="w-3 h-3 mr-1" /> Update
                            </Badge>
                          )}
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
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {review.location} • {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700 mt-2 line-clamp-2">
                          &quot;{review.testimonial_text}&quot;
                        </p>
                        {review.before_score && review.after_score && (
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <span className="text-red-500">{review.before_score}</span>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">{review.after_score}</span>
                            <Badge variant="outline">+{review.after_score - review.before_score} pts</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedReview(review)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(review.id, '')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(review.id, '')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Link Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'submitted', 'expired'].map(filter => (
              <Button
                key={filter}
                size="sm"
                variant={linkFilter === filter ? 'default' : 'outline'}
                onClick={() => setLinkFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>

          {filteredLinks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No Review Links</h3>
                <p className="text-gray-500">Generate a review link to send to clients</p>
                <Button onClick={() => setShowGenerateModal(true)} className="mt-4">
                  <Link2 className="w-4 h-4 mr-2" />
                  Generate Link
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredLinks.map(link => (
                <Card key={link.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{link.client_name}</h3>
                          <Badge 
                            className={
                              link.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              link.status === 'submitted' ? 'bg-green-100 text-green-700' :
                              link.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                              'bg-red-100 text-red-700'
                            }
                          >
                            {link.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {link.client_email && <span>{link.client_email} • </span>}
                          Created: {new Date(link.created_at).toLocaleDateString()} •
                          Expires: {new Date(link.expires_at).toLocaleDateString()}
                          {link.view_count > 0 && <span> • Viewed {link.view_count} times</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {link.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/review/${link.token || link.id}`);
                                toast.success('Link copied!');
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRevokeLink(link.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {link.status === 'submitted' && link.review_id && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" /> Review Received
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onGenerateFollowUp={handleGenerateFollowUp}
        />
      )}

      {showGenerateModal && (
        <GenerateLinkModal
          onClose={() => {
            setShowGenerateModal(false);
            fetchData(); // Refresh when modal closes
          }}
          onGenerate={() => {}} // Don't refresh immediately
        />
      )}
    </div>
  );
};

export default ReviewApprovalDashboard;
