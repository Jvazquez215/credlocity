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

export default function LawsuitViolationsManager() {
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await api.get('/admin/lawsuit-violations');
      setViolations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch violations:', error);
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/lawsuit-violations/${editingId}`, formData);
        toast.success('Violation updated successfully');
      } else {
        await api.post('/admin/lawsuit-violations', formData);
        toast.success('Violation created successfully');
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchViolations();
    } catch (error) {
      toast.error(editingId ? 'Failed to update violation' : 'Failed to create violation');
    }
  };

  const handleEdit = (violation) => {
    setFormData({
      name: violation.name,
      description: violation.description || ''
    });
    setEditingId(violation.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this violation?')) return;
    try {
      await api.delete(`/admin/lawsuit-violations/${id}`);
      toast.success('Violation deleted successfully');
      fetchViolations();
    } catch (error) {
      toast.error('Failed to delete violation');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/lawsuit-violations/${id}/toggle`);
      toast.success(currentStatus ? 'Violation deactivated' : 'Violation activated');
      fetchViolations();
    } catch (error) {
      toast.error('Failed to toggle violation status');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
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
        <h1 className="text-3xl font-bold text-gray-900">Legal Violations</h1>
        <p className="text-gray-600 mt-1">Manage violation types and legal claims</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Violation' : 'Add New Violation'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Violation Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., FCRA violations, Negligent FCRA Noncompliance"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this violation"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Violation' : 'Add Violation'}
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
            <CardTitle>Existing Violations ({violations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {violations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No violations yet. Add your first one!</p>
            ) : (
              <div className="space-y-3">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className={`p-4 border rounded-lg ${
                      violation.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{violation.name}</h3>
                        {violation.description && (
                          <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            violation.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {violation.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(violation)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(violation.id, violation.is_active)}
                        >
                          {violation.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(violation.id)}
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
