import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Newspaper, Megaphone, Filter, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';

const PressReleasesList = () => {
  const navigate = useNavigate();
  const [pressReleases, setPressReleases] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, press_releases, announcements
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [pressReleases, announcements, searchTerm, activeTab]);

  const fetchData = async () => {
    try {
      const [prResponse, annResponse] = await Promise.all([
        api.get('/admin/press-releases'),
        api.get('/admin/announcements')
      ]);
      setPressReleases(prResponse.data.map(item => ({ ...item, itemType: 'press_release' })));
      setAnnouncements(annResponse.data.map(item => ({ ...item, itemType: 'announcement' })));
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let items = [];
    
    if (activeTab === 'all' || activeTab === 'press_releases') {
      items = [...items, ...pressReleases];
    }
    if (activeTab === 'all' || activeTab === 'announcements') {
      items = [...items, ...announcements];
    }

    if (searchTerm) {
      items = items.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by publish date descending
    items.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

    setFilteredItems(items);
  };

  const handleDelete = async (item) => {
    const type = item.itemType === 'press_release' ? 'press release' : 'announcement';
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const endpoint = item.itemType === 'press_release' 
        ? `/admin/press-releases/${item.id}`
        : `/admin/announcements/${item.id}`;
      await api.delete(endpoint);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
      console.error(error);
    }
  };

  const handleTogglePublished = async (item) => {
    try {
      const endpoint = item.itemType === 'press_release'
        ? `/admin/press-releases/${item.id}/toggle`
        : `/admin/announcements/${item.id}/toggle`;
      await api.patch(endpoint);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeLabel = (item) => {
    if (item.itemType === 'press_release') {
      return { label: 'Press Release', color: 'bg-blue-100 text-blue-700', icon: Newspaper };
    }
    const typeLabels = {
      general: { label: 'Announcement', color: 'bg-purple-100 text-purple-700' },
      promotion: { label: 'Promotion', color: 'bg-yellow-100 text-yellow-700' },
      acquisition: { label: 'Acquisition', color: 'bg-green-100 text-green-700' },
      product: { label: 'New Product', color: 'bg-cyan-100 text-cyan-700' },
      service: { label: 'New Service', color: 'bg-indigo-100 text-indigo-700' },
      partnership: { label: 'Partnership', color: 'bg-pink-100 text-pink-700' }
    };
    return { 
      ...typeLabels[item.announcement_type] || typeLabels.general,
      icon: Megaphone 
    };
  };

  const handleCreateNew = (type) => {
    setShowCreateModal(false);
    if (type === 'press_release') {
      navigate('/admin/press-releases/new?type=press_release');
    } else {
      navigate('/admin/press-releases/new?type=announcement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Press Releases & Announcements</h1>
          <p className="text-gray-600 mt-1">Manage company news, announcements, and press releases</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          data-testid="create-new-btn"
        >
          <Plus size={20} />
          Create New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({pressReleases.length + announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('press_releases')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'press_releases' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Newspaper size={18} />
          Press Releases ({pressReleases.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'announcements' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Megaphone size={18} />
          Announcements ({announcements.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search press releases and announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Create your first press release or announcement'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)} variant="outline">
              Create your first item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const typeInfo = getTypeLabel(item);
            const TypeIcon = typeInfo.icon;
            
            return (
              <div
                key={`${item.itemType}-${item.id}`}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                data-testid={`item-card-${item.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${typeInfo.color}`}>
                        <TypeIcon size={12} />
                        {typeInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                      {item.related_employees?.length > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                          <Users size={12} />
                          {item.related_employees.length} Employee{item.related_employees.length > 1 ? 's' : ''} Linked
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>

                    <div className="mb-3 text-sm text-gray-500">
                      Published: {formatDate(item.publish_date)}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.excerpt}</p>

                    {item.featured_image && (
                      <div className="mt-3">
                        <img
                          src={item.featured_image}
                          alt={item.title}
                          className="h-32 w-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleTogglePublished(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title={item.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {item.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => navigate(
                        item.itemType === 'press_release'
                          ? `/admin/press-releases/${item.id}?type=press_release`
                          : `/admin/press-releases/${item.id}?type=announcement`
                      )}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New</DialogTitle>
            <DialogDescription>
              Choose what type of content you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <button
              onClick={() => handleCreateNew('press_release')}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
              data-testid="create-press-release-btn"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <Newspaper className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Press Release</h3>
                <p className="text-sm text-gray-500">Official company news for media outlets</p>
              </div>
            </button>
            <button
              onClick={() => handleCreateNew('announcement')}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition text-left"
              data-testid="create-announcement-btn"
            >
              <div className="p-3 bg-purple-100 rounded-lg">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Announcement</h3>
                <p className="text-sm text-gray-500">Company updates, promotions, acquisitions, new products</p>
              </div>
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PressReleasesList;
