import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, FileCheck, Ban, Scale, ChevronRight, Clock, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import api from '../../../utils/api';

const API_HEADERS = () => ({});

const ACTIONS = [
  { id: 'update_status', label: 'Update Status', icon: Shield, desc: 'Set Metro 2 status & payment rating', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'open_dispute', label: 'Handle Dispute (ACDV)', icon: Scale, desc: 'Open or resolve a consumer dispute', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'suppress', label: 'Suppress Reporting', icon: Ban, desc: 'Temporarily stop reporting to bureaus', color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'audit_log', label: 'Audit Trail', icon: FileCheck, desc: 'View all furnisher actions taken', color: 'text-gray-600 bg-gray-50 border-gray-200' },
];

// ---- Update Status Panel ----
const UpdateStatusPanel = ({ account, codes, onDone }) => {
  const [statusCode, setStatusCode] = useState(account.metro2_status_code || '');
  const [paymentRating, setPaymentRating] = useState(account.payment_rating || '');
  const [specialComment, setSpecialComment] = useState(account.special_comment_code || '');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    setSaving(true);
    try {
      await api.post(`/collections/accounts/${account.id}/furnisher/update-status`, {
        metro2_status_code: statusCode,
        payment_rating: paymentRating,
        special_comment_code: specialComment,
        reason,
      }, API_HEADERS());
      toast.success('Metro 2 status updated');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4" data-testid="update-status-panel">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metro 2 Account Status Code</label>
        <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={statusCode} onChange={e => setStatusCode(e.target.value)} data-testid="metro2-status-select">
          <option value="">-- Select --</option>
          {codes?.metro2_status_codes && Object.entries(codes.metro2_status_codes).map(([k, v]) => (
            <option key={k} value={k}>{k} — {v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Rating</label>
        <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={paymentRating} onChange={e => setPaymentRating(e.target.value)} data-testid="payment-rating-select">
          <option value="">-- Select --</option>
          {codes?.payment_rating_codes && Object.entries(codes.payment_rating_codes).map(([k, v]) => (
            <option key={k} value={k}>{k} — {v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Comment Code</label>
        <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={specialComment} onChange={e => setSpecialComment(e.target.value)} data-testid="special-comment-select">
          <option value="">None</option>
          {codes?.special_comment_codes && Object.entries(codes.special_comment_codes).filter(([k]) => k).map(([k, v]) => (
            <option key={k} value={k}>{k} — {v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason for Change *</label>
        <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain reason for this status change..." className="mt-1" data-testid="status-reason-input" />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="save-status-btn">
        {saving ? 'Saving...' : 'Update Metro 2 Status'}
      </Button>
    </div>
  );
};

// ---- Dispute Panel ----
const DisputePanel = ({ account, codes, onDone }) => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // list, open, resolve
  const [disputeReason, setDisputeReason] = useState('');
  const [bureau, setBureau] = useState('');
  const [consumerStatement, setConsumerStatement] = useState('');
  const [acdvResponse, setAcdvResponse] = useState('');
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [activeDispute, setActiveDispute] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/collections/accounts/${account.id}/furnisher/disputes`, API_HEADERS())
      .then(r => setDisputes(r.data.disputes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [account.id]);

  const openDispute = async () => {
    if (!disputeReason) { toast.error('Select a dispute reason'); return; }
    setSaving(true);
    try {
      await api.post(`/collections/accounts/${account.id}/furnisher/dispute`, {
        dispute_reason: disputeReason,
        bureau,
        consumer_statement: consumerStatement,
      }, API_HEADERS());
      toast.success('Dispute opened — 30-day investigation started');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to open dispute');
    } finally { setSaving(false); }
  };

  const resolveDispute = async () => {
    if (!acdvResponse) { toast.error('Select an ACDV response'); return; }
    setSaving(true);
    try {
      await api.post(`/collections/accounts/${account.id}/furnisher/resolve-dispute`, {
        dispute_id: activeDispute?.id,
        acdv_response: acdvResponse,
        investigation_notes: investigationNotes,
      }, API_HEADERS());
      toast.success('Dispute resolved');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resolve dispute');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-4 text-gray-400 text-sm">Loading disputes...</div>;

  if (mode === 'open') {
    return (
      <div className="space-y-4" data-testid="open-dispute-form">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Dispute Reason *</label>
          <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} data-testid="dispute-reason-select">
            <option value="">-- Select --</option>
            {codes?.dispute_reasons?.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Bureau</label>
          <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={bureau} onChange={e => setBureau(e.target.value)} data-testid="bureau-select">
            <option value="">-- Select --</option>
            <option value="Equifax">Equifax</option>
            <option value="Experian">Experian</option>
            <option value="TransUnion">TransUnion</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Consumer Statement</label>
          <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={3} value={consumerStatement} onChange={e => setConsumerStatement(e.target.value)} placeholder="Consumer's dispute statement..." data-testid="consumer-statement-input" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode('list')} className="flex-1">Cancel</Button>
          <Button onClick={openDispute} disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" data-testid="submit-dispute-btn">
            {saving ? 'Opening...' : 'Open Dispute'}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'resolve' && activeDispute) {
    return (
      <div className="space-y-4" data-testid="resolve-dispute-form">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700 font-medium">Resolving dispute: {activeDispute.dispute_reason}</p>
          <p className="text-xs text-amber-600">Deadline: {activeDispute.deadline_date}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">ACDV Response *</label>
          <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={acdvResponse} onChange={e => setAcdvResponse(e.target.value)} data-testid="acdv-response-select">
            <option value="">-- Select --</option>
            {codes?.acdv_response_codes && Object.entries(codes.acdv_response_codes).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Investigation Notes</label>
          <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={3} value={investigationNotes} onChange={e => setInvestigationNotes(e.target.value)} placeholder="Document your investigation findings..." data-testid="investigation-notes-input" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode('list')} className="flex-1">Cancel</Button>
          <Button onClick={resolveDispute} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 text-white" data-testid="resolve-dispute-btn">
            {saving ? 'Resolving...' : 'Resolve Dispute'}
          </Button>
        </div>
      </div>
    );
  }

  // List mode
  const openDisputes = disputes.filter(d => d.status === 'open');
  return (
    <div className="space-y-3" data-testid="disputes-list">
      <Button onClick={() => setMode('open')} className="w-full bg-amber-600 hover:bg-amber-700 text-white" data-testid="new-dispute-btn">
        <AlertTriangle className="w-4 h-4 mr-2" />Open New Dispute
      </Button>
      {disputes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No disputes on record</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {disputes.map(d => {
            const isOpen = d.status === 'open';
            let deadlineDays = null;
            if (isOpen && d.deadline) {
              try { deadlineDays = Math.ceil((new Date(d.deadline) - new Date()) / (1000 * 60 * 60 * 24)); } catch {}
            }
            return (
              <div key={d.id} className={`border rounded-lg p-3 ${isOpen ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'}`} data-testid={`dispute-${d.id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{d.dispute_reason}</p>
                    <p className="text-xs text-gray-500">{d.bureau || 'No bureau'} &middot; {new Date(d.opened_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={isOpen ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                    {isOpen ? 'Open' : d.acdv_response || 'Resolved'}
                  </Badge>
                </div>
                {isOpen && deadlineDays !== null && (
                  <div className={`mt-2 flex items-center gap-1 text-xs ${deadlineDays <= 5 ? 'text-red-600 font-bold' : 'text-amber-600'}`}>
                    <Clock className="w-3 h-3" />{deadlineDays > 0 ? `${deadlineDays} days remaining` : 'DEADLINE PASSED'}
                  </div>
                )}
                {isOpen && (
                  <Button size="sm" variant="outline" className="mt-2 text-xs h-7" onClick={() => { setActiveDispute(d); setMode('resolve'); }} data-testid={`resolve-${d.id}`}>
                    Resolve Dispute
                  </Button>
                )}
                {!isOpen && d.acdv_response && (
                  <p className="text-xs text-gray-500 mt-1">Response: {d.acdv_response} — {d.investigation_notes?.slice(0, 80) || 'No notes'}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---- Suppress Panel ----
const SuppressPanel = ({ account, onDone }) => {
  const isSuppressed = account.reporting_suppressed;
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    setSaving(true);
    try {
      await api.post(`/collections/accounts/${account.id}/furnisher/suppress`, {
        suppress: !isSuppressed,
        reason,
      }, API_HEADERS());
      toast.success(isSuppressed ? 'Reporting resumed' : 'Reporting suppressed');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4" data-testid="suppress-panel">
      <div className={`p-4 rounded-lg border ${isSuppressed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center gap-2">
          {isSuppressed ? <XCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
          <span className="font-medium text-sm">{isSuppressed ? 'Reporting is SUPPRESSED' : 'Reporting is ACTIVE'}</span>
        </div>
        {isSuppressed && account.suppression_reason && (
          <p className="text-xs text-red-600 mt-1">Reason: {account.suppression_reason}</p>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase">Reason *</label>
        <Input value={reason} onChange={e => setReason(e.target.value)} placeholder={isSuppressed ? "Reason to resume reporting..." : "Reason to suppress reporting..."} className="mt-1" data-testid="suppress-reason-input" />
      </div>
      <Button onClick={handleToggle} disabled={saving} className={`w-full ${isSuppressed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`} data-testid="suppress-toggle-btn">
        {saving ? 'Processing...' : isSuppressed ? 'Resume Reporting' : 'Suppress Reporting'}
      </Button>
    </div>
  );
};

// ---- Audit Log Panel ----
const AuditLogPanel = ({ account }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/collections/accounts/${account.id}/furnisher/audit-log`, API_HEADERS())
      .then(r => setLogs(r.data.audit_log || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [account.id]);

  if (loading) return <div className="text-center py-4 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto" data-testid="audit-log-panel">
      {logs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No furnisher actions recorded</p>
      ) : logs.map(log => (
        <div key={log.id} className="border rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between">
            <Badge className="bg-gray-100 text-gray-700">{log.action?.replace(/_/g, ' ')}</Badge>
            <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-gray-600">{log.reason || log.investigation_notes || '—'}</p>
          <p className="text-gray-400 mt-0.5">By: {log.performed_by}</p>
        </div>
      ))}
    </div>
  );
};

// ---- Main Furnisher Actions Panel ----
const FurnisherActionsPanel = ({ account, onDone }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [codes, setCodes] = useState(null);

  useEffect(() => {
    api.get('/collections/furnisher/reference-codes', API_HEADERS())
      .then(r => setCodes(r.data))
      .catch(() => {});
  }, []);

  if (activeAction === 'update_status') return <UpdateStatusPanel account={account} codes={codes} onDone={onDone} />;
  if (activeAction === 'open_dispute') return <DisputePanel account={account} codes={codes} onDone={onDone} />;
  if (activeAction === 'suppress') return <SuppressPanel account={account} onDone={onDone} />;
  if (activeAction === 'audit_log') return <AuditLogPanel account={account} />;

  return (
    <div className="space-y-2" data-testid="furnisher-actions-menu">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-blue-500" />
        <p className="text-xs text-gray-500">FCRA-compliant furnisher actions with full audit trail.</p>
      </div>
      {ACTIONS.map(a => (
        <button
          key={a.id}
          onClick={() => setActiveAction(a.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition hover:shadow-sm ${a.color}`}
          data-testid={`action-${a.id}`}
        >
          <a.icon className="w-5 h-5 flex-shrink-0" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium">{a.label}</p>
            <p className="text-xs opacity-70">{a.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 opacity-40" />
        </button>
      ))}
    </div>
  );
};

export default FurnisherActionsPanel;
