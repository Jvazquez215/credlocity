import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Search, FileText, Printer, Download, Save, Eye, Edit,
  Trash2, ChevronRight, AlertTriangle, ArrowLeft, X, UserPlus, Send
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';

const API_HEADERS = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Letter templates
const LETTER_TEMPLATES = {
  friendly_reminder: (d) => `${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}

Dear ${d.consumer_first_name || '[First Name]'} ${d.consumer_last_name || '[Last Name]'},

This is a friendly reminder that your account with Credlocity Business Group LLC reflects an outstanding balance of $${(d.amount_owed || 0).toFixed(2)}, which was originally due on ${d.original_due_date || '[Original Due Date]'}. We understand that sometimes payments can be overlooked, and we want to give you every opportunity to resolve this matter promptly and amicably.

Please review the payment options below and respond no later than ${d.response_deadline || '[Response Deadline]'}. If you have already submitted payment, please disregard this notice and accept our thanks.

Your assigned account representative is ${d.rep_name || '[Rep Name]'}, who is available to assist you at ${d.rep_phone || '[Rep Phone]'} or ${d.rep_email || '[Rep Email]'}.`,

  firm_notice: (d) => `${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}

Dear ${d.consumer_first_name || '[First Name]'} ${d.consumer_last_name || '[Last Name]'},

Our records reflect an outstanding balance of $${(d.amount_owed || 0).toFixed(2)} on your account, now ${d.days_past_due || 0} days past due. Despite previous correspondence regarding this matter, the balance remains unresolved.

This is your second notice. Please be advised that failure to resolve this balance on or before ${d.response_deadline || '[Response Deadline]'} may result in further collection action as outlined below. We strongly encourage you to contact your assigned representative immediately to discuss your options.

Your assigned representative is ${d.rep_name || '[Rep Name]'}, reachable at ${d.rep_phone || '[Rep Phone]'} or ${d.rep_email || '[Rep Email]'}.`,

  final_warning: (d) => `${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}

FINAL NOTICE — IMMEDIATE ACTION REQUIRED

Dear ${d.consumer_first_name || '[First Name]'} ${d.consumer_last_name || '[Last Name]'},

Despite prior written notice, your account reflects an outstanding balance of $${(d.amount_owed || 0).toFixed(2)}, now ${d.days_past_due || 0} days past due. This is your final notice before Credlocity Business Group LLC is compelled to proceed with the following enforcement action(s):

[CONSEQUENCES BLOCK]

You have until ${d.response_deadline || '[Response Deadline]'} to resolve this balance in full or contact our office to arrange an acceptable payment plan. Failure to act before this date may result in the consequences described above without further notice.

Contact your assigned representative immediately: ${d.rep_name || '[Rep Name]'} | ${d.rep_phone || '[Rep Phone]'} | ${d.rep_email || '[Rep Email]'}`
};

const CONSEQUENCE_TEXT = {
  small_claims: `Credlocity Business Group LLC reserves the right to file a civil claim against you in Philadelphia Municipal Court for the full balance owed, plus applicable court costs, filing fees, and any interest accrued. A judgment against you may result in wage garnishment or liens against your property.`,
  third_party_collections: `Your account may be referred to a licensed third-party collections agency. Once referred, additional collection fees may be added to your balance, and you may be subject to direct collection contact from that agency.`,
  credit_bureau_reporting: `This delinquent balance may be reported to Equifax, Experian, and TransUnion as a collection account. A collection account on your credit report can significantly lower your credit score and remain on your report for up to seven years from the date of first delinquency.`
};

const PAYMENT_TEXT = {
  phone: (phone) => `To pay by phone, please call ${phone || '[Phone Number]'} during normal business hours, Monday through Friday.`,
  check_mail: (addr) => `To pay by check, make your check payable to Credlocity Business Group LLC and mail to: ${addr}`,
  payment_plan: (d) => `If you are experiencing financial hardship and wish to discuss a payment plan arrangement, please contact ${d.rep_name || '[Rep Name]'} at ${d.rep_phone || '[Rep Phone]'} or ${d.rep_email || '[Rep Email]'} before the response deadline.`
};

const FOOTER = `
Credlocity Business Group LLC
1500 Chestnut Street, Suite 2, Philadelphia, PA 19102

This communication is from a debt collector. This is an attempt to collect a debt and any information obtained will be used for that purpose.`;

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

// ============ LETTER BUILDER ============
export const LetterBuilder = ({ editId }) => {
  const navigate = useNavigate();
  const [reps, setReps] = useState([]);
  const [showAddRep, setShowAddRep] = useState(false);
  const [newRep, setNewRep] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    consumer_first_name: '', consumer_last_name: '',
    consumer_address_street: '', consumer_address_city: '',
    consumer_address_state: '', consumer_address_zip: '',
    consumer_ssn_last_four: '', consumer_birth_year: '',
    account_number: '', amount_owed: 0, original_due_date: '',
    days_past_due: 0, assigned_rep_id: '',
    urgency_level: 'friendly_reminder',
    consequences: [], payment_options: [],
    payment_url: '', payment_phone: '',
    payment_mail_address: 'Credlocity Business Group LLC, 1500 Chestnut Street, Suite 2, Philadelphia, PA 19102',
    payment_plan_instructions: '',
    response_deadline: '', letter_body: '', status: 'draft'
  });

  useEffect(() => { fetchReps(); if (editId) fetchLetter(); }, [editId]);

  const fetchReps = async () => {
    try { const res = await api.get('/collections/reps', API_HEADERS()); setReps(res.data || []); }
    catch (e) { console.error(e); }
  };

  const fetchLetter = async () => {
    try {
      const res = await api.get(`/collections/letters/${editId}`, API_HEADERS());
      setForm(res.data);
    } catch (e) { toast.error('Letter not found'); navigate('/admin/collections/letters'); }
  };

  // Auto-calculate days past due
  useEffect(() => {
    if (form.original_due_date) {
      const due = new Date(form.original_due_date);
      const today = new Date();
      const diff = Math.max(0, Math.floor((today - due) / 86400000));
      setForm(prev => ({ ...prev, days_past_due: diff }));
    }
  }, [form.original_due_date]);

  const selectedRep = reps.find(r => r.id === form.assigned_rep_id);

  // Build the full letter preview
  const buildPreview = useCallback(() => {
    const d = {
      ...form,
      rep_name: selectedRep?.name || '',
      rep_phone: selectedRep?.phone || form.payment_phone || '',
      rep_email: selectedRep?.email || ''
    };

    let body = LETTER_TEMPLATES[form.urgency_level]?.(d) || '';

    // Add consequences
    if (form.consequences.length > 0) {
      const cBlock = form.consequences.map(c => CONSEQUENCE_TEXT[c]).filter(Boolean).join('\n\n');
      body = body.replace('[CONSEQUENCES BLOCK]', cBlock);
    } else {
      body = body.replace('[CONSEQUENCES BLOCK]', '');
    }

    // Add payment options
    let payBlock = '';
    if ((form.payment_options.includes('qr_code') || form.payment_options.includes('pay_online')) && form.payment_token) {
      payBlock += `\n\nPay Online Securely\nVisit your secure payment portal: ${window.location.origin}/pay/${form.payment_token}\nYou will need your last 4 digits of your Social Security number and your year of birth to verify your identity.`;
    } else if (form.payment_options.includes('qr_code') || form.payment_options.includes('pay_online')) {
      payBlock += '\n\nPay Online Securely\n[Payment link will be generated when letter is saved]';
    }
    if (form.payment_options.includes('phone')) {
      payBlock += '\n\n' + PAYMENT_TEXT.phone(d.rep_phone);
    }
    if (form.payment_options.includes('check_mail')) {
      payBlock += '\n\n' + PAYMENT_TEXT.check_mail(form.payment_mail_address);
    }
    if (form.payment_options.includes('payment_plan')) {
      payBlock += '\n\n' + PAYMENT_TEXT.payment_plan(d);
    }

    body += payBlock + '\n' + FOOTER;
    return body;
  }, [form, selectedRep]);

  const handleSave = async (status = 'draft') => {
    if (!form.consumer_first_name || !form.consumer_last_name) {
      toast.error('Consumer name is required'); return;
    }
    if ((form.payment_options.includes('qr_code') || form.payment_options.includes('pay_online')) && (!form.consumer_ssn_last_four || !form.consumer_birth_year)) {
      toast.error('SSN last 4 and birth year are required for online payment options'); return;
    }
    try {
      setSaving(true);
      const payload = { ...form, status, letter_body: buildPreview() };
      let savedLetter;
      if (editId) {
        const res = await api.put(`/collections/letters/${editId}`, payload, API_HEADERS());
        savedLetter = res.data;
        toast.success('Letter updated');
      } else {
        const res = await api.post('/collections/letters', payload, API_HEADERS());
        savedLetter = res.data;
        toast.success('Letter saved');
      }
      // Show payment URL if QR code or pay online option is selected
      if (savedLetter?.payment_token && (form.payment_options.includes('qr_code') || form.payment_options.includes('pay_online'))) {
        const payUrl = `${window.location.origin}/pay/${savedLetter.payment_token}`;
        toast.success(`Payment URL: ${payUrl}`, { duration: 10000 });
      }
      navigate('/admin/collections/letters');
    } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
    finally { setSaving(false); }
  };

  const [qrDataUrl, setQrDataUrl] = useState(null);

  // Load QR code if letter has payment token
  useEffect(() => {
    if (editId && form.payment_token && (form.payment_options.includes('qr_code') || form.payment_options.includes('pay_online'))) {
      api.get(`/collections/letters/${editId}/qr-data`, API_HEADERS())
        .then(r => setQrDataUrl(r.data.qr_data_url))
        .catch(() => {});
    }
  }, [editId, form.payment_token, form.payment_options]);

  const handlePrint = () => {
    const preview = document.getElementById('letter-preview-content');
    if (!preview) return;
    const win = window.open('', '', 'width=800,height=1000');
    win.document.write(`<html><head><title>Collection Letter</title><style>body{font-family:Georgia,serif;padding:40px;line-height:1.6;white-space:pre-wrap;max-width:700px;margin:0 auto}h2{text-align:center;margin-bottom:30px}.qr-section{text-align:center;margin:30px 0;page-break-inside:avoid}.qr-section img{width:180px;height:180px}.qr-label{font-size:14px;margin-top:10px;font-family:Arial,sans-serif}</style></head><body>`);
    win.document.write(`<h2>Credlocity Business Group LLC</h2>`);
    win.document.write(preview.innerText.replace(/\n/g, '<br>'));
    if (qrDataUrl) {
      const payUrl = `${window.location.origin}/pay/${form.payment_token}`;
      win.document.write(`<div class="qr-section"><p class="qr-label"><strong>Scan to Pay Online</strong></p><img src="${qrDataUrl}" alt="Payment QR Code" /><p class="qr-label">${payUrl}</p></div>`);
    }
    win.document.write(`</body></html>`);
    win.document.close();
    win.print();
  };

  const handleAddRep = async () => {
    if (!newRep.name) { toast.error('Rep name required'); return; }
    try {
      const res = await api.post('/collections/reps', newRep, API_HEADERS());
      setReps(prev => [...prev, res.data]);
      setForm(prev => ({ ...prev, assigned_rep_id: res.data.id }));
      setNewRep({ name: '', phone: '', email: '' });
      setShowAddRep(false);
      toast.success('Rep added');
    } catch (e) { toast.error('Failed to add rep'); }
  };

  const toggleArrayField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div data-testid="letter-builder">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/collections/letters')}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <h1 className="text-xl font-bold">{editId ? 'Edit' : 'New'} Collection Letter</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave('draft')} disabled={saving} data-testid="save-draft-btn">
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white" onClick={() => handleSave('sent')} disabled={saving} data-testid="save-send-btn">
            <Send className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save & Send'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {/* Consumer Info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Consumer Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">First Name *</label><Input value={form.consumer_first_name} onChange={e => setForm({...form, consumer_first_name: e.target.value})} data-testid="consumer-first-name" /></div>
                <div><label className="text-xs text-gray-500">Last Name *</label><Input value={form.consumer_last_name} onChange={e => setForm({...form, consumer_last_name: e.target.value})} data-testid="consumer-last-name" /></div>
              </div>
              <div><label className="text-xs text-gray-500">Street Address</label><Input value={form.consumer_address_street} onChange={e => setForm({...form, consumer_address_street: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs text-gray-500">City</label><Input value={form.consumer_address_city} onChange={e => setForm({...form, consumer_address_city: e.target.value})} /></div>
                <div>
                  <label className="text-xs text-gray-500">State</label>
                  <select value={form.consumer_address_state} onChange={e => setForm({...form, consumer_address_state: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="">Select</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500">ZIP</label><Input value={form.consumer_address_zip} onChange={e => setForm({...form, consumer_address_zip: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Account #</label><Input placeholder="Auto-generated if blank" value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500">Amount Owed *</label><Input type="number" step="0.01" value={form.amount_owed} onChange={e => setForm({...form, amount_owed: parseFloat(e.target.value) || 0})} data-testid="amount-owed" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Original Due Date</label><Input type="date" value={form.original_due_date} onChange={e => setForm({...form, original_due_date: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500">Days Past Due</label><Input value={form.days_past_due} readOnly className="bg-gray-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">SSN Last 4 (for payment portal)</label><Input type="text" maxLength={4} inputMode="numeric" placeholder="1234" value={form.consumer_ssn_last_four} onChange={e => setForm({...form, consumer_ssn_last_four: e.target.value.replace(/\D/g, '').slice(0,4)})} data-testid="consumer-ssn-last-four" /></div>
                <div><label className="text-xs text-gray-500">Birth Year (for payment portal)</label><Input type="text" maxLength={4} inputMode="numeric" placeholder="1985" value={form.consumer_birth_year} onChange={e => setForm({...form, consumer_birth_year: e.target.value.replace(/\D/g, '').slice(0,4)})} data-testid="consumer-birth-year" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Rep */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Assigned Collection Rep</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <select value={form.assigned_rep_id} onChange={e => setForm({...form, assigned_rep_id: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="assigned-rep">
                <option value="">Select Rep</option>
                {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button onClick={() => setShowAddRep(true)} className="text-xs text-emerald-600 hover:underline flex items-center gap-1"><UserPlus className="w-3 h-3" />Add New Rep</button>
              {showAddRep && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <Input placeholder="Name" value={newRep.name} onChange={e => setNewRep({...newRep, name: e.target.value})} />
                  <Input placeholder="Phone" value={newRep.phone} onChange={e => setNewRep({...newRep, phone: e.target.value})} />
                  <Input placeholder="Email" value={newRep.email} onChange={e => setNewRep({...newRep, email: e.target.value})} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowAddRep(false)}>Cancel</Button>
                    <Button size="sm" className="bg-emerald-600" onClick={handleAddRep}>Add</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgency Level */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Letter Urgency Level</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { val: 'friendly_reminder', label: 'Friendly Reminder — First Notice', color: 'bg-yellow-400' },
                { val: 'firm_notice', label: 'Firm Notice — Second Notice', color: 'bg-orange-500' },
                { val: 'final_warning', label: 'Final Warning — Final Notice Before Action', color: 'bg-red-500' },
              ].map(u => (
                <label key={u.val} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${form.urgency_level === u.val ? 'border-gray-900 bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="urgency" value={u.val} checked={form.urgency_level === u.val} onChange={e => setForm({...form, urgency_level: e.target.value})} className="w-4 h-4" />
                  <span className={`w-3 h-3 rounded-full ${u.color}`} />
                  <span className="text-sm font-medium">{u.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Consequences */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Consequences</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { val: 'small_claims', label: 'Small Claims Court Filing' },
                { val: 'third_party_collections', label: 'Referral to Third-Party Collections Agency' },
                { val: 'credit_bureau_reporting', label: 'Negative Credit Bureau Reporting' },
              ].map(c => (
                <label key={c.val} className="flex items-center gap-3 p-2 cursor-pointer">
                  <input type="checkbox" checked={form.consequences.includes(c.val)} onChange={() => toggleArrayField('consequences', c.val)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-sm">{c.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Payment Options</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { val: 'qr_code', label: 'Pay Online via QR Code' },
                { val: 'pay_online', label: 'Pay Online (Unique Link)' },
                { val: 'phone', label: 'Pay by Phone' },
                { val: 'check_mail', label: 'Pay by Check or Mail' },
                { val: 'payment_plan', label: 'Payment Plan Available' },
              ].map(p => (
                <label key={p.val} className="flex items-center gap-3 p-2 cursor-pointer">
                  <input type="checkbox" checked={form.payment_options.includes(p.val)} onChange={() => toggleArrayField('payment_options', p.val)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
              {(form.payment_options.includes('qr_code') || form.payment_options.includes('pay_online')) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium mb-1">Secure Payment Link</p>
                  <p className="text-xs text-blue-600">A unique payment URL will be generated when you save this letter. The consumer must verify their identity (SSN last 4 + birth year) before making a payment.</p>
                  {form.payment_token && <p className="text-xs text-blue-800 mt-2 font-mono bg-blue-100 p-2 rounded">{window.location.origin}/pay/{form.payment_token}</p>}
                </div>
              )}
              {form.payment_options.includes('phone') && (
                <div><label className="text-xs text-gray-500">Phone Number</label><Input value={form.payment_phone || selectedRep?.phone || ''} onChange={e => setForm({...form, payment_phone: e.target.value})} /></div>
              )}
              {form.payment_options.includes('check_mail') && (
                <div><label className="text-xs text-gray-500">Mailing Address</label><Input value={form.payment_mail_address} onChange={e => setForm({...form, payment_mail_address: e.target.value})} /></div>
              )}
              {form.payment_options.includes('payment_plan') && (
                <div><label className="text-xs text-gray-500">Payment Plan Instructions</label><textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={2} value={form.payment_plan_instructions} onChange={e => setForm({...form, payment_plan_instructions: e.target.value})} /></div>
              )}
            </CardContent>
          </Card>

          {/* Response Deadline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Response Deadline</CardTitle></CardHeader>
            <CardContent>
              <Input type="date" value={form.response_deadline} onChange={e => setForm({...form, response_deadline: e.target.value})} data-testid="response-deadline" />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="border-2">
            <CardHeader className="pb-2 bg-gray-50 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" />Live Letter Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div id="letter-preview-content" className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-gray-800 max-h-[70vh] overflow-y-auto" data-testid="letter-preview">
                {buildPreview()}
              </div>
              {qrDataUrl && (
                <div className="mt-4 pt-4 border-t text-center" data-testid="qr-code-preview">
                  <p className="text-xs font-sans font-semibold text-gray-600 mb-2">Scan to Pay Online</p>
                  <img src={qrDataUrl} alt="Payment QR Code" className="w-32 h-32 mx-auto border rounded" />
                  <p className="text-[10px] font-mono text-gray-400 mt-1">{window.location.origin}/pay/{form.payment_token}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============ LETTER EDIT WRAPPER ============
export const LetterEdit = () => {
  const { letterId } = useParams();
  return <LetterBuilder editId={letterId} />;
};

// ============ LETTERS LIST ============
export const LettersList = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchLetters(); }, [urgencyFilter, statusFilter]);
  
  const fetchLetters = async () => {
    try {
      const params = new URLSearchParams();
      if (urgencyFilter) params.set('urgency', urgencyFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/collections/letters?${params}`, API_HEADERS());
      setLetters(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const urgencyBadge = (u) => {
    const map = { friendly_reminder: 'bg-yellow-100 text-yellow-800', firm_notice: 'bg-orange-100 text-orange-800', final_warning: 'bg-red-100 text-red-800' };
    const labels = { friendly_reminder: 'Friendly', firm_notice: 'Firm', final_warning: 'Final' };
    return <Badge className={map[u] || ''}>{labels[u] || u}</Badge>;
  };

  const statusBadge = (s) => {
    const map = { draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700', payment_received: 'bg-green-100 text-green-700', escalated: 'bg-amber-100 text-amber-700', resolved: 'bg-emerald-100 text-emerald-800' };
    return <Badge className={map[s] || ''}>{s?.replace('_',' ')}</Badge>;
  };

  const handleSearch = () => fetchLetters();

  return (
    <div className="space-y-6" data-testid="letters-list">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collection Letters</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/admin/collections/letters/new')} data-testid="new-letter-btn">
          <Plus className="w-4 h-4 mr-2" />New Letter
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or account..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        </div>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Urgency</option>
          <option value="friendly_reminder">Friendly Reminder</option>
          <option value="firm_notice">Firm Notice</option>
          <option value="final_warning">Final Warning</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="payment_received">Payment Received</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <CardContent className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" /></CardContent>
        ) : letters.length === 0 ? (
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No Letters Found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first collection letter</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="px-4 py-3 text-left text-gray-500">Consumer</th>
                <th className="px-4 py-3 text-left text-gray-500">Account #</th>
                <th className="px-4 py-3 text-left text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-gray-500">Payment</th>
                <th className="px-4 py-3 text-left text-gray-500">Urgency</th>
                <th className="px-4 py-3 text-left text-gray-500">Rep</th>
                <th className="px-4 py-3 text-left text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-gray-500">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {letters.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{l.consumer_first_name} {l.consumer_last_name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{l.account_number}</td>
                    <td className="px-4 py-3 font-medium">${l.amount_owed?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {l.payment_status === 'paid' ? <Badge className="bg-green-100 text-green-700">Paid</Badge> : 
                       l.payment_status === 'partial' ? <Badge className="bg-amber-100 text-amber-700">Partial</Badge> :
                       l.payment_token ? <Badge className="bg-blue-100 text-blue-700">Link Active</Badge> : 
                       <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">{urgencyBadge(l.urgency_level)}</td>
                    <td className="px-4 py-3 text-gray-600">{l.rep_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{statusBadge(l.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/collections/letters/${l.id}`)} data-testid={`edit-letter-${l.id}`}><Edit className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LettersList;
