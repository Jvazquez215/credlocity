import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import {
  Scale, Users, CheckCircle, XCircle, Clock, DollarSign, Briefcase, Search, RefreshCw, Eye
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  active: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  suspended: { color: 'bg-red-100 text-red-700', icon: XCircle },
  inactive: { color: 'bg-gray-100 text-gray-600', icon: XCircle }
};

export default function AttorneyManagement() {
  const [attorneys, setAttorneys] = useState([]);
  const [stats, setStats] = useState({ attorneys: {}, cases: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAttorney, setSelectedAttorney] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    fetchAttorneys();
    fetchStats();
  }, [search, statusFilter]);

  const fetchAttorneys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/attorneys/admin/list?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttorneys(data.attorneys || []);
      }
    } catch (error) {
      console.error('Failed to fetch attorneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/attorneys/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApproval = async (action) => {
    if (!selectedAttorney) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/attorneys/admin/${selectedAttorney.id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: approvalNotes })
      });
      if (res.ok) {
        toast.success(`Attorney ${action}d successfully`);
        setApprovalModal(false);
        setSelectedAttorney(null);
        setApprovalNotes('');
        fetchAttorneys();
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Operation failed');
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const viewAttorney = async (attorney) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/attorneys/admin/${attorney.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedAttorney(await res.json());
        setViewModal(true);
      }
    } catch (error) {
      toast.error('Failed to load attorney details');
    }
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />{status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attorney Network</h1>
          <p className="text-gray-500">Manage attorney affiliates and cases</p>
        </div>
        <Button variant="outline" onClick={() => { fetchAttorneys(); fetchStats(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Scale className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.attorneys?.total || 0}</p>
                <p className="text-xs text-gray-500">Total Attorneys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.attorneys?.active || 0}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.attorneys?.pending_approval || 0}</p>
                <p className="text-xs text-gray-500">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Briefcase className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.cases?.total || 0}</p>
                <p className="text-xs text-gray-500">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.cases?.resolved || 0}</p>
                <p className="text-xs text-gray-500">Resolved Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, email, firm, bar number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attorney</TableHead>
                <TableHead>Firm</TableHead>
                <TableHead>Bar #</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Cases</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : attorneys.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No attorneys found</TableCell></TableRow>
              ) : attorneys.map(attorney => (
                <TableRow key={attorney.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{attorney.full_name}</p>
                      <p className="text-xs text-gray-500">{attorney.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{attorney.firm_name}</TableCell>
                  <TableCell><code className="text-xs bg-gray-100 px-1 rounded">{attorney.bar_number}</code></TableCell>
                  <TableCell>{attorney.state}</TableCell>
                  <TableCell>
                    <span className="font-medium">{attorney.cases_resolved || 0}</span>
                    <span className="text-gray-400">/{attorney.cases_assigned || 0}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(attorney.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => viewAttorney(attorney)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {attorney.status === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => { setSelectedAttorney(attorney); setApprovalModal(true); }}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />Attorney Details
            </DialogTitle>
          </DialogHeader>
          {selectedAttorney && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedAttorney.full_name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{selectedAttorney.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{selectedAttorney.phone || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Bar Number</p>
                  <p className="font-medium">{selectedAttorney.bar_number} ({selectedAttorney.state})</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Firm</p>
                <p className="font-medium">{selectedAttorney.firm_name}</p>
                <p className="text-sm text-gray-600">{selectedAttorney.firm_address}, {selectedAttorney.firm_city}, {selectedAttorney.firm_state} {selectedAttorney.firm_zip}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{selectedAttorney.cases_resolved || 0}</p>
                  <p className="text-xs text-gray-500">Cases Resolved</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{selectedAttorney.cases_assigned || 0}</p>
                  <p className="text-xs text-gray-500">Cases Assigned</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">${selectedAttorney.total_earnings?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                </div>
              </div>
              {selectedAttorney.bio && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Bio</p>
                  <p className="text-sm">{selectedAttorney.bio}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Referral Code</p>
                  <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">{selectedAttorney.referral_code}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission Rate</p>
                  <p className="text-lg font-bold">{(selectedAttorney.commission_rate * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={approvalModal} onOpenChange={setApprovalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Attorney Application</DialogTitle>
          </DialogHeader>
          {selectedAttorney && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedAttorney.full_name}</p>
                <p className="text-sm text-gray-500">{selectedAttorney.firm_name}</p>
                <p className="text-sm text-gray-500">Bar: {selectedAttorney.bar_number} ({selectedAttorney.state})</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea 
                  value={approvalNotes} 
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApprovalModal(false)}>Cancel</Button>
            <Button variant="outline" className="text-red-600 border-red-200" onClick={() => handleApproval('reject')}>
              <XCircle className="w-4 h-4 mr-1" />Reject
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApproval('approve')}>
              <CheckCircle className="w-4 h-4 mr-1" />Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
