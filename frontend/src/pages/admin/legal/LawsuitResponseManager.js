import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, Scale, FileText, Trash2, ChevronDown, ChevronRight, X, MessageSquare, Calendar, AlertTriangle, Gavel, Building2, User, Clock, Filter, StickyNote } from 'lucide-react';
import api from '../../../utils/api';

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Answer Drafted': 'bg-purple-100 text-purple-800',
  'Answer Filed': 'bg-indigo-100 text-indigo-800',
  'Motion to Dismiss Filed': 'bg-teal-100 text-teal-800',
  'Discovery Phase': 'bg-orange-100 text-orange-800',
  'Mediation/Settlement': 'bg-cyan-100 text-cyan-800',
  'Trial Pending': 'bg-red-100 text-red-800',
  'Dismissed': 'bg-green-100 text-green-800',
  'Settled': 'bg-green-100 text-green-800',
  'Judgment Entered': 'bg-gray-100 text-gray-800',
  'Appeal Filed': 'bg-pink-100 text-pink-800',
  'Closed': 'bg-gray-200 text-gray-600',
};

const LawsuitResponseManager = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [detailCase, setDetailCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dismissalReasons, setDismissalReasons] = useState([]);
  const [caseStatuses, setCaseStatuses] = useState([]);
  const [courtTypes, setCourtTypes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [filingForm, setFilingForm] = useState({ title: '', filing_type: '', date_filed: '', description: '' });
  const [showFiling, setShowFiling] = useState(false);

  const [form, setForm] = useState({
    defendant_name: '', plaintiff_name: '', case_number: '', court_type: 'State Court',
    court_name: '', state: '', county: '', date_filed: '', date_served: '',
    answer_due_date: '', dismissal_reasons: [], status: 'New', plaintiff_attorney: '',
    plaintiff_attorney_address: '', claim_amount: '', account_number: '', original_creditor: '',
  });

  const loadCases = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/lawsuit-response/cases${params}`);
      setCases(res.data.cases || []);
    } catch { toast.error('Failed to load cases'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => {
    loadCases();
    api.get('/lawsuit-response/dismissal-reasons').then(r => setDismissalReasons(r.data.reasons || [])).catch(() => {});
    api.get('/lawsuit-response/case-statuses').then(r => setCaseStatuses(r.data.statuses || [])).catch(() => {});
    api.get('/lawsuit-response/court-types').then(r => setCourtTypes(r.data.types || [])).catch(() => {});
  }, [loadCases]);

  const filtered = cases.filter(c =>
    (c.defendant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.plaintiff_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.case_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCase) {
        await api.put(`/lawsuit-response/cases/${editCase.id}`, form);
        toast.success('Case updated');
      } else {
        await api.post('/lawsuit-response/cases', form);
        toast.success('Case created');
      }
      setShowForm(false);
      setEditCase(null);
      resetForm();
      loadCases();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
  };

  const resetForm = () => setForm({
    defendant_name: '', plaintiff_name: '', case_number: '', court_type: 'State Court',
    court_name: '', state: '', county: '', date_filed: '', date_served: '',
    answer_due_date: '', dismissal_reasons: [], status: 'New', plaintiff_attorney: '',
    plaintiff_attorney_address: '', claim_amount: '', account_number: '', original_creditor: '',
  });

  const openEdit = (c) => {
    setForm({
      defendant_name: c.defendant_name || '', plaintiff_name: c.plaintiff_name || '',
      case_number: c.case_number || '', court_type: c.court_type || 'State Court',
      court_name: c.court_name || '', state: c.state || '', county: c.county || '',
      date_filed: c.date_filed || '', date_served: c.date_served || '',
      answer_due_date: c.answer_due_date || '', dismissal_reasons: c.dismissal_reasons || [],
      status: c.status || 'New', plaintiff_attorney: c.plaintiff_attorney || '',
      plaintiff_attorney_address: c.plaintiff_attorney_address || '',
      claim_amount: c.claim_amount || '', account_number: c.account_number || '',
      original_creditor: c.original_creditor || '',
    });
    setEditCase(c);
    setShowForm(true);
  };

  const deleteCase = async (id) => {
    if (!window.confirm('Delete this case?')) return;
    try { await api.delete(`/lawsuit-response/cases/${id}`); toast.success('Deleted'); loadCases(); setDetailCase(null); }
    catch { toast.error('Failed'); }
  };

  const addNote = async () => {
    if (!noteText.trim() || !detailCase) return;
    try {
      const res = await api.post(`/lawsuit-response/cases/${detailCase.id}/notes`, { content: noteText });
      setDetailCase(prev => ({ ...prev, notes: [...(prev.notes || []), res.data] }));
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed'); }
  };

  const addFiling = async () => {
    if (!filingForm.title || !detailCase) return;
    try {
      const res = await api.post(`/lawsuit-response/cases/${detailCase.id}/filings`, filingForm);
      setDetailCase(prev => ({ ...prev, filings: [...(prev.filings || []), res.data] }));
      setFilingForm({ title: '', filing_type: '', date_filed: '', description: '' });
      setShowFiling(false);
      toast.success('Filing added');
    } catch { toast.error('Failed'); }
  };

  const toggleDismissal = (id) => {
    setForm(prev => ({
      ...prev,
      dismissal_reasons: prev.dismissal_reasons.includes(id)
        ? prev.dismissal_reasons.filter(r => r !== id)
        : [...prev.dismissal_reasons, id]
    }));
  };

  // Detail view
  if (detailCase) {
    const reasons = dismissalReasons.filter(r => (detailCase.dismissal_reasons || []).includes(r.id));
    return (
      <div className="space-y-6" data-testid="case-detail-view">
        <div className="flex items-center justify-between">
          <button onClick={() => setDetailCase(null)} className="text-sm text-primary-blue hover:underline flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Cases
          </button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { openEdit(detailCase); setDetailCase(null); }} data-testid="edit-case-btn">Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => deleteCase(detailCase.id)} data-testid="delete-case-btn">Delete</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900" data-testid="case-title">{detailCase.case_number || 'No Case Number'}</h2>
              <p className="text-sm text-gray-500 mt-1">{detailCase.court_type} — {detailCase.court_name || 'Court not specified'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[detailCase.status] || 'bg-gray-100 text-gray-800'}`}>
              {detailCase.status}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" />Defendant (Consumer)</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">{detailCase.defendant_name || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="w-3 h-3" />Plaintiff</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">{detailCase.plaintiff_name || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Date Filed</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">{detailCase.date_filed || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Date Served</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">{detailCase.date_served || '—'}</p>
            </div>
          </div>

          {detailCase.answer_due_date && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-800"><strong>Answer Due:</strong> {detailCase.answer_due_date}</p>
            </div>
          )}

          {reasons.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Dismissal Grounds</h3>
              <div className="flex flex-wrap gap-2">
                {reasons.map(r => (
                  <span key={r.id} className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-medium" title={r.description}>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(detailCase.plaintiff_attorney || detailCase.claim_amount || detailCase.original_creditor) && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {detailCase.plaintiff_attorney && <div><p className="text-xs text-gray-500">Plaintiff Attorney</p><p className="text-sm font-medium">{detailCase.plaintiff_attorney}</p></div>}
              {detailCase.claim_amount && <div><p className="text-xs text-gray-500">Claim Amount</p><p className="text-sm font-medium">${detailCase.claim_amount}</p></div>}
              {detailCase.original_creditor && <div><p className="text-xs text-gray-500">Original Creditor</p><p className="text-sm font-medium">{detailCase.original_creditor}</p></div>}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="case-notes">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><StickyNote className="w-4 h-4" /> Notes</h3>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {(detailCase.notes || []).length === 0 ? (
              <p className="text-sm text-gray-400 italic">No notes yet.</p>
            ) : (detailCase.notes || []).map(n => (
              <div key={n.id} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.content}</p>
                <p className="text-xs text-gray-400 mt-2">{n.author} — {new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." className="flex-1" data-testid="note-input" onKeyDown={e => e.key === 'Enter' && addNote()} />
            <Button onClick={addNote} size="sm" disabled={!noteText.trim()} data-testid="add-note-btn">Add</Button>
          </div>
        </div>

        {/* Filings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="case-filings">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4" /> Filings</h3>
            <Button size="sm" variant="outline" onClick={() => setShowFiling(!showFiling)} data-testid="add-filing-btn"><Plus className="w-4 h-4 mr-1" /> Add Filing</Button>
          </div>
          {showFiling && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <Input value={filingForm.title} onChange={e => setFilingForm(p => ({ ...p, title: e.target.value }))} placeholder="Filing Title" data-testid="filing-title" />
              <div className="grid grid-cols-2 gap-3">
                <select value={filingForm.filing_type} onChange={e => setFilingForm(p => ({ ...p, filing_type: e.target.value }))} className="border rounded-md px-3 py-2 text-sm" data-testid="filing-type">
                  <option value="">Select Type</option>
                  <option value="Answer">Answer</option><option value="Motion to Dismiss">Motion to Dismiss</option>
                  <option value="Motion for Summary Judgment">Motion for Summary Judgment</option><option value="Affidavit">Affidavit</option>
                  <option value="Discovery Request">Discovery Request</option><option value="Discovery Response">Discovery Response</option>
                  <option value="Subpoena">Subpoena</option><option value="Brief/Memorandum">Brief/Memorandum</option>
                  <option value="Stipulation">Stipulation</option><option value="Other">Other</option>
                </select>
                <Input type="date" value={filingForm.date_filed} onChange={e => setFilingForm(p => ({ ...p, date_filed: e.target.value }))} data-testid="filing-date" />
              </div>
              <Input value={filingForm.description} onChange={e => setFilingForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" data-testid="filing-desc" />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowFiling(false)}>Cancel</Button>
                <Button size="sm" onClick={addFiling} disabled={!filingForm.title} data-testid="save-filing-btn">Save Filing</Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {(detailCase.filings || []).length === 0 ? (
              <p className="text-sm text-gray-400 italic">No filings recorded.</p>
            ) : (detailCase.filings || []).map(f => (
              <div key={f.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition" data-testid={`filing-${f.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.filing_type} — Filed: {f.date_filed || 'No date'} — by {f.filed_by}</p>
                    {f.description && <p className="text-sm text-gray-600 mt-2 bg-white p-3 rounded border border-gray-100">{f.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-3 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                      const content = `CASE FILING\n${'='.repeat(50)}\nTitle: ${f.title}\nType: ${f.filing_type}\nDate Filed: ${f.date_filed || 'N/A'}\nFiled By: ${f.filed_by}\n\nCase: ${detailCase.case_number || 'N/A'}\nDefendant: ${detailCase.defendant_name}\nPlaintiff: ${detailCase.plaintiff_name}\nCourt: ${detailCase.court_type} - ${detailCase.court_name || ''}\n\nDescription:\n${f.description || 'N/A'}\n\nDismissal Grounds:\n${(detailCase.dismissal_reasons || []).map(rid => dismissalReasons.find(r => r.id === rid)?.label || rid).join('\n- ')}\n`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = `${f.title.replace(/\s+/g, '_')}_${f.date_filed || 'undated'}.txt`; a.click(); URL.revokeObjectURL(url);
                      toast.success('Filing downloaded');
                    }} data-testid={`download-filing-${f.id}`}>
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                      const subject = encodeURIComponent(`Filing: ${f.title} — Case ${detailCase.case_number || ''}`);
                      const body = encodeURIComponent(`Dear Client,\n\nPlease find the details of the filing below:\n\nFiling: ${f.title}\nType: ${f.filing_type}\nDate: ${f.date_filed || 'N/A'}\n\nCase: ${detailCase.case_number || 'N/A'}\nDefendant: ${detailCase.defendant_name}\nPlaintiff: ${detailCase.plaintiff_name}\nCourt: ${detailCase.court_type} - ${detailCase.court_name || ''}\n\nDescription:\n${f.description || 'N/A'}\n\nDismissal Grounds Requested:\n${(detailCase.dismissal_reasons || []).map(rid => '- ' + (dismissalReasons.find(r => r.id === rid)?.label || rid)).join('\n')}\n\nPlease contact us if you have any questions.\n\nBest regards,\nCredlocity Legal Team`);
                      window.open(`mailto:?subject=${subject}&body=${body}`);
                    }} data-testid={`email-filing-${f.id}`}>
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="lawsuit-response-manager">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Scale className="w-6 h-6 text-primary-blue" /> Lawsuit Response Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage consumer lawsuit responses, track filings, and prepare dismissal motions.</p>
        </div>
        <Button onClick={() => { resetForm(); setEditCase(null); setShowForm(true); }} data-testid="new-case-btn">
          <Plus className="w-4 h-4 mr-2" /> New Case
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search cases..." className="pl-9" data-testid="search-cases" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm" data-testid="status-filter">
          <option value="">All Statuses</option>
          {caseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No cases found. Click "New Case" to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full" data-testid="cases-table">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Case #</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Defendant (Consumer)</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Plaintiff</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Court</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Filed</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailCase(c)} data-testid={`case-row-${c.id}`}>
                  <td className="px-4 py-3 text-sm font-medium text-primary-blue">{c.case_number || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{c.defendant_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.plaintiff_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.court_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.date_filed || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-800'}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-xs text-gray-500 hover:text-primary-blue mr-3">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 overflow-y-auto" data-testid="case-form-modal">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 mb-10">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editCase ? 'Edit Case' : 'New Lawsuit Response Case'}</h2>
              <button onClick={() => { setShowForm(false); setEditCase(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Defendant Name (Consumer)</Label>
                  <Input value={form.defendant_name} onChange={e => setForm(p => ({ ...p, defendant_name: e.target.value }))} required placeholder="John Doe" data-testid="form-defendant" />
                </div>
                <div>
                  <Label>Plaintiff Name</Label>
                  <Input value={form.plaintiff_name} onChange={e => setForm(p => ({ ...p, plaintiff_name: e.target.value }))} required placeholder="LVNV Funding LLC" data-testid="form-plaintiff" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Case Number</Label>
                  <Input value={form.case_number} onChange={e => setForm(p => ({ ...p, case_number: e.target.value }))} placeholder="2024-CV-12345" data-testid="form-case-number" />
                </div>
                <div>
                  <Label>Court Type</Label>
                  <select value={form.court_type} onChange={e => setForm(p => ({ ...p, court_type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="form-court-type">
                    {courtTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Court Name</Label>
                  <Input value={form.court_name} onChange={e => setForm(p => ({ ...p, court_name: e.target.value }))} placeholder="Superior Court of NJ" data-testid="form-court-name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="New Jersey" data-testid="form-state" />
                </div>
                <div>
                  <Label>County</Label>
                  <Input value={form.county} onChange={e => setForm(p => ({ ...p, county: e.target.value }))} placeholder="Camden County" data-testid="form-county" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date Filed</Label>
                  <Input type="date" value={form.date_filed} onChange={e => setForm(p => ({ ...p, date_filed: e.target.value }))} data-testid="form-date-filed" />
                </div>
                <div>
                  <Label>Date Served</Label>
                  <Input type="date" value={form.date_served} onChange={e => setForm(p => ({ ...p, date_served: e.target.value }))} data-testid="form-date-served" />
                </div>
                <div>
                  <Label>Answer Due Date</Label>
                  <Input type="date" value={form.answer_due_date} onChange={e => setForm(p => ({ ...p, answer_due_date: e.target.value }))} data-testid="form-answer-due" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Plaintiff Attorney</Label>
                  <Input value={form.plaintiff_attorney} onChange={e => setForm(p => ({ ...p, plaintiff_attorney: e.target.value }))} placeholder="Attorney name" data-testid="form-attorney" />
                </div>
                <div>
                  <Label>Claim Amount ($)</Label>
                  <Input value={form.claim_amount} onChange={e => setForm(p => ({ ...p, claim_amount: e.target.value }))} placeholder="5,000.00" data-testid="form-claim-amount" />
                </div>
                <div>
                  <Label>Original Creditor</Label>
                  <Input value={form.original_creditor} onChange={e => setForm(p => ({ ...p, original_creditor: e.target.value }))} placeholder="Bank of America" data-testid="form-original-creditor" />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="form-status">
                  {caseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <Label className="mb-2 block">Grounds for Dismissal (select all that apply)</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-1" data-testid="dismissal-reasons-list">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Common Grounds</p>
                  {dismissalReasons.filter(r => r.category === 'common').map(r => (
                    <label key={r.id} className="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                      <input type="checkbox" checked={form.dismissal_reasons.includes(r.id)} onChange={() => toggleDismissal(r.id)} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-800">{r.label}</span>
                        <p className="text-xs text-gray-500">{r.description}</p>
                      </div>
                    </label>
                  ))}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-1">Uncommon / Specialized Grounds</p>
                  {dismissalReasons.filter(r => r.category === 'uncommon').map(r => (
                    <label key={r.id} className="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                      <input type="checkbox" checked={form.dismissal_reasons.includes(r.id)} onChange={() => toggleDismissal(r.id)} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-800">{r.label}</span>
                        <p className="text-xs text-gray-500">{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditCase(null); }}>Cancel</Button>
                <Button type="submit" data-testid="save-case-btn">{editCase ? 'Update Case' : 'Create Case'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawsuitResponseManager;
