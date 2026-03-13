import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  CreditCard, DollarSign, TrendingUp, BarChart3,
  Loader2, ArrowUpRight, Phone, Wallet
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinanceDashboard() {
  const [payroll, setPayroll] = useState({});
  const [commissions, setCommissions] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth_token');

  const fetchData = useCallback(async () => {
    try {
      const [payRes, commRes] = await Promise.all([
        fetch(`${API_URL}/api/payroll/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/collections/commission-dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (payRes.ok) setPayroll(await payRes.json());
      if (commRes.ok) { const d = await commRes.json(); setCommissions(d.summary || {}); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6" data-testid="finance-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-500 mt-1">Revenue, billing, and financial overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={DollarSign} label="Commission Earned" value={fmt(commissions.total_earned)} color="bg-green-500" />
        <KPI icon={TrendingUp} label="Projected Revenue" value={fmt(commissions.total_projected)} color="bg-blue-500" />
        <KPI icon={Wallet} label="Annual Salaries" value={fmt(payroll.total_annual_salaries)} color="bg-purple-500" />
        <KPI icon={CreditCard} label="Month Bonuses" value={fmt(payroll.month_bonuses)} color="bg-orange-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Financial Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Row label="Total Commissions Earned" value={fmt(commissions.total_earned)} />
              <Row label="Collection Fees Earned" value={fmt(commissions.collection_fee_earned)} />
              <Row label="Base Commissions (20%)" value={fmt(commissions.base_commission_earned)} />
              <Row label="Pending Commissions" value={fmt(commissions.total_pending)} />
              <Row label="Projected Additional" value={fmt(commissions.projected_additional)} />
              <div className="border-t pt-2 mt-2">
                <Row label="Total Projected" value={fmt(commissions.total_projected)} bold />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/billing" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium text-blue-700">
                <CreditCard className="w-4 h-4" /> Billing
              </Link>
              <Link to="/admin/payroll" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium text-green-700">
                <Wallet className="w-4 h-4" /> Payroll
              </Link>
              <Link to="/admin/collections/commissions-dashboard" className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-sm font-medium text-yellow-700">
                <BarChart3 className="w-4 h-4" /> Commissions
              </Link>
              <Link to="/admin/collections" className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-sm font-medium text-indigo-700">
                <Phone className="w-4 h-4" /> Collections
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
      <span className={`text-sm ${bold ? 'font-bold' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-green-600' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
