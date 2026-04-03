import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Bug, Search, Eye, RefreshCw, Trash2, ChevronLeft, ExternalLink,
  AlertTriangle, CheckCircle, Clock, XCircle, Filter, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const SEVERITIES = {
  critical: { label: 'Critical', cls: 'bg-red-100 text-red-800 border-red-200' },
  high: { label: 'High', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low: { label: 'Low', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATUSES = {
  open: { label: 'Open', cls: 'bg-red-100 text-red-800', icon: AlertTriangle },
  in_review: { label: 'In Review', cls: 'bg-orange-100 text-orange-800', icon: Eye },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-800', icon: Clock },
  resolved: { label: 'Resolved', cls: 'bg-green-100 text-green-800', icon: CheckCircle },
  wont_fix: { label: "Won't Fix", cls: 'bg-gray-100 text-gray-600', icon: XCircle },
};

const CATEGORIES = {
  ui_display: 'UI / Display',
  calculation: 'Calculation',
  data_entry: 'Data Entry',
  permissions: 'Permissions',
  performance: 'Performance',
  broken_link: 'Broken Link',
  other: 'Other',
};

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BugTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data?.tickets || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (severityFilter !== 'all' && t.severity !== severityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(s) ||
        t.ticket_number?.toLowerCase().includes(s) ||
        t.submitted_by?.toLowerCase().includes(s) ||
        t.description?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const counts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress' || t.status === 'in_review').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  if (selectedTicket) {
    return (
      <TicketDetailView
        ticket={selectedTicket}
        onBack={() => { setSelectedTicket(null); fetchTickets(); }}
        onRefresh={fetchTickets}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="bug-tickets-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bug className="w-6 h-6 text-red-600" /> Bug Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage bug reports from all portals</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} data-testid="refresh-tickets">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="total-tickets">{counts.total}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Open</p>
            <p className="text-3xl font-bold text-red-600" data-testid="open-tickets">{counts.open}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">In Progress</p>
            <p className="text-3xl font-bold text-blue-600" data-testid="progress-tickets">{counts.in_progress}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Resolved</p>
            <p className="text-3xl font-bold text-green-600" data-testid="resolved-tickets">{counts.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tickets..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="search-tickets"
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          data-testid="filter-status"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          data-testid="filter-severity"
        >
          <option value="all">All Severities</option>
          {Object.entries(SEVERITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No Bug Tickets</p>
          <p className="text-sm text-gray-500">
            {tickets.length === 0 ? 'No bugs have been reported yet.' : 'No tickets match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm" data-testid="tickets-table">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-center">Severity</th>
                <th className="px-4 py-3 text-center">Category</th>
                <th className="px-4 py-3 text-center">Portal</th>
                <th className="px-4 py-3 text-center">Submitted By</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Attachments</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(t => {
                const sev = SEVERITIES[t.severity] || SEVERITIES.medium;
                const stat = STATUSES[t.status] || STATUSES.open;
                return (
                  <tr
                    key={t.ticket_number}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTicket(t)}
                    data-testid={`ticket-row-${t.ticket_number}`}
                  >
                    <td className="px-4 py-3 font-mono text-red-600 font-bold text-xs">{t.ticket_number}</td>
                    <td className="px-4 py-3 font-medium max-w-[220px] truncate">{t.title}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={sev.cls}>{sev.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {CATEGORIES[t.category] || t.category}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {t.portal || 'CMS'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">{t.submitted_by}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {t.submitted_at?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={stat.cls}>{stat.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.screenshots?.length > 0 && (
                        <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <ImageIcon className="w-3 h-3" /> {t.screenshots.length}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedTicket(t); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
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

// === TICKET DETAIL VIEW ===
const TicketDetailView = ({ ticket, onBack, onRefresh }) => {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.resolution_notes || '');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const updateTicket = async () => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticket.ticket_number}`, { status, resolution_notes: notes });
      toast.success('Ticket updated');
      onBack();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Update failed');
    }
    setUpdating(false);
  };

  const deleteTicket = async () => {
    if (!window.confirm(`Delete ticket ${ticket.ticket_number}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/tickets/${ticket.ticket_number}`);
      toast.success('Ticket deleted');
      onBack();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Delete failed');
    }
    setDeleting(false);
  };

  const sev = SEVERITIES[ticket.severity] || SEVERITIES.medium;
  const stat = STATUSES[ticket.status] || STATUSES.open;

  return (
    <div className="space-y-5 max-w-4xl" data-testid="ticket-detail-view">
      <Button variant="ghost" onClick={onBack} className="text-gray-500 -ml-2 gap-1" data-testid="back-to-tickets">
        <ChevronLeft className="w-4 h-4" /> Back to Bug Tickets
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-red-600">{ticket.ticket_number}</span>
            <Badge className={sev.cls}>{sev.label}</Badge>
            <Badge className={stat.cls}>{stat.label}</Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">{ticket.title}</h2>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>By: <strong>{ticket.submitted_by}</strong></span>
            <span>{ticket.submitted_at?.slice(0, 16).replace('T', ' ')}</span>
            {ticket.portal && <Badge className="bg-slate-100 text-slate-600 text-xs">{ticket.portal}</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={deleteTicket} disabled={deleting} data-testid="delete-ticket-btn">
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Description</label>
            <p className="text-sm mt-1 text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.steps_to_reproduce?.length > 0 && ticket.steps_to_reproduce.some(s => s) && (
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Steps to Reproduce</label>
              <ol className="list-decimal list-inside text-sm mt-1 space-y-1 text-gray-700">
                {ticket.steps_to_reproduce.filter(s => s).map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}

          {ticket.error_message && (
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Error Message</label>
              <pre className="mt-1 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                {ticket.error_message}
              </pre>
            </div>
          )}

          {/* Screenshots */}
          {ticket.screenshots?.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Screenshots ({ticket.screenshots.length})
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {ticket.screenshots.map((s, i) => (
                  <div
                    key={i}
                    className="w-32 h-24 rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                    onClick={() => setLightboxImg(`${API_URL}${s.url}`)}
                    data-testid={`screenshot-thumb-${i}`}
                  >
                    <img src={`${API_URL}${s.url}`} alt={s.filename || `Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-3 border-t">
            <div>Category: <span className="font-medium text-gray-700">{CATEGORIES[ticket.category] || ticket.category}</span></div>
            <div>Assigned to: <span className="font-medium text-gray-700">{ticket.assigned_to || '—'}</span></div>
            {ticket.ticket_url && (
              <div className="col-span-2">
                Page: <a href={ticket.ticket_url} target="_blank" rel="noreferrer" className="text-red-600 hover:underline inline-flex items-center gap-0.5">
                  {ticket.ticket_url.length > 60 ? ticket.ticket_url.slice(0, 60) + '...' : ticket.ticket_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {ticket.browser_info && (
              <div className="col-span-2 truncate">Browser: <span className="text-gray-600">{ticket.browser_info.slice(0, 80)}</span></div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Update Ticket</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2.5 text-sm mt-1"
                value={status}
                onChange={e => setStatus(e.target.value)}
                data-testid="ticket-status-select"
              >
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Assigned To</label>
              <input className="w-full border rounded-lg px-3 py-2.5 text-sm mt-1 bg-gray-50" value={ticket.assigned_to || 'Joeziel'} readOnly />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold">Resolution Notes</label>
            <textarea
              className="w-full border rounded-lg p-3 text-sm mt-1"
              rows={3}
              placeholder="Describe what was done to resolve this bug..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              data-testid="ticket-resolution-notes"
            />
          </div>
          <Button onClick={updateTicket} disabled={updating} data-testid="update-ticket-btn">
            {updating ? 'Updating...' : 'Update Ticket'}
          </Button>
        </CardContent>
      </Card>

      {/* Resolution (if resolved) */}
      {ticket.resolution_notes && ticket.status === 'resolved' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5">
            <h4 className="font-semibold text-green-700">Resolution</h4>
            <p className="text-sm mt-1 text-green-800">{ticket.resolution_notes}</p>
            {ticket.resolved_at && <p className="text-xs text-green-600 mt-2">Resolved: {ticket.resolved_at.slice(0, 16).replace('T', ' ')}</p>}
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-8"
          onClick={() => setLightboxImg(null)}
          data-testid="screenshot-lightbox"
        >
          <img src={lightboxImg} alt="Screenshot" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default BugTicketsPage;
