import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  AlertTriangle, Shield, CheckCircle, FileText, Upload, 
  Building2, User, Mail, Phone, MapPin, Calendar, DollarSign,
  Search, Plus, ChevronDown, X, Image, Mic, File, Video, Star,
  Twitter, Facebook, Instagram, Linkedin
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Social Media Icons Component
const SocialIcon = ({ platform, className = "w-5 h-5" }) => {
  const icons = {
    twitter: <Twitter className={className} />,
    facebook: <Facebook className={className} />,
    instagram: <Instagram className={className} />,
    linkedin: <Linkedin className={className} />,
    threads: <span className={`${className} font-bold`}>@</span>,
    tiktok: <span className={`${className} font-bold text-xs`}>TT</span>,
    bluesky: <span className={`${className} font-bold text-xs`}>BS</span>
  };
  return icons[platform] || null;
};

const SubmitComplaint = () => {
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Company
    company_id: '',
    company_name: '',
    is_new_company: false,
    new_company_website: '',
    new_company_socials: {
      facebook: '',
      twitter: '',
      instagram: ''
    },
    
    // Complainant
    complainant_name: '',
    complainant_email: '',
    complainant_phone: '',
    complainant_city: '',
    complainant_state: '',
    
    // Complainant socials (for verification)
    social_twitter: '',
    social_facebook: '',
    social_instagram: '',
    social_linkedin: '',
    social_threads: '',
    social_tiktok: '',
    social_bluesky: '',
    
    // Complaint
    date_of_service: '',
    complaint_types: [],
    complaint_details: '',
    person_spoke_to: '',
    amount_paid: '',
    resolution_sought: '',
    fair_resolution: '',
    
    // Rating
    star_rating: 1,
    
    // Video review
    video_review_url: '',
    video_review_platform: '',
    
    // Evidence
    screenshots: [],
    documents: [],
    audio_recordings: []
  });

  const complaintTypes = [
    'False Promises',
    'Charged Without Results',
    'No Communication/Ghost',
    'Unauthorized Charges',
    'Identity Theft Concerns',
    'Misleading Advertising',
    'Poor Customer Service',
    'Contract Issues',
    'Refund Problems',
    'Illegal Practices',
    'Other'
  ];

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];

  const videoPlatforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram Reels' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/credit-repair/companies?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanySelect = (company) => {
    setFormData({
      ...formData,
      company_id: company.id,
      company_name: company.name,
      is_new_company: false
    });
    setSearchTerm(company.name);
    setShowDropdown(false);
  };

  const handleAddNewCompany = () => {
    setFormData({
      ...formData,
      company_id: '',
      company_name: searchTerm,
      is_new_company: true
    });
    setShowNewCompanyForm(true);
    setShowDropdown(false);
  };

  const handleComplaintTypeToggle = (type) => {
    const current = formData.complaint_types;
    if (current.includes(type)) {
      setFormData({
        ...formData,
        complaint_types: current.filter(t => t !== type)
      });
    } else {
      setFormData({
        ...formData,
        complaint_types: [...current, type]
      });
    }
  };

  const handleStarRating = (rating) => {
    setFormData({ ...formData, star_rating: rating });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/credit-repair/complaints/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount_paid: formData.amount_paid ? parseFloat(formData.amount_paid) : null
        })
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Complaint submitted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit complaint');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  // Star Rating Component
  const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star 
            className={`w-8 h-8 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Complaint Submitted</h1>
              <p className="text-gray-600 mb-6">
                Thank you for sharing your experience. Our team will review your complaint 
                and may contact you for additional information. Together, we're making the 
                credit repair industry more transparent.
              </p>
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">What Happens Next?</h3>
                <ul className="text-sm text-blue-700 space-y-2 text-left">
                  <li>• Our team reviews your complaint within 48-72 hours</li>
                  <li>• We may reach out to the company on your behalf</li>
                  <li>• Once verified, your review will be published to help others</li>
                  <li>• You'll receive email updates on your complaint status</li>
                </ul>
              </div>
              <Button onClick={() => window.location.href = '/credit-repair-reviews'}>
                View All Reviews
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit a Complaint | Credit Repair Company Reviews | Credlocity</title>
        <meta name="description" content="File a complaint against a credit repair company. Help other consumers avoid scams and hold dishonest companies accountable. Your voice matters." />
        <meta name="keywords" content="credit repair complaint, report credit repair scam, credit repair fraud, credit repair BBB, file complaint" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-900 to-red-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">The BBB for Credit Repair & Debt Settlement</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Report a Credit Repair Company
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Been scammed or had a bad experience? File a complaint and help protect 
              other consumers from dishonest credit repair companies.
            </p>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-white border-b py-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="text-gray-600">Your Info Protected</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <span className="text-gray-600">We Review Every Complaint</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span className="text-gray-600">Companies Held Accountable</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-red-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Step 1: Company Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Building2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Which Company?</h2>
                    <p className="text-gray-600">Search for the credit repair company you want to report</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search for a company (e.g., Lexington Law)..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="pl-12 py-6 text-lg"
                    />
                    
                    {showDropdown && searchTerm && (
                      <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => handleCompanySelect(company)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span className="font-medium">{company.name}</span>
                            <span className="text-sm text-gray-500">
                              {company.complaint_count || 0} complaints
                            </span>
                          </button>
                        ))}
                        {searchTerm && (
                          <button
                            onClick={handleAddNewCompany}
                            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 flex items-center gap-2 text-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                            Add "{searchTerm}" as new company
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {formData.company_name && (
                    <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">Selected Company:</p>
                        <p className="text-green-700">{formData.company_name}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  )}

                  {showNewCompanyForm && (
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <h4 className="font-medium">New Company Details (Optional)</h4>
                      <Input
                        placeholder="Company Website"
                        value={formData.new_company_website}
                        onChange={(e) => setFormData({...formData, new_company_website: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setStep(2)}
                      disabled={!formData.company_name}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Your Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <User className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Your Information</h2>
                    <p className="text-gray-600">Help us verify your complaint</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        value={formData.complainant_name}
                        onChange={(e) => setFormData({...formData, complainant_name: e.target.value})}
                        placeholder="John Smith"
                      />
                      <p className="text-xs text-gray-500 mt-1">Displayed as "John S." on public reviews</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.complainant_email}
                        onChange={(e) => setFormData({...formData, complainant_email: e.target.value})}
                        placeholder="john@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                      <Input
                        type="tel"
                        value={formData.complainant_phone}
                        onChange={(e) => setFormData({...formData, complainant_phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        value={formData.complainant_city}
                        onChange={(e) => setFormData({...formData, complainant_city: e.target.value})}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <select
                        value={formData.complainant_state}
                        onChange={(e) => setFormData({...formData, complainant_state: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select State</option>
                        {usStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Social Media - Verification */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Verify Your Identity (Optional)
                    </h4>
                    <p className="text-sm text-blue-600 mb-4">
                      Adding your social profiles helps other consumers trust your review is real. 
                      We display icons linking to your profiles.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                        <Input
                          placeholder="@yourusername"
                          value={formData.social_twitter}
                          onChange={(e) => setFormData({...formData, social_twitter: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Facebook className="w-5 h-5 text-[#4267B2]" />
                        <Input
                          placeholder="facebook.com/username"
                          value={formData.social_facebook}
                          onChange={(e) => setFormData({...formData, social_facebook: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-5 h-5 text-[#E4405F]" />
                        <Input
                          placeholder="@yourusername"
                          value={formData.social_instagram}
                          onChange={(e) => setFormData({...formData, social_instagram: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-5 h-5 text-[#0077B5]" />
                        <Input
                          placeholder="linkedin.com/in/username"
                          value={formData.social_linkedin}
                          onChange={(e) => setFormData({...formData, social_linkedin: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 font-bold text-center">@</span>
                        <Input
                          placeholder="Threads @username"
                          value={formData.social_threads}
                          onChange={(e) => setFormData({...formData, social_threads: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 font-bold text-center text-xs">TT</span>
                        <Input
                          placeholder="TikTok @username"
                          value={formData.social_tiktok}
                          onChange={(e) => setFormData({...formData, social_tiktok: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 font-bold text-center text-xs text-blue-500">BS</span>
                        <Input
                          placeholder="Bluesky @handle.bsky.social"
                          value={formData.social_bluesky}
                          onChange={(e) => setFormData({...formData, social_bluesky: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button 
                      onClick={() => setStep(3)}
                      disabled={!formData.complainant_name || !formData.complainant_email || !formData.complainant_state}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Complaint Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <FileText className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Your Experience</h2>
                    <p className="text-gray-600">Tell us what happened</p>
                  </div>

                  {/* Star Rating */}
                  <div className="text-center bg-gray-50 p-6 rounded-lg">
                    <label className="block text-sm font-medium mb-4">Rate Your Experience with {formData.company_name}</label>
                    <StarRating 
                      value={formData.star_rating} 
                      onChange={handleStarRating}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {formData.star_rating === 1 && "Terrible - Avoid at all costs"}
                      {formData.star_rating === 2 && "Poor - Major issues"}
                      {formData.star_rating === 3 && "Average - Some problems"}
                      {formData.star_rating === 4 && "Good - Minor issues"}
                      {formData.star_rating === 5 && "Excellent - No complaints"}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Service</label>
                      <Input
                        type="date"
                        value={formData.date_of_service}
                        onChange={(e) => setFormData({...formData, date_of_service: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount Paid ($)</label>
                      <Input
                        type="number"
                        value={formData.amount_paid}
                        onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">What issues did you experience? *</label>
                    <div className="flex flex-wrap gap-2">
                      {complaintTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleComplaintTypeToggle(type)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            formData.complaint_types.includes(type)
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tell your story *</label>
                    <Textarea
                      value={formData.complaint_details}
                      onChange={(e) => setFormData({...formData, complaint_details: e.target.value})}
                      rows={6}
                      placeholder="Describe your experience in detail. What happened? What did they promise vs. what they delivered? How did they respond to your concerns?"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.complaint_details.length} characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Who did you speak with?</label>
                    <Input
                      value={formData.person_spoke_to}
                      onChange={(e) => setFormData({...formData, person_spoke_to: e.target.value})}
                      placeholder="Name of representative (if known)"
                    />
                  </div>

                  <div className="bg-amber-50 p-6 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">What would make this right?</h4>
                    <p className="text-sm text-amber-600 mb-4">
                      When we reach out to the company, what resolution would you consider fair?
                    </p>
                    <Textarea
                      value={formData.fair_resolution}
                      onChange={(e) => setFormData({...formData, fair_resolution: e.target.value})}
                      rows={3}
                      placeholder="e.g., Full refund of $500, removal from their system, formal apology..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button 
                      onClick={() => setStep(4)}
                      disabled={formData.complaint_types.length === 0 || !formData.complaint_details}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Evidence & Video */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Video className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Evidence & Video Review</h2>
                    <p className="text-gray-600">Add supporting evidence and optional video review</p>
                  </div>

                  {/* Video Review Section */}
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video Review (Optional but Powerful)
                    </h4>
                    <p className="text-sm text-purple-600 mb-4">
                      Video reviews are more impactful and help other consumers see the real you.
                      Upload to YouTube, TikTok, or another platform and paste the link.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Video URL</label>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={formData.video_review_url}
                          onChange={(e) => setFormData({...formData, video_review_url: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Platform</label>
                        <select
                          value={formData.video_review_platform}
                          onChange={(e) => setFormData({...formData, video_review_platform: e.target.value})}
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

                  {/* Evidence Upload Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <h5 className="font-medium text-sm">Screenshots</h5>
                      <p className="text-xs text-gray-500">Emails, chats, contracts</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <h5 className="font-medium text-sm">Documents</h5>
                      <p className="text-xs text-gray-500">PDFs, receipts</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Mic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <h5 className="font-medium text-sm">Audio</h5>
                      <p className="text-xs text-gray-500">Recorded calls</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Evidence upload will be available after submission. Our team will contact you to collect supporting documents.
                  </p>

                  {/* Review Summary */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-bold mb-4">Review Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{formData.company_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Name (displayed):</span>
                        <span className="font-medium">
                          {formData.complainant_name.split(' ')[0]} {formData.complainant_name.split(' ').pop()?.[0]?.toUpperCase()}.
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{formData.complainant_city}, {formData.complainant_state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < formData.star_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issues:</span>
                        <span className="font-medium">{formData.complaint_types.join(', ')}</span>
                      </div>
                      {formData.amount_paid && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Lost:</span>
                          <span className="font-medium text-red-600">${parseFloat(formData.amount_paid).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loading ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default SubmitComplaint;
