import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { X, AlertTriangle, CheckCircle, Clock, Save, Ban, Shield, Radio } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` });
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];
const MONTH_LABELS = { jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June' };
const CR_STATUSES = ['paid', 'unpaid', 'past_due', 'refund', 'chargeback', 'n_a'];
const REV_STATUSES = ['paid', 'unpaid', 'ft', 'past_due', 'refund', 'chargeback', 'n_a'];
const CLIENT_STATUSES = ['active', 'active_fully_paid', 'canceled', 'action_needed', 'past_due', 'on_hold', 'pending'];

const statusColor = (s) => {
  const c = { paid: 'bg-green-100 text-green-800 border-green-300', unpaid: 'bg-gray-100 text-gray-600 border-gray-300',
    past_due: 'bg-orange-100 text-orange-800 border-orange-300', refund: 'bg-red-100 text-red-800 border-red-300',
    chargeback: 'bg-red-100 text-red-800 border-red-300', n_a: 'bg-gray-50 text-gray-400 border-gray-200',
    ft: 'bg-teal-100 text-teal-800 border-teal-300' };
  return c[s] || c.n_a;
};
const statusLabel = (s) => ({ paid: 'Paid', unpaid: 'Unpaid', past_due: 'Past Due', refund: 'Refund', chargeback: 'Chargeback', n_a: 'N/A', ft: 'Free Trial' }[s] || s);
const Money = ({ val, color, bold }) => {
  const v = parseFloat(val) || 0;
  return <span className={`font-mono text-sm ${v < 0 ? 'text-red-600' : color || 'text-gray-900'} ${bold ? 'font-bold' : ''}`}>{v < 0 ? '-' : ''}${Math.abs(v).toFixed(2)}</span>;
};

const crRev = (s) => s === 'paid' ? 49.95 : ['refund', 'chargeback'].includes(s) ? -49.95 : 0;
const crCost = (s) => s === 'paid' ? 16.00 : 0;
const revAmt = (s, rate) => s === 'paid' ? rate : ['refund', 'chargeback'].includes(s) ? -rate : 0;

const ClientFinancialDetail = ({ client, partner, onClose, onUpdate, collection }) => {
  const [data, setData] = useState(client);
  const [saving, setSaving] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showMerge, setShowMerge] = useState(false);
  const [mergeText, setMergeText] = useState('');

  const isMaster = partner?.role === 'master_partner';
  const cat = data.category;
  const isLegacy = cat === 'legacy_cpr';
  const isSharActive = cat === 'shar_active';
  const isNC = cat === 'new_credlocity';
  const isElisabeth = collection === 'elisabeth';
  const mailField = isElisabeth ? 'mail' : (isLegacy ? 'mail' : 'mail_amount');

  const revRate = parseFloat(data.rev_rate || 0) || (parseFloat(data.monthly_rate || 0) - 49.95);
  const isCanceled = data.canceled || data.status === 'canceled';
  const isFullyMerged = data.merger_status === 'fully_merged';

  const updateField = (f, v) => setData(prev => ({ ...prev, [f]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const url = isElisabeth ? `${API}/api/cpr/elisabeth/${data.id}` : `${API}/api/cpr/clients/${data.id}`;
      const res = await fetch(url, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(data) });
      if (res.ok) { const u = await res.json(); setData(u); onUpdate?.(u); toast.success('Client updated & recalculated'); }
      else { const e = await res.json().catch(() => ({})); toast.error(e.detail || 'Save failed'); }
    } catch { toast.error('Connection error'); }
    setSaving(false);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Cancellation reason is required'); return; }
    const updates = { status: 'canceled', canceled: true, canceled_date: new Date().toISOString(), canceled_by: partner?.display_name || 'admin', cancellation_reason: cancelReason, merger_status: 'canceled' };
    setData(prev => ({ ...prev, ...updates }));
    setShowCancel(false);
    setCancelReason('');
    toast.info('Client marked as canceled. Click Save to confirm.');
  };

  const handleMerge = () => {
    if (mergeText !== 'MERGED') { toast.error('Type MERGED to confirm'); return; }
    setData(prev => ({ ...prev, merger_status: 'fully_merged', merged_date: new Date().toISOString(), merged_by: partner?.display_name }));
    setShowMerge(false);
    setMergeText('');
    toast.info('Client marked as Fully Merged. Click Save to confirm.');
  };

  const handleReopen = () => {
    setData(prev => ({ ...prev, status: 'active', canceled: false, merger_status: 'pending' }));
    toast.info('Client reopened. Click Save to confirm.');
  };

  // Per-month financial data
  const months = MONTHS.map(m => {
    const crS = data[`${m}_cr_status`] || 'n_a';
    const revS = data[`${m}_rev_status`] || 'n_a';
    const mail = parseFloat(data[`${m}_mail`] || data[`${m}_mail_amount`] || 0);
    return { m, crS, revS, crR: crRev(crS), crC: crCost(crS), revA: revAmt(revS, revRate), mail };
  });

  const totCrRev = months.reduce((s, x) => s + x.crR, 0);
  const totCrCost = months.reduce((s, x) => s + x.crC, 0);
  const totRevAmt = months.reduce((s, x) => s + x.revA, 0);
  const totMail = months.reduce((s, x) => s + x.mail, 0);

  const notaryCharged = parseFloat(data.notary_charged_to_client ?? data.notary_charged ?? 0);
  const hasNotary = !!(data.notary_date || data.notary_completed_date || data.notary_completed);
  const notaryCostVal = hasNotary ? 19.99 : 0;
  const notaryPL = hasNotary ? +(notaryCharged - notaryCostVal).toFixed(2) : 0;
  const notaryShortfall = hasNotary ? +Math.max(0, 39.95 - notaryCharged).toFixed(2) : 0;

  // Warnings
  const isJoseCampos = data.full_name === 'Jose Campos' && (data.monthly_rate === 0 || data.monthly_rate === '0');
  const isNancyVargas = data.full_name === 'Nancy Vargas';
  const isJessicaMDH = data.full_name === 'Jessica McDonough Hills' && !data.notary_date && !data.notary_completed_date;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose} data-testid="client-financial-detail">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900" data-testid="detail-client-name">{data.full_name}</h2>
            <Badge variant="outline" className="capitalize text-[10px]">{cat?.replace(/_/g, ' ')}</Badge>
            {isCanceled && <Badge className="bg-red-100 text-red-800 text-[10px]">CANCELED</Badge>}
            {isFullyMerged && <Badge className="bg-green-100 text-green-800 text-[10px]">FULLY MERGED</Badge>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* WARNINGS */}
          {isJoseCampos && <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /><span className="text-sm text-orange-800 font-medium">Rate is $0 - verify this client's billing status</span></div>}
          {isNancyVargas && <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-sm text-yellow-800">Duplicate name - confirm if same client as {isLegacy ? 'New Credlocity' : 'Legacy CPR'} record</span></div>}
          {isJessicaMDH && <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-sm text-yellow-800">Notary date missing - Notary Paid but Not Completed. Update when confirmed.</span></div>}

          {/* SECTION 1: CLIENT INFO */}
          <div className="p-4 bg-gray-50 rounded-xl" data-testid="client-info-section">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Client Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Status</span>
                <select value={data.status} onChange={e => updateField('status', e.target.value)} className="block w-full text-sm border rounded px-2 py-1 mt-0.5" data-testid="status-select">
                  {CLIENT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div><span className="text-[10px] text-gray-400 uppercase">CR Start Date</span><p className="text-sm font-medium mt-0.5">{data.cr_start_date || data.cr_date || 'N/A'}</p></div>
              {(isSharActive || isNC) && (
                <>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Monthly Rate</span>
                    {isMaster ? <Input type="number" step="1" className="h-7 text-sm mt-0.5" value={data.monthly_rate || 0} onChange={e => { const r = parseFloat(e.target.value) || 0; updateField('monthly_rate', r); updateField('rev_rate', r - 49.95); }} data-testid="monthly-rate-input" /> : <p className="text-sm font-medium mt-0.5">${data.monthly_rate || 0}</p>}
                  </div>
                  <div><span className="text-[10px] text-gray-400 uppercase">Rev Rate</span><p className="text-sm font-medium mt-0.5 text-indigo-700">${revRate.toFixed(2)}</p></div>
                </>
              )}
              <div><span className="text-[10px] text-gray-400 uppercase">CR Fee</span><p className="text-sm font-medium mt-0.5">$49.95/mo</p></div>
              {isNC && <div><span className="text-[10px] text-gray-400 uppercase">Account Type</span><p className="text-sm font-medium mt-0.5">{data.account_type || 'Regular'}</p></div>}
            </div>
          </div>

          {/* SECTION 2: MONTHLY CR/REV STATUS */}
          <div data-testid="monthly-status-section">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Monthly Payment Status (Jan-Jun)</h3>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Month</th>
                    {(!isLegacy) && <th className="px-3 py-2 text-center text-xs text-gray-500">Rev Status</th>}
                    {(!isLegacy) && <th className="px-3 py-2 text-right text-xs text-gray-500">Rev $</th>}
                    <th className="px-3 py-2 text-center text-xs text-gray-500">CR Status</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500">CR Revenue</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500">CR Cost</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500">Mailing</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {months.map(({ m, crS, revS, crR, crC, revA, mail }) => (
                    <tr key={m} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium uppercase text-xs">{MONTH_LABELS[m]}</td>
                      {(!isLegacy) && (
                        <td className="px-3 py-2 text-center">
                          <select value={revS} onChange={e => updateField(`${m}_rev_status`, e.target.value)}
                            className={`text-xs border rounded px-2 py-1 ${statusColor(revS)}`} data-testid={`${m}-rev-select`}>
                            {(isNC ? REV_STATUSES : CR_STATUSES).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                          </select>
                        </td>
                      )}
                      {(!isLegacy) && <td className="px-3 py-2 text-right"><Money val={revA} color="text-indigo-700" /></td>}
                      <td className="px-3 py-2 text-center">
                        <select value={crS} onChange={e => updateField(`${m}_cr_status`, e.target.value)}
                          className={`text-xs border rounded px-2 py-1 ${statusColor(crS)}`} data-testid={`${m}-cr-select`}>
                          {CR_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right"><Money val={crR} /></td>
                      <td className="px-3 py-2 text-right"><span className="text-xs text-gray-400">{crC > 0 ? `-$${crC.toFixed(2)}` : '-'}</span></td>
                      <td className="px-3 py-2 text-right"><span className="text-xs text-gray-500">{mail > 0 ? `$${mail.toFixed(2)}` : '-'}</span></td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-3 py-2 text-xs">TOTAL</td>
                    {(!isLegacy) && <td></td>}
                    {(!isLegacy) && <td className="px-3 py-2 text-right"><Money val={totRevAmt} color="text-indigo-700" bold /></td>}
                    <td></td>
                    <td className="px-3 py-2 text-right"><Money val={totCrRev} bold /></td>
                    <td className="px-3 py-2 text-right"><span className="text-xs text-red-500 font-bold">-${totCrCost.toFixed(2)}</span></td>
                    <td className="px-3 py-2 text-right"><span className="text-xs text-red-500 font-bold">${totMail.toFixed(2)}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">CR Cost to Us: $16.00 per paid month x {months.filter(x => x.crS === 'paid').length} paid = ${totCrCost.toFixed(2)}</p>
          </div>

          {/* SECTION 3: MAILING COSTS */}
          <div data-testid="mailing-section">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Mailing Costs (Jan-Jun)</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs text-gray-500">Month</th><th className="px-3 py-2 text-right text-xs text-gray-500">Amount</th><th className="px-3 py-2 text-left text-xs text-gray-500">Source</th></tr></thead>
                <tbody className="divide-y">
                  {months.map(({ m, mail }) => {
                    const fieldKey = `${m}_mail`;
                    const altKey = `${m}_mail_amount`;
                    return (
                      <tr key={m} className="hover:bg-gray-50">
                        <td className="px-3 py-2 uppercase font-medium text-xs">{MONTH_LABELS[m]}</td>
                        <td className="px-3 py-2 text-right">
                          {isMaster ? (
                            <Input type="number" step="0.01" min="0" className="h-7 text-xs w-24 ml-auto text-right" data-testid={`${m}-mail-input`}
                              value={data[fieldKey] ?? data[altKey] ?? 0}
                              onChange={e => { const v = parseFloat(e.target.value) || 0; updateField(fieldKey, v); updateField(altKey, v); }} />
                          ) : <Money val={mail} />}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-400 italic flex items-center gap-1">
                          {isMaster ? <span className="text-indigo-600 not-italic font-medium">Editable</span> : <><Radio className="w-3 h-3" /> via DisputeFox</>}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-3 py-2 text-xs">TOTAL MAILING</td>
                    <td className="px-3 py-2 text-right"><Money val={isMaster ? MONTHS.reduce((s, m) => s + (parseFloat(data[`${m}_mail`] ?? data[`${m}_mail_amount`] ?? 0)), 0) : totMail} bold /></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!isMaster && <p className="text-[10px] text-gray-400 mt-1 italic">This data is sourced from DisputeFox API MailFox Feature and is not editable. Submit a bug ticket if you believe an amount is incorrect.</p>}
            {isMaster && <p className="text-[10px] text-indigo-500 mt-1">Edit mailing costs directly above. Changes recalculate all financials on save.</p>}
          </div>

          {/* SECTION 4: NOTARY */}
          <div data-testid="notary-section">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">E-Notary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Notary Date</span>
                <Input type="date" className="h-7 text-xs mt-0.5" value={data.notary_date || data.notary_completed_date || ''} onChange={e => updateField('notary_date', e.target.value)} data-testid="notary-date-input" />
              </div>
              <div><span className="text-[10px] text-gray-400 uppercase">Standard Charge</span><p className="text-sm font-medium mt-1 text-gray-400">$39.95</p></div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Amount Charged</span>
                {isMaster ? (
                  <Input type="number" step="0.01" className="h-7 text-xs mt-0.5" value={notaryCharged}
                    onChange={e => updateField(isElisabeth ? 'notary_charged' : 'notary_charged_to_client', parseFloat(e.target.value) || 0)} data-testid="notary-charged-input" />
                ) : <p className="text-sm font-medium mt-1">${notaryCharged.toFixed(2)}</p>}
              </div>
              <div><span className="text-[10px] text-gray-400 uppercase">Our Cost</span><p className="text-sm font-medium mt-1 text-gray-400">${notaryCostVal.toFixed(2)}</p></div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Profit/Loss</span>
                <p className={`text-sm font-bold mt-1 ${notaryPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{notaryPL < 0 ? '-' : ''}${Math.abs(notaryPL).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Shortfall</span>
                <p className={`text-sm font-bold mt-1 ${notaryShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {notaryShortfall > 0 && <AlertTriangle className="w-3 h-3 inline mr-1" />}${notaryShortfall.toFixed(2)}
                </p>
              </div>
            </div>
            {notaryShortfall > 0 && (isSharActive || isElisabeth) && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />${notaryShortfall.toFixed(2)} charged against Shar's earnings
              </div>
            )}
          </div>

          {/* SECTION 5: FINANCIAL SUMMARY */}
          {isLegacy && (
            <div data-testid="legacy-pl-section">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">P&L Summary</h3>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">CR Revenue this client</td><td className="px-4 py-2.5 text-right"><Money val={data.cr_revenue ?? totCrRev} color="text-green-700" /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">CR Cost to Us</td><td className="px-4 py-2.5 text-right text-red-600 font-mono text-sm">-${(data.cr_cost ?? totCrCost).toFixed(2)}</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-medium">CR Profit</td><td className="px-4 py-2.5 text-right"><Money val={data.cr_profit ?? (totCrRev - totCrCost)} color="text-green-700" bold /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">Notary Revenue</td><td className="px-4 py-2.5 text-right"><Money val={notaryCharged} /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">Notary Cost to Us</td><td className="px-4 py-2.5 text-right text-red-600 font-mono text-sm">{hasNotary ? `-$${notaryCostVal.toFixed(2)}` : '-'}</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-medium">Notary Profit/Loss</td><td className="px-4 py-2.5 text-right"><Money val={notaryPL} color={notaryPL >= 0 ? 'text-green-700' : 'text-red-600'} bold /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">Mailing Cost</td><td className="px-4 py-2.5 text-right text-red-600 font-mono text-sm">-${(data.total_mailing ?? totMail).toFixed(2)}</td></tr>
                    <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                      <td className="px-4 py-3 font-bold text-base">Net P&L this client</td>
                      <td className="px-4 py-3 text-right"><Money val={data.net_pl ?? ((totCrRev - totCrCost) + notaryPL - totMail)} color={((data.net_pl ?? 0) >= 0) ? 'text-green-700' : 'text-red-600'} bold /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">Note: Auth.net $35/month fee deducted at portfolio level - not in per-client totals</p>
            </div>
          )}

          {(isSharActive || isElisabeth) && (
            <div data-testid="shar-financial-section">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GROSS */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="text-xs font-semibold text-green-700 mb-3">GROSS (Before Deductions)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Jan+Feb Gross</span><Money val={data.jan_feb_gross} color="text-green-700" /></div>
                    <p className="text-[10px] text-gray-500 pl-2">Rev ${months.slice(0,2).reduce((s,x)=>s+x.revA,0).toFixed(2)} + CR ${months.slice(0,2).reduce((s,x)=>s+x.crR,0).toFixed(2)} - Mail ${months.slice(0,2).reduce((s,x)=>s+x.mail,0).toFixed(2)}</p>
                    <div className="flex justify-between text-sm border-t pt-2"><span>Mar-Jun Gross</span><Money val={data.mar_jun_gross} color="text-green-700" /></div>
                    <p className="text-[10px] text-gray-500 pl-2">Rev ${months.slice(2).reduce((s,x)=>s+x.revA,0).toFixed(2)} + CR ${months.slice(2).reduce((s,x)=>s+x.crR,0).toFixed(2)} - Mail ${months.slice(2).reduce((s,x)=>s+x.mail,0).toFixed(2)}</p>
                  </div>
                </div>
                {/* NET */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-700 mb-3">NET (After Deductions)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Jan+Feb Net</span><Money val={data.jan_feb_net} color="text-blue-700" /></div>
                    <p className="text-[10px] text-gray-500 pl-2">-10% reserve -CR cost -Notary cost</p>
                    <p className="text-[10px] text-green-700 pl-2 font-medium">100% to Shar</p>
                    <div className="flex justify-between text-sm border-t pt-2"><span>Mar-Jun Net</span><Money val={data.mar_jun_net} color="text-blue-700" /></div>
                    <p className="text-[10px] text-gray-500 pl-2">-10% reserve -CR cost</p>
                    <p className="text-[10px] pl-2"><span className="text-indigo-700 font-medium">Joe 50%: ${(data.joe_total || 0).toFixed(2)}</span> | <span className="text-green-700 font-medium">Shar 50%: ${((data.mar_jun_net || 0) * 0.5).toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
              {/* Split summary */}
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border">
                <div className="flex justify-between text-sm py-1.5 border-b"><span className="font-medium">Shar's Total</span><span className="font-bold text-green-700 text-base">${(data.shar_total || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm py-1.5 border-b"><span className="font-medium">Joe's Total</span><span className="font-bold text-indigo-700 text-base">${(data.joe_total || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm py-1.5 font-bold"><span className="text-base">Grand Total</span><span className="text-base">${(data.grand_total || 0).toFixed(2)}</span></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">Note: Auth.net $35/month fee deducted at portfolio level - not in per-client totals</p>
            </div>
          )}

          {isNC && (
            <div data-testid="nc-pl-section">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">P&L Summary (50/50 Split from Day One)</h3>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">Rev Revenue</td><td className="px-4 py-2.5 text-right"><Money val={data.rev_revenue ?? totRevAmt} color="text-indigo-700" /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">CR Revenue</td><td className="px-4 py-2.5 text-right"><Money val={data.cr_revenue ?? totCrRev} color="text-green-700" /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">CR Cost to Us</td><td className="px-4 py-2.5 text-right text-red-600 font-mono text-sm">-${(data.cr_cost ?? totCrCost).toFixed(2)}</td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">Notary Profit/Loss</td><td className="px-4 py-2.5 text-right"><Money val={notaryPL} color={notaryPL >= 0 ? 'text-green-700' : 'text-red-600'} /></td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">Mailing Cost</td><td className="px-4 py-2.5 text-right text-red-600 font-mono text-sm">-${(data.total_mailing ?? totMail).toFixed(2)}</td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5">10% Reserve</td><td className="px-4 py-2.5 text-right text-red-600 font-mono text-sm">-${((data.total_gross || 0) * 0.1).toFixed(2)}</td></tr>
                    <tr className="bg-gray-50 border-t"><td className="px-4 py-2.5 font-bold">Total Net</td><td className="px-4 py-2.5 text-right"><Money val={data.total_net ?? data.grand_total} bold /></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border">
                <div className="flex justify-between text-sm py-1.5 border-b"><span className="font-medium">Shar's Share (50%)</span><span className="font-bold text-green-700 text-base">${(data.shar_total || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm py-1.5 border-b"><span className="font-medium">Joe's Share (50%)</span><span className="font-bold text-indigo-700 text-base">${(data.joe_total || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm py-1.5 font-bold"><span className="text-base">Grand Total</span><span className="text-base">${(data.grand_total || 0).toFixed(2)}</span></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">Note: Auth.net $35/month fee deducted at portfolio level - not in per-client totals</p>
            </div>
          )}

          {/* SECTION 6: VERIFICATION & ACTIONS */}
          <div data-testid="verification-section">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Verification & Status</h3>
            <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Joe Verified:</span>
                {data.joe_verified ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-yellow-500" />}
                {isMaster && !data.joe_verified && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateField('joe_verified', true)} data-testid="verify-btn">Mark Verified</Button>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Merger:</span>
                <Badge className={data.merger_status === 'fully_merged' ? 'bg-green-100 text-green-800' : data.merger_status === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {(data.merger_status || 'pending').replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-3">
              <label className="text-[10px] text-gray-400 uppercase">Client Notes</label>
              <textarea className="w-full border rounded-lg p-2 text-sm mt-1" rows={2} value={data.notes || ''}
                onChange={e => updateField('notes', e.target.value)} data-testid="notes-textarea" />
            </div>

            {/* Cancellation info */}
            {isCanceled && data.cancellation_reason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700"><strong>Canceled by:</strong> {data.canceled_by} on {data.canceled_date ? new Date(data.canceled_date).toLocaleDateString() : 'N/A'}</p>
                <p className="text-xs text-red-700 mt-1"><strong>Reason:</strong> {data.cancellation_reason}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {!isCanceled && (
                <Button variant="destructive" size="sm" className="text-xs gap-1" onClick={() => setShowCancel(true)} data-testid="cancel-client-btn">
                  <Ban className="w-3 h-3" /> Cancel Client
                </Button>
              )}
              {isCanceled && isMaster && (
                <Button variant="outline" size="sm" className="text-xs gap-1 text-green-700 border-green-300" onClick={handleReopen} data-testid="reopen-client-btn">
                  <CheckCircle className="w-3 h-3" /> Reopen Client
                </Button>
              )}
              {isMaster && !isFullyMerged && !isCanceled && (
                <Button variant="outline" size="sm" className="text-xs gap-1 text-green-700 border-green-300" onClick={() => setShowMerge(true)} data-testid="merge-client-btn">
                  <Shield className="w-3 h-3" /> Mark as Fully Merged
                </Button>
              )}
            </div>
          </div>

          {/* CANCEL MODAL */}
          {showCancel && (
            <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4" data-testid="cancel-modal">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                <h3 className="font-bold text-lg mb-2">Cancel {data.full_name}?</h3>
                <p className="text-sm text-gray-600 mb-4">This will mark the client as canceled. You can provide a reason below.</p>
                <label className="text-xs text-gray-500">Cancellation Reason (required)</label>
                <textarea className="w-full border rounded-lg p-2 text-sm mt-1" rows={3} value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)} placeholder="Enter reason for cancellation..." data-testid="cancel-reason-input" />
                <div className="flex gap-2 mt-4 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setShowCancel(false); setCancelReason(''); }}>Cancel this action</Button>
                  <Button variant="destructive" size="sm" onClick={handleCancel} data-testid="confirm-cancel-btn">Confirm Cancellation</Button>
                </div>
              </div>
            </div>
          )}

          {/* MERGE MODAL */}
          {showMerge && (
            <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4" data-testid="merge-modal">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                <h3 className="font-bold text-lg mb-2">Mark as Fully Merged</h3>
                <p className="text-sm text-gray-600 mb-2">Manually marking as merged bypasses task verification.</p>
                <p className="text-sm text-orange-700 mb-4 font-medium">Are you sure all documents have been collected and disputes sent?</p>
                <label className="text-xs text-gray-500">Type MERGED to confirm</label>
                <Input className="mt-1" value={mergeText} onChange={e => setMergeText(e.target.value)} placeholder="MERGED" data-testid="merge-confirm-input" />
                <div className="flex gap-2 mt-4 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setShowMerge(false); setMergeText(''); }}>Cancel</Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleMerge} data-testid="confirm-merge-btn">Confirm Merge</Button>
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={save} disabled={saving} className="gap-2" data-testid="save-client-btn">
              <Save className="w-4 h-4" />
              {saving ? 'Saving & Recalculating...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientFinancialDetail;
