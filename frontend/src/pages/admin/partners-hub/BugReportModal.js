import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';
import { X, Bug, Plus, Trash2, Upload, ExternalLink, ChevronDown } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const partnerH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('partner_token')}` });

const CATEGORIES = [
  { value: 'ui_display', label: 'UI / Display Issue' },
  { value: 'calculation', label: 'Calculation Error' },
  { value: 'data_entry', label: 'Data Entry Problem' },
  { value: 'permissions', label: 'Permissions / Access' },
  { value: 'performance', label: 'Performance / Speed' },
  { value: 'other', label: 'Other' },
];
const SEVERITIES = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
];
const STATUSES = {
  open: 'bg-red-100 text-red-800',
  in_review: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  wont_fix: 'bg-gray-100 text-gray-600',
};

// === BUG REPORT MODAL ===
const BugReportModal = ({ onClose, onSubmitted }) => {
  const [form, setForm] = useState({
    title: '', description: '', steps: [''], error_message: '',
    category: 'other', severity: 'medium',
    ticket_url: window.location.href,
    browser_info: navigator.userAgent,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const updateStep = (i, v) => { const s = [...form.steps]; s[i] = v; update('steps', s); };
  const addStep = () => update('steps', [...form.steps, '']);
  const removeStep = i => update('steps', form.steps.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description required'); return; }
    setSubmitting(true);
    try {
      const body = {
        title: form.title, description: form.description,
        steps_to_reproduce: form.steps.filter(s => s.trim()),
        error_message: form.error_message || null,
        category: form.category, severity: form.severity,
        ticket_url: form.ticket_url, browser_info: form.browser_info,
      };
      const res = await fetch(`${API}/api/tickets`, { method: 'POST', headers: partnerH(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      toast.success(`Bug report ${data.ticket_number} submitted. The master admin has been notified.`);
      onSubmitted?.(data);
      onClose();
    } catch (err) { toast.error(err.message || 'Failed to submit'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slide-in-right" onClick={e => e.stopPropagation()} data-testid="bug-report-modal">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2"><Bug className="w-5 h-5 text-red-600" /><h2 className="font-bold text-lg">Report a Bug</h2></div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input maxLength={100} placeholder="Brief description of the issue" value={form.title} onChange={e => update('title', e.target.value)} data-testid="bug-title" />
          </div>
          <div>
            <label className="text-sm font-medium">What's happening? *</label>
            <textarea className="w-full border rounded-lg p-3 text-sm mt-1" rows={4} placeholder="Describe the bug in detail..." value={form.description} onChange={e => update('description', e.target.value)} data-testid="bug-description" />
          </div>
          <div>
            <label className="text-sm font-medium">Steps to reproduce</label>
            <div className="space-y-2 mt-1">
              {form.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">#{i + 1}</span>
                  <Input value={s} onChange={e => updateStep(i, e.target.value)} placeholder={`Step ${i + 1}...`} className="flex-1 text-sm" />
                  {form.steps.length > 1 && <button onClick={() => removeStep(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
              <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={addStep}><Plus className="w-3 h-3" /> Add Step</Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Error message (copy and paste here)</label>
            <textarea className="w-full border rounded-lg p-3 text-sm mt-1 font-mono bg-gray-50" rows={3} placeholder="Paste any error text here..." value={form.error_message} onChange={e => update('error_message', e.target.value)} data-testid="bug-error" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select className="w-full border rounded-lg p-2 text-sm mt-1" value={form.category} onChange={e => update('category', e.target.value)} data-testid="bug-category">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <select className="w-full border rounded-lg p-2 text-sm mt-1" value={form.severity} onChange={e => update('severity', e.target.value)} data-testid="bug-severity">
                {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Page URL</label>
            <Input value={form.ticket_url} readOnly className="text-xs text-gray-400 bg-gray-50 mt-1" />
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={submit} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700" data-testid="bug-submit">{submitting ? 'Submitting...' : 'Submit Bug Report'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === BUG TICKET LIST (for both Shar and Joeziel) ===
const BugTicketList = ({ isMaster }) => {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/tickets`, { headers: partnerH() });
      if (res.ok) { const d = await res.json(); setTickets(d.tickets || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (ticketNum, status, notes) => {
    try {
      const res = await fetch(`${API}/api/tickets/${ticketNum}`, {
        method: 'PUT', headers: partnerH(), body: JSON.stringify({ status, resolution_notes: notes })
      });
      if (res.ok) { toast.success('Ticket updated'); load(); setSelected(null); }
      else { const d = await res.json(); toast.error(d.detail); }
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="text-center py-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  if (selected) {
    return <TicketDetail ticket={selected} isMaster={isMaster} onBack={() => setSelected(null)} onUpdate={updateStatus} />;
  }

  return (
    <div className="space-y-3" data-testid="bug-ticket-list">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{isMaster ? 'All Bug Tickets' : 'My Bug Reports'} ({tickets.length})</h3>
      </div>
      {tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><Bug className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No bug reports yet</p></div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm" data-testid="tickets-table">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr><th className="px-3 py-2 text-left">Ticket</th><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2">Severity</th><th className="px-3 py-2">Category</th>{isMaster && <th className="px-3 py-2">Submitted By</th>}<th className="px-3 py-2">Date</th><th className="px-3 py-2">Status</th></tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map(t => (
                <tr key={t.ticket_number} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(t)}>
                  <td className="px-3 py-2 font-mono text-indigo-600 font-medium">{t.ticket_number}</td>
                  <td className="px-3 py-2 font-medium max-w-[200px] truncate">{t.title}</td>
                  <td className="px-3 py-2 text-center"><Badge className={SEVERITIES.find(s => s.value === t.severity)?.color || ''}>{t.severity}</Badge></td>
                  <td className="px-3 py-2 text-center text-xs">{CATEGORIES.find(c => c.value === t.category)?.label || t.category}</td>
                  {isMaster && <td className="px-3 py-2 text-center text-xs">{t.submitted_by}</td>}
                  <td className="px-3 py-2 text-center text-xs">{t.submitted_at?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-center"><Badge className={STATUSES[t.status] || 'bg-gray-100'}>{t.status?.replace(/_/g, ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// === TICKET DETAIL ===
const TicketDetail = ({ ticket, isMaster, onBack, onUpdate }) => {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.resolution_notes || '');

  return (
    <div className="space-y-4" data-testid="ticket-detail">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1">&larr; Back to tickets</Button>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-lg font-bold text-indigo-600">{ticket.ticket_number}</span>
          <h3 className="text-lg font-bold mt-1">{ticket.title}</h3>
        </div>
        <div className="flex gap-2">
          <Badge className={SEVERITIES.find(s => s.value === ticket.severity)?.color || ''}>{ticket.severity}</Badge>
          <Badge className={STATUSES[ticket.status] || ''}>{ticket.status?.replace(/_/g, ' ')}</Badge>
        </div>
      </div>
      <Card><CardContent className="p-4 space-y-3">
        <div><label className="text-xs text-gray-500 uppercase">Description</label><p className="text-sm mt-1">{ticket.description}</p></div>
        {ticket.steps_to_reproduce?.length > 0 && (
          <div><label className="text-xs text-gray-500 uppercase">Steps to Reproduce</label>
            <ol className="list-decimal list-inside text-sm mt-1 space-y-1">{ticket.steps_to_reproduce.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
        )}
        {ticket.error_message && (
          <div><label className="text-xs text-gray-500 uppercase">Error Message</label>
            <pre className="mt-1 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">{ticket.error_message}</pre>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div>Category: <span className="font-medium text-gray-700">{CATEGORIES.find(c => c.value === ticket.category)?.label}</span></div>
          <div>Submitted by: <span className="font-medium text-gray-700">{ticket.submitted_by}</span></div>
          <div>Date: <span className="font-medium text-gray-700">{ticket.submitted_at?.slice(0, 10)}</span></div>
          {ticket.ticket_url && <div>Page: <a href={ticket.ticket_url} className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">{ticket.ticket_url.slice(0, 40)}... <ExternalLink className="w-3 h-3" /></a></div>}
        </div>
      </CardContent></Card>
      {isMaster && (
        <Card><CardContent className="p-4 space-y-3">
          <h4 className="font-semibold text-sm">Admin Actions</h4>
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select className="w-full border rounded-lg p-2 text-sm mt-1" value={status} onChange={e => setStatus(e.target.value)} data-testid="ticket-status-select">
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="wont_fix">Won't Fix</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Resolution Notes</label>
            <textarea className="w-full border rounded-lg p-3 text-sm mt-1" rows={3} placeholder="What was done to fix it..." value={notes} onChange={e => setNotes(e.target.value)} data-testid="ticket-resolution-notes" />
          </div>
          <Button onClick={() => onUpdate(ticket.ticket_number, status, notes)} data-testid="update-ticket-btn">Update Ticket</Button>
        </CardContent></Card>
      )}
      {ticket.resolution_notes && !isMaster && (
        <Card className="border-green-200"><CardContent className="p-4">
          <h4 className="font-semibold text-sm text-green-700">Resolution</h4>
          <p className="text-sm mt-1">{ticket.resolution_notes}</p>
          {ticket.resolved_at && <p className="text-xs text-gray-400 mt-1">Resolved: {ticket.resolved_at.slice(0, 10)}</p>}
        </CardContent></Card>
      )}
    </div>
  );
};

export { BugReportModal, BugTicketList };
export default BugReportModal;
