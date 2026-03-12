import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, DollarSign, User, AlertTriangle,
  FileText, Filter, RefreshCw
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CollectionsApprovalQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, action: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('request_type', typeFilter);
      
      const res = await fetch(`${API_URL}/api/collections/approval-queue?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        
        // Calculate stats
        const allRes = await fetch(`${API_URL}/api/collections/approval-queue?status=`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (allRes.ok) {
          const allData = await allRes.json();
          const all = allData.requests || [];
          setStats({
            pending: all.filter(r => r.status === 'pending').length,
            approved: all.filter(r => r.status === 'approved').length,
            rejected: all.filter(r => r.status === 'rejected').length
          });
        }
      } else if (res.status === 403) {
        toast.error('You do not have permission to view the approval queue');
      }
    } catch (error) {
      console.error('Failed to fetch approval requests:', error);
      toast.error('Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionModal.action) return;
    
    if (actionModal.action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/approval-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal.action,
          rejection_reason: rejectionReason
        })
      });

      if (res.ok) {
        toast.success(`Request ${actionModal.action}d successfully`);
        setActionModal({ open: false, action: null });
        setSelectedRequest(null);
        setRejectionReason('');
        fetchRequests();
      } else {
        const err = await res.json();
        toast.error(err.detail || `Failed to ${actionModal.action} request`);
      }
    } catch (error) {
      toast.error(`Failed to ${actionModal.action} request`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'tier_approval': return <Badge variant="outline" className="text-blue-600">Tier Approval</Badge>;
      case 'waiver_approval': return <Badge variant="outline" className="text-orange-600">Waiver Approval</Badge>;
      case 'discount_approval': return <Badge variant="outline" className="text-purple-600">Discount Approval</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/collections">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
            <p className="text-gray-500">Review and process settlement/waiver requests</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchRequests}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={`cursor-pointer ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`} onClick={() => setStatusFilter('pending')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full"><Clock className="w-6 h-6 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${statusFilter === 'approved' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setStatusFilter('approved')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setStatusFilter('rejected')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full"><XCircle className="w-6 h-6 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Request Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tier_approval">Tier Approval</SelectItem>
            <SelectItem value="waiver_approval">Waiver Approval</SelectItem>
            <SelectItem value="discount_approval">Discount Approval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-blue border-t-transparent"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No approval requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(request.status)}
                        {getTypeBadge(request.request_type)}
                        <Badge variant="outline">{request.tier_name}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold">{request.client_name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">Requested by {request.requested_by_name}</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Original Balance:</span>
                          <p className="font-medium">${request.original_balance?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Waiver Amount:</span>
                          <p className="font-medium text-orange-600">${request.waiver_amount?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Settlement Amount:</span>
                          <p className="font-medium text-green-600">${request.proposed_settlement_amount?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Required Approval:</span>
                          <p className="font-medium capitalize">{request.required_role?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                      )}
                      
                      {request.waiver_details && request.waiver_details.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Waiver Details:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {request.waiver_details.map((w, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {w.type}: ${w.original?.toFixed(2)} → ${(w.original - w.waived)?.toFixed(2)} (waived ${w.waived?.toFixed(2)})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {request.status === 'rejected' && request.rejection_reason && (
                        <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                        </p>
                      )}
                      
                      <p className="mt-2 text-xs text-gray-400">
                        Requested: {new Date(request.requested_at).toLocaleString()}
                        {request.approved_at && ` • Processed: ${new Date(request.approved_at).toLocaleString()} by ${request.approved_by_name}`}
                      </p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => { setSelectedRequest(request); setActionModal({ open: true, action: 'approve' }); }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => { setSelectedRequest(request); setActionModal({ open: true, action: 'reject' }); }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Dialog open={actionModal.open} onOpenChange={(o) => !o && setActionModal({ open: false, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionModal.action === 'approve' ? (
                <><CheckCircle className="w-5 h-5 text-green-600" />Approve Request</>
              ) : (
                <><XCircle className="w-5 h-5 text-red-600" />Reject Request</>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedRequest.client_name}</p>
                <p className="text-sm text-gray-500">Type: {selectedRequest.request_type?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">Tier: {selectedRequest.tier_name}</p>
                <p className="text-sm text-gray-500">Waiver Amount: ${selectedRequest.waiver_amount?.toFixed(2)}</p>
              </div>
              
              {actionModal.action === 'reject' && (
                <div>
                  <label className="text-sm font-medium">Rejection Reason *</label>
                  <Textarea 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this request is being rejected..."
                    className="mt-2"
                  />
                </div>
              )}
              
              {actionModal.action === 'approve' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    This will approve the waiver/settlement and log it for KPI tracking.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionModal({ open: false, action: null })}>Cancel</Button>
            <Button 
              onClick={handleAction} 
              disabled={submitting}
              className={actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {submitting ? 'Processing...' : actionModal.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
