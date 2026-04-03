import React, { useState, useEffect } from 'react';
import {
  Building2, Search, RefreshCw, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Users, DollarSign, Briefcase, Eye,
  AlertTriangle, Ban, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getStatusBadge = (status) => {
  const map = {
    pending: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    approved: { bg: 'bg-green-100 text-green-800', label: 'Approved' },
    active: { bg: 'bg-blue-100 text-blue-800', label: 'Active' },
    suspended: { bg: 'bg-orange-100 text-orange-800', label: 'Suspended' },
    banned: { bg: 'bg-red-100 text-red-800', label: 'Banned' },
  };
  const s = map[status] || { bg: 'bg-gray-100 text-gray-800', label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>{s.label}</span>;
};

const formatCurrency = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt || 0);

export default function CROManagement() {
  const [cros, setCros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedCRO, setExpandedCRO] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('auth_token');

  const fetchCROs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API_URL}/api/cro/admin/list?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCros(data.cros || data.organizations || []);
      } else {
        toast.error('Failed to load CROs');
      }
    } catch {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCROs(); }, [statusFilter]);

  const updateStatus = async (croId, newStatus) => {
    setActionLoading(croId);
    try {
      const res = await fetch(`${API_URL}/api/cro/admin/${croId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`CRO status updated to ${newStatus}`);
        fetchCROs();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = cros.filter(c =>
    !search ||
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: cros.length,
    pending: cros.filter(c => c.status === 'pending').length,
    approved: cros.filter(c => c.status === 'approved' || c.status === 'active').length,
    suspended: cros.filter(c => c.status === 'suspended').length,
  };

  return (
    <div data-testid="cro-management">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" /> CRO Management
          </h1>
          <p className="text-gray-500 mt-1">Manage Credit Repair Organization partners</p>
        </div>
        <Button onClick={fetchCROs} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total CROs', value: stats.total, icon: Building2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Suspended', value: stats.suspended, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, owner, or email..." className="pl-9" data-testid="cro-management-search" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" data-testid="cro-management-filter">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* CRO List */}
      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No CROs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCRO(expandedCRO === c.id ? null : c.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{c.company_name}</span>
                      {getStatusBadge(c.status)}
                      {c.signup_fee_paid && <span className="text-green-600 text-xs font-medium">Fee Paid</span>}
                      {c.promo_code_used && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">Promo: {c.promo_code_used}</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{c.owner_name} &middot; {c.email} &middot; {c.state}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{c.total_cases_submitted || 0} cases</p>
                      <p className="text-xs text-gray-500">{formatCurrency(c.total_earnings)}</p>
                    </div>
                    {expandedCRO === c.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {expandedCRO === c.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><p className="text-gray-500">EIN</p><p className="font-medium">{c.ein}</p></div>
                      <div><p className="text-gray-500">Phone</p><p className="font-medium">{c.phone}</p></div>
                      <div><p className="text-gray-500">Referral Code</p><p className="font-mono font-medium">{c.referral_code}</p></div>
                      <div><p className="text-gray-500">Registered</p><p className="font-medium">{new Date(c.created_at).toLocaleDateString()}</p></div>
                      <div><p className="text-gray-500">Signup Fee</p><p className="font-medium">{c.signup_fee_paid ? 'Paid' : 'Not Paid'}</p></div>
                      <div><p className="text-gray-500">Subscription</p><p className="font-medium">{c.subscription_active ? 'Active' : 'Inactive'}</p></div>
                      <div><p className="text-gray-500">Total Cases</p><p className="font-medium">{c.total_cases_submitted || 0}</p></div>
                      <div><p className="text-gray-500">Strikes</p><p className="font-medium">{c.enforcement_strikes || 0}/3</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {c.status === 'pending' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'approved'); }} disabled={actionLoading === c.id} data-testid={`approve-cro-${c.id}`}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {['pending', 'approved', 'active'].includes(c.status) && (
                        <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'suspended'); }} disabled={actionLoading === c.id}>
                          <AlertTriangle className="w-4 h-4 mr-1" /> Suspend
                        </Button>
                      )}
                      {c.status === 'suspended' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'approved'); }} disabled={actionLoading === c.id}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Reactivate
                        </Button>
                      )}
                      {c.status !== 'banned' && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'banned'); }} disabled={actionLoading === c.id}>
                          <Ban className="w-4 h-4 mr-1" /> Ban
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
