import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Check, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { CategoryBadge } from './CPRDashboard';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const CPRClientList = ({ filterCategory }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState(filterCategory || '');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchClients(); }, [catFilter, statusFilter]);

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams();
      if (catFilter) params.set('category', catFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/cpr/clients?${params}`, AUTH());
      setClients(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const statusBadge = (s) => {
    const map = { active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-700', on_hold: 'bg-amber-100 text-amber-700', closed: 'bg-gray-100 text-gray-600', action_needed: 'bg-red-100 text-red-700', critical: 'bg-red-200 text-red-900', blocked: 'bg-gray-200 text-gray-800' };
    return <Badge className={map[s] || ''}>{s?.replace('_',' ')}</Badge>;
  };

  const title = filterCategory ? { legacy_cpr: 'Legacy CPR Clients', shar_active: 'Shar Active Clients', new_credlocity: 'New Credlocity Clients' }[filterCategory] || 'All Clients' : 'All Clients';

  return (
    <div className="space-y-6" data-testid="cpr-client-list">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/admin/cpr/clients/new')} data-testid="add-client-btn">
          <Plus className="w-4 h-4 mr-2" />Add Client
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchClients()} />
        </div>
        {!filterCategory && (
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories</option>
            <option value="legacy_cpr">Legacy CPR</option>
            <option value="shar_active">Shar Active</option>
            <option value="new_credlocity">New Credlocity</option>
          </select>
        )}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="on_hold">On Hold</option>
          <option value="action_needed">Action Needed</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <CardContent className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" /></CardContent>
        ) : clients.length === 0 ? (
          <CardContent className="p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="font-semibold">No Clients Found</p></CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="px-4 py-3 text-left text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-gray-500">Payment</th>
                <th className="px-4 py-3 text-center text-gray-500">CR</th>
                <th className="px-4 py-3 text-center text-gray-500">Notary</th>
                <th className="px-4 py-3 text-center text-gray-500">3B</th>
                <th className="px-4 py-3 text-left text-gray-500">Missing</th>
              </tr></thead>
              <tbody className="divide-y">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/cpr/clients/${c.id}`)}>
                    <td className="px-4 py-3 font-medium">{c.full_name}</td>
                    <td className="px-4 py-3"><CategoryBadge cat={c.category} /></td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600 text-xs">{c.payment_method}</td>
                    <td className="px-4 py-3 text-center">{c.cr_monitoring_active ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">{c.notary_completed ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">{c.three_b_report_completed ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                    <td className="px-4 py-3">{(c.missing_items || []).length > 0 && <Badge className="bg-red-100 text-red-700 text-[10px]">{c.missing_items.length}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CPRClientList;
