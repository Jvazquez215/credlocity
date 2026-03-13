import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  DollarSign, TrendingUp, Clock, CheckCircle, Trophy,
  Loader2, BarChart3, Target, ArrowUpRight
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CommissionDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth_token');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/collections/commission-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!data) return <p className="text-center text-gray-400 py-20">Failed to load commission data</p>;

  const { summary, trackers, commissions, leaderboard, is_admin } = data;

  return (
    <div className="p-6 space-y-6" data-testid="commission-dashboard">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-blue-500" /> Commission Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your earnings, active accounts, and commission progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="summary-cards">
        <SummaryCard icon={DollarSign} label="Total Earned" value={fmt(summary.total_earned)} color="green" sub={`Paid: ${fmt(summary.total_paid)}`} />
        <SummaryCard icon={Clock} label="Pending" value={fmt(summary.total_pending)} color="yellow" sub={`${summary.active_trackers} active tracker(s)`} />
        <SummaryCard icon={TrendingUp} label="Projected Total" value={fmt(summary.total_projected)} color="blue" sub={`+${fmt(summary.projected_additional)} if all pay`} />
        <SummaryCard icon={Target} label="Collection Fees" value={fmt(summary.collection_fee_earned)} color="emerald" sub={`Base 20%: ${fmt(summary.base_commission_earned)}`} />
      </div>

      <Tabs defaultValue="trackers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trackers" data-testid="trackers-tab"><Target className="w-4 h-4 mr-1" /> Active Trackers</TabsTrigger>
          <TabsTrigger value="history" data-testid="history-tab"><CheckCircle className="w-4 h-4 mr-1" /> Commission History</TabsTrigger>
          {is_admin && <TabsTrigger value="leaderboard" data-testid="leaderboard-tab"><Trophy className="w-4 h-4 mr-1" /> Leaderboard</TabsTrigger>}
        </TabsList>

        {/* ACTIVE TRACKERS */}
        <TabsContent value="trackers">
          <Card>
            <CardHeader><CardTitle>Active Commission Trackers</CardTitle></CardHeader>
            <CardContent>
              {trackers.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No active commission trackers yet. Create a payment plan to start tracking.</p>
              ) : (
                <div className="space-y-3">
                  {trackers.map(t => {
                    const pct = t.total_owed > 0 ? Math.min(100, (t.total_collected / t.total_owed) * 100) : 0;
                    const thresholdPct = t.threshold_percent || 70;
                    const isUnlocked = t.threshold_met;
                    return (
                      <div key={t.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-testid={`tracker-${t.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{t.client_name}</span>
                            <Badge variant="outline" className="text-xs">Tier {t.tier}</Badge>
                            {!is_admin && <span className="text-xs text-gray-400">Rep: {t.rep_name}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {isUnlocked ? (
                              <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Unlocked</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> {thresholdPct}% Threshold</Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isUnlocked ? 'bg-green-500' : pct >= thresholdPct ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                          {/* Threshold marker */}
                          <div
                            className="absolute top-0 h-full w-0.5 bg-red-500"
                            style={{ left: `${thresholdPct}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold mix-blend-difference text-white">
                            {pct.toFixed(1)}% collected
                          </span>
                        </div>

                        <div className="grid grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Total Owed</p>
                            <p className="font-semibold">{fmt(t.total_owed)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Collected</p>
                            <p className="font-semibold text-blue-600">{fmt(t.total_collected)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Threshold</p>
                            <p className="font-semibold text-red-600">{fmt(t.threshold_amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Collection Fee</p>
                            <p className="font-semibold text-green-600">{fmt(t.collection_fee_collected)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">20% Commission</p>
                            <p className={`font-semibold ${isUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
                              {fmt(t.commission_amount)} {isUnlocked ? '' : '(locked)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMMISSION HISTORY */}
        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No commissions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Account</th>
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">Description</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map(c => (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 text-gray-600">{c.date || c.created_at?.split('T')[0]}</td>
                          <td className="py-3 font-medium">{c.account_name || '-'}</td>
                          <td className="py-3">
                            <Badge variant="outline" className={c.commission_type === 'collection_fee' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}>
                              {c.commission_type === 'collection_fee' ? 'Collection Fee' : '20% Commission'}
                            </Badge>
                          </td>
                          <td className="py-3 text-gray-500 max-w-xs truncate">{c.description}</td>
                          <td className="py-3 text-right font-bold text-green-600">{fmt(c.commission_amount)}</td>
                          <td className="py-3">
                            <Badge className={c.status === 'paid' ? 'bg-green-100 text-green-700' : c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}>
                              {c.status}
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
        </TabsContent>

        {/* LEADERBOARD (Admin Only) */}
        {is_admin && (
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Commission Leaderboard</CardTitle></CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No commission data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((rep, i) => (
                      <div key={rep.rep_id} className={`flex items-center justify-between p-4 rounded-lg border ${i === 0 ? 'bg-yellow-50 border-yellow-200' : i === 1 ? 'bg-gray-50 border-gray-200' : i === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-200 text-yellow-800' : i === 1 ? 'bg-gray-200 text-gray-800' : i === 2 ? 'bg-orange-200 text-orange-800' : 'bg-blue-100 text-blue-700'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{rep.rep_name}</p>
                            <p className="text-xs text-gray-500">{rep.count} commission(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Collection Fees</p>
                            <p className="font-medium text-emerald-600">{fmt(rep.collection_fees)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Base Commissions</p>
                            <p className="font-medium text-blue-600">{fmt(rep.base_commissions)}</p>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold text-green-600 flex items-center gap-1">{fmt(rep.total_commission)} <ArrowUpRight className="w-4 h-4" /></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`} data-testid={`summary-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-xs font-medium opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}
