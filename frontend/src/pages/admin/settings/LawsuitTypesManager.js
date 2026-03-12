import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';
import { Edit2, Trash2, ArrowLeft, Check, X } from 'lucide-react';

export default function LawsuitTypesManager() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await api.get('/admin/lawsuit-types');
      setTypes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch types:', error);
      toast.error('Failed to load lawsuit types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/lawsuit-types/${editingId}`, formData);
        toast.success('Type updated successfully');
      } else {
        await api.post('/admin/lawsuit-types', formData);
        toast.success('Type created successfully');
      }
      setFormData({ name: '', description: '', display_order: 0 });
      setEditingId(null);
      fetchTypes();
    } catch (error) {
      toast.error(editingId ? 'Failed to update type' : 'Failed to create type');
    }
  };

  const handleEdit = (type) => {
    setFormData({
      name: type.name,
      description: type.description || '',
      display_order: type.display_order || 0
    });
    setEditingId(type.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this type?')) return;
    try {
      await api.delete(`/admin/lawsuit-types/${id}`);
      toast.success('Type deleted successfully');
      fetchTypes();
    } catch (error) {
      toast.error('Failed to delete type');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/lawsuit-types/${id}/toggle`);
      toast.success(currentStatus ? 'Type deactivated' : 'Type activated');
      fetchTypes();
    } catch (error) {
      toast.error('Failed to toggle type status');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', display_order: 0 });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/settings/lawsuits')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lawsuit Settings
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Lawsuit Types</h1>
        <p className="text-gray-600 mt-1">Manage legal claim types (e.g., FCRA, FDCPA, FCBA)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Type' : 'Add New Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Type Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., FCRA, FDCPA, State Law Claims"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this type"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Type' : 'Add Type'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Types ({types.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {types.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No types yet. Add your first one!</p>
            ) : (
              <div className="space-y-3">
                {types.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 border rounded-lg ${
                      type.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        {type.description && (
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Order: {type.display_order}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {type.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(type.id, type.is_active)}
                        >
                          {type.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(type.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
