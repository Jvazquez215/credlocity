import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';

const LegalPagesList = () => {
  const navigate = useNavigate();
  const [legalPages, setLegalPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLegalPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [legalPages, searchTerm]);

  const fetchLegalPages = async () => {
    try {
      const response = await api.get('/admin/legal-pages');
      setLegalPages(response.data);
    } catch (error) {
      toast.error('Failed to fetch legal pages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...legalPages];

    if (searchTerm) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPages(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this legal page?')) return;

    try {
      await api.delete(`/admin/legal-pages/${id}`);
      toast.success('Legal page deleted successfully');
      fetchLegalPages();
    } catch (error) {
      toast.error('Failed to delete legal page');
      console.error(error);
    }
  };

  const handleTogglePublished = async (id) => {
    try {
      await api.patch(`/admin/legal-pages/${id}/toggle`);
      toast.success('Legal page status updated');
      fetchLegalPages();
    } catch (error) {
      toast.error('Failed to update legal page status');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading legal pages...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Legal & Policies</h1>
          <p className="text-gray-600 mt-1">Manage legal pages and policies</p>
        </div>
        <button
          onClick={() => navigate('/admin/legal-pages/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search legal pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Legal Pages List */}
      {filteredPages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📜</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No legal pages found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Create your first legal page'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/admin/legal-pages/new')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first legal page
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{page.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      page.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    Last Updated: {formatDate(page.last_updated)}
                  </div>

                  <div className="text-sm text-gray-600">
                    URL: <span className="font-mono bg-gray-100 px-2 py-1 rounded">/legal/{page.slug}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleTogglePublished(page.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={page.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {page.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/legal-pages/${page.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
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

export default LegalPagesList;