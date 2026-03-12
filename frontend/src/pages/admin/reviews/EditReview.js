import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditReview = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    client_name: '',
    testimonial_text: '',
    full_story: '',
    video_url: '',
    before_score: '',
    after_score: '',
    points_improved: 0,
    client_photo_url: '',
    featured_on_homepage: false,
    show_on_success_stories: true,
    competitor_switched_from: '',
    detailed_narrative: '',
    story_title: '',
    story_slug: '',
    gallery_photos: [],
    category_ids: [],
    schema_data: {},
    // SEO FIELDS
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: '',
    // SOCIAL FIELDS
    client_social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      bluesky: '',
      threads: ''
    }
  });

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  // Fetch review categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/admin/review-categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Auto-calculate points improved
  useEffect(() => {
    const before = parseInt(formData.before_score) || 0;
    const after = parseInt(formData.after_score) || 0;
    if (before && after && after > before) {
      setFormData(prev => ({
        ...prev,
        points_improved: after - before
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        points_improved: 0
      }));
    }
  }, [formData.before_score, formData.after_score]);

  const fetchReview = async () => {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      const review = response.data;
      setFormData({
        client_name: review.client_name || '',
        testimonial_text: review.testimonial_text || '',
        full_story: review.full_story || '',
        video_url: review.video_url || '',
        before_score: review.before_score || '',
        after_score: review.after_score || '',
        points_improved: review.points_improved || 0,
        client_photo_url: review.client_photo_url || '',
        featured_on_homepage: review.featured_on_homepage || false,
        show_on_success_stories: review.show_on_success_stories !== false,
        competitor_switched_from: review.competitor_switched_from || '',
        detailed_narrative: review.detailed_narrative || '',
        story_title: review.story_title || '',
        story_slug: review.story_slug || '',
        gallery_photos: review.gallery_photos || [],
        category_ids: review.category_ids || [],
        schema_data: review.schema_data || {},
        // SEO FIELDS
        seo_meta_title: review.seo_meta_title || '',
        seo_meta_description: review.seo_meta_description || '',
        seo_keywords: review.seo_keywords || '',
        // SOCIAL FIELDS
        client_social_links: review.client_social_links || {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
          bluesky: '',
          threads: ''
        }
      });
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to load review');
      navigate('/admin/reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => {
      const currentIds = prev.category_ids || [];
      const isSelected = currentIds.includes(categoryId);
      
      return {
        ...prev,
        category_ids: isSelected
          ? currentIds.filter(id => id !== categoryId)
          : [...currentIds, categoryId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client_name.trim()) {
      alert('Client name is required');
      return;
    }
    if (!formData.testimonial_text.trim()) {
      alert('Testimonial text is required');
      return;
    }
    if (!formData.before_score || !formData.after_score) {
      alert('Both before and after credit scores are required');
      return;
    }

    const before = parseInt(formData.before_score);
    const after = parseInt(formData.after_score);

    if (before < 300 || before > 850 || after < 300 || after > 850) {
      alert('Credit scores must be between 300 and 850');
      return;
    }

    if (after <= before) {
      alert('After score must be higher than before score');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/reviews/${reviewId}`, {
        ...formData,
        before_score: parseInt(formData.before_score),
        after_score: parseInt(formData.after_score),
        points_improved: parseInt(formData.points_improved)
      });
      alert('Review updated successfully!');
      navigate('/admin/reviews');
    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.detail || 'Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading review...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate('/admin/reviews')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reviews
        </Button>
        <h2 className="text-3xl font-bold text-gray-900">Edit Review</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Sarah Johnson"
            required
          />
        </div>

        {/* Testimonial Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Testimonial Quote (150-300 chars) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="testimonial_text"
            value={formData.testimonial_text}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Short, impactful quote from the client..."
            maxLength={300}
            required
          />
          <p className="text-sm text-gray-500 mt-1">{formData.testimonial_text.length}/300 characters</p>
        </div>

        {/* Full Story */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Story (Optional, 500+ chars)
          </label>
          <textarea
            name="full_story"
            value={formData.full_story}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
            placeholder="Detailed success story with background, challenges, results..."
          />
          <p className="text-sm text-gray-500 mt-1">{formData.full_story.length} characters</p>
        </div>

        {/* Credit Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Before Credit Score <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="before_score"
              value={formData.before_score}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="300-850"
              min="300"
              max="850"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              After Credit Score <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="after_score"
              value={formData.after_score}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="300-850"
              min="300"
              max="850"
              required
            />
          </div>
        </div>

        {/* Points Improved (Auto-calculated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points Improved (Auto-calculated)
          </label>
          <input
            type="number"
            name="points_improved"
            value={formData.points_improved}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-green-600 font-bold"
            placeholder="Calculated automatically"
          />
        </div>

        {/* Client Photo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Photo URL
          </label>
          <input
            type="url"
            name="client_photo_url"
            value={formData.client_photo_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/photo.jpg or upload to Media Library first"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload to Media Library first, then copy URL here
          </p>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL (YouTube or Vimeo)
          </label>
          <input
            type="url"
            name="video_url"
            value={formData.video_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://www.youtube.com/embed/..."
          />
        </div>

        {/* Competitor Switched From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competitor Switched From (Optional)
          </label>
          <input
            type="text"
            name="competitor_switched_from"
            value={formData.competitor_switched_from}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Lexington Law, Credit Repair.com"
          />
        </div>

        {/* Review Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Categories (Select all that apply)
          </label>
          {loadingCategories ? (
            <div className="text-sm text-gray-500 py-2">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              No categories created yet. <a href="/admin/review-categories" className="text-blue-600 hover:underline">Create one here</a>
            </div>
          ) : (
            <div className="space-y-2 border border-gray-300 rounded-lg p-4">
              {categories.map(category => (
                <div key={category.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={(formData.category_ids || []).includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`category-${category.id}`} className="text-sm text-gray-700 cursor-pointer">
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                    {category.description && <span className="text-gray-500 ml-2">- {category.description}</span>}
                  </label>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            This review will appear in the selected category sections on your public reviews page.
          </p>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured_on_homepage"
              checked={formData.featured_on_homepage}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Featured on Homepage (displays in homepage testimonials section)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="show_on_success_stories"
              checked={formData.show_on_success_stories}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Show on Success Stories page
            </label>
          </div>
        </div>

        {/* SEO Settings Section */}
        <div className="border border-gray-200 rounded-lg mt-6">
          <button
            type="button"
            onClick={() => setShowSEO(!showSEO)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">🔍 SEO Settings (for story page)</span>
            <span className="text-lg">{showSEO ? '▼' : '▶'}</span>
          </button>

          {showSEO && (
            <div className="p-4 space-y-4 bg-white">
              <p className="text-sm text-gray-600 mb-3">
                Optimize this success story for search engines and social sharing.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title ({(formData.seo_meta_title || '').length}/60 characters)
                </label>
                <input
                  type="text"
                  value={formData.seo_meta_title || ''}
                  onChange={(e) => setFormData({ ...formData, seo_meta_title: e.target.value })}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sarah's Credit Repair Success: 580 to 720 in 45 Days | Credlocity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If blank, defaults to: "{formData.story_title || formData.client_name + "'s Success Story"} | Credlocity"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description ({(formData.seo_meta_description || '').length}/160 characters)
                </label>
                <textarea
                  value={formData.seo_meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value })}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description that appears in search results"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.seo_keywords || ''}
                  onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="credit repair success, improve credit score, homeowner"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">SEO Preview:</p>
                <div className="space-y-1">
                  <p className="text-blue-600 text-base font-medium line-clamp-1">
                    {formData.seo_meta_title || `${formData.story_title || formData.client_name + "'s Success Story"} | Credlocity`}
                  </p>
                  <p className="text-green-700 text-xs">
                    credlocity.com/success-stories/{formData.story_slug || 'story-url'}
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {formData.seo_meta_description || formData.testimonial_text || 'No description yet...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schema Data JSON */}
        <div className="border border-gray-200 rounded-lg mt-6">
          <div className="p-4 space-y-4 bg-white">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Schema.org JSON Data (for SEO Rich Snippets)
              </label>
              <textarea
                name="schema_data"
                value={typeof formData.schema_data === 'string' ? formData.schema_data : JSON.stringify(formData.schema_data || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, schema_data: parsed });
                  } catch {
                    // Allow invalid JSON while typing
                    setFormData({ ...formData, schema_data: e.target.value });
                  }
                }}
                rows="6"
                placeholder='{"@type": "Review", "reviewRating": {"@type": "Rating", "ratingValue": 5}}'
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Add structured data for better search engine visibility. Must be valid JSON. Optional.</p>
            </div>
          </div>
        </div>

        {/* Client Social Media Links Section */}
        <div className="border border-gray-200 rounded-lg mt-6">
          <button
            type="button"
            onClick={() => setShowSocial(!showSocial)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">📱 Client Social Media Links (optional)</span>
            <span className="text-lg">{showSocial ? '▼' : '▶'}</span>
          </button>

          {showSocial && (
            <div className="p-4 space-y-4 bg-white">
              <p className="text-sm text-gray-600 mb-4">
                Add client's social media profiles to display on their success story page.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-blue-600 text-xl">📘</span> Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.client_social_links?.facebook || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client_social_links: { 
                        ...formData.client_social_links, 
                        facebook: e.target.value 
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-pink-600 text-xl">📷</span> Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.client_social_links?.instagram || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client_social_links: { 
                        ...formData.client_social_links, 
                        instagram: e.target.value 
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-black text-xl">𝕏</span> X (Twitter)
                  </label>
                  <input
                    type="url"
                    value={formData.client_social_links?.twitter || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client_social_links: { 
                        ...formData.client_social_links, 
                        twitter: e.target.value 
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://x.com/username"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-blue-700 text-xl">💼</span> LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.client_social_links?.linkedin || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client_social_links: { 
                        ...formData.client_social_links, 
                        linkedin: e.target.value 
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-blue-500 text-xl">🦋</span> BlueSky
                  </label>
                  <input
                    type="url"
                    value={formData.client_social_links?.bluesky || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client_social_links: { 
                        ...formData.client_social_links, 
                        bluesky: e.target.value 
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://bsky.app/profile/username"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-black text-xl">🧵</span> Threads
                  </label>
                  <input
                    type="url"
                    value={formData.client_social_links?.threads || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client_social_links: { 
                        ...formData.client_social_links, 
                        threads: e.target.value 
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://threads.net/@username"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> Only filled-in social links will display on the success story page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={() => navigate('/admin/reviews')}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Updating...' : 'Update Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditReview;
