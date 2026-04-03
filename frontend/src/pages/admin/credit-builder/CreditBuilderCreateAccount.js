import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const PLANS = [
  { key: 'starter', label: 'Starter', limit: 750, fee: 9.00, desc: '$750 credit limit' },
  { key: 'standard', label: 'Standard', limit: 1500, fee: 15.00, desc: '$1,500 credit limit' },
  { key: 'premium', label: 'Premium', limit: 2500, fee: 25.00, desc: '$2,500 credit limit' },
  { key: 'elite', label: 'Elite', limit: 3500, fee: 35.00, desc: '$3,500 credit limit' },
];

const CreditBuilderCreateAccount = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', middle_name: '', generation_code: '',
    date_of_birth: '', ssn_last_four: '', email: '', phone: '',
    address_line1: '', address_line2: '', city: '', state: '', zip_code: '',
    previous_address_line1: '', previous_city: '', previous_state: '', previous_zip: '',
    plan_tier: '', ecoa_code: '1', reporting_active: true
  });

  // Convert date input to MMDDYYYY
  const dateToMMDDYYYY = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${m}${d}${y}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plan_tier) { toast.error('Please select a plan tier'); return; }
    if (!form.first_name || !form.last_name) { toast.error('Name is required'); return; }
    if (form.ssn_last_four.length !== 4) { toast.error('SSN last 4 must be exactly 4 digits'); return; }

    try {
      setSaving(true);
      const payload = { ...form, date_of_birth: dateToMMDDYYYY(form.date_of_birth) };
      await api.post('/credit-builder/accounts', payload, AUTH());
      toast.success('Account created successfully');
      navigate('/admin/credit-builder/accounts');
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to create account'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl" data-testid="cb-create-account">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/credit-builder/accounts')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <h1 className="text-xl font-bold">Create Credit Builder Account</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Consumer Identity */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Consumer Identity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">First Name *</label><Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required data-testid="cb-first-name" /></div>
              <div><label className="text-xs text-gray-500">Last Name *</label><Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required data-testid="cb-last-name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Middle Name</label><Input value={form.middle_name} onChange={e => setForm({...form, middle_name: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500">Generation (Jr, Sr, III)</label><Input value={form.generation_code} onChange={e => setForm({...form, generation_code: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Date of Birth *</label><Input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} required /></div>
              <div><label className="text-xs text-gray-500">SSN Last 4 *</label><Input maxLength={4} placeholder="1234" value={form.ssn_last_four} onChange={e => setForm({...form, ssn_last_four: e.target.value.replace(/\D/g,'').slice(0,4)})} required data-testid="cb-ssn" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Email *</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div><label className="text-xs text-gray-500">Phone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Address</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs text-gray-500">Address Line 1 *</label><Input value={form.address_line1} onChange={e => setForm({...form, address_line1: e.target.value})} required /></div>
            <div><label className="text-xs text-gray-500">Address Line 2</label><Input value={form.address_line2} onChange={e => setForm({...form, address_line2: e.target.value})} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">City *</label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required /></div>
              <div>
                <label className="text-xs text-gray-500">State *</label>
                <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm" required>
                  <option value="">Select</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500">ZIP *</label><Input value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} required /></div>
            </div>
            <button type="button" className="text-xs text-emerald-600 hover:underline" onClick={() => setShowPrev(!showPrev)}>
              {showPrev ? 'Hide' : 'Add'} Previous Address
            </button>
            {showPrev && (
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                <Input placeholder="Previous Address" value={form.previous_address_line1} onChange={e => setForm({...form, previous_address_line1: e.target.value})} />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="City" value={form.previous_city} onChange={e => setForm({...form, previous_city: e.target.value})} />
                  <Input placeholder="State" maxLength={2} value={form.previous_state} onChange={e => setForm({...form, previous_state: e.target.value.toUpperCase()})} />
                  <Input placeholder="ZIP" value={form.previous_zip} onChange={e => setForm({...form, previous_zip: e.target.value})} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Plan & Credit Limit</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map(p => (
                <label key={p.key} className={`relative block border-2 rounded-xl p-4 cursor-pointer transition ${form.plan_tier === p.key ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'}`} data-testid={`plan-${p.key}`}>
                  <input type="radio" name="plan" value={p.key} checked={form.plan_tier === p.key} onChange={() => setForm({...form, plan_tier: p.key})} className="sr-only" />
                  <p className="font-bold text-lg">{p.label}</p>
                  <p className="text-emerald-700 font-semibold">${p.limit.toLocaleString()} credit limit</p>
                  <p className="text-sm text-gray-500 mt-1">${p.fee.toFixed(2)}/month</p>
                  {form.plan_tier === p.key && <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center"><span className="text-white text-xs">&#10003;</span></div>}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Account Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">ECOA Code</label>
                <select value={form.ecoa_code} onChange={e => setForm({...form, ecoa_code: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="1">1 — Individual</option>
                  <option value="2">2 — Joint</option>
                  <option value="3">3 — Authorized User</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Portfolio Type</label>
                <Input value="R — Revolving" readOnly className="bg-gray-50" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm">Reporting Active</label>
              <input type="checkbox" checked={form.reporting_active} onChange={e => setForm({...form, reporting_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/credit-builder/accounts')}>Cancel</Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving} data-testid="cb-create-btn">
            {saving ? 'Creating...' : 'Create Credit Builder Account'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreditBuilderCreateAccount;
