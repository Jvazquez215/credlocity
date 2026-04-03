import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` });
const fmt = (v) => `$${Math.abs(parseFloat(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const CAT_LABELS = { legacy_cpr: 'Legacy CPR', shar_active: 'Shar Active', new_credlocity: 'New Credlocity' };

const PortfolioPL = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/cpr/portfolio-pl`, { headers: adminHeaders() });
        if (res.ok) setData(await res.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (!data) return <p className="text-center text-gray-400 py-8">Failed to load portfolio data</p>;

  const { categories, payouts, total_paid_to_shar, outstanding_balance, auth_net_monthly, auth_net_months, auth_net_total } = data;

  return (
    <div className="space-y-6" data-testid="portfolio-pl-tab">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-indigo-600" /> Portfolio Financial Summary</h2>
        <Badge variant="outline" className="text-xs">Jan - Jun 2026</Badge>
      </div>

      {/* Category Breakdowns */}
      {['legacy_cpr', 'shar_active', 'new_credlocity'].map(cat => {
        const d = categories[cat];
        if (!d) return null;
        const grossPL = +(d.cr_revenue + d.notary_revenue - d.cr_cost - d.notary_cost - d.mailing_cost).toFixed(2);
        const netEstimate = +(grossPL - auth_net_total / 3).toFixed(2); // Auth.net spread across 3 categories
        return (
          <Card key={cat} className="border-l-4 border-l-indigo-400" data-testid={`portfolio-${cat}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">{CAT_LABELS[cat]}</h3>
                <Badge variant="outline">{d.count} clients {d.canceled_count > 0 ? `(${d.canceled_count} canceled)` : ''}</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {(cat !== 'legacy_cpr') && <tr className="hover:bg-gray-50"><td className="py-2 text-gray-600">Total Rev Revenue</td><td className="py-2 text-right font-mono text-green-700">{fmt(d.rev_revenue)}</td></tr>}
                    <tr className="hover:bg-gray-50"><td className="py-2 text-gray-600">Total CR Revenue</td><td className="py-2 text-right font-mono text-green-700">{fmt(d.cr_revenue)}</td></tr>
                    <tr className="hover:bg-gray-50"><td className="py-2 text-gray-600">Total CR Cost to Us</td><td className="py-2 text-right font-mono text-red-600">-{fmt(d.cr_cost)}</td></tr>
                    <tr className="hover:bg-gray-50"><td className="py-2 text-gray-600">Total Notary Revenue</td><td className="py-2 text-right font-mono text-green-700">{fmt(d.notary_revenue)}</td></tr>
                    <tr className="hover:bg-gray-50"><td className="py-2 text-gray-600">Total Notary Cost to Us</td><td className="py-2 text-right font-mono text-red-600">-{fmt(d.notary_cost)}</td></tr>
                    <tr className="hover:bg-gray-50"><td className="py-2 text-gray-600">Total Mailing Cost</td><td className="py-2 text-right font-mono text-red-600">-{fmt(d.mailing_cost)}</td></tr>
                    <tr className="bg-indigo-50 font-bold"><td className="py-2.5">Gross P&L (before reserve)</td><td className="py-2.5 text-right font-mono">{fmt(grossPL)}</td></tr>
                  </tbody>
                </table>
              </div>
              {/* Notary Waiver Summary */}
              {(d.notary_waivers > 0 || d.notary_discounts > 0) && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                  <p className="font-medium text-orange-800 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Notary Discounts/Waivers</p>
                  <p className="text-orange-700 mt-1">Fully waived: {d.notary_waivers} clients | Discounted: {d.notary_discounts} clients</p>
                  <p className="text-orange-700">Total shortfall vs $39.95 standard: <span className="font-mono font-bold">{fmt(d.total_shortfall)}</span></p>
                </div>
              )}
              {/* Shar/Joe split for SA and NC */}
              {(cat === 'shar_active' || cat === 'new_credlocity') && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Shar's Total</p>
                    <p className="text-lg font-bold text-green-700">{fmt(d.shar_total)}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Joe's Total</p>
                    <p className="text-lg font-bold text-indigo-700">{fmt(d.joe_total)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Auth.net Fee */}
      <Card className="border-l-4 border-l-yellow-400" data-testid="authnet-fee">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-yellow-600" />
            <h3 className="font-bold text-base">Authorize.net Account Fee</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-[10px] text-gray-500 uppercase">Monthly Fee</p><p className="font-bold">${auth_net_monthly.toFixed(2)}</p></div>
            <div><p className="text-[10px] text-gray-500 uppercase">Active Months</p><p className="font-bold">{auth_net_months}</p></div>
            <div><p className="text-[10px] text-gray-500 uppercase">Total Deduction</p><p className="font-bold text-red-600">-${auth_net_total.toFixed(2)}</p></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">This is a portfolio-level fee, NOT per-client. Deducted from overall P&L.</p>
        </CardContent>
      </Card>

      {/* Payments to Shar */}
      <Card className="border-l-4 border-l-green-400" data-testid="shar-payments">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="font-bold text-base">Payments Made to Shar</h3>
          </div>
          {payouts && payouts.length > 0 ? (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500">Date</th><th className="px-4 py-2 text-left text-xs text-gray-500">Description</th><th className="px-4 py-2 text-right text-xs text-gray-500">Amount</th></tr></thead>
                <tbody className="divide-y">
                  {payouts.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.description || p.month || 'Payment'}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-green-700">${(p.actual_paid || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No payments recorded yet</p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center"><p className="text-[10px] text-gray-500 uppercase">Total Paid</p><p className="text-lg font-bold text-green-700">{fmt(total_paid_to_shar)}</p></div>
            <div className="text-center"><p className="text-[10px] text-gray-500 uppercase">Total Owed</p><p className="text-lg font-bold">{fmt(data.total_shar_owed)}</p></div>
            <div className="text-center"><p className="text-[10px] text-gray-500 uppercase">Outstanding</p><p className={`text-lg font-bold ${outstanding_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(outstanding_balance)}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioPL;
