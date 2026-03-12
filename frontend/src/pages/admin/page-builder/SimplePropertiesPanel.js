import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import EmojiPicker from '../../../components/EmojiPicker';
import MediaPickerModal from './MediaPickerModal';
import ReviewPickerModal from './ReviewPickerModal';

const SimplePropertiesPanel = ({ selectedElement, onUpdate, onClose }) => {
  const [content, setContent] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16px');
  const [fontWeight, setFontWeight] = useState('normal');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [showReviewPicker, setShowReviewPicker] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);

  useEffect(() => {
    if (selectedElement && selectedElement.props) {
      console.log('Properties Panel received:', {
        type: selectedElement.type,
        content: selectedElement.props.content,
        hasProps: !!selectedElement.props
      });
      
      setContent(selectedElement.props.content || '');
      setTextColor(selectedElement.props.style?.color || '#000000');
      setBgColor(selectedElement.props.style?.backgroundColor || '#ffffff');
      setFontSize(selectedElement.props.style?.fontSize || '16px');
      setFontWeight(selectedElement.props.style?.fontWeight || 'normal');
    }
  }, [selectedElement]);

  const handleContentChange = (value) => {
    setContent(value);
    onUpdate('content', value);
  };

  const handleColorChange = (value) => {
    setTextColor(value);
    onUpdate('style.color', value);
  };

  const handleBgColorChange = (value) => {
    setBgColor(value);
    onUpdate('style.backgroundColor', value);
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    onUpdate('style.fontSize', value);
  };

  const handleFontWeightChange = (value) => {
    setFontWeight(value);
    onUpdate('style.fontWeight', value);
  };

  if (!selectedElement) return null;

  return (
    <div className="w-80 bg-white border-l overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Edit Element</h3>
          <p className="text-xs text-gray-500">{selectedElement.type?.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('🗑️ Delete this element permanently?')) {
                if (selectedElement.element && selectedElement.element.parentNode) {
                  selectedElement.element.parentNode.removeChild(selectedElement.element);
                  console.log('Element deleted');
                }
                onClose();
              }
            }}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
            title="Delete Element"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Content Editor - Show for all text-based elements */}
        {selectedElement.type !== 'image' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Text Content</label>
              <EmojiPicker
                onSelect={(emoji) => handleContentChange(content + emoji)}
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Type your text here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              ✏️ Type here to change the text on the page
            </p>
          </div>
        )}

        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Select Image</label>
              <button
                onClick={() => setShowImagePicker(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-3 font-semibold"
              >
                🖼️ Choose from Media Library
              </button>
              
              <div className="border-t pt-3 mt-3">
                <label className="block text-sm font-medium mb-2">Or paste Image URL</label>
                <input
                  type="text"
                  value={selectedElement.props.src || ''}
                  onChange={(e) => onUpdate('src', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 mb-3"
                  placeholder="https://..."
                />
              </div>

              <label className="block text-sm font-medium mb-2">Alt Text (for SEO)</label>
              <input
                type="text"
                value={selectedElement.props.alt || ''}
                onChange={(e) => onUpdate('alt', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Describe this image"
              />
            </div>
            
            <MediaPickerModal
              isOpen={showImagePicker}
              onClose={() => setShowImagePicker(false)}
              type="image"
              onSelect={(image) => {
                onUpdate('src', image.url);
                onUpdate('alt', image.alt_text || image.filename);
              }}
            />
          </>
        )}

        {/* Button Properties */}
        {selectedElement.type === 'button' && (
          <div>
            <label className="block text-sm font-medium mb-2">Button Link/URL</label>
            <input
              type="text"
              value={selectedElement.props.link || selectedElement.element.href || ''}
              onChange={(e) => onUpdate('link', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com or /page"
            />
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Enter full URL (https://...) or internal path (/pricing)
            </p>
          </div>
        )}

        {/* Video Properties */}
        {(selectedElement.type === 'video' || selectedElement.element?.dataset?.isVideo) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Select Video</label>
              <button
                onClick={() => setShowVideoPicker(true)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-3 font-semibold"
              >
                🎬 Choose from Video Library
              </button>
              
              <div className="border-t pt-3 mt-3">
                <label className="block text-sm font-medium mb-2">Or paste YouTube/Vimeo URL</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  onBlur={(e) => {
                    if (e.target.value) {
                      selectedElement.element.innerHTML = `
                        <iframe 
                          src="${e.target.value}" 
                          class="w-full aspect-video rounded"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      `;
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Paste the embed URL from YouTube or Vimeo
                </p>
              </div>
            </div>
            
            <MediaPickerModal
              isOpen={showVideoPicker}
              onClose={() => setShowVideoPicker(false)}
              type="video"
              onSelect={(video) => {
                selectedElement.element.innerHTML = `
                  <iframe 
                    src="${video.url || video.embed_url}" 
                    class="w-full aspect-video rounded"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                `;
              }}
            />
          </>
        )}

        {/* Review List Properties */}
        {selectedElement.type === 'review_list' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Select Reviews</label>
              <button
                onClick={() => setShowReviewPicker(true)}
                className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 mb-3 font-semibold"
              >
                ⭐ Choose Specific Reviews
              </button>
              
              {selectedReviews.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    ✓ {selectedReviews.length} review(s) selected:
                  </p>
                  <div className="space-y-1">
                    {selectedReviews.slice(0, 3).map((review, idx) => (
                      <p key={idx} className="text-xs text-green-700">
                        • {review.client_name}
                        {review.points_improved && ` (+${review.points_improved} pts)`}
                      </p>
                    ))}
                    {selectedReviews.length > 3 && (
                      <p className="text-xs text-green-600 italic">
                        ...and {selectedReviews.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <label className="block text-sm font-medium mb-2">Display Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Show Star Ratings</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Show Client Names</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Show Score Improvement</span>
                  </label>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                💡 Selected reviews will be displayed in the order chosen
              </p>
            </div>
            
            <ReviewPickerModal
              isOpen={showReviewPicker}
              onClose={() => setShowReviewPicker(false)}
              selectedReviewIds={selectedReviews.map(r => r.id)}
              onSelect={(reviews) => {
                setSelectedReviews(reviews);
                // Store selected review IDs in the element for later rendering
                if (selectedElement.element) {
                  selectedElement.element.dataset.selectedReviews = JSON.stringify(
                    reviews.map(r => r.id)
                  );
                }
                console.log('Selected reviews:', reviews);
              }}
            />
          </>
        )}

        {/* Blog List Properties */}
        {selectedElement.type === 'blog_list' && (
          <div>
            <label className="block text-sm font-medium mb-2">Number of Posts</label>
            <input
              type="number"
              min="1"
              max="20"
              defaultValue="3"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 mb-4"
            />
            
            <label className="block text-sm font-medium mb-2">Category Filter</label>
            <select className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 mb-4">
              <option value="all">All Categories</option>
              <option value="credit-tips">Credit Tips</option>
              <option value="credit-repair">Credit Repair</option>
              <option value="financial-wellness">Financial Wellness</option>
            </select>

            <p className="text-xs text-gray-500">
              💡 Blog posts are automatically loaded from your CMS
            </p>
          </div>
        )}

        {/* Styling Options */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Styling</h4>

          {/* Text Color */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 rounded border"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          {/* Background Color */}
          {selectedElement.type !== 'image' && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
              </div>
            </div>
          )}

          {/* Font Size */}
          {selectedElement.type !== 'image' && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="12px">12px - Small</option>
                <option value="14px">14px - Normal</option>
                <option value="16px">16px - Medium</option>
                <option value="18px">18px - Large</option>
                <option value="24px">24px - X-Large</option>
                <option value="32px">32px - XX-Large</option>
                <option value="48px">48px - Huge</option>
              </select>
            </div>
          )}

          {/* Font Weight */}
          {selectedElement.type !== 'image' && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => handleFontWeightChange(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="300">Light</option>
                <option value="normal">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi-Bold</option>
                <option value="bold">Bold</option>
                <option value="800">Extra-Bold</option>
              </select>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            💡 Tip: Click on different elements on the page to edit them. Changes are applied in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplePropertiesPanel;
