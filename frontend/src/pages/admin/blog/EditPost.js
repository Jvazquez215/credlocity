import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import RichTextEditor from '../../../components/RichTextEditor';
import UpdateModal from '../../../components/UpdateModal';
import DisclosureManager from '../../../components/DisclosureManager';
import SchemaManager from '../../../components/SchemaManager';
import RelatedContentManager from '../../../components/RelatedContentManager';
import ImageUpload from '../../../components/ui/ImageUpload';
import { AlertTriangle, Plus, AlertCircle, X, FileText, Code, Image } from 'lucide-react';

const EditPost = () => {
  console.log('EditPost component rendered');
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [lawsuits, setLawsuits] = useState([]);
  const [showSEO, setShowSEO] = useState(false);
  const [showPublishing, setShowPublishing] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateType, setUpdateType] = useState('update');
  const [updates, setUpdates] = useState([]);
  const [showDisclosures, setShowDisclosures] = useState(false);
  const [showSchemas, setShowSchemas] = useState(false);
  const [showRelatedContent, setShowRelatedContent] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    categories: [],
    tags: [],
    author_name: 'Credlocity Team',
    author_id: null,
    featured_image_url: '',
    featured_image_alt: '',
    seo: {
      meta_title: '',
      meta_description: '',
      keywords: '',
      canonical_url: '',
      robots: 'index, follow',
      schema_type: 'BlogPosting',
      og_title: '',
      og_description: '',
      og_image: ''
    },
    status: 'draft',
    publish_date: null,
    scheduled_publish: null,
    featured_post: false,
    allow_comments: true,
    is_news: false,
    related_posts: [],
    related_topics: [],
    related_pages: [],
    related_press_releases: [],
    related_lawsuits: [],
    disclosures: {},
    schemas: {}
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchPost();
    fetchCategories();
    fetchAuthors();
    fetchPressReleases();
    fetchLawsuits();
  }, [postId]);

  const fetchPressReleases = async () => {
    try {
      const response = await api.get('/admin/press-releases');
      setPressReleases(response.data || []);
    } catch (err) {
      console.error('Error fetching press releases:', err);
    }
  };

  const fetchLawsuits = async () => {
    try {
      const response = await api.get('/admin/lawsuits');
      setLawsuits(response.data || []);
    } catch (err) {
      console.error('Error fetching lawsuits:', err);
    }
  };

  // Check if slug changed on published post
  useEffect(() => {
    if (formData.slug && originalSlug && formData.slug !== originalSlug && formData.status === 'published') {
      setShowSlugWarning(true);
    } else {
      setShowSlugWarning(false);
    }
  }, [formData.slug, originalSlug, formData.status]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/blog/posts/${postId}`);
      const post = response.data;
      
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        categories: post.categories || [],
        tags: post.tags || [],
        author_name: post.author_name || 'Credlocity Team',
        author_id: post.author_id || null,
        featured_image_url: post.featured_image_url || '',
        featured_image_alt: post.featured_image_alt || '',
        seo: post.seo || {
          meta_title: '',
          meta_description: '',
          keywords: '',
          canonical_url: '',
          robots: 'index, follow',
          schema_type: 'BlogPosting',
          og_title: '',
          og_description: '',
          og_image: ''
        },
        status: post.status || 'draft',
        publish_date: post.publish_date || null,
        scheduled_publish: post.scheduled_publish || null,
        featured_post: post.featured_post || false,
        allow_comments: post.allow_comments !== false,
        is_news: post.is_news || false,
        related_posts: post.related_posts || [],
        related_topics: post.related_topics || [],
        related_pages: post.related_pages || [],
        related_press_releases: post.related_press_releases || [],
        related_lawsuits: post.related_lawsuits || [],
        disclosures: post.disclosures || {},
        schemas: post.schemas || {}
      });
      
      setOriginalSlug(post.slug);
      setUpdates(post.updates || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to load blog post');
      navigate('/admin/blog');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await api.get('/authors?status=active');
      setAuthors(response.data);
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSEOChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddUpdate = (updateType) => {
    setUpdateType(updateType);
    setShowUpdateModal(true);
  };

  const handleSaveUpdate = async (updateData) => {
    try {
      const response = await api.post(`/blog/posts/${postId}/updates`, updateData);
      setUpdates(prev => [...prev, response.data.update]);
      alert('Update added successfully! Update will appear on the front-end of the blog post.');
    } catch (err) {
      console.error('Error adding update:', err);
      alert('Failed to add update');
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) {
      return;
    }
    
    try {
      await api.delete(`/blog/posts/${postId}/updates/${updateId}`);
      setUpdates(prev => prev.filter(u => u.id !== updateId));
      alert('Update deleted successfully');
    } catch (err) {
      console.error('Error deleting update:', err);
      alert('Failed to delete update');
    }
  };

  const handleDisclosureChange = (disclosures) => {
    setFormData(prev => ({
      ...prev,
      disclosures
    }));
  };

  const handleSchemaChange = (schemas) => {
    setFormData(prev => ({
      ...prev,
      schemas
    }));
  };

  const handleRelatedContentChange = (relatedData) => {
    setFormData(prev => ({
      ...prev,
      related_posts: relatedData.related_posts,
      related_topics: relatedData.related_topics,
      related_pages: relatedData.related_pages
    }));
  };

  const handleSubmit = async () => {
    // Slug warning confirmation
    if (showSlugWarning) {
      const confirmed = window.confirm(
        `⚠️ WARNING: URL CHANGE DETECTED\n\n` +
        `This post is currently published and may be ranked in search engines.\n\n` +
        `Old URL: /blog/${originalSlug}\n` +
        `New URL: /blog/${formData.slug}\n\n` +
        `Changing the URL will:\n` +
        `• Break existing backlinks\n` +
        `• Lose search engine rankings\n` +
        `• Affect analytics tracking\n\n` +
        `Are you sure you want to proceed?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a URL slug');
      return;
    }
    if (!formData.content.trim()) {
      alert('Please enter content');
      return;
    }

    try {
      setSaving(true);
      
      await api.put(`/blog/posts/${postId}`, formData);
      
      alert('Blog post updated successfully!');
      navigate('/admin/blog');
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.detail || 'Failed to update blog post. Please check if the slug is unique.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Loading blog post...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">Edit Blog Post</h1>
            <p className="text-gray-600">Update your blog content</p>
          </div>
          <button
            onClick={() => navigate('/admin/blog')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Blog List
          </button>
        </div>
      </div>

      {/* Slug Warning Banner */}
      {showSlugWarning && (
        <div className="mb-6 bg-red-50 border-2 border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">⚠️ WARNING: URL CHANGE DETECTED</h3>
              <p className="text-sm text-red-800 mb-2">
                This post is currently <strong>published</strong> and may be ranked in search engines.
              </p>
              <div className="text-sm text-red-800 space-y-1">
                <p><strong>Old URL:</strong> /blog/{originalSlug}</p>
                <p><strong>New URL:</strong> /blog/{formData.slug}</p>
              </div>
              <div className="mt-3 text-sm text-red-800">
                <p className="font-semibold mb-1">Changing the URL will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Break existing backlinks</li>
                  <li>Lose search engine rankings</li>
                  <li>Affect analytics tracking</li>
                </ul>
              </div>
              <div className="mt-3 p-2 bg-red-100 rounded">
                <p className="text-xs text-red-900">
                  <strong>💡 Recommendation:</strong> Set up a 301 redirect from the old URL to the new URL, or keep the original slug to preserve SEO.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Same form fields as CreatePost.js */}
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* URL Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">credlocity.com/blog/</span>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                showSlugWarning ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {showSlugWarning && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              ⚠️ Changing this slug on a published post will hurt SEO. See warning above.
            </p>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt (Summary)
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Short summary"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.excerpt.length} characters
          </p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Type tag and press Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-600">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="inline w-4 h-4 mr-2" />
            Featured Image
          </label>
          <ImageUpload
            value={formData.featured_image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
            label="Upload or enter image URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image Alt Text</label>
          <input
            type="text"
            name="featured_image_alt"
            value={formData.featured_image_alt}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SEO Section - Same as CreatePost */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowSEO(!showSEO)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">🔍 SEO Settings</span>
            <span className="text-lg">{showSEO ? '▼' : '▶'}</span>
          </button>

          {showSEO && (
            <div className="p-4 space-y-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title ({formData.seo.meta_title.length}/60)
                </label>
                <input
                  type="text"
                  value={formData.seo.meta_title}
                  onChange={(e) => handleSEOChange('meta_title', e.target.value)}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description ({formData.seo.meta_description.length}/160)
                </label>
                <textarea
                  value={formData.seo.meta_description}
                  onChange={(e) => handleSEOChange('meta_description', e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input
                  type="text"
                  value={formData.seo.keywords}
                  onChange={(e) => handleSEOChange('keywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Robots</label>
                  <select
                    value={formData.seo.robots}
                    onChange={(e) => handleSEOChange('robots', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="index, follow">Index, Follow</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schema</label>
                  <select
                    value={formData.seo.schema_type}
                    onChange={(e) => handleSEOChange('schema_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="BlogPosting">Blog Posting</option>
                    <option value="Article">Article</option>
                    <option value="HowTo">How-To</option>
                    <option value="FAQPage">FAQ</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publishing Options */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowPublishing(!showPublishing)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">⚙️ Publishing Options</span>
            <span className="text-lg">{showPublishing ? '▼' : '▶'}</span>
          </button>

          {showPublishing && (
            <div className="p-4 space-y-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <select
                  name="author_id"
                  value={formData.author_id || ''}
                  onChange={(e) => {
                    const selectedAuthor = authors.find(a => a.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      author_id: e.target.value,
                      author_name: selectedAuthor ? selectedAuthor.full_name : '',
                      author_slug: selectedAuthor ? selectedAuthor.slug : '',
                      author_photo_url: selectedAuthor ? selectedAuthor.photo_url : '',
                      author_title: selectedAuthor ? selectedAuthor.title : '',
                      author_credentials: selectedAuthor ? selectedAuthor.credentials : [],
                      author_experience: selectedAuthor ? selectedAuthor.years_experience : 0,
                      author_education: selectedAuthor ? selectedAuthor.education || [] : [],
                      author_publications: selectedAuthor ? selectedAuthor.publications || [] : [],
                      author_bio: selectedAuthor ? selectedAuthor.bio : ''
                    }));
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an author</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.full_name} - {author.title}
                    </option>
                  ))}
                </select>
                {!formData.author_id && (
                  <p className="text-sm text-red-500 mt-1">Please select an author</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured_post"
                  checked={formData.featured_post}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">⭐ Featured Post</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="allow_comments"
                  checked={formData.allow_comments}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">💬 Allow Comments</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_news"
                  checked={formData.is_news}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">📰 Mark as News (RSS & News Sitemap)</label>
              </div>
            </div>
          )}
        </div>

        {/* Disclosures Section */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowDisclosures(!showDisclosures)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-700" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Disclosure Management</h3>
                <p className="text-sm text-gray-600">YMYL, Competitor, Pseudonym & More</p>
              </div>
            </div>
            <span className="text-gray-500">{showDisclosures ? '▼' : '▶'}</span>
          </button>
          
          {showDisclosures && (
            <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white">
              <DisclosureManager
                disclosures={formData.disclosures}
                onChange={handleDisclosureChange}
              />
            </div>
          )}
        </div>

        {/* Schema Management Section */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowSchemas(!showSchemas)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-gray-700" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Schema.org Structured Data</h3>
                <p className="text-sm text-gray-600">SEO - Article, Author, FAQ & Custom Schemas</p>
              </div>
            </div>
            <span className="text-gray-500">{showSchemas ? '▼' : '▶'}</span>
          </button>
          
          {showSchemas && (
            <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white">
              <SchemaManager
                schemas={formData.schemas}
                onChange={handleSchemaChange}
                postId={postId}
              />
            </div>
          )}
        </div>

        {/* Related Content & Interlinking Section */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowRelatedContent(!showRelatedContent)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-gray-700" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Related Content & Interlinking</h3>
                <p className="text-sm text-gray-600">Link to blogs, topics & pages</p>
              </div>
            </div>
            <span className="text-gray-500">{showRelatedContent ? '▼' : '▶'}</span>
          </button>
          
          {showRelatedContent && (
            <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white space-y-6">
              <RelatedContentManager
                relatedData={{
                  related_posts: formData.related_posts,
                  related_topics: formData.related_topics,
                  related_pages: formData.related_pages
                }}
                onChange={handleRelatedContentChange}
                currentPostId={postId}
              />

              {/* Press Releases Selector */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📰 Related Press Releases
                </label>
                {pressReleases.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    No press releases available. <a href="/admin/press-releases/new" className="text-blue-600 hover:underline">Create one here</a>
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {pressReleases.map(pr => (
                      <div key={pr.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`pr-${pr.id}`}
                          checked={(formData.related_press_releases || []).includes(pr.id)}
                          onChange={() => {
                            const current = formData.related_press_releases || [];
                            const isSelected = current.includes(pr.id);
                            setFormData({
                              ...formData,
                              related_press_releases: isSelected
                                ? current.filter(id => id !== pr.id)
                                : [...current, pr.id]
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <label htmlFor={`pr-${pr.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                          <div className="font-medium">{pr.title}</div>
                          <div className="text-gray-500 text-xs">{new Date(pr.publish_date).toLocaleDateString()}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Selected press releases will display in a related content box on this blog post.
                </p>
              </div>

              {/* Lawsuits Selector */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚖️ Related Lawsuits Filed
                </label>
                {lawsuits.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    No lawsuits available. <a href="/admin/lawsuits/new" className="text-blue-600 hover:underline">Create one here</a>
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {lawsuits.map(lawsuit => (
                      <div key={lawsuit.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`lawsuit-${lawsuit.id}`}
                          checked={(formData.related_lawsuits || []).includes(lawsuit.id)}
                          onChange={() => {
                            const current = formData.related_lawsuits || [];
                            const isSelected = current.includes(lawsuit.id);
                            setFormData({
                              ...formData,
                              related_lawsuits: isSelected
                                ? current.filter(id => id !== lawsuit.id)
                                : [...current, lawsuit.id]
                            });
                          }}
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
                <p className="text-sm text-gray-500 mt-2">
                  Selected lawsuits will display in a related content box on this blog post.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Updates & Corrections Section */}
        <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Updates & Corrections</h3>
              <p className="text-sm text-gray-600">Add updates or corrections that will be displayed to readers on the front-end</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAddUpdate('update')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Update
              </button>
              <button
                type="button"
                onClick={() => handleAddUpdate('critical_update')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                Critical Update
              </button>
            </div>
          </div>

          {/* List of Updates */}
          {updates.length > 0 ? (
            <div className="space-y-3">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className={`p-4 rounded-lg border ${
                    update.type === 'critical_update' 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          update.type === 'critical_update'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {update.type === 'critical_update' ? 'Critical Update' : 'Update'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(update.date).toLocaleString()}
                        </span>
                        {update.highlight_enabled && (
                          <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                            Highlighted
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{update.explanation}</p>
                      {update.content && (
                        <p className="text-sm text-gray-600">{update.content}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">By {update.author}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUpdate(update.id)}
                      className="ml-4 text-gray-400 hover:text-red-600 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No updates added yet. Click "Update" or "Critical Update" to add one.</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Post'}
          </button>
        </div>
      </div>

      {/* Update Modal */}
      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSave={handleSaveUpdate}
        updateType={updateType}
      />
    </div>
  );
};

export default EditPost;
