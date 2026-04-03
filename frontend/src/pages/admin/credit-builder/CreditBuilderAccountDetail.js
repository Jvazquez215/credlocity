import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const STATUS_LABELS = { '11': 'Current', '71': '30-59 Late', '78': '60-89 Late', '80': '90-119 Late', '82': '120-149 Late', '83': '150-179 Late', '84': '180+ Late', '97': 'Charge-Off' };
const STATUS_COLOR = { '11': 'bg-green-100 text-green-800', '97': 'bg-red-200 text-red-900' };
const HISTORY_COLORS = { '0': 'bg-green-500', '1': 'bg-yellow-400', '2': 'bg-orange-500', '3': 'bg-red-500', '4': 'bg-red-600', '5': 'bg-red-700', '6': 'bg-red-800' };

const CreditBuilderAccountDetail = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchAll(); }, [accountId]);

  const fetchAll = async () => {
    try {
      const [acc, txns, disps, prods] = await Promise.all([
        api.get(`/credit-builder/accounts/${accountId}`, AUTH()),
        api.get(`/credit-builder/accounts/${accountId}/history`, AUTH()),
        api.get(`/credit-builder/disputes?account_id=${accountId}`, AUTH()),
        api.get('/credit-builder/products/admin', AUTH()),
      ]);
      setAccount(acc.data);
      setEditForm(acc.data);
      setTransactions(txns.data || []);
      setDisputes(disps.data || []);
      setProducts(prods.data?.filter(p => p.is_active) || []);
    } catch (e) { toast.error('Account not found'); navigate('/admin/credit-builder/accounts'); }
    finally { setLoading(false); }
  };

  const handlePayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      await api.post(`/credit-builder/accounts/${accountId}/payment`, { amount: amt, notes: payNotes }, AUTH());
      toast.success('Payment recorded');
      setPayAmount(''); setPayNotes('');
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.detail || 'Payment failed'); }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) { toast.error('Select a product'); return; }
    try {
      await api.post(`/credit-builder/accounts/${accountId}/purchase`, { product_id: selectedProduct }, AUTH());
      toast.success('Purchase recorded');
      setSelectedProduct('');
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.detail || 'Purchase failed'); }
  };

  const handleSave = async () => {
    try {
      const { account_number, ssn_encrypted, id, created_at, created_by, ...updates } = editForm;
      await api.put(`/credit-builder/accounts/${accountId}`, updates, AUTH());
      toast.success('Account updated');
      setEditing(false);
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.detail || 'Update failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" /></div>;
  if (!account) return null;

  // Payment history grid
  const profile = account.payment_history_profile || '';
  const historyGrid = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const ch = profile[i] || '';
    historyGrid.push({ label, ch, color: HISTORY_COLORS[ch] || 'bg-gray-200' });
  }

  return (
    <div className="space-y-6" data-testid="cb-account-detail">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/credit-builder/accounts')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-xl font-bold">{account.first_name} {account.last_name}</h1>
            <p className="text-sm text-gray-500 font-mono">{account.account_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLOR[account.account_status_code] || 'bg-amber-100 text-amber-800'}>{STATUS_LABELS[account.account_status_code]}</Badge>
          <Badge className="capitalize">{account.plan_tier}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Account Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500">Credit Limit</p><p className="text-lg font-bold text-emerald-700">${account.credit_limit?.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500">Balance</p><p className="text-lg font-bold">${account.current_balance}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500">Available</p><p className="text-lg font-bold text-blue-700">${(account.credit_limit - account.current_balance)}</p></CardContent></Card>
          </div>

          {/* Payment History Grid */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">24-Month Payment History</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1" data-testid="payment-history-grid">
                {historyGrid.map((h, i) => (
                  <div key={i} className="group relative">
                    <div className={`w-6 h-6 rounded ${h.color} cursor-pointer`} title={`${h.label}: ${h.ch || 'No data'}`} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                      {h.label}: {h.ch || '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" />30 Late</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" />60 Late</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" />90+ Late</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block" />No Data</span>
              </div>
            </CardContent>
          </Card>

          {/* Record Payment */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" />Record Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input type="number" step="0.01" placeholder="Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} data-testid="payment-amount" />
              <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={2} placeholder="Notes" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={handlePayment} data-testid="record-payment-btn">Record Payment</Button>
            </CardContent>
          </Card>

          {/* Record Purchase */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Record Purchase</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="purchase-product">
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>)}
              </select>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full" onClick={handlePurchase} data-testid="record-purchase-btn">Record Purchase</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Transactions */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Transaction History</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No transactions</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Bal: ${t.running_balance?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disputes */}
          {disputes.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Disputes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {disputes.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm capitalize">{d.dispute_source}</p>
                        <p className="text-xs text-gray-500">{d.opened_date}</p>
                      </div>
                      <Badge className={d.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>{d.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Dates */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Key Dates</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Opened:</span><span>{account.date_opened}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last Info Date:</span><span>{account.date_of_account_information}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last Payment:</span><span>{account.date_of_last_payment || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Monthly Fee:</span><span>${account.monthly_fee?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Highest Credit:</span><span>${account.highest_credit}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreditBuilderAccountDetail;
