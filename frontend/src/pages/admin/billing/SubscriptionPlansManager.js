import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CreditCard, Star, Check } from 'lucide-react';

const SubscriptionPlansManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    signup_fee: 500,
    monthly_fee: 199.99,
    annual_fee: null,
    features: [''],
    max_cases_per_month: null,
    max_users: 3,
    company_revenue_percentage: 60,
    display_order: 0,
    is_featured: false
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/billing/subscription-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        signup_fee: parseFloat(formData.signup_fee),
        monthly_fee: parseFloat(formData.monthly_fee),
        annual_fee: formData.annual_fee ? parseFloat(formData.annual_fee) : null,
        max_users: formData.max_users ? parseInt(formData.max_users) : null,
        max_cases_per_month: formData.max_cases_per_month ? parseInt(formData.max_cases_per_month) : null,
        company_revenue_percentage: parseFloat(formData.company_revenue_percentage),
        display_order: parseInt(formData.display_order),
        features: formData.features.filter(f => f.trim() !== '')
      };
      
      if (editingId) {
        await api.put(`/billing/subscription-plans/${editingId}`, data);
        toast.success('Subscription plan updated');
      } else {
        await api.post('/billing/subscription-plans', data);
        toast.success('Subscription plan created');
      }
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.detail || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description || '',
      signup_fee: plan.signup_fee,
      monthly_fee: plan.monthly_fee,
      annual_fee: plan.annual_fee || '',
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      max_cases_per_month: plan.max_cases_per_month || '',
      max_users: plan.max_users || '',
      company_revenue_percentage: plan.company_revenue_percentage,
      display_order: plan.display_order || 0,
      is_featured: plan.is_featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this plan?')) return;
    try {
      await api.delete(`/billing/subscription-plans/${id}`);
      toast.success('Plan deactivated');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error(error.response?.data?.detail || 'Failed to deactivate plan');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      signup_fee: 500,
      monthly_fee: 199.99,
      annual_fee: null,
      features: [''],
      max_cases_per_month: null,
      max_users: 3,
      company_revenue_percentage: 60,
      display_order: 0,
      is_featured: false
    });
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="subscription-plans-manager">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Subscription Plans</h2>
          <p className="text-gray-500">Manage plans for credit repair companies</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Plan'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">{editingId ? 'Edit Plan' : 'Create New Plan'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Plan Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Professional"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Plan Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(' ', '_')})}
                  required
                  placeholder="e.g., PROFESSIONAL"
                  className="mt-1 uppercase"
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                placeholder="Brief description of this plan"
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Signup Fee ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.signup_fee}
                  onChange={(e) => setFormData({...formData, signup_fee: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Monthly Fee ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({...formData, monthly_fee: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Annual Fee ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.annual_fee || ''}
                  onChange={(e) => setFormData({...formData, annual_fee: e.target.value})}
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Max Users</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_users || ''}
                  onChange={(e) => setFormData({...formData, max_users: e.target.value})}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Cases/Month</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_cases_per_month || ''}
                  onChange={(e) => setFormData({...formData, max_cases_per_month: e.target.value})}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Revenue Share (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.company_revenue_percentage}
                  onChange={(e) => setFormData({...formData, company_revenue_percentage: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Company&apos;s share when cases sell</p>
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="mt-2 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature..."
                      className="flex-1"
                    />
                    {formData.features.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" /> Add Feature
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="is_featured" className="mb-0">Mark as Featured Plan</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">{editingId ? 'Update' : 'Create'} Plan</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${
              plan.is_featured ? 'border-primary-blue' : 'border-gray-100'
            } ${plan.status === 'inactive' ? 'opacity-60' : ''}`}
          >
            {plan.is_featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.code}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">${plan.monthly_fee}</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              {plan.signup_fee > 0 && (
                <p className="text-sm text-gray-500">+ ${plan.signup_fee} signup fee</p>
              )}
              {plan.annual_fee && (
                <p className="text-sm text-green-600">${plan.annual_fee}/year (save ${((plan.monthly_fee * 12) - plan.annual_fee).toFixed(0)})</p>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
              <ul className="space-y-1">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Max Users:</span>
                <span className="font-medium">{plan.max_users || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cases/Month:</span>
                <span className="font-medium">{plan.max_cases_per_month || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Revenue Share:</span>
                <span className="font-medium text-green-600">{plan.company_revenue_percentage}%</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(plan.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {plan.status === 'inactive' && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
                <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium">Inactive</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Subscription Plans</h3>
          <p className="text-gray-500 mb-4">Create your first subscription plan</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansManager;
