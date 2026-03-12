import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const LawsuitsList = () => {
  const navigate = useNavigate();
  const [lawsuits, setLawsuits] = useState([]);
  const [filteredLawsuits, setFilteredLawsuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchLawsuits();
  }, []);

  useEffect(() => {
    filterLawsuits();
  }, [lawsuits, searchTerm, categoryFilter, typeFilter]);

  const fetchLawsuits = async () => {
    try {
      const response = await api.get('/admin/lawsuits');
      setLawsuits(response.data);
    } catch (error) {
      toast.error('Failed to fetch lawsuits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterLawsuits = () => {
    let filtered = [...lawsuits];

    if (searchTerm) {
      filtered = filtered.filter(lawsuit =>
        lawsuit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawsuit.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawsuit.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lawsuit => lawsuit.lawsuit_category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(lawsuit => lawsuit.lawsuit_type === typeFilter);
    }

    setFilteredLawsuits(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lawsuit?')) return;

    try {
      await api.delete(`/admin/lawsuits/${id}`);
      toast.success('Lawsuit deleted successfully');
      fetchLawsuits();
    } catch (error) {
      toast.error('Failed to delete lawsuit');
      console.error(error);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/admin/lawsuits/${id}/toggle`);
      toast.success('Lawsuit status updated');
      fetchLawsuits();
    } catch (error) {
      toast.error('Failed to update lawsuit status');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lawsuits...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lawsuits Filed</h1>
          <p className="text-gray-600 mt-1">Manage lawsuits filed by Credlocity</p>
        </div>
        <button
          onClick={() => navigate('/admin/lawsuits/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search lawsuits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="Client">Client</option>
              <option value="Industry">Industry</option>
              <option value="Nationwide">Nationwide</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              <option value="FCRA">FCRA</option>
              <option value="FCBA">FCBA</option>
              <option value="FDCPA">FDCPA</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lawsuits List */}
      {filteredLawsuits.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">⚖️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No lawsuits found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first lawsuit'}
          </p>
          {!searchTerm && categoryFilter === 'all' && typeFilter === 'all' && (
            <button
              onClick={() => navigate('/admin/lawsuits/new')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first lawsuit
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLawsuits.map((lawsuit) => (
            <div
              key={lawsuit.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{lawsuit.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lawsuit.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lawsuit.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Case Number:</span>
                      <p className="font-medium text-gray-800">{lawsuit.case_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium text-gray-800">{lawsuit.lawsuit_category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium text-gray-800">{lawsuit.lawsuit_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date Filed:</span>
                      <p className="font-medium text-gray-800">{formatDate(lawsuit.date_filed)}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-semibold">Topic:</span> {lawsuit.topic}
                  </p>
                  <p className="text-gray-600 text-sm">{lawsuit.brief_description}</p>

                  {lawsuit.related_company && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        Related: {lawsuit.related_company}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(lawsuit.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={lawsuit.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {lawsuit.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/lawsuits/${lawsuit.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(lawsuit.id)}
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

export default LawsuitsList;
