import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';
import {
  Users, Upload, Trash2, FileText, Eye, X, Plus,
  ChevronDown, ChevronRight, BarChart3, Search
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DELETION_CATEGORIES = [
  { key: 'collections', label: 'Collections', color: 'bg-red-100 text-red-800' },
  { key: 'inquiries', label: 'Inquiries', color: 'bg-blue-100 text-blue-800' },
  { key: 'late_payments', label: 'Late Payments', color: 'bg-amber-100 text-amber-800' },
  { key: 'public_records', label: 'Public Records', color: 'bg-purple-100 text-purple-800' },
  { key: 'bankruptcies', label: 'Bankruptcies', color: 'bg-pink-100 text-pink-800' },
  { key: 'charge_offs', label: 'Charge-Offs', color: 'bg-orange-100 text-orange-800' },
];

const BUREAUS = ['equifax', 'experian', 'transunion'];

const OutsourceCustomerManage = ({ partnerId }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get(`/outsourcing/admin/partners/${partnerId}/all-customers`);
      setCustomers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (c.first_name || '').toLowerCase().includes(s) ||
           (c.last_name || '').toLowerCase().includes(s) ||
           (c.email || '').toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center" data-testid="no-customers-message">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-gray-700">No Portal Customers Found</p>
        <p className="text-sm text-gray-500 mt-1">This partner has no customers in the outsourcing portal yet.</p>
        <p className="text-xs text-gray-400 mt-2">Customers are created when the outsourcing partner adds them via their portal login.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="customer-manage-tab">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Portal Customers ({customers.length})</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="customer-manage-search"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(c => (
          <CustomerRow
            key={c.id}
            customer={c}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
            onRefresh={fetchCustomers}
          />
        ))}
      </div>
    </div>
  );
};

const CustomerRow = ({ customer, expanded, onToggle, onRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
        data-testid={`customer-row-${customer.id}`}
      >
        <div className="flex items-center gap-4">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <div className="text-left">
            <p className="font-semibold text-gray-900">{customer.first_name} {customer.last_name}</p>
            <p className="text-xs text-gray-500">{customer.email || 'No email'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-50 text-blue-700">{customer.credit_report_count || 0} Reports</Badge>
          <Badge className="bg-emerald-50 text-emerald-700">{customer.deletion_count || 0} Deletions</Badge>
          <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{customer.status}</Badge>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-5 space-y-6">
          <CreditReportSection customerId={customer.id} onRefresh={onRefresh} />
          <DeletionTrackingSection customerId={customer.id} />
        </div>
      )}
    </div>
  );
};

// ============ CREDIT REPORT SECTION ============
const CreditReportSection = ({ customerId, onRefresh }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [roundNumber, setRoundNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [viewingPdf, setViewingPdf] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get(`/outsourcing/admin/customers/${customerId}/credit-reports`);
      setReports(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('round_number', roundNumber || '0');
    formData.append('notes', notes);
    try {
      setUploading(true);
      await api.post(`/outsourcing/admin/customers/${customerId}/credit-reports/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Credit report uploaded');
      setRoundNumber('');
      setNotes('');
      fetchReports();
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Delete this credit report?')) return;
    try {
      await api.delete(`/outsourcing/admin/credit-reports/${reportId}`);
      toast.success('Credit report deleted');
      fetchReports();
      onRefresh?.();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleViewPdf = async (report) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/outsourcing/credit-reports/${report.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load PDF');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setViewingPdf(report);
    } catch (e) {
      toast.error('Failed to load PDF');
    }
  };

  const closePdfViewer = () => {
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    setPdfBlobUrl(null);
    setViewingPdf(null);
  };

  return (
    <div data-testid="credit-report-section">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" /> Credit Reports
        </h3>
      </div>

      {/* Upload form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Round #</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={roundNumber}
              onChange={e => setRoundNumber(e.target.value)}
              className="w-20"
              data-testid="credit-report-round-input"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <Input
              placeholder="Optional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              data-testid="credit-report-notes-input"
            />
          </div>
          <label className="cursor-pointer">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 pointer-events-none" disabled={uploading} data-testid="credit-report-upload-btn">
              <Upload className="w-3 h-3 mr-1" />{uploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
            <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Report list */}
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No credit reports uploaded yet</p>
      ) : (
        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg" data-testid={`credit-report-${r.id}`}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">{r.file_name}</p>
                  <p className="text-xs text-gray-500">
                    Round #{r.round_number || 0}
                    {r.notes && <> &middot; {r.notes}</>}
                    {' '}&middot; {new Date(r.uploaded_at).toLocaleDateString()}
                    {' '}&middot; {(r.file_size / 1024).toFixed(0)}KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleViewPdf(r)} data-testid={`view-pdf-${r.id}`}>
                  <Eye className="w-3 h-3 mr-1" /> View
                </Button>
                <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && pdfBlobUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" data-testid="pdf-viewer-modal">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <p className="font-semibold">{viewingPdf.file_name}</p>
                <p className="text-xs text-gray-500">Round #{viewingPdf.round_number || 0}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={closePdfViewer} data-testid="close-pdf-viewer">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1">
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full"
                title="Credit Report PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ DELETION TRACKING SECTION ============
const DeletionTrackingSection = ({ customerId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'collections', count: 1, bureau: '', round_number: 0, notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get(`/outsourcing/admin/customers/${customerId}/deletions`);
      setRecords(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleAdd = async () => {
    if (form.count < 1) { toast.error('Count must be at least 1'); return; }
    try {
      await api.post(`/outsourcing/admin/customers/${customerId}/deletions`, form);
      toast.success('Deletion record added');
      setShowAdd(false);
      setForm({ category: 'collections', count: 1, bureau: '', round_number: 0, notes: '' });
      fetchRecords();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to add'); }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/outsourcing/admin/deletions/${id}`, editForm);
      toast.success('Record updated');
      setEditingId(null);
      fetchRecords();
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/outsourcing/admin/deletions/${id}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch (e) { toast.error('Failed to delete'); }
  };

  // Calculate summary by category
  const summary = {};
  DELETION_CATEGORIES.forEach(cat => {
    const catRecords = records.filter(r => r.category === cat.key);
    summary[cat.key] = catRecords.reduce((sum, r) => sum + (r.count || 0), 0);
  });
  const totalDeletions = Object.values(summary).reduce((sum, v) => sum + v, 0);

  const getCatInfo = (key) => DELETION_CATEGORIES.find(c => c.key === key) || { label: key, color: 'bg-gray-100 text-gray-800' };

  return (
    <div data-testid="deletion-tracking-section">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" /> Deletion Tracking
          <Badge className="bg-emerald-100 text-emerald-800">{totalDeletions} Total</Badge>
        </h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} data-testid="add-deletion-btn">
          <Plus className="w-3 h-3 mr-1" /> Add Deletion
        </Button>
      </div>

      {/* Summary Bar */}
      {totalDeletions > 0 && (
        <div className="grid grid-cols-6 gap-2 mb-4">
          {DELETION_CATEGORIES.map(cat => (
            <div key={cat.key} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-gray-800">{summary[cat.key] || 0}</p>
              <p className="text-[10px] text-gray-500">{cat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" data-testid="deletion-category-select">
                {DELETION_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
              <Input type="number" min="1" value={form.count} onChange={e => setForm({...form, count: parseInt(e.target.value) || 0})}
                data-testid="deletion-count-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bureau</label>
              <select value={form.bureau} onChange={e => setForm({...form, bureau: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" data-testid="deletion-bureau-select">
                <option value="">All/Any</option>
                {BUREAUS.map(b => <option key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Round #</label>
              <Input type="number" min="0" value={form.round_number} onChange={e => setForm({...form, round_number: parseInt(e.target.value) || 0})}
                data-testid="deletion-round-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <Input placeholder="Optional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              data-testid="deletion-notes-input" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAdd} data-testid="deletion-submit-btn">Add Record</Button>
          </div>
        </div>
      )}

      {/* Records List */}
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No deletion records yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500">Category</th>
                <th className="px-3 py-2 text-left text-gray-500">Count</th>
                <th className="px-3 py-2 text-left text-gray-500">Bureau</th>
                <th className="px-3 py-2 text-left text-gray-500">Round</th>
                <th className="px-3 py-2 text-left text-gray-500">Date</th>
                <th className="px-3 py-2 text-left text-gray-500">Notes</th>
                <th className="px-3 py-2 text-right text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => {
                const catInfo = getCatInfo(r.category);
                const isEditing = editingId === r.id;
                return (
                  <tr key={r.id} className="hover:bg-gray-50" data-testid={`deletion-row-${r.id}`}>
                    <td className="px-3 py-2"><Badge className={catInfo.color}>{catInfo.label}</Badge></td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <Input type="number" min="0" value={editForm.count} onChange={e => setEditForm({...editForm, count: parseInt(e.target.value) || 0})} className="w-16" />
                      ) : r.count}
                    </td>
                    <td className="px-3 py-2 capitalize text-gray-600">
                      {isEditing ? (
                        <select value={editForm.bureau || ''} onChange={e => setEditForm({...editForm, bureau: e.target.value})} className="border rounded px-2 py-1 text-sm">
                          <option value="">Any</option>
                          {BUREAUS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
                        </select>
                      ) : (r.bureau || '—')}
                    </td>
                    <td className="px-3 py-2 text-gray-600">#{r.round_number || 0}</td>
                    <td className="px-3 py-2 text-gray-500">{r.date_recorded}</td>
                    <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                      {isEditing ? (
                        <Input value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="text-sm" />
                      ) : (r.notes || '—')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdate(r.id)}>Save</Button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEditingId(r.id); setEditForm({ count: r.count, bureau: r.bureau, notes: r.notes }); }}
                            className="text-blue-500 hover:text-blue-700 p-1" data-testid={`edit-deletion-${r.id}`}>
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutsourceCustomerManage;
