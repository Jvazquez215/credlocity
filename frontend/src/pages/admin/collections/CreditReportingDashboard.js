import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, AlertTriangle, Clock, CheckCircle2, XCircle, BarChart3, Users,
  FileText, Search, ChevronDown, ChevronRight, RefreshCw, Send, Filter,
  Eye, AlertOctagon, Ban, Scale, Activity, Calendar, X, Info, Save,
  Download, FileOutput, Edit, Check
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const HISTORY_MONTHS = 60;

const TABS = [
  { id: 'overview', label: 'Compliance Overview', icon: Shield },
  { id: 'accounts', label: 'Account Registry', icon: Users },
  { id: 'disputes', label: 'Disputes Center', icon: Scale },
  { id: 'cycles', label: 'Reporting Cycles', icon: Calendar },
  { id: 'export', label: 'Metro 2 Export', icon: FileOutput },
];

// ---- Mini Payment History Display ----
const MiniPaymentHistory = ({ profile = '' }) => {
  const chars = (profile || '').padEnd(HISTORY_MONTHS, '-').slice(0, 24).split('');
  return (
    <div className="flex gap-px" title={`${profile?.length || 0}/${HISTORY_MONTHS} months`}>
      {chars.map((c, i) => (
        <div key={i} className={`w-2 h-3 rounded-sm ${c === '1' ? 'bg-green-400' : c === '0' ? 'bg-red-400' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
};

const ScoreBadge = ({ score, small }) => {
  const color = score >= 80 ? 'bg-green-100 text-green-700 border-green-200'
    : score >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center border rounded-full font-bold ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${color}`}>
      {score}%
    </span>
  );
};

// ---- Full 60-Month Payment History (5 years) ----
const PaymentHistoryGrid = ({ profile = '', editable = false, onChange }) => {
  const chars = (profile || '').padEnd(HISTORY_MONTHS, '-').split('').slice(0, HISTORY_MONTHS);
  const now = new Date();
  const months = [];
  for (let i = HISTORY_MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), idx: HISTORY_MONTHS - 1 - i });
  }

  const toggleMonth = (idx) => {
    if (!editable || !onChange) return;
    const arr = [...chars];
    if (arr[idx] === '1') arr[idx] = '0';
    else if (arr[idx] === '0') arr[idx] = '-';
    else arr[idx] = '1';
    onChange(arr.join(''));
  };

  // Group into years (12 months each)
  const years = [];
  for (let i = 0; i < months.length; i += 12) {
    years.push(months.slice(i, i + 12));
  }

  return (
    <div className="space-y-2 overflow-x-auto">
      {years.map((yearMonths, yi) => (
        <div key={yi}>
          <p className="text-[10px] text-gray-500 font-semibold mb-1">{yearMonths[0]?.year}{yearMonths[yearMonths.length - 1]?.year !== yearMonths[0]?.year ? ` - ${yearMonths[yearMonths.length - 1]?.year}` : ''}</p>
          <div className="grid grid-cols-12 gap-1 min-w-[480px]">
            {yearMonths.map((m) => {
              const c = chars[m.idx];
              return (
                <div key={m.idx} className="text-center">
                  <div className="text-[8px] text-gray-400 mb-0.5">{m.label}</div>
                  <button
                    onClick={() => toggleMonth(m.idx)}
                    disabled={!editable}
                    className={`w-full h-6 rounded text-[9px] font-bold border flex items-center justify-center transition ${
                      c === '1' ? 'bg-green-100 border-green-300 text-green-700' :
                      c === '0' ? 'bg-red-100 border-red-300 text-red-700' :
                      'bg-gray-50 border-gray-200 text-gray-400'
                    } ${editable ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''}`}
                    data-testid={`ph-month-${m.idx}`}
                  >
                    {c === '1' ? 'OK' : c === '0' ? 'LATE' : '—'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {editable && (
        <p className="text-[10px] text-blue-500 mt-1">Click a month to toggle: OK → LATE → No Data → OK</p>
      )}
    </div>
  );
};

// ================================================================
// TAB 1: COMPLIANCE OVERVIEW
// ================================================================
const ComplianceOverview = ({ overview, onRefresh, onNavigate }) => {
  if (!overview) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  const stats = [
    { label: 'Total Accounts', value: overview.total_accounts, icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100', sub: `${overview.collections_count} Coll / ${overview.credit_builder_count} CB / ${overview.school_count || 0} School` },
    { label: 'Ready to Report', value: overview.ready_to_report, icon: CheckCircle2, color: 'bg-green-50 text-green-600 border-green-100', sub: `${overview.not_ready} not ready` },
    { label: 'Avg Compliance', value: `${overview.average_compliance_score}%`, icon: Shield, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', sub: 'Across all accounts' },
    { label: 'Open Disputes', value: overview.disputes?.open || 0, icon: Scale, color: 'bg-amber-50 text-amber-600 border-amber-100', sub: `${overview.disputes?.approaching_deadline || 0} nearing deadline` },
  ];
  const issues = [
    { label: 'Missing Metro 2 Status Code', count: overview.missing_metro2_code, icon: AlertOctagon, severity: 'critical' },
    { label: 'Incomplete Payment History (60mo)', count: overview.missing_payment_history, icon: Clock, severity: 'high' },
    { label: 'Cross-Bureau Inconsistencies', count: overview.inconsistent_cross_bureau, icon: AlertTriangle, severity: 'high' },
    { label: 'Reporting Suppressed', count: overview.suppressed, icon: Ban, severity: 'medium' },
    { label: 'Under Active Dispute', count: overview.disputed, icon: Scale, severity: 'medium' },
    { label: 'Overdue Disputes (30+ days)', count: overview.disputes?.overdue || 0, icon: XCircle, severity: 'critical' },
  ];
  return (
    <div className="space-y-6" data-testid="compliance-overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className={`border ${s.color.split(' ')[2]}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color.split(' ')[0]}`}>
                  <s.icon className={`w-5 h-5 ${s.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Issues Requiring Attention</h3>
          <div className="space-y-2">
            {issues.filter(i => i.count > 0).map((issue, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                issue.severity === 'critical' ? 'bg-red-50 border-red-200' : issue.severity === 'high' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <issue.icon className={`w-4 h-4 ${issue.severity === 'critical' ? 'text-red-500' : issue.severity === 'high' ? 'text-amber-500' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{issue.label}</span>
                </div>
                <Badge className={issue.severity === 'critical' ? 'bg-red-100 text-red-700' : issue.severity === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}>{issue.count}</Badge>
              </div>
            ))}
            {issues.filter(i => i.count > 0).length === 0 && (
              <div className="text-center py-6 text-green-600 font-medium flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" />All accounts are compliant</div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRefresh} data-testid="refresh-overview"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        <Button onClick={() => onNavigate('accounts')} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="view-all-accounts"><Users className="w-4 h-4 mr-2" />View All Accounts</Button>
        <Button variant="outline" onClick={() => onNavigate('disputes')} data-testid="view-disputes"><Scale className="w-4 h-4 mr-2" />Disputes</Button>
        <Button variant="outline" onClick={() => onNavigate('export')} data-testid="view-export"><FileOutput className="w-4 h-4 mr-2" />Metro 2 Export</Button>
      </div>
    </div>
  );
};

// ================================================================
// EDITABLE COMPLIANCE MODAL — Edit ALL failing fields
// ================================================================
const FIELD_LABELS = {
  account_number: 'Account Number',
  client_name: 'Consumer Name',
  first_name: 'First Name',
  last_name: 'Last Name',
  debtor_first_name: 'Debtor First Name',
  debtor_last_name: 'Debtor Last Name',
  past_due_balance: 'Current Balance',
  original_balance: 'Original Amount',
  current_balance: 'Current Balance',
  credit_limit: 'Credit Limit / Highest Credit',
  first_failed_payment_date: 'Date of First Delinquency',
  date_opened: 'Date Opened',
  account_status: 'Account Status',
  metro2_status_code: 'Metro 2 Status Code',
  payment_rating: 'Payment Rating Code',
  payment_history_profile: 'Payment History (60mo)',
  special_comment_code: 'Special Comment Code',
  assigned_rep_name: 'Creditor Name / Rep',
  client_email: 'Consumer Email',
  client_phone: 'Consumer Phone',
  address: 'Consumer Address',
  date_of_birth: 'Date of Birth',
  ssn_last_four: 'SSN (Last 4)',
  ecoa_code: 'ECOA Code',
};

const ECOA_CODES = {
  '1': '1 — Individual',
  '2': '2 — Joint',
  '3': '3 — Authorized User',
  '5': '5 — Co-Maker/Guarantor',
  '7': '7 — Maker',
  'T': 'T — Terminated',
  'W': 'W — Business',
  'X': 'X — Deceased',
};

const CORRECTION_TYPES = [
  'Metro 2 status code correction',
  'Payment rating correction',
  'Balance/amount correction',
  'Account number update',
  'Consumer name correction',
  'Consumer contact info update',
  'Payment history correction',
  'Date correction',
  'Special comment update',
  'ECOA code update',
  'Dispute resolution update',
  'Other',
];

const AccountComplianceModal = ({ accountId, onClose, onSaved }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState(null);
  const [form, setForm] = useState({});
  const [reason, setReason] = useState('');
  const [correctedItems, setCorrectedItems] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/credit-reporting/accounts/${accountId}/compliance`),
      api.get('/collections/furnisher/reference-codes'),
    ]).then(([compRes, codesRes]) => {
      const d = compRes.data;
      setData(d);
      setCodes(codesRes.data);
      // Initialize form from raw_fields
      setForm(d.raw_fields ? { ...d.raw_fields } : {});
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [accountId]);

  const handleSave = async () => {
    if (!reason.trim()) { toast.error('Please enter a reason for corrections'); return; }
    setSaving(true);
    try {
      await api.post(`/credit-reporting/accounts/${accountId}/fix`, {
        fields: form,
        reason,
        corrected_items: correctedItems,
      });
      toast.success('Account updated successfully');
      setEditing(false);
      setReason('');
      setCorrectedItems([]);
      onSaved?.();
      // Refresh
      const fresh = await api.get(`/credit-reporting/accounts/${accountId}/compliance`);
      setData(fresh.data);
      setForm(fresh.data.raw_fields ? { ...fresh.data.raw_fields } : {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally { setSaving(false); }
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleCorrectionItem = (item) => {
    setCorrectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
    </div>
  );
  if (!data) return null;
  const c = data.compliance;
  const failingFields = c.fields.filter(f => f.status === 'fail');
  const passingFields = c.fields.filter(f => f.status === 'pass');

  // Helper to render the right input for a field
  const renderFieldInput = (fieldName) => {
    const val = form[fieldName] ?? '';
    // Dropdown fields
    if (fieldName === 'metro2_status_code') {
      return (
        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={val} onChange={e => updateField(fieldName, e.target.value)} data-testid={`edit-${fieldName}`}>
          <option value="">-- Select --</option>
          {codes?.metro2_status_codes && Object.entries(codes.metro2_status_codes).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
        </select>
      );
    }
    if (fieldName === 'payment_rating') {
      return (
        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={val} onChange={e => updateField(fieldName, e.target.value)} data-testid={`edit-${fieldName}`}>
          <option value="">-- Select --</option>
          {codes?.payment_rating_codes && Object.entries(codes.payment_rating_codes).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
        </select>
      );
    }
    if (fieldName === 'special_comment_code') {
      return (
        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={val} onChange={e => updateField(fieldName, e.target.value)} data-testid={`edit-${fieldName}`}>
          <option value="">None</option>
          {codes?.special_comment_codes && Object.entries(codes.special_comment_codes).filter(([k]) => k).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
        </select>
      );
    }
    if (fieldName === 'ecoa_code') {
      return (
        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={val} onChange={e => updateField(fieldName, e.target.value)} data-testid={`edit-${fieldName}`}>
          <option value="">-- Select --</option>
          {Object.entries(ECOA_CODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      );
    }
    if (fieldName === 'account_status') {
      return (
        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={val} onChange={e => updateField(fieldName, e.target.value)} data-testid={`edit-${fieldName}`}>
          <option value="">-- Select --</option>
          <option value="active">Active</option>
          <option value="paid_in_full">Paid in Full</option>
          <option value="closed">Closed</option>
          <option value="transferred">Transferred</option>
          <option value="bankruptcy">Bankruptcy</option>
          <option value="forbearance">Forbearance</option>
          <option value="forgiven">Forgiven</option>
          <option value="charged_off">Charged Off</option>
        </select>
      );
    }
    // Skip payment_history_profile here — handled separately
    if (fieldName === 'payment_history_profile') return null;
    // Number fields
    if (['past_due_balance','original_balance','current_balance','credit_limit'].includes(fieldName)) {
      return <Input type="number" className="w-full" value={val} onChange={e => updateField(fieldName, parseFloat(e.target.value) || 0)} data-testid={`edit-${fieldName}`} />;
    }
    // Date fields
    if (['first_failed_payment_date','date_opened','date_of_birth'].includes(fieldName)) {
      return <Input type="date" className="w-full" value={val?.slice(0, 10) || ''} onChange={e => updateField(fieldName, e.target.value)} data-testid={`edit-${fieldName}`} />;
    }
    // Text fields
    return <Input className="w-full" value={val} onChange={e => updateField(fieldName, e.target.value)} placeholder={`Enter ${FIELD_LABELS[fieldName] || fieldName}`} data-testid={`edit-${fieldName}`} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="compliance-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="font-bold text-lg">{data.name}</h2>
            <p className="text-xs text-gray-500 font-mono">
              {data.account_number} / {data.account_type === 'collections' ? 'Collections' : data.account_type === 'school' ? 'School (Educational)' : 'Credit Builder'}
              {data.reporting_suppressed && <span className="text-red-600 font-bold ml-2">[SUPPRESSED]</span>}
              {data.dispute_status && <span className="text-amber-600 font-bold ml-2">[DISPUTED]</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBadge score={c.score} />
            {!editing ? (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="edit-compliance-btn"><Edit className="w-4 h-4 mr-1" />Edit / Fix</Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => { setEditing(false); setReason(''); setCorrectedItems([]); }}>Cancel</Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={saving} data-testid="save-compliance-btn">
                  <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save All'}
                </Button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-5 space-y-6">

          {/* FAILING FIELDS — These need to be fixed */}
          {failingFields.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-600"><XCircle className="w-4 h-4" />Fields Requiring Correction ({failingFields.length})</h3>
              <div className="space-y-3">
                {failingFields.map((f) => (
                  <div key={f.field} className="p-3 rounded-xl border border-red-200 bg-red-50/50" data-testid={`fix-field-${f.field}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-sm">{f.label}</span>
                        <Badge className={`text-[9px] ${f.severity === 'critical' ? 'bg-red-100 text-red-600' : f.severity === 'high' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>{f.severity}</Badge>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{f.field}</span>
                    </div>
                    {editing && f.field !== 'payment_history_profile' ? (
                      <div className="mt-2">{renderFieldInput(f.field)}</div>
                    ) : (
                      <p className="text-xs text-red-500 italic">Missing or empty — {editing ? 'Edit payment history below' : 'click Edit / Fix to correct'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASSING FIELDS — Editable in edit mode */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" />Valid Fields ({passingFields.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {passingFields.map((f) => (
                <div key={f.field} className={`p-2.5 rounded-lg border text-xs ${editing ? 'bg-blue-50/30 border-blue-200' : 'bg-green-50 border-green-200'}`} data-testid={`field-${f.field}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{f.label}</span>
                  </div>
                  {editing && f.field !== 'payment_history_profile' ? (
                    <div className="mt-1">{renderFieldInput(f.field)}</div>
                  ) : (
                    <p className="text-gray-500 truncate">{f.value || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment History (60 months) — always shown */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />Payment History (5 Years / 60 Months)</h3>
            <PaymentHistoryGrid
              profile={editing ? form.payment_history_profile : data.payment_history_profile}
              editable={editing}
              onChange={(v) => updateField('payment_history_profile', v)}
            />
          </div>

          {/* Correction Tracking — only in edit mode */}
          {editing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-amber-800 flex items-center gap-2"><FileText className="w-4 h-4" />Correction Details</h3>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">What was corrected? (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CORRECTION_TYPES.map(ct => (
                    <button key={ct} onClick={() => toggleCorrectionItem(ct)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition ${correctedItems.includes(ct) ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'}`}
                      data-testid={`correction-${ct.replace(/\s+/g, '-').toLowerCase()}`}
                    >{ct}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Reason for Correction *</label>
                <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why these corrections are being made..." className="mt-1" data-testid="correction-reason" />
              </div>
            </div>
          )}

          {/* Cross-Bureau */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" />Cross-Bureau Consistency</h3>
            {data.cross_bureau.consistent ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircle2 className="w-5 h-5" />Consistent across Equifax, Experian, and TransUnion</div>
            ) : (
              <div className="space-y-2">
                {data.cross_bureau.issues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" /><span className="text-amber-700">{issue.issue}</span></div>
                ))}
              </div>
            )}
          </div>

          {/* Disputes */}
          {data.disputes?.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Scale className="w-4 h-4 text-amber-500" />Disputes ({data.disputes.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.disputes.map(d => (
                  <div key={d.id} className={`p-3 rounded-lg border text-xs ${d.status === 'open' ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between"><span className="font-medium">{d.dispute_reason}</span><Badge className={d.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>{d.status}</Badge></div>
                    <p className="text-gray-400 mt-1">{d.bureau || 'No bureau'} / {new Date(d.opened_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Log */}
          {data.audit_log?.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />Audit Trail</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {data.audit_log.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span><Badge className="bg-gray-100 text-gray-600 mr-2">{l.action?.replace(/_/g, ' ')}</Badge>{l.reason || l.investigation_notes || '—'}</span>
                    <span className="text-gray-400 whitespace-nowrap ml-2">{new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// TAB 2: ACCOUNT REGISTRY
// ================================================================
const AccountRegistry = () => {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadAccounts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('account_type', typeFilter);
    if (complianceFilter) params.set('compliance_filter', complianceFilter);
    params.set('limit', '200');
    api.get(`/credit-reporting/accounts?${params}`)
      .then(r => { setAccounts(r.data.accounts || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load accounts'))
      .finally(() => setLoading(false));
  }, [search, typeFilter, complianceFilter]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  return (
    <div className="space-y-4" data-testid="account-registry">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or account #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" data-testid="search-accounts" />
        </div>
        <select className="border rounded-lg px-3 py-2 text-xs bg-white h-9" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} data-testid="filter-type">
          <option value="">All Types</option>
          <option value="collections">Collections</option>
          <option value="credit_builder">Credit Builder</option>
          <option value="school">School (Educational)</option>
        </select>
        <select className="border rounded-lg px-3 py-2 text-xs bg-white h-9" value={complianceFilter} onChange={e => setComplianceFilter(e.target.value)} data-testid="filter-compliance">
          <option value="">All Status</option>
          <option value="ready">Ready to Report</option>
          <option value="not_ready">Not Ready</option>
          <option value="suppressed">Suppressed</option>
        </select>
        <Badge className="bg-gray-100 text-gray-700">{total} accounts</Badge>
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Account</th>
                <th className="text-left p-3 font-semibold text-gray-600">Type</th>
                <th className="text-left p-3 font-semibold text-gray-600">Metro 2</th>
                <th className="text-left p-3 font-semibold text-gray-600">Payment History</th>
                <th className="text-center p-3 font-semibold text-gray-600">Compliance</th>
                <th className="text-center p-3 font-semibold text-gray-600">Bureau Sync</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                <th className="p-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <React.Fragment key={a.id}>
                  <tr className="border-t hover:bg-blue-50/30 cursor-pointer transition" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} data-testid={`account-row-${a.id}`}>
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-gray-400 font-mono text-[10px]">{a.account_number}</p>
                    </td>
                    <td className="p-3"><Badge className={a.account_type === 'collections' ? 'bg-purple-100 text-purple-700' : a.account_type === 'school' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}>{a.account_type === 'collections' ? 'COLL' : a.account_type === 'school' ? 'EDU' : 'CB'}</Badge></td>
                    <td className="p-3"><span className="font-mono font-bold">{a.metro2_status_code || '—'}</span>{a.payment_rating && <span className="text-gray-400 ml-1">/ {a.payment_rating}</span>}</td>
                    <td className="p-3"><MiniPaymentHistory profile={a.payment_history_profile} /></td>
                    <td className="p-3 text-center"><ScoreBadge score={a.compliance_score} small /></td>
                    <td className="p-3 text-center">{a.cross_bureau_consistent ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {a.reporting_suppressed && <Badge className="bg-red-100 text-red-600 text-[9px]">SUPP</Badge>}
                        {a.dispute_status && <Badge className="bg-amber-100 text-amber-600 text-[9px]">DISP</Badge>}
                        {a.ready_to_report && !a.reporting_suppressed && <Badge className="bg-green-100 text-green-600 text-[9px]">READY</Badge>}
                        {!a.ready_to_report && <Badge className="bg-gray-100 text-gray-500 text-[9px]">INCOMPLETE</Badge>}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={e => { e.stopPropagation(); setSelectedId(a.id); }} data-testid={`inspect-${a.id}`}>
                        <Eye className="w-3 h-3 mr-1" />Inspect
                      </Button>
                    </td>
                  </tr>
                  {expandedId === a.id && (
                    <tr><td colSpan={8} className="bg-gray-50 p-4 border-t">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Balance: <strong className="text-gray-900">${(a.balance || 0).toLocaleString()}</strong></span>
                          <span>Original: <strong className="text-gray-900">${(a.original_balance || 0).toLocaleString()}</strong></span>
                          <span>Status: <strong className="text-gray-900">{a.account_status}</strong></span>
                          {a.last_reported_date && <span>Last Reported: <strong className="text-gray-900">{new Date(a.last_reported_date).toLocaleDateString()}</strong></span>}
                          {a.special_comment_code && <span>Comment: <strong className="text-gray-900">{a.special_comment_code}</strong></span>}
                        </div>
                        <PaymentHistoryGrid profile={a.payment_history_profile} />
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && <div className="text-center py-12 text-gray-400">No accounts found</div>}
        </div>
      )}
      {selectedId && <AccountComplianceModal accountId={selectedId} onClose={() => setSelectedId(null)} onSaved={loadAccounts} />}
    </div>
  );
};

// ================================================================
// TAB 3: DISPUTES CENTER — Clickable disputes with detail/response modal
// ================================================================
const DisputeDetailModal = ({ dispute, onClose, onResolved }) => {
  const [codes, setCodes] = useState(null);
  const [acdvResponse, setAcdvResponse] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/collections/furnisher/reference-codes').then(r => setCodes(r.data)).catch(() => {});
  }, []);

  const handleResolve = async () => {
    if (!acdvResponse) { toast.error('Select an ACDV response'); return; }
    setSaving(true);
    try {
      await api.post(`/collections/accounts/${dispute.account_id}/furnisher/resolve-dispute`, {
        dispute_id: dispute.id,
        acdv_response: acdvResponse,
        investigation_notes: notes,
      });
      toast.success('Dispute resolved');
      onResolved?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resolve');
    } finally { setSaving(false); }
  };

  const isOpen = dispute.status === 'open';
  let daysLeft = null;
  if (isOpen && dispute.deadline) {
    try { daysLeft = Math.ceil((new Date(dispute.deadline) - new Date()) / (1000*60*60*24)); } catch {}
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-testid="dispute-detail-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="font-bold text-lg">Dispute Detail</h2>
            <p className="text-xs text-gray-500 font-mono">{dispute.debtor_name} / {dispute.account_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isOpen ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>{dispute.status}</Badge>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[10px] text-gray-500 uppercase font-semibold">Dispute Reason</p><p className="text-sm font-medium">{dispute.dispute_reason}</p></div>
            <div><p className="text-[10px] text-gray-500 uppercase font-semibold">Bureau</p><p className="text-sm font-medium">{dispute.bureau || 'Not specified'}</p></div>
            <div><p className="text-[10px] text-gray-500 uppercase font-semibold">Opened</p><p className="text-sm">{new Date(dispute.opened_at).toLocaleString()}</p></div>
            <div><p className="text-[10px] text-gray-500 uppercase font-semibold">Deadline</p>
              <p className={`text-sm font-medium ${daysLeft !== null && daysLeft < 0 ? 'text-red-600' : daysLeft !== null && daysLeft <= 5 ? 'text-amber-600' : ''}`}>
                {dispute.deadline_date || '—'}{daysLeft !== null && ` (${daysLeft < 0 ? Math.abs(daysLeft) + ' days overdue' : daysLeft + ' days left'})`}
              </p>
            </div>
            <div><p className="text-[10px] text-gray-500 uppercase font-semibold">Opened By</p><p className="text-sm">{dispute.opened_by}</p></div>
            {dispute.resolved_by && <div><p className="text-[10px] text-gray-500 uppercase font-semibold">Resolved By</p><p className="text-sm">{dispute.resolved_by}</p></div>}
          </div>
          {dispute.consumer_statement && (
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Consumer Statement</p>
              <p className="text-sm italic">"{dispute.consumer_statement}"</p>
            </div>
          )}
          {dispute.acdv_response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">ACDV Response</p>
              <p className="text-sm font-medium text-green-700">{codes?.acdv_response_codes?.[dispute.acdv_response] || dispute.acdv_response}</p>
              {dispute.investigation_notes && <p className="text-xs text-gray-600 mt-1">{dispute.investigation_notes}</p>}
            </div>
          )}
          {/* Resolve Form */}
          {isOpen && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-blue-800">Resolve This Dispute</h3>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">ACDV Response *</label>
                <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={acdvResponse} onChange={e => setAcdvResponse(e.target.value)} data-testid="resolve-acdv-select">
                  <option value="">-- Select Response --</option>
                  {codes?.acdv_response_codes && Object.entries(codes.acdv_response_codes).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Investigation Notes</label>
                <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Document your investigation findings..." data-testid="resolve-notes-input" />
              </div>
              <Button onClick={handleResolve} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="resolve-dispute-submit">
                {saving ? 'Resolving...' : 'Resolve Dispute'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DisputeRow = ({ dispute: d, onClick }) => (
  <button className={`w-full text-left p-4 rounded-xl border transition hover:shadow-md ${
    d.is_overdue ? 'border-red-300 bg-red-50 hover:border-red-400' :
    d.is_urgent ? 'border-amber-300 bg-amber-50 hover:border-amber-400' :
    d.status === 'resolved' ? 'border-gray-200 bg-gray-50 hover:border-gray-300' :
    'border-blue-200 bg-blue-50/30 hover:border-blue-300'
  }`} onClick={onClick} data-testid={`dispute-row-${d.id}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="font-medium text-sm">{d.debtor_name}</p>
        <p className="text-xs text-gray-500 font-mono">{d.account_number}</p>
      </div>
      <div className="text-right">
        <Badge className={d.is_overdue ? 'bg-red-100 text-red-700' : d.is_urgent ? 'bg-amber-100 text-amber-700' : d.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
          {d.status === 'resolved' ? d.acdv_response || 'resolved' : d.status}
        </Badge>
        {d.days_remaining !== undefined && d.days_remaining !== null && d.status === 'open' && (
          <p className={`text-xs mt-1 font-bold ${d.is_overdue ? 'text-red-600' : d.is_urgent ? 'text-amber-600' : 'text-gray-500'}`}>
            {d.is_overdue ? `${Math.abs(d.days_remaining)} days overdue` : `${d.days_remaining} days left`}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
      <span>Reason: <strong>{d.dispute_reason}</strong></span>
      {d.bureau && <span>Bureau: <strong>{d.bureau}</strong></span>}
      <span>{new Date(d.opened_at).toLocaleDateString()}</span>
    </div>
    {d.consumer_statement && <p className="text-xs text-gray-400 mt-1 italic truncate">"{d.consumer_statement}"</p>}
  </button>
);

const DisputesCenter = () => {
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    api.get(`/credit-reporting/disputes${params}`)
      .then(r => { setDisputes(r.data.disputes || []); setStats(r.data.stats || {}); })
      .catch(() => toast.error('Failed to load disputes'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const overdue = disputes.filter(d => d.is_overdue);
  const urgent = disputes.filter(d => d.is_urgent && !d.is_overdue);
  const normal = disputes.filter(d => d.status === 'open' && !d.is_urgent && !d.is_overdue);
  const resolved = disputes.filter(d => d.status === 'resolved');

  return (
    <div className="space-y-6" data-testid="disputes-center">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-200"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-amber-600">{stats.open || 0}</p><p className="text-xs text-gray-500">Open Disputes</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{stats.resolved || 0}</p><p className="text-xs text-gray-500">Resolved</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{overdue.length}</p><p className="text-xs text-gray-500">Overdue (30+ Days)</p></CardContent></Card>
      </div>
      <div className="flex gap-2">
        {['', 'open', 'resolved'].map(f => (
          <Button key={f} variant={statusFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(f)} className={statusFilter === f ? 'bg-blue-600 text-white' : ''} data-testid={`filter-${f || 'all'}`}>
            {f === '' ? 'All' : f === 'open' ? 'Open' : 'Resolved'}
          </Button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-4">
          {overdue.length > 0 && <div><h3 className="font-bold text-sm text-red-600 mb-2 flex items-center gap-2"><XCircle className="w-4 h-4" />Overdue ({overdue.length})</h3><div className="space-y-2">{overdue.map(d => <DisputeRow key={d.id} dispute={d} onClick={() => setSelectedDispute(d)} />)}</div></div>}
          {urgent.length > 0 && <div><h3 className="font-bold text-sm text-amber-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Approaching Deadline ({urgent.length})</h3><div className="space-y-2">{urgent.map(d => <DisputeRow key={d.id} dispute={d} onClick={() => setSelectedDispute(d)} />)}</div></div>}
          {normal.length > 0 && <div><h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" />Under Investigation ({normal.length})</h3><div className="space-y-2">{normal.map(d => <DisputeRow key={d.id} dispute={d} onClick={() => setSelectedDispute(d)} />)}</div></div>}
          {resolved.length > 0 && statusFilter !== 'open' && <div><h3 className="font-bold text-sm text-green-700 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Resolved ({resolved.length})</h3><div className="space-y-2">{resolved.map(d => <DisputeRow key={d.id} dispute={d} onClick={() => setSelectedDispute(d)} />)}</div></div>}
          {disputes.length === 0 && <div className="text-center py-12 text-gray-400">No disputes found</div>}
        </div>
      )}
      {selectedDispute && <DisputeDetailModal dispute={selectedDispute} onClose={() => setSelectedDispute(null)} onResolved={() => { setSelectedDispute(null); load(); }} />}
    </div>
  );
};

// ================================================================
// TAB 4: REPORTING CYCLES
// ================================================================
const ReportingCycles = () => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const [cycleDetail, setCycleDetail] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/credit-reporting/cycles').then(r => setCycles(r.data.cycles || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const createCycle = async (cycleType) => {
    setCreating(true);
    try {
      const res = await api.post('/credit-reporting/cycles', { cycle_type: cycleType, bureaus: ['Equifax', 'Experian', 'TransUnion'] });
      toast.success(`${cycleType === 'off_cycle' ? 'Off-cycle' : 'Scheduled'} report created — ${res.data.total_accounts} accounts`);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setCreating(false); }
  };

  const loadCycleDetail = async (cycleId) => {
    if (expandedCycle === cycleId) { setExpandedCycle(null); return; }
    try { const res = await api.get(`/credit-reporting/cycles/${cycleId}`); setCycleDetail(res.data); setExpandedCycle(cycleId); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6" data-testid="reporting-cycles">
      <div className="flex items-center gap-3">
        <Button onClick={() => createCycle('scheduled')} disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="create-scheduled-cycle"><Send className="w-4 h-4 mr-2" />{creating ? 'Creating...' : 'Run Full Reporting Cycle'}</Button>
        <Button variant="outline" onClick={() => createCycle('off_cycle')} disabled={creating} data-testid="create-off-cycle"><RefreshCw className="w-4 h-4 mr-2" />Off-Cycle Report</Button>
        <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto"><Info className="w-3.5 h-3.5" />Reports to Equifax, Experian &amp; TransUnion</div>
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : cycles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No reporting cycles yet.</div>
      ) : (
        <div className="space-y-3">
          {cycles.map(c => (
            <div key={c.id} className="border rounded-xl overflow-hidden" data-testid={`cycle-${c.id}`}>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left" onClick={() => loadCycleDetail(c.id)}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.cycle_type === 'off_cycle' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    {c.cycle_type === 'off_cycle' ? <RefreshCw className="w-5 h-5 text-amber-600" /> : <Send className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.cycle_type === 'off_cycle' ? 'Off-Cycle Report' : 'Scheduled Report'}</p>
                    <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()} / {c.created_by}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="font-bold text-sm">{c.total_accounts} accounts</p><p className="text-xs text-gray-500">{c.bureaus?.join(', ')}</p></div>
                  <Badge className="bg-green-100 text-green-700">{c.status}</Badge>
                  {expandedCycle === c.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {expandedCycle === c.id && cycleDetail && (
                <div className="border-t bg-gray-50 p-4">
                  {cycleDetail.accounts?.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-500 border-b"><th className="text-left p-2">Account</th><th className="text-left p-2">Type</th><th className="text-center p-2">Score</th><th className="text-left p-2">Bureaus</th></tr></thead>
                      <tbody>
                        {cycleDetail.accounts.map(a => (
                          <tr key={a.id} className="border-t"><td className="p-2 font-medium">{a.name}</td><td className="p-2"><Badge className={a.account_type === 'collections' ? 'bg-purple-100 text-purple-700' : a.account_type === 'school' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}>{a.account_type === 'collections' ? 'COLL' : a.account_type === 'school' ? 'EDU' : 'CB'}</Badge></td><td className="p-2 text-center"><ScoreBadge score={a.compliance_score} small /></td><td className="p-2">{a.bureaus?.join(', ')}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-xs text-gray-400 text-center py-4">No accounts in this cycle</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ================================================================
// TAB 5: METRO 2 EXPORT
// ================================================================
const Metro2Export = () => {
  const [accountType, setAccountType] = useState('');
  const [bureau, setBureau] = useState('All');
  const [reporterName, setReporterName] = useState('CREDLOCITY LLC');
  const [reporterAddress, setReporterAddress] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exports, setExports] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    api.get('/credit-reporting/export/history').then(r => setExports(r.data.exports || [])).catch(() => {}).finally(() => setLoadingHistory(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.post('/credit-reporting/export/metro2', {
        bureau,
        account_type: accountType || undefined,
        reporter_name: reporterName,
        reporter_address: reporterAddress,
        reporter_phone: reporterPhone,
      }, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename=(.+)/);
      const filename = match ? match[1] : `METRO2_${bureau}_${new Date().toISOString().slice(0,10)}.dat`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Metro 2 file exported: ${filename}`);
      // Refresh history
      api.get('/credit-reporting/export/history').then(r => setExports(r.data.exports || [])).catch(() => {});
    } catch (err) {
      toast.error('Export failed');
    } finally { setExporting(false); }
  };

  return (
    <div className="space-y-6" data-testid="metro2-export">
      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="font-bold text-sm flex items-center gap-2"><FileOutput className="w-4 h-4 text-blue-500" />Generate Metro 2 File (.dat)</h3>
          <p className="text-xs text-gray-500">Generate a Metro 2 formatted file ready for submission to credit bureaus via e-OSCAR or their FTP portals. Only accounts that pass compliance checks will be included.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Bureau</label>
              <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={bureau} onChange={e => setBureau(e.target.value)} data-testid="export-bureau">
                <option value="All">All Bureaus</option>
                <option value="Equifax">Equifax</option>
                <option value="Experian">Experian</option>
                <option value="TransUnion">TransUnion</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Account Type</label>
              <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={accountType} onChange={e => setAccountType(e.target.value)} data-testid="export-type">
                <option value="">All Accounts</option>
                <option value="collections">Collections Only</option>
                <option value="credit_builder">Credit Builder Only</option>
                <option value="school">School Only</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Reporter Name</label>
              <Input value={reporterName} onChange={e => setReporterName(e.target.value)} className="mt-1" data-testid="export-reporter-name" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Reporter Address</label>
              <Input value={reporterAddress} onChange={e => setReporterAddress(e.target.value)} className="mt-1" placeholder="123 Main St, City, ST 12345" data-testid="export-reporter-address" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Reporter Phone</label>
              <Input value={reporterPhone} onChange={e => setReporterPhone(e.target.value)} className="mt-1" placeholder="5551234567" data-testid="export-reporter-phone" />
            </div>
          </div>
          <Button onClick={handleExport} disabled={exporting} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="export-generate-btn">
            <Download className="w-4 h-4 mr-2" />{exporting ? 'Generating...' : 'Generate & Download Metro 2 File'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />Export History</h3>
          {loadingHistory ? (
            <div className="text-center py-4"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : exports.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No exports yet</p>
          ) : (
            <div className="space-y-2">
              {exports.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <FileOutput className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium font-mono">{e.filename}</p>
                      <p className="text-gray-400">{e.total_accounts} accounts / {e.bureau}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">{new Date(e.created_at).toLocaleString()}</p>
                    <p className="text-gray-500">{e.exported_by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ================================================================
// MAIN DASHBOARD
// ================================================================
const CreditReportingDashboard = ({ defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [overview, setOverview] = useState(null);

  useEffect(() => { if (defaultTab) setActiveTab(defaultTab); }, [defaultTab]);

  const loadOverview = () => {
    api.get('/credit-reporting/compliance/overview').then(r => setOverview(r.data)).catch(() => {});
  };
  useEffect(() => { loadOverview(); }, []);

  return (
    <div className="space-y-6" data-testid="credit-reporting-dashboard">
      <h1 className="text-2xl font-bold">Credit Reporting</h1>
      <div className="flex border-b overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`} onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'overview' && <ComplianceOverview overview={overview} onRefresh={loadOverview} onNavigate={setActiveTab} />}
      {activeTab === 'accounts' && <AccountRegistry />}
      {activeTab === 'disputes' && <DisputesCenter />}
      {activeTab === 'cycles' && <ReportingCycles />}
      {activeTab === 'export' && <Metro2Export />}
    </div>
  );
};

export default CreditReportingDashboard;
