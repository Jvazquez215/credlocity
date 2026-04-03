import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Rss } from 'lucide-react';
import api from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/blog/posts?${params.toString()}`);
      setPosts(response.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = {};
    if (searchQuery) newParams.search = searchQuery;
    if (selectedCategory) newParams.category = selectedCategory;
    setSearchParams(newParams);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <>
      <Helmet>
        <title>Credit Repair Blog - Expert Tips & Guides | Credlocity</title>
        <meta name="description" content="Learn how to improve your credit score with expert tips, guides, and strategies from Credlocity's credit repair blog." />
        <meta name="keywords" content="credit repair, credit score, FICO, credit tips, credit education" />
        <link rel="canonical" href="https://credlocity.com/blog" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Credit Repair Blog - Expert Tips & Guides | Credlocity" />
        <meta property="og:description" content="Learn how to improve your credit score with expert tips and strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://credlocity.com/blog" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Repair Blog | Credlocity" />
        <meta name="twitter:description" content="Expert credit repair tips and guides" />
      </Helmet>

      <Header />
      
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-blue to-blue-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4 text-center">
              Credlocity Blog
            </h1>
            <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto mb-6">
              Expert credit repair tips, guides, and strategies to help you improve your credit score and achieve financial freedom
            </p>
            <div className="flex justify-center">
              <a
                href={`${process.env.REACT_APP_BACKEND_URL}/api/rss.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm"
                title="Subscribe via RSS"
              >
                <Rss size={16} />
                RSS Feed
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                {/* Search */}
                <div className="mb-8">
                  <h3 className="font-cinzel text-xl font-bold text-primary-blue mb-4">Search</h3>
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="w-full mt-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-cinzel text-xl font-bold text-primary-blue mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryFilter('')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        !selectedCategory
                          ? 'bg-primary-blue text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      All Posts ({posts.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryFilter(cat.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                          selectedCategory === cat.id
                            ? 'bg-primary-blue text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cat.name} ({cat.post_count || 0})
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 bg-gradient-to-br from-secondary-green to-green-600 rounded-xl p-6 text-white">
                  <h4 className="font-cinzel font-bold text-lg mb-2">Need Help?</h4>
                  <p className="text-sm mb-4">Get professional credit repair assistance</p>
                  <Link
                    to="/pricing"
                    className="block w-full bg-white text-secondary-green text-center px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:w-3/4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                  <p className="text-gray-600 mt-4">Loading articles...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">No blog posts found</p>
                  {(selectedCategory || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSearchQuery('');
                        setSearchParams({});
                      }}
                      className="text-primary-blue hover:underline"
                    >
                      Clear filters and show all posts
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                      {/* Featured Image */}
                      {post.featured_image_url && (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.featured_image_alt || post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}

                      <div className="p-6">
                        {/* Category Badge */}
                        {post.categories && post.categories.length > 0 && (
                          <div className="mb-3">
                            <span className="inline-block bg-primary-blue text-white text-xs px-3 py-1 rounded-full">
                              {categories.find(c => c.id === post.categories[0])?.name || 'Blog'}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-blue transition">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt || stripHtml(post.content).substring(0, 150) + '...'}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{post.author_name}</span>
                          <span>{formatDate(post.publish_date || post.created_at)}</span>
                        </div>

                        {/* Read More */}
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-primary-blue font-medium hover:text-blue-700 transition"
                        >
                          Read Full Article
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BlogHub;
