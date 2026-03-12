import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowLeft, Save, Building2, UserCheck, Play, Upload, Youtube } from 'lucide-react';
import { toast } from 'sonner';

const OutsourceReviewForm = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams();
  const isEditing = !!reviewId;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_logo_url: '',
    slug: '',
    ceo_name: '',
    ceo_photo_url: '',
    ceo_title: 'CEO',
    testimonial_text: '',
    full_story: '',
    video_type: '',
    video_file_url: '',
    youtube_embed_url: '',
    switched_from_another: false,
    previous_company_name: '',
    why_they_switched: '',
    results_stats: {},
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: '',
    display_order: 0,
    is_active: true,
    featured: false
  });
  
  // State for individual stats inputs
  const [statsInputs, setStatsInputs] = useState({
    disputes_processed: '',
    deletion_rate: '',
    months_partnered: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchReview();
    }
  }, [reviewId]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/outsource/client-reviews/${reviewId}`);
      setFormData(response.data);
      // Populate stats inputs from results_stats
      if (response.data.results_stats) {
        setStatsInputs({
          disputes_processed: response.data.results_stats.disputes_processed || '',
          deletion_rate: response.data.results_stats.deletion_rate || '',
          months_partnered: response.data.results_stats.months_partnered || ''
        });
      }
    } catch (error) {
      console.error('Error fetching review:', error);
      toast.error('Failed to load review');
      navigate('/admin/outsource-reviews');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle stats input changes
  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setStatsInputs(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate slug from company name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.ceo_name.trim()) {
      toast.error('CEO name is required');
      return;
    }
    if (!formData.testimonial_text.trim()) {
      toast.error('Testimonial text is required');
      return;
    }

    // Build results_stats from inputs
    const results_stats = {};
    if (statsInputs.disputes_processed) results_stats.disputes_processed = statsInputs.disputes_processed;
    if (statsInputs.deletion_rate) results_stats.deletion_rate = statsInputs.deletion_rate;
    if (statsInputs.months_partnered) results_stats.months_partnered = statsInputs.months_partnered;

    // Auto-generate slug if empty
    const slug = formData.slug || generateSlug(formData.company_name);

    const submitData = {
      ...formData,
      slug,
      results_stats
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/admin/outsource/client-reviews/${reviewId}`, submitData);
        toast.success('Review updated successfully');
      } else {
        await api.post('/admin/outsource/client-reviews', submitData);
        toast.success('Review created successfully');
      }
      navigate('/admin/outsource-reviews');
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate('/admin/outsource-reviews')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Outsource Review' : 'Add New Outsource Review'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-blue" />
            Company Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="e.g., ABC Credit Repair"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-company-name"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from company name</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <Label htmlFor="company_logo_url">Company Logo URL</Label>
              <Input
                id="company_logo_url"
                name="company_logo_url"
                value={formData.company_logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="mt-1"
              />
              {formData.company_logo_url && (
                <div className="mt-2">
                  <img 
                    src={formData.company_logo_url} 
                    alt="Logo preview" 
                    className="h-16 object-contain rounded border"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CEO Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary-blue" />
            CEO / Contact Information
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="ceo_name">CEO / Contact Name *</Label>
              <Input
                id="ceo_name"
                name="ceo_name"
                value={formData.ceo_name}
                onChange={handleChange}
                required
                placeholder="e.g., John Smith"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ceo_title">Title</Label>
              <Input
                id="ceo_title"
                name="ceo_title"
                value={formData.ceo_title}
                onChange={handleChange}
                placeholder="e.g., CEO, Founder, Owner"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ceo_photo_url">CEO Photo URL</Label>
              <Input
                id="ceo_photo_url"
                name="ceo_photo_url"
                value={formData.ceo_photo_url}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="mt-1"
              />
              {formData.ceo_photo_url && (
                <div className="mt-2">
                  <img 
                    src={formData.ceo_photo_url} 
                    alt="CEO preview" 
                    className="w-16 h-16 object-cover rounded-full border"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">📝 Testimonial</h3>
          
          <div>
            <Label htmlFor="testimonial_text">Testimonial Text *</Label>
            <Textarea
              id="testimonial_text"
              name="testimonial_text"
              value={formData.testimonial_text}
              onChange={handleChange}
              required
              rows={5}
              placeholder="What did this partner say about working with Credlocity?"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.testimonial_text.length} characters</p>
          </div>

          <div className="mt-6">
            <Label htmlFor="full_story">Full Story / Case Study (HTML supported)</Label>
            <Textarea
              id="full_story"
              name="full_story"
              value={formData.full_story}
              onChange={handleChange}
              rows={8}
              placeholder="Write the extended story about this partner's journey with Credlocity. This will appear on the individual review page. You can use HTML for formatting."
              className="mt-1 font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">This extended content appears on the individual SEO-optimized review page</p>
          </div>
        </div>

        {/* Results & Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">📊 Results & Statistics (for SEO Detail Page)</h3>
          <p className="text-sm text-gray-500 mb-4">These stats will be displayed prominently on the individual review page</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="disputes_processed">Disputes Processed</Label>
              <Input
                id="disputes_processed"
                name="disputes_processed"
                value={statsInputs.disputes_processed}
                onChange={handleStatsChange}
                placeholder="e.g., 500+"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deletion_rate">Deletion Rate</Label>
              <Input
                id="deletion_rate"
                name="deletion_rate"
                value={statsInputs.deletion_rate}
                onChange={handleStatsChange}
                placeholder="e.g., 85%"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="months_partnered">Months Partnered</Label>
              <Input
                id="months_partnered"
                name="months_partnered"
                value={statsInputs.months_partnered}
                onChange={handleStatsChange}
                placeholder="e.g., 12"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Video Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary-blue" />
            Video Review (Optional)
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Video Type</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="video_type"
                    value=""
                    checked={!formData.video_type}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-blue"
                  />
                  <span>No Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="video_type"
                    value="youtube"
                    checked={formData.video_type === 'youtube'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-blue"
                  />
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>YouTube Embed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="video_type"
                    value="file"
                    checked={formData.video_type === 'file'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-blue"
                  />
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Uploaded File</span>
                </label>
              </div>
            </div>

            {formData.video_type === 'youtube' && (
              <div>
                <Label htmlFor="youtube_embed_url">YouTube URL</Label>
                <Input
                  id="youtube_embed_url"
                  name="youtube_embed_url"
                  value={formData.youtube_embed_url}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Paste the full YouTube URL - we'll convert it to an embed</p>
              </div>
            )}

            {formData.video_type === 'file' && (
              <div>
                <Label htmlFor="video_file_url">Video File URL</Label>
                <Input
                  id="video_file_url"
                  name="video_file_url"
                  value={formData.video_file_url}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Upload the video to Media Library first, then paste the URL here</p>
              </div>
            )}
          </div>
        </div>

        {/* Switched From Another Company */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">🔄 Switched From Another Outsourcer?</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="switched_from_another"
                name="switched_from_another"
                checked={formData.switched_from_another}
                onChange={handleChange}
                className="w-5 h-5 text-primary-blue rounded"
              />
              <Label htmlFor="switched_from_another" className="cursor-pointer">
                This partner switched from another outsourcing company to us
              </Label>
            </div>

            {formData.switched_from_another && (
              <div className="pl-8 space-y-4 border-l-2 border-green-200">
                <div>
                  <Label htmlFor="previous_company_name">Previous Outsourcing Company</Label>
                  <Input
                    id="previous_company_name"
                    name="previous_company_name"
                    value={formData.previous_company_name}
                    onChange={handleChange}
                    placeholder="e.g., XYZ Outsourcing, ABC Processing"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="why_they_switched">Why Did They Switch?</Label>
                  <Textarea
                    id="why_they_switched"
                    name="why_they_switched"
                    value={formData.why_they_switched}
                    onChange={handleChange}
                    rows={3}
                    placeholder="What made them choose Credlocity over their previous provider?"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">🔍 SEO Settings (for Individual Review Page)</h3>
          <p className="text-sm text-gray-500 mb-4">Customize how this review appears in search engines</p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="seo_meta_title">SEO Title</Label>
              <Input
                id="seo_meta_title"
                name="seo_meta_title"
                value={formData.seo_meta_title}
                onChange={handleChange}
                placeholder="e.g., ABC Credit Repair - Credlocity Outsourcing Partner Review"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate: "[Company Name] - Credlocity Outsourcing Partner Review"</p>
            </div>
            <div>
              <Label htmlFor="seo_meta_description">SEO Description</Label>
              <Textarea
                id="seo_meta_description"
                name="seo_meta_description"
                value={formData.seo_meta_description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description for search results (150-160 characters ideal)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.seo_meta_description?.length || 0}/160 characters</p>
            </div>
            <div>
              <Label htmlFor="seo_keywords">SEO Keywords</Label>
              <Input
                id="seo_keywords"
                name="seo_keywords"
                value={formData.seo_keywords}
                onChange={handleChange}
                placeholder="e.g., credit repair outsourcing, partner review, [company name]"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">⚙️ Display Settings</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleChange}
                min="0"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-primary-blue rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Show on public page
              </Label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 text-amber-500 rounded"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                ⭐ Featured Review
              </Label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/outsource-reviews')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary-blue hover:bg-primary-dark"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Review' : 'Create Review'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OutsourceReviewForm;