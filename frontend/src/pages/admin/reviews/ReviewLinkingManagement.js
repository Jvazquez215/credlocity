import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Link2, Unlink, Search, Users, Building2, DollarSign,
  TrendingUp, FileText, Newspaper, Gavel, Plus, Trash2,
  CheckCircle, AlertCircle, Loader2, ExternalLink, Eye,
  Star, MapPin, Calendar, RefreshCw, Filter, Sparkles
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format currency
const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

// Star Rating
const StarRating = ({ rating = 5 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

// Review Card Component
const ReviewCard = ({ review, onSelect, isSelected, showLinkButton = false, onLink = null }) => {
  const isAttorney = review.is_attorney_review;
  const settlementAmount = review.attorney_settlement_amount || review.settlement_details?.amount;
  const isLinked = review.linked_client_review_id || review.linked_attorney_review_id;
  
  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:border-gray-300'
      }`}
      onClick={() => onSelect && onSelect(review)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAttorney ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {isAttorney ? (
              <Building2 className="w-5 h-5 text-purple-600" />
            ) : (
              <Users className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-medium">{review.client_name}</p>
            {review.attorney_firm_name && (
              <p className="text-xs text-gray-500">{review.attorney_firm_name}</p>
            )}
            {review.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {review.location}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating || 5} />
          <div className="flex gap-1">
            <Badge variant={isAttorney ? 'default' : 'secondary'} className={isAttorney ? 'bg-purple-600' : ''}>
              {isAttorney ? 'Attorney' : 'Client'}
            </Badge>
            {isLinked && (
              <Badge className="bg-yellow-500">
                <Link2 className="w-3 h-3 mr-1" />
                Linked
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {settlementAmount > 0 && (
        <Badge className="bg-green-600 text-white mt-2">
          <DollarSign className="w-3 h-3 mr-1" />
          {formatCurrency(settlementAmount)}
        </Badge>
      )}
      
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.testimonial_text}</p>
      
      {review.before_score > 0 && review.after_score > 0 && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className="text-red-500">{review.before_score}</span>
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-green-600 font-medium">{review.after_score}</span>
          <Badge variant="secondary" className="text-xs">+{review.after_score - review.before_score}</Badge>
        </div>
      )}
      
      {showLinkButton && onLink && (
        <Button 
          size="sm" 
          className="mt-3 w-full"
          onClick={(e) => { e.stopPropagation(); onLink(review); }}
        >
          <Link2 className="w-4 h-4 mr-1" />
          Link This Review
        </Button>
      )}
    </div>
  );
};

// Attachment Manager Modal
const AttachmentModal = ({ isOpen, onClose, review, onSave }) => {
  const [blogIds, setBlogIds] = useState([]);
  const [pressReleaseIds, setPressReleaseIds] = useState([]);
  const [lawsuitDocs, setLawsuitDocs] = useState([]);
  const [newDocUrl, setNewDocUrl] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (review && isOpen) {
      const attached = review.attached_content || {};
      setBlogIds(attached.blog_ids || []);
      setPressReleaseIds(attached.press_release_ids || []);
      setLawsuitDocs(attached.lawsuit_doc_urls || []);
      fetchContent();
    }
  }, [review, isOpen]);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // Fetch blogs
      const blogsRes = await fetch(`${API_URL}/api/blogs?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (blogsRes.ok) {
        const data = await blogsRes.json();
        setBlogs(data.posts || data || []);
      }
      
      // Fetch press releases
      const prRes = await fetch(`${API_URL}/api/press-releases?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prRes.ok) {
        const data = await prRes.json();
        setPressReleases(data.press_releases || data || []);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/review-linking/review/${review.id}/attachments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blog_ids: blogIds,
          press_release_ids: pressReleaseIds,
          lawsuit_doc_urls: lawsuitDocs
        })
      });
      
      if (res.ok) {
        toast.success('Attachments updated successfully');
        onSave();
        onClose();
      } else {
        toast.error('Failed to update attachments');
      }
    } catch (err) {
      toast.error('Error saving attachments');
    } finally {
      setSaving(false);
    }
  };

  const addLawsuitDoc = () => {
    if (newDocUrl && !lawsuitDocs.includes(newDocUrl)) {
      setLawsuitDocs([...lawsuitDocs, newDocUrl]);
      setNewDocUrl('');
    }
  };

  if (!isOpen || !review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Manage Attachments
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Attach blog posts, press releases, and lawsuit documents to: <strong>{review.client_name}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Blog Posts */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Blog Posts
            </Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
              {blogs.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No blog posts available</p>
              ) : (
                blogs.map((blog) => (
                  <label key={blog.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blogIds.includes(blog.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBlogIds([...blogIds, blog.id]);
                        } else {
                          setBlogIds(blogIds.filter(id => id !== blog.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm truncate">{blog.title}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{blogIds.length} blog(s) selected</p>
          </div>

          {/* Press Releases */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4" />
              Press Releases
            </Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
              {pressReleases.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No press releases available</p>
              ) : (
                pressReleases.map((pr) => (
                  <label key={pr.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pressReleaseIds.includes(pr.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPressReleaseIds([...pressReleaseIds, pr.id]);
                        } else {
                          setPressReleaseIds(pressReleaseIds.filter(id => id !== pr.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm truncate">{pr.title}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{pressReleaseIds.length} press release(s) selected</p>
          </div>

          {/* Lawsuit Documents */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Gavel className="w-4 h-4" />
              Lawsuit Documents (URLs)
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                placeholder="https://example.com/lawsuit-document.pdf"
              />
              <Button type="button" onClick={addLawsuitDoc} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {lawsuitDocs.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{url}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLawsuitDocs(lawsuitDocs.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {lawsuitDocs.length === 0 && (
                <p className="text-sm text-gray-500">No lawsuit documents attached</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Attachments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function ReviewLinkingManagement() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [smartMatches, setSmartMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, attorney, client, linked, unlinked
  const [attachmentModal, setAttachmentModal] = useState({ open: false, review: null });
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchQuery, filterType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/review-linking/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) setStats(await statsRes.json());
      
      // Fetch categories
      const catRes = await fetch(`${API_URL}/api/review-linking/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      
      // Fetch all reviews
      const reviewsRes = await fetch(`${API_URL}/api/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.client_name?.toLowerCase().includes(query) ||
        r.location?.toLowerCase().includes(query) ||
        r.testimonial_text?.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (filterType === 'attorney') {
      filtered = filtered.filter(r => r.is_attorney_review);
    } else if (filterType === 'client') {
      filtered = filtered.filter(r => !r.is_attorney_review);
    } else if (filterType === 'linked') {
      filtered = filtered.filter(r => r.linked_client_review_id || r.linked_attorney_review_id);
    } else if (filterType === 'unlinked') {
      filtered = filtered.filter(r => !r.linked_client_review_id && !r.linked_attorney_review_id);
    }
    
    setFilteredReviews(filtered);
  };

  const fetchSmartMatches = async (review) => {
    setLoadingMatches(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/review-linking/smart-match/${review.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSmartMatches(data.matches || []);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSelectReview = (review) => {
    setSelectedReview(review);
    setSmartMatches([]);
    fetchSmartMatches(review);
  };

  const handleLinkReviews = async (targetReview) => {
    if (!selectedReview) return;
    
    setLinking(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/review-linking/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          source_review_id: selectedReview.id,
          target_review_id: targetReview.id,
          link_type: 'case_related'
        })
      });
      
      if (res.ok) {
        toast.success('Reviews linked successfully!');
        fetchData(); // Refresh
        setSelectedReview(null);
        setSmartMatches([]);
      } else {
        toast.error('Failed to link reviews');
      }
    } catch (err) {
      toast.error('Error linking reviews');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkReview = async (review) => {
    if (!window.confirm('Are you sure you want to unlink this review?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/review-linking/link/${review.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success('Review unlinked successfully');
        fetchData();
      } else {
        toast.error('Failed to unlink review');
      }
    } catch (err) {
      toast.error('Error unlinking review');
    }
  };

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
          <h1 className="text-2xl font-bold">Review Linking Management</h1>
          <p className="text-gray-500">Link client and attorney reviews for SEO interlinking</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_reviews}</p>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Link2 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.linked_reviews}</p>
                  <p className="text-sm text-gray-500">Linked ({stats.link_rate}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.attorney_reviews}</p>
                  <p className="text-sm text-gray-500">Attorney Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reviews_with_settlement}</p>
                  <p className="text-sm text-gray-500">With Settlement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>Select a review to find and create links</CardDescription>
            
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviews..."
                  className="pl-9"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Reviews</option>
                <option value="attorney">Attorney Only</option>
                <option value="client">Client Only</option>
                <option value="linked">Linked</option>
                <option value="unlinked">Unlinked</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No reviews found</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="relative">
                    <ReviewCard
                      review={review}
                      onSelect={handleSelectReview}
                      isSelected={selectedReview?.id === review.id}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setAttachmentModal({ open: true, review }); }}
                        title="Manage Attachments"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {(review.linked_client_review_id || review.linked_attorney_review_id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleUnlinkReview(review); }}
                          title="Unlink"
                        >
                          <Unlink className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Smart Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Smart Match Suggestions
            </CardTitle>
            <CardDescription>
              {selectedReview 
                ? `Finding matches for: ${selectedReview.client_name}`
                : 'Select a review to see matching suggestions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedReview ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a review from the left to find potential matches</p>
              </div>
            ) : loadingMatches ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-500">Finding matches...</p>
              </div>
            ) : smartMatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No matching reviews found</p>
                <p className="text-sm">Try selecting a different review</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {smartMatches.map(({ review: matchReview, match_score, match_reasons }) => (
                  <div key={matchReview.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className={`${
                        match_score >= 70 ? 'bg-green-600' :
                        match_score >= 40 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {match_score}% match
                      </Badge>
                    </div>
                    <ReviewCard
                      review={matchReview}
                      showLinkButton={true}
                      onLink={() => handleLinkReviews(matchReview)}
                    />
                    {match_reasons && match_reasons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {match_reasons.map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Review Categories</CardTitle>
          <CardDescription>Overview of review distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.slug} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {cat.slug === 'cases-settled-won' && <Gavel className="w-5 h-5 text-green-600" />}
                  {cat.slug === 'attorney-testimonials' && <Building2 className="w-5 h-5 text-purple-600" />}
                  {cat.slug === 'client-success-stories' && <Users className="w-5 h-5 text-blue-600" />}
                  {cat.slug === 'lawsuit-victories' && <DollarSign className="w-5 h-5 text-orange-600" />}
                  <span className="font-medium">{cat.name}</span>
                </div>
                <p className="text-3xl font-bold">{cat.count}</p>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={attachmentModal.open}
        onClose={() => setAttachmentModal({ open: false, review: null })}
        review={attachmentModal.review}
        onSave={fetchData}
      />
    </div>
  );
}
