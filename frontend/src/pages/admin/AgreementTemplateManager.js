import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { FileText, Plus, Trash2, Edit2, X, Check, Copy, Download, Eye, EyeOff, ChevronDown, ChevronRight, Loader2, FileSignature, Database, ExternalLink, PanelLeftClose, PanelLeft } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Attorney Partner', 'Credit Repair', 'Debt Collection', 'Identity Theft', 'General', 'Compliance'];

const FIELD_TYPES = ['text', 'date', 'number', 'textarea', 'select'];

const AgreementTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [showGenerate, setShowGenerate] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [seeding, setSeeding] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', category: 'Attorney Partner', content: '', fields: [], is_active: true
  });

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/agreements/templates`);
      if (res.ok) setTemplates(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const resetForm = () => {
    setForm({ name: '', description: '', category: 'Attorney Partner', content: '', fields: [], is_active: true });
    setEditingTemplate(null);
    setShowEditor(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Template name is required');
    if (!form.content.trim()) return toast.error('Template content is required');

    const payload = { ...form, fields: form.fields.map(f => ({ ...f })) };

    try {
      let res;
      if (editingTemplate) {
        res = await fetch(`${API}/api/agreements/templates/${editingTemplate.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API}/api/agreements/templates`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
      }
      if (res.ok) {
        toast.success(editingTemplate ? 'Template updated' : 'Template created');
        resetForm();
        fetchTemplates();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Save failed');
      }
    } catch (e) { toast.error('Save failed'); }
  };

  const handleEdit = (tpl) => {
    setForm({
      name: tpl.name, description: tpl.description || '', category: tpl.category || 'General',
      content: tpl.content, fields: tpl.fields || [], is_active: tpl.is_active !== false
    });
    setEditingTemplate(tpl);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/agreements/templates/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Template deleted'); fetchTemplates(); }
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleDuplicate = async (tpl) => {
    const payload = {
      name: `${tpl.name} (Copy)`, description: tpl.description || '',
      category: tpl.category, content: tpl.content,
      fields: tpl.fields || [], is_active: false
    };
    try {
      const res = await fetch(`${API}/api/agreements/templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) { toast.success('Template duplicated'); fetchTemplates(); }
    } catch (e) { toast.error('Duplicate failed'); }
  };

  const handleToggleActive = async (tpl) => {
    try {
      const res = await fetch(`${API}/api/agreements/templates/${tpl.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !tpl.is_active })
      });
      if (res.ok) { toast.success(tpl.is_active ? 'Deactivated' : 'Activated'); fetchTemplates(); }
    } catch (e) { toast.error('Update failed'); }
  };

  const openGenerate = (tpl) => {
    const defaults = {};
    (tpl.fields || []).forEach(f => { defaults[f.key] = f.default_value || ''; });
    setFieldValues(defaults);
    setShowGenerate(tpl);
  };

  // Live preview: replace placeholders with current field values
  const previewContent = useMemo(() => {
    if (!showGenerate) return '';
    let content = showGenerate.content || '';
    Object.entries(fieldValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value || `[${key.replace(/_/g, ' ')}]`);
    });
    // Replace any remaining unfilled placeholders with styled markers
    content = content.replace(/\{\{(\w+)\}\}/g, (_, k) => `[${k.replace(/_/g, ' ')}]`);
    return content;
  }, [showGenerate, fieldValues]);

  // Render preview content as styled HTML
  const renderPreviewHTML = (text) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;
      if (trimmed.startsWith('## '))
        return <h3 key={i} className="text-sm font-bold text-[#1a365d] mt-4 mb-1 uppercase tracking-wide">{trimmed.slice(3)}</h3>;
      if (trimmed.startsWith('# '))
        return <h2 key={i} className="text-base font-bold text-[#1a365d] mt-3 mb-1">{trimmed.slice(2)}</h2>;
      if (trimmed.startsWith('SIGNATURE:') || trimmed.startsWith('___'))
        return <p key={i} className="mt-4 text-xs text-gray-500 border-b border-gray-300 pb-1">{trimmed}</p>;
      // Handle **bold** markers
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-xs leading-relaxed text-gray-700">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
        </p>
      );
    });
  };

  const handlePreviewInTab = async () => {
    if (!showGenerate) return;
    setGenerating('preview');
    try {
      const res = await fetch(`${API}/api/agreements/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: showGenerate.id, field_values: fieldValues })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.success('PDF opened in new tab');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Preview failed');
      }
    } catch (e) { toast.error('Preview failed'); }
    setGenerating(null);
  };

  const handleGeneratePDF = async () => {
    if (!showGenerate) return;
    setGenerating(showGenerate.id);
    try {
      const res = await fetch(`${API}/api/agreements/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: showGenerate.id, field_values: fieldValues })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${showGenerate.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('PDF generated and downloaded');
        setShowGenerate(null);
        fetchTemplates();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Generation failed');
      }
    } catch (e) { toast.error('PDF generation failed'); }
    setGenerating(null);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API}/api/agreements/templates/seed`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Seeded ${data.seeded} templates`);
        fetchTemplates();
      }
    } catch (e) { toast.error('Seed failed'); }
    setSeeding(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/agreements/history`);
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error(e); }
    setHistoryOpen(true);
  };

  const addField = () => {
    setForm(prev => ({
      ...prev, fields: [...prev.fields, { key: '', label: '', field_type: 'text', required: true, default_value: '', options: [], placeholder: '' }]
    }));
  };

  const updateField = (idx, key, val) => {
    setForm(prev => {
      const fields = [...prev.fields];
      fields[idx] = { ...fields[idx], [key]: val };
      if (key === 'label' && !fields[idx].key) {
        fields[idx].key = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      }
      return { ...prev, fields };
    });
  };

  const removeField = (idx) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6" data-testid="agreement-template-manager">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">PDF Agreement Templates</h1>
          <p className="text-sm text-gray-500 mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''} | Create & manage legal agreement templates for attorney partners</p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={handleSeed} disabled={seeding} data-testid="seed-templates-btn">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Seed Defaults
            </Button>
          )}
          <Button variant="outline" onClick={fetchHistory} data-testid="view-history-btn">
            <FileText className="w-4 h-4 mr-2" /> History
          </Button>
          <Button onClick={() => { resetForm(); setShowEditor(true); }} data-testid="create-template-btn">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6" data-testid="template-editor">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingTemplate ? 'Edit Template' : 'Create Template'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Template Name *</label>
                <input data-testid="template-name-input" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Attorney-Client Agreement" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select data-testid="template-category-select" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
              <input data-testid="template-description-input" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this template" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Template Content * <span className="text-xs text-gray-400 ml-2">Use {'{{field_name}}'} for dynamic placeholders</span>
              </label>
              <textarea data-testid="template-content-textarea" className="w-full border rounded-lg px-3 py-2 text-sm font-mono min-h-[300px]"
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder={"## AGREEMENT TITLE\n\nThis agreement is entered into by {{client_name}} on {{agreement_date}}.\n\n## TERMS\n\n..."} />
            </div>

            {/* Fields Configuration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Form Fields</label>
                <Button type="button" variant="outline" size="sm" onClick={addField} data-testid="add-field-btn">
                  <Plus className="w-3 h-3 mr-1" /> Add Field
                </Button>
              </div>
              {form.fields.length > 0 && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {form.fields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2" data-testid={`field-row-${idx}`}>
                      <input className="flex-1 border rounded px-2 py-1.5 text-sm" placeholder="Label" value={field.label}
                        onChange={e => updateField(idx, 'label', e.target.value)} />
                      <input className="w-32 border rounded px-2 py-1.5 text-sm font-mono" placeholder="key" value={field.key}
                        onChange={e => updateField(idx, 'key', e.target.value)} />
                      <select className="w-24 border rounded px-2 py-1.5 text-sm" value={field.field_type}
                        onChange={e => updateField(idx, 'field_type', e.target.value)}>
                        {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                        <input type="checkbox" checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} />Req
                      </label>
                      <input className="w-24 border rounded px-2 py-1.5 text-sm" placeholder="Default" value={field.default_value || ''}
                        onChange={e => updateField(idx, 'default_value', e.target.value)} />
                      <button type="button" onClick={() => removeField(idx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Fields are auto-detected from {'{{placeholders}}'} in your content when saved. You can also add them manually above.</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" data-testid="save-template-btn">
                <Check className="w-4 h-4 mr-2" /> {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Generate PDF Modal - Split View with Live Preview */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="generate-pdf-modal">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Generate PDF Agreement</h2>
                <p className="text-sm text-gray-500">{showGenerate.name}</p>
              </div>
              <button onClick={() => setShowGenerate(null)} className="text-gray-400 hover:text-gray-600" data-testid="close-generate-modal"><X className="w-5 h-5" /></button>
            </div>

            {/* Split View: Form | Preview */}
            <div className="flex flex-1 min-h-0">
              {/* Left: Form Fields */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6" data-testid="generate-form-panel">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Fill in Details</h3>
                <div className="space-y-3">
                  {(showGenerate.fields || []).map(field => (
                    <div key={field.key}>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.field_type === 'textarea' ? (
                        <textarea data-testid={`generate-field-${field.key}`} className="w-full border rounded-lg px-3 py-2 text-sm min-h-[70px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={fieldValues[field.key] || ''} placeholder={field.placeholder || ''}
                          onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))} />
                      ) : field.field_type === 'select' ? (
                        <select data-testid={`generate-field-${field.key}`} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          value={fieldValues[field.key] || ''} onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}>
                          <option value="">Select...</option>
                          {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input data-testid={`generate-field-${field.key}`}
                          type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={fieldValues[field.key] || ''}
                          placeholder={field.placeholder || ''} onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="w-1/2 overflow-y-auto bg-gray-50" data-testid="live-preview-panel">
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-3 z-10">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> Live Preview
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[500px]" data-testid="preview-document">
                    {/* Document Header */}
                    <div className="text-center mb-4">
                      <h1 className="text-base font-bold text-[#1a365d] tracking-wider">CREDLOCITY BUSINESS GROUP LLC</h1>
                      <p className="text-xs text-gray-500 mt-1">{showGenerate.name}</p>
                      <hr className="mt-3 border-[#1a365d]" />
                    </div>
                    {/* Metadata */}
                    <div className="text-xs text-gray-600 space-y-0.5 mb-4">
                      <p><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {fieldValues.client_name && <p><strong>Client:</strong> {fieldValues.client_name}</p>}
                      {fieldValues.attorney_name && <p><strong>Attorney:</strong> {fieldValues.attorney_name}</p>}
                    </div>
                    {/* Content */}
                    <div className="space-y-0.5">
                      {renderPreviewHTML(previewContent)}
                    </div>
                    {/* Footer */}
                    <div className="mt-8 pt-3 border-t border-gray-300 text-center">
                      <p className="text-[10px] text-gray-400">Credlocity Business Group LLC | 1500 Chestnut St, Suite 2, Philadelphia, PA 19102</p>
                      <p className="text-[10px] text-gray-400">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | This document is confidential</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
              <Button variant="outline" onClick={() => setShowGenerate(null)}>Cancel</Button>
              <Button variant="outline" onClick={handlePreviewInTab} disabled={!!generating} data-testid="preview-in-tab-btn">
                {generating === 'preview' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                Preview in New Tab
              </Button>
              <Button onClick={handleGeneratePDF} disabled={!!generating} data-testid="generate-pdf-btn">
                {generating === showGenerate.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Generate & Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {historyOpen && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6" data-testid="generation-history-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generation History</h2>
            <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No agreements generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Template</th><th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Attorney</th><th className="pb-2 font-medium">Generated</th>
                </tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-2">{h.template_name}</td>
                      <td className="py-2">{h.field_values?.client_name || '-'}</td>
                      <td className="py-2">{h.field_values?.attorney_name || '-'}</td>
                      <td className="py-2 text-gray-500">{new Date(h.generated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 && !showEditor ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No Agreement Templates</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Create your first template or seed default ones</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleSeed} disabled={seeding} data-testid="empty-seed-btn">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />} Seed Default Templates
            </Button>
            <Button onClick={() => setShowEditor(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow" data-testid={`template-card-${tpl.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{tpl.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${tpl.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {tpl.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">{tpl.category}</span>
                  </div>
                  {tpl.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{tpl.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{(tpl.fields || []).length} fields</span>
                    <span>{tpl.generated_count || 0} generated</span>
                    <span>Created {new Date(tpl.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <Button variant="default" size="sm" onClick={() => openGenerate(tpl)} disabled={!tpl.is_active} data-testid={`generate-btn-${tpl.id}`}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Generate PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(tpl)} data-testid={`edit-btn-${tpl.id}`}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(tpl)} data-testid={`duplicate-btn-${tpl.id}`}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(tpl)} data-testid={`toggle-btn-${tpl.id}`}>
                    {tpl.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tpl.id)} className="text-red-500 hover:text-red-700" data-testid={`delete-btn-${tpl.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgreementTemplateManager;
