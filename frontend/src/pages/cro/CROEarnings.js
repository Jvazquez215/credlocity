import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export default function CROEarnings({ token }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cro/earnings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setEarnings(await res.json());
    } catch {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEarnings(); }, []);

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div data-testid="cro-earnings">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings Tracker</h1>
          <p className="text-gray-500 mt-1">Track your payouts from attorney pledges and bids</p>
        </div>
        <Button onClick={fetchEarnings} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full"><DollarSign className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Lifetime Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings?.lifetime_earnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full"><Clock className="w-6 h-6 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(earnings?.pending_payouts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Payouts</p>
                <p className="text-2xl font-bold">{(earnings?.paid_count || 0) + (earnings?.pending_count || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>All payouts from attorney pledges and bid awards</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings?.payouts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-500">Date</th>
                    <th className="pb-3 font-medium text-gray-500">Case</th>
                    <th className="pb-3 font-medium text-gray-500">Type</th>
                    <th className="pb-3 font-medium text-gray-500">Amount</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payouts.map(p => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-3 font-mono text-xs">{p.case_number || p.case_id?.slice(0, 8)}</td>
                      <td className="py-3 capitalize">{p.type || 'pledge'}</td>
                      <td className="py-3 font-medium text-green-600">{formatCurrency(p.amount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {p.status === 'paid' ? <><CheckCircle className="w-3 h-3 inline mr-1" />Paid</> : <><Clock className="w-3 h-3 inline mr-1" />Pending</>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payouts yet</p>
              <p className="text-sm mt-1">Submit cases and earn 80% when attorneys pledge or win bids</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-800">
        <p className="font-medium">How Earnings Work</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>When an attorney pledges on your case, they pay a $400 pledge fee</li>
          <li>You receive 80% ($320) and Credlocity retains 20% ($80) as a platform fee</li>
          <li>For bidding cases, your 80% share is based on the winning bid amount</li>
          <li>Payouts are processed within 7 business days</li>
        </ul>
      </div>
    </div>
  );
}
