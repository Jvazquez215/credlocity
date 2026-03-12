import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Star, CheckCircle, User, Mail, Phone, MapPin, 
  TrendingUp, DollarSign, Gavel, Building2, Search,
  ChevronDown, ChevronRight, Video, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Star Rating Selector
const StarRatingSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="focus:outline-none"
      >
        <Star 
          className={`w-8 h-8 transition-colors ${
            star <= value 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300 hover:text-yellow-200'
          }`} 
        />
      </button>
    ))}
    <span className="ml-2 text-sm text-gray-500">
      {value === 5 ? 'Excellent!' : value === 4 ? 'Great!' : value === 3 ? 'Good' : value === 2 ? 'Fair' : 'Poor'}
    </span>
  </div>
);

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const ClientReviewForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attorneys, setAttorneys] = useState([]);
  const [attorneySearch, setAttorneySearch] = useState('');
  const [showAttorneyDropdown, setShowAttorneyDropdown] = useState(false);
  const [searchingAttorneys, setSearchingAttorneys] = useState(false);
  const [matchingReviews, setMatchingReviews] = useState([]);
  
  const [formData, setFormData] = useState({
    // Basic Info
    client_name: '',
    client_email: '',
    client_phone: '',
    client_city: '',
    client_state: '',
    
    // Credit Score
    before_score: '',
    after_score: '',
    
    // Rating & Review
    rating: 5,
    testimonial_text: '',
    full_story: '',
    
    // Lawsuit/Attorney Linking
    worked_with_attorney: false,
    attorney_helped_with_lawsuit: false,
    selected_attorney_id: '',
    selected_attorney_name: '',
    defendant_name: '',
    settlement_amount: '',
    case_type: '',
    
    // Linked Attorney Review
    linked_attorney_review_id: '',
    
    // Video
    video_url: '',
    video_platform: '',
    
    // Consent
    consent_to_publish: true,
    consent_to_contact: true
  });

  // Search for attorneys as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (attorneySearch && attorneySearch.length >= 2) {
        searchAttorneys();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [attorneySearch]);

  // Search for matching attorney reviews when attorney is selected
  useEffect(() => {
    if (formData.selected_attorney_id && formData.client_name) {
      searchMatchingReviews();
    }
  }, [formData.selected_attorney_id, formData.client_name, formData.client_city, formData.client_state]);

  const searchAttorneys = async () => {
    setSearchingAttorneys(true);
    try {
      const res = await fetch(`${API_URL}/api/attorneys?search=${encodeURIComponent(attorneySearch)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setAttorneys(data.attorneys || data || []);
      }
    } catch (err) {
      console.error('Failed to search attorneys:', err);
    } finally {
      setSearchingAttorneys(false);
    }
  };

  const searchMatchingReviews = async () => {
    try {
      // Search for attorney reviews that match this client
      const params = new URLSearchParams({
        attorney_name: formData.selected_attorney_name || '',
        client_name: formData.client_name || '',
        limit: '10'
      });
      if (formData.client_city) params.append('city', formData.client_city);
      if (formData.client_state) params.append('state', formData.client_state);
      
      const res = await fetch(`${API_URL}/api/review-linking/attorney-reviews/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMatchingReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to search matching reviews:', err);
    }
  };

  const selectAttorney = (attorney) => {
    setFormData({
      ...formData,
      selected_attorney_id: attorney.id,
      selected_attorney_name: attorney.full_name || attorney.name
    });
    setShowAttorneyDropdown(false);
    setAttorneySearch('');
    toast.success(`Selected: ${attorney.full_name || attorney.name}`);
  };

  const linkToAttorneyReview = (review) => {
    setFormData({
      ...formData,
      linked_attorney_review_id: review.id
    });
    toast.success('Linked to attorney review!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        client_name: formData.client_name,
        location: `${formData.client_city}, ${formData.client_state}`,
        before_score: parseInt(formData.before_score) || 0,
        after_score: parseInt(formData.after_score) || 0,
        rating: formData.rating,
        testimonial_text: formData.testimonial_text,
        full_story: formData.full_story,
        video_url: formData.video_url,
        video_platform: formData.video_platform,
        // Lawsuit/Attorney info
        worked_with_attorney: formData.attorney_helped_with_lawsuit,
        has_settlement: formData.attorney_helped_with_lawsuit && formData.settlement_amount > 0,
        settlement_details: formData.attorney_helped_with_lawsuit ? {
          amount: parseFloat(formData.settlement_amount) || null,
          defendant_name: formData.defendant_name,
          case_type: formData.case_type
        } : null,
        linked_attorney_review_id: formData.linked_attorney_review_id || null,
        // Contact info (for admin use)
        contact_email: formData.client_email,
        contact_phone: formData.client_phone,
        // Consent
        show_on_success_stories: formData.consent_to_publish
      };

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Thank you for your review!');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your review has been submitted successfully. It will be published after our team reviews it.
            </p>
            {formData.linked_attorney_review_id && (
              <Badge className="bg-yellow-500 text-yellow-900 mb-4">
                ✓ Linked to attorney&apos;s review
              </Badge>
            )}
            <Button onClick={() => window.location.href = '/success-stories'} className="mt-4">
              View Success Stories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Share Your Success Story | Credlocity</title>
        <meta name="description" content="Share your credit repair success story with Credlocity. Help others learn how we can improve their credit scores." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="bg-blue-600 text-white mb-4">Share Your Story</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tell Us About Your Experience
            </h1>
            <p className="text-lg text-gray-600">
              Your story could inspire others to take control of their credit
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Your Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Your Name *</Label>
                        <Input
                          required
                          value={formData.client_name}
                          onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                          placeholder="John D."
                        />
                        <p className="text-xs text-gray-500 mt-1">You can use first name and last initial</p>
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          required
                          value={formData.client_email}
                          onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label>City *</Label>
                        <Input
                          required
                          value={formData.client_city}
                          onChange={(e) => setFormData({...formData, client_city: e.target.value})}
                          placeholder="Your city"
                        />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <select
                          required
                          value={formData.client_state}
                          onChange={(e) => setFormData({...formData, client_state: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="button" onClick={() => setStep(2)}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Credit Score & Rating */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Your Results
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Credit Score Before Credlocity</Label>
                        <Input
                          type="number"
                          min="300"
                          max="850"
                          value={formData.before_score}
                          onChange={(e) => setFormData({...formData, before_score: e.target.value})}
                          placeholder="e.g., 520"
                        />
                      </div>
                      <div>
                        <Label>Credit Score After Credlocity</Label>
                        <Input
                          type="number"
                          min="300"
                          max="850"
                          value={formData.after_score}
                          onChange={(e) => setFormData({...formData, after_score: e.target.value})}
                          placeholder="e.g., 720"
                        />
                      </div>
                    </div>

                    {formData.before_score && formData.after_score && (
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">Your Improvement</p>
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-2xl font-bold text-red-500">{formData.before_score}</span>
                          <TrendingUp className="w-6 h-6 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">{formData.after_score}</span>
                          <Badge className="bg-green-600 text-white text-lg">
                            +{parseInt(formData.after_score) - parseInt(formData.before_score)} points!
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>How would you rate your experience? *</Label>
                      <div className="mt-2">
                        <StarRatingSelector 
                          value={formData.rating}
                          onChange={(rating) => setFormData({...formData, rating})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setStep(3)}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Lawsuit/Attorney Question */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-purple-600" />
                      Lawsuit Information
                    </h2>

                    {/* Key Question */}
                    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                      <Label className="text-lg font-semibold text-purple-800">
                        Did Credlocity help you with a lawsuit?
                      </Label>
                      <p className="text-sm text-purple-600 mb-4">
                        If you won a case or received a settlement through our attorney network, let us know!
                      </p>
                      
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={formData.attorney_helped_with_lawsuit ? "default" : "outline"}
                          className={formData.attorney_helped_with_lawsuit ? "bg-purple-600" : ""}
                          onClick={() => setFormData({...formData, attorney_helped_with_lawsuit: true})}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!formData.attorney_helped_with_lawsuit ? "default" : "outline"}
                          onClick={() => setFormData({...formData, attorney_helped_with_lawsuit: false, selected_attorney_id: '', selected_attorney_name: ''})}
                        >
                          No
                        </Button>
                      </div>
                    </div>

                    {/* Attorney Search - Only show if they said yes */}
                    {formData.attorney_helped_with_lawsuit && (
                      <div className="space-y-4 border-l-4 border-purple-500 pl-4">
                        <div>
                          <Label className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Who was your attorney?
                          </Label>
                          <p className="text-xs text-gray-500 mb-2">
                            Start typing to search our attorney network
                          </p>
                          
                          <div className="relative">
                            <Input
                              value={formData.selected_attorney_name || attorneySearch}
                              onChange={(e) => {
                                setAttorneySearch(e.target.value);
                                setShowAttorneyDropdown(true);
                                if (!e.target.value) {
                                  setFormData({...formData, selected_attorney_id: '', selected_attorney_name: ''});
                                }
                              }}
                              onFocus={() => setShowAttorneyDropdown(true)}
                              placeholder="Search for attorney by name..."
                              className={formData.selected_attorney_id ? 'border-green-500' : ''}
                            />
                            {searchingAttorneys && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                            )}
                            
                            {/* Attorney Dropdown */}
                            {showAttorneyDropdown && attorneys.length > 0 && !formData.selected_attorney_id && (
                              <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {attorneys.map(attorney => (
                                  <button
                                    key={attorney.id}
                                    type="button"
                                    onClick={() => selectAttorney(attorney)}
                                    className="w-full p-3 text-left hover:bg-purple-50 border-b last:border-b-0 flex items-center gap-3"
                                  >
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                    <div>
                                      <p className="font-medium">{attorney.full_name || attorney.name}</p>
                                      {attorney.firm_name && (
                                        <p className="text-sm text-gray-500">{attorney.firm_name}</p>
                                      )}
                                      {attorney.location && (
                                        <p className="text-xs text-gray-400">{attorney.location}</p>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {formData.selected_attorney_id && (
                            <Badge className="bg-green-100 text-green-700 mt-2">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Attorney Selected: {formData.selected_attorney_name}
                            </Badge>
                          )}
                        </div>

                        {/* Case Details */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Who did you sue? (Defendant)</Label>
                            <Input
                              value={formData.defendant_name}
                              onChange={(e) => setFormData({...formData, defendant_name: e.target.value})}
                              placeholder="e.g., Experian, Portfolio Recovery"
                            />
                          </div>
                          <div>
                            <Label>Settlement Amount ($)</Label>
                            <Input
                              type="number"
                              value={formData.settlement_amount}
                              onChange={(e) => setFormData({...formData, settlement_amount: e.target.value})}
                              placeholder="e.g., 15000"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Case Type</Label>
                          <select
                            value={formData.case_type}
                            onChange={(e) => setFormData({...formData, case_type: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Select Case Type</option>
                            <option value="fcra">FCRA (Fair Credit Reporting Act)</option>
                            <option value="fdcpa">FDCPA (Fair Debt Collection)</option>
                            <option value="tcpa">TCPA (Telephone Consumer Protection)</option>
                            <option value="state_consumer">State Consumer Protection</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Matching Attorney Reviews */}
                        {matchingReviews.length > 0 && (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <Label className="text-yellow-800 flex items-center gap-2 mb-3">
                              <AlertCircle className="w-4 h-4" />
                              We found potential matching attorney reviews!
                            </Label>
                            <p className="text-sm text-yellow-700 mb-3">
                              Does any of these match your case? Linking helps with verification.
                            </p>
                            <div className="space-y-2">
                              {matchingReviews.slice(0, 3).map(review => (
                                <div 
                                  key={review.id}
                                  className={`p-3 bg-white rounded border cursor-pointer hover:border-yellow-400 ${
                                    formData.linked_attorney_review_id === review.id ? 'border-green-500 bg-green-50' : ''
                                  }`}
                                  onClick={() => linkToAttorneyReview(review)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{review.client_name}</p>
                                      {review.linked_client_review_name && (
                                        <p className="text-sm text-gray-500">
                                          Client: {review.linked_client_review_name}
                                        </p>
                                      )}
                                    </div>
                                    {formData.linked_attorney_review_id === review.id ? (
                                      <Badge className="bg-green-600">Linked ✓</Badge>
                                    ) : (
                                      <Button type="button" size="sm" variant="outline">Link</Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setStep(4)}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Review Text */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Your Review
                    </h2>

                    <div>
                      <Label>Your Review *</Label>
                      <Textarea
                        required
                        value={formData.testimonial_text}
                        onChange={(e) => setFormData({...formData, testimonial_text: e.target.value})}
                        placeholder="Share your experience with Credlocity. What was your situation before? How did we help you?"
                        className="min-h-32"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.testimonial_text.length}/50 characters minimum
                      </p>
                    </div>

                    <div>
                      <Label>Full Story (Optional)</Label>
                      <Textarea
                        value={formData.full_story}
                        onChange={(e) => setFormData({...formData, full_story: e.target.value})}
                        placeholder="Tell us more about your journey. What challenges did you face? How has your life improved?"
                        className="min-h-24"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video Testimonial URL (Optional)
                        </Label>
                        <Input
                          value={formData.video_url}
                          onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div>
                        <Label>Video Platform</Label>
                        <select
                          value={formData.video_platform}
                          onChange={(e) => setFormData({...formData, video_platform: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select Platform</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="instagram">Instagram</option>
                          <option value="vimeo">Vimeo</option>
                        </select>
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="space-y-3 pt-4 border-t">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent_to_publish}
                          onChange={(e) => setFormData({...formData, consent_to_publish: e.target.checked})}
                          className="mt-1 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to have my review published on Credlocity&apos;s website and marketing materials
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent_to_contact}
                          onChange={(e) => setFormData({...formData, consent_to_contact: e.target.checked})}
                          className="mt-1 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Credlocity may contact me for follow-up or verification
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(3)}>
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading || formData.testimonial_text.length < 50}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ClientReviewForm;
