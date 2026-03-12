import React, { useState, useEffect } from 'react';
import { Link2, Plus, X, ExternalLink } from 'lucide-react';
import api from '../utils/api';

const RelatedContentManager = ({ relatedData = {}, onChange, currentPostId = null }) => {
  const [localData, setLocalData] = useState({
    related_posts: [],
    related_topics: [],
    related_pages: [],
    ...relatedData
  });

  const [allPosts, setAllPosts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageForm, setPageForm] = useState({ url: '', title: '', description: '' });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    onChange(localData);
  }, [localData]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/blog/posts?status=published');
      // Filter out current post
      const posts = response.data.filter(p => p.id !== currentPostId);
      setAllPosts(posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setAllCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddRelatedPost = (postId) => {
    if (postId && !localData.related_posts.includes(postId)) {
      setLocalData(prev => ({
        ...prev,
        related_posts: [...prev.related_posts, postId]
      }));
    }
  };

  const handleRemoveRelatedPost = (postId) => {
    setLocalData(prev => ({
      ...prev,
      related_posts: prev.related_posts.filter(id => id !== postId)
    }));
  };

  const handleAddRelatedTopic = (topicId) => {
    if (topicId && !localData.related_topics.includes(topicId)) {
      setLocalData(prev => ({
        ...prev,
        related_topics: [...prev.related_topics, topicId]
      }));
    }
  };

  const handleRemoveRelatedTopic = (topicId) => {
    setLocalData(prev => ({
      ...prev,
      related_topics: prev.related_topics.filter(id => id !== topicId)
    }));
  };

  const handleAddRelatedPage = () => {
    if (!pageForm.url.trim() || !pageForm.title.trim()) {
      alert('URL and title are required');
      return;
    }
    setLocalData(prev => ({
      ...prev,
      related_pages: [...prev.related_pages, pageForm]
    }));
    setPageForm({ url: '', title: '', description: '' });
    setShowPageForm(false);
  };

  const handleRemoveRelatedPage = (index) => {
    setLocalData(prev => ({
      ...prev,
      related_pages: prev.related_pages.filter((_, i) => i !== index)
    }));
  };

  const getPostTitle = (postId) => {
    const post = allPosts.find(p => p.id === postId);
    return post ? post.title : 'Unknown Post';
  };

  const getCategoryName = (categoryId) => {
    const category = allCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Related Content & Interlinking</h4>
            <p className="text-sm text-blue-800">
              Connect this article to related blogs, topics, and pages. Related content appears at the bottom of articles
              and helps readers discover more information while improving SEO through internal linking.
            </p>
          </div>
        </div>
      </div>

      {/* Related Blog Posts */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-gray-900 mb-3">Related Blog Posts</h4>
        <p className="text-sm text-gray-600 mb-4">
          Manually select specific blog posts to recommend to readers
        </p>
        
        <select
          onChange={(e) => {
            handleAddRelatedPost(e.target.value);
            e.target.value = '';
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a blog post to add...</option>
          {allPosts
            .filter(post => !localData.related_posts.includes(post.id))
            .map(post => (
              <option key={post.id} value={post.id}>{post.title}</option>
            ))
          }
        </select>

        {localData.related_posts.length > 0 && (
          <div className="space-y-2">
            {localData.related_posts.map((postId) => (
              <div key={postId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{getPostTitle(postId)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRelatedPost(postId)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Topics (Auto Cross-Linking) */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-gray-900 mb-3">Related Topics (Auto Cross-Linking)</h4>
        <p className="text-sm text-gray-600 mb-4">
          Select topics/categories - ALL posts in these topics will automatically show this post as related
        </p>
        
        <select
          onChange={(e) => {
            handleAddRelatedTopic(e.target.value);
            e.target.value = '';
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a topic to add...</option>
          {allCategories
            .filter(cat => !localData.related_topics.includes(cat.id))
            .map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))
          }
        </select>

        {localData.related_topics.length > 0 && (
          <div className="space-y-2">
            {localData.related_topics.map((topicId) => (
              <div key={topicId} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{getCategoryName(topicId)}</span>
                  <p className="text-xs text-gray-600 mt-1">All posts in this category will link to this article</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRelatedTopic(topicId)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Pages (Custom Links) */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">Related Pages</h4>
            <p className="text-sm text-gray-600 mt-1">
              Link to credit issue pages or any page on your site
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPageForm(!showPageForm)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Custom Page
          </button>
        </div>

        {/* Quick Add Credit Issue Pages */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">Quick Add Credit Issue Pages:</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                const pages = {
                  'collection-removal': { url: '/collection-removal', title: 'Collection Removal', description: 'FDCPA violations and debt validation strategies' },
                  'late-payment-removal': { url: '/late-payment-removal', title: 'Late Payment Removal', description: 'Goodwill letters and FCBA disputes' },
                  'charge-off-removal': { url: '/charge-off-removal', title: 'Charge-Off Removal', description: 'Verification disputes and creditor negotiations' },
                  'bankruptcy-credit-repair': { url: '/bankruptcy-credit-repair', title: 'Bankruptcy Credit Repair', description: 'Chapter 7 & 13 recovery strategies' },
                  'identity-theft-credit-repair': { url: '/identity-theft-credit-repair', title: 'Identity Theft Resolution', description: 'FCRA 605B credit block process' },
                  'hard-inquiry-removal': { url: '/hard-inquiry-removal', title: 'Hard Inquiry Removal', description: 'Unauthorized inquiry disputes' }
                };
                const page = pages[e.target.value];
                if (page && !localData.related_pages.some(p => p.url === page.url)) {
                  setLocalData(prev => ({
                    ...prev,
                    related_pages: [...prev.related_pages, page]
                  }));
                }
                e.target.value = '';
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select a credit issue page...</option>
            <option value="collection-removal">Collection Removal</option>
            <option value="late-payment-removal">Late Payment Removal</option>
            <option value="charge-off-removal">Charge-Off Removal</option>
            <option value="bankruptcy-credit-repair">Bankruptcy Credit Repair</option>
            <option value="identity-theft-credit-repair">Identity Theft Resolution</option>
            <option value="hard-inquiry-removal">Hard Inquiry Removal</option>
          </select>
        </div>

        {showPageForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Page URL (e.g., /pricing)"
              value={pageForm.url}
              onChange={(e) => setPageForm({...pageForm, url: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Page Title (e.g., Our Pricing Plans)"
              value={pageForm.title}
              onChange={(e) => setPageForm({...pageForm, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Description (optional)"
              value={pageForm.description}
              onChange={(e) => setPageForm({...pageForm, description: e.target.value})}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddRelatedPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Page
              </button>
              <button
                type="button"
                onClick={() => setShowPageForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {localData.related_pages.length > 0 && (
          <div className="space-y-2">
            {localData.related_pages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{page.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{page.url}</p>
                  {page.description && (
                    <p className="text-xs text-gray-500 mt-1">{page.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRelatedPage(index)}
                  className="text-red-600 hover:text-red-700 ml-3"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedContentManager;
