import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';

const UpdateModal = ({ isOpen, onClose, onSave, updateType = 'update' }) => {
  const [formData, setFormData] = useState({
    type: updateType,
    explanation: '',
    content: '',
    date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    highlight_enabled: false,
    highlight_color: '#fef08a', // Default yellow
    highlight_style: 'background'
  });

  // Update formData.type when updateType prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: updateType
    }));
  }, [updateType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
    // Reset form
    setFormData({
      type: updateType,
      explanation: '',
      content: '',
      date: new Date().toISOString().slice(0, 16),
      highlight_enabled: false,
      highlight_color: '#fef08a',
      highlight_style: 'background'
    });
  };

  if (!isOpen) return null;

  const isCritical = formData.type === 'critical_update';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isCritical ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-3">
            {isCritical ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <Info className="w-6 h-6 text-blue-600" />
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {isCritical ? 'Add Critical Update' : 'Add Update'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Update Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="update">Update</option>
              <option value="critical_update">Critical Update</option>
            </select>
          </div>

          {/* Explanation (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              placeholder="Brief explanation of what was updated (e.g., 'Corrected FICO score range', 'Updated pricing information')"
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be shown to readers on the front-end
            </p>
          </div>

          {/* Detailed Content (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Update Content (Optional)
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Add more details about the update if needed..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Additional context or details about the update
            </p>
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Date & Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Highlight Options */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                name="highlight_enabled"
                checked={formData.highlight_enabled}
                onChange={handleChange}
                id="highlight_enabled"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="highlight_enabled" className="text-sm font-medium text-gray-700">
                Enable Highlight
              </label>
            </div>

            {formData.highlight_enabled && (
              <div className="space-y-4 ml-6">
                {/* Highlight Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highlight Style
                  </label>
                  <select
                    name="highlight_style"
                    value={formData.highlight_style}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="background">Background Color</option>
                    <option value="border">Border Color</option>
                  </select>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highlight Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="highlight_color"
                      value={formData.highlight_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="highlight_color"
                      value={formData.highlight_color}
                      onChange={handleChange}
                      placeholder="#fef08a"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Preview: <span 
                      className="inline-block px-2 py-1 rounded"
                      style={{
                        backgroundColor: formData.highlight_style === 'background' ? formData.highlight_color : 'transparent',
                        border: formData.highlight_style === 'border' ? `2px solid ${formData.highlight_color}` : 'none'
                      }}
                    >
                      Sample Text
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.explanation.trim()}
            className={`px-6 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Add {isCritical ? 'Critical Update' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
