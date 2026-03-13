import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Scale, Gavel, DollarSign, Users, AlertTriangle,
  Loader2, ArrowUpRight, Plus, BarChart3
} from 'lucide-react';
import api from '../../../utils/api';

export default function LegalDashboard() {
  const [stats, setStats] = useState({ lawsuits: 0, cases: 0, attorneys: 0 });
  const [recentLawsuits, setRecentLawsuits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [lawRes, caseRes] = await Promise.all([
        api.get('/lawsuits').catch(() => ({ data: { lawsuits: [] } })),
        api.get('/cases').catch(() => ({ data: { cases: [] } })),
      ]);
      const lawsuits = lawRes.data?.lawsuits || lawRes.data || [];
      const cases = caseRes.data?.cases || caseRes.data || [];
      setStats({ lawsuits: lawsuits.length, cases: cases.length });
      setRecentLawsuits(lawsuits.slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6" data-testid="legal-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal Dashboard</h1>
        <p className="text-gray-500 mt-1">Cases, lawsuits, and attorney management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI icon={Scale} label="Lawsuits Filed" value={stats.lawsuits} color="bg-red-500" />
        <KPI icon={Gavel} label="Active Cases" value={stats.cases} color="bg-blue-500" />
        <KPI icon={DollarSign} label="Revenue Splits" value="View" color="bg-green-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Lawsuits</CardTitle>
              <Link to="/admin/lawsuits" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentLawsuits.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No lawsuits filed yet.</p>
            ) : (
              <div className="space-y-2">
                {recentLawsuits.map((l, i) => (
                  <div key={l.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{l.title || l.case_name || '-'}</p>
                      <p className="text-xs text-gray-500">{l.filed_date || l.created_at?.split('T')[0]}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{l.status || 'active'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/marketplace" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium text-blue-700">
                <Gavel className="w-4 h-4" /> Case Management
              </Link>
              <Link to="/admin/cases/new" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium text-green-700">
                <Plus className="w-4 h-4" /> Submit Case
              </Link>
              <Link to="/admin/attorneys" className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-sm font-medium text-purple-700">
                <Users className="w-4 h-4" /> Attorney Network
              </Link>
              <Link to="/admin/revenue/splits" className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-sm font-medium text-orange-700">
                <DollarSign className="w-4 h-4" /> Revenue Splits
              </Link>
            </div>
          </CardContent>
        </Card>
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
