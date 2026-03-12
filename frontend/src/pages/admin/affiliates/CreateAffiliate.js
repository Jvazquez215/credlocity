import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import RichTextEditor from '../../../components/RichTextEditor';
import { Save, X, Plus } from 'lucide-react';

const CreateAffiliate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    company_name: '',
    description: '',
    content: '',
    affiliate_link: '',
    rating: '',
    pros: [''],
    cons: [''],
    pricing_text: '',
    pricing_details: '',
    featured_image_url: '',
    featured_image_alt: '',
    logo_url: '',
    commission_rate: '',
    disclosure: 'We may earn a commission from purchases made through affiliate links at no extra cost to you.',
    key_features: [''],
    status: 'draft',
    featured: false,
    order: 0
  });

  // Auto-generate slug from title
  React.useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (status) => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert('Please enter title and slug');
      return;
    }
    if (!formData.company_name.trim()) {
      alert('Please enter company name');
      return;
    }
    if (!formData.affiliate_link.trim()) {
      alert('Please enter affiliate link');
      return;
    }

    try {
      setSaving(true);
      
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        status,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim()),
        key_features: formData.key_features.filter(f => f.trim()),
        rating: formData.rating ? parseFloat(formData.rating) : null
      };

      await api.post('/affiliates', cleanedData);
      navigate('/admin/affiliates');
    } catch (err) {
      console.error('Error creating affiliate:', err);
      alert(err.response?.data?.detail || 'Failed to create affiliate page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Affiliate Page</h1>
        <p className="text-gray-600 mt-1">Add a new affiliate product or service page</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Lexington Law"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Lexington Law Review 2024"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="lexington-law-review"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description for listings..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Content/Review *
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          />
        </div>

        {/* Affiliate Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Affiliate Link *
          </label>
          <input
            type="url"
            name="affiliate_link"
            value={formData.affiliate_link}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>

        {/* Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (out of 5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="4.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pricing
            </label>
            <input
              type="text"
              name="pricing_text"
              value={formData.pricing_text}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="$99/month"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pros
          </label>
          {formData.pros.map((pro, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={pro}
                onChange={(e) => handleArrayChange('pros', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a pro..."
              />
              {formData.pros.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('pros', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('pros')}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Pro
          </button>
        </div>

        {/* Cons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cons
          </label>
          {formData.cons.map((con, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={con}
                onChange={(e) => handleArrayChange('cons', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a con..."
              />
              {formData.cons.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('cons', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('cons')}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Con
          </button>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              name="featured_image_url"
              value={formData.featured_image_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/affiliates')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAffiliate;
