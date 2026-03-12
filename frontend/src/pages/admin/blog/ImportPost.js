import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const ImportPost = () => {
  console.log('ImportPost component rendered');
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [importMethod, setImportMethod] = useState('url'); // 'url' or 'html'
  
  const [formData, setFormData] = useState({
    source_url: '',
    html_content: '',
    title: '',
    slug: '',
    excerpt: '',
    categories: [],
    tags: [],
    featured_image_url: '',
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: '',
    og_title: '',
    og_description: '',
    og_image: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFetchFromURL = async () => {
    if (!formData.source_url.trim()) {
      alert('Please enter a URL');
      return;
    }

    try {
      setFetching(true);
      
      // Use a CORS proxy or backend endpoint to fetch the URL
      // For now, we'll use a simple fetch with CORS mode
      const response = await fetch(formData.source_url, {
        mode: 'cors',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }
      
      const html = await response.text();
      setFormData(prev => ({ ...prev, html_content: html }));
      
      // Auto-extract after fetching
      setTimeout(() => {
        handleAutoExtract(html);
      }, 100);
      
      alert('✅ Content fetched successfully! Review and adjust before importing.');
    } catch (err) {
      console.error('Fetch error:', err);
      alert('❌ Failed to fetch URL. This might be due to CORS restrictions. Try copying and pasting the HTML content instead.');
    } finally {
      setFetching(false);
    }
  };

  const handleAutoExtract = (htmlContent = null) => {
    const content = htmlContent || formData.html_content;
    
    if (!content.trim()) {
      alert('Please paste HTML content first or fetch from URL');
      return;
    }

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Try to extract title from h1, h2, or title tag
    let extractedTitle = '';
    const h1 = tempDiv.querySelector('h1');
    const h2 = tempDiv.querySelector('h2');
    const title = tempDiv.querySelector('title');
    const metaTitle = tempDiv.querySelector('meta[property="og:title"]') || 
                     tempDiv.querySelector('meta[name="title"]');
    
    if (metaTitle) {
      extractedTitle = metaTitle.getAttribute('content').trim();
    } else if (h1) {
      extractedTitle = h1.textContent.trim();
    } else if (h2) {
      extractedTitle = h2.textContent.trim();
    } else if (title) {
      extractedTitle = title.textContent.trim();
    }

    // Extract meta description
    const metaDesc = tempDiv.querySelector('meta[name="description"]') ||
                     tempDiv.querySelector('meta[property="og:description"]');
    const extractedMetaDesc = metaDesc ? metaDesc.getAttribute('content').trim() : '';

    // Extract OG image
    const ogImage = tempDiv.querySelector('meta[property="og:image"]');
    const extractedOgImage = ogImage ? ogImage.getAttribute('content') : '';

    // Extract text content for excerpt
    const textContent = tempDiv.textContent.trim();
    const extractedExcerpt = textContent.substring(0, 200);

    // Generate slug from title
    const extractedSlug = extractedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData(prev => ({
      ...prev,
      title: extractedTitle || prev.title,
      excerpt: extractedExcerpt || prev.excerpt,
      slug: extractedSlug || prev.slug,
      seo_meta_title: extractedTitle || prev.seo_meta_title,
      seo_meta_description: extractedMetaDesc || prev.seo_meta_description,
      og_title: extractedTitle || prev.og_title,
      og_description: extractedMetaDesc || prev.og_description,
      og_image: extractedOgImage || prev.og_image,
      featured_image_url: extractedOgImage || prev.featured_image_url
    }));

    alert('✅ Content extracted! Title, excerpt, slug, and SEO metadata populated. Review and adjust as needed.');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a URL slug (this preserves your original URL for SEO)');
      return;
    }
    if (!formData.html_content.trim()) {
      alert('Please paste HTML content');
      return;
    }

    try {
      setSaving(true);
      
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.html_content, // HTML content
        excerpt: formData.excerpt,
        categories: formData.categories,
        tags: formData.tags.filter(t => t.trim()),
        featured_image_url: formData.featured_image_url,
        featured_image_alt: '',
        author_name: 'Credlocity Team',
        seo: {
          meta_title: formData.seo_meta_title,
          meta_description: formData.seo_meta_description,
          keywords: formData.seo_keywords,
          canonical_url: '',
          robots: 'index, follow',
          schema_type: 'BlogPosting',
          og_title: '',
          og_description: '',
          og_image: ''
        },
        status: 'draft', // Always import as draft for review
        publish_date: null,
        featured_post: false,
        allow_comments: true,
        related_posts: []
      };

      await api.post('/blog/posts', postData);
      
      alert('✅ Blog post imported successfully as DRAFT! You can review and publish it from the blog list.');
      navigate('/admin/blog');
    } catch (err) {
      console.error('Import error:', err);
      alert(err.response?.data?.detail || 'Failed to import blog post. Please check if the slug is unique.');
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
            <h1 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">Import Existing Blog Post</h1>
            <p className="text-gray-600">Migrate your existing blog content with preserved URL slugs</p>
          </div>
          <button
            onClick={() => navigate('/admin/blog')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Blog List
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Two Import Methods:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li><strong>Import from URL (Recommended):</strong> Enter your blog post URL, we'll fetch and extract everything automatically</li>
          <li><strong>Paste HTML:</strong> Copy your blog's HTML and paste it manually</li>
          <li><strong className="text-red-600">CRITICAL:</strong> Use your original URL slug to preserve SEO rankings</li>
          <li>All imports are saved as drafts for review before publishing</li>
        </ol>
      </div>

      {/* Import Method Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setImportMethod('url')}
          className={`px-6 py-3 font-medium transition border-b-2 ${
            importMethod === 'url'
              ? 'border-primary-blue text-primary-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🌐 Import from URL (Recommended)
        </button>
        <button
          onClick={() => setImportMethod('html')}
          className={`px-6 py-3 font-medium transition border-b-2 ${
            importMethod === 'html'
              ? 'border-primary-blue text-primary-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Paste HTML
        </button>
      </div>

      <div className="space-y-6">
        {/* URL Import Method */}
        {importMethod === 'url' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-3">🌐 Import from URL</h3>
            <p className="text-sm text-green-800 mb-4">
              Enter the URL of your existing blog post. We'll fetch the content and extract all metadata automatically.
            </p>
            
            <div className="flex gap-3">
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                className="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="https://your-website.com/blog/your-post-slug"
                disabled={fetching}
              />
              <button
                type="button"
                onClick={handleFetchFromURL}
                disabled={fetching}
                className="px-6 py-3 bg-secondary-green text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {fetching ? 'Fetching...' : '🚀 Fetch & Import'}
              </button>
            </div>

            {fetching && (
              <div className="mt-4 text-center text-green-700">
                <p>⏳ Fetching content from URL...</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Note:</strong> Some websites block automated fetching due to CORS policies. 
                If this fails, use the "Paste HTML" method instead.
              </p>
            </div>
          </div>
        )}

        {/* HTML Paste Method */}
        {importMethod === 'html' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste HTML Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.html_content}
              onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="<h1>Your Blog Title</h1>&#10;<p>Your blog content goes here...</p>"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">{formData.html_content.length} characters</p>
              <button
                type="button"
                onClick={() => handleAutoExtract()}
                className="px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                ✨ Auto-Extract Metadata
              </button>
            </div>
          </div>
        )}

        {/* Rest of the form (shown after either method) */}
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Extracted from HTML or enter manually"
          />
        </div>

        {/* Original URL Slug */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <label className="block text-sm font-bold text-yellow-900 mb-2">
            ⚠️ Original URL Slug (CRITICAL FOR SEO) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-600">credlocity.com/blog/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="flex-1 px-4 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
              placeholder="your-original-url-slug"
            />
          </div>
          <p className="text-xs text-yellow-800 font-medium">
            🔥 Use your blog's EXACT ORIGINAL URL slug to preserve search rankings and backlinks!
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Extracted from content or enter manually"
          />
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
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, categories: [...prev.categories, cat.id] }));
                    } else {
                      setFormData(prev => ({ ...prev, categories: prev.categories.filter(id => id !== cat.id) }));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
            }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="credit repair, tips, guide"
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
          <input
            type="url"
            value={formData.featured_image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* SEO Fields */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">SEO Metadata (Optional)</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.seo_meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_meta_title: e.target.value }))}
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={formData.seo_meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_meta_description: e.target.value }))}
                maxLength={160}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            {saving ? 'Importing...' : '📥 Import as Draft'}
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          <strong>✅ Safe Import:</strong> All imported posts are saved as drafts. Review them before publishing to ensure everything looks correct.
        </div>
      </div>
    </div>
  );
};

export default ImportPost;
