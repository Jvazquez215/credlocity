import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import api from '../../../utils/api';

const BannerPopupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    type: 'banner',
    title: '',
    content: '',
    cta_text: '',
    cta_link: '',
    position: 'top',
    trigger: 'onload',
    delay: 0,
    display_pages: [],
    start_date: '',
    end_date: '',
    is_active: true,
    dismissible: true,
    background_color: '#3B82F6',
    text_color: '#FFFFFF'
  });

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      const response = await api.get(`/admin/banners-popups/${id}`);
      setFormData({
        ...response.data,
        start_date: response.data.start_date ? response.data.start_date.split('T')[0] : '',
        end_date: response.data.end_date ? response.data.end_date.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Error loading item:', err);
      alert('Error loading item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const submitData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        delay: parseInt(formData.delay) || 0
      };

      if (isEdit) {
        await api.put(`/admin/banners-popups/${id}`, submitData);
      } else {
        await api.post('/admin/banners-popups', submitData);
      }

      alert(`✅ ${formData.type} ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/banners-popups');
    } catch (err) {
      console.error('Error saving:', err);
      alert(`Error saving ${formData.type}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/banners-popups')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit' : 'Create'} Banner/Popup
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium mb-3">Type *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'banner' })}
              className={`p-4 border-2 rounded-lg transition ${
                formData.type === 'banner'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Banner</div>
              <div className="text-sm text-gray-600">Top/bottom bar notification</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'popup' })}
              className={`p-4 border-2 rounded-lg transition ${
                formData.type === 'popup'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Popup</div>
              <div className="text-sm text-gray-600">Modal dialog box</div>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Black Friday Sale - 50% Off!"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content/Message *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Get 50% off all our credit repair services this weekend only!"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Link</label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="/pricing or https://..."
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Display Settings</h3>

          {formData.type === 'banner' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Banner Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="top">Top of page</option>
                <option value="bottom">Bottom of page</option>
                <option value="floating">Floating</option>
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Popup Trigger</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="onload">On page load</option>
                  <option value="onexit">On exit intent</option>
                  <option value="onscroll">On scroll (50%)</option>
                  <option value="timed">After delay</option>
                </select>
              </div>
              {formData.trigger === 'timed' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Delay (seconds)</label>
                  <input
                    type="number"
                    value={formData.delay}
                    onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Display on Pages</label>
            <input
              type="text"
              value={formData.display_pages.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                display_pages: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for all pages, or enter: home, pricing, blog"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated page slugs. Leave empty to show on all pages.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Styling */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Styling</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="w-16 h-10 rounded border"
                />
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-16 h-10 rounded border"
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-lg mb-4">Options</h3>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <div>
              <div className="font-medium">Active</div>
              <div className="text-sm text-gray-600">Display this {formData.type} on the website</div>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.dismissible}
              onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <div>
              <div className="font-medium">Dismissible</div>
              <div className="text-sm text-gray-600">Allow users to close this {formData.type}</div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/banners-popups')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerPopupForm;
