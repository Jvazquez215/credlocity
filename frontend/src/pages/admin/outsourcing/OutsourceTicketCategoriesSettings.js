import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OutsourceTicketCategoriesSettings = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_urgency: 'medium',
    display_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/outsource/ticket-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/outsource/ticket-categories/${editingId}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/admin/outsource/ticket-categories', formData);
        toast.success('Category created');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', default_urgency: 'medium', display_order: 0 });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      default_urgency: category.default_urgency || 'medium',
      display_order: category.display_order || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/admin/outsource/ticket-categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[urgency] || styles.medium}`}>
        {urgency}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/outsourcing')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ticket Categories</h2>
          <p className="text-gray-600">Manage escalation ticket categories for outsourcing</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', description: '', default_urgency: 'medium', display_order: 0 }); }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="e.g., Billing Issue"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                placeholder="Brief description of this category"
                className="mt-1"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Default Urgency</Label>
                <select
                  value={formData.default_urgency}
                  onChange={(e) => setFormData({...formData, default_urgency: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">This affects the auto-calculated response time</p>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'} Category</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Default Urgency</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Order</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {getUrgencyBadge(category.default_urgency)}
                </td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {category.display_order || 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)} className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 About Ticket Categories</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Categories help organize and prioritize escalation tickets</li>
          <li>• The <strong>Default Urgency</strong> affects auto-calculated response times</li>
          <li>• Phone calls boost urgency by +1 level, texts by +0.5 level</li>
          <li>• Response times: Critical=4h, High=8h, Medium=24h, Low=48h</li>
        </ul>
      </div>
    </div>
  );
};

export default OutsourceTicketCategoriesSettings;
