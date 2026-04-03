import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, FileSignature, Trash2, X, ChevronRight, User, MapPin, FileText, Shield, Scale } from 'lucide-react';
import api from '../../../utils/api';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia'];

const DEFENDANT_TYPES = ['Credit Bureau (Equifax)', 'Credit Bureau (Experian)', 'Credit Bureau (TransUnion)', 'Debt Collector', 'Original Creditor', 'Furnisher', 'Other'];

const RELIEF_OPTIONS = [
  'Statutory damages under FCRA ($100-$1,000 per violation)',
  'Actual damages for emotional distress',
  'Punitive damages',
  'Attorney fees and costs',
  'Injunctive relief (correct/delete inaccurate information)',
  'Declaratory relief',
  'Statutory damages under FDCPA (up to $1,000)',
  'Treble damages under state law',
];

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Ready to File': 'bg-green-100 text-green-800',
  'Filed': 'bg-indigo-100 text-indigo-800',
  'Served': 'bg-purple-100 text-purple-800',
  'Active': 'bg-orange-100 text-orange-800',
  'Closed': 'bg-gray-200 text-gray-600',
};

const ProSeCenter = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [violationTypes, setViolationTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [detailCase, setDetailCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    client_name: '', client_address: '', client_city: '', client_state: '', client_zip: '',
    client_phone: '', client_email: '', defendant_name: '', defendant_address: '',
    defendant_type: '', violation_types: [], court_type: 'Federal Court', court_district: '',
    filing_state: '', claim_description: '', damages_sought: '', statutory_damages: true,
    actual_damages: '', relief_requested: [], dispute_dates: [''], credit_bureaus_involved: [],
    account_numbers: [''], harm_description: '', status: 'Draft',
  });

  const loadCases = useCallback(async () => {
    try {
      const res = await api.get('/lawsuit-response/prose-cases');
      setCases(res.data.cases || []);
    } catch { toast.error('Failed to load cases'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadCases();
    api.get('/lawsuit-response/violation-types').then(r => setViolationTypes(r.data.types || [])).catch(() => {});
  }, [loadCases]);

  const filtered = cases.filter(c =>
    (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.defendant_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({
      client_name: '', client_address: '', client_city: '', client_state: '', client_zip: '',
      client_phone: '', client_email: '', defendant_name: '', defendant_address: '',
      defendant_type: '', violation_types: [], court_type: 'Federal Court', court_district: '',
      filing_state: '', claim_description: '', damages_sought: '', statutory_damages: true,
      actual_damages: '', relief_requested: [], dispute_dates: [''], credit_bureaus_involved: [],
      account_numbers: [''], harm_description: '', status: 'Draft',
    });
    setStep(1);
  };

  const handleSubmit = async () => {
    try {
      if (editCase) {
        await api.put(`/lawsuit-response/prose-cases/${editCase.id}`, form);
        toast.success('Case updated');
      } else {
        await api.post('/lawsuit-response/prose-cases', form);
        toast.success('Pro Se case created');
      }
      setShowForm(false); setEditCase(null); resetForm(); loadCases();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
  };

  const openEdit = (c) => {
    setForm({ ...form, ...c, dispute_dates: c.dispute_dates?.length ? c.dispute_dates : [''], account_numbers: c.account_numbers?.length ? c.account_numbers : [''] });
    setEditCase(c); setStep(1); setShowForm(true);
  };

  const deleteCase = async (id) => {
    if (!window.confirm('Delete this case?')) return;
    try { await api.delete(`/lawsuit-response/prose-cases/${id}`); toast.success('Deleted'); loadCases(); setDetailCase(null); }
    catch { toast.error('Failed'); }
  };

  const toggleViolation = (id) => setForm(p => ({ ...p, violation_types: p.violation_types.includes(id) ? p.violation_types.filter(v => v !== id) : [...p.violation_types, id] }));
  const toggleRelief = (r) => setForm(p => ({ ...p, relief_requested: p.relief_requested.includes(r) ? p.relief_requested.filter(v => v !== r) : [...p.relief_requested, r] }));
  const toggleBureau = (b) => setForm(p => ({ ...p, credit_bureaus_involved: p.credit_bureaus_involved.includes(b) ? p.credit_bureaus_involved.filter(v => v !== b) : [...p.credit_bureaus_involved, b] }));

  // Detail view
  if (detailCase) {
    const vTypes = violationTypes.filter(v => (detailCase.violation_types || []).includes(v.id));
    return (
      <div className="space-y-6" data-testid="prose-detail-view">
        <button onClick={() => setDetailCase(null)} className="text-sm text-primary-blue hover:underline flex items-center gap-1">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Cases
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pro Se Filing: {detailCase.client_name}</h2>
              <p className="text-sm text-gray-500 mt-1">vs. {detailCase.defendant_name} — {detailCase.court_type}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[detailCase.status] || 'bg-gray-100'}`}>{detailCase.status}</span>
              <Button size="sm" variant="outline" onClick={() => { openEdit(detailCase); setDetailCase(null); }}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteCase(detailCase.id)}>Delete</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><User className="w-4 h-4" /> Client Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p><strong>Name:</strong> {detailCase.client_name}</p>
                <p><strong>Address:</strong> {detailCase.client_address}, {detailCase.client_city}, {detailCase.client_state} {detailCase.client_zip}</p>
                <p><strong>Phone:</strong> {detailCase.client_phone || '—'}</p>
                <p><strong>Email:</strong> {detailCase.client_email || '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Scale className="w-4 h-4" /> Defendant</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p><strong>Name:</strong> {detailCase.defendant_name}</p>
                <p><strong>Type:</strong> {detailCase.defendant_type || '—'}</p>
                <p><strong>Address:</strong> {detailCase.defendant_address || '—'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Shield className="w-4 h-4" /> Violations</h3>
            <div className="flex flex-wrap gap-2">
              {vTypes.map(v => (
                <span key={v.id} className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-xs font-medium">
                  {v.label}
                </span>
              ))}
            </div>
          </div>

          {detailCase.claim_description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Claim Description</h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{detailCase.claim_description}</p>
            </div>
          )}

          {(detailCase.relief_requested || []).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Relief Requested</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {detailCase.relief_requested.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="prose-center">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileSignature className="w-6 h-6 text-primary-blue" /> Pro Se Center</h1>
          <p className="text-sm text-gray-500 mt-1">Create consumer complaints for FCRA, FDCPA, CROA, UCC, and state law violations.</p>
        </div>
        <Button onClick={() => { resetForm(); setEditCase(null); setShowForm(true); }} data-testid="new-prose-btn">
          <Plus className="w-4 h-4 mr-2" /> New Pro Se Filing
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by client or defendant..." className="pl-9" data-testid="search-prose" />
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pro se cases yet. Click "New Pro Se Filing" to start.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer" onClick={() => setDetailCase(c)} data-testid={`prose-card-${c.id}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.client_name} <span className="text-gray-400 font-normal">vs.</span> {c.defendant_name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {(c.violation_types || []).map(v => violationTypes.find(t => t.id === v)?.label || v).join(', ')} — {c.court_type}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-xs text-gray-500 hover:text-primary-blue">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-step wizard modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 mb-10" data-testid="prose-form-modal">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editCase ? 'Edit' : 'New'} Pro Se Filing</h2>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(s => (
                    <div key={s} className={`h-1.5 rounded-full flex-1 transition ${step >= s ? 'bg-primary-blue' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Step {step} of 4: {['Client Info', 'Defendant & Court', 'Violations & Claims', 'Relief & Review'][step-1]}</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditCase(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><User className="w-4 h-4" /> Client Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><Label>Full Legal Name</Label><Input value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} required placeholder="John Michael Doe" data-testid="prose-client-name" /></div>
                    <div className="col-span-2"><Label>Street Address</Label><Input value={form.client_address} onChange={e => setForm(p => ({ ...p, client_address: e.target.value }))} placeholder="123 Main St, Apt 4" data-testid="prose-client-address" /></div>
                    <div><Label>City</Label><Input value={form.client_city} onChange={e => setForm(p => ({ ...p, client_city: e.target.value }))} placeholder="Camden" /></div>
                    <div><Label>State</Label>
                      <select value={form.client_state} onChange={e => setForm(p => ({ ...p, client_state: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">Select State</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><Label>ZIP</Label><Input value={form.client_zip} onChange={e => setForm(p => ({ ...p, client_zip: e.target.value }))} placeholder="08101" /></div>
                    <div><Label>Phone</Label><Input value={form.client_phone} onChange={e => setForm(p => ({ ...p, client_phone: e.target.value }))} placeholder="(555) 123-4567" /></div>
                    <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))} placeholder="john@example.com" /></div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Scale className="w-4 h-4" /> Defendant & Court</h3>
                  <div><Label>Who is the client suing?</Label><Input value={form.defendant_name} onChange={e => setForm(p => ({ ...p, defendant_name: e.target.value }))} required placeholder="Equifax Information Services LLC" data-testid="prose-defendant-name" /></div>
                  <div><Label>Defendant Type</Label>
                    <select value={form.defendant_type} onChange={e => setForm(p => ({ ...p, defendant_type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="prose-defendant-type">
                      <option value="">Select Type</option>
                      {DEFENDANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><Label>Defendant Address</Label><Input value={form.defendant_address} onChange={e => setForm(p => ({ ...p, defendant_address: e.target.value }))} placeholder="P.O. Box 740241, Atlanta, GA 30374" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Court Type</Label>
                      <select value={form.court_type} onChange={e => setForm(p => ({ ...p, court_type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="Federal Court">Federal Court</option><option value="State Court">State Court</option>
                      </select>
                    </div>
                    <div><Label>Filing State</Label>
                      <select value={form.filing_state} onChange={e => setForm(p => ({ ...p, filing_state: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">Select State</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><Label>Court District / Division</Label><Input value={form.court_district} onChange={e => setForm(p => ({ ...p, court_district: e.target.value }))} placeholder="District of New Jersey, Camden Vicinage" /></div>
                  <div>
                    <Label>Credit Bureaus Involved</Label>
                    <div className="flex gap-3 mt-1">
                      {['Equifax', 'Experian', 'TransUnion'].map(b => (
                        <label key={b} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.credit_bureaus_involved.includes(b)} onChange={() => toggleBureau(b)} />
                          <span className="text-sm">{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Shield className="w-4 h-4" /> Violations & Claims</h3>
                  <div>
                    <Label className="mb-2 block">Violation Types (select all that apply)</Label>
                    <div className="border rounded-lg p-3 space-y-2" data-testid="prose-violation-types">
                      {violationTypes.map(v => (
                        <label key={v.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded p-1">
                          <input type="checkbox" checked={form.violation_types.includes(v.id)} onChange={() => toggleViolation(v.id)} className="mt-0.5" />
                          <div>
                            <span className="text-sm font-medium">{v.label}</span>
                            <p className="text-xs text-gray-500">{v.statutes.join(', ')}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Claim Description</Label>
                    <textarea value={form.claim_description} onChange={e => setForm(p => ({ ...p, claim_description: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]" placeholder="Describe the violations and how the consumer's rights were violated..." data-testid="prose-claim-desc" />
                  </div>
                  <div>
                    <Label>Harm / Damages Description</Label>
                    <textarea value={form.harm_description} onChange={e => setForm(p => ({ ...p, harm_description: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]" placeholder="Describe the harm caused: denied credit, emotional distress, lost opportunities..." />
                  </div>
                  <div>
                    <Label>Account Numbers Involved</Label>
                    {form.account_numbers.map((a, i) => (
                      <div key={i} className="flex gap-2 mt-1">
                        <Input value={a} onChange={e => { const arr = [...form.account_numbers]; arr[i] = e.target.value; setForm(p => ({ ...p, account_numbers: arr })); }} placeholder="XXXX-XXXX-1234" />
                        {form.account_numbers.length > 1 && <button onClick={() => setForm(p => ({ ...p, account_numbers: p.account_numbers.filter((_, j) => j !== i) }))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    ))}
                    <button onClick={() => setForm(p => ({ ...p, account_numbers: [...p.account_numbers, ''] }))} className="text-xs text-primary-blue mt-1">+ Add Account</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Relief & Review</h3>
                  <div>
                    <Label className="mb-2 block">Relief Requested</Label>
                    <div className="border rounded-lg p-3 space-y-2">
                      {RELIEF_OPTIONS.map(r => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1">
                          <input type="checkbox" checked={form.relief_requested.includes(r)} onChange={() => toggleRelief(r)} />
                          <span className="text-sm">{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Actual Damages ($)</Label><Input value={form.actual_damages} onChange={e => setForm(p => ({ ...p, actual_damages: e.target.value }))} placeholder="10,000" /></div>
                    <div><Label>Status</Label>
                      <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                        {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Prepared Complaint Preview */}
                  <div className="border-2 border-gray-300 rounded-xl bg-white mt-6" data-testid="complaint-preview">
                    <div className="flex items-center justify-between bg-gray-100 px-5 py-3 rounded-t-xl border-b">
                      <h4 className="font-bold text-gray-900 text-sm">Prepared Complaint Preview</h4>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                        const doc = document.getElementById('complaint-doc-text')?.innerText || '';
                        const blob = new Blob([doc], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `ProSe_Complaint_${(form.client_name || 'Client').replace(/\s+/g, '_')}.txt`; a.click(); URL.revokeObjectURL(url);
                        toast.success('Complaint downloaded');
                      }} data-testid="download-complaint-btn">Download</Button>
                    </div>
                    <div id="complaint-doc-text" className="p-6 font-mono text-xs leading-relaxed text-gray-800 max-h-[400px] overflow-y-auto whitespace-pre-wrap">
{`IN THE ${(form.court_type || 'UNITED STATES DISTRICT COURT').toUpperCase()}
${form.court_district ? `FOR THE ${form.court_district.toUpperCase()}` : `FOR THE DISTRICT OF ${(form.filing_state || '________').toUpperCase()}`}

${(form.client_name || '________').toUpperCase()},
    Plaintiff,
                                        Case No. ________________
v.
                                        COMPLAINT AND DEMAND
${(form.defendant_name || '________').toUpperCase()},             FOR JURY TRIAL
    Defendant.
${'_'.repeat(50)}

COMPLAINT

    Plaintiff ${form.client_name || '________'}, residing at ${form.client_address || '________'}, ${form.client_city || '________'}, ${form.client_state || '________'} ${form.client_zip || '________'}, appearing pro se, respectfully submits this Complaint against Defendant ${form.defendant_name || '________'}${form.defendant_type ? ` (${form.defendant_type})` : ''}${form.defendant_address ? `, located at ${form.defendant_address}` : ''}, and states as follows:

PARTIES

    1. Plaintiff ${form.client_name || '________'} is a natural person and "consumer" as defined under applicable federal and state law, residing in ${form.client_city || '________'}, ${form.client_state || '________'} ${form.client_zip || '________'}.

    2. Defendant ${form.defendant_name || '________'} is a ${form.defendant_type || 'entity'} that conducts business in the State of ${form.filing_state || '________'} and is subject to the jurisdiction of this Court.

JURISDICTION AND VENUE

    3. This Court has jurisdiction over this matter pursuant to ${form.violation_types.includes('fcra') ? '15 U.S.C. § 1681p (FCRA)' : ''}${form.violation_types.includes('fdcpa') ? `${form.violation_types.includes('fcra') ? ', ' : ''}15 U.S.C. § 1692k(d) (FDCPA)` : ''}${form.violation_types.includes('croa') ? `${form.violation_types.length > 1 ? ', ' : ''}15 U.S.C. § 1679h (CROA)` : ''}${form.violation_types.includes('tila') ? `${form.violation_types.length > 1 ? ', ' : ''}15 U.S.C. § 1640 (TILA)` : ''}${form.violation_types.includes('tcpa') ? `${form.violation_types.length > 1 ? ', ' : ''}47 U.S.C. § 227(b)(3) (TCPA)` : ''}${form.violation_types.includes('state_consumer_protection') || form.violation_types.includes('state_udap') ? `${form.violation_types.length > 1 ? ', and ' : ''}the consumer protection laws of the State of ${form.filing_state || '________'}` : ''}, and 28 U.S.C. § 1331 (federal question jurisdiction).

    4. Venue is proper in this district pursuant to 28 U.S.C. § 1391(b) because the events giving rise to this claim occurred in this judicial district.

FACTUAL ALLEGATIONS

    5. ${form.claim_description || 'Plaintiff alleges that Defendant violated their consumer protection rights as described herein.'}

${form.credit_bureaus_involved.length > 0 ? `    6. The following credit reporting agencies are involved in the facts alleged herein: ${form.credit_bureaus_involved.join(', ')}.` : ''}

${form.account_numbers.filter(a => a).length > 0 ? `    ${form.credit_bureaus_involved.length > 0 ? '7' : '6'}. The following account number(s) are at issue: ${form.account_numbers.filter(a => a).join(', ')}.` : ''}

CAUSES OF ACTION

${form.violation_types.map((v, i) => {
  const vType = violationTypes.find(t => t.id === v);
  return `COUNT ${i + 1}: VIOLATION OF ${(vType?.label || v).toUpperCase()}

    ${8 + i}. Plaintiff re-alleges and incorporates by reference all preceding paragraphs.

    ${9 + i}. Defendant's conduct as alleged herein constitutes a violation of the ${vType?.label || v} (${vType?.statutes?.join(', ') || ''}).`;
}).join('\n\n')}

DAMAGES AND HARM

    Plaintiff has suffered the following damages as a direct result of Defendant's violations:

${form.harm_description ? `    ${form.harm_description}` : '    [Describe specific harm suffered]'}

PRAYER FOR RELIEF

    WHEREFORE, Plaintiff respectfully requests that this Court:

${form.relief_requested.map((r, i) => `    ${String.fromCharCode(97 + i)}. Award ${r};`).join('\n')}
    ${String.fromCharCode(97 + form.relief_requested.length)}. Grant such other and further relief as this Court deems just and proper.

DEMAND FOR JURY TRIAL

    Plaintiff hereby demands a trial by jury on all issues so triable.

Respectfully submitted,


____________________________________
${form.client_name || '________'}
Pro Se Plaintiff
${form.client_address || '________'}
${form.client_city || '________'}, ${form.client_state || '________'} ${form.client_zip || '________'}
${form.client_phone || '________'}
${form.client_email || '________'}

Date: ________________`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t">
              <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : (setShowForm(false), setEditCase(null))} data-testid="prose-back-btn">
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <div className="flex gap-2">
                {step < 4 ? (
                  <Button onClick={() => setStep(step + 1)} data-testid="prose-next-btn">Next Step</Button>
                ) : (
                  <Button onClick={handleSubmit} data-testid="prose-submit-btn">{editCase ? 'Update Case' : 'Create Pro Se Filing'}</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProSeCenter;
