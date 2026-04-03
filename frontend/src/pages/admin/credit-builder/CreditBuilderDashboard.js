import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Users, ShoppingBag, AlertCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const STATUS_LABELS = { '11': 'Current', '71': '30-59 Late', '78': '60-89 Late', '80': '90-119 Late', '82': '120-149 Late', '83': '150-179 Late', '84': '180+ Late', '97': 'Charge-Off' };
const STATUS_COLOR = { '11': 'bg-green-100 text-green-800', '71': 'bg-amber-100 text-amber-800', '78': 'bg-amber-100 text-amber-800', '80': 'bg-orange-100 text-orange-800', '82': 'bg-orange-100 text-orange-800', '83': 'bg-red-100 text-red-800', '84': 'bg-red-100 text-red-800', '97': 'bg-red-200 text-red-900' };

const CreditBuilderDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/credit-builder/dashboard', AUTH()),
      api.get('/credit-builder/accounts?limit=10', AUTH()),
      api.get('/credit-builder/disputes?status=open', AUTH()),
    ]).then(([d, a, disp]) => {
      setData(d.data);
      setAccounts(a.data?.accounts || []);
      setDisputes(disp.data || []);
    }).catch(console.error);
  }, []);

  if (!data) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6" data-testid="credit-builder-dashboard">
      <h1 className="text-2xl font-bold">Credit Builder Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Accounts', val: data.total_accounts, icon: Users, color: 'text-blue-600' },
          { label: 'Active Accounts', val: data.active_accounts, icon: CreditCard, color: 'text-green-600' },
          { label: 'Delinquent', val: data.total_accounts - data.active_accounts, icon: AlertCircle, color: 'text-amber-600' },
          { label: 'Open Disputes', val: data.open_disputes_count, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Total Balance', val: `$${(data.total_current_balance || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Last Cycle', val: data.last_reporting_cycle_date || 'N/A', icon: Calendar, color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-bold">{s.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Accounts */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Recent Accounts</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No accounts yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="px-3 py-2 text-left text-gray-500">Account #</th>
                  <th className="px-3 py-2 text-left text-gray-500">Name</th>
                  <th className="px-3 py-2 text-left text-gray-500">Tier</th>
                  <th className="px-3 py-2 text-left text-gray-500">Limit</th>
                  <th className="px-3 py-2 text-left text-gray-500">Balance</th>
                  <th className="px-3 py-2 text-left text-gray-500">Status</th>
                </tr></thead>
                <tbody className="divide-y">
                  {accounts.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/credit-builder/accounts/${a.id}`)}>
                      <td className="px-3 py-2 font-mono text-xs">{a.account_number}</td>
                      <td className="px-3 py-2 font-medium">{a.first_name} {a.last_name}</td>
                      <td className="px-3 py-2 capitalize">{a.plan_tier}</td>
                      <td className="px-3 py-2">${a.credit_limit?.toLocaleString()}</td>
                      <td className="px-3 py-2">${a.current_balance}</td>
                      <td className="px-3 py-2"><Badge className={STATUS_COLOR[a.account_status_code] || ''}>{STATUS_LABELS[a.account_status_code] || a.account_status_code}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Disputes */}
      {disputes.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" />Open Disputes</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="px-3 py-2 text-left text-gray-500">Account</th>
                  <th className="px-3 py-2 text-left text-gray-500">Source</th>
                  <th className="px-3 py-2 text-left text-gray-500">Status</th>
                  <th className="px-3 py-2 text-left text-gray-500">Deadline</th>
                </tr></thead>
                <tbody className="divide-y">
                  {disputes.map(d => {
                    const isUrgent = d.deadline_date && (() => {
                      try { const dl = new Date(d.deadline_date.slice(4) + '-' + d.deadline_date.slice(0,2) + '-' + d.deadline_date.slice(2,4)); return (dl - new Date()) / 86400000 < 5; } catch { return false; }
                    })();
                    return (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs">{d.account_id?.slice(0,8)}</td>
                        <td className="px-3 py-2 capitalize">{d.dispute_source}</td>
                        <td className="px-3 py-2"><Badge className="bg-yellow-100 text-yellow-700">{d.status}</Badge></td>
                        <td className={`px-3 py-2 ${isUrgent ? 'text-red-600 font-bold' : ''}`}>{d.deadline_date || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditBuilderDashboard;
