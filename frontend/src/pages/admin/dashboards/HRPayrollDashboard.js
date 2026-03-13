import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Users, Wallet, GraduationCap, Shield, DollarSign,
  Loader2, ArrowUpRight, Clock, CheckCircle, BarChart3
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function HRPayrollDashboard() {
  const [payroll, setPayroll] = useState({});
  const [trainingModules, setTrainingModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth_token');

  const fetchData = useCallback(async () => {
    try {
      const [payRes, trainRes] = await Promise.all([
        fetch(`${API_URL}/api/payroll/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/training/modules`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (payRes.ok) setPayroll(await payRes.json());
      if (trainRes.ok) { const d = await trainRes.json(); setTrainingModules(d.modules || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6" data-testid="hr-payroll-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR & Payroll Dashboard</h1>
        <p className="text-gray-500 mt-1">Team management, payroll, and training overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Users} label="Active Employees" value={payroll.active_employees || 0} color="bg-blue-500" />
        <KPI icon={DollarSign} label="Annual Salaries" value={fmt(payroll.total_annual_salaries)} color="bg-green-500" />
        <KPI icon={GraduationCap} label="Training Modules" value={trainingModules.length} color="bg-purple-500" />
        <KPI icon={Wallet} label="Monthly Commissions" value={fmt(payroll.month_commissions)} color="bg-orange-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payroll Summary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payroll Summary</CardTitle>
              <Link to="/admin/payroll" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View details <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Employees</span>
                <span className="font-bold">{payroll.active_employees || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Annual Salary Total</span>
                <span className="font-bold">{fmt(payroll.total_annual_salaries)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Month Commissions</span>
                <span className="font-bold">{fmt(payroll.month_commissions)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Month Bonuses</span>
                <span className="font-bold">{fmt(payroll.month_bonuses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Training Modules</CardTitle>
              <Link to="/admin/training" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            {trainingModules.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No training modules yet.</p>
            ) : (
              <div className="space-y-2">
                {trainingModules.slice(0, 5).map((m, i) => (
                  <div key={m.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{m.title}</p>
                      <p className="text-xs text-gray-500">{m.category || 'General'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{m.status || 'active'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/admin/team" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium text-blue-700">
          <Users className="w-4 h-4" /> Team
        </Link>
        <Link to="/admin/payroll" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium text-green-700">
          <Wallet className="w-4 h-4" /> Payroll
        </Link>
        <Link to="/admin/training" className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-sm font-medium text-purple-700">
          <GraduationCap className="w-4 h-4" /> Training
        </Link>
        <Link to="/admin/security" className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700">
          <Shield className="w-4 h-4" /> Security
        </Link>
      </div>
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
