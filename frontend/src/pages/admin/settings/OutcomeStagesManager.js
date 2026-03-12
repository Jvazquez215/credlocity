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

export default function OutcomeStagesManager() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0
  });

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await api.get('/admin/lawsuit-outcome-stages');
      setStages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch stages:', error);
      toast.error('Failed to load outcome stages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/lawsuit-outcome-stages/${editingId}`, formData);
        toast.success('Stage updated successfully');
      } else {
        await api.post('/admin/lawsuit-outcome-stages', formData);
        toast.success('Stage created successfully');
      }
      setFormData({ name: '', description: '', display_order: 0 });
      setEditingId(null);
      fetchStages();
    } catch (error) {
      toast.error(editingId ? 'Failed to update stage' : 'Failed to create stage');
    }
  };

  const handleEdit = (stage) => {
    setFormData({
      name: stage.name,
      description: stage.description || '',
      display_order: stage.display_order || 0
    });
    setEditingId(stage.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stage?')) return;
    try {
      await api.delete(`/admin/lawsuit-outcome-stages/${id}`);
      toast.success('Stage deleted successfully');
      fetchStages();
    } catch (error) {
      toast.error('Failed to delete stage');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/lawsuit-outcome-stages/${id}/toggle`);
      toast.success(currentStatus ? 'Stage deactivated' : 'Stage activated');
      fetchStages();
    } catch (error) {
      toast.error('Failed to toggle stage status');
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
        <h1 className="text-3xl font-bold text-gray-900">Case Outcome Stages</h1>
        <p className="text-gray-600 mt-1">Manage case status stages (e.g., Case Filed, Discovery Phase, Settlement)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Stage' : 'Add New Stage'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Stage Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Case Filed, Discovery Phase, Settlement Reached"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this stage"
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
                <p className="text-sm text-gray-500 mt-1">Typically follows case progression timeline</p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Stage' : 'Add Stage'}
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
            <CardTitle>Existing Stages ({stages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {stages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No stages yet. Add your first one!</p>
            ) : (
              <div className="space-y-3">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className={`p-4 border rounded-lg ${
                      stage.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                        {stage.description && (
                          <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Order: {stage.display_order}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            stage.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {stage.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(stage)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(stage.id, stage.is_active)}
                        >
                          {stage.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(stage.id)}
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
