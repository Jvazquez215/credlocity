import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../../../components/RichTextEditor';
import api from '../../../utils/api';
import ImageUpload from '../../../components/ui/ImageUpload';
import SchemaSelector from '../../../components/ui/SchemaSelector';
import { Image, Code } from 'lucide-react';

const CreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    featured_image_url: '',
    featured_image_alt: '',
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    robots_index: true,
    robots_follow: true,
    schema_types: [],
    status: 'draft'
  });
  const [showSEO, setShowSEO] = useState(false);
  const [showSchemas, setShowSchemas] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    setFormData({
      ...formData,
      title: title,
      slug: slug
    });
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSubmit = {
      ...formData,
      status: publishNow ? 'published' : 'draft'
    };

    try {
      await api.post('/pages', dataToSubmit);
      navigate('/admin/dashboard/pages');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Page</h1>
        <p className="text-gray-600 mt-2">Add a new page to your website</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., About Us"
          />
        </div>

        {/* URL Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="about-us"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL: www.credlocity.com/{formData.slug || 'page-url-slug'}
          </p>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Content <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="inline w-4 h-4 mr-2" />
            Featured Image
          </label>
          <ImageUpload
            value={formData.featured_image_url}
            onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
            label="Upload or enter image URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image Alt Text</label>
          <input
            type="text"
            value={formData.featured_image_alt || ''}
            onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descriptive alt text for accessibility and SEO"
          />
        </div>

        {/* Schema Selector */}
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
            <span>{showSchemas ? '▼' : '▶'}</span>
          </button>

          {showSchemas && (
            <div className="p-4 bg-white">
              <SchemaSelector
                value={formData.schema_types}
                onChange={(schemas) => setFormData({ ...formData, schema_types: schemas })}
                contentType="page"
              />
            </div>
          )}
        </div>

        {/* SEO Settings */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowSEO(!showSEO)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">🔍 SEO Settings</span>
            <span>{showSEO ? '▼' : '▶'}</span>
          </button>

          {showSEO && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title ({(formData.meta_title || '').length}/60 characters)
                </label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description ({(formData.meta_description || '').length}/160 characters)
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Brief description for search results"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Title (Social Media)
                </label>
                <input
                  type="text"
                  value={formData.og_title || ''}
                  onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Title for social media shares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Description (Social Media)
                </label>
                <textarea
                  value={formData.og_description || ''}
                  onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description for social media shares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image URL (Social Media)
                </label>
                <input
                  type="url"
                  value={formData.og_image || formData.featured_image_url || ''}
                  onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Leave blank to use featured image"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200x630px. Defaults to featured image if blank.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={formData.canonical_url || ''}
                  onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://www.credlocity.com/your-page (leave blank for auto)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set a canonical URL to avoid duplicate content issues. Leave blank to use the page's default URL.
                </p>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.robots_index !== false}
                    onChange={(e) => setFormData({ ...formData, robots_index: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow search engines to index this page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.robots_follow !== false}
                    onChange={(e) => setFormData({ ...formData, robots_follow: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow search engines to follow links</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Publishing...' : 'Save & Publish'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/pages')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePage;
