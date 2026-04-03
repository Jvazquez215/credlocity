import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, Users, TrendingUp, Clock, AlertTriangle, ChevronDown, ChevronUp, X, Save, Edit, Check, Calendar, Shield, Gavel } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';
import FurnisherActionsPanel from './FurnisherActionsPanel';

const API_HEADERS = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PaymentHistoryGrid = ({ profile = '', editable = false, onChange }) => {
  const chars = (profile || '').padEnd(24, '-').split('');
  const now = new Date();
  const months = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), idx: 23 - i });
  }

  const toggleMonth = (idx) => {
    if (!editable || !onChange) return;
    const arr = [...chars];
    arr[idx] = arr[idx] === '1' ? '0' : '1';
    onChange(arr.join(''));
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-12 gap-1 min-w-[500px]">
        {months.slice(0, 12).map((m, i) => (
          <div key={i} className="text-center">
            <div className="text-[9px] text-gray-400 mb-1">{m.label} {String(m.year).slice(2)}</div>
            <button
              onClick={() => toggleMonth(m.idx)}
              className={`w-full h-7 rounded text-[10px] font-bold border transition-all ${
                chars[m.idx] === '1' ? 'bg-green-100 border-green-300 text-green-700' :
                chars[m.idx] === '0' ? 'bg-red-100 border-red-300 text-red-700' :
                'bg-gray-50 border-gray-200 text-gray-400'
              } ${editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              disabled={!editable}
              data-testid={`ph-month-${m.idx}`}
            >
              {chars[m.idx] === '1' ? 'OK' : chars[m.idx] === '0' ? 'LATE' : '—'}
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-1 min-w-[500px] mt-1">
        {months.slice(12, 24).map((m, i) => (
          <div key={i + 12} className="text-center">
            <div className="text-[9px] text-gray-400 mb-1">{m.label} {String(m.year).slice(2)}</div>
            <button
              onClick={() => toggleMonth(m.idx)}
              className={`w-full h-7 rounded text-[10px] font-bold border transition-all ${
                chars[m.idx] === '1' ? 'bg-green-100 border-green-300 text-green-700' :
                chars[m.idx] === '0' ? 'bg-red-100 border-red-300 text-red-700' :
                'bg-gray-50 border-gray-200 text-gray-400'
              } ${editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              disabled={!editable}
              data-testid={`ph-month-${m.idx}`}
            >
              {chars[m.idx] === '1' ? 'OK' : chars[m.idx] === '0' ? 'LATE' : '—'}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block" /> On-Time</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-300 rounded inline-block" /> Late/Past Due</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded inline-block" /> No Data</span>
        {editable && <span className="text-blue-500 font-medium">Click a month to toggle</span>}
      </div>
    </div>
  );
};

const AccountDetailModal = ({ account, accountType, onClose, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [corrections, setCorrections] = useState({});
  const [reason, setReason] = useState('');
  const [paymentHistory, setPaymentHistory] = useState(account.payment_history_profile || '');
  const [activeTab, setActiveTab] = useState('overview'); // overview | furnisher

  const isCollections = accountType === 'collections';
  const name = isCollections
    ? (account.debtor_name || `${account.debtor_first_name || ''} ${account.debtor_last_name || ''}`.trim() || account.client_name || 'Unknown')
    : `${account.first_name || ''} ${account.last_name || ''}`;
  const acctNum = account.account_number || '';

  const handleFieldChange = (field, value) => {
    setCorrections(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!reason.trim()) { toast.error('Reason for correction is required'); return; }
    setSaving(true);
    try {
      const allCorrections = { ...corrections };
      if (paymentHistory !== (account.payment_history_profile || '')) {
        allCorrections.payment_history_profile = paymentHistory;
      }
      if (Object.keys(allCorrections).length === 0) { toast.error('No changes to save'); setSaving(false); return; }

      const url = isCollections
        ? `/collections/accounts/${account.id}/fix-reporting`
        : `/credit-builder/accounts/${account.id}/fix-reporting`;
      await api.post(url, { corrections: allCorrections, reason }, API_HEADERS());
      toast.success('Reporting correction saved');
      setEditing(false);
      setCorrections({});
      setReason('');
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save correction');
    } finally { setSaving(false); }
  };

  const fields = isCollections ? [
    { key: 'past_due_balance', label: 'Past Due Balance', type: 'number' },
    { key: 'original_balance', label: 'Original Balance', type: 'number' },
    { key: 'total_payments_received', label: 'Total Payments', type: 'number' },
    { key: 'first_failed_payment_date', label: 'First Failed Payment', type: 'text' },
    { key: 'account_status', label: 'Account Status', type: 'select', options: ['active', 'payment_plan', 'disputed', 'closed', 'charged_off'] },
    { key: 'current_tier', label: 'Current Tier', type: 'text' },
  ] : [
    { key: 'date_opened', label: 'Date Opened', type: 'text' },
    { key: 'date_closed', label: 'Date Closed', type: 'text' },
    { key: 'date_of_last_payment', label: 'Last Payment Date', type: 'text' },
    { key: 'date_of_first_delinquency', label: 'First Delinquency', type: 'text' },
    { key: 'current_balance', label: 'Current Balance', type: 'number' },
    { key: 'amount_past_due', label: 'Amount Past Due', type: 'number' },
    { key: 'highest_credit', label: 'Highest Credit', type: 'number' },
    { key: 'credit_limit', label: 'Credit Limit', type: 'number' },
    { key: 'account_status_code', label: 'Status Code', type: 'text' },
    { key: 'payment_rating', label: 'Payment Rating', type: 'text' },
    { key: 'special_comment_code', label: 'Special Comment', type: 'text' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="account-detail-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 rounded-t-2xl">
          <div className="p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{name}</h2>
              <p className="text-xs text-gray-500 font-mono">{acctNum} | {isCollections ? 'Collections' : 'Credit Builder'}
                {account.metro2_status_code && <span className="ml-2 text-blue-600">[Metro 2: {account.metro2_status_code}]</span>}
                {account.reporting_suppressed && <span className="ml-2 text-red-600 font-bold">[SUPPRESSED]</span>}
                {account.dispute_status === 'under_investigation' && <span className="ml-2 text-amber-600 font-bold">[DISPUTED]</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'overview' && !editing ? (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="edit-reporting-btn">
                  <Edit className="w-4 h-4 mr-1" />Fix Reporting
                </Button>
              ) : activeTab === 'overview' && editing ? (
                <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white" onClick={handleSave} disabled={saving} data-testid="save-reporting-btn">
                  <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save Corrections'}
                </Button>
              ) : null}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
          </div>
          {/* Tabs */}
          {isCollections && (
            <div className="flex border-t">
              <button
                className={`flex-1 text-center py-2.5 text-xs font-semibold transition ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('overview')}
                data-testid="tab-overview"
              >
                Account Overview
              </button>
              <button
                className={`flex-1 text-center py-2.5 text-xs font-semibold transition ${activeTab === 'furnisher' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('furnisher')}
                data-testid="tab-furnisher"
              >
                <Gavel className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Furnisher Actions
              </button>
            </div>
          )}
        </div>

        {activeTab === 'furnisher' && isCollections ? (
          <div className="p-5">
            <FurnisherActionsPanel account={account} onDone={() => { onSaved?.(); }} />
          </div>
        ) : (
        <div className="p-5 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">${(account.past_due_balance || account.amount_past_due || 0).toLocaleString()}</p>
              <p className="text-xs text-red-500">Past Due</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{account.days_past_due || 0}</p>
              <p className="text-xs text-blue-500">Days Past Due</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">${(account.total_payments_received || account.actual_amount_paid || 0).toLocaleString()}</p>
              <p className="text-xs text-green-500">Total Paid</p>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />Payment History (24 Months)</h3>
              {editing && <span className="text-xs text-blue-500">Click months to toggle On-Time/Late</span>}
            </div>
            <PaymentHistoryGrid
              profile={editing ? paymentHistory : (account.payment_history_profile || '')}
              editable={editing}
              onChange={setPaymentHistory}
            />
          </div>

          {/* Reporting Fields */}
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-gray-400" />Reporting Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key} className="bg-gray-50 rounded-lg p-3">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">{f.label}</label>
                  {editing ? (
                    f.type === 'select' ? (
                      <select
                        className="w-full mt-1 text-sm border rounded px-2 py-1.5 bg-white"
                        value={corrections[f.key] ?? account[f.key] ?? ''}
                        onChange={e => handleFieldChange(f.key, e.target.value)}
                        data-testid={`field-${f.key}`}
                      >
                        {f.options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                      </select>
                    ) : (
                      <Input
                        type={f.type === 'number' ? 'number' : 'text'}
                        className="mt-1 text-sm h-8"
                        value={corrections[f.key] ?? account[f.key] ?? ''}
                        onChange={e => handleFieldChange(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                        data-testid={`field-${f.key}`}
                      />
                    )
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {f.type === 'number' ? `$${(account[f.key] || 0).toLocaleString()}` : (account[f.key] || '—')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correction Reason (when editing) */}
          {editing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4" data-testid="correction-reason-section">
              <label className="text-sm font-medium text-amber-800 block mb-2">Reason for Correction *</label>
              <Input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain the reason for this reporting correction..."
                className="bg-white"
                data-testid="correction-reason-input"
              />
              <p className="text-[10px] text-amber-600 mt-1">All corrections are logged for audit compliance.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

const PastDueReporting = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBucket, setExpandedBucket] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedType, setSelectedType] = useState('collections');
  const [cbAccounts, setCbAccounts] = useState([]);
  const [showCb, setShowCb] = useState(false);
  const [cbLoading, setCbLoading] = useState(false);

  const loadReport = () => {
    setLoading(true);
    api.get('/collections/reporting/past-due', API_HEADERS())
      .then(r => setReport(r.data))
      .catch(e => console.error('Report error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(); }, []);

  const loadCbAccounts = () => {
    if (cbAccounts.length > 0) { setShowCb(!showCb); return; }
    setCbLoading(true);
    api.get('/credit-builder/accounts?limit=100', API_HEADERS())
      .then(r => { setCbAccounts(r.data.accounts || []); setShowCb(true); })
      .catch(() => toast.error('Failed to load CB accounts'))
      .finally(() => setCbLoading(false));
  };

  const openAccount = (account, type) => { setSelectedAccount(account); setSelectedType(type); };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!report) return <div className="text-center py-12 text-gray-500">Unable to load report</div>;

  const bucketLabels = { current: 'Current (0-29)', '30_days': '30 Days', '60_days': '60 Days', '90_days': '90 Days', '120_plus': '120+ Days' };
  const bucketColors = { current: 'bg-green-500', '30_days': 'bg-yellow-500', '60_days': 'bg-orange-500', '90_days': 'bg-red-500', '120_plus': 'bg-red-700' };
  const bucketTextColors = { current: 'text-green-700', '30_days': 'text-yellow-700', '60_days': 'text-orange-700', '90_days': 'text-red-700', '120_plus': 'text-red-900' };
  const maxBucketBalance = Math.max(...Object.values(report.aging_buckets).map(b => b.total_balance), 1);

  return (
    <div className="space-y-6" data-testid="past-due-reporting">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Past Due Collections Report</h1>
        <Button variant="outline" size="sm" onClick={loadCbAccounts} data-testid="toggle-cb-accounts">
          {cbLoading ? 'Loading...' : showCb ? 'Hide CB Accounts' : 'Show Credit Builder Accounts'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-total-accounts">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold">{report.total_accounts}</p><p className="text-xs text-gray-500">Total Accounts</p></div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-total-balance">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-red-600" /></div>
              <div><p className="text-2xl font-bold">${report.total_past_due_balance.toLocaleString()}</p><p className="text-xs text-gray-500">Total Past Due</p></div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-total-collected">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-2xl font-bold">${report.total_collected.toLocaleString()}</p><p className="text-xs text-gray-500">Total Collected</p></div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-collection-rate">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
              <div><p className="text-2xl font-bold">{report.collection_rate}%</p><p className="text-xs text-gray-500">Collection Rate</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Builder Accounts (toggleable) */}
      {showCb && cbAccounts.length > 0 && (
        <Card data-testid="cb-accounts-section">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4">Credit Builder Accounts</h2>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b">
                <th className="text-left p-2">Name</th><th className="text-left p-2">Account</th><th className="text-left p-2">Plan</th>
                <th className="text-right p-2">Balance</th><th className="text-right p-2">Past Due</th><th className="text-left p-2">Status</th><th className="p-2">Action</th>
              </tr></thead>
              <tbody>
                {cbAccounts.map(a => (
                  <tr key={a.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => openAccount(a, 'credit_builder')}>
                    <td className="p-2 font-medium">{a.first_name} {a.last_name}</td>
                    <td className="p-2 font-mono text-gray-500">{a.account_number}</td>
                    <td className="p-2"><Badge className="bg-blue-50 text-blue-700">{a.plan_tier}</Badge></td>
                    <td className="p-2 text-right">${(a.current_balance || 0).toLocaleString()}</td>
                    <td className="p-2 text-right text-red-600 font-medium">${(a.amount_past_due || 0).toLocaleString()}</td>
                    <td className="p-2"><Badge className={a.account_status_code === '11' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>{a.account_status_code}</Badge></td>
                    <td className="p-2"><Button variant="ghost" size="sm" className="text-xs h-7" data-testid={`view-cb-${a.id}`}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Aging Buckets */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" />Aging Analysis</h2>
          <div className="space-y-3">
            {Object.entries(report.aging_buckets).map(([key, bucket]) => (
              <div key={key} className="border rounded-xl overflow-hidden" data-testid={`bucket-${key}`}>
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  onClick={() => setExpandedBucket(expandedBucket === key ? null : key)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${bucketColors[key]}`} />
                    <span className="font-medium text-sm">{bucketLabels[key]}</span>
                    <Badge className="bg-gray-100 text-gray-700 text-xs">{bucket.count} accounts</Badge>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                      <div className={`h-full ${bucketColors[key]} rounded-full transition-all`} style={{ width: `${(bucket.total_balance / maxBucketBalance) * 100}%` }} />
                    </div>
                    <span className={`font-bold text-sm min-w-[100px] text-right ${bucketTextColors[key]}`}>${bucket.total_balance.toLocaleString()}</span>
                    {expandedBucket === key ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>
                {expandedBucket === key && bucket.accounts.length > 0 && (
                  <div className="border-t bg-gray-50 p-3">
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-500">
                        <th className="text-left p-2">Debtor</th><th className="text-left p-2">Account</th>
                        <th className="text-right p-2">Days</th><th className="text-right p-2">Balance</th>
                        <th className="text-right p-2">Collected</th><th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Rep</th><th className="p-2">Action</th>
                      </tr></thead>
                      <tbody>
                        {bucket.accounts.map(a => (
                          <tr key={a.id} className="border-t border-gray-200 hover:bg-white cursor-pointer" onClick={() => openAccount(a, 'collections')}>
                            <td className="p-2 font-medium">
                              {a.debtor_name}
                              {a.reporting_suppressed && <Badge className="ml-1 bg-red-100 text-red-600 text-[9px]">SUPP</Badge>}
                              {a.dispute_status && <Badge className="ml-1 bg-amber-100 text-amber-600 text-[9px]">DISP</Badge>}
                            </td>
                            <td className="p-2 font-mono text-gray-500">{a.account_number}</td>
                            <td className="p-2 text-right">{a.days_past_due}</td>
                            <td className="p-2 text-right font-medium text-red-600">${a.past_due_balance.toLocaleString()}</td>
                            <td className="p-2 text-right text-green-600">${a.total_payments_received.toLocaleString()}</td>
                            <td className="p-2"><Badge className={a.account_status === 'active' ? 'bg-blue-100 text-blue-700' : a.account_status === 'payment_plan' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{a.account_status}</Badge></td>
                            <td className="p-2 text-gray-600">{a.assigned_rep_name}</td>
                            <td className="p-2"><Button variant="ghost" size="sm" className="text-xs h-7" data-testid={`view-acct-${a.id}`}>View</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Rep + By Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-gray-500" />By Representative</h2>
            <div className="space-y-2">
              {Object.entries(report.by_rep).map(([rep, data]) => (
                <div key={rep} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{rep}</p><p className="text-xs text-gray-500">{data.count} accounts</p></div>
                  <div className="text-right"><p className="font-bold text-sm text-red-600">${data.total_balance.toLocaleString()}</p><p className="text-xs text-green-600">Collected: ${data.total_collected.toLocaleString()}</p></div>
                </div>
              ))}
              {Object.keys(report.by_rep).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-gray-500" />By Status</h2>
            <div className="space-y-2">
              {Object.entries(report.by_status).map(([st, data]) => (
                <div key={st} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge className={st === 'active' ? 'bg-blue-100 text-blue-700' : st === 'payment_plan' ? 'bg-green-100 text-green-700' : st === 'disputed' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}>{st.replace('_', ' ')}</Badge>
                    <span className="text-xs text-gray-500">{data.count}</span>
                  </div>
                  <p className="font-bold text-sm">${data.total_balance.toLocaleString()}</p>
                </div>
              ))}
              {Object.keys(report.by_status).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Detail Modal */}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          accountType={selectedType}
          onClose={() => setSelectedAccount(null)}
          onSaved={() => { setSelectedAccount(null); loadReport(); }}
        />
      )}
    </div>
  );
};

export default PastDueReporting;
