import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, AlertTriangle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const CPRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [missingClients, setMissingClients] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/cpr/dashboard', AUTH()),
      api.get('/cpr/shar/payouts', AUTH()),
      api.get('/cpr/clients?missing_items=true', AUTH()),
    ]).then(([d, p, m]) => {
      setStats(d.data);
      setPayouts(p.data || []);
      setMissingClients(m.data || []);
    }).catch(console.error);
  }, []);

  if (!stats) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6" data-testid="cpr-dashboard">
      <h1 className="text-2xl font-bold">CPR Merger Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Total Clients</p><p className="text-xl font-bold">{stats.total_clients}</p><p className="text-[10px] text-gray-400">{stats.legacy_count} Legacy | {stats.shar_count} Shar | {stats.new_credlocity_count} New</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Revenue YTD</p><p className="text-xl font-bold text-emerald-700">${stats.total_revenue_ytd?.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Mailing YTD</p><p className="text-xl font-bold text-red-600">${stats.total_mailing_ytd?.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Shar Payout YTD</p><p className="text-xl font-bold">${stats.shar_payout_paid_ytd?.toLocaleString()}</p><p className="text-[10px] text-gray-400">Calc: ${stats.shar_payout_calculated_ytd?.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Missing Items</p><p className="text-xl font-bold text-red-600">{stats.missing_items_count}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Action Needed</p><p className="text-xl font-bold text-amber-600">{stats.action_needed_count}</p></CardContent></Card>
        <Card className="cursor-pointer hover:shadow-lg" onClick={() => navigate('/admin/cpr/clients')}><CardContent className="p-4"><p className="text-xs text-gray-500">View All</p><p className="text-xl font-bold text-blue-600">→</p></CardContent></Card>
      </div>

      {/* Shar Payout Status */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" />Shar Payout Status</CardTitle></CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No payouts recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="px-4 py-2 text-left text-gray-500">Month</th>
                  <th className="px-4 py-2 text-left text-gray-500">Calculated</th>
                  <th className="px-4 py-2 text-left text-gray-500">Paid</th>
                  <th className="px-4 py-2 text-left text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-gray-500">Balance</th>
                </tr></thead>
                <tbody className="divide-y">
                  {payouts.map(p => (
                    <tr key={p.id} className={p.balance === 0 ? 'bg-green-50' : p.balance < 0 ? 'bg-red-50' : 'bg-amber-50'}>
                      <td className="px-4 py-2 font-medium">{p.month}</td>
                      <td className="px-4 py-2">${p.calculated_amount?.toFixed(2)}</td>
                      <td className="px-4 py-2 font-medium">${p.actual_paid?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-gray-500">{p.payment_date}</td>
                      <td className="px-4 py-2">
                        <Badge className={p.balance === 0 ? 'bg-green-100 text-green-800' : p.balance < 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                          ${p.balance?.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing Items Alert */}
      {missingClients.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />Missing Items Alert</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="px-4 py-2 text-left text-gray-500">Client</th>
                <th className="px-4 py-2 text-left text-gray-500">Category</th>
                <th className="px-4 py-2 text-left text-gray-500">Missing Items</th>
              </tr></thead>
              <tbody className="divide-y">
                {missingClients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/cpr/clients/${c.id}`)}>
                    <td className="px-4 py-2 font-medium">{c.full_name}</td>
                    <td className="px-4 py-2"><CategoryBadge cat={c.category} /></td>
                    <td className="px-4 py-2"><div className="flex gap-1 flex-wrap">{(c.missing_items || []).map((m, i) => <Badge key={i} className="bg-red-100 text-red-700 text-[10px]">{m.replace(/_/g, ' ')}</Badge>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CategoryBadge = ({ cat }) => {
  const colors = { legacy_cpr: 'bg-purple-100 text-purple-700', shar_active: 'bg-teal-100 text-teal-700', new_credlocity: 'bg-blue-100 text-blue-700' };
  const labels = { legacy_cpr: 'Legacy CPR', shar_active: 'Shar Active', new_credlocity: 'New Credlocity' };
  return <Badge className={colors[cat] || ''}>{labels[cat] || cat}</Badge>;
};

export { CategoryBadge };
export default CPRDashboard;
