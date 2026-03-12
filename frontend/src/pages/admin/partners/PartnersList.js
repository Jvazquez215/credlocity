import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Building, Users, Star, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';

const PartnersList = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({ name: '', description: '', icon: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partnersRes, typesRes] = await Promise.all([
        api.get('/admin/partners'),
        api.get('/admin/partner-types')
      ]);
      setPartners(partnersRes.data);
      setPartnerTypes(typesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || partner.partner_type_id === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (partner) => {
    if (!window.confirm(`Delete ${partner.name}?`)) return;
    try {
      await api.delete(`/admin/partners/${partner.id}`);
      toast.success('Partner deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const handleToggle = async (partner) => {
    try {
      await api.patch(`/admin/partners/${partner.id}/toggle`);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveType = async () => {
    try {
      if (editingType) {
        await api.put(`/admin/partner-types/${editingType.id}`, typeForm);
        toast.success('Partner type updated');
      } else {
        await api.post('/admin/partner-types', typeForm);
        toast.success('Partner type created');
      }
      setShowTypeModal(false);
      setEditingType(null);
      setTypeForm({ name: '', description: '', icon: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save partner type');
    }
  };

  const handleDeleteType = async (type) => {
    if (!window.confirm(`Delete type "${type.name}"? This won't delete associated partners.`)) return;
    try {
      await api.delete(`/admin/partner-types/${type.id}`);
      toast.success('Partner type deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete partner type');
    }
  };

  const getTypeById = (id) => partnerTypes.find(t => t.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Credlocity Partners</h1>
          <p className="text-gray-600 mt-1">Manage partner profiles and landing pages</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTypeModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings size={18} />
            Manage Types
          </Button>
          <Button
            onClick={() => navigate('/admin/partners/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Partner Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-lg cursor-pointer transition ${
            filterType === 'all' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{partners.length}</div>
          <div className="text-sm text-gray-600">All Partners</div>
        </div>
        {partnerTypes.map(type => {
          const count = partners.filter(p => p.partner_type_id === type.id).length;
          return (
            <div
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                filterType === type.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Building className="w-8 h-8 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-sm text-gray-600">{type.name}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No partners found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Add your first partner'}
          </p>
          <Button onClick={() => navigate('/admin/partners/new')}>
            Add Partner
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const type = getTypeById(partner.partner_type_id);
            return (
              <div
                key={partner.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Partner Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
                  {partner.cover_image && (
                    <img src={partner.cover_image} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute -bottom-10 left-4">
                    {partner.photo_url ? (
                      <img
                        src={partner.photo_url}
                        alt={partner.name}
                        className="w-20 h-20 rounded-full border-4 border-white object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {partner.is_featured && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star size={12} /> Featured
                    </div>
                  )}
                </div>

                {/* Partner Info */}
                <div className="pt-12 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{partner.name}</h3>
                      <p className="text-sm text-gray-600">{partner.company_name}</p>
                    </div>
                    {partner.company_logo && (
                      <img src={partner.company_logo} alt="" className="h-8 object-contain" />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {type?.name || 'Unknown Type'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      partner.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {partner.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{partner.short_bio}</p>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                    <button
                      onClick={() => handleToggle(partner)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title={partner.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {partner.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/partners/${partner.id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(partner)}
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

      {/* Partner Types Modal */}
      <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Partner Types</DialogTitle>
          </DialogHeader>
          
          {/* Existing Types */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {partnerTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingType(type);
                      setTypeForm({ name: type.name, description: type.description || '', icon: type.icon || '' });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteType(type)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Form */}
          <div className="border-t pt-4 mt-4 space-y-3">
            <h4 className="font-medium text-gray-700">
              {editingType ? 'Edit Type' : 'Add New Type'}
            </h4>
            <input
              type="text"
              placeholder="Type name (e.g., Real Estate, Funding)"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTypeModal(false);
              setEditingType(null);
              setTypeForm({ name: '', description: '', icon: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveType} disabled={!typeForm.name}>
              {editingType ? 'Update' : 'Add'} Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersList;
