import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const STATUS_LABELS = { '11': 'Current', '71': '30-59', '78': '60-89', '80': '90-119', '82': '120-149', '83': '150-179', '84': '180+', '97': 'Charge-Off' };
const STATUS_COLOR = { '11': 'bg-green-100 text-green-800', '97': 'bg-red-200 text-red-900' };

const CreditBuilderAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchAccounts(); }, [page, statusFilter, tierFilter]);

  const fetchAccounts = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter) params.set('plan_tier', tierFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/credit-builder/accounts?${params}`, AUTH());
      setAccounts(res.data?.accounts || []);
      setTotal(res.data?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6" data-testid="cb-accounts-list">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Client Accounts</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/admin/credit-builder/accounts/new')} data-testid="new-account-btn">
          <Plus className="w-4 h-4 mr-2" />New Account
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search name or account #..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchAccounts()} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="11">Current</option>
          <option value="71">Delinquent (30-59)</option>
          <option value="97">Charge-Off</option>
        </select>
        <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Tiers</option>
          <option value="starter">Starter ($750)</option>
          <option value="standard">Standard ($1,500)</option>
          <option value="premium">Premium ($2,500)</option>
          <option value="elite">Elite ($3,500)</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <CardContent className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" /></CardContent>
        ) : accounts.length === 0 ? (
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold">No Accounts Found</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="px-4 py-3 text-left text-gray-500">Account #</th>
                <th className="px-4 py-3 text-left text-gray-500">Client Name</th>
                <th className="px-4 py-3 text-left text-gray-500">Tier</th>
                <th className="px-4 py-3 text-left text-gray-500">Limit</th>
                <th className="px-4 py-3 text-left text-gray-500">Balance</th>
                <th className="px-4 py-3 text-left text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-gray-500">Opened</th>
              </tr></thead>
              <tbody className="divide-y">
                {accounts.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/credit-builder/accounts/${a.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs">{a.account_number}</td>
                    <td className="px-4 py-3 font-medium">{a.first_name} {a.last_name}</td>
                    <td className="px-4 py-3 capitalize">{a.plan_tier}</td>
                    <td className="px-4 py-3">${a.credit_limit?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">${a.current_balance}</td>
                    <td className="px-4 py-3"><Badge className={STATUS_COLOR[a.account_status_code] || 'bg-amber-100 text-amber-800'}>{STATUS_LABELS[a.account_status_code] || a.account_status_code}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{a.date_opened}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {total > 25 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500 flex items-center">Page {page}</span>
          <Button variant="outline" size="sm" disabled={accounts.length < 25} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default CreditBuilderAccounts;
