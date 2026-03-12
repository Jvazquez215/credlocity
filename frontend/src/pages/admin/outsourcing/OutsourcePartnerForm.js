import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowLeft, Save, Building2, User, Key, DollarSign, History, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const OutsourcePartnerForm = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const isEditing = !!partnerId;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [crmPlatforms, setCrmPlatforms] = useState([]);
  const [pricingHistory, setPricingHistory] = useState([]);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_email: '',
    contact_phone: '',
    position: '',
    crm_platform_id: '',
    crm_username: '',
    crm_password: '',
    status: 'active',
    billing_email: '',
    payment_terms: '',
    cost_per_consumer: 0,
    active_client_count: 0,
    billing_cycle: 'monthly',
    notes: ''
  });

  useEffect(() => {
    fetchCrmPlatforms();
    if (isEditing) {
      fetchPartner();
    }
  }, [partnerId]);

  const fetchCrmPlatforms = async () => {
    try {
      const response = await api.get('/admin/outsource/crm-platforms');
      setCrmPlatforms(response.data);
    } catch (error) {
      console.error('Error fetching CRM platforms:', error);
    }
  };

  const fetchPartner = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/outsource/partners/${partnerId}`);
      const data = response.data;
      setFormData({
        company_name: data.company_name || '',
        contact_first_name: data.contact_first_name || '',
        contact_last_name: data.contact_last_name || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        position: data.position || '',
        crm_platform_id: data.crm_platform_id || '',
        crm_username: data.crm_username || '',
        crm_password: data.crm_password || '',
        status: data.status || 'active',
        billing_email: data.billing_email || '',
        payment_terms: data.payment_terms || '',
        cost_per_consumer: data.cost_per_consumer || 0,
        active_client_count: data.active_client_count || 0,
        billing_cycle: data.billing_cycle || 'monthly',
        notes: data.notes || ''
      });
      setPricingHistory(data.pricing_history || []);
    } catch (error) {
      console.error('Error fetching partner:', error);
      toast.error('Failed to load partner');
      navigate('/admin/outsourcing/partners');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/admin/outsource/partners/${partnerId}`, formData);
        toast.success('Partner updated successfully');
      } else {
        await api.post('/admin/outsource/partners', formData);
        toast.success('Partner created successfully');
      }
      navigate('/admin/outsourcing/partners');
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save partner');
    } finally {
      setSaving(false);
    }
  };

  const calculateMonthlyTotal = () => {
    return (formData.cost_per_consumer * formData.active_client_count).toFixed(2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate('/admin/outsourcing/partners')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Partner' : 'Add New Partner'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-blue" />
            Company Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Partner Company Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-blue" />
            Contact Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contact_first_name">First Name</Label>
              <Input
                id="contact_first_name"
                name="contact_first_name"
                value={formData.contact_first_name}
                onChange={handleChange}
                placeholder="John"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_last_name">Last Name</Label>
              <Input
                id="contact_last_name"
                name="contact_last_name"
                value={formData.contact_last_name}
                onChange={handleChange}
                placeholder="Smith"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="contact@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Owner, CEO"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="billing_email">Billing Email</Label>
              <Input
                id="billing_email"
                name="billing_email"
                type="email"
                value={formData.billing_email}
                onChange={handleChange}
                placeholder="billing@company.com"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Billing - NEW SECTION */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Pricing & Billing
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="cost_per_consumer">Cost Per Consumer ($)</Label>
              <Input
                id="cost_per_consumer"
                name="cost_per_consumer"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_consumer}
                onChange={handleChange}
                placeholder="5.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Price charged per file/consumer</p>
            </div>
            <div>
              <Label htmlFor="active_client_count">Active Clients</Label>
              <Input
                id="active_client_count"
                name="active_client_count"
                type="number"
                min="0"
                value={formData.active_client_count}
                onChange={handleChange}
                placeholder="100"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Number of consumers being processed</p>
            </div>
            <div>
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <select
                id="billing_cycle"
                name="billing_cycle"
                value={formData.billing_cycle}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Monthly Total Preview */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Estimated Monthly Invoice</p>
                <p className="text-xs text-green-600">
                  {formData.active_client_count} clients × ${formData.cost_per_consumer}/consumer
                </p>
              </div>
              <p className="text-3xl font-bold text-green-700">${calculateMonthlyTotal()}</p>
            </div>
          </div>
        </div>

        {/* Pricing History - Only show when editing and has history */}
        {isEditing && pricingHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Pricing History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cost/Consumer</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Active Clients</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monthly Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pricingHistory.slice().reverse().map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(entry.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-gray-900">${entry.cost_per_consumer?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-gray-900">{entry.active_client_count || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-semibold text-green-600">
                          ${((entry.cost_per_consumer || 0) * (entry.active_client_count || 0)).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">{entry.notes || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              * History is automatically recorded when pricing or client count changes
            </p>
          </div>
        )}

        {/* CRM Credentials */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-blue" />
            CRM Access (Confidential)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="crm_platform_id">CRM Platform</Label>
              <select
                id="crm_platform_id"
                name="crm_platform_id"
                value={formData.crm_platform_id}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select CRM...</option>
                <option value="disputefox">DisputeFox</option>
                <option value="credit-repair-cloud">Credit Repair Cloud</option>
                <option value="credit-butterfly">Credit Butterfly</option>
                <option value="client-dispute-manager">Client Dispute Manager</option>
                <option value="dispute-suite">Dispute Suite</option>
                <option value="other">Other</option>
                {crmPlatforms.map(crm => (
                  <option key={crm.id} value={crm.id}>{crm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                placeholder="e.g., Net 30"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="crm_username">CRM Username</Label>
              <Input
                id="crm_username"
                name="crm_username"
                value={formData.crm_username}
                onChange={handleChange}
                placeholder="username"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="crm_password">CRM Password</Label>
              <Input
                id="crm_password"
                name="crm_password"
                type="password"
                value={formData.crm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">⚠️ Credentials are stored securely and only used for dispute processing.</p>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Any internal notes about this partner..."
            className="mt-1"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/outsourcing/partners')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary-blue hover:bg-primary-dark"
          >
            {saving ? 'Saving...' : (
              <><Save className="w-4 h-4 mr-2" /> {isEditing ? 'Update Partner' : 'Create Partner'}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OutsourcePartnerForm;
