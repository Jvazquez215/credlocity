import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, RefreshCw,
  ArrowUpRight, ArrowDownRight, RotateCcw, ShieldAlert, Gift,
  Search, ChevronLeft, ChevronRight, Loader2,
  CheckCircle2, Clock, XCircle, Wallet, CloudDownload
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import axios from '../../../utils/api';
import CreditReportingPinGate from '../../../components/CreditReportingPinGate';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const STATUS_COLORS = {
  settled: 'bg-green-100 text-green-800', captured: 'bg-green-100 text-green-800',
  payment: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800',
  declined: 'bg-red-100 text-red-800', failed: 'bg-red-100 text-red-800',
  refund: 'bg-orange-100 text-orange-800', refunded: 'bg-orange-100 text-orange-800',
  chargeback: 'bg-red-100 text-red-800', void: 'bg-gray-100 text-gray-800',
  auth_only: 'bg-blue-100 text-blue-800', credit: 'bg-purple-100 text-purple-800',
};

const STATUS_ICONS = {
  settled: CheckCircle2, captured: CheckCircle2, payment: CheckCircle2,
  pending: Clock, declined: XCircle, failed: XCircle,
  refund: RotateCcw, refunded: RotateCcw, chargeback: ShieldAlert,
  void: XCircle, auth_only: Clock, credit: Gift,
};

const FinanceDashboardInner = () => {
  const [tab, setTab] = useState('overview');
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [credits, setCredits] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnPage, setTxnPage] = useState(0);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnFilter, setTxnFilter] = useState('all');
  const [txnSearch, setTxnSearch] = useState('');
  const [refundModal, setRefundModal] = useState(null);
  const [creditModal, setCreditModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [creditForm, setCreditForm] = useState({ client_name: '', client_type: 'current_client', amount: '', reason: '' });
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // All hooks must be defined before any conditional returns
  const loadSummary = useCallback(async () => {
    try {
      const res = await axios.get(`/authorizenet/dashboard-summary?period=${period}`);
      setSummary(res.data);
    } catch (e) { console.error(e); }
  }, [period]);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`/authorizenet/local-transactions?skip=${txnPage * 25}&limit=25${txnFilter !== 'all' ? `&txn_type=${txnFilter}` : ''}${txnSearch ? `&search=${txnSearch}` : ''}`);
      setTransactions(res.data.transactions || []);
      setTxnTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  }, [txnPage, txnFilter, txnSearch]);

  const loadCredits = useCallback(async () => {
    try {
      const res = await axios.get('/authorizenet/credits?limit=100');
      setCredits(res.data.credits || []);
    } catch (e) { console.error(e); }
  }, []);

  const loadCoupons = useCallback(async () => {
    try {
      const res = await axios.get('/billing/coupons');
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
  }, []);

  const startSync = async () => {
    setSyncing(true);
    try {
      await axios.post('/authorizenet/sync-transactions', {});
      toast.success('Transaction sync started. This may take a few minutes.');
      // Poll status
      const poll = setInterval(async () => {
        try {
          const res = await axios.get('/authorizenet/sync-status');
          setSyncStatus(res.data);
          if (!res.data.running) {
            clearInterval(poll);
            setSyncing(false);
            if (res.data.result) {
              toast.success(`Sync complete: ${res.data.result.synced || 0} transactions imported`);
            }
            loadSummary();
            loadTransactions();
          }
        } catch { clearInterval(poll); setSyncing(false); }
      }, 3000);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Sync failed');
      setSyncing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadSummary(), loadTransactions(), loadCredits(), loadCoupons()]);
      setLoading(false);
    };
    init();
  }, [loadSummary, loadTransactions, loadCredits, loadCoupons]);

  useEffect(() => { 
    loadTransactions(); 
  }, [txnPage, txnFilter, loadTransactions]);

  const processRefund = async () => {
    if (!refundModal || !refundAmount) return;
    setProcessing(true);
    try {
      await axios.post('/authorizenet/refund', {
        transaction_id: refundModal.transaction_id,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        card_last_four: refundModal.last_four,
        expiration_date: refundModal.expiration_date || '2030-12',
        client_name: refundModal.client_name,
      });
      toast.success('Refund processed successfully');
      setRefundModal(null);
      setRefundAmount('');
      setRefundReason('');
      loadSummary();
      loadTransactions();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Refund failed');
    }
    setProcessing(false);
  };

  const issueCredit = async () => {
    if (!creditForm.client_name || !creditForm.amount) return;
    setProcessing(true);
    try {
      await axios.post('/authorizenet/credit', {
        client_name: creditForm.client_name,
        client_type: creditForm.client_type,
        amount: parseFloat(creditForm.amount),
        reason: creditForm.reason,
      });
      toast.success('Credit issued successfully');
      setCreditModal(false);
      setCreditForm({ client_name: '', client_type: 'current_client', amount: '', reason: '' });
      loadSummary();
      loadCredits();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to issue credit');
    }
    setProcessing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'credits', label: 'Credits', icon: Gift },
    { id: 'discounts', label: 'Discounts & Coupons', icon: Wallet },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-blue" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="finance-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="finance-dashboard-title">Finance Dashboard</h1>
          <p className="text-sm text-gray-500">Centralized view of all revenue, payments, credits, and discounts</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" data-testid="period-select">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { loadSummary(); loadTransactions(); loadCredits(); }} data-testid="refresh-btn">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={startSync} disabled={syncing} className="border-green-200 text-green-700 hover:bg-green-50" data-testid="sync-btn">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CloudDownload className="w-4 h-4 mr-1" />}
            {syncing ? (syncStatus?.progress || 'Syncing...') : 'Sync Transactions'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="kpi-cards">
        <KPICard title="Total Revenue" value={fmt(summary?.total_payments)} icon={DollarSign} trend={<ArrowUpRight className="w-4 h-4" />} color="text-green-600 bg-green-50" count={summary?.payment_count} />
        <KPICard title="Refunds" value={fmt(summary?.total_refunds)} icon={RotateCcw} trend={<ArrowDownRight className="w-4 h-4" />} color="text-orange-600 bg-orange-50" count={summary?.refund_count} />
        <KPICard title="Chargebacks" value={fmt(summary?.total_chargebacks)} icon={ShieldAlert} trend={<ArrowDownRight className="w-4 h-4" />} color="text-red-600 bg-red-50" count={summary?.chargeback_count} />
        <KPICard title="Credits Issued" value={fmt(summary?.total_credits)} icon={Gift} color="text-purple-600 bg-purple-50" count={summary?.credit_count} />
        <KPICard title="Net Revenue" value={fmt(summary?.net_revenue)} icon={TrendingUp} color="text-blue-600 bg-blue-50" highlight />
      </div>

      {/* Revenue by Client Type */}
      {summary?.by_client_type && Object.keys(summary.by_client_type).length > 0 && (
        <div className="bg-white rounded-xl border p-5" data-testid="revenue-by-type">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Revenue by Client Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(summary.by_client_type).map(([key, data]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{data.label}</p>
                <p className="text-lg font-bold text-gray-900">{fmt(data.amount)}</p>
                <p className="text-xs text-gray-400">{data.count} transaction{data.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.id ? 'border-primary-blue text-primary-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} data-testid={`tab-${t.id}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab summary={summary} />}
      {tab === 'transactions' && (
        <TransactionsTab
          transactions={transactions} total={txnTotal} page={txnPage} setPage={setTxnPage}
          filter={txnFilter} setFilter={setTxnFilter} search={txnSearch} setSearch={setTxnSearch}
          onRefund={setRefundModal}
        />
      )}
      {tab === 'credits' && <CreditsTab credits={credits} onIssueCredit={() => setCreditModal(true)} />}
      {tab === 'discounts' && <DiscountsTab coupons={coupons} />}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4" data-testid="refund-modal">
            <h3 className="font-semibold text-lg">Process Refund</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p><span className="text-gray-500">Transaction:</span> {refundModal.transaction_id}</p>
              <p><span className="text-gray-500">Client:</span> {refundModal.client_name}</p>
              <p><span className="text-gray-500">Original Amount:</span> {fmt(refundModal.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Refund Amount</label>
              <Input type="number" step="0.01" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder={`Max ${refundModal.amount}`} data-testid="refund-amount" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Reason</label>
              <Input value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Reason for refund" data-testid="refund-reason" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRefundModal(null)}>Cancel</Button>
              <Button onClick={processRefund} disabled={processing || !refundAmount} className="bg-orange-600 hover:bg-orange-700" data-testid="confirm-refund-btn">
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RotateCcw className="w-4 h-4 mr-1" />} Process Refund
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {creditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4" data-testid="credit-modal">
            <h3 className="font-semibold text-lg">Issue Account Credit</h3>
            <div>
              <label className="text-sm font-medium block mb-1">Client Name</label>
              <Input value={creditForm.client_name} onChange={e => setCreditForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Client name" data-testid="credit-client-name" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Client Type</label>
              <select value={creditForm.client_type} onChange={e => setCreditForm(p => ({ ...p, client_type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="current_client">Current Client</option>
                <option value="past_due_collections">Past Due Collections</option>
                <option value="outsourcing_client">Outsourcing Client</option>
                <option value="attorney_network">Attorney Network</option>
                <option value="new_client">New Client</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Credit Amount</label>
              <Input type="number" step="0.01" value={creditForm.amount} onChange={e => setCreditForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" data-testid="credit-amount" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Reason</label>
              <Input value={creditForm.reason} onChange={e => setCreditForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for credit" data-testid="credit-reason" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreditModal(false)}>Cancel</Button>
              <Button onClick={issueCredit} disabled={processing || !creditForm.client_name || !creditForm.amount} data-testid="confirm-credit-btn">
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Gift className="w-4 h-4 mr-1" />} Issue Credit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// KPI Card
const KPICard = ({ title, value, icon: Icon, trend, color, count, highlight }) => (
  <div className={`bg-white rounded-xl border p-4 ${highlight ? 'ring-2 ring-primary-blue/20' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
      {trend && <span className={color?.includes('green') ? 'text-green-500' : 'text-red-400'}>{trend}</span>}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500">{title}{count != null ? ` (${count})` : ''}</p>
  </div>
);

// Overview Tab
const OverviewTab = ({ summary }) => {
  if (!summary) return <p className="text-gray-400 text-center py-8">No data available</p>;

  const totalTxn = summary.total_transactions || 0;
  const payRate = totalTxn > 0 ? ((summary.payment_count / totalTxn) * 100) : 0;
  const refRate = totalTxn > 0 ? ((summary.refund_count / totalTxn) * 100) : 0;
  const cbRate = totalTxn > 0 ? ((summary.chargeback_count / totalTxn) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Financial Summary</h3>
        <div className="space-y-3">
          <SummaryRow label="Total Payments" value={fmt(summary.total_payments)} count={summary.payment_count} color="text-green-600" />
          <SummaryRow label="Total Refunds" value={`-${fmt(summary.total_refunds)}`} count={summary.refund_count} color="text-orange-600" />
          <SummaryRow label="Total Chargebacks" value={`-${fmt(summary.total_chargebacks)}`} count={summary.chargeback_count} color="text-red-600" />
          <SummaryRow label="Total Credits" value={`-${fmt(summary.total_credits)}`} count={summary.credit_count} color="text-purple-600" />
          <div className="border-t pt-3">
            <SummaryRow label="Net Revenue" value={fmt(summary.net_revenue)} color="text-blue-700 font-bold" bold />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <RateCard label="Payment Success Rate" value={payRate} color="green" />
        <RateCard label="Refund Rate" value={refRate} color="orange" />
        <RateCard label="Chargeback Rate" value={cbRate} color="red" />
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, count, color, bold }) => (
  <div className="flex items-center justify-between">
    <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}{count != null ? ` (${count})` : ''}</span>
    <span className={`text-sm font-semibold ${color}`}>{value}</span>
  </div>
);

const RateCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl border p-4">
    <p className="text-xs text-gray-500 mb-2">{label}</p>
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full bg-${color}-500`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={`text-sm font-bold text-${color}-600`}>{value.toFixed(1)}%</span>
    </div>
  </div>
);

// Transactions Tab
const TransactionsTab = ({ transactions, total, page, setPage, filter, setFilter, search, setSearch, onRefund }) => {
  const pageSize = 25;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4" data-testid="transactions-tab">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'payment', 'refund', 'chargeback', 'void', 'credit'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              data-testid={`filter-${f}`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}s
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by client or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
            data-testid="txn-search"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Transaction ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transactions found</td></tr>
              ) : transactions.map((txn, i) => {
                const StatusIcon = STATUS_ICONS[txn.type] || STATUS_ICONS[txn.status] || Clock;
                const statusColor = STATUS_COLORS[txn.type] || STATUS_COLORS[txn.status] || 'bg-gray-100 text-gray-800';
                return (
                  <tr key={txn.id || i} className="border-b last:border-0 hover:bg-gray-50" data-testid={`txn-row-${i}`}>
                    <td className="px-4 py-3 text-gray-600">{txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{txn.transaction_id?.slice(0, 12) || '-'}</td>
                    <td className="px-4 py-3">
                      <div>{txn.client_name || '-'}</div>
                      {txn.last_four && <span className="text-xs text-gray-400">****{txn.last_four}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusColor} text-[10px] gap-1`}><StatusIcon className="w-3 h-3" />{txn.type}</Badge>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{txn.status}</span></td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={txn.type === 'refund' || txn.type === 'chargeback' ? 'text-red-600' : 'text-gray-900'}>
                        {txn.type === 'refund' || txn.type === 'chargeback' ? '-' : ''}{fmt(txn.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {txn.type === 'payment' && txn.status !== 'refunded' && (
                        <button onClick={() => onRefund(txn)} className="text-xs text-orange-600 hover:underline" data-testid={`refund-btn-${i}`}>
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages} ({total} total)</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Credits Tab
const CreditsTab = ({ credits, onIssueCredit }) => (
  <div className="space-y-4" data-testid="credits-tab">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{credits.length} credit{credits.length !== 1 ? 's' : ''} issued</p>
      <Button size="sm" onClick={onIssueCredit} data-testid="issue-credit-btn">
        <Gift className="w-4 h-4 mr-1" /> Issue Credit
      </Button>
    </div>
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Client</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Reason</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          {credits.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-400">No credits issued yet</td></tr>
          ) : credits.map((c, i) => (
            <tr key={c.id || i} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
              <td className="px-4 py-3 font-medium">{c.client_name}</td>
              <td className="px-4 py-3"><Badge className="bg-purple-50 text-purple-700 text-[10px]">{c.client_type?.replace(/_/g, ' ')}</Badge></td>
              <td className="px-4 py-3 text-gray-500 text-xs">{c.reason || '-'}</td>
              <td className="px-4 py-3 text-right font-semibold text-purple-700">{fmt(c.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Discounts Tab
const DiscountsTab = ({ coupons }) => (
  <div className="space-y-4" data-testid="discounts-tab">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} configured</p>
    </div>
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Code</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Discount</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Usage</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Expires</th>
          </tr>
        </thead>
        <tbody>
          {coupons.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-8 text-gray-400">No coupons configured. Create them in Billing Settings.</td></tr>
          ) : coupons.map((c, i) => (
            <tr key={c.id || i} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 font-mono font-semibold text-primary-blue">{c.code}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{c.coupon_type?.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3">
                {c.discount_type === 'percentage' ? `${c.discount_value}%` :
                 c.discount_type === 'fixed_amount' ? fmt(c.discount_value) :
                 c.discount_type === 'free_months' ? `${c.discount_value} months free` :
                 `$${c.discount_value}/file`}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{c.times_used || 0}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
              <td className="px-4 py-3">
                <Badge className={c.is_active ? 'bg-green-100 text-green-800 text-[10px]' : 'bg-gray-100 text-gray-600 text-[10px]'}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Never'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Wrap the dashboard with the existing Partners Hub PIN gate (same 6-digit PIN + Employee ID)
const FinanceDashboard = () => (
  <CreditReportingPinGate>
    <FinanceDashboardInner />
  </CreditReportingPinGate>
);

export default FinanceDashboard;
