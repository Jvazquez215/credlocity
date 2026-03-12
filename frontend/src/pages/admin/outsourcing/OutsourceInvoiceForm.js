import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

const OutsourceInvoiceForm = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const isEditing = !!invoiceId;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [formData, setFormData] = useState({
    partner_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    items: [{ description: '', quantity: 0, unit_price: 0 }],
    notes: '',
    billing_period_start: '',
    billing_period_end: ''
  });

  useEffect(() => {
    fetchPartners();
    if (isEditing) {
      fetchInvoice();
    } else {
      // Generate invoice number for new invoices
      generateInvoiceNumber();
    }
  }, [invoiceId]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      invoice_number: `INV-${year}${month}-${random}`
    }));
  };

  const fetchPartners = async () => {
    try {
      const response = await api.get('/admin/outsource/partners');
      setPartners(response.data.filter(p => p.status === 'active'));
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/outsource/invoices/${invoiceId}`);
      const data = response.data;
      setFormData({
        partner_id: data.partner_id || '',
        invoice_number: data.invoice_number || '',
        invoice_date: data.invoice_date?.split('T')[0] || '',
        due_date: data.due_date?.split('T')[0] || '',
        status: data.status || 'draft',
        items: data.items?.length > 0 ? data.items : [{ description: '', quantity: 0, unit_price: 0 }],
        notes: data.notes || '',
        billing_period_start: data.billing_period_start?.split('T')[0] || '',
        billing_period_end: data.billing_period_end?.split('T')[0] || ''
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
      navigate('/admin/outsourcing/invoices');
    } finally {
      setLoading(false);
    }
  };

  // Auto-populate billing info when partner is selected
  const handlePartnerChange = async (e) => {
    const partnerId = e.target.value;
    setFormData(prev => ({ ...prev, partner_id: partnerId }));
    
    if (partnerId && !isEditing) {
      await fetchPartnerBillingInfo(partnerId);
    }
  };

  const fetchPartnerBillingInfo = async (partnerId) => {
    setLoadingBilling(true);
    try {
      const response = await api.get(`/admin/outsource/partners/${partnerId}/billing-info`);
      const billing = response.data;
      
      if (billing.cost_per_consumer > 0 && billing.active_client_count > 0) {
        // Calculate billing period (current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Get month name for description
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        setFormData(prev => ({
          ...prev,
          items: [{
            description: `Credit Repair Outsourcing Services - ${monthName} (${billing.active_client_count} consumers @ $${billing.cost_per_consumer}/consumer)`,
            quantity: billing.active_client_count,
            unit_price: billing.cost_per_consumer
          }],
          billing_period_start: startOfMonth.toISOString().split('T')[0],
          billing_period_end: endOfMonth.toISOString().split('T')[0],
          due_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        }));
        
        toast.success(`Auto-populated billing: ${billing.active_client_count} clients @ $${billing.cost_per_consumer}/consumer`);
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
    } finally {
      setLoadingBilling(false);
    }
  };

  const refreshBillingFromPartner = async () => {
    if (formData.partner_id) {
      await fetchPartnerBillingInfo(formData.partner_id);
    } else {
      toast.error('Please select a partner first');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 0, unit_price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.partner_id) {
      toast.error('Please select a partner');
      return;
    }

    const submitData = {
      ...formData,
      total_amount: calculateTotal()
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/admin/outsource/invoices/${invoiceId}`, submitData);
        toast.success('Invoice updated successfully');
      } else {
        await api.post('/admin/outsource/invoices', submitData);
        toast.success('Invoice created successfully');
      }
      navigate('/admin/outsourcing/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedPartner = () => {
    return partners.find(p => p.id === formData.partner_id);
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
          onClick={() => navigate('/admin/outsourcing/invoices')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Invoice' : 'Create Invoice'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Invoice Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="partner_id">Partner *</Label>
              <select
                id="partner_id"
                name="partner_id"
                value={formData.partner_id}
                onChange={handlePartnerChange}
                required
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select Partner...</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.company_name} {partner.cost_per_consumer > 0 ? `($${partner.cost_per_consumer}/consumer)` : ''}
                  </option>
                ))}
              </select>
              {loadingBilling && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Loading billing info...
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                placeholder="INV-202501-001"
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Input
                id="invoice_date"
                name="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Billing Period */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Billing Period</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="billing_period_start">Period Start</Label>
              <Input
                id="billing_period_start"
                name="billing_period_start"
                type="date"
                value={formData.billing_period_start}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="billing_period_end">Period End</Label>
              <Input
                id="billing_period_end"
                name="billing_period_end"
                type="date"
                value={formData.billing_period_end}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Partner Current Pricing Info */}
        {formData.partner_id && getSelectedPartner() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Partner&apos;s Current Pricing
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refreshBillingFromPartner}
                disabled={loadingBilling}
                className="text-blue-700 border-blue-300"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loadingBilling ? 'animate-spin' : ''}`} />
                Refresh from Partner
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Cost per Consumer</p>
                <p className="font-bold text-blue-900">${getSelectedPartner().cost_per_consumer?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-blue-700">Active Clients</p>
                <p className="font-bold text-blue-900">{getSelectedPartner().active_client_count || 0}</p>
              </div>
              <div>
                <p className="text-blue-700">Expected Monthly</p>
                <p className="font-bold text-blue-900">
                  ${((getSelectedPartner().cost_per_consumer || 0) * (getSelectedPartner().active_client_count || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Line Items</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                <div className="col-span-5">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="e.g., Dispute processing - January 2025"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Qty (Clients)</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <Label className="invisible">Total</Label>
                  <p className="mt-1 py-2 font-semibold text-lg">${(item.quantity * item.unit_price).toFixed(2)}</p>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t flex justify-end">
            <div className="text-right">
              <p className="text-gray-500 text-sm">Invoice Total</p>
              <p className="text-4xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <Label htmlFor="notes">Notes / Payment Instructions</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Payment terms, bank details, additional information..."
            className="mt-1"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/outsourcing/invoices')}
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
              <><Save className="w-4 h-4 mr-2" /> {isEditing ? 'Update Invoice' : 'Create Invoice'}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OutsourceInvoiceForm;
