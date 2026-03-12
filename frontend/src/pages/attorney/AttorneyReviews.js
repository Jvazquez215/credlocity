import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, Video, FileText, Plus, Edit, Trash2, Eye, 
  CheckCircle, Clock, AlertCircle, ChevronLeft, Play,
  DollarSign, TrendingUp, User, Building2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { toast } from 'sonner';

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

// Star Rating Component
const StarRating = ({ value, onChange, readOnly = false, size = "w-8 h-8" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && onChange && onChange(star)}
        className={`p-1 ${readOnly ? '' : 'hover:scale-110'} transition-transform`}
      >
        <Star 
          className={`${size} ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      </button>
    ))}
  </div>
);

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  
  const labels = {
    pending_approval: 'Pending Approval',
    published: 'Published',
    rejected: 'Rejected'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending_approval}`}>
      {labels[status] || status}
    </span>
  );
};

// Review Card Component
const ReviewCard = ({ review, onEdit, onDelete }) => (
  <Card className={`${review.published ? 'border-green-200' : 'border-gray-200'}`}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={review.status} />
            {review.video_url && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Play className="w-3 h-3" /> Video
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg">{review.story_title || 'My Review'}</h3>
          <p className="text-sm text-gray-500">
            Submitted {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
        <StarRating value={review.rating || 5} readOnly size="w-5 h-5" />
      </div>

      <p className="text-gray-700 line-clamp-3 mb-4">{review.testimonial_text}</p>

      {(review.attorney_settlement_amount || review.credlocity_points_gained) && (
        <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
          {review.attorney_settlement_amount && (
            <div>
              <p className="text-xs text-gray-500">Client Recovery</p>
              <p className="font-bold text-green-600">{formatCurrency(review.attorney_settlement_amount)}</p>
            </div>
          )}
          {review.credlocity_points_gained && (
            <div>
              <p className="text-xs text-gray-500">Credit Points Gained</p>
              <p className="font-bold text-blue-600">+{review.credlocity_points_gained}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!review.published && (
          <>
            <Button size="sm" variant="outline" onClick={() => onEdit(review)}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => onDelete(review.id)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </>
        )}
        {review.published && review.story_slug && (
          <Link to={`/success-stories/${review.story_slug}`}>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-1" /> View Live
            </Button>
          </Link>
        )}
      </div>
    </CardContent>
  </Card>
);

// Review Form Modal
const ReviewFormModal = ({ isOpen, onClose, review, onSubmit }) => {
  const [formData, setFormData] = useState({
    story_title: '',
    testimonial_text: '',
    full_story: '',
    video_url: '',
    video_platform: '',
    rating: 5,
    settlement_amount: '',
    credlocity_points_gained: '',
    attorney_points_gained: '',
    linked_client_review_id: '',
    linked_client_review_name: '',
    client_has_not_reviewed: false,
    // Review type
    review_type: 'case_outcome', // case_outcome or credlocity_testimonial
    // Settlement details
    defendant_name: '',
    defendant_type: '',
    case_type: '',
    settlement_date: '',
    case_summary: '',
    // Client location for matching
    client_city: '',
    client_state: ''
  });
  const [saving, setSaving] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);

  useEffect(() => {
    if (review) {
      setFormData({
        story_title: review.story_title || '',
        testimonial_text: review.testimonial_text || '',
        full_story: review.full_story || '',
        video_url: review.video_url || '',
        video_platform: review.video_platform || '',
        rating: review.rating || 5,
        settlement_amount: review.attorney_settlement_amount || '',
        credlocity_points_gained: review.credlocity_points_gained || '',
        attorney_points_gained: review.attorney_points_gained || '',
        linked_client_review_id: review.linked_client_review_id || '',
        linked_client_review_name: review.linked_client_review_name || '',
        client_has_not_reviewed: review.client_has_not_reviewed || false,
        review_type: review.review_type || (review.attorney_settlement_amount ? 'case_outcome' : 'credlocity_testimonial'),
        defendant_name: review.settlement_details?.defendant_name || review.defendant_name || '',
        defendant_type: review.settlement_details?.defendant_type || '',
        case_type: review.settlement_details?.case_type || '',
        settlement_date: review.settlement_details?.settlement_date || '',
        case_summary: review.settlement_details?.case_summary || '',
        client_city: review.client_city || '',
        client_state: review.client_state || ''
      });
    } else {
      setFormData({
        story_title: '',
        testimonial_text: '',
        full_story: '',
        video_url: '',
        video_platform: '',
        rating: 5,
        settlement_amount: '',
        credlocity_points_gained: '',
        attorney_points_gained: '',
        linked_client_review_id: '',
        linked_client_review_name: '',
        client_has_not_reviewed: false,
        review_type: 'case_outcome',
        defendant_name: '',
        defendant_type: '',
        case_type: '',
        settlement_date: '',
        case_summary: '',
        client_city: '',
        client_state: ''
      });
    }
  }, [review, isOpen]);

  // Search for clients
  const searchClients = async (query) => {
    if (!query || query.length < 2) {
      setClientSearchResults([]);
      return;
    }
    
    setSearchingClients(true);
    try {
      const response = await fetch(
        `${API_URL}/api/review-linking/client-reviews/search?name=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setClientSearchResults(data.reviews || []);
      }
    } catch (err) {
      console.error('Client search error:', err);
    } finally {
      setSearchingClients(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearchQuery) {
        searchClients(clientSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearchQuery]);

  const selectClient = (client) => {
    setFormData({
      ...formData,
      linked_client_review_id: client.id,
      linked_client_review_name: client.client_name,
      client_has_not_reviewed: false
    });
    setShowClientSearch(false);
    setClientSearchQuery('');
    setClientSearchResults([]);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(formData, review?.id);
    setSaving(false);
  };

  const videoPlatforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'other', label: 'Other' }
  ];

  const defendantTypes = [
    { value: 'credit_bureau', label: 'Credit Bureau (Experian, Equifax, TransUnion)' },
    { value: 'debt_collector', label: 'Debt Collector' },
    { value: 'creditor', label: 'Original Creditor' },
    { value: 'credit_repair_company', label: 'Credit Repair Company' },
    { value: 'other', label: 'Other' }
  ];

  const caseTypes = [
    { value: 'fcra', label: 'FCRA (Fair Credit Reporting Act)' },
    { value: 'fdcpa', label: 'FDCPA (Fair Debt Collection Practices Act)' },
    { value: 'tcpa', label: 'TCPA (Telephone Consumer Protection Act)' },
    { value: 'state_consumer', label: 'State Consumer Protection Law' },
    { value: 'other', label: 'Other' }
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
    'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-6">
          <h2 className="text-xl font-bold">
            {review ? 'Edit Your Review' : 'Share Your Experience'}
          </h2>
          <p className="text-purple-200 text-sm">
            Help other attorneys learn about the Credlocity partnership
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rating */}
          <div className="text-center bg-gray-50 p-6 rounded-lg">
            <label className="block text-sm font-medium mb-4">Rate Your Experience with Credlocity</label>
            <StarRating 
              value={formData.rating} 
              onChange={(rating) => setFormData({...formData, rating})}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Title</label>
            <Input
              value={formData.story_title}
              onChange={(e) => setFormData({...formData, story_title: e.target.value})}
              placeholder="e.g., Excellent Partnership for Consumer Protection Cases"
            />
          </div>

          {/* Testimonial */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review *</label>
            <Textarea
              value={formData.testimonial_text}
              onChange={(e) => setFormData({...formData, testimonial_text: e.target.value})}
              rows={4}
              placeholder="Share your experience working with Credlocity..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.testimonial_text.length} characters</p>
          </div>

          {/* Full Story (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Story (Optional)</label>
            <Textarea
              value={formData.full_story}
              onChange={(e) => setFormData({...formData, full_story: e.target.value})}
              rows={6}
              placeholder="Tell the detailed story of a successful case or your overall experience..."
            />
          </div>

          {/* Video Review */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Review (Optional but Recommended)
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video URL</label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select
                  value={formData.video_platform}
                  onChange={(e) => setFormData({...formData, video_platform: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Platform</option>
                  {videoPlatforms.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Review Type Selection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              What type of review is this?
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, review_type: 'case_outcome'})}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  formData.review_type === 'case_outcome' 
                    ? 'border-blue-500 bg-blue-100' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium">Case Settlement/Victory</p>
                <p className="text-sm text-gray-600">Review about a specific case you won or settled</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, review_type: 'credlocity_testimonial'})}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  formData.review_type === 'credlocity_testimonial' 
                    ? 'border-blue-500 bg-blue-100' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Building2 className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium">Credlocity Partnership</p>
                <p className="text-sm text-gray-600">General testimonial about working with Credlocity</p>
              </button>
            </div>
          </div>

          {/* Case/Settlement Details (only for case_outcome) */}
          {formData.review_type === 'case_outcome' && (
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Case & Settlement Details
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Settlement Amount ($) *</label>
                  <Input
                    type="number"
                    value={formData.settlement_amount}
                    onChange={(e) => setFormData({...formData, settlement_amount: e.target.value})}
                    placeholder="e.g., 15000"
                    required={formData.review_type === 'case_outcome'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Settlement Date</label>
                  <Input
                    type="date"
                    value={formData.settlement_date}
                    onChange={(e) => setFormData({...formData, settlement_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Defendant Name *</label>
                  <Input
                    value={formData.defendant_name}
                    onChange={(e) => setFormData({...formData, defendant_name: e.target.value})}
                    placeholder="e.g., Experian, Portfolio Recovery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Defendant Type</label>
                  <select
                    value={formData.defendant_type}
                    onChange={(e) => setFormData({...formData, defendant_type: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Type</option>
                    {defendantTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Case Type</label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData({...formData, case_type: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Case Type</option>
                    {caseTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Case Summary</label>
                <Textarea
                  value={formData.case_summary}
                  onChange={(e) => setFormData({...formData, case_summary: e.target.value})}
                  rows={3}
                  placeholder="Brief description of the case and outcome..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Credit Points from Credlocity</label>
                  <Input
                    type="number"
                    value={formData.credlocity_points_gained}
                    onChange={(e) => setFormData({...formData, credlocity_points_gained: e.target.value})}
                    placeholder="e.g., 85"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Points from Legal Action</label>
                  <Input
                    type="number"
                    value={formData.attorney_points_gained}
                    onChange={(e) => setFormData({...formData, attorney_points_gained: e.target.value})}
                    placeholder="e.g., 45"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Client Linking Section (only for case_outcome) */}
          {formData.review_type === 'case_outcome' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Link to Client Review
              </h4>
              <p className="text-sm text-yellow-700 mb-4">
                Connect this review to the client&apos;s review for SEO interlinking
              </p>
              
              {formData.linked_client_review_id ? (
                <div className="bg-white p-3 rounded-lg border border-yellow-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Linked to: {formData.linked_client_review_name}</span>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData({...formData, linked_client_review_id: '', linked_client_review_name: ''})}
                  >
                    Remove Link
                  </Button>
                </div>
              ) : formData.client_has_not_reviewed ? (
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Client has not left a review yet</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      value={formData.linked_client_review_name}
                      onChange={(e) => setFormData({...formData, linked_client_review_name: e.target.value})}
                      placeholder="Client name (e.g., John D.)"
                    />
                    <Input
                      value={formData.client_city}
                      onChange={(e) => setFormData({...formData, client_city: e.target.value})}
                      placeholder="City"
                    />
                    <select
                      value={formData.client_state}
                      onChange={(e) => setFormData({...formData, client_state: e.target.value})}
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="">State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">This info will help match when the client leaves a review</p>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => setFormData({...formData, client_has_not_reviewed: false})}
                  >
                    Search for Client Instead
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      value={clientSearchQuery}
                      onChange={(e) => {
                        setClientSearchQuery(e.target.value);
                        setShowClientSearch(true);
                      }}
                      onFocus={() => setShowClientSearch(true)}
                      placeholder="Search for client by name..."
                    />
                    {searchingClients && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                      </div>
                    )}
                    
                    {/* Search Results Dropdown */}
                    {showClientSearch && clientSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {clientSearchResults.map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => selectClient(client)}
                            className="w-full p-3 text-left hover:bg-yellow-50 border-b last:border-b-0"
                          >
                            <p className="font-medium">{client.client_name}</p>
                            <p className="text-sm text-gray-500">
                              {client.location} • Score: {client.before_score} → {client.after_score}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, client_has_not_reviewed: true})}
                      className="text-sm text-yellow-700 hover:underline"
                    >
                      Client hasn&apos;t left a review yet
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={saving || !formData.testimonial_text}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? 'Saving...' : review ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AttorneyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const getToken = () => localStorage.getItem('attorney_token');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/my-reviews`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (formData, reviewId = null) => {
    try {
      const url = reviewId 
        ? `${API_URL}/api/marketplace/attorney/reviews/${reviewId}`
        : `${API_URL}/api/marketplace/attorney/submit-review`;
      
      const method = reviewId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(reviewId ? 'Review updated!' : 'Review submitted for approval!');
        setShowForm(false);
        setEditingReview(null);
        fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (response.ok) {
        toast.success('Review deleted');
        fetchReviews();
      } else {
        toast.error('Failed to delete review');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/attorney/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
            </div>
            <Button onClick={() => { setEditingReview(null); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
          <p className="text-gray-600">
            Share your experience working with Credlocity&apos;s attorney network. 
            Video reviews are especially impactful!
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.filter(r => r.published).length}</p>
                <p className="text-sm text-gray-500">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'pending_approval').length}</p>
                <p className="text-sm text-gray-500">Pending Approval</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onEdit={handleEdit}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 mb-6">
                Share your experience working with Credlocity and help other attorneys 
                discover the benefits of our partnership.
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Review
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingReview(null); }}
        review={editingReview}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default AttorneyReviews;
