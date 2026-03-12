import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Save, ArrowLeft, Plus, X, Award, GraduationCap, Briefcase, Star, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import ImageUpload from '../../../components/ui/ImageUpload';
import SchemaSelector from '../../../components/ui/SchemaSelector';

const PartnerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    partner_type_id: '',
    tagline: '',
    photo_url: '',
    company_logo: '',
    cover_image: '',
    short_bio: '',
    full_bio: '',
    what_we_do: '',
    credentials: [],
    education: [],
    years_experience: '',
    specializations: [],
    awards: [],
    testimonials: [],
    video_testimonials: [],
    featured_review_ids: [],
    client_count: '',
    success_rate: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    social_links: { linkedin: '', twitter: '', facebook: '', instagram: '' },
    related_announcement_ids: [],
    related_press_release_ids: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    schema_types: [],
    is_published: true,
    is_featured: false,
    display_order: 0
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Temporary inputs
  const [credentialInput, setCredentialInput] = useState('');
  const [specializationInput, setSpecializationInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [educationForm, setEducationForm] = useState({ institution: '', degree: '', year: '' });
  const [awardForm, setAwardForm] = useState({ name: '', year: '', issuer: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', text: '', company: '' });
  const [videoTestimonialForm, setVideoTestimonialForm] = useState({ title: '', video_url: '', description: '' });

  useEffect(() => {
    fetchRelatedData();
    if (isEditing) {
      fetchPartner();
    }
  }, [id]);

  const fetchRelatedData = async () => {
    try {
      const [typesRes, annRes, prRes, reviewsRes] = await Promise.all([
        api.get('/admin/partner-types'),
        api.get('/admin/announcements').catch(() => ({ data: [] })),
        api.get('/admin/press-releases').catch(() => ({ data: [] })),
        api.get('/admin/reviews').catch(() => ({ data: [] }))
      ]);
      setPartnerTypes(typesRes.data);
      setAnnouncements(annRes.data);
      setPressReleases(prRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  const fetchPartner = async () => {
    try {
      const response = await api.get(`/admin/partners/${id}`);
      setFormData({ ...formData, ...response.data });
    } catch (error) {
      toast.error('Failed to fetch partner');
      navigate('/admin/partners');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        client_count: formData.client_count ? parseInt(formData.client_count) : null,
        display_order: parseInt(formData.display_order) || 0
      };

      if (isEditing) {
        await api.put(`/admin/partners/${id}`, dataToSend);
        toast.success('Partner updated successfully');
      } else {
        await api.post('/admin/partners', dataToSend);
        toast.success('Partner created successfully');
      }
      navigate('/admin/partners');
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} partner`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Array handlers
  const addToArray = (field, value, clear) => {
    if (value && !formData[field].includes(value)) {
      setFormData({ ...formData, [field]: [...formData[field], value] });
      clear('');
    }
  };

  const removeFromArray = (field, value) => {
    setFormData({ ...formData, [field]: formData[field].filter(v => v !== value) });
  };

  const addObjectToArray = (field, obj, clearFn) => {
    if (Object.values(obj).some(v => v)) {
      setFormData({ ...formData, [field]: [...formData[field], obj] });
      clearFn();
    }
  };

  const removeObjectFromArray = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handleArrayToggle = (field, itemId) => {
    const current = formData[field] || [];
    setFormData({
      ...formData,
      [field]: current.includes(itemId)
        ? current.filter(id => id !== itemId)
        : [...current, itemId]
    });
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/partners')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Partners
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? 'Edit Partner' : 'Add New Partner'}
        </h1>
        <p className="text-gray-600 mt-1">E-E-A-T optimized partner profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="social">Social Proof</TabsTrigger>
            <TabsTrigger value="links">Related Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Partner Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner Type <span className="text-red-500">*</span>
              </label>
              <select
                name="partner_type_id"
                value={formData.partner_type_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a type...</option>
                {partnerTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Name & Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="ABC Realty Group"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Helping families find their dream home since 2010"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Images */}
            <div className="grid md:grid-cols-3 gap-4">
              <ImageUpload
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                label="Profile Photo"
              />
              <ImageUpload
                value={formData.company_logo}
                onChange={(url) => setFormData({ ...formData, company_logo: url })}
                label="Company Logo"
              />
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                label="Cover/Banner Image"
              />
            </div>

            {/* Short Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Bio (for listing cards) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="short_bio"
                value={formData.short_bio}
                onChange={handleChange}
                rows="2"
                required
                placeholder="Brief 1-2 sentence description"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Full Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                name="full_bio"
                value={formData.full_bio}
                onChange={handleChange}
                rows="6"
                required
                placeholder="Detailed biography showcasing experience, expertise, and story"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* What We Do */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What We Do / Services</label>
              <textarea
                name="what_we_do"
                value={formData.what_we_do}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the services offered..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website URL"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-4 gap-4 mt-4">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="md:col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    placeholder="ZIP"
                    className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Social Media Links</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['linkedin', 'twitter', 'facebook', 'instagram'].map(platform => (
                  <input
                    key={platform}
                    type="url"
                    value={formData.social_links[platform] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, [platform]: e.target.value }
                    })}
                    placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            {/* Publishing Options */}
            <div className="border-t pt-6 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-yellow-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Featured Partner</span>
              </label>
            </div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-1">E-E-A-T: Expertise & Authoritativeness</h4>
              <p className="text-sm text-blue-600">
                Adding credentials, education, and awards builds trust with Google and visitors.
              </p>
            </div>

            {/* Years Experience */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleChange}
                  placeholder="15"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Success Rate</label>
                <input
                  type="text"
                  name="success_rate"
                  value={formData.success_rate}
                  onChange={handleChange}
                  placeholder="98% client satisfaction"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Credentials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                Credentials & Certifications
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  placeholder="e.g., Licensed Real Estate Broker"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={() => addToArray('credentials', credentialInput, setCredentialInput)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.credentials.map((cred, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {cred}
                    <button type="button" onClick={() => removeFromArray('credentials', cred)}><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase size={18} className="text-green-600" />
                Specializations
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  placeholder="e.g., First-time homebuyers"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={() => addToArray('specializations', specializationInput, setSpecializationInput)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {spec}
                    <button type="button" onClick={() => removeFromArray('specializations', spec)}><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap size={18} className="text-purple-600" />
                Education
              </label>
              <div className="grid md:grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  value={educationForm.institution}
                  onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                  placeholder="Institution"
                  className="md:col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  placeholder="Degree"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={educationForm.year}
                    onChange={(e) => setEducationForm({ ...educationForm, year: e.target.value })}
                    placeholder="Year"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="button" onClick={() => addObjectToArray('education', educationForm, () => setEducationForm({ institution: '', degree: '', year: '' }))}>
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
              {formData.education.map((edu, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg mb-2">
                  <div>
                    <span className="font-medium">{edu.degree}</span> - {edu.institution} ({edu.year})
                  </div>
                  <button type="button" onClick={() => removeObjectFromArray('education', i)} className="text-red-500 hover:text-red-700">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Awards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                Awards & Recognition
              </label>
              <div className="grid md:grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  value={awardForm.name}
                  onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })}
                  placeholder="Award name"
                  className="md:col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={awardForm.issuer}
                  onChange={(e) => setAwardForm({ ...awardForm, issuer: e.target.value })}
                  placeholder="Issuer"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={awardForm.year}
                    onChange={(e) => setAwardForm({ ...awardForm, year: e.target.value })}
                    placeholder="Year"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="button" onClick={() => addObjectToArray('awards', awardForm, () => setAwardForm({ name: '', year: '', issuer: '' }))}>
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
              {formData.awards.map((award, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-2">
                  <div>
                    <span className="font-medium">{award.name}</span> - {award.issuer} ({award.year})
                  </div>
                  <button type="button" onClick={() => removeObjectFromArray('awards', i)} className="text-red-500 hover:text-red-700">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Social Proof Tab */}
          <TabsContent value="social" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-1">E-E-A-T: Trustworthiness</h4>
              <p className="text-sm text-green-600">
                Social proof through testimonials and reviews builds trust and credibility.
              </p>
            </div>

            {/* Client Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clients Served</label>
                <input
                  type="number"
                  name="client_count"
                  value={formData.client_count}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Testimonials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Testimonials</label>
              <div className="grid md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  placeholder="Name"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={testimonialForm.company}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                  placeholder="Company (optional)"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={() => addObjectToArray('testimonials', testimonialForm, () => setTestimonialForm({ name: '', text: '', company: '' }))}>
                  Add Testimonial
                </Button>
              </div>
              <textarea
                value={testimonialForm.text}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                placeholder="Testimonial text..."
                rows="2"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
              />
              {formData.testimonials.map((test, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg mb-2 relative">
                  <button
                    type="button"
                    onClick={() => removeObjectFromArray('testimonials', i)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                  <p className="text-gray-700 italic">"{test.text}"</p>
                  <p className="text-sm text-gray-500 mt-2">— {test.name}{test.company ? `, ${test.company}` : ''}</p>
                </div>
              ))}
            </div>

            {/* Video Testimonials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Testimonials</label>
              <p className="text-xs text-gray-500 mb-3">Add video testimonials from partners (YouTube, Vimeo URLs or direct upload)</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={videoTestimonialForm.title}
                  onChange={(e) => setVideoTestimonialForm({ ...videoTestimonialForm, title: e.target.value })}
                  placeholder="Video title"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={videoTestimonialForm.video_url}
                  onChange={(e) => setVideoTestimonialForm({ ...videoTestimonialForm, video_url: e.target.value })}
                  placeholder="YouTube/Vimeo URL or video file URL"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={videoTestimonialForm.description}
                  onChange={(e) => setVideoTestimonialForm({ ...videoTestimonialForm, description: e.target.value })}
                  placeholder="Brief description (optional)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  type="button" 
                  onClick={() => addObjectToArray('video_testimonials', videoTestimonialForm, () => setVideoTestimonialForm({ title: '', video_url: '', description: '' }))}
                  disabled={!videoTestimonialForm.title || !videoTestimonialForm.video_url}
                >
                  Add Video
                </Button>
              </div>
              {formData.video_testimonials?.map((video, i) => (
                <div key={i} className="p-4 bg-blue-50 rounded-lg mb-2 relative flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => removeObjectFromArray('video_testimonials', i)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                  <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{video.title}</p>
                    {video.description && <p className="text-sm text-gray-600 mt-1">{video.description}</p>}
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      {video.video_url.substring(0, 50)}...
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Linked Reviews */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Existing Reviews</label>
              <p className="text-xs text-gray-500 mb-3">Select reviews to display on this partner's page</p>
              {reviews.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-lg">No reviews available</div>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {reviews.slice(0, 20).map(review => (
                    <label key={review.id} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.featured_review_ids.includes(review.id)}
                        onChange={() => handleArrayToggle('featured_review_ids', review.id)}
                        className="w-4 h-4 text-blue-600 rounded mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">{review.author_name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{review.content}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Related Content Tab */}
          <TabsContent value="links" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-indigo-800 mb-1 flex items-center gap-2">
                <LinkIcon size={18} />
                Content Interlinking
              </h4>
              <p className="text-sm text-indigo-600">
                Link related announcements and press releases to boost SEO and engagement.
              </p>
            </div>

            {/* Related Announcements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Announcements</label>
              {announcements.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-lg">No announcements available</div>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {announcements.map(ann => (
                    <label key={ann.id} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.related_announcement_ids.includes(ann.id)}
                        onChange={() => handleArrayToggle('related_announcement_ids', ann.id)}
                        className="w-4 h-4 text-purple-600 rounded mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">{ann.title}</div>
                        <div className="text-xs text-gray-500">{ann.announcement_type}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Related Press Releases */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Press Releases</label>
              {pressReleases.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-lg">No press releases available</div>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {pressReleases.map(pr => (
                    <label key={pr.id} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.related_press_release_ids.includes(pr.id)}
                        onChange={() => handleArrayToggle('related_press_release_ids', pr.id)}
                        className="w-4 h-4 text-blue-600 rounded mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">{pr.title}</div>
                        <div className="text-xs text-gray-500">{new Date(pr.publish_date).toLocaleDateString()}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-orange-800 mb-1">SEO Optimization</h4>
              <p className="text-sm text-orange-600">
                Optimize meta tags for better search visibility. Leave empty to auto-generate.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="Auto-generated: {Name} - {Company} | Credlocity Partner"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows="2"
                placeholder="Auto-generated from short bio"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('meta_keywords', keywordInput, setKeywordInput))}
                  placeholder="Add keyword"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={() => addToArray('meta_keywords', keywordInput, setKeywordInput)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.meta_keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {kw}
                    <button type="button" onClick={() => removeFromArray('meta_keywords', kw)}><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* OG Settings */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Open Graph (Social Sharing)</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  name="og_title"
                  value={formData.og_title}
                  onChange={handleChange}
                  placeholder="OG Title (leave empty to use meta title)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  name="og_description"
                  value={formData.og_description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="OG Description"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <ImageUpload
                  value={formData.og_image}
                  onChange={(url) => setFormData({ ...formData, og_image: url })}
                  label="OG Image"
                />
              </div>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
              <input
                type="url"
                name="canonical_url"
                value={formData.canonical_url}
                onChange={handleChange}
                placeholder="https://credlocity.com/partners/..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Schema Selector */}
            <div className="border-t pt-6">
              <SchemaSelector
                value={formData.schema_types}
                onChange={(schemas) => setFormData({ ...formData, schema_types: schemas })}
                contentType="partner"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <Save size={18} className="mr-2" />
            {loading ? 'Saving...' : (isEditing ? 'Update Partner' : 'Create Partner')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/partners')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PartnerForm;
