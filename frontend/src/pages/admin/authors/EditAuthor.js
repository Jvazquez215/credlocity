import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from 'sonner';
import RichTextEditor from '../../../components/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

const EditAuthor = () => {
  const { authorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSEO, setShowSEO] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    slug: '',
    email: '',
    title: '',
    specialization: '',
    bio: '',
    short_bio: '',
    photo_url: '',
    photo_alt: '',
    credentials: [],
    years_experience: 0,
    education: [],
    publications: [],
    social_links: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    phone: '',
    office_location: '',
    display_order: 0,
    featured: false,
    show_on_team_page: true,
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: '',
    status: 'active'
  });

  const [originalSlug, setOriginalSlug] = useState('');
  const [credentialInput, setCredentialInput] = useState('');
  const [slugError, setSlugError] = useState('');
  const [postCount, setPostCount] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  
  // Education form state
  const [educationForm, setEducationForm] = useState({ degree: '', institution: '', year: '' });
  const [showEducationForm, setShowEducationForm] = useState(false);
  
  // Publication form state
  const [publicationForm, setPublicationForm] = useState({ title: '', publication: '', url: '', date: '' });
  const [showPublicationForm, setShowPublicationForm] = useState(false);

  useEffect(() => {
    fetchAuthor();
  }, [authorId]);

  const fetchAuthor = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/authors/${authorId}`);
      const author = response.data;
      
      setFormData({
        full_name: author.full_name || '',
        slug: author.slug || '',
        email: author.email || '',
        title: author.title || '',
        specialization: author.specialization || '',
        bio: author.bio || '',
        short_bio: author.short_bio || '',
        photo_url: author.photo_url || '',
        photo_alt: author.photo_alt || '',
        credentials: author.credentials || [],
        years_experience: author.years_experience || 0,
        social_links: author.social_links || {
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: ''
        },
        phone: author.phone || '',
        office_location: author.office_location || '',
        display_order: author.display_order || 0,
        featured: author.featured || false,
        show_on_team_page: author.show_on_team_page !== undefined ? author.show_on_team_page : true,
        seo_meta_title: author.seo_meta_title || '',
        seo_meta_description: author.seo_meta_description || '',
        seo_keywords: author.seo_keywords || '',
        status: author.status || 'active',
        education: author.education || [],
        publications: author.publications || []
      });
      
      setOriginalSlug(author.slug);
      setPostCount(author.post_count || 0);
    } catch (error) {
      console.error('Error fetching author:', error);
      toast.error('Failed to load author');
      navigate('/admin/authors');
    } finally {
      setFetching(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Fetch media files when modal opens
  useEffect(() => {
    if (showMediaLibrary) {
      fetchMediaFiles();
    }
  }, [showMediaLibrary]);

  const fetchMediaFiles = async () => {
    try {
      const response = await api.get('/media?file_type=image');
      setMediaFiles(response.data);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      toast.error('Failed to load media library');
    }
  };

  const handleMediaSelect = (mediaUrl) => {
    setFormData({ ...formData, photo_url: mediaUrl });
    setShowMediaLibrary(false);
    toast.success('Photo selected successfully');
  };

  const handleSlugChange = (e) => {
    const slug = e.target.value;
    setFormData({ ...formData, slug });
    setSlugError('');
  };

  const checkSlugUniqueness = async (slug) => {
    if (!slug || slug === originalSlug) return true;
    
    try {
      const response = await api.get('/authors');
      const exists = response.data.some((author) => author.slug === slug && author.id !== authorId);
      if (exists) {
        setSlugError('This slug is already taken');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking slug:', error);
      return true;
    }
  };

  const handleAddCredential = () => {
    if (credentialInput.trim()) {
      setFormData({
        ...formData,
        credentials: [...formData.credentials, credentialInput.trim()]
      });
      setCredentialInput('');
    }
  };

  const handleRemoveCredential = (index) => {
    setFormData({
      ...formData,
      credentials: formData.credentials.filter((_, i) => i !== index)
    });
  };

  const handleAddEducation = () => {
    if (!educationForm.degree.trim() || !educationForm.institution.trim()) {
      toast.error('Degree and institution are required');
      return;
    }
    setFormData({
      ...formData,
      education: [...formData.education, educationForm]
    });
    setEducationForm({ degree: '', institution: '', year: '' });
    setShowEducationForm(false);
  };

  const handleRemoveEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const handleAddPublication = () => {
    if (!publicationForm.title.trim() || !publicationForm.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    setFormData({
      ...formData,
      publications: [...formData.publications, publicationForm]
    });
    setPublicationForm({ title: '', publication: '', url: '', date: '' });
    setShowPublicationForm(false);
  };

  const handleRemovePublication = (index) => {
    setFormData({
      ...formData,
      publications: formData.publications.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error('URL slug is required');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.bio.trim()) {
      toast.error('Biography is required');
      return;
    }
    
    // Photo is now optional - removed validation

    // Check slug uniqueness
    const isUnique = await checkSlugUniqueness(formData.slug);
    if (!isUnique) {
      return;
    }

    try {
      setLoading(true);
      await api.put(`/authors/${authorId}`, formData);
      toast.success('Author updated successfully!');
      navigate('/admin/authors');
    } catch (error) {
      console.error('Error updating author:', error);
      toast.error(error.response?.data?.detail || 'Failed to update author');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading author...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/authors"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-cinzel font-bold text-gray-900">Edit Team Member</h1>
          <p className="text-gray-600 mt-1">Update {formData.full_name}'s profile</p>
        </div>
        {postCount > 0 && (
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{postCount}</strong> blog post{postCount !== 1 ? 's' : ''} by this author
            </p>
          </div>
        )}
      </div>

      {/* Form - Same as CreateAuthor but with pre-populated data */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="John Smith"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                onBlur={() => checkSlugUniqueness(formData.slug)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                  slugError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john-smith"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Preview: credlocity.com/team/<strong>{formData.slug || 'author-name'}</strong>
              </p>
              {slugError && <p className="text-sm text-red-500 mt-1">{slugError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="john@credlocity.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="CEO, Credit Specialist, Senior Consultant"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="FCRA Compliance, Credit Building, Mortgage Consultation"
              />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Photo</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="https://example.com/photo.jpg"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Media Library
                </button>
              </div>
            </div>

            {formData.photo_url && (
              <div>
                <img
                  src={formData.photo_url}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Alt Text (Optional)
              </label>
              <input
                type="text"
                value={formData.photo_alt}
                onChange={(e) => setFormData({ ...formData, photo_alt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="John Smith, CEO"
              />
              <p className="text-sm text-gray-500 mt-1">Describe the photo for accessibility (recommended)</p>
            </div>
          </div>
        </div>

        {/* Biography */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Biography</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Bio <span className="text-gray-500">(150-300 characters)</span>
              </label>
              <textarea
                value={formData.short_bio}
                onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                rows={3}
                maxLength={300}
                placeholder="Brief summary for author cards..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.short_bio.length}/300 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Biography <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                content={formData.bio}
                onChange={(html) => setFormData({ ...formData, bio: html })}
                placeholder="Write a comprehensive biography..."
              />
            </div>
          </div>
        </div>

        {/* Credentials & Experience */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Credentials & Experience</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credentials
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCredential())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="e.g., Certified Credit Consultant"
                />
                <button
                  type="button"
                  onClick={handleAddCredential}
                  className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              {formData.credentials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.credentials.map((credential, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                    >
                      <span className="text-sm">{credential}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCredential(index)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                min="0"
                max="50"
              />
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Education (for Schema.org)
                </label>
                <button
                  type="button"
                  onClick={() => setShowEducationForm(!showEducationForm)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>

              {showEducationForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Degree (e.g., MBA in Finance)"
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Institution (e.g., Harvard Business School)"
                    value={educationForm.institution}
                    onChange={(e) => setEducationForm({...educationForm, institution: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Year (e.g., 2015)"
                    value={educationForm.year}
                    onChange={(e) => setEducationForm({...educationForm, year: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEducationForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {formData.education && formData.education.length > 0 && (
                <div className="space-y-2">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution} {edu.year && `(${edu.year})`}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publications / Media Features */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Publications & Media Features (for Schema.org & E-E-A-T)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPublicationForm(!showPublicationForm)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Publication
                </button>
              </div>

              {showPublicationForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Title (e.g., Featured in Forbes)"
                    value={publicationForm.title}
                    onChange={(e) => setPublicationForm({...publicationForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Publication (e.g., Forbes, Wall Street Journal)"
                    value={publicationForm.publication}
                    onChange={(e) => setPublicationForm({...publicationForm, publication: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="URL (e.g., https://forbes.com/article-link)"
                    value={publicationForm.url}
                    onChange={(e) => setPublicationForm({...publicationForm, url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={publicationForm.date}
                    onChange={(e) => setPublicationForm({...publicationForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddPublication}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPublicationForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {formData.publications && formData.publications.length > 0 && (
                <div className="space-y-2">
                  {formData.publications.map((pub, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{pub.title}</p>
                        <p className="text-sm text-gray-600">{pub.publication} {pub.date && `(${pub.date})`}</p>
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">
                          {pub.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePublication(index)}
                        className="text-red-600 hover:text-red-700 ml-3"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={formData.social_links.linkedin}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, linkedin: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
              <input
                type="url"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, twitter: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                value={formData.social_links.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, facebook: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="https://facebook.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, instagram: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
              <input
                type="text"
                value={formData.office_location}
                onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Philadelphia Office, Remote, etc."
              />
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Display Options</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first on the team page</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Featured (show on homepage)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="show_on_team_page"
                checked={formData.show_on_team_page}
                onChange={(e) => setFormData({ ...formData, show_on_team_page: e.target.checked })}
                className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
              />
              <label htmlFor="show_on_team_page" className="text-sm font-medium text-gray-700">
                Show on team directory page
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSEO(!showSEO)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="font-bold text-gray-900">🔍 SEO Settings</span>
            <span className="text-gray-500">{showSEO ? '▼' : '▶'}</span>
          </button>

          {showSEO && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.seo_meta_title}
                  onChange={(e) => setFormData({ ...formData, seo_meta_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  maxLength={60}
                  placeholder="John Smith - Credit Repair Expert | Credlocity"
                />
                <p className="text-sm text-gray-500 mt-1">{formData.seo_meta_title.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.seo_meta_description}
                  onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  rows={3}
                  maxLength={160}
                  placeholder="Meet John Smith, expert credit consultant..."
                />
                <p className="text-sm text-gray-500 mt-1">{formData.seo_meta_description.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keywords</label>
                <input
                  type="text"
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="credit consultant, credit repair expert"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Link
            to="/admin/authors"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || slugError}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Author'}
          </button>
        </div>
      </form>

      {/* Media Library Modal */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Photo from Media Library</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            {mediaFiles.length === 0 ? (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No images found in media library. Please upload images through the Media Library page first.
              </div>
            ) : (
              mediaFiles.map((media) => (
                <div
                  key={media.id}
                  onClick={() => handleMediaSelect(media.url)}
                  className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary-blue transition"
                >
                  <img
                    src={media.url}
                    alt={media.alt_text || 'Media file'}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs text-gray-600 truncate">{media.filename}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <p>💡 Tip: You can upload new images from the <Link to="/admin/media" className="text-primary-blue hover:underline">Media Library</Link> page.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditAuthor;
