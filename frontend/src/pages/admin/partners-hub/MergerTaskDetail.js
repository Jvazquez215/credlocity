import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { toast } from 'sonner';
import {
  CheckCircle, Circle, Lock, Upload, FileText, AlertTriangle,
  X, Calendar, DollarSign, Shield, ChevronDown, ChevronUp
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const partnerH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('partner_token')}` });

const TASKS = [
  { key: 'id_uploaded', label: 'ID Uploaded', desc: 'Government-issued photo ID', type: 'file', who: 'shar' },
  { key: 'ssn_uploaded', label: 'Social Security Card', desc: 'Social Security card upload', type: 'file', who: 'shar' },
  { key: 'proof_of_address_uploaded', label: 'Proof of Address', desc: 'Utility bill, lease, or bank statement (within 90 days)', type: 'file', who: 'shar' },
  { key: 'scorefusion_ordered', label: 'Credit Report Ordered', desc: '3-bureau credit report via ScoreFusion', type: 'form', who: 'shar' },
  { key: 'notary_invoice_sent', label: 'E-Notary Invoice Sent', desc: 'Client invoiced for E-Notary service', type: 'invoice', who: 'shar' },
  { key: 'notary_payment_received', label: 'E-Notary Payment Received', desc: 'Client paid the E-Notary invoice', type: 'payment', who: 'shar' },
  { key: 'notary_completed', label: 'E-Notary Completed', desc: 'E-Notary session conducted and completed', type: 'form', who: 'shar' },
  { key: 'disputes_sent', label: 'Credit Disputes Sent', desc: 'Dispute letters sent by Joeziel', type: 'disputes', who: 'joeziel' },
];

const ProgressBar = ({ completed, total = 8, canceled }) => {
  if (canceled) return <div className="flex items-center gap-2"><div className="h-2 w-full bg-gray-200 rounded-full" /><span className="text-xs text-gray-500 whitespace-nowrap">CANCELED</span></div>;
  const pct = Math.round((completed / total) * 100);
  const color = completed <= 3 ? 'bg-red-500' : completed <= 6 ? 'bg-orange-500' : completed === 7 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2" data-testid="merger-progress-bar">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium whitespace-nowrap text-gray-600">{completed}/{total}</span>
    </div>
  );
};

const MergerTaskDetail = ({ client, partner, onClose, onUpdate }) => {
  const [data, setData] = useState(client);
  const [taskForms, setTaskForms] = useState({});
  const [uploading, setUploading] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [verifyText, setVerifyText] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [mailingModal, setMailingModal] = useState(false);

  const isMaster = partner?.role === 'master_partner';
  const tasks = data.tasks || {};
  const completedCount = data.tasks_completed_count || TASKS.filter(t => tasks[t.key]?.complete).length;
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];

  const completeTask = async (taskKey, body = {}) => {
    try {
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/tasks/${taskKey}/complete`, {
        method: 'POST', headers: partnerH(), body: JSON.stringify(body)
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.detail); return; }
      setData(result.client);
      onUpdate?.(result.client);
      toast.success(result.message);
    } catch { toast.error('Failed to complete task'); }
  };

  const undoTask = async (taskKey) => {
    try {
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/tasks/${taskKey}/undo`, {
        method: 'POST', headers: partnerH()
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.detail); return; }
      setData(result.client);
      onUpdate?.(result.client);
      toast.success(result.message);
    } catch { toast.error('Failed to undo task'); }
  };

  const uploadFile = async (taskKey, file) => {
    setUploading(taskKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/tasks/${taskKey}/upload`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${sessionStorage.getItem('partner_token')}` }, body: formData
      });
      const result = await res.json();
      if (res.ok) {
        await completeTask(taskKey, { file_url: result.file_url, file_name: result.file_name });
      } else toast.error(result.detail);
    } catch { toast.error('Upload failed'); }
    setUploading(null);
  };

  const handleConfirm = async () => {
    try {
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/shar-confirm`, {
        method: 'POST', headers: partnerH(), body: JSON.stringify({ confirmation_text: confirmText })
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.detail); return; }
      setData(result.client);
      onUpdate?.(result.client);
      toast.success('Account confirmed!');
      setConfirmText('');
    } catch { toast.error('Confirmation failed'); }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/joe-verify`, {
        method: 'POST', headers: partnerH(), body: JSON.stringify({ verification_text: verifyText })
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.detail); return; }
      setData(result.client);
      onUpdate?.(result.client);
      toast.success('Account FULLY MERGED!');
      setVerifyText('');
    } catch { toast.error('Verification failed'); }
  };

  const handleCancel = async () => {
    try {
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/cancel`, {
        method: 'POST', headers: partnerH(), body: JSON.stringify({ cancellation_reason: cancelReason })
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.detail); return; }
      setData(result.client);
      onUpdate?.(result.client);
      toast.success('Client canceled');
      setShowCancel(false);
    } catch { toast.error('Cancel failed'); }
  };

  const handleReopen = async () => {
    try {
      const res = await fetch(`${API}/api/cpr/clients/${data.id}/reopen`, {
        method: 'POST', headers: partnerH(), body: JSON.stringify({ reason: 'Reopened by admin' })
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.detail); return; }
      setData(result.client);
      onUpdate?.(result.client);
      toast.success('Client reopened');
    } catch { toast.error('Reopen failed'); }
  };

  const sharTasksComplete = TASKS.slice(0, 7).every(t => tasks[t.key]?.complete);
  const allTasksComplete = TASKS.every(t => tasks[t.key]?.complete);
  const statusLabel = data.merger_status === 'fully_merged' ? 'FULLY MERGED' : data.merger_status === 'canceled' ? 'CANCELED' : data.merger_status?.replace(/_/g, ' ').toUpperCase();
  const statusColor = data.merger_status === 'fully_merged' ? 'bg-green-100 text-green-800' : data.merger_status === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

  // Duplicate name warning
  const isDuplicate = data.full_name === 'Nancy Vargas' || data.full_name === 'Jessica McDonough Hills';

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900" data-testid="task-detail-name">{data.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColor}>{statusLabel}</Badge>
              <span className="text-xs text-gray-500 capitalize">{data.category?.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Duplicate Warning */}
          {isDuplicate && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="text-sm text-yellow-800">Duplicate name detected - confirm if same client as other category record</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Merger Progress</span>
              <span className="text-sm text-gray-600">{completedCount}/8 Tasks</span>
            </div>
            <ProgressBar completed={completedCount} canceled={data.canceled} />
          </div>

          {/* Task Stepper */}
          <div className="space-y-2" data-testid="task-stepper">
            {TASKS.map((task, idx) => {
              const tData = tasks[task.key] || {};
              const isComplete = tData.complete;
              const isLocked = task.who === 'joeziel' && !isMaster;
              const isExpanded = expanded === task.key;
              const canAct = !isComplete && !isLocked && !data.canceled;

              return (
                <div key={task.key} className={`border rounded-xl overflow-hidden ${isComplete ? 'border-green-200 bg-green-50/30' : isLocked ? 'border-gray-200 bg-gray-50' : 'border-gray-200'}`} data-testid={`task-${task.key}`}>
                  <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : task.key)}>
                    <div className="flex-shrink-0">
                      {isComplete ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                       isLocked ? <Lock className="w-6 h-6 text-gray-400" /> :
                       <Circle className="w-6 h-6 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{`Step ${idx + 1}: ${task.label}`}</span>
                        {isComplete && <span className="text-[10px] text-green-600">Completed {tData.completed_date?.slice(0, 10)} by {tData.completed_by}</span>}
                        {isLocked && <span className="text-[10px] text-gray-500 italic">Awaiting Joeziel</span>}
                      </div>
                      <p className="text-xs text-gray-500">{task.desc}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t bg-white">
                      {/* FILE UPLOAD TASKS */}
                      {task.type === 'file' && canAct && (
                        <div className="space-y-2">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 cursor-pointer transition">
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">{uploading === task.key ? 'Uploading...' : 'Click or drag file here'}</span>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if (e.target.files[0]) uploadFile(task.key, e.target.files[0]); }} disabled={uploading === task.key} />
                          </label>
                        </div>
                      )}

                      {/* SCOREFUSION */}
                      {task.key === 'scorefusion_ordered' && canAct && (
                        <div className="space-y-2">
                          <Input placeholder="ScoreFusion confirmation # (optional)" value={taskForms.scorefusion_conf || ''} onChange={e => setTaskForms(p => ({ ...p, scorefusion_conf: e.target.value }))} className="text-sm" />
                          <Button size="sm" onClick={() => completeTask('scorefusion_ordered', { confirmation_number: taskForms.scorefusion_conf })}>Mark as Ordered</Button>
                        </div>
                      )}

                      {/* NOTARY INVOICE */}
                      {task.key === 'notary_invoice_sent' && canAct && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 italic">Please input what the client was invoiced</p>
                          <Input type="number" step="0.01" placeholder="Invoice amount" value={taskForms.inv_amount || ''} onChange={e => setTaskForms(p => ({ ...p, inv_amount: e.target.value }))} className="text-sm" />
                          <Input placeholder="Invoice notes (optional)" value={taskForms.inv_notes || ''} onChange={e => setTaskForms(p => ({ ...p, inv_notes: e.target.value }))} className="text-sm" />
                          <Button size="sm" onClick={() => completeTask('notary_invoice_sent', { invoice_amount: parseFloat(taskForms.inv_amount), invoice_notes: taskForms.inv_notes })} disabled={!taskForms.inv_amount}>Send Invoice</Button>
                        </div>
                      )}

                      {/* NOTARY PAYMENT */}
                      {task.key === 'notary_payment_received' && canAct && (
                        <div className="space-y-2">
                          <Input type="number" step="0.01" placeholder="Amount paid" value={taskForms.pay_amount || ''} onChange={e => setTaskForms(p => ({ ...p, pay_amount: e.target.value }))} className="text-sm" />
                          <select className="w-full border rounded-lg p-2 text-sm" value={taskForms.pay_method || ''} onChange={e => setTaskForms(p => ({ ...p, pay_method: e.target.value }))}>
                            <option value="">Payment method...</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="venmo">Venmo</option>
                            <option value="zelle">Zelle</option>
                            <option value="cash">Cash</option>
                            <option value="other">Other</option>
                          </select>
                          <Button size="sm" onClick={() => completeTask('notary_payment_received', { amount_paid: parseFloat(taskForms.pay_amount), payment_method: taskForms.pay_method })} disabled={!taskForms.pay_amount}>Record Payment</Button>
                        </div>
                      )}

                      {/* NOTARY COMPLETED */}
                      {task.key === 'notary_completed' && canAct && (
                        <div className="space-y-2">
                          <Input placeholder="Notary provider (optional)" value={taskForms.notary_prov || ''} onChange={e => setTaskForms(p => ({ ...p, notary_prov: e.target.value }))} className="text-sm" />
                          <Button size="sm" onClick={() => completeTask('notary_completed', { notary_provider: taskForms.notary_prov })}>Mark Completed</Button>
                        </div>
                      )}

                      {/* DISPUTES (Joeziel only) */}
                      {task.key === 'disputes_sent' && isMaster && !isComplete && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {[1, 2, 3, 4].map(r => (
                              <label key={r} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer text-sm ${taskForms.dispute_round === r ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                                <input type="radio" name="round" className="hidden" checked={taskForms.dispute_round === r} onChange={() => setTaskForms(p => ({ ...p, dispute_round: r }))} />
                                Round {r}
                              </label>
                            ))}
                          </div>
                          <textarea placeholder="Dispute notes..." className="w-full border rounded-lg p-2 text-sm" rows={2} value={taskForms.dispute_notes || ''} onChange={e => setTaskForms(p => ({ ...p, dispute_notes: e.target.value }))} />
                          <Button size="sm" onClick={() => completeTask('disputes_sent', { dispute_round: taskForms.dispute_round || 1, notes: taskForms.dispute_notes })}>Confirm & Mark Complete</Button>
                        </div>
                      )}

                      {/* Completed info */}
                      {isComplete && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {tData.file_name && <p>File: {tData.file_name}</p>}
                          {tData.confirmation_number && <p>Confirmation #: {tData.confirmation_number}</p>}
                          {tData.invoice_amount != null && <p>Invoice Amount: ${tData.invoice_amount?.toFixed(2)}</p>}
                          {tData.amount_paid != null && <p>Amount Paid: ${tData.amount_paid?.toFixed(2)} via {tData.payment_method}</p>}
                          {tData.dispute_round && <p>Dispute Round: {tData.dispute_round}</p>}
                          {tData.notes && <p>Notes: {tData.notes}</p>}
                          {isMaster && <Button size="sm" variant="ghost" className="text-xs text-red-600 mt-1" onClick={() => undoTask(task.key)}>Undo Task</Button>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Financial Summary */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold mb-3">Financial Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs font-semibold text-green-700 mb-1">Jan+Feb (100% Shar)</p>
                <p className="text-sm">Gross: <span className="font-mono font-bold">${(data.jan_feb_gross || 0).toFixed(2)}</span></p>
                <p className="text-sm">Net: <span className="font-mono font-bold">${(data.jan_feb_net || 0).toFixed(2)}</span></p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 mb-1">Mar-Jun (50/50)</p>
                <p className="text-sm">Gross: <span className="font-mono font-bold">${(data.mar_jun_gross || 0).toFixed(2)}</span></p>
                <p className="text-sm">Net: <span className="font-mono font-bold">${(data.mar_jun_net || 0).toFixed(2)}</span></p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm border-t pt-2">
              <div className="flex justify-between"><span>Shar's Total</span><span className="font-bold text-green-700">${(data.shar_total || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Joe's Total</span><span className="font-bold text-indigo-700">${(data.joe_total || 0).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold border-t pt-1"><span>Grand Total</span><span>${(data.grand_total || 0).toFixed(2)}</span></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Auth.net $35/month fee deducted at portfolio level - not reflected in per-client totals</p>
          </div>

          {/* Mailing Costs */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold mb-3">Mailing Costs</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {MONTHS.map(m => {
                const val = data[`${m}_mail`] || data[`${m}_mail_amount`] || 0;
                return (
                  <div key={m} className="text-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => !isMaster && setMailingModal(true)}>
                    <p className="text-[10px] text-gray-500 uppercase">{m} 2026</p>
                    <p className="font-mono text-sm font-medium">${val.toFixed(2)}</p>
                    <p className="text-[9px] text-gray-400 italic">via DisputeFox</p>
                  </div>
                );
              })}
            </div>
            {isMaster && (
              <details className="mt-3 border rounded-lg p-3 bg-gray-50">
                <summary className="text-xs font-medium text-gray-500 cursor-pointer">Data Sync Settings</summary>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {MONTHS.map(m => (
                    <div key={m}>
                      <label className="text-[10px] text-gray-400 uppercase">{m} Sync Amount</label>
                      <Input type="number" step="0.01" className="h-7 text-xs" value={data[`${m}_mail`] || 0} readOnly />
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Verification Section */}
          <div className="border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold">Verification</h3>

            {/* Shar Confirm */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Shar's Confirmation:</span>
                {data.shar_confirmed ? <CheckCircle className="w-5 h-5 text-green-600" /> : <span className="text-xs text-gray-400">Pending</span>}
              </div>
              {!isMaster && !data.shar_confirmed && sharTasksComplete && (
                <div className="flex items-center gap-2">
                  <Input placeholder='Type "CONFIRM"' className="w-32 h-8 text-xs" value={confirmText} onChange={e => setConfirmText(e.target.value)} />
                  <Button size="sm" className="h-8 text-xs" disabled={confirmText !== 'CONFIRM'} onClick={handleConfirm} data-testid="shar-confirm-btn">Confirm Account</Button>
                </div>
              )}
            </div>

            {/* Joe Verify */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Joeziel's Verification:</span>
                {data.joe_verified ? <CheckCircle className="w-5 h-5 text-green-600" /> : <span className="text-xs text-gray-400">Pending</span>}
              </div>
              {isMaster && !data.joe_verified && allTasksComplete && data.shar_confirmed && (
                <div className="flex items-center gap-2">
                  <Input placeholder='Type "VERIFIED"' className="w-32 h-8 text-xs" value={verifyText} onChange={e => setVerifyText(e.target.value)} />
                  <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" disabled={verifyText !== 'VERIFIED'} onClick={handleVerify} data-testid="joe-verify-btn">Mark Fully Merged</Button>
                </div>
              )}
              {!isMaster && !data.joe_verified && <span className="text-xs text-gray-400 italic">Awaiting Joeziel</span>}
            </div>
          </div>

          {/* Cancel / Reopen */}
          <div className="flex justify-between items-center pt-2 border-t">
            {data.canceled ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-red-600">
                  <p className="font-medium">Canceled by {data.canceled_by} on {data.canceled_date?.slice(0, 10)}</p>
                  <p className="text-xs">Reason: {data.cancellation_reason}</p>
                </div>
                {isMaster && <Button size="sm" variant="outline" onClick={handleReopen}>Reopen Client</Button>}
              </div>
            ) : (
              <div>
                {showCancel ? (
                  <div className="flex items-center gap-2">
                    <Input placeholder="Cancellation reason (required)" className="w-64 text-sm" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
                    <Button size="sm" variant="destructive" disabled={!cancelReason.trim()} onClick={handleCancel}>Confirm Cancel</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowCancel(false)}>Nevermind</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="text-red-600 text-xs" onClick={() => setShowCancel(true)}>Cancel Client</Button>
                )}
              </div>
            )}
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>

      {/* Mailing Non-Editable Modal */}
      {mailingModal && (
        <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center" onClick={() => setMailingModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md shadow-2xl" onClick={e => e.stopPropagation()} data-testid="mailing-modal">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
              <h3 className="font-bold">This field is not editable</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Mailing cost data is automatically synced from the DisputeFox API - MailFox Feature. This information is managed by the system and cannot be modified here.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              If you believe there is an error in this amount, please submit a support ticket and the master admin will review it.
            </p>
            <Button className="w-full" onClick={() => setMailingModal(false)} data-testid="mailing-modal-ok">OK, Got It</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { MergerTaskDetail, ProgressBar };
export default MergerTaskDetail;
