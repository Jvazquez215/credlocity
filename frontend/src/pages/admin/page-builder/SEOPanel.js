import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../../utils/api';

const SEOPanel = ({ pageId, pageData }) => {
  const [seoData, setSeoData] = useState({
    slug: '',
    title: '',
    meta_description: '',
    excerpt: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    robots: 'index, follow'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pageData) {
      setSeoData({
        slug: pageData.slug || '',
        title: pageData.seo?.meta_title || pageData.title || '',
        meta_description: pageData.seo?.meta_description || '',
        excerpt: pageData.excerpt || '',
        keywords: pageData.seo?.keywords || '',
        og_title: pageData.seo?.og_title || pageData.title || '',
        og_description: pageData.seo?.og_description || '',
        og_image: pageData.seo?.og_image || '',
        canonical_url: pageData.seo?.canonical_url || '',
        robots: pageData.seo?.robots || 'index, follow'
      });
    }
  }, [pageData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await api.put(`/pages/${pageId}`, {
        slug: seoData.slug,
        excerpt: seoData.excerpt,
        seo: {
          meta_title: seoData.title,
          meta_description: seoData.meta_description,
          keywords: seoData.keywords,
          og_title: seoData.og_title,
          og_description: seoData.og_description,
          og_image: seoData.og_image,
          canonical_url: seoData.canonical_url,
          robots: seoData.robots
        }
      });

      console.log('SEO saved:', response.data);
      alert('✅ SEO settings saved successfully! The page URL and metadata have been updated.');
    } catch (err) {
      console.error('Error saving SEO:', err);
      alert('❌ Error saving SEO settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">SEO Settings</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>

      <div className="space-y-4">
        {/* URL Slug */}
        <div>
          <label className="block text-sm font-medium mb-2">URL Slug *</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">/{''}</span>
            <input
              type="text"
              value={seoData.slug}
              onChange={(e) => setSeoData({ ...seoData, slug: e.target.value })}
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="about-us"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">The URL-friendly version of the page name</p>
        </div>

        {/* Title Tag */}
        <div>
          <label className="block text-sm font-medium mb-2">Title Tag (SEO Title) *</label>
          <input
            type="text"
            value={seoData.title}
            onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
            maxLength={60}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Amazing Page Title | Brand Name"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Shown in search results and browser tabs</span>
            <span>{seoData.title.length}/60</span>
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Meta Description *</label>
          <textarea
            value={seoData.meta_description}
            onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
            maxLength={160}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="A compelling description of your page content..."
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Appears under the title in search results</span>
            <span>{seoData.meta_description.length}/160</span>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt</label>
          <textarea
            value={seoData.excerpt}
            onChange={(e) => setSeoData({ ...seoData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="A brief summary of the page content..."
          />
          <p className="text-xs text-gray-500 mt-1">Used in listings and previews</p>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
          <input
            type="text"
            value={seoData.keywords}
            onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="credit repair, credit score, financial services"
          />
        </div>

        {/* Open Graph */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-3">Social Media (Open Graph)</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">OG Title</label>
              <input
                type="text"
                value={seoData.og_title}
                onChange={(e) => setSeoData({ ...seoData, og_title: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank to use SEO Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Description</label>
              <textarea
                value={seoData.og_description}
                onChange={(e) => setSeoData({ ...seoData, og_description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank to use Meta Description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Image URL</label>
              <input
                type="text"
                value={seoData.og_image}
                onChange={(e) => setSeoData({ ...seoData, og_image: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px</p>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-3">Advanced Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Canonical URL</label>
              <input
                type="text"
                value={seoData.canonical_url}
                onChange={(e) => setSeoData({ ...seoData, canonical_url: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">Prevent duplicate content issues</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Robots Meta Tag</label>
              <select
                value={seoData.robots}
                onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="index, follow">Index, Follow (Default)</option>
                <option value="noindex, follow">No Index, Follow</option>
                <option value="index, nofollow">Index, No Follow</option>
                <option value="noindex, nofollow">No Index, No Follow</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOPanel;
