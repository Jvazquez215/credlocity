import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import {
  DollarSign, Users, Plus, Search, Edit, Trash2, Loader2, ArrowLeft,
  Building2, TrendingUp, Trophy, Download, Calendar, BarChart3,
  Percent, Gift, Target, X, Save, ChevronDown, FileText, Clock, CheckCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PAY_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'salary_plus_commission', label: 'Salary + Commission' },
  { value: 'hourly_plus_commission', label: 'Hourly + Commission' },
  { value: 'commission_only', label: 'Commission Only' },
];
const PAY_SCHEDULES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
];
const BONUS_TYPES = [
  { value: 'performance', label: 'Performance' },
  { value: 'signup', label: 'Client Signup' },
  { value: 'collections_target', label: 'Collections Target' },
  { value: 'custom', label: 'Custom' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'referral', label: 'Referral' },
];
const DEPARTMENTS = ['General','Collections','Sales','Customer Support','Legal','Operations','Management','HR','IT'];

const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ============ OVERVIEW TAB ============
const OverviewTab = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/payroll/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setData(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!data) return <p className="text-center text-gray-400 py-16">No payroll data yet</p>;

  return (
    <div className="space-y-6" data-testid="payroll-overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{data.active_employees}</p>
          <p className="text-sm text-gray-500">Active Employees</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{fmt(data.total_annual_salaries)}</p>
          <p className="text-sm text-gray-500">Annual Salaries</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Percent className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{fmt(data.month_commissions)}</p>
          <p className="text-sm text-gray-500">This Month Commissions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Gift className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{fmt(data.month_bonuses)}</p>
          <p className="text-sm text-gray-500">This Month Bonuses</p>
        </CardContent></Card>
      </div>

      {data.last_pay_period && (
        <Card>
          <CardHeader><CardTitle>Last Pay Period</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{data.last_pay_period.name || `${data.last_pay_period.start_date} to ${data.last_pay_period.end_date}`}</p>
                <p className="text-sm text-gray-500">{data.last_pay_period.employee_count} employees</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{fmt(data.last_pay_period.total_net)}</p>
                <p className="text-xs text-gray-500">Net Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.commission_leaderboard?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Commission Leaderboard (This Month)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.commission_leaderboard.map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>{i + 1}</span>
                  <span className="font-medium flex-1">{l.employee_name}</span>
                  <span className="text-sm text-gray-500">{l.count} entries</span>
                  <span className="font-bold text-green-600">{fmt(l.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ============ PROFILES TAB ============
const ProfilesTab = ({ token }) => {
  const [profiles, setProfiles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/profiles`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setProfiles(d.profiles || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/training/employees?q=`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setEmployees(d.employees || []); }
    } catch (e) { /* ignore */ }
  }, [token]);

  useEffect(() => { fetchProfiles(); fetchEmployees(); }, [fetchProfiles, fetchEmployees]);

  const openForm = (profile) => {
    if (profile) {
      setForm(profile);
      setEditing(profile);
    } else {
      setForm({ pay_type: 'salary', pay_schedule: 'biweekly', base_salary: 0, hourly_rate: 0, commission_rate: 0, tax_rate: 22, deductions: [], department: 'General' });
      setEditing(null);
    }
    setShowForm(true);
  };

  const saveProfile = async () => {
    if (!form.employee_id && !editing) { toast.error('Select an employee'); return; }
    try {
      const url = editing ? `${API_URL}/api/payroll/profiles/${editing.id}` : `${API_URL}/api/payroll/profiles`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { toast.success('Saved'); setShowForm(false); fetchProfiles(); }
      else { const e = await res.json(); toast.error(e.detail || 'Failed'); }
    } catch (e) { toast.error('Failed'); }
  };

  const addDeduction = () => setForm({ ...form, deductions: [...(form.deductions || []), { name: '', amount: 0 }] });
  const updateDeduction = (i, f, v) => { const d = [...form.deductions]; d[i] = { ...d[i], [f]: v }; setForm({ ...form, deductions: d }); };
  const removeDeduction = (i) => setForm({ ...form, deductions: form.deductions.filter((_, idx) => idx !== i) });

  if (showForm) {
    return (
      <div className="space-y-6" data-testid="profile-form">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowForm(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
          <Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-1" /> Save Profile</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Payroll Profile' : 'New Payroll Profile'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!editing && (
              <div>
                <label className="text-sm font-medium">Employee *</label>
                <select value={form.employee_id || ''} onChange={e => {
                  const emp = employees.find(x => x.id === e.target.value);
                  setForm({ ...form, employee_id: e.target.value, employee_name: emp?.full_name || '', employee_email: emp?.email || '', department: emp?.department || form.department });
                }} className="w-full mt-1 p-2 border rounded-lg" data-testid="profile-employee">
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name || e.email}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Pay Type</label>
                <select value={form.pay_type} onChange={e => setForm({ ...form, pay_type: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" data-testid="profile-pay-type">
                  {PAY_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Pay Schedule</label>
                <select value={form.pay_schedule} onChange={e => setForm({ ...form, pay_schedule: e.target.value })} className="w-full mt-1 p-2 border rounded-lg">
                  {PAY_SCHEDULES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-1 p-2 border rounded-lg">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {(form.pay_type || '').includes('salary') && (
                <div>
                  <label className="text-sm font-medium">Annual Salary ($)</label>
                  <Input type="number" value={form.base_salary || ''} onChange={e => setForm({ ...form, base_salary: parseFloat(e.target.value) || 0 })} data-testid="profile-salary" />
                </div>
              )}
              {(form.pay_type || '').includes('hourly') && (
                <div>
                  <label className="text-sm font-medium">Hourly Rate ($)</label>
                  <Input type="number" value={form.hourly_rate || ''} onChange={e => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })} data-testid="profile-hourly" />
                </div>
              )}
              {(form.pay_type || '').includes('commission') && (
                <div>
                  <label className="text-sm font-medium">Commission Rate (%)</label>
                  <Input type="number" value={form.commission_rate || ''} onChange={e => setForm({ ...form, commission_rate: parseFloat(e.target.value) || 0 })} data-testid="profile-commission" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input type="number" value={form.tax_rate || ''} onChange={e => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Deductions</label>
                <Button size="sm" variant="outline" onClick={addDeduction}><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
              {(form.deductions || []).map((d, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Input value={d.name} onChange={e => updateDeduction(i, 'name', e.target.value)} placeholder="Name (e.g., Health Insurance)" className="flex-1" />
                  <Input type="number" value={d.amount} onChange={e => updateDeduction(i, 'amount', parseFloat(e.target.value) || 0)} className="w-32" placeholder="Amount" />
                  <button onClick={() => removeDeduction(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4" data-testid="profiles-tab">
      <div className="flex justify-end">
        <Button onClick={() => openForm(null)} className="bg-blue-600 hover:bg-blue-700" data-testid="add-profile-btn"><Plus className="w-4 h-4 mr-1" /> Add Employee</Button>
      </div>
      {profiles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No payroll profiles</p>
          <p className="text-sm mt-1">Add employees to start managing payroll</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="font-medium">{p.employee_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline">{PAY_TYPES.find(t => t.value === p.pay_type)?.label || p.pay_type}</Badge>
                      <span>{p.department}</span>
                      <span>{PAY_SCHEDULES.find(s => s.value === p.pay_schedule)?.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {p.base_salary > 0 && <p className="font-bold text-green-600">{fmt(p.base_salary)}<span className="text-xs text-gray-400">/yr</span></p>}
                    {p.hourly_rate > 0 && <p className="font-bold text-blue-600">{fmt(p.hourly_rate)}<span className="text-xs text-gray-400">/hr</span></p>}
                    {p.commission_rate > 0 && <p className="text-sm text-purple-600">{p.commission_rate}% commission</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openForm(p)}><Edit className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ COMMISSIONS TAB ============
const CommissionsTab = ({ token }) => {
  const [commissions, setCommissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const [cRes, eRes, pRes] = await Promise.all([
        fetch(`${API_URL}/api/payroll/commissions`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/training/employees?q=`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/payroll/profiles`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (cRes.ok) { const d = await cRes.json(); setCommissions(d.commissions || []); setTotal(d.total_commission || 0); }
      if (eRes.ok) { const d = await eRes.json(); setEmployees(d.employees || []); }
      if (pRes.ok) { const d = await pRes.json(); setProfiles(d.profiles || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveCommission = async () => {
    if (!form.employee_id || !form.amount_collected) { toast.error('Employee and amount required'); return; }
    const profile = profiles.find(p => p.employee_id === form.employee_id);
    const rate = form.commission_rate || profile?.commission_rate || 0;
    const payload = {
      ...form,
      commission_rate: rate,
      commission_amount: round(form.amount_collected * rate / 100),
      date: form.date || new Date().toISOString().slice(0, 10)
    };
    try {
      const res = await fetch(`${API_URL}/api/payroll/commissions`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { toast.success('Commission logged'); setShowForm(false); setForm({}); fetchAll(); }
      else { const e = await res.json(); toast.error(e.detail || 'Failed'); }
    } catch (e) { toast.error('Failed'); }
  };

  const round = (n) => Math.round(n * 100) / 100;
  const statusStyle = (s) => s === 'paid' ? 'bg-green-100 text-green-700' : s === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4" data-testid="commissions-tab">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Commissions</p>
          <p className="text-2xl font-bold text-purple-600">{fmt(total)}</p>
        </div>
        <Button onClick={() => { setForm({ date: new Date().toISOString().slice(0, 10) }); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700" data-testid="add-commission-btn">
          <Plus className="w-4 h-4 mr-1" /> Log Commission
        </Button>
      </div>

      {showForm && (
        <Card className="border-purple-200">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Employee</label>
                <select value={form.employee_id || ''} onChange={e => {
                  const emp = employees.find(x => x.id === e.target.value);
                  const profile = profiles.find(p => p.employee_id === e.target.value);
                  setForm({ ...form, employee_id: e.target.value, employee_name: emp?.full_name || '', commission_rate: profile?.commission_rate || form.commission_rate });
                }} className="w-full mt-1 p-2 border rounded-lg" data-testid="commission-employee">
                  <option value="">Select</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name || e.email}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Amount Collected ($)</label>
                <Input type="number" value={form.amount_collected || ''} onChange={e => setForm({ ...form, amount_collected: parseFloat(e.target.value) || 0 })} data-testid="commission-amount" />
              </div>
              <div>
                <label className="text-sm font-medium">Commission Rate (%)</label>
                <Input type="number" value={form.commission_rate || ''} onChange={e => setForm({ ...form, commission_rate: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Commission Earned</label>
                <p className="mt-2 text-lg font-bold text-purple-600">{fmt(round((form.amount_collected || 0) * (form.commission_rate || 0) / 100))}</p>
              </div>
            </div>
            <Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (e.g., account name)" />
            <div className="flex gap-2">
              <Button onClick={saveCommission} className="bg-purple-600 hover:bg-purple-700" data-testid="save-commission-btn"><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {commissions.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No commissions logged yet</p>
      ) : (
        <div className="space-y-2">
          {commissions.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div>
                <p className="font-medium text-sm">{c.employee_name}</p>
                <p className="text-xs text-gray-500">{c.description || 'Collection'} - {c.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <p className="text-gray-500">Collected: {fmt(c.amount_collected)}</p>
                  <p className="text-gray-500">{c.commission_rate}% rate</p>
                </div>
                <p className="font-bold text-purple-600">{fmt(c.commission_amount)}</p>
                <Badge className={statusStyle(c.status)}>{c.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ BONUSES TAB ============
const BonusesTab = ({ token }) => {
  const [bonuses, setBonuses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [employees, setEmployees] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const [bRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/payroll/bonuses`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/training/employees?q=`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (bRes.ok) { const d = await bRes.json(); setBonuses(d.bonuses || []); setTotal(d.total_bonuses || 0); }
      if (eRes.ok) { const d = await eRes.json(); setEmployees(d.employees || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveBonus = async () => {
    if (!form.employee_id || !form.amount) { toast.error('Employee and amount required'); return; }
    try {
      const res = await fetch(`${API_URL}/api/payroll/bonuses`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: form.date || new Date().toISOString().slice(0, 10) })
      });
      if (res.ok) { toast.success('Bonus added'); setShowForm(false); setForm({}); fetchAll(); }
      else { const e = await res.json(); toast.error(e.detail || 'Failed'); }
    } catch (e) { toast.error('Failed'); }
  };

  const deleteBonus = async (id) => {
    if (!window.confirm('Delete this bonus?')) return;
    await fetch(`${API_URL}/api/payroll/bonuses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchAll();
  };

  const typeColor = (t) => {
    const m = { performance: 'bg-blue-100 text-blue-700', signup: 'bg-green-100 text-green-700', collections_target: 'bg-purple-100 text-purple-700', custom: 'bg-gray-100 text-gray-700', holiday: 'bg-red-100 text-red-700', referral: 'bg-orange-100 text-orange-700' };
    return m[t] || m.custom;
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4" data-testid="bonuses-tab">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Bonuses</p>
          <p className="text-2xl font-bold text-orange-600">{fmt(total)}</p>
        </div>
        <Button onClick={() => { setForm({ bonus_type: 'custom', date: new Date().toISOString().slice(0, 10) }); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700" data-testid="add-bonus-btn">
          <Plus className="w-4 h-4 mr-1" /> Add Bonus
        </Button>
      </div>

      {showForm && (
        <Card className="border-orange-200">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Employee</label>
                <select value={form.employee_id || ''} onChange={e => {
                  const emp = employees.find(x => x.id === e.target.value);
                  setForm({ ...form, employee_id: e.target.value, employee_name: emp?.full_name || '' });
                }} className="w-full mt-1 p-2 border rounded-lg" data-testid="bonus-employee">
                  <option value="">Select</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name || e.email}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select value={form.bonus_type || 'custom'} onChange={e => setForm({ ...form, bonus_type: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" data-testid="bonus-type">
                  {BONUS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount ($)</label>
                <Input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} data-testid="bonus-amount" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" />
              <Input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            {(form.bonus_type === 'signup' || form.bonus_type === 'collections_target' || form.bonus_type === 'performance') && (
              <div className="grid grid-cols-3 gap-3">
                <Input value={form.metric_name || ''} onChange={e => setForm({ ...form, metric_name: e.target.value })} placeholder="Metric (e.g., Clients Signed)" />
                <Input type="number" value={form.metric_value || ''} onChange={e => setForm({ ...form, metric_value: parseFloat(e.target.value) || 0 })} placeholder="Actual" />
                <Input type="number" value={form.metric_target || ''} onChange={e => setForm({ ...form, metric_target: parseFloat(e.target.value) || 0 })} placeholder="Target" />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={saveBonus} className="bg-orange-600 hover:bg-orange-700" data-testid="save-bonus-btn"><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {bonuses.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No bonuses logged yet</p>
      ) : (
        <div className="space-y-2">
          {bonuses.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-sm">{b.employee_name}</p>
                  <p className="text-xs text-gray-500">{b.description || b.bonus_type} - {b.date}</p>
                  {b.metric_name && <p className="text-xs text-blue-500">{b.metric_name}: {b.metric_value}/{b.metric_target}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={typeColor(b.bonus_type)}>{BONUS_TYPES.find(t => t.value === b.bonus_type)?.label || b.bonus_type}</Badge>
                <p className="font-bold text-orange-600">{fmt(b.amount)}</p>
                <Button variant="ghost" size="sm" onClick={() => deleteBonus(b.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ PAY PERIODS TAB ============
const PayPeriodsTab = ({ token }) => {
  const [periods, setPeriods] = useState([]);
  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [viewing, setViewing] = useState(null);
  const [processing, setProcessing] = useState(null);

  const fetchPeriods = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/pay-periods`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setPeriods(d.pay_periods || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPeriods(); }, [fetchPeriods]);

  const createPeriod = async () => {
    if (!form.start_date || !form.end_date) { toast.error('Dates required'); return; }
    try {
      const res = await fetch(`${API_URL}/api/payroll/pay-periods`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { toast.success('Period created'); setShowForm(false); setForm({}); fetchPeriods(); }
      else { const e = await res.json(); toast.error(e.detail || 'Failed'); }
    } catch (e) { toast.error('Failed'); }
  };

  const runPayroll = async (periodId) => {
    if (!window.confirm('Process payroll for this period? This will calculate pay for all active employees.')) return;
    setProcessing(periodId);
    try {
      const res = await fetch(`${API_URL}/api/payroll/pay-periods/${periodId}/run`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        toast.success(`Payroll processed: ${d.employees_processed} employees, Net: ${fmt(d.total_net)}`);
        fetchPeriods();
      } else { const e = await res.json(); toast.error(e.detail || 'Failed'); }
    } catch (e) { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  const viewStubs = async (periodId) => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/pay-stubs?pay_period_id=${periodId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setStubs(d.stubs || []); setViewing(periodId); }
    } catch (e) { toast.error('Failed'); }
  };

  const downloadStub = async (stub) => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/pay-stubs/${stub.id}/download`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `PayStub_${stub.employee_name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      }
    } catch (e) { toast.error('Download failed'); }
  };

  const statusStyle = (s) => s === 'closed' ? 'bg-gray-100 text-gray-700' : s === 'processed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  if (viewing) {
    const period = periods.find(p => p.id === viewing);
    return (
      <div className="space-y-4" data-testid="pay-stubs-view">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => { setViewing(null); setStubs([]); }} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
          <p className="font-medium">{period?.name || `${period?.start_date} to ${period?.end_date}`}</p>
        </div>
        {stubs.map(s => (
          <Card key={s.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.employee_name}</p>
                <p className="text-xs text-gray-500">{s.department} - {PAY_TYPES.find(t => t.value === s.pay_type)?.label}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right"><p className="text-gray-500">Base</p><p className="font-medium">{fmt(s.base_pay)}</p></div>
                <div className="text-right"><p className="text-gray-500">Commission</p><p className="font-medium text-purple-600">{fmt(s.total_commission)}</p></div>
                <div className="text-right"><p className="text-gray-500">Bonus</p><p className="font-medium text-orange-600">{fmt(s.total_bonus)}</p></div>
                <div className="text-right"><p className="text-gray-500">Tax</p><p className="font-medium text-red-600">-{fmt(s.tax_amount)}</p></div>
                <div className="text-right"><p className="text-gray-500">Net</p><p className="font-bold text-green-600 text-lg">{fmt(s.net_pay)}</p></div>
                <Button size="sm" onClick={() => downloadStub(s)} variant="outline" data-testid={`download-stub-${s.id}`}><Download className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {stubs.length === 0 && <p className="text-center text-gray-400 py-8">No pay stubs for this period yet. Run payroll first.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pay-periods-tab">
      <div className="flex justify-end">
        <Button onClick={() => { setForm({ schedule_type: 'biweekly' }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700" data-testid="add-period-btn"><Plus className="w-4 h-4 mr-1" /> New Pay Period</Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardContent className="p-4 space-y-3">
            <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Period name (e.g., March 1-15, 2026)" />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} data-testid="period-start" /></div>
              <div><label className="text-sm font-medium">End Date</label><Input type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} data-testid="period-end" /></div>
              <div><label className="text-sm font-medium">Pay Date</label><Input type="date" value={form.pay_date || ''} onChange={e => setForm({ ...form, pay_date: e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createPeriod} className="bg-blue-600 hover:bg-blue-700" data-testid="save-period-btn"><Save className="w-4 h-4 mr-1" /> Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {periods.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No pay periods created yet</p>
      ) : (
        <div className="space-y-3">
          {periods.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name || `${p.start_date} to ${p.end_date}`}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{p.start_date} - {p.end_date}</span>
                    {p.pay_date && <span>Pay: {p.pay_date}</span>}
                    {p.employee_count > 0 && <span>{p.employee_count} employees</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === 'processed' && (
                    <div className="text-right">
                      <p className="font-bold text-green-600">{fmt(p.total_net)}</p>
                      <p className="text-xs text-gray-500">Net Payroll</p>
                    </div>
                  )}
                  <Badge className={statusStyle(p.status)}>{p.status}</Badge>
                  {p.status === 'open' && (
                    <Button size="sm" onClick={() => runPayroll(p.id)} disabled={processing === p.id} className="bg-green-600 hover:bg-green-700" data-testid={`run-payroll-${p.id}`}>
                      {processing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1" /> Run Payroll</>}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => viewStubs(p.id)} data-testid={`view-stubs-${p.id}`}><FileText className="w-4 h-4 mr-1" /> Stubs</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ MAIN PAYROLL DASHBOARD ============
export default function PayrollDashboard() {
  const [tab, setTab] = useState('overview');
  const token = localStorage.getItem('auth_token');

  return (
    <div className="p-6" data-testid="payroll-dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-6 h-6 text-green-500" /> Payroll Management</h1>
        <p className="text-gray-500 mt-1">Manage employee pay, commissions, bonuses, and pay periods</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2"><BarChart3 className="w-4 h-4" /> Overview</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2"><Users className="w-4 h-4" /> Employees</TabsTrigger>
          <TabsTrigger value="commissions" className="gap-2" data-testid="commissions-tab-trigger"><Percent className="w-4 h-4" /> Commissions</TabsTrigger>
          <TabsTrigger value="bonuses" className="gap-2" data-testid="bonuses-tab-trigger"><Gift className="w-4 h-4" /> Bonuses</TabsTrigger>
          <TabsTrigger value="periods" className="gap-2" data-testid="periods-tab-trigger"><Calendar className="w-4 h-4" /> Pay Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab token={token} /></TabsContent>
        <TabsContent value="profiles"><ProfilesTab token={token} /></TabsContent>
        <TabsContent value="commissions"><CommissionsTab token={token} /></TabsContent>
        <TabsContent value="bonuses"><BonusesTab token={token} /></TabsContent>
        <TabsContent value="periods"><PayPeriodsTab token={token} /></TabsContent>
      </Tabs>
    </div>
  );
}
