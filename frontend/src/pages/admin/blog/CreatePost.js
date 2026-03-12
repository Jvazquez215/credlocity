import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import RichTextEditor from '../../../components/RichTextEditor';
import DisclosureManager from '../../../components/DisclosureManager';
import SchemaManager from '../../../components/SchemaManager';
import RelatedContentManager from '../../../components/RelatedContentManager';
import ImageUpload from '../../../components/ui/ImageUpload';
import { FileText, Code, Image } from 'lucide-react';

const CreatePost = () => {
  console.log('CreatePost component rendered');
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [lawsuits, setLawsuits] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [showSEO, setShowSEO] = useState(false);
  const [showPublishing, setShowPublishing] = useState(false);
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
    co_author_id: null,
    co_author_name: '',
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
    related_blogs: [],
    related_topics: [],
    related_pages: [],
    related_press_releases: [],
    related_lawsuits: [],
    disclosures: {},
    schemas: {}
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    fetchPressReleases();
    fetchLawsuits();
    fetchAllBlogs();
  }, []);

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

  const fetchAllBlogs = async () => {
    try {
      const response = await api.get('/blog/posts');
      const posts = response.data?.posts || response.data || [];
      setAllBlogs(posts);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

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
      // Set default author if only one exists
      if (response.data.length === 1) {
        setFormData(prev => ({
          ...prev,
          author_id: response.data[0].id,
          author_name: response.data[0].full_name
        }));
      }
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

  const handleRelatedContentChange = (relatedData) => {
    setFormData(prev => ({
      ...prev,
      related_posts: relatedData.related_posts,
      related_topics: relatedData.related_topics,
      related_pages: relatedData.related_pages
    }));
  };

  const handleSubmit = async (status) => {
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
      
      const postData = {
        ...formData,
        status,
        publish_date: status === 'published' ? new Date().toISOString() : null
      };

      await api.post('/blog/posts', postData);
      
      alert(`Blog post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      navigate('/admin/blog');
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.detail || 'Failed to save blog post. Please check if the slug is unique.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">Create New Blog Post</h1>
            <p className="text-gray-600">Write and publish your blog content</p>
          </div>
          <button
            onClick={() => navigate('/admin/blog')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Blog List
          </button>
        </div>
      </div>

      <div className="space-y-6">
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
            placeholder="How to Improve Your Credit Score Fast"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="how-to-improve-credit-score-fast"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated from title. Edit if needed. Must be unique.
          </p>
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
            placeholder="Short summary that appears in blog listings (optional, will auto-generate from content if blank)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.excerpt.length} characters (recommended: 150-300)
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
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">No categories available. Create categories first.</p>
          )}
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
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
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
            placeholder="Descriptive alt text for accessibility and SEO"
          />
        </div>

        {/* SEO Section */}
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
              <p className="text-sm text-gray-600 mb-3">
                Optimize this blog post for search engines and social sharing.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title ({formData.seo.meta_title.length}/60 characters)
                </label>
                <input
                  type="text"
                  value={formData.seo.meta_title}
                  onChange={(e) => handleSEOChange('meta_title', e.target.value)}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., How to Improve Credit Score: 7 Proven Strategies (2025)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description ({formData.seo.meta_description.length}/160 characters)
                </label>
                <textarea
                  value={formData.seo.meta_description}
                  onChange={(e) => handleSEOChange('meta_description', e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for search results"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.seo.keywords}
                  onChange={(e) => handleSEOChange('keywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="credit score, credit repair, FICO"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Robots Meta
                  </label>
                  <select
                    value={formData.seo.robots}
                    onChange={(e) => handleSEOChange('robots', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="index, follow">Index, Follow (Default)</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schema Type
                  </label>
                  <select
                    value={formData.seo.schema_type}
                    onChange={(e) => handleSEOChange('schema_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BlogPosting">Blog Posting</option>
                    <option value="Article">Article</option>
                    <option value="HowTo">How-To Guide</option>
                    <option value="FAQPage">FAQ Page</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.seo.canonical_url}
                  onChange={(e) => handleSEOChange('canonical_url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://credlocity.com/blog/your-post-slug (leave blank to use default)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only set this if you want a different canonical URL (e.g., for syndicated content)
                </p>
              </div>

              {/* Open Graph (Social Media) Tags */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">📱 Open Graph / Social Media Tags</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Controls how your post appears when shared on Facebook, LinkedIn, Twitter, etc.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Title (defaults to meta title)
                    </label>
                    <input
                      type="text"
                      value={formData.seo.og_title}
                      onChange={(e) => handleSEOChange('og_title', e.target.value)}
                      maxLength={70}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.seo.meta_title || formData.title || "Leave blank to use meta title"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Description (defaults to meta description)
                    </label>
                    <textarea
                      value={formData.seo.og_description}
                      onChange={(e) => handleSEOChange('og_description', e.target.value)}
                      maxLength={200}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.seo.meta_description || formData.excerpt || "Leave blank to use meta description"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Image URL (defaults to featured image)
                    </label>
                    <input
                      type="url"
                      value={formData.seo.og_image}
                      onChange={(e) => handleSEOChange('og_image', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.featured_image_url || "https://example.com/image.jpg"}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended size: 1200x630px for best display on social media
                    </p>
                    {formData.seo.og_image && (
                      <img 
                        src={formData.seo.og_image} 
                        alt="OG preview" 
                        className="mt-2 h-24 rounded border border-gray-200"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">SEO Preview:</p>
                <div className="space-y-1">
                  <p className="text-blue-600 text-base font-medium line-clamp-1">
                    {formData.seo.meta_title || formData.title || 'Your Page Title'}
                  </p>
                  <p className="text-green-700 text-xs">
                    credlocity.com/blog/{formData.slug || 'your-post-slug'}
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {formData.seo.meta_description || formData.excerpt || 'Your meta description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disclosures Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowDisclosures(!showDisclosures)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-900">📋 Disclosure Management</span>
            </div>
            <span className="text-lg">{showDisclosures ? '▼' : '▶'}</span>
          </button>

          {showDisclosures && (
            <div className="p-4 bg-white">
              <DisclosureManager
                disclosures={formData.disclosures}
                onChange={(disclosures) => setFormData(prev => ({ ...prev, disclosures }))}
              />
            </div>
          )}
        </div>

        {/* Schema Management Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowSchemas(!showSchemas)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-900">📊 Schema.org Structured Data</span>
            </div>
            <span className="text-lg">{showSchemas ? '▼' : '▶'}</span>
          </button>

          {showSchemas && (
            <div className="p-4 bg-white">
              <SchemaManager
                schemas={formData.schemas}
                onChange={(schemas) => setFormData(prev => ({ ...prev, schemas }))}
              />
            </div>
          )}
        </div>

        {/* Related Content & Interlinking Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowRelatedContent(!showRelatedContent)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-gray-700" />
              <div className="text-left">
                <span className="font-medium text-gray-900">🔗 Related Content & Interlinking</span>
                <p className="text-xs text-gray-600">Link to blogs, topics & pages</p>
              </div>
            </div>
            <span className="text-lg">{showRelatedContent ? '▼' : '▶'}</span>
          </button>

          {showRelatedContent && (
            <div className="p-4 bg-white space-y-6">
              <RelatedContentManager
                relatedData={{
                  related_posts: formData.related_posts,
                  related_topics: formData.related_topics,
                  related_pages: formData.related_pages
                }}
                onChange={handleRelatedContentChange}
                currentPostId={null}
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

              {/* Related Blogs Selector */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Related Blog Posts
                </label>
                {allBlogs.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    No other blog posts available yet.
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {allBlogs.filter(blog => blog.id !== formData.id).map(blog => (
                      <div key={blog.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`blog-${blog.id}`}
                          checked={(formData.related_blogs || []).includes(blog.id)}
                          onChange={() => {
                            const current = formData.related_blogs || [];
                            const isSelected = current.includes(blog.id);
                            setFormData({
                              ...formData,
                              related_blogs: isSelected
                                ? current.filter(id => id !== blog.id)
                                : [...current, blog.id]
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <label htmlFor={`blog-${blog.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                          <div className="font-medium">{blog.title}</div>
                          <div className="text-gray-500 text-xs">
                            {blog.author_name} • {new Date(blog.created_at).toLocaleDateString()}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Selected blog posts will display as "Related Articles" on this post.
                </p>
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
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured_post"
                  checked={formData.featured_post}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  ⭐ Featured Post (displays prominently on blog page)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="allow_comments"
                  checked={formData.allow_comments}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  💬 Allow Comments
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_news"
                  checked={formData.is_news}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  📰 Mark as News (RSS & News Sitemap)
                </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Co-Author (Optional)
                </label>
                <select
                  name="co_author_id"
                  value={formData.co_author_id || ''}
                  onChange={(e) => {
                    const selectedCoAuthor = authors.find(a => a.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      co_author_id: e.target.value,
                      co_author_name: selectedCoAuthor ? selectedCoAuthor.full_name : ''
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No co-author</option>
                  {authors.filter(a => a.id !== formData.author_id).map(author => (
                    <option key={author.id} value={author.id}>
                      {author.full_name} - {author.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a co-author if this post has multiple contributors</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
