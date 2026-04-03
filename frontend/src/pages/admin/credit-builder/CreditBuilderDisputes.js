import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const CreditBuilderDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ account_id: '', dispute_source: 'equifax', dispute_reason: '', notes: '' });

  useEffect(() => { fetchDisputes(); }, [statusFilter]);
  const fetchDisputes = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/credit-builder/disputes${params}`, AUTH());
      setDisputes(res.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.account_id || !form.dispute_reason) { toast.error('Account ID and reason required'); return; }
    try {
      await api.post('/credit-builder/disputes', { ...form, opened_date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '') }, AUTH());
      toast.success('Dispute created');
      setShowNew(false);
      fetchDisputes();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const isUrgent = (deadline) => {
    if (!deadline) return false;
    try { const dl = new Date(deadline.slice(4) + '-' + deadline.slice(0,2) + '-' + deadline.slice(2,4)); return (dl - new Date()) / 86400000 < 5; } catch { return false; }
  };

  return (
    <div className="space-y-6" data-testid="cb-disputes">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispute Log</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-2" />New Dispute</Button>
      </div>
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {showNew && (
        <Card><CardContent className="p-6 space-y-3">
          <h3 className="font-semibold">New Dispute</h3>
          <Input placeholder="Account ID" value={form.account_id} onChange={e => setForm({...form, account_id: e.target.value})} />
          <select value={form.dispute_source} onChange={e => setForm({...form, dispute_source: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
            <option value="equifax">Equifax</option><option value="experian">Experian</option><option value="transunion">TransUnion</option><option value="direct_consumer">Direct Consumer</option>
          </select>
          <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={3} placeholder="Reason" value={form.dispute_reason} onChange={e => setForm({...form, dispute_reason: e.target.value})} />
          <div className="flex gap-2"><Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button><Button className="bg-emerald-600" onClick={handleCreate}>Create</Button></div>
        </CardContent></Card>
      )}
      <Card>
        {loading ? <CardContent className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" /></CardContent> : disputes.length === 0 ? (
          <CardContent className="p-12 text-center"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="font-semibold">No Disputes</p></CardContent>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left text-gray-500">Account</th><th className="px-4 py-3 text-left text-gray-500">Source</th><th className="px-4 py-3 text-left text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-gray-500">Opened</th><th className="px-4 py-3 text-left text-gray-500">Deadline</th>
          </tr></thead><tbody className="divide-y">{disputes.map(d => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{d.account_id?.slice(0,12)}</td>
              <td className="px-4 py-3 capitalize">{d.dispute_source}</td>
              <td className="px-4 py-3"><Badge className={d.status === 'open' ? 'bg-yellow-100 text-yellow-700' : d.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{d.status}</Badge></td>
              <td className="px-4 py-3">{d.opened_date}</td>
              <td className={`px-4 py-3 ${isUrgent(d.deadline_date) ? 'text-red-600 font-bold' : ''}`}>{d.deadline_date || '—'}</td>
            </tr>
          ))}</tbody></table></div>
        )}
      </Card>
    </div>
  );
};

export default CreditBuilderDisputes;
