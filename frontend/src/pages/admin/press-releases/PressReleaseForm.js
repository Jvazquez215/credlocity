import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Save, ArrowLeft, X, Newspaper, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import ImageUpload from '../../../components/ui/ImageUpload';
import SchemaSelector from '../../../components/ui/SchemaSelector';

const PressReleaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contentType = searchParams.get('type') || 'press_release';
  const isEditing = !!id && id !== 'new';
  const isAnnouncement = contentType === 'announcement';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    publish_date: new Date().toISOString().split('T')[0],
    is_published: true,
    featured_image: '',
    announcement_type: 'general',
    related_employees: [],
    related_lawsuits: [],
    related_press_releases: [],
    related_blog_posts: [],
    // SEO Fields
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    schema_types: [], // Array of selected schema types
    schema_data: {}
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [lawsuits, setLawsuits] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [keywordInput, setKeywordInput] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  const announcementTypes = [
    { value: 'general', label: 'General Announcement' },
    { value: 'promotion', label: 'Promotion / Award' },
    { value: 'acquisition', label: 'Acquisition' },
    { value: 'product', label: 'New Product' },
    { value: 'service', label: 'New Service' },
    { value: 'partnership', label: 'Partnership' }
  ];

  useEffect(() => {
    fetchRelatedData();
    if (isEditing) {
      fetchContent();
    }
  }, [id, contentType]);

  const fetchRelatedData = async () => {
    try {
      const [lawsuitsRes, teamRes, prRes] = await Promise.all([
        api.get('/admin/lawsuits').catch(() => ({ data: [] })),
        api.get('/admin/team-members').catch(() => api.get('/authors').catch(() => ({ data: [] }))),
        api.get('/admin/press-releases').catch(() => ({ data: [] }))
      ]);
      setLawsuits(lawsuitsRes.data || []);
      setTeamMembers(teamRes.data || []);
      setPressReleases(prRes.data || []);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchContent = async () => {
    try {
      const endpoint = isAnnouncement 
        ? `/admin/announcements/${id}`
        : `/admin/press-releases/${id}`;
      const response = await api.get(endpoint);
      const data = response.data;
      setFormData({
        ...formData,
        ...data,
        publish_date: new Date(data.publish_date).toISOString().split('T')[0],
        meta_keywords: data.meta_keywords || [],
        schema_types: data.schema_types || [],
        related_employees: data.related_employees || [],
        related_lawsuits: data.related_lawsuits || [],
        related_press_releases: data.related_press_releases || [],
        related_blog_posts: data.related_blog_posts || []
      });
    } catch (error) {
      toast.error(`Failed to fetch ${isAnnouncement ? 'announcement' : 'press release'}`);
      console.error(error);
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
        publish_date: new Date(formData.publish_date).toISOString()
      };

      if (isAnnouncement) {
        if (isEditing) {
          await api.put(`/admin/announcements/${id}`, dataToSend);
          toast.success('Announcement updated successfully');
        } else {
          await api.post('/admin/announcements', dataToSend);
          toast.success('Announcement created successfully');
        }
      } else {
        if (isEditing) {
          await api.put(`/admin/press-releases/${id}`, dataToSend);
          toast.success('Press release updated successfully');
        } else {
          await api.post('/admin/press-releases', dataToSend);
          toast.success('Press release created successfully');
        }
      }
      navigate('/admin/press-releases');
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} ${isAnnouncement ? 'announcement' : 'press release'}`);
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

  const handleArrayToggle = (field, itemId) => {
    const currentItems = formData[field] || [];
    const isSelected = currentItems.includes(itemId);
    
    setFormData({
      ...formData,
      [field]: isSelected
        ? currentItems.filter(id => id !== itemId)
        : [...currentItems, itemId]
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.meta_keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        meta_keywords: [...formData.meta_keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      meta_keywords: formData.meta_keywords.filter(k => k !== keyword)
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/press-releases')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Press Releases & Announcements
        </button>
        <div className="flex items-center gap-3">
          {isAnnouncement ? (
            <div className="p-2 bg-purple-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-purple-600" />
            </div>
          ) : (
            <div className="p-2 bg-blue-100 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-600" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? 'Edit' : 'Create New'} {isAnnouncement ? 'Announcement' : 'Press Release'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="relations">Related Content</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="title-input"
              />
            </div>

            {/* Announcement Type (only for announcements) */}
            {isAnnouncement && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="announcement_type"
                  value={formData.announcement_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="announcement-type-select"
                >
                  {announcementTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="publish_date"
                value={formData.publish_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="2"
                placeholder="Brief summary for list view and SEO"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                placeholder={`Full ${isAnnouncement ? 'announcement' : 'press release'} content (HTML supported)`}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">HTML is supported for rich formatting</p>
            </div>

            {/* Featured Image Upload */}
            <ImageUpload
              value={formData.featured_image}
              onChange={(url) => setFormData({ ...formData, featured_image: url })}
              label="Featured Image"
            />

            {/* Published Status */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Published (show on website)
                </span>
              </label>
            </div>
          </TabsContent>

          {/* Relations Tab */}
          <TabsContent value="relations" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Related Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Team Members
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Link this {isAnnouncement ? 'announcement' : 'press release'} to team members. 
                It will appear on their profile page.
              </p>
              {loadingRelated ? (
                <div className="text-sm text-gray-500 py-2">Loading team members...</div>
              ) : teamMembers.length === 0 ? (
                <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  No team members available.
                </div>
              ) : (
                <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`member-${member.id}`}
                        checked={(formData.related_employees || []).includes(member.id)}
                        onChange={() => handleArrayToggle('related_employees', member.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <label htmlFor={`member-${member.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                        <div className="font-medium">{member.full_name || member.name}</div>
                        <div className="text-gray-500 text-xs">{member.title || member.role}</div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Lawsuits (for press releases) */}
            {!isAnnouncement && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Lawsuits
                </label>
                {loadingRelated ? (
                  <div className="text-sm text-gray-500 py-2">Loading lawsuits...</div>
                ) : lawsuits.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    No lawsuits available.
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {lawsuits.map(lawsuit => (
                      <div key={lawsuit.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`lawsuit-${lawsuit.id}`}
                          checked={(formData.related_lawsuits || []).includes(lawsuit.id)}
                          onChange={() => handleArrayToggle('related_lawsuits', lawsuit.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <label htmlFor={`lawsuit-${lawsuit.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                          <div className="font-medium">{lawsuit.title}</div>
                          <div className="text-gray-500 text-xs">Case #{lawsuit.case_number}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Related Press Releases (for announcements) */}
            {isAnnouncement && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Press Releases
                </label>
                {loadingRelated ? (
                  <div className="text-sm text-gray-500 py-2">Loading press releases...</div>
                ) : pressReleases.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    No press releases available.
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {pressReleases.map(pr => (
                      <div key={pr.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`pr-${pr.id}`}
                          checked={(formData.related_press_releases || []).includes(pr.id)}
                          onChange={() => handleArrayToggle('related_press_releases', pr.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <label htmlFor={`pr-${pr.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                          <div className="font-medium">{pr.title}</div>
                          <div className="text-gray-500 text-xs">
                            {new Date(pr.publish_date).toLocaleDateString()}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-1">SEO Settings</h4>
              <p className="text-sm text-blue-600">
                Optimize this page for search engines. Leave fields empty to auto-generate from content.
              </p>
            </div>

            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="Leave empty to auto-generate from title"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows="2"
                placeholder="Leave empty to auto-generate from excerpt"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Add a keyword"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  Add
                </Button>
              </div>
              {formData.meta_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.meta_keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {keyword}
                      <button 
                        type="button" 
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Open Graph Settings */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Open Graph (Social Sharing)</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    name="og_title"
                    value={formData.og_title}
                    onChange={handleChange}
                    placeholder="Leave empty to use meta title"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Description
                  </label>
                  <textarea
                    name="og_description"
                    value={formData.og_description}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Leave empty to use meta description"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <ImageUpload
                  value={formData.og_image}
                  onChange={(url) => setFormData({ ...formData, og_image: url })}
                  label="OG Image (for social sharing)"
                />
              </div>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                name="canonical_url"
                value={formData.canonical_url}
                onChange={handleChange}
                placeholder="Leave empty to auto-generate"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Use this if this content is duplicated elsewhere</p>
            </div>

            {/* Schema Selector */}
            <div className="border-t pt-6">
              <SchemaSelector
                value={formData.schema_types || []}
                onChange={(schemas) => setFormData({ ...formData, schema_types: schemas })}
                contentType={isAnnouncement ? 'announcement' : 'press_release'}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            type="submit"
            disabled={loading}
            className={isAnnouncement ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}
            data-testid="submit-btn"
          >
            <Save size={18} className="mr-2" />
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')} {isAnnouncement ? 'Announcement' : 'Press Release'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/press-releases')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PressReleaseForm;
