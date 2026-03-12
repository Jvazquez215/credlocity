import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Newspaper, Calendar, FileText, Scale } from 'lucide-react';

const PressReleaseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState(null);
  const [relatedBlogPosts, setRelatedBlogPosts] = useState([]);
  const [relatedLawsuits, setRelatedLawsuits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPressRelease();
  }, [slug]);

  const fetchPressRelease = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/press-releases/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setRelease(data);
        
        // Fetch related content
        if (data.related_blog_posts && data.related_blog_posts.length > 0) {
          fetchRelatedBlogPosts(data.related_blog_posts);
        }
        if (data.related_lawsuits && data.related_lawsuits.length > 0) {
          fetchRelatedLawsuits(data.related_lawsuits);
        }
      } else {
        navigate('/press-releases');
      }
    } catch (error) {
      console.error('Error fetching press release:', error);
      navigate('/press-releases');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogPosts = async (postIds) => {
    try {
      const posts = await Promise.all(
        postIds.map(async (id) => {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/posts/${id}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        })
      );
      setRelatedBlogPosts(posts.filter(p => p !== null));
    } catch (error) {
      console.error('Error fetching related blog posts:', error);
    }
  };

  const fetchRelatedLawsuits = async (lawsuitIds) => {
    try {
      // Fetch all lawsuits from public endpoint
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuits`);
      if (response.ok) {
        const allLawsuits = await response.json();
        // Filter to only the ones in our related_lawsuits array
        const related = allLawsuits.filter(lawsuit => lawsuitIds.includes(lawsuit.id));
        setRelatedLawsuits(related);
      }
    } catch (error) {
      console.error('Error fetching related lawsuits:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading press release...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!release) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{release.meta_title || `${release.title} - Credlocity`}</title>
        <meta name="description" content={release.meta_description || release.excerpt} />
        {release.meta_keywords && release.meta_keywords.length > 0 && (
          <meta name="keywords" content={release.meta_keywords.join(', ')} />
        )}
        {release.schema_data && Object.keys(release.schema_data).length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(release.schema_data)}
          </script>
        )}
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/press-releases')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Press Releases
          </button>

          {/* Main Content */}
          <article className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Newspaper className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar size={16} />
                  {formatDate(release.publish_date)}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {release.title}
                </h1>
                <p className="text-xl text-gray-600">{release.excerpt}</p>
              </div>
            </div>

            {/* Featured Image */}
            {release.featured_image && (
              <div className="mb-8">
                <img
                  src={release.featured_image}
                  alt={release.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Related Content - Show BEFORE the press release content */}
            {(relatedLawsuits.length > 0 || relatedBlogPosts.length > 0) && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Related Content</h2>
                
                {/* Related Lawsuits */}
                {relatedLawsuits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span>⚖️</span> Related Lawsuits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedLawsuits.map((lawsuit) => (
                        <div
                          key={lawsuit.id}
                          onClick={() => navigate(`/lawsuits/${lawsuit.slug}`)}
                          className="group bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl hover:border-amber-500 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-700 transition">
                              <span className="text-white text-3xl">⚖️</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">Lawsuit</p>
                              <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition mb-2 line-clamp-2">
                                {lawsuit.title}
                              </h3>
                              {lawsuit.brief_description && (
                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                  {lawsuit.brief_description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Case #{lawsuit.case_number}
                                </span>
                                <span className="text-sm text-amber-700 font-semibold group-hover:underline">
                                  Read the Lawsuit →
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Blog Posts */}
                {relatedBlogPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📝</span> Related Articles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedBlogPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => navigate(`/blog/${post.slug}`)}
                          className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            {post.featured_image_url ? (
                              <img 
                                src={post.featured_image_url} 
                                alt={post.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition">
                                <span className="text-white text-3xl">📝</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Blog Article</p>
                              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
                                {post.title}
                              </h3>
                              {post.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {post.excerpt}
                                </p>
                              )}
                              <span className="text-sm text-blue-600 font-semibold group-hover:underline">
                                Read Article →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: release.content }}
            />

            {/* Related content now appears above the press release content */}
          </article>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PressReleaseDetail;
