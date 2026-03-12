import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Ticket, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OutsourceCouponsManager = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    duration_months: null,
    max_uses: null,
    valid_until: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/admin/outsource/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        duration_months: formData.duration_months ? parseInt(formData.duration_months) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until || null
      };
      
      if (editingId) {
        await api.put(`/admin/outsource/coupons/${editingId}`, data);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/outsource/coupons', data);
        toast.success('Coupon created');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ code: '', name: '', description: '', discount_type: 'percentage', discount_value: 0, duration_months: null, max_uses: null, valid_until: '' });
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      duration_months: coupon.duration_months || '',
      max_uses: coupon.max_uses || '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/admin/outsource/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No expiry';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDiscountDisplay = (coupon) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}% Off`;
      case 'dollar_amount':
        return `$${coupon.discount_value} Off`;
      case 'per_file':
        return `$${coupon.discount_value}/file`;
      case 'free_months':
        return `${coupon.discount_value} Free Month${coupon.discount_value > 1 ? 's' : ''}`;
      default:
        return coupon.discount_value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/outsourcing')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupon Management</h2>
          <p className="text-gray-600">Create and manage discount coupons for outsourcing partners</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ code: '', name: '', description: '', discount_type: 'percentage', discount_value: 0, duration_months: null, max_uses: null, valid_until: '' }); }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Coupon'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                  placeholder="e.g., SAVE20"
                  className="mt-1 uppercase"
                />
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Summer Sale 20% Off"
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
                placeholder="Brief description of this coupon"
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Discount Type *</Label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="dollar_amount">Dollar Amount Off ($)</option>
                  <option value="per_file">Per File Discount ($)</option>
                  <option value="free_months">Free Months</option>
                </select>
              </div>
              <div>
                <Label>
                  Discount Value *
                  {formData.discount_type === 'percentage' && ' (%)'}
                  {formData.discount_type === 'dollar_amount' && ' ($)'}
                  {formData.discount_type === 'per_file' && ' ($ per file)'}
                  {formData.discount_type === 'free_months' && ' (months)'}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step={formData.discount_type === 'free_months' ? '1' : '0.01'}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Duration (Months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration_months || ''}
                  onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                  placeholder="Leave empty for unlimited"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">How many months the discount applies</p>
              </div>
              <div>
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                  placeholder="Leave empty for unlimited"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Total times this coupon can be used</p>
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">{editingId ? 'Update' : 'Create'} Coupon</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {coupons.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Coupon</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Discount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Duration</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Uses</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Expiry</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-purple-600">{coupon.code}</p>
                          <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">{coupon.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-green-600">{getDiscountDisplay(coupon)}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {coupon.duration_months ? `${coupon.duration_months} months` : 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {coupon.times_used} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {formatDate(coupon.valid_until)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      coupon.status === 'active' ? 'bg-green-100 text-green-700' :
                      coupon.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Coupons Yet</h3>
            <p className="text-gray-500 mb-4">Create your first coupon to offer discounts to partners</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Coupon
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutsourceCouponsManager;
