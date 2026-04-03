import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import {
  DollarSign, CreditCard, RefreshCw, AlertTriangle, Download,
  Search, Filter, ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  XCircle, RotateCcw, TrendingUp, Users, Receipt, Plus, Minus,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json'
});

const fmtCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

// ==================== PROCESS PAYMENT MODAL ====================
const ProcessPaymentModal = ({ open, onClose, onSuccess, clientTypes }) => {
  const [form, setForm] = useState({
    amount: '', card_number: '', expiration_date: '', card_code: '',
    client_name: '', client_type: '', client_email: '', description: '',
    invoice_number: '', bill_to: { first_name: '', last_name: '', address: '', city: '', state: '', zip: '' }
  });
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_type) return toast.error('Select a client type');
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/authorizenet/charge`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment of ${fmtCurrency(form.amount)} processed successfully! TXN: ${data.transaction_id}`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error_message || 'Payment failed');
      }
    } catch (e) { toast.error('Payment processing error'); }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="payment-modal">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" /> Process Payment
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Type *</label>
              <select value={form.client_type} onChange={e => setForm(p => ({...p, client_type: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" required data-testid="payment-client-type">
                <option value="">Select client type...</option>
                {clientTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Client Name *</label>
              <input type="text" value={form.client_name} onChange={e => setForm(p => ({...p, client_name: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" required data-testid="payment-client-name" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" required data-testid="payment-amount" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Card Number *</label>
              <input type="text" value={form.card_number} onChange={e => setForm(p => ({...p, card_number: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="4111111111111111" required data-testid="payment-card" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Exp (MMYY) *</label>
              <input type="text" value={form.expiration_date} onChange={e => setForm(p => ({...p, expiration_date: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="1225" required /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">CVV *</label>
              <input type="text" value={form.card_code} onChange={e => setForm(p => ({...p, card_code: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="123" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.client_email} onChange={e => setForm(p => ({...p, client_email: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Invoice #</label>
              <input type="text" value={form.invoice_number} onChange={e => setForm(p => ({...p, invoice_number: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={processing}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              data-testid="confirm-payment-btn">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {processing ? 'Processing...' : `Charge ${form.amount ? fmtCurrency(form.amount) : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== REFUND MODAL ====================
const RefundModal = ({ open, onClose, transaction, onSuccess }) => {
  const [refundType, setRefundType] = useState('full');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [reason, setReason] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [expDate, setExpDate] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (transaction) {
      setLastFour(transaction.last_four || '');
      setAmount('');
      setPercentage('');
      setRefundType('full');
    }
  }, [transaction]);

  if (!open || !transaction) return null;

  const available = (transaction.amount || 0) - (transaction.total_refunded || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const body = {
        transaction_id: transaction.transaction_id,
        refund_type: refundType,
        card_number_last_four: lastFour,
        expiration_date: expDate,
        reason,
        client_name: transaction.client_name
      };
      if (refundType === 'partial' || refundType === 'custom') body.amount = parseFloat(amount);
      if (refundType === 'percentage') body.percentage = parseFloat(percentage);

      const res = await fetch(`${API}/api/authorizenet/refund`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(`Refund of ${fmtCurrency(data.refund_amount)} processed!`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error_message || data.detail || 'Refund failed');
      }
    } catch (e) { toast.error('Refund error'); }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="refund-modal">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b bg-red-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Issue Refund
          </h2>
          <p className="text-sm text-red-600 mt-1">
            Original: {fmtCurrency(transaction.amount)} | Already Refunded: {fmtCurrency(transaction.total_refunded)} | Available: {fmtCurrency(available)}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Refund Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[['full', 'Full Refund'], ['partial', 'Partial Amount'], ['percentage', 'By Percentage'], ['custom', 'Custom Amount']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setRefundType(v)}
                  className={`px-3 py-2 rounded-lg text-sm border font-medium transition ${refundType === v ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  data-testid={`refund-type-${v}`}>{l}</button>
              ))}
            </div>
          </div>
          {(refundType === 'partial' || refundType === 'custom') && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Refund Amount *</label>
              <input type="number" step="0.01" min="0.01" max={available} value={amount}
                onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" required data-testid="refund-amount" /></div>
          )}
          {refundType === 'percentage' && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Percentage (1-100%) *</label>
              <input type="number" min="1" max="100" value={percentage}
                onChange={e => setPercentage(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" required data-testid="refund-percentage" />
              {percentage && <p className="text-xs text-gray-500 mt-1">= {fmtCurrency(transaction.amount * (parseFloat(percentage) / 100))}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Last 4 Digits *</label>
              <input type="text" maxLength="4" value={lastFour} onChange={e => setLastFour(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Exp Date (MMYY) *</label>
              <input type="text" maxLength="4" value={expDate} onChange={e => setExpDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={processing}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              data-testid="confirm-refund-btn">
              {processing ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== ISSUE CREDIT MODAL ====================
const CreditModal = ({ open, onClose, onSuccess, clientTypes }) => {
  const [form, setForm] = useState({ client_name: '', client_type: '', amount: '', reason: '' });
  const [processing, setProcessing] = useState(false);
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/authorizenet/credit`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      });
      const data = await res.json();
      if (data.id) {
        toast.success(`Credit of ${fmtCurrency(form.amount)} issued to ${form.client_name}`);
        onSuccess?.(); onClose();
      } else {
        toast.error(data.detail || 'Failed to issue credit');
      }
    } catch (e) { toast.error('Error issuing credit'); }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="credit-modal">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b bg-blue-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><Plus className="w-5 h-5" /> Issue Credit</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Client Name *</label>
            <input value={form.client_name} onChange={e => setForm(p => ({...p, client_name: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Client Type *</label>
            <select value={form.client_type} onChange={e => setForm(p => ({...p, client_type: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" required>
              <option value="">Select...</option>
              {clientTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
            </select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
            <input type="number" step="0.01" min="0.01" value={form.amount}
              onChange={e => setForm(p => ({...p, amount: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
            <textarea value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} required /></div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={processing}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              data-testid="confirm-credit-btn">{processing ? 'Issuing...' : 'Issue Credit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== CHARGEBACK MODAL ====================
const ChargebackModal = ({ open, onClose, transaction, onSuccess }) => {
  const [form, setForm] = useState({ chargeback_amount: '', reason: '' });
  const [processing, setProcessing] = useState(false);
  useEffect(() => { if (transaction) setForm({ chargeback_amount: String(transaction.amount || ''), reason: '' }); }, [transaction]);
  if (!open || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/authorizenet/chargeback`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ transaction_id: transaction.transaction_id, chargeback_amount: parseFloat(form.chargeback_amount), reason: form.reason })
      });
      const data = await res.json();
      if (data.message) { toast.success('Chargeback recorded'); onSuccess?.(); onClose(); }
      else toast.error(data.detail || 'Failed');
    } catch (e) { toast.error('Error'); }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b bg-amber-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Record Chargeback</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Chargeback Amount</label>
            <input type="number" step="0.01" value={form.chargeback_amount} onChange={e => setForm(p => ({...p, chargeback_amount: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
            <textarea value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} required /></div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={processing}
              className="bg-amber-600 text-white px-5 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
              data-testid="confirm-chargeback-btn">{processing ? 'Recording...' : 'Record Chargeback'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== MAIN PAYMENT MANAGEMENT PAGE ====================
export default function PaymentManagement() {
  const [tab, setTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [clientTypes, setClientTypes] = useState([]);
  const [chargebacks, setChargebacks] = useState([]);
  const [credits, setCredits] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ client_type: '', txn_type: '', search: '' });
  const [period, setPeriod] = useState('month');

  // Modals
  const [showPayment, setShowPayment] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const [showChargeback, setShowChargeback] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [expandedTxn, setExpandedTxn] = useState(null);

  const headers = getHeaders();

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.client_type) params.set('client_type', filters.client_type);
      if (filters.txn_type) params.set('txn_type', filters.txn_type);
      if (filters.search) params.set('search', filters.search);
      params.set('limit', '100');

      const [txnRes, sumRes, cbRes, crRes, ssRes] = await Promise.all([
        fetch(`${API}/api/authorizenet/local-transactions?${params}`, { headers }),
        fetch(`${API}/api/authorizenet/dashboard-summary?period=${period}`, { headers }),
        fetch(`${API}/api/authorizenet/chargebacks`, { headers }),
        fetch(`${API}/api/authorizenet/credits`, { headers }),
        fetch(`${API}/api/authorizenet/sync-status`, { headers })
      ]);

      if (txnRes.ok) { const d = await txnRes.json(); setTransactions(d.transactions || []); }
      if (sumRes.ok) setSummary(await sumRes.json());
      if (cbRes.ok) { const d = await cbRes.json(); setChargebacks(d.chargebacks || []); }
      if (crRes.ok) { const d = await crRes.json(); setCredits(d.credits || []); }
      if (ssRes.ok) setSyncStatus(await ssRes.json());
    } catch (e) { console.error('Load error:', e); }
    setLoading(false);
  }, [filters, period]);

  useEffect(() => {
    fetch(`${API}/api/authorizenet/client-types`).then(r => r.json()).then(setClientTypes).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSync = async () => {
    const res = await fetch(`${API}/api/authorizenet/sync-transactions`, {
      method: 'POST', headers, body: JSON.stringify({ start_date: '2025-01-01' })
    });
    const data = await res.json();
    toast.success(data.message || 'Sync started');
    // Poll status
    const poll = setInterval(async () => {
      const sr = await fetch(`${API}/api/authorizenet/sync-status`, { headers });
      if (sr.ok) {
        const st = await sr.json();
        setSyncStatus(st);
        if (!st.running) { clearInterval(poll); loadData(); }
      }
    }, 5000);
  };

  const getStatusBadge = (txn) => {
    if (txn.is_chargeback) return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium">Chargeback</span>;
    const s = txn.status?.toLowerCase() || '';
    if (s.includes('settled') || s === 'settled') return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Settled</span>;
    if (s.includes('void')) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">Voided</span>;
    if (s.includes('decline')) return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-medium">Declined</span>;
    if (s.includes('refund')) return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">Refunded</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">{txn.status}</span>;
  };

  const getClientTypeBadge = (ct) => {
    const colors = {
      current_client: 'bg-blue-50 text-blue-700', past_due_collections: 'bg-red-50 text-red-700',
      outsourcing_client: 'bg-purple-50 text-purple-700', attorney_network: 'bg-indigo-50 text-indigo-700',
      new_client: 'bg-green-50 text-green-700', credit_repair: 'bg-teal-50 text-teal-700', other: 'bg-gray-50 text-gray-600'
    };
    const label = clientTypes.find(c => c.value === ct)?.label || ct || 'Unknown';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[ct] || 'bg-gray-50 text-gray-600'}`}>{label}</span>;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading payment data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="payment-management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-sm text-gray-500 mt-1">Process payments, manage refunds, track chargebacks</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowPayment(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium" data-testid="process-payment-btn">
            <CreditCard className="w-4 h-4" /> Process Payment
          </button>
          <button onClick={() => setShowCredit(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" data-testid="issue-credit-btn">
            <Plus className="w-4 h-4" /> Issue Credit
          </button>
          <button onClick={handleSync} disabled={syncStatus?.running} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium" data-testid="sync-btn">
            <RefreshCw className={`w-4 h-4 ${syncStatus?.running ? 'animate-spin' : ''}`} /> {syncStatus?.running ? 'Syncing...' : 'Sync Transactions'}
          </button>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus?.running && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 text-sm" data-testid="sync-progress">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-blue-700">{syncStatus.progress}</span>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-3"><div className="flex items-center gap-2 mb-1"><ArrowUpRight className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">Payments</span></div>
            <div className="text-lg font-bold text-green-700">{fmtCurrency(summary.total_payments)}</div><div className="text-xs text-gray-400">{summary.payment_count} txns</div></Card>
          <Card className="p-3"><div className="flex items-center gap-2 mb-1"><ArrowDownRight className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Refunds</span></div>
            <div className="text-lg font-bold text-red-600">{fmtCurrency(summary.total_refunds)}</div><div className="text-xs text-gray-400">{summary.refund_count} txns</div></Card>
          <Card className="p-3"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">Chargebacks</span></div>
            <div className="text-lg font-bold text-amber-600">{fmtCurrency(summary.total_chargebacks)}</div><div className="text-xs text-gray-400">{summary.chargeback_count}</div></Card>
          <Card className="p-3"><div className="flex items-center gap-2 mb-1"><Receipt className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Credits</span></div>
            <div className="text-lg font-bold text-blue-600">{fmtCurrency(summary.total_credits)}</div><div className="text-xs text-gray-400">{summary.credit_count}</div></Card>
          <Card className="p-3"><div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-500">Net Revenue</span></div>
            <div className={`text-lg font-bold ${summary.net_revenue >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmtCurrency(summary.net_revenue)}</div></Card>
          <Card className="p-3"><div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500">Total Txns</span></div>
            <div className="text-lg font-bold text-gray-700">{summary.total_transactions}</div></Card>
        </div>
      )}

      {/* Revenue by Client Type */}
      {summary?.by_client_type && Object.keys(summary.by_client_type).length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Revenue by Client Type</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(summary.by_client_type).map(([key, val]) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{val.label}</div>
                  <div className="text-base font-bold text-gray-900">{fmtCurrency(val.amount)}</div>
                  <div className="text-xs text-gray-400">{val.count} payments</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="week">This Week</option><option value="month">This Month</option>
          <option value="quarter">This Quarter</option><option value="year">This Year</option><option value="all">All Time</option>
        </select>
        <select value={filters.client_type} onChange={e => setFilters(p => ({...p, client_type: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm bg-white" data-testid="filter-client-type">
          <option value="">All Client Types</option>
          {clientTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
        </select>
        <select value={filters.txn_type} onChange={e => setFilters(p => ({...p, txn_type: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">All Types</option><option value="payment">Payments</option><option value="refund">Refunds</option><option value="void">Voids</option><option value="chargeback">Chargebacks</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, ID, invoice..." value={filters.search}
            onChange={e => setFilters(p => ({...p, search: e.target.value}))}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" data-testid="txn-search" />
        </div>
      </div>

      {/* Transaction Table */}
      <Card data-testid="transactions-table">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">{transactions.length} Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Client</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Type</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Amount</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Card</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Actions</th>
              </tr></thead>
              <tbody>
                {transactions.map(txn => (
                  <React.Fragment key={txn.id || txn.transaction_id}>
                    <tr className="border-b hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpandedTxn(expandedTxn === txn.id ? null : txn.id)}>
                      <td className="py-2 px-3 text-gray-600 text-xs">{txn.submit_time ? new Date(txn.submit_time).toLocaleDateString() : txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-'}</td>
                      <td className="py-2 px-3"><div className="font-medium text-gray-900 text-xs">{txn.client_name || 'N/A'}</div>{getClientTypeBadge(txn.client_type)}</td>
                      <td className="py-2 px-3 text-xs capitalize">{txn.type}</td>
                      <td className="py-2 px-3">{getStatusBadge(txn)}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${txn.type === 'refund' ? 'text-red-600' : 'text-gray-900'}`}>{txn.type === 'refund' ? '-' : ''}{fmtCurrency(txn.amount)}</td>
                      <td className="py-2 px-3 text-xs text-gray-500">{txn.card_type} {txn.last_four ? `****${txn.last_four}` : ''}</td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          {txn.type === 'payment' && !txn.is_chargeback && (txn.amount - (txn.total_refunded || 0)) > 0 && (
                            <button onClick={() => { setSelectedTxn(txn); setShowRefund(true); }}
                              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100" data-testid={`refund-btn-${txn.transaction_id}`}>Refund</button>
                          )}
                          {txn.type === 'payment' && !txn.is_chargeback && (
                            <button onClick={() => { setSelectedTxn(txn); setShowChargeback(true); }}
                              className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded hover:bg-amber-100">CB</button>
                          )}
                          {expandedTxn === txn.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </td>
                    </tr>
                    {expandedTxn === txn.id && (
                      <tr className="bg-gray-50"><td colSpan={7} className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div><span className="text-gray-500">Transaction ID:</span> <span className="font-mono">{txn.transaction_id}</span></div>
                          <div><span className="text-gray-500">Invoice:</span> {txn.invoice_number || 'N/A'}</div>
                          <div><span className="text-gray-500">Batch:</span> {txn.batch_id || 'N/A'}</div>
                          <div><span className="text-gray-500">Total Refunded:</span> {fmtCurrency(txn.total_refunded)}</div>
                          <div><span className="text-gray-500">Chargeback:</span> {txn.is_chargeback ? `Yes - ${fmtCurrency(txn.chargeback_amount)}` : 'No'}</div>
                          <div><span className="text-gray-500">Email:</span> {txn.client_email || 'N/A'}</div>
                        </div>
                        {txn.refund_history?.length > 0 && (
                          <div className="mt-3"><span className="text-xs font-medium text-gray-600">Refund History:</span>
                            {txn.refund_history.map((r, i) => (
                              <div key={i} className="text-xs text-gray-500 mt-1">{new Date(r.processed_at).toLocaleDateString()} - {r.refund_type} refund: {fmtCurrency(r.amount)} {r.reason && `(${r.reason})`}</div>
                            ))}
                          </div>
                        )}
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No transactions found. Try syncing or adjusting filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProcessPaymentModal open={showPayment} onClose={() => setShowPayment(false)} onSuccess={loadData} clientTypes={clientTypes} />
      <RefundModal open={showRefund} onClose={() => { setShowRefund(false); setSelectedTxn(null); }} transaction={selectedTxn} onSuccess={loadData} />
      <CreditModal open={showCredit} onClose={() => setShowCredit(false)} onSuccess={loadData} clientTypes={clientTypes} />
      <ChargebackModal open={showChargeback} onClose={() => { setShowChargeback(false); setSelectedTxn(null); }} transaction={selectedTxn} onSuccess={loadData} />
    </div>
  );
}
