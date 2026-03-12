import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';

const ComponentRenderer = ({ component }) => {
  const [dynamicData, setDynamicData] = useState(null);

  useEffect(() => {
    if (component.type === 'blog_list') {
      loadBlogs();
    } else if (component.type === 'review_list') {
      loadReviews();
    }
  }, [component.type, component.props]);

  const loadBlogs = async () => {
    try {
      const params = { status: 'published', limit: component.props.limit || 3 };
      if (component.props.category && component.props.category !== 'all') {
        params.category = component.props.category;
      }
      const response = await api.get('/blog/posts', { params });
      setDynamicData(response.data);
    } catch (err) {
      console.error('Error loading blogs:', err);
    }
  };

  const loadReviews = async () => {
    try {
      const params = { limit: component.props.limit || 3 };
      if (component.props.featured) {
        params.featured = true;
      }
      const response = await api.get('/reviews', { params });
      setDynamicData(response.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const renderComponent = () => {
    const props = component.props || {};
    const style = props.style || {};

    switch (component.type) {
      case 'heading':
        return React.createElement(
          props.level || 'h2',
          { style, className: 'font-bold' },
          props.content || 'New Heading'
        );

      case 'text':
        return (
          <div style={style} className="text-gray-700">
            {props.content || 'New text block. Click to edit.'}
          </div>
        );

      case 'image':
        return props.src ? (
          <img
            src={props.src}
            alt={props.alt || ''}
            style={style}
            className="max-w-full h-auto rounded"
          />
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-500">
            No image selected. Click to add image.
          </div>
        );

      case 'video':
        return props.src ? (
          <video src={props.src} controls style={style} className="max-w-full h-auto rounded" />
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-500">
            No video selected. Click to add video.
          </div>
        );

      case 'button':
        return (
          <button style={style} className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            {props.text || 'Click Me'}
          </button>
        );

      case 'blog_list':
        return (
          <div style={style}>
            <h3 className="text-2xl font-bold mb-4">Latest Blog Posts</h3>
            {dynamicData ? (
              <div className="grid gap-4">
                {dynamicData.slice(0, props.limit || 3).map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                    <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Loading blog posts...</p>
            )}
          </div>
        );

      case 'review_list':
        return (
          <div style={style}>
            <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
            {dynamicData ? (
              <div className="grid gap-4">
                {dynamicData.slice(0, props.limit || 3).map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.customer_name}</span>
                      <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{review.review_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Loading reviews...</p>
            )}
          </div>
        );

      case 'section':
        return (
          <div style={style} className="border-2 border-dashed border-gray-300 rounded p-6">
            <p className="text-gray-500 text-center">Section Container - Drop components here</p>
          </div>
        );

      default:
        return <div className="text-gray-500">Unknown component: {component.type}</div>;
    }
  };

  return renderComponent();
};

export default ComponentRenderer;
