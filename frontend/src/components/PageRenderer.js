import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Universal Page Renderer - Renders any page built with the visual page builder
 * Dynamically renders components based on layout_data
 */
const PageRenderer = ({ components = [], settings = {} }) => {
  if (!components || components.length === 0) {
    return null; // Return null if no components (fallback to static content)
  }

  const renderComponent = (component) => {
    const { id, type, props = {}, order } = component;
    const style = props.style || {};

    switch (type) {
      case 'heading':
        const HeadingTag = props.level || 'h2';
        return (
          <HeadingTag
            key={id}
            style={style}
            className="my-4"
          >
            {props.content}
          </HeadingTag>
        );

      case 'text':
        return (
          <div
            key={id}
            style={style}
            className="my-4"
            dangerouslySetInnerHTML={{ __html: props.content }}
          />
        );

      case 'image':
        return (
          <div key={id} style={style} className="my-4">
            {props.src && (
              <img
                src={props.src}
                alt={props.alt || ''}
                className="max-w-full h-auto"
                style={{ ...style }}
              />
            )}
          </div>
        );

      case 'button':
        const isExternal = props.link?.startsWith('http');
        return (
          <div key={id} style={style} className="my-4">
            {isExternal ? (
              <a
                href={props.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded font-semibold hover:opacity-90 transition"
                style={{
                  backgroundColor: style.backgroundColor || '#3B82F6',
                  color: style.color || '#ffffff',
                  ...style
                }}
              >
                {props.text}
              </a>
            ) : (
              <Link
                to={props.link || '#'}
                className="inline-block px-6 py-3 rounded font-semibold hover:opacity-90 transition"
                style={{
                  backgroundColor: style.backgroundColor || '#3B82F6',
                  color: style.color || '#ffffff',
                  ...style
                }}
              >
                {props.text}
              </Link>
            )}
          </div>
        );

      case 'video':
        return (
          <div key={id} style={style} className="my-4">
            {props.src && (
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={props.src}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded"
                />
              </div>
            )}
          </div>
        );

      case 'blog_list':
        return (
          <BlogListRenderer key={id} props={props} style={style} />
        );

      case 'review_list':
        return (
          <ReviewListRenderer key={id} props={props} style={style} />
        );

      case 'section':
        return (
          <section key={id} style={style} className="my-6">
            {props.children?.map(child => renderComponent(child))}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div style={settings}>
      {components
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(component => renderComponent(component))}
    </div>
  );
};

// Blog List Renderer Component
const BlogListRenderer = ({ props, style }) => {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || ''}/api/blog/posts?status=published&limit=${props.limit || 3}${
            props.category && props.category !== 'all' ? `&category=${props.category}` : ''
          }`
        );
        const data = await response.json();
        setPosts(data.slice(0, props.limit || 3));
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [props.limit, props.category]);

  if (loading) return <div className="text-center py-8">Loading posts...</div>;
  if (posts.length === 0) return null;

  const gridCols = {
    '1': 'grid-cols-1',
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
    '5': 'md:grid-cols-5'
  };

  return (
    <div style={style} className="my-8">
      <div className={`grid ${gridCols[props.columns || '3']} gap-6`}>
        {posts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
          >
            {props.show_image !== false && post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
              {props.show_excerpt !== false && post.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-2">{post.excerpt}</p>
              )}
              {props.show_date !== false && post.publish_date && (
                <p className="text-xs text-gray-500">
                  {new Date(post.publish_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Review List Renderer Component
const ReviewListRenderer = ({ props, style }) => {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const params = new URLSearchParams();
        if (props.featured) params.append('featured_on_homepage', 'true');
        if (props.source_filter && props.source_filter !== 'all') {
          params.append('source', props.source_filter);
        }
        
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || ''}/api/reviews?${params.toString()}`
        );
        const data = await response.json();
        setReviews(data.slice(0, props.limit || 3));
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [props.limit, props.featured, props.source_filter]);

  if (loading) return <div className="text-center py-8">Loading reviews...</div>;
  if (reviews.length === 0) return null;

  const gridCols = {
    '1': 'grid-cols-1',
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
    '5': 'md:grid-cols-5'
  };

  return (
    <div style={style} className="my-8">
      <div className={`grid ${gridCols[props.columns || '3']} gap-6`}>
        {reviews.map(review => (
          <div key={review.id} className="bg-gray-50 p-6 rounded-xl">
            {props.show_ratings !== false && (
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
            )}
            <p className="text-gray-700 mb-3 italic">"{review.testimonial_text}"</p>
            <p className="font-semibold">- {review.client_name}</p>
            {props.show_score_improvement !== false && review.points_improved && (
              <p className="text-green-600 font-bold mt-2">+{review.points_improved} points!</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageRenderer;
