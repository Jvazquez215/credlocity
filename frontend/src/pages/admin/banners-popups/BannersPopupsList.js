import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Bell, MessageSquare } from 'lucide-react';
import api from '../../../utils/api';

const BannersPopupsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, banner, popup

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/banners-popups');
      setItems(response.data);
    } catch (err) {
      console.error('Error loading banners/popups:', err);
      alert('Error loading items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/banners-popups/${id}/toggle`);
      loadItems();
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    
    try {
      await api.delete(`/admin/banners-popups/${id}`);
      loadItems();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting item');
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Banners & Popups</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners and popups</p>
        </div>
        <Link
          to="/admin/banners-popups/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter('banner')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            filter === 'banner'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Banners ({items.filter(i => i.type === 'banner').length})
        </button>
        <button
          onClick={() => setFilter('popup')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            filter === 'popup'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Popups ({items.filter(i => i.type === 'popup').length})
        </button>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No {filter === 'all' ? 'items' : filter + 's'} found</p>
          <Link
            to="/admin/banners-popups/new"
            className="text-blue-600 hover:underline"
          >
            Create your first {filter === 'all' ? 'banner or popup' : filter}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${
                    item.type === 'banner' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {item.type === 'banner' ? (
                      <Bell className={`w-6 h-6 ${item.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                    ) : (
                      <MessageSquare className={`w-6 h-6 ${item.is_active ? 'text-purple-600' : 'text-gray-400'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        item.type === 'banner'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                      {item.is_active ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.content}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Position: <strong>{item.position || item.trigger}</strong></span>
                      {item.display_pages.length > 0 && (
                        <span>Pages: <strong>{item.display_pages.length} specific</strong></span>
                      )}
                      {item.display_pages.length === 0 && (
                        <span>Pages: <strong>All pages</strong></span>
                      )}
                      {item.delay > 0 && (
                        <span>Delay: <strong>{item.delay}s</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`p-2 rounded hover:bg-gray-100 ${
                      item.is_active ? 'text-green-600' : 'text-gray-400'
                    }`}
                    title={item.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {item.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <Link
                    to={`/admin/banners-popups/edit/${item.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannersPopupsList;
