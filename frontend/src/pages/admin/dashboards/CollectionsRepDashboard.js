import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  DollarSign, TrendingUp, Clock, Target, Phone, Users,
  Loader2, BarChart3, CheckCircle, ArrowUpRight, AlertCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CollectionsRepDashboard() {
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth_token');

  const fetchData = useCallback(async () => {
    try {
      const [commRes, acctRes] = await Promise.all([
        fetch(`${API_URL}/api/collections/commission-dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/collections/accounts?limit=10`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (commRes.ok) setData(await commRes.json());
      if (acctRes.ok) {
        const d = await acctRes.json();
        setAccounts(Array.isArray(d) ? d.slice(0, 5) : (d.accounts || []).slice(0, 5));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const summary = data?.summary || {};
  const trackers = data?.trackers || [];
  const activeTrackers = trackers.filter(t => !t.commission_paid);

  return (
    <div className="space-y-6" data-testid="collections-rep-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Collections Dashboard</h1>
        <p className="text-gray-500 mt-1">Your accounts, commissions, and progress at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Total Earned" value={fmt(summary.total_earned)} color="bg-green-500" />
        <KPICard icon={Clock} label="Pending" value={fmt(summary.total_pending)} color="bg-yellow-500" />
        <KPICard icon={TrendingUp} label="Projected" value={fmt(summary.total_projected)} color="bg-blue-500" />
        <KPICard icon={Target} label="Active Trackers" value={summary.active_trackers || 0} color="bg-indigo-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Commission Trackers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Commission Progress</CardTitle>
              <Link to="/admin/collections/commissions-dashboard" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeTrackers.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No active trackers. Create a payment plan to start.</p>
            ) : (
              <div className="space-y-3">
                {activeTrackers.slice(0, 5).map(t => {
                  const pct = t.total_owed > 0 ? Math.min(100, (t.total_collected / t.total_owed) * 100) : 0;
                  return (
                    <div key={t.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-sm">{t.client_name}</span>
                        <Badge variant="outline" className="text-xs">Tier {t.tier}</Badge>
                      </div>
                      <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                        <div className="absolute top-0 h-full w-0.5 bg-red-400" style={{ left: '70%' }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{fmt(t.total_collected)} of {fmt(t.total_owed)}</span>
                        <span className={pct >= 70 ? 'text-green-600 font-semibold' : ''}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Accounts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Accounts</CardTitle>
              <Link to="/admin/collections/accounts" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No accounts yet.</p>
            ) : (
              <div className="space-y-2">
                {accounts.map((a, i) => (
                  <Link key={a.id || i} to={`/admin/collections/accounts/${a.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium text-sm">{a.client_name || a.debtor_name || '-'}</p>
                      <p className="text-xs text-gray-500">{a.days_past_due || 0} days past due</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{fmt(a.past_due_balance || a.total_owed || 0)}</p>
                      <Badge variant="outline" className="text-xs">{a.account_status || 'active'}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/admin/collections/accounts" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium text-blue-700">
          <Users className="w-4 h-4" /> All Accounts
        </Link>
        <Link to="/admin/collections/commissions-dashboard" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium text-green-700">
          <BarChart3 className="w-4 h-4" /> Commissions
        </Link>
        <Link to="/admin/collections/approvals" className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-sm font-medium text-yellow-700">
          <CheckCircle className="w-4 h-4" /> Approvals
        </Link>
        <Link to="/admin/collections/disputes" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition text-sm font-medium text-red-700">
          <AlertCircle className="w-4 h-4" /> Disputes
        </Link>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
