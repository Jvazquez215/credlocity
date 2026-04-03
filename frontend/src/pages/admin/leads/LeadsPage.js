import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter, Trash2, Eye, ChevronDown, Download, Phone, Mail, MapPin, FileText, CheckCircle2, XCircle, Clock, UserCheck, Globe } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: Phone },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const TYPE_CONFIG = {
  free_trial: { label: 'Free Trial', color: 'bg-emerald-100 text-emerald-800' },
  consultation: { label: 'Consultation', color: 'bg-purple-100 text-purple-800' },
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchLeads = useCallback(async () => {
    try {
      let url = `${API}/api/leads?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `lead_type=${typeFilter}&`;
      const res = await fetch(url, { headers });
      if (res.ok) setLeads(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [statusFilter, typeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/leads/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchLeads(); fetchStats(); }, [fetchLeads, fetchStats]);

  const updateLead = async (leadId) => {
    try {
      const res = await fetch(`${API}/api/leads/${leadId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });
      if (res.ok) {
        toast.success('Lead updated');
        setSelectedLead(null);
        fetchLeads();
        fetchStats();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      const res = await fetch(`${API}/api/leads/${leadId}`, { method: 'DELETE', headers });
      if (res.ok) {
        toast.success('Lead deleted');
        if (selectedLead?.id === leadId) setSelectedLead(null);
        fetchLeads();
        fetchStats();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filtered = leads.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(s) ||
      l.email?.toLowerCase().includes(s) ||
      l.phone?.includes(s) ||
      l.city?.toLowerCase().includes(s)
    );
  });

  const openDetail = (lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setEditStatus(lead.status);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="leads-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="leads-page-title">Leads</h1>
          <p className="text-sm text-gray-500">Service agreement sign-ups from the website</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6" data-testid="leads-stats">
          {[
            { label: 'Total', val: stats.total, color: 'border-gray-300' },
            { label: 'New', val: stats.new, color: 'border-blue-400' },
            { label: 'Contacted', val: stats.contacted, color: 'border-yellow-400' },
            { label: 'Converted', val: stats.converted, color: 'border-green-400' },
            { label: 'Lost', val: stats.lost, color: 'border-red-400' },
            { label: 'Free Trial', val: stats.free_trial, color: 'border-emerald-400' },
            { label: 'Consultation', val: stats.consultation, color: 'border-purple-400' },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-lg border-l-4 ${s.color} p-3 shadow-sm`}>
              <p className="text-2xl font-bold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone, city..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="leads-search"
          />
        </div>
        <select className="border rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} data-testid="leads-status-filter">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} data-testid="leads-type-filter">
          <option value="">All Types</option>
          <option value="free_trial">Free Trial</option>
          <option value="consultation">Consultation</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="leads-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Signed</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No leads found</td></tr>
              ) : (
                filtered.map(lead => {
                  const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const tc = TYPE_CONFIG[lead.lead_type] || TYPE_CONFIG.free_trial;
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(lead)} data-testid={`lead-row-${lead.id}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{lead.first_name} {lead.last_name}</div>
                        {lead.is_duplicate && <span className="text-[10px] text-orange-600 font-medium">DUPLICATE</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 text-xs">{lead.email}</div>
                        <div className="text-gray-500 text-xs">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{lead.city}, {lead.state}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tc.color}`}>{tc.label}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>{sc.label}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{lead.signed_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={e => { e.stopPropagation(); deleteLead(lead.id); }} className="text-gray-400 hover:text-red-600 p-1" data-testid={`delete-lead-${lead.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
          Showing {filtered.length} of {leads.length} leads
        </div>
      </div>

      {/* Lead Detail Slide-out */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end" data-testid="lead-detail-panel">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-white w-full max-w-md shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{selectedLead.first_name} {selectedLead.last_name}</h4>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_CONFIG[selectedLead.lead_type]?.color}`}>
                    {TYPE_CONFIG[selectedLead.lead_type]?.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CONFIG[selectedLead.status]?.color}`}>
                    {STATUS_CONFIG[selectedLead.status]?.label}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {selectedLead.email}</div>
                <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> {selectedLead.phone}</div>
                <div className="flex items-start gap-2 text-gray-600"><MapPin className="w-4 h-4 mt-0.5" /> {selectedLead.address}, {selectedLead.city}, {selectedLead.state} {selectedLead.zip_code}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border text-sm">
                <p className="text-xs font-medium text-gray-500 mb-1">Agreement Signature</p>
                <p className="font-medium text-gray-900">{selectedLead.signed_name}</p>
                <p className="text-xs text-gray-400 mt-1">Signed: {new Date(selectedLead.signed_at).toLocaleString()}</p>
                {selectedLead.ip_address && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Globe className="w-3 h-3" /> IP: {selectedLead.ip_address}</p>
                )}
              </div>

              {/* Download Agreement PDF */}
              {selectedLead.has_agreement_pdf !== false && (
                <a
                  href={`${API}/api/leads/${selectedLead.id}/agreement-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border-2 border-primary-blue text-primary-blue rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors"
                  data-testid="download-agreement-pdf-btn"
                >
                  <Download className="w-4 h-4" />
                  Download Signed Agreement PDF
                </a>
              )}

              {/* Update Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Update Status</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={editStatus} onChange={e => setEditStatus(e.target.value)} data-testid="lead-status-select">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Notes</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] resize-y"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  data-testid="lead-notes-input"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => updateLead(selectedLead.id)} className="flex-1" data-testid="save-lead-btn">
                  Save Changes
                </Button>
                <Button variant="destructive" onClick={() => deleteLead(selectedLead.id)} data-testid="delete-lead-detail-btn">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t">
                <p>Created: {new Date(selectedLead.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(selectedLead.updated_at).toLocaleString()}</p>
                <p>Lead ID: {selectedLead.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
