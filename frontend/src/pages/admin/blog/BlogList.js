import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Pencil, Trash2, Copy, Eye, Plus, Upload } from 'lucide-react';

const BlogList = () => {
  console.log('BlogList component rendered');
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/blog/posts/all?${params.toString()}`);
      setPosts(response.data.posts || response.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load blog posts');
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
      setCategories([]);
    }
  };

  const handleDelete = async (postId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/blog/posts/${postId}`);
      alert('Blog post deleted successfully');
      fetchPosts();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete blog post');
    }
  };

  const handleDuplicate = async (post) => {
    try {
      const newPost = {
        ...post,
        title: `${post.title} (Copy)`,
        slug: `${post.slug}-copy-${Date.now()}`,
        status: 'draft',
        publish_date: null
      };
      
      delete newPost.id;
      delete newPost.created_at;
      delete newPost.updated_at;
      delete newPost.view_count;

      await api.post('/blog/posts', newPost);
      alert('Blog post duplicated successfully');
      fetchPosts();
    } catch (err) {
      console.error('Duplicate error:', err);
      alert('Failed to duplicate blog post');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">Blog Management</h1>
        <p className="text-gray-600">Manage your blog posts, categories, and tags</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              fetchPosts();
            }}
            className="mt-2 text-red-600 hover:underline text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/blog/create')}
          className="flex items-center gap-2 bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Create New Post
        </button>
        <button
          onClick={() => navigate('/admin/blog/import')}
          className="flex items-center gap-2 bg-secondary-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Upload className="w-5 h-5" />
          Import Existing Post
        </button>
        <button
          onClick={() => navigate('/admin/blog/categories')}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Manage Categories
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading blog posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No blog posts found</p>
            <button
              onClick={() => navigate('/admin/blog/create')}
              className="text-primary-blue hover:underline"
            >
              Create your first blog post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div>
                          <p className="font-medium text-gray-900">{post.title}</p>
                          <p className="text-sm text-gray-500 mt-1">/blog/{post.slug}</p>
                          {post.featured_post && (
                            <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {post.author_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(post.publish_date || post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {post.view_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <button
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View Post"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(post)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && posts.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {posts.length} blog post{posts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default BlogList;
