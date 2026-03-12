import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Star, CheckCircle, User, Mail, Phone, MapPin, 
  TrendingUp, DollarSign, Gavel, Building2, Search,
  ChevronDown, ChevronRight, Video, Loader2, AlertCircle,
  Camera, StopCircle, Play, Pause, RotateCcw, Upload,
  Facebook, Instagram, Twitter, Linkedin, Globe, Link2, X,
  ClipboardList, Sparkles, Heart, Award, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Review Categories
const REVIEW_CATEGORIES = [
  { 
    id: 'signup_process', 
    label: 'Sign-Up Process', 
    description: 'Your experience getting started with Credlocity',
    icon: ClipboardList,
    color: 'blue'
  },
  { 
    id: 'results', 
    label: 'Results & Outcomes', 
    description: 'The results you achieved with our services',
    icon: TrendingUp,
    color: 'green'
  },
  { 
    id: 'customer_service', 
    label: 'Customer Service', 
    description: 'Your experience with our support team',
    icon: Heart,
    color: 'pink'
  },
  { 
    id: 'overall_service', 
    label: 'Overall Service', 
    description: 'Your complete experience with Credlocity',
    icon: Award,
    color: 'purple'
  },
  { 
    id: 'follow_up_update', 
    label: 'Follow-Up Update', 
    description: 'An update to your previous review',
    icon: RefreshCw,
    color: 'orange',
    hidden: true // Only shown for follow-up links
  }
];

// Star Rating Selector
const StarRatingSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(star);
        }}
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

const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourprofile' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourhandle' },
  { key: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/yourhandle' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile' },
  { key: 'tiktok', label: 'TikTok', icon: Globe, placeholder: 'https://tiktok.com/@yourhandle' },
  { key: 'bluesky', label: 'Bluesky', icon: Globe, placeholder: 'https://bsky.app/profile/yourhandle' },
  { key: 'threads', label: 'Threads', icon: Globe, placeholder: 'https://threads.net/@yourhandle' },
];

// Video Recorder Component - Completely isolated from form
const VideoRecorder = ({ onVideoRecorded, onCancel }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  
  const timerRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamReady(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setPermissionDenied(true);
      toast.error('Camera access denied. Please allow camera access to record a video.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    
    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startCamera]);

  const handleStartRecording = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!videoRef.current?.srcObject) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) {
        chunksRef.current.push(ev.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setPreviewMode(true);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const handleStopRecording = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Stop camera stream
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleRetakeVideo = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRecordedBlob(null);
    setRecordedUrl(null);
    setPreviewMode(false);
    setRecordingTime(0);
    await startCamera();
  };

  const handleApproveVideo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (recordedBlob) {
      onVideoRecorded(recordedBlob, recordedUrl);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-semibold text-red-800 mb-2">Camera Access Denied</h3>
        <p className="text-red-600 text-sm mb-4">
          Please allow camera access in your browser settings to record a video review.
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
        >
          Skip Video Recording
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        {previewMode && recordedUrl ? (
          <video 
            src={recordedUrl}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <video 
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}
        
        {/* Recording indicator */}
        {recording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {/* Max time warning */}
        {recordingTime > 110 && recording && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm">
            Max 2 min
          </div>
        )}
      </div>
      
      {/* Controls - Using native buttons to avoid any form interference */}
      <div className="p-4 bg-gray-800">
        {!previewMode ? (
          <div className="flex justify-center gap-4">
            {!recording ? (
              <>
                <button 
                  type="button"
                  onClick={handleStartRecording} 
                  disabled={!streamReady}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Recording
                </button>
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={handleStopRecording}
                className="flex items-center px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Stop Recording ({formatTime(120 - recordingTime)})
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <button 
              type="button"
              onClick={handleRetakeVideo}
              className="flex items-center px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </button>
            <button 
              type="button"
              onClick={handleApproveVideo}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Use
            </button>
          </div>
        )}
        
        <p className="text-gray-400 text-xs text-center mt-3">
          {previewMode 
            ? "Review your video and click 'Approve & Use' to include it with your review"
            : "Record up to 2 minutes. Click Stop when done."}
        </p>
      </div>
    </div>
  );
};

// Category Selection Component
const CategorySelector = ({ value, onChange, isFollowUp = false }) => {
  const categories = isFollowUp 
    ? REVIEW_CATEGORIES 
    : REVIEW_CATEGORIES.filter(c => !c.hidden);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = value === category.id;
        const colorClasses = {
          blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
          green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
          pink: isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300',
          purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
          orange: isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300',
        };
        const iconColors = {
          blue: 'text-blue-600',
          green: 'text-green-600',
          pink: 'text-pink-600',
          purple: 'text-purple-600',
          orange: 'text-orange-600',
        };
        
        return (
          <button
            key={category.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(category.id);
            }}
            className={`p-4 border-2 rounded-lg text-left transition-all ${colorClasses[category.color]}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-white shadow-sm ${iconColors[category.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{category.label}</p>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
              {isSelected && (
                <CheckCircle className={`w-5 h-5 ml-auto ${iconColors[category.color]}`} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ClientReviewFormEnhanced = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(!!token);
  const [submitted, setSubmitted] = useState(false);
  const [linkValid, setLinkValid] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [linkData, setLinkData] = useState(null);
  
  // Is this a follow-up review link?
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [originalReview, setOriginalReview] = useState(null);
  
  // Attorney search
  const [attorneys, setAttorneys] = useState([]);
  const [attorneySearch, setAttorneySearch] = useState('');
  const [showAttorneyDropdown, setShowAttorneyDropdown] = useState(false);
  const [searchingAttorneys, setSearchingAttorneys] = useState(false);
  
  // Video recording
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    // Basic Info
    client_name: '',
    client_email: '',
    client_phone: '',
    client_city: '',
    client_state: '',
    
    // Review Category
    review_category: '',
    
    // Credit Score
    before_score: '',
    after_score: '',
    
    // Rating & Review
    rating: 5,
    testimonial_text: '',
    full_story: '',
    
    // Social Links
    social_links: {},
    
    // Lawsuit/Attorney Linking
    helped_with_lawsuit: false,
    selected_attorney_id: '',
    selected_attorney_name: '',
    defendant_name: '',
    settlement_amount: '',
    case_type: '',
    
    // Video
    video_url: '',
    has_recorded_video: false,
    
    // Consent
    consent_to_publish: true,
    consent_to_contact: true
  });

  // Validate link on mount if token provided
  useEffect(() => {
    if (token) {
      validateLink();
    }
  }, [token]);

  // Search for attorneys as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (attorneySearch && attorneySearch.length >= 2) {
        searchAttorneys();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [attorneySearch]);

  const validateLink = async () => {
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/validate-link/${token}`);
      const data = await res.json();
      
      if (data.valid) {
        setLinkValid(true);
        setLinkData(data);
        
        // Check if this is a follow-up link
        if (data.is_follow_up && data.original_review) {
          setIsFollowUp(true);
          setOriginalReview(data.original_review);
          // Pre-select follow-up category
          setFormData(prev => ({
            ...prev,
            client_name: data.client_name || '',
            client_email: data.client_email || '',
            client_phone: data.client_phone || '',
            review_category: 'follow_up_update'
          }));
        } else {
          // Pre-fill form with link data
          setFormData(prev => ({
            ...prev,
            client_name: data.client_name || '',
            client_email: data.client_email || '',
            client_phone: data.client_phone || ''
          }));
        }
      } else {
        setLinkValid(false);
        setLinkError(data.message || 'Invalid link');
      }
    } catch (err) {
      console.error('Error validating link:', err);
      setLinkValid(false);
      setLinkError('Failed to validate link');
    } finally {
      setValidating(false);
    }
  };

  const searchAttorneys = async () => {
    setSearchingAttorneys(true);
    try {
      const res = await fetch(`${API_URL}/api/client-reviews/search-attorneys?q=${encodeURIComponent(attorneySearch)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setAttorneys(data.attorneys || []);
      }
    } catch (err) {
      console.error('Failed to search attorneys:', err);
    } finally {
      setSearchingAttorneys(false);
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

  const handleVideoRecorded = (blob, url) => {
    setRecordedVideoBlob(blob);
    setRecordedVideoUrl(url);
    setFormData(prev => ({ ...prev, has_recorded_video: true }));
    setShowVideoRecorder(false);
    toast.success('Video recorded successfully!');
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const openVideoRecorder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVideoRecorder(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine which endpoint to use
      const endpoint = token 
        ? `${API_URL}/api/client-reviews/submit/${token}`
        : `${API_URL}/api/client-reviews/submit-public`;
      
      const submitData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        client_city: formData.client_city,
        client_state: formData.client_state,
        review_category: formData.review_category,
        before_score: parseInt(formData.before_score) || null,
        after_score: parseInt(formData.after_score) || null,
        rating: formData.rating,
        testimonial_text: formData.testimonial_text,
        full_story: formData.full_story,
        social_links: formData.social_links,
        helped_with_lawsuit: formData.helped_with_lawsuit,
        selected_attorney_id: formData.selected_attorney_id || null,
        selected_attorney_name: formData.selected_attorney_name || null,
        defendant_name: formData.defendant_name || null,
        settlement_amount: parseFloat(formData.settlement_amount) || null,
        case_type: formData.case_type || null,
        video_url: formData.video_url || null,
        has_recorded_video: formData.has_recorded_video,
        consent_to_publish: formData.consent_to_publish,
        consent_to_contact: formData.consent_to_contact,
        is_follow_up: isFollowUp,
        original_review_id: originalReview?.id || null
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        const result = await res.json();
        
        // Upload video if recorded
        if (recordedVideoBlob && result.review_id) {
          const videoFormData = new FormData();
          videoFormData.append('file', recordedVideoBlob, 'review_video.webm');
          
          await fetch(`${API_URL}/api/client-reviews/upload-video/${result.review_id}`, {
            method: 'POST',
            body: videoFormData
          });
        }
        
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

  // Validating state
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating your review link...</p>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (token && linkValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Link Not Valid</h1>
            <p className="text-lg text-gray-600 mb-6">{linkError}</p>
            <Button type="button" onClick={() => navigate('/success-stories')} className="mt-4">
              View Success Stories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isFollowUp ? 'Update Submitted!' : 'Thank You!'}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {isFollowUp 
                ? 'Your review update has been submitted successfully. It will be added to your original review after our team reviews it.'
                : 'Your review has been submitted successfully. It will be published after our team reviews it.'}
            </p>
            {formData.has_recorded_video && (
              <Badge className="bg-purple-500 text-white mb-4">
                <Video className="w-4 h-4 mr-1" /> Video Review Included
              </Badge>
            )}
            <Button type="button" onClick={() => navigate('/success-stories')} className="mt-4">
              View Success Stories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total steps based on whether it's a follow-up
  const totalSteps = isFollowUp ? 4 : 6;

  return (
    <>
      <Helmet>
        <title>{isFollowUp ? 'Update Your Review' : 'Share Your Success Story'} | Credlocity</title>
        <meta name="description" content="Share your credit repair success story with Credlocity. Help others learn how we can improve their credit scores." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            {isFollowUp ? (
              <>
                <Badge className="bg-orange-500 text-white mb-4">
                  <RefreshCw className="w-3 h-3 mr-1" /> Update Your Review
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Share Your Updated Experience
                </h1>
                <p className="text-lg text-gray-600">
                  Thank you for coming back, {linkData?.client_name}! Tell us how things have progressed.
                </p>
                {originalReview && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-xl mx-auto">
                    <p className="text-sm text-gray-500 mb-1">Your original review ({originalReview.review_category}):</p>
                    <p className="text-gray-700 italic">&quot;{originalReview.testimonial_text?.substring(0, 150)}...&quot;</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <Badge className="bg-blue-600 text-white mb-4">Share Your Story</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {token ? 'Complete Your Review' : 'Leave an Honest Review'}
                </h1>
                <p className="text-lg text-gray-600">
                  {token 
                    ? `Thank you ${linkData?.client_name || ''}! We'd love to hear about your experience.`
                    : 'Your story could inspire others to take control of their credit'}
                </p>
              </>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <React.Fragment key={s}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < totalSteps && (
                  <div className={`w-8 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                
                {/* Step 1: Review Category (NEW) */}
                {step === 1 && !isFollowUp && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      What type of review are you leaving?
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Select the category that best describes your review
                    </p>

                    <CategorySelector 
                      value={formData.review_category}
                      onChange={(category) => setFormData({...formData, review_category: category})}
                      isFollowUp={false}
                    />

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                        disabled={!formData.review_category}
                      >
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2 (or 1 for follow-up): Basic Info */}
                {((step === 2 && !isFollowUp) || (step === 1 && isFollowUp)) && (
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
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.client_email}
                          onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={formData.client_phone}
                          onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.client_city}
                          onChange={(e) => setFormData({...formData, client_city: e.target.value})}
                          placeholder="Your city"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <select
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

                    <div className="flex justify-between pt-4">
                      {!isFollowUp && (
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                          Back
                        </Button>
                      )}
                      <Button type="button" onClick={() => setStep(isFollowUp ? 2 : 3)} className={isFollowUp ? 'ml-auto' : ''}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3 (or 2 for follow-up): Credit Score & Rating */}
                {((step === 3 && !isFollowUp) || (step === 2 && isFollowUp)) && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      {isFollowUp ? 'Your Updated Results' : 'Your Results'}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>{isFollowUp ? 'Credit Score (Previous Update)' : 'Credit Score Before Credlocity'}</Label>
                        <Input
                          type="number"
                          min="300"
                          max="850"
                          value={formData.before_score}
                          onChange={(e) => setFormData({...formData, before_score: e.target.value})}
                          placeholder={isFollowUp ? "e.g., 620" : "e.g., 520"}
                        />
                      </div>
                      <div>
                        <Label>{isFollowUp ? 'Credit Score Now' : 'Credit Score After Credlocity'}</Label>
                        <Input
                          type="number"
                          min="300"
                          max="850"
                          value={formData.after_score}
                          onChange={(e) => setFormData({...formData, after_score: e.target.value})}
                          placeholder={isFollowUp ? "e.g., 750" : "e.g., 720"}
                        />
                      </div>
                    </div>

                    {formData.before_score && formData.after_score && (
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">{isFollowUp ? 'Additional Improvement' : 'Your Improvement'}</p>
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
                      <Button type="button" variant="outline" onClick={() => setStep(isFollowUp ? 1 : 2)}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setStep(isFollowUp ? 3 : 4)}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4 (skip for follow-up): Lawsuit/Attorney Question */}
                {step === 4 && !isFollowUp && (
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
                          variant={formData.helped_with_lawsuit ? "default" : "outline"}
                          className={formData.helped_with_lawsuit ? "bg-purple-600" : ""}
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({...formData, helped_with_lawsuit: true});
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!formData.helped_with_lawsuit ? "default" : "outline"}
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({...formData, helped_with_lawsuit: false, selected_attorney_id: '', selected_attorney_name: ''});
                          }}
                        >
                          No
                        </Button>
                      </div>
                    </div>

                    {/* Attorney Search - Only show if they said yes */}
                    {formData.helped_with_lawsuit && (
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
                                    onClick={(e) => {
                                      e.preventDefault();
                                      selectAttorney(attorney);
                                    }}
                                    className="w-full p-3 text-left hover:bg-purple-50 border-b last:border-b-0 flex items-center gap-3"
                                  >
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                    <div>
                                      <p className="font-medium">{attorney.full_name || attorney.name}</p>
                                      {attorney.firm_name && (
                                        <p className="text-sm text-gray-500">{attorney.firm_name}</p>
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
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(3)}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setStep(5)}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5 (or 3 for follow-up): Review Text & Video */}
                {((step === 5 && !isFollowUp) || (step === 3 && isFollowUp)) && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      {isFollowUp ? 'Your Update' : 'Your Review'}
                    </h2>

                    <div>
                      <Label>{isFollowUp ? 'Your Update *' : 'Your Review *'}</Label>
                      <Textarea
                        required
                        value={formData.testimonial_text}
                        onChange={(e) => setFormData({...formData, testimonial_text: e.target.value})}
                        placeholder={isFollowUp 
                          ? "Share what's changed since your last review. What new results have you seen?"
                          : "Share your experience with Credlocity. What was your situation before? How did we help you?"}
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
                        placeholder={isFollowUp
                          ? "Tell us more about your continued journey with Credlocity."
                          : "Tell us more about your journey. What challenges did you face? How has your life improved?"}
                        className="min-h-24"
                      />
                    </div>

                    {/* Video Section */}
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <Label className="flex items-center gap-2 text-lg mb-3">
                        <Video className="w-5 h-5 text-purple-600" />
                        {isFollowUp ? 'Updated Video Review (Optional)' : 'Video Review (Optional)'}
                      </Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Record a video review to make your story even more impactful!
                      </p>
                      
                      {!showVideoRecorder && !recordedVideoUrl ? (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={openVideoRecorder}
                            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Record Video Review
                          </button>
                          <span className="text-gray-400 self-center">or</span>
                          <Input
                            value={formData.video_url}
                            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                            placeholder="Paste YouTube/TikTok URL"
                            className="flex-1 min-w-[200px]"
                          />
                        </div>
                      ) : recordedVideoUrl ? (
                        <div className="space-y-3">
                          <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-800 font-medium">Video recorded successfully!</span>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setRecordedVideoBlob(null);
                                setRecordedVideoUrl(null);
                                setFormData(prev => ({ ...prev, has_recorded_video: false }));
                              }}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 flex items-center"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </button>
                          </div>
                          <video src={recordedVideoUrl} controls className="w-full max-h-48 rounded-lg" />
                        </div>
                      ) : (
                        <div className="bg-gray-100 p-4 rounded-lg text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                          <p className="text-sm text-gray-600">Opening camera...</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(isFollowUp ? 2 : 4)}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setStep(isFollowUp ? 4 : 6)}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 6 (or 4 for follow-up): Social Links & Consent */}
                {((step === 6 && !isFollowUp) || (step === 4 && isFollowUp)) && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-blue-600" />
                      Social Links & Consent
                    </h2>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <Label>Social Media Links (Optional)</Label>
                      <p className="text-sm text-gray-500 -mt-2">
                        Add your social profiles to help others connect with you
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {SOCIAL_PLATFORMS.map((platform) => {
                          const Icon = platform.icon;
                          return (
                            <div key={platform.key} className="relative">
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                value={formData.social_links[platform.key] || ''}
                                onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                                placeholder={platform.placeholder}
                                className="pl-10"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="space-y-3 pt-4 border-t">
                      <Label className="text-lg">Consent</Label>
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
                      <Button type="button" variant="outline" onClick={() => setStep(isFollowUp ? 3 : 5)}>
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
                            {isFollowUp ? 'Submit Update' : 'Submit Review'}
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

      {/* Video Recorder Modal - Rendered OUTSIDE the form to prevent form submission */}
      {showVideoRecorder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                Record Video Review
              </h3>
              <button
                type="button"
                onClick={() => setShowVideoRecorder(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <VideoRecorder
                onVideoRecorded={handleVideoRecorded}
                onCancel={() => setShowVideoRecorder(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientReviewFormEnhanced;
