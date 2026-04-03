import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import {
  Lock, LogOut, Users, DollarSign, CheckCircle, Clock, AlertTriangle,
  Eye, EyeOff, Shield, FileText, AlertCircle, X,
  Download, Search, Check, XCircle, Bug, ClipboardList
} from 'lucide-react';
import { MergerTaskDetail, ProgressBar } from './MergerTaskDetail';
import { BugReportModal, BugTicketList } from './BugReportModal';
import ClientFinancialDetail from './ClientFinancialDetail';
import PortfolioPL from './PortfolioPL';

const API = process.env.REACT_APP_BACKEND_URL;
const partnerHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('partner_token')}` });
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` });

const StatusBadge = ({ status }) => {
  const colors = { paid: 'bg-green-100 text-green-800', unpaid: 'bg-gray-100 text-gray-600', n_a: 'bg-gray-50 text-gray-400 italic', chargeback: 'bg-red-100 text-red-800', refund: 'bg-orange-100 text-orange-800', past_due: 'bg-orange-100 text-orange-800', ft: 'bg-teal-100 text-teal-800' };
  const labels = { paid: 'Paid', unpaid: 'Unpaid', n_a: 'N/A', chargeback: 'CB', refund: 'Refund', past_due: 'Past Due', ft: 'FT' };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[status] || 'bg-gray-100 text-gray-500'}`}>{labels[status] || status}</span>;
};
const MergerBadge = ({ status }) => {
  if (status === 'verified') return <Badge className="bg-green-100 text-green-800 text-[10px]">VERIFIED</Badge>;
  if (status === 'not_merged') return <Badge variant="destructive" className="text-[10px]">NOT MERGED</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">PENDING</Badge>;
};
const Money = ({ val, color }) => <span className={`font-mono text-sm ${val < 0 ? 'text-red-600' : color || 'text-gray-900'}`}>{val < 0 ? '-' : ''}${Math.abs(val || 0).toFixed(2)}</span>;

const DetailModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ===== CLIENT DETAIL MODAL =====
const ClientDetailModal = ({ client, partner, onClose, onUpdate, collection }) => {
  const [data, setData] = useState(client);
  const [saving, setSaving] = useState(false);
  const isMaster = partner?.role === 'master_partner';
  const isElisabeth = collection === 'elisabeth';
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];
  const updateField = (f, v) => setData(prev => ({ ...prev, [f]: v }));
  const mailField = isElisabeth ? 'mail' : 'mail_amount';

  const save = async () => {
    setSaving(true);
    try {
      const url = isElisabeth ? `${API}/api/cpr/elisabeth/${data.id}` : `${API}/api/cpr/clients/${data.id}`;
      const res = await fetch(url, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(data) });
      if (res.ok) { const u = await res.json(); setData(u); onUpdate?.(u); toast.success('Client updated'); }
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  return (
    <DetailModal title={data.full_name} onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
          <div><span className="text-xs text-gray-500">Status</span><p className="font-medium">{data.status}</p></div>
          <div><span className="text-xs text-gray-500">Category</span><p className="font-medium capitalize">{data.category?.replace(/_/g, ' ')}</p></div>
          <div><span className="text-xs text-gray-500">CR Date</span><p className="font-medium">{data.cr_date || data.cr_start_date || 'N/A'}</p></div>
          <div><span className="text-xs text-gray-500">Monthly Rate</span><p className="font-medium">${data.monthly_rev_rate || data.monthly_rate || 0}</p></div>
        </div>
        {/* Monthly Activity */}
        <div>
          <h3 className="font-semibold mb-2">Monthly Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="px-2 py-1 text-left text-xs">Month</th><th className="px-2 py-1 text-center text-xs">Rev</th><th className="px-2 py-1 text-center text-xs">CR</th></tr></thead>
              <tbody>{MONTHS.map(m => (
                <tr key={m} className="border-b">
                  <td className="px-2 py-1.5 font-medium uppercase">{m}</td>
                  <td className="px-2 py-1.5 text-center">{isMaster ? <select value={data[`${m}_rev_status`] || 'n_a'} onChange={e => updateField(`${m}_rev_status`, e.target.value)} className="text-xs border rounded px-1 py-0.5">{['paid','unpaid','n_a','chargeback','refund'].map(s => <option key={s} value={s}>{s}</option>)}</select> : <StatusBadge status={data[`${m}_rev_status`]} />}</td>
                  <td className="px-2 py-1.5 text-center">{isMaster ? <select value={data[`${m}_cr_status`] || 'n_a'} onChange={e => updateField(`${m}_cr_status`, e.target.value)} className="text-xs border rounded px-1 py-0.5">{['paid','unpaid','n_a','chargeback','refund'].map(s => <option key={s} value={s}>{s}</option>)}</select> : <StatusBadge status={data[`${m}_cr_status`]} />}</td>
                </tr>))}
              </tbody></table>
          </div>
        </div>
        {/* Mailing Costs */}
        <div>
          <h3 className="font-semibold mb-2">Mailing Costs</h3>
          <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="px-2 py-1 text-left text-xs">Month</th><th className="px-2 py-1 text-right text-xs">Amount</th><th className="px-2 py-1 text-left text-xs">Source</th></tr></thead>
            <tbody>{MONTHS.map(m => <tr key={m} className="border-b"><td className="px-2 py-1.5 uppercase font-medium">{m}</td><td className="px-2 py-1.5 text-right">${(data[`${m}_${mailField}`] || 0).toFixed(2)}</td><td className="px-2 py-1.5 text-xs italic text-gray-400">via DisputeFox</td></tr>)}</tbody>
          </table>
          {isMaster && <details className="mt-3 border rounded-lg p-3 bg-gray-50"><summary className="text-xs font-medium text-gray-500 cursor-pointer">Data Sync Settings</summary><div className="mt-2 grid grid-cols-3 gap-2">{MONTHS.map(m => <div key={m}><label className="text-[10px] text-gray-400 uppercase">{m} Sync Amount</label><Input type="number" step="0.01" className="h-7 text-xs" value={data[`${m}_${mailField}`] || 0} onChange={e => updateField(`${m}_${mailField}`, parseFloat(e.target.value) || 0)} /></div>)}</div></details>}
        </div>
        {/* Notary */}
        <div>
          <h3 className="font-semibold mb-2">Notary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
            <div><span className="text-xs text-gray-500">Date</span><p className="text-sm font-medium">{data.notary_date || data.notary_completed_date || 'N/A'}</p></div>
            <div><span className="text-xs text-gray-500">Charged</span>{isMaster ? <Input type="number" step="0.01" className="h-7 text-xs mt-0.5" value={data.notary_charged ?? data.notary_charged_to_client ?? 0} onChange={e => updateField(isElisabeth ? 'notary_charged' : 'notary_charged_to_client', parseFloat(e.target.value))} /> : <p className="text-sm font-medium">${(data.notary_charged ?? data.notary_charged_to_client ?? 0).toFixed(2)}</p>}</div>
            <div><span className="text-xs text-gray-500">Standard</span><p className="text-sm font-medium text-gray-400">$39.95</p></div>
            <div><span className="text-xs text-gray-500">Cost</span><p className="text-sm font-medium text-gray-400">$19.99</p></div>
            <div><span className="text-xs text-gray-500">Profit/Loss</span><Money val={(data.notary_charged ?? data.notary_charged_to_client ?? 0) - 19.99} color="text-green-600" /></div>
          </div>
          {(() => { const sf = Math.max(0, 39.95 - (data.notary_charged ?? data.notary_charged_to_client ?? 0)); return sf > 0 ? <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /><span className="text-sm text-red-700">Shortfall of ${sf.toFixed(2)} charged against Shar Schaffeld's earnings.</span></div> : null; })()}
        </div>
        {/* Financial Summary */}
        <div>
          <h3 className="font-semibold mb-2">Financial Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200"><h4 className="text-xs font-semibold text-green-700 mb-2">GROSS</h4><div className="space-y-1"><div className="flex justify-between text-sm"><span>Jan+Feb</span><Money val={data.jan_feb_gross} color="text-green-700" /></div><div className="flex justify-between text-sm"><span>Mar-Jun</span><Money val={data.mar_jun_gross} color="text-green-700" /></div></div></div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200"><h4 className="text-xs font-semibold text-blue-700 mb-2">NET</h4><div className="space-y-1"><div className="flex justify-between text-sm" title="Gross - 10% reserve - CR cost - notary"><span>Jan+Feb</span><Money val={data.jan_feb_net} color="text-blue-700" /></div><div className="flex justify-between text-sm" title="Gross - 10% reserve - CR cost"><span>Mar-Jun</span><Money val={data.mar_jun_net} color="text-blue-700" /></div></div></div>
          </div>
          <div className="mt-3 p-4 bg-gray-50 rounded-xl border">
            <div className="flex justify-between text-sm py-1 border-b"><span>Shar's Share</span><span className="font-bold text-green-700">${(data.shar_total || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1 border-b"><span>Joe's Share</span><span className="font-bold text-indigo-700">${(data.joe_total || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1 font-bold"><span>Grand Total</span><span>${(data.grand_total || 0).toFixed(2)}</span></div>
          </div>
        </div>
        {/* Verification */}
        <div>
          <h3 className="font-semibold mb-2">Verification</h3>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2"><span className="text-sm font-medium">Joe Verified:</span>{data.joe_verified ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-yellow-500" />}{isMaster && !data.joe_verified && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateField('joe_verified', true)}>Mark Verified</Button>}</div>
            <MergerBadge status={data.merger_status} />
          </div>
          <div className="mt-2"><label className="text-xs text-gray-500">Notes</label>{isMaster ? <textarea className="w-full border rounded-lg p-2 text-sm mt-1" rows={2} value={data.notes || ''} onChange={e => updateField('notes', e.target.value)} /> : <p className="text-sm text-gray-600 mt-1">{data.notes || 'No notes'}</p>}</div>
        </div>
        {isMaster && <div className="flex justify-end pt-2 border-t"><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button></div>}
      </div>
    </DetailModal>
  );
};

// ===== CLIENT TABLE =====
const ClientTable = ({ clients, partner, category, columns }) => {
  const [search, setSearch] = useState('');
  const filtered = clients.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><Search className="w-4 h-4 text-gray-400" /><Input placeholder="Search clients..." className="max-w-xs h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} /><span className="text-xs text-gray-400 ml-auto">{filtered.length} clients</span></div>
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm" data-testid={`${category}-table`}>
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>{columns.map((col, i) => <th key={i} className={`px-2 py-2 ${col.align || 'text-left'} whitespace-nowrap`}>{col.label}</th>)}</tr></thead>
          <tbody className="divide-y">{filtered.map(c => <tr key={c.id} className={`hover:bg-gray-50 ${c.joe_verified ? 'bg-green-50/30' : ''}`}>{columns.map((col, i) => <td key={i} className={`px-2 py-1.5 ${col.align || ''} whitespace-nowrap`}>{col.render(c)}</td>)}</tr>)}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No clients found</p>}
      </div>
    </div>
  );
};

// ===== PIN ENTRY SCREEN =====
const PinEntryScreen = ({ onLogin }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    if (lockSeconds > 0) {
      const t = setInterval(() => setLockSeconds(p => { if (p <= 1) { setLocked(false); return 0; } return p - 1; }), 1000);
      return () => clearInterval(t);
    }
  }, [lockSeconds]);

  React.useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');

    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    // Auto-submit when 6th digit entered
    if (val && idx === 5) {
      const pin = next.join('');
      if (pin.length === 6) submitPin(pin);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      const next = [...digits];
      next[idx - 1] = '';
      setDigits(next);
    }
    if (e.key === 'Enter') {
      const pin = digits.join('');
      if (pin.length === 6) submitPin(pin);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      const next = text.split('');
      setDigits(next);
      inputRefs.current[5]?.focus();
      setTimeout(() => submitPin(text), 100);
    }
  };

  const submitPin = async (pin) => {
    setLoading(true);
    setError('');
    try {
      const cmsToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!cmsToken) { setError('CMS session expired. Please refresh the page.'); setLoading(false); return; }
      const res = await fetch(`${API}/api/partners/pin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cmsToken}` },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (res.status === 423) {
        setLocked(true);
        const seconds = parseInt(data.detail?.match(/(\d+)/)?.[1] || '300');
        setLockSeconds(seconds);
        triggerShake();
        return;
      }
      if (!res.ok) {
        setError(data.detail || 'Incorrect PIN');
        triggerShake();
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 300);
        return;
      }
      sessionStorage.setItem('partner_token', data.access_token);
      sessionStorage.setItem('partner_data', JSON.stringify(data.partner));
      onLogin(data.partner);
    } catch (err) { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };
  const clearAll = () => { setDigits(['', '', '', '', '', '']); setError(''); inputRefs.current[0]?.focus(); };

  return (
    <div className="flex items-center justify-center py-16" data-testid="pin-entry-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">PartnersHub</CardTitle>
          <CardDescription className="text-sm">Credlocity Business Group LLC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-gray-600">Enter your 6-digit access PIN</p>

          {locked ? (
            <div className="text-center py-6">
              <Lock className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium">Too many attempts</p>
              <p className="text-sm text-gray-500 mt-1">Try again in <span className="font-mono font-bold text-red-600">{Math.floor(lockSeconds / 60)}:{String(lockSeconds % 60).padStart(2, '0')}</span></p>
            </div>
          ) : (
            <>
              {/* PIN Boxes */}
              <div className={`flex justify-center gap-2.5 ${shake ? 'animate-shake' : ''}`} data-testid="pin-boxes">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    autoComplete="off"
                    value={d ? '\u25CF' : ''}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^\d]/g, '');
                      handleChange(i, raw.slice(-1));
                    }}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 text-center text-2xl font-mono border-2 rounded-xl outline-none transition-all
                      ${d ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
                      focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100`}
                    disabled={loading}
                    data-testid={`pin-digit-${i}`}
                  />
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5">
                {digits.map((d, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${d ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                ))}
              </div>

              {error && <p className="text-center text-sm text-red-600 font-medium" data-testid="pin-error">{error}</p>}

              {/* Buttons */}
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={clearAll} data-testid="pin-clear">Clear</Button>
                <Button
                  size="sm"
                  disabled={digits.join('').length !== 6 || loading}
                  onClick={() => submitPin(digits.join(''))}
                  className="px-6"
                  data-testid="pin-submit"
                >
                  {loading ? 'Verifying...' : 'Enter PIN'}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-400 pt-2">Forgot your PIN? Contact the master admin</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ===== MAIN CPR MERGER TAB COMPONENT =====
const CPRMergerTab = () => {
  const [partner, setPartner] = useState(() => { const s = sessionStorage.getItem('partner_data'); return s ? JSON.parse(s) : null; });
  const [subTab, setSubTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [cprClients, setCprClients] = useState([]);
  const [elisabethClients, setElisabethClients] = useState([]);
  const [notarySummary, setNotarySummary] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('cpr');
  const [mergerOverview, setMergerOverview] = useState(null);
  const [taskClient, setTaskClient] = useState(null);
  const [showBugReport, setShowBugReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMaster = partner?.role === 'master_partner';

  const loadAll = useCallback(async () => {
    if (!partner) return;
    setLoading(true);
    try {
      const [sumR, cprR, eliR, notR, pendR, overR] = await Promise.all([
        fetch(`${API}/api/cpr-partners/summary`, { headers: partnerHeaders() }),
        fetch(`${API}/api/cpr/clients`, { headers: adminHeaders() }),
        fetch(`${API}/api/cpr/elisabeth`, { headers: adminHeaders() }),
        fetch(`${API}/api/cpr/notary-waivers/summary`, { headers: adminHeaders() }),
        fetch(`${API}/api/cpr-partners/pending-verifications`, { headers: partnerHeaders() }),
        fetch(`${API}/api/cpr/merger-overview`, { headers: partnerHeaders() }),
      ]);
      if (sumR.ok) setSummary(await sumR.json());
      if (cprR.ok) setCprClients(await cprR.json());
      if (eliR.ok) setElisabethClients(await eliR.json());
      if (notR.ok) setNotarySummary(await notR.json());
      if (pendR.ok) setPendingVerifications(await pendR.json());
      if (overR.ok) setMergerOverview(await overR.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [partner]);

  useEffect(() => {
    if (partner) {
      fetch(`${API}/api/cpr-partners/me`, { headers: partnerHeaders() })
        .then(r => { if (!r.ok) handleLogout(); else loadAll(); })
        .catch(() => handleLogout());
    }
  }, [partner]); // eslint-disable-line

  const handleLogout = () => { sessionStorage.removeItem('partner_token'); sessionStorage.removeItem('partner_data'); setPartner(null); };

  const handleVerify = async (clientId) => {
    try {
      const res = await fetch(`${API}/api/cpr-partners/verify/client/${clientId}`, { method: 'POST', headers: partnerHeaders() });
      if (res.ok) { toast.success('Client verified'); loadAll(); } else { const d = await res.json(); toast.error(d.detail || 'Failed'); }
    } catch { toast.error('Verification failed'); }
  };

  const openClient = (client, col = 'cpr') => { setSelectedClient(client); setSelectedCollection(col); };

  if (!partner) return <PinEntryScreen onLogin={setPartner} />;

  const legacy = cprClients.filter(c => c.category === 'legacy_cpr');
  const sharActive = cprClients.filter(c => c.category === 'shar_active');
  const newCred = cprClients.filter(c => c.category === 'new_credlocity');
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];

  const nameCol = (col = 'cpr') => ({ label: 'Client Name', render: c => <button className="text-indigo-600 hover:underline font-medium text-left" onClick={() => openClient(c, col)}>{c.full_name}</button> });
  const statusCol = { label: 'Status', render: c => <Badge className={c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} variant="outline">{c.status}</Badge> };
  const progressCol = { label: 'Tasks', align: 'text-center', render: c => <div className="w-24"><ProgressBar completed={c.tasks_completed_count || 0} canceled={c.canceled} /></div> };
  const verifiedCol = { label: 'Verified', align: 'text-center', render: c => c.joe_verified ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" /> : (isMaster ? <button onClick={() => handleVerify(c.id)} className="text-xs text-indigo-600 hover:underline">Verify</button> : <Clock className="w-4 h-4 text-yellow-500 mx-auto" />) };
  const mergerCol = { label: 'Merger', render: c => <MergerBadge status={c.merger_status} /> };
  const taskBtnCol = { label: '', render: c => <Button size="sm" variant="ghost" className="text-xs h-6 px-2 text-indigo-600" onClick={() => setTaskClient(c)}>Tasks</Button> };
  const revCols = MONTHS.map(m => ({ label: m.toUpperCase() + ' Rev', align: 'text-center', render: c => <StatusBadge status={c[`${m}_rev_status`]} /> }));
  const crCols = MONTHS.map(m => ({ label: m.toUpperCase() + ' CR', align: 'text-center', render: c => <StatusBadge status={c[`${m}_cr_status`]} /> }));

  return (
    <div className="space-y-4" data-testid="cpr-merger-tab">
      {/* Partner header bar */}
      <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">{partner.display_name}</span>
          <Badge variant="outline" className="text-[10px]">{partner.role === 'master_partner' ? 'Master Partner' : 'Partner'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowBugReport(true)} data-testid="report-bug-btn"><Bug className="w-3 h-3" /> Report a Bug</Button>
          <Button size="sm" variant="ghost" className="text-xs gap-1 text-indigo-700" onClick={handleLogout} data-testid="partner-logout"><LogOut className="w-3 h-3" /> Sign Out</Button>
        </div>
      </div>

      {/* Merger Overview Dashboard */}
      {mergerOverview && (
        <div className="border rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white" data-testid="merger-overview">
          <h3 className="font-bold text-sm mb-3 text-gray-800">MERGER COMPLETION STATUS</h3>
          <div className="space-y-2">
            {['legacy_cpr', 'shar_active', 'new_credlocity'].map(cat => {
              const d = mergerOverview.categories?.[cat] || { total: 0, fully_merged: 0, in_progress: 0, not_started: 0, canceled: 0 };
              const inProg = d.in_progress + (d.waiting_disputes || 0) + (d.waiting_verification || 0);
              const pct = d.total > 0 ? Math.round((d.fully_merged / d.total) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-32 capitalize">{cat.replace(/_/g, ' ')} ({d.total})</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex gap-2 text-[10px] w-56 justify-end">
                    <span className="text-green-700">{d.fully_merged} merged</span>
                    <span className="text-orange-600">{inProg} in progress</span>
                    <span className="text-gray-500">{d.canceled} canceled</span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-3 border-t pt-2 mt-2">
              <span className="text-xs font-bold w-32">TOTAL ({mergerOverview.totals?.total})</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${mergerOverview.totals?.total > 0 ? Math.round((mergerOverview.totals?.fully_merged / mergerOverview.totals?.total) * 100) : 0}%` }} />
              </div>
              <div className="flex gap-2 text-[10px] w-56 justify-end">
                <span className="text-green-700 font-bold">{mergerOverview.totals?.fully_merged} merged</span>
                <span className="text-orange-600">{(mergerOverview.totals?.in_progress || 0) + (mergerOverview.totals?.waiting_disputes || 0) + (mergerOverview.totals?.waiting_verification || 0)} in progress</span>
                <span className="text-gray-500">{mergerOverview.totals?.canceled} canceled</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Goal: Every client must be either FULLY MERGED or CANCELED</p>
        </div>
      )}

      {loading ? <div className="text-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-gray-100 rounded-xl" data-testid="merger-sub-tabs">
            {[['overview','Overview'],['portfolio','Portfolio P&L'],['tasks','Merger Tasks'],['legacy','Legacy CPR'],['shar','Shar Active'],['new','New Credlocity'],['elisabeth','CPR Elisabeth'],['notary','Notary Waivers'],['verification','Verification Queue'],['payout','Payout Summary'],['bugs','Bug Reports']].map(([v,l]) =>
              <TabsTrigger key={v} value={v} className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">{l}</TabsTrigger>
            )}
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card><CardContent className="p-3"><p className="text-[10px] text-gray-500 uppercase">Total Clients</p><p className="text-2xl font-bold">{summary.total_clients}</p></CardContent></Card>
                  <Card className="border-green-200"><CardContent className="p-3"><p className="text-[10px] text-gray-500 uppercase">Shar's Total</p><p className="text-2xl font-bold text-green-700">${(summary.shar_current_total || 0).toFixed(2)}</p></CardContent></Card>
                  <Card className="border-indigo-200"><CardContent className="p-3"><p className="text-[10px] text-gray-500 uppercase">Joe's Total</p><p className="text-2xl font-bold text-indigo-700">${(summary.joe_current_total || 0).toFixed(2)}</p></CardContent></Card>
                  <Card className="border-yellow-200"><CardContent className="p-3"><p className="text-[10px] text-gray-500 uppercase">Pending Verifications</p><p className="text-2xl font-bold text-yellow-700">{summary.pending_verifications}</p></CardContent></Card>
                </div>
              )}
              {mergerOverview && (
                <Card><CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3">Category Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="overview-table">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-center">Total</th><th className="px-3 py-2 text-center">Fully Merged</th><th className="px-3 py-2 text-center">In Progress</th><th className="px-3 py-2 text-center">Not Started</th><th className="px-3 py-2 text-center">Canceled</th></tr></thead>
                      <tbody className="divide-y">
                        {['legacy_cpr', 'shar_active', 'new_credlocity'].map(cat => {
                          const d = mergerOverview.categories?.[cat] || {};
                          return (
                            <tr key={cat} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium capitalize">{cat.replace(/_/g, ' ')}</td>
                              <td className="px-3 py-2 text-center font-bold">{d.total || 0}</td>
                              <td className="px-3 py-2 text-center text-green-700">{d.fully_merged || 0}</td>
                              <td className="px-3 py-2 text-center text-orange-600">{(d.in_progress || 0) + (d.waiting_disputes || 0) + (d.waiting_verification || 0)}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{d.not_started || 0}</td>
                              <td className="px-3 py-2 text-center text-red-600">{d.canceled || 0}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 font-bold">
                          <td className="px-3 py-2">TOTAL</td>
                          <td className="px-3 py-2 text-center">{mergerOverview.totals?.total || 0}</td>
                          <td className="px-3 py-2 text-center text-green-700">{mergerOverview.totals?.fully_merged || 0}</td>
                          <td className="px-3 py-2 text-center text-orange-600">{(mergerOverview.totals?.in_progress || 0) + (mergerOverview.totals?.waiting_disputes || 0) + (mergerOverview.totals?.waiting_verification || 0)}</td>
                          <td className="px-3 py-2 text-center text-gray-500">{mergerOverview.totals?.not_started || 0}</td>
                          <td className="px-3 py-2 text-center text-red-600">{mergerOverview.totals?.canceled || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* PORTFOLIO P&L */}
          <TabsContent value="portfolio" className="mt-4">
            <PortfolioPL />
          </TabsContent>

          {/* MERGER TASKS */}
          <TabsContent value="tasks" className="mt-4">
            <div className="space-y-3" data-testid="merger-tasks-tab">
              <h3 className="font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Merger Task Tracker</h3>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-3 py-2 text-left">Client</th><th className="px-3 py-2">Category</th><th className="px-3 py-2 text-center w-48">Progress</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Action</th></tr></thead>
                  <tbody className="divide-y">
                    {cprClients
                      .filter(c => !isMaster ? c.category === 'shar_active' : true)
                      .sort((a, b) => {
                        const aPri = a.canceled ? 99 : a.merger_status === 'fully_merged' ? 98 : (a.tasks_completed_count || 0);
                        const bPri = b.canceled ? 99 : b.merger_status === 'fully_merged' ? 98 : (b.tasks_completed_count || 0);
                        return aPri - bPri;
                      })
                      .map(c => {
                        const completed = c.tasks_completed_count || 0;
                        const statusLabel = c.merger_status === 'fully_merged' ? 'FULLY MERGED' : c.canceled ? 'CANCELED' : c.merger_status?.replace(/_/g, ' ').toUpperCase() || 'NOT STARTED';
                        const statusColor = c.merger_status === 'fully_merged' ? 'bg-green-100 text-green-800' : c.canceled ? 'bg-red-100 text-red-800' : completed === 0 ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800';
                        const overdue = !c.last_task_activity && c.merger_status !== 'fully_merged' && !c.canceled;
                        return (
                          <tr key={c.id} className={`hover:bg-gray-50 ${c.merger_status === 'fully_merged' ? 'bg-green-50/30' : c.canceled ? 'bg-gray-50 opacity-60' : ''}`}>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{c.full_name}</span>
                                {overdue && <AlertTriangle className="w-3 h-3 text-red-500" title="No activity — action required" />}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px] capitalize">{c.category?.replace(/_/g, ' ')}</Badge></td>
                            <td className="px-3 py-2"><ProgressBar completed={completed} canceled={c.canceled} /></td>
                            <td className="px-3 py-2"><Badge className={`${statusColor} text-[10px]`}>{statusLabel}</Badge></td>
                            <td className="px-3 py-2"><Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setTaskClient(c)} data-testid={`task-btn-${c.id}`}>{completed === 0 ? 'Start' : c.merger_status === 'fully_merged' ? 'View' : 'Continue'}</Button></td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* LEGACY CPR */}
          <TabsContent value="legacy" className="mt-4">
            <ClientTable clients={legacy} partner={partner} category="legacy" columns={[
              nameCol(), statusCol, progressCol,
              { label: 'CR Start', render: c => <span className="text-xs">{c.cr_start_date || 'N/A'}</span> },
              ...crCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_cr_status`] || (c.cr_monitoring_active ? 'paid' : 'n_a')} /> })),
              { label: 'CR Rev', align: 'text-right', render: c => <Money val={c.cr_revenue} color="text-green-700" /> },
              { label: 'CR Cost', align: 'text-right', render: c => <span className="text-red-500 font-mono text-sm">-${(c.cr_cost || 0).toFixed(2)}</span> },
              { label: 'Notary', align: 'text-right', render: c => <Money val={c.notary_charged_to_client} /> },
              { label: 'Mailing', align: 'text-right', render: c => <span className="text-gray-500 font-mono text-sm">${(c.total_mailing || 0).toFixed(2)}</span> },
              { label: 'Net P&L', align: 'text-right', render: c => <span className={`font-bold font-mono text-sm ${(c.net_pl || 0) >= 0 ? 'text-green-700' : 'text-red-600'}`}>${(c.net_pl || 0).toFixed(2)}</span> },
              verifiedCol, mergerCol,
            ]} />
          </TabsContent>

          {/* SHAR ACTIVE */}
          <TabsContent value="shar" className="mt-4">
            <ClientTable clients={sharActive} partner={partner} category="shar-active" columns={[
              nameCol(), statusCol, progressCol, taskBtnCol,
              { label: 'Rate', align: 'text-right', render: c => <span className="font-mono">${c.monthly_rate}</span> },
              { label: 'Rev Rate', align: 'text-right', render: c => <span className="font-mono text-gray-500">${((c.monthly_rate || 0) - 49.95).toFixed(2)}</span> },
              ...revCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_rev_status`]} /> })),
              ...crCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_cr_status`]} /> })),
              { label: 'Mailing', align: 'text-right', render: c => <span className="text-gray-500 font-mono text-sm">${(c.total_mailing || 0).toFixed(2)}</span> },
              { label: 'J+F Gross', align: 'text-right', render: c => <Money val={c.jan_feb_gross} color="text-green-700" /> },
              { label: 'J+F Net', align: 'text-right', render: c => <Money val={c.jan_feb_net} color="text-green-800" /> },
              { label: 'M-J Gross', align: 'text-right', render: c => <Money val={c.mar_jun_gross} color="text-blue-700" /> },
              { label: 'M-J Net', align: 'text-right', render: c => <Money val={c.mar_jun_net} color="text-blue-800" /> },
              { label: 'Shar', align: 'text-right', render: c => <span className="font-bold text-green-700">${(c.shar_total || 0).toFixed(2)}</span> },
              { label: 'Joe', align: 'text-right', render: c => <span className="font-bold text-indigo-700">${(c.joe_total || 0).toFixed(2)}</span> },
              { label: 'Grand', align: 'text-right', render: c => <span className="font-bold">${(c.grand_total || 0).toFixed(2)}</span> },
              verifiedCol, mergerCol,
            ]} />
          </TabsContent>

          {/* NEW CREDLOCITY */}
          <TabsContent value="new" className="mt-4">
            <ClientTable clients={newCred} partner={partner} category="new-credlocity" columns={[
              nameCol(), statusCol,
              { label: 'CR Start', render: c => <span className="text-xs">{c.cr_start_date || 'N/A'}</span> },
              { label: 'Rate', align: 'text-right', render: c => <span className="font-mono">${c.monthly_rate}</span> },
              ...revCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_rev_status`]} /> })),
              ...crCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_cr_status`]} /> })),
              { label: 'Mailing', align: 'text-right', render: c => <span className="text-gray-500 font-mono text-sm">${(c.total_mailing || 0).toFixed(2)}</span> },
              { label: 'Shar', align: 'text-right', render: c => <span className="font-bold text-green-700">${(c.shar_total || 0).toFixed(2)}</span> },
              { label: 'Joe', align: 'text-right', render: c => <span className="font-bold text-indigo-700">${(c.joe_total || 0).toFixed(2)}</span> },
              verifiedCol, mergerCol,
            ]} />
          </TabsContent>

          {/* ELISABETH */}
          <TabsContent value="elisabeth" className="mt-4">
            <ClientTable clients={elisabethClients} partner={partner} category="elisabeth" columns={[
              nameCol('elisabeth'), statusCol,
              { label: 'CR Date', render: c => <span className="text-xs">{c.cr_date || 'N/A'}</span> },
              { label: 'Rev Rate', align: 'text-right', render: c => <span className="font-mono">${c.monthly_rev_rate}</span> },
              ...revCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_rev_status`]} /> })),
              ...crCols.map((col, i) => ({ ...col, render: c => <StatusBadge status={c[`${MONTHS[i]}_cr_status`]} /> })),
              { label: 'Notary', render: c => <Money val={c.notary_charged} /> },
              { label: 'Shortfall', render: c => { const sf = c.shar_notary_shortfall || Math.max(0, 39.95 - (c.notary_charged || 0)); return sf > 0 ? <span className="text-red-600 font-medium">${sf.toFixed(2)}</span> : <span className="text-gray-400">$0.00</span>; }},
              { label: 'J+F Gross', align: 'text-right', render: c => <Money val={c.jan_feb_gross} color="text-green-700" /> },
              { label: 'J+F Net', align: 'text-right', render: c => <Money val={c.jan_feb_net} color="text-green-800" /> },
              { label: 'M-J Gross', align: 'text-right', render: c => <Money val={c.mar_jun_gross} color="text-blue-700" /> },
              { label: 'M-J Net', align: 'text-right', render: c => <Money val={c.mar_jun_net} color="text-blue-800" /> },
              { label: 'Shar', align: 'text-right', render: c => <span className="font-bold text-green-700">${(c.shar_total || 0).toFixed(2)}</span> },
              { label: 'Joe', align: 'text-right', render: c => <span className="font-bold text-indigo-700">${(c.joe_total || 0).toFixed(2)}</span> },
              verifiedCol, mergerCol,
            ]} />
          </TabsContent>

          {/* NOTARY WAIVERS */}
          <TabsContent value="notary" className="mt-4">
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /><div><h3 className="font-bold text-red-800 text-sm">NOTARY WAIVER & DISCOUNT TRACKER</h3><p className="text-xs text-red-700">Any waiver or discount below $39.95 is charged against Shar's earnings.</p></div></div>
              {notarySummary && <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[['Total Orders', notarySummary.total_orders, ''], ['Total Collected', `$${notarySummary.total_collected}`, 'text-green-700'], ['Expected', `$${notarySummary.expected_standard}`, ''], ['Total Shortfall', `$${notarySummary.total_shortfall}`, 'text-red-600'], ['Fully Waived', notarySummary.fully_waived_count, 'text-red-600'], ['Discounted', notarySummary.discounted_count, 'text-orange-600'], ['Net Profit', `$${notarySummary.net_notary_profit}`, '']].map(([l,v,c]) =>
                    <Card key={l}><CardContent className="p-2.5"><p className="text-[9px] text-gray-500 uppercase">{l}</p><p className={`text-lg font-bold ${c}`}>{v}</p></CardContent></Card>
                  )}
                </div>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-sm" data-testid="notary-waivers-table">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Client</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">Standard</th><th className="px-3 py-2 text-right">Charged</th><th className="px-3 py-2 text-right">Shortfall</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Against</th></tr></thead>
                    <tbody className="divide-y">{(notarySummary.waivers || []).map((w, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{w.client_name}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] capitalize">{w.category?.replace(/_/g, ' ')}</Badge></td>
                        <td className="px-3 py-2 text-right text-gray-400">$39.95</td>
                        <td className="px-3 py-2 text-right">${w.charged?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{w.shortfall > 0 ? <span className="text-red-600 font-medium">${w.shortfall.toFixed(2)}</span> : '$0.00'}</td>
                        <td className="px-3 py-2 text-center">{w.waived_fully ? <Badge variant="destructive" className="text-[10px]">Waived</Badge> : w.discounted ? <Badge className="bg-orange-100 text-orange-800 text-[10px]">Discounted</Badge> : <Badge className="bg-green-100 text-green-800 text-[10px]">Full</Badge>}</td>
                        <td className="px-3 py-2 text-xs">{w.date || 'N/A'}</td>
                        <td className="px-3 py-2">{w.charged_against_shar ? <span className="text-red-600 font-medium">Shar</span> : 'N/A'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </>}
            </div>
          </TabsContent>

          {/* VERIFICATION QUEUE */}
          <TabsContent value="verification" className="mt-4">
            <div className="space-y-3" data-testid="verification-queue">
              <h3 className="font-semibold">Verification Queue ({pendingVerifications.filter(c => !c.joe_verified).length} pending)</h3>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Client</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Merger</th><th className="px-3 py-2">CR Summary</th><th className="px-3 py-2">Notary</th>{isMaster && <th className="px-3 py-2">Action</th>}</tr></thead>
                  <tbody className="divide-y">{pendingVerifications.filter(c => !c.joe_verified).map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{c.full_name}</td>
                      <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px] capitalize">{c.category?.replace(/_/g, ' ')}</Badge></td>
                      <td className="px-3 py-2 text-center"><MergerBadge status={c.merger_status} /></td>
                      <td className="px-3 py-2"><div className="flex gap-0.5 justify-center">{MONTHS.map(m => <StatusBadge key={m} status={c[`${m}_cr_status`] || (c.cr_monitoring_active ? 'paid' : 'n_a')} />)}</div></td>
                      <td className="px-3 py-2 text-center">{c.notary_completed || c.notary_date ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-400 text-xs">N/A</span>}</td>
                      {isMaster && <td className="px-3 py-2 text-center"><Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleVerify(c.id)}><Check className="w-3 h-3" /> Verify</Button></td>}
                    </tr>
                  ))}</tbody>
                </table>
                {pendingVerifications.filter(c => !c.joe_verified).length === 0 && <div className="text-center py-8"><CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" /><p className="text-gray-500">All clients verified!</p></div>}
              </div>
            </div>
          </TabsContent>

          {/* PAYOUT SUMMARY */}
          <TabsContent value="payout" className="mt-4">
            {summary && <div className="space-y-5" data-testid="payout-summary">
              <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-base text-green-800">What Joey Owes Shar</CardTitle></CardHeader><CardContent>
                <p className="text-3xl font-bold text-green-700 mb-3">${(summary.shar_current_total || 0).toFixed(2)}</p>
                <table className="w-full text-sm"><thead className="bg-green-50 text-xs uppercase text-green-700"><tr><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">Shar's Total</th><th className="px-3 py-2 text-right">Clients</th></tr></thead>
                  <tbody className="divide-y">{Object.entries(summary.by_category || {}).map(([cat, d]) => <tr key={cat}><td className="px-3 py-2 capitalize font-medium">{cat.replace(/_/g, ' ')}</td><td className="px-3 py-2 text-right font-mono text-green-700">${(d.shar_total || 0).toFixed(2)}</td><td className="px-3 py-2 text-right">{d.count}</td></tr>)}<tr className="bg-green-50 font-bold"><td className="px-3 py-2">TOTAL</td><td className="px-3 py-2 text-right text-green-800">${(summary.shar_current_total || 0).toFixed(2)}</td><td className="px-3 py-2 text-right">{summary.total_clients}</td></tr></tbody>
                </table>
              </CardContent></Card>

              <Card className="border-indigo-200"><CardHeader className="pb-2"><CardTitle className="text-base text-indigo-800">What Joey Keeps</CardTitle></CardHeader><CardContent>
                <p className="text-3xl font-bold text-indigo-700 mb-3">${(summary.joe_current_total || 0).toFixed(2)}</p>
                <table className="w-full text-sm"><thead className="bg-indigo-50 text-xs uppercase text-indigo-700"><tr><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">Joe's Total</th></tr></thead>
                  <tbody className="divide-y">{Object.entries(summary.by_category || {}).map(([cat, d]) => <tr key={cat}><td className="px-3 py-2 capitalize font-medium">{cat.replace(/_/g, ' ')}</td><td className="px-3 py-2 text-right font-mono text-indigo-700">${(d.joe_total || 0).toFixed(2)}</td></tr>)}</tbody>
                </table>
              </CardContent></Card>

              <Card className="bg-gray-50"><CardContent className="p-4"><p className="text-sm text-gray-700"><strong>Auth.net Fee Deduction:</strong> The $35.00/month Authorize.net processing fee is deducted at the portfolio level and is not reflected in per-client calculations.</p></CardContent></Card>

              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Payment History</CardTitle></CardHeader><CardContent>
                {summary.payouts?.length > 0 ? <div className="space-y-2">{summary.payouts.map((p, i) => <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium text-sm">{p.payment_date}</p><p className="text-xs text-gray-500">{p.notes || p.month}</p></div><span className="font-mono font-bold text-green-700">${(p.actual_paid || 0).toFixed(2)}</span></div>)}
                  <div className="flex justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200 font-bold text-sm"><span>Outstanding Balance</span><span className={summary.outstanding_balance > 0 ? 'text-red-600' : 'text-green-600'}>${(summary.outstanding_balance || 0).toFixed(2)}</span></div>
                </div> : <p className="text-gray-400 text-center py-4 text-sm">No payments recorded yet</p>}
              </CardContent></Card>

              <div className="flex justify-end">
                <Button variant="outline" className="gap-2" onClick={async () => {
                  try {
                    const res = await fetch(`${API}/api/cpr-partners/payout-pdf`, { headers: partnerHeaders() });
                    if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `payout-summary-${new Date().toISOString().slice(0,10)}.pdf`; a.click(); URL.revokeObjectURL(url); toast.success('PDF exported'); }
                    else toast.error('Failed to generate PDF');
                  } catch { toast.error('Export failed'); }
                }} data-testid="export-payout"><Download className="w-4 h-4" /> Export Payout Summary as PDF</Button>
              </div>
            </div>}
          </TabsContent>

          {/* BUG REPORTS TAB */}
          <TabsContent value="bugs" className="mt-4">
            <BugTicketList isMaster={isMaster} />
          </TabsContent>
        </Tabs>
      )}

      {selectedClient && <ClientFinancialDetail client={selectedClient} partner={partner} collection={selectedCollection} onClose={() => setSelectedClient(null)} onUpdate={() => loadAll()} />}
      {taskClient && <MergerTaskDetail client={taskClient} partner={partner} onClose={() => setTaskClient(null)} onUpdate={(updated) => { setTaskClient(updated); loadAll(); }} />}
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} onSubmitted={() => loadAll()} />}
    </div>
  );
};

export default CPRMergerTab;
