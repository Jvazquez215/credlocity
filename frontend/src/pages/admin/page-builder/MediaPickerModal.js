import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon } from 'lucide-react';
import api from '../../../utils/api';

const MediaPickerModal = ({ isOpen, onClose, onSelect, type = 'image' }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, type]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'video' ? '/media?type=video' : '/media?type=image';
      const response = await api.get(endpoint);
      setMedia(response.data || []);
    } catch (err) {
      console.error('Error loading media:', err);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item => 
    item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {type === 'video' ? '🎬 Select Video' : '🖼️ Select Image'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${type}s...`}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading {type}s...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No {type}s found</p>
              <p className="text-sm text-gray-400 mt-2">
                Upload {type}s in the Media Library first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-lg transition"
                >
                  {type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                      <span className="text-white text-4xl">▶️</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">
                      {item.filename || item.title}
                    </p>
                    {item.alt_text && (
                      <p className="text-xs text-gray-500 truncate">{item.alt_text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredMedia.length} {type}(s) available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
