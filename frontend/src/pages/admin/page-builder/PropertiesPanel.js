import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../utils/api';
import EmojiPicker from '../../../components/EmojiPicker';

const PropertiesPanel = ({ component, onUpdate, onClose }) => {
  const [props, setProps] = useState(component.props || {});
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    if (component.type === 'image' || component.type === 'video') {
      loadMediaLibrary();
    }
    if (component.type === 'blog_list') {
      loadCategories();
    }
  }, [component.type]);

  const loadMediaLibrary = async () => {
    try {
      const response = await api.get('/media');
      setMediaLibrary(response.data);
    } catch (err) {
      console.error('Error loading media:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handlePropChange = (key, value) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onUpdate({ props: newProps });
  };

  const handleStyleChange = (key, value) => {
    const newStyle = { ...(props.style || {}), [key]: value };
    const newProps = { ...props, style: newStyle };
    setProps(newProps);
    onUpdate({ props: newProps });
  };

  const renderPropertiesForType = () => {
    switch (component.type) {
      case 'heading':
        return (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Content</label>
                <EmojiPicker
                  onSelect={(emoji) => {
                    const currentContent = props.content || '';
                    handlePropChange('content', currentContent + emoji);
                  }}
                />
              </div>
              <input
                type="text"
                value={props.content || ''}
                onChange={(e) => handlePropChange('content', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Level</label>
              <select
                value={props.level || 'h2'}
                onChange={(e) => handlePropChange('level', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
              </select>
            </div>
          </>
        );

      case 'text':
        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Content</label>
              <EmojiPicker
                onSelect={(emoji) => {
                  const currentContent = props.content || '';
                  handlePropChange('content', currentContent + emoji);
                }}
              />
            </div>
            <textarea
              value={props.content || ''}
              onChange={(e) => handlePropChange('content', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'image':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="text"
                value={props.src || ''}
                onChange={(e) => handlePropChange('src', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowMediaPicker(!showMediaPicker)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Or select from Media Library
              </button>
            </div>
            {showMediaPicker && mediaLibrary.length > 0 && (
              <div className="mb-4 max-h-64 overflow-y-auto border rounded p-2">
                <div className="grid grid-cols-2 gap-2">
                  {mediaLibrary.filter(m => m.type === 'image').map((media) => (
                    <img
                      key={media.id}
                      src={media.url}
                      alt={media.alt_text}
                      className="w-full h-24 object-cover rounded cursor-pointer hover:ring-2 ring-blue-500"
                      onClick={() => {
                        handlePropChange('src', media.url);
                        handlePropChange('alt', media.alt_text);
                        setShowMediaPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => handlePropChange('alt', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );

      case 'button':
        return (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Button Text</label>
                <EmojiPicker
                  onSelect={(emoji) => {
                    const currentText = props.text || '';
                    handlePropChange('text', currentText + emoji);
                  }}
                />
              </div>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Link URL</label>
              <input
                type="text"
                value={props.link || ''}
                onChange={(e) => handlePropChange('link', e.target.value)}
                placeholder="https://... or /page"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={props.style?.backgroundColor || '#3B82F6'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full h-10 rounded"
              />
            </div>
          </>
        );

      case 'blog_list':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Number of Posts</label>
              <input
                type="number"
                value={props.limit || 3}
                onChange={(e) => handlePropChange('limit', parseInt(e.target.value))}
                min={1}
                max={20}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Layout Style</label>
              <select
                value={props.layout || 'grid'}
                onChange={(e) => handlePropChange('layout', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="carousel">Carousel</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category Filter</label>
              <select
                value={props.category || 'all'}
                onChange={(e) => handlePropChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Columns (Grid Layout)</label>
              <select
                value={props.columns || '3'}
                onChange={(e) => handlePropChange('columns', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Column</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
                <option value="5">5 Columns</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_excerpt !== false}
                  onChange={(e) => handlePropChange('show_excerpt', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Excerpt</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_image !== false}
                  onChange={(e) => handlePropChange('show_image', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Featured Image</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_date !== false}
                  onChange={(e) => handlePropChange('show_date', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Date</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_author !== false}
                  onChange={(e) => handlePropChange('show_author', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Author</span>
              </label>
            </div>
          </>
        );

      case 'review_list':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Number of Reviews</label>
              <input
                type="number"
                value={props.limit || 3}
                onChange={(e) => handlePropChange('limit', parseInt(e.target.value))}
                min={1}
                max={20}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Layout</label>
              <select
                value={props.layout || 'grid'}
                onChange={(e) => handlePropChange('layout', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel (Animated)</option>
                <option value="list">List</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Columns (Grid Layout)</label>
              <select
                value={props.columns || '3'}
                onChange={(e) => handlePropChange('columns', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Column</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
                <option value="5">5 Columns</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Source Filter</label>
              <select
                value={props.source_filter || 'all'}
                onChange={(e) => handlePropChange('source_filter', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Reviews</option>
                <option value="customer">Customer Reviews</option>
                <option value="competitor">Competitor Reviews</option>
                <option value="lexington-law">Lexington Law</option>
                <option value="credit-saint">Credit Saint</option>
                <option value="sky-blue">Sky Blue Credit</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.featured || false}
                  onChange={(e) => handlePropChange('featured', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Featured Only</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_ratings !== false}
                  onChange={(e) => handlePropChange('show_ratings', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Star Ratings</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_image !== false}
                  onChange={(e) => handlePropChange('show_image', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Client Photos</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.show_score_improvement !== false}
                  onChange={(e) => handlePropChange('show_score_improvement', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Score Improvement</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.auto_play || false}
                  onChange={(e) => handlePropChange('auto_play', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Auto-Play Animation (Carousel)</span>
              </label>
            </div>
          </>
        );

      default:
        return <p className="text-sm text-gray-500">No properties available for this component.</p>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Properties</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Component Type</p>
          <p className="font-medium">{component.type}</p>
        </div>

        {renderPropertiesForType()}

        {/* Text Styling - for text, heading, button components */}
        {['text', 'heading', 'button', 'blog_list', 'review_list'].includes(component.type) && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-3">Text Styling</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                <input
                  type="color"
                  value={props.style?.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                <select
                  value={props.style?.fontFamily || 'inherit'}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="inherit">Default</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Georgia', serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Helvetica', sans-serif">Helvetica</option>
                  <option value="'Verdana', sans-serif">Verdana</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <input
                  type="text"
                  value={props.style?.fontSize || ''}
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                  placeholder="16px"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                <select
                  value={props.style?.fontWeight || 'normal'}
                  onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="300">Light</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi-Bold</option>
                  <option value="700">Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Text Align</label>
                <select
                  value={props.style?.textAlign || 'left'}
                  onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Spacing */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-3">Spacing & Layout</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Margin Top</label>
              <input
                type="text"
                value={props.style?.marginTop || ''}
                onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                placeholder="0px"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Margin Bottom</label>
              <input
                type="text"
                value={props.style?.marginBottom || ''}
                onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                placeholder="0px"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Padding</label>
              <input
                type="text"
                value={props.style?.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="0px"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Background</label>
              <input
                type="color"
                value={props.style?.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full h-8 rounded"
              />
            </div>
          </div>
        </div>

        {/* Border & Shadow */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-3">Border & Effects</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
              <input
                type="text"
                value={props.style?.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                placeholder="0px"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Box Shadow</label>
              <select
                value={props.style?.boxShadow || 'none'}
                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                <option value="none">None</option>
                <option value="0 1px 3px rgba(0,0,0,0.1)">Small</option>
                <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                <option value="0 20px 25px rgba(0,0,0,0.15)">Extra Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
