import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Search, RefreshCw, Edit2, Trash2, ToggleLeft, ToggleRight,
  Copy, CheckCircle, Clock, AlertTriangle, Percent, DollarSign, Gift, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TYPE_OPTIONS = [
  { value: 'free_registration', label: 'Free Registration', icon: Gift, desc: 'Waives the $500 signup fee' },
  { value: 'percentage_discount', label: '% Discount', icon: Percent, desc: 'Percentage off signup fee' },
  { value: 'flat_credit', label: 'Flat Credit', icon: DollarSign, desc: 'Dollar amount off signup fee' },
  { value: 'free_trial', label: 'Free Trial', icon: Clock, desc: 'Free signup + X days free subscription' },
  { value: 'freemium', label: 'Freemium', icon: Gift, desc: 'Free signup + discounted monthly' },
];

const getTypeBadge = (type) => {
  const map = {
    free_registration: 'bg-green-100 text-green-800',
    percentage_discount: 'bg-blue-100 text-blue-800',
    flat_credit: 'bg-purple-100 text-purple-800',
    free_trial: 'bg-yellow-100 text-yellow-800',
    freemium: 'bg-teal-100 text-teal-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function PromoCodeManager() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [form, setForm] = useState({
    code: '', type: 'free_registration', value: 0, description: '',
    applies_to: 'cro_registration', max_uses: 0, free_trial_days: 30, expires_at: ''
  });

  const token = localStorage.getItem('auth_token');

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/promo/codes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCodes(data.codes || []);
      }
    } catch {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const resetForm = () => {
    setForm({ code: '', type: 'free_registration', value: 0, description: '', applies_to: 'cro_registration', max_uses: 0, free_trial_days: 30, expires_at: '' });
    setEditingCode(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCode
        ? `${API_URL}/api/promo/codes/${editingCode.id}`
        : `${API_URL}/api/promo/codes`;
      const method = editingCode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingCode ? 'Promo code updated' : 'Promo code created');
        resetForm();
        fetchCodes();
      } else {
        toast.error(data.detail || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      const res = await fetch(`${API_URL}/api/promo/codes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { toast.success('Deleted'); fetchCodes(); }
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (code) => {
    try {
      const res = await fetch(`${API_URL}/api/promo/codes/${code.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ active: !code.active })
      });
      if (res.ok) { fetchCodes(); }
    } catch { toast.error('Failed to update'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <div data-testid="promo-code-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-600" /> Promo & Discount Codes
          </h1>
          <p className="text-gray-500 mt-1">Manage promotional codes for CRO registration and more</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700" data-testid="create-promo-btn">
          <Plus className="w-4 h-4 mr-1" /> Create Code
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="mb-6 border-purple-200">
          <CardHeader>
            <CardTitle>{editingCode ? 'Edit Promo Code' : 'Create New Promo Code'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Code *</label>
                  <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. WELCOME50" required disabled={!!editingCode} data-testid="promo-code-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" data-testid="promo-type-select">
                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Applies To</label>
                  <select value={form.applies_to} onChange={e => setForm(p => ({ ...p, applies_to: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="cro_registration">CRO Registration</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['percentage_discount', 'flat_credit', 'freemium'].includes(form.type) && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {form.type === 'flat_credit' ? 'Credit Amount ($)' : 'Discount (%)'}
                    </label>
                    <Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} min="0" max={form.type === 'flat_credit' ? '500' : '100'} data-testid="promo-value-input" />
                  </div>
                )}
                {form.type === 'free_trial' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trial Days</label>
                    <Input type="number" value={form.free_trial_days} onChange={e => setForm(p => ({ ...p, free_trial_days: parseInt(e.target.value) || 30 }))} min="1" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Uses (0 = unlimited)</label>
                  <Input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: parseInt(e.target.value) || 0 }))} min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expires At</label>
                  <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe this promotion..." />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" data-testid="promo-save-btn">
                  {editingCode ? 'Update Code' : 'Create Code'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Codes List */}
      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div>
      ) : codes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No promo codes created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {codes.map(c => (
            <Card key={c.id} className={`transition-all ${!c.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => copyCode(c.code)} className="font-mono font-bold text-lg hover:text-purple-600 flex items-center gap-1" title="Click to copy">
                        {c.code} <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(c.type)}`}>{c.type?.replace(/_/g, ' ')}</span>
                      {!c.active && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {c.description || 'No description'} &middot; Used {c.times_used}/{c.max_uses || 'unlimited'}
                      {c.expires_at && <> &middot; Expires {new Date(c.expires_at).toLocaleDateString()}</>}
                      {c.value > 0 && <> &middot; Value: {c.type === 'flat_credit' ? `$${c.value}` : `${c.value}%`}</>}
                      {c.free_trial_days > 0 && c.type === 'free_trial' && <> &middot; {c.free_trial_days} days</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(c)} className="p-1 hover:bg-gray-100 rounded" title={c.active ? 'Deactivate' : 'Activate'}>
                      {c.active ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                    <button onClick={() => { setEditingCode(c); setForm({ code: c.code, type: c.type, value: c.value || 0, description: c.description || '', applies_to: c.applies_to || 'cro_registration', max_uses: c.max_uses || 0, free_trial_days: c.free_trial_days || 30, expires_at: c.expires_at || '' }); setShowForm(true); }} className="p-1 hover:bg-gray-100 rounded">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => deleteCode(c.id)} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
