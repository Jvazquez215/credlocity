import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  MapPin, Plus, Edit2, Trash2, Eye, Search, Loader2, 
  Globe, ChevronDown, ChevronRight, Sparkles, ExternalLink, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;
const getToken = () => localStorage.getItem('auth_token');

const LocalLandingPagesManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/seo/local-pages`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setPages(data.pages || []);
    } catch { toast.error('Failed to load local pages'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API}/api/seo/local-pages/seed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      toast.success(`Seeded ${data.seeded} local pages`);
      fetchPages();
    } catch { toast.error('Failed to seed pages'); }
    finally { setSeeding(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this local landing page?')) return;
    try {
      await fetch(`${API}/api/seo/local-pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success('Page deleted');
      fetchPages();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = pages.filter(p =>
    `${p.city} ${p.state} ${p.slug}`.toLowerCase().includes(search.toLowerCase())
  );

  if (editing) {
    return <PageEditor page={editing} onBack={() => { setEditing(null); fetchPages(); }} />;
  }

  return (
    <div className="space-y-6" data-testid="local-landing-pages-manager">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-600" />
            Local Landing Pages
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage city-specific credit repair landing pages for local SEO</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seeding} data-testid="seed-local-pages-btn">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
            Seed Default Cities
          </Button>
          <Button onClick={() => setEditing({ isNew: true })} data-testid="add-local-page-btn">
            <Plus className="w-4 h-4 mr-1" /> Add City
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by city, state, or slug..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          data-testid="local-pages-search"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <MapPin className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No local landing pages yet</h3>
          <p className="text-sm text-slate-400 mt-1">Click "Seed Default Cities" to create pages for 10 cities, or add one manually.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm" data-testid="local-pages-table">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">City</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">State</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">FAQs</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(page => (
                <tr key={page.id} className="hover:bg-slate-50/50 transition" data-testid={`local-page-row-${page.slug}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{page.city}</td>
                  <td className="px-4 py-3 text-slate-600">{page.state}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">/{page.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{(page.faqs || []).length}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      page.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {page.status === 'published' && <CheckCircle className="w-3 h-3" />}
                      {page.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                        title="Preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setEditing(page)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition"
                        data-testid={`edit-local-page-${page.slug}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition"
                        data-testid={`delete-local-page-${page.slug}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// ==================== PAGE EDITOR ====================

const PageEditor = ({ page, onBack }) => {
  const isNew = page.isNew;
  const [form, setForm] = useState({
    city: page.city || '',
    state: page.state || '',
    slug: page.slug || '',
    headline: page.headline || '',
    description: page.description || '',
    content: page.content || '',
    meta_title: page.meta_title || '',
    meta_description: page.meta_description || '',
    keywords: page.keywords || '',
    services: page.services || [],
    faqs: page.faqs || [],
    status: page.status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState('');
  const [faqOpen, setFaqOpen] = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Auto-generate slug from city
  useEffect(() => {
    if (isNew && form.city) {
      const slug = `credit-repair-${form.city.toLowerCase().replace(/\s+/g, '-')}`;
      handleChange('slug', slug);
      if (!form.headline) handleChange('headline', `Credit Repair Services in ${form.city}, ${form.state}`);
    }
  }, [form.city, form.state]);

  const handleSave = async () => {
    if (!form.city || !form.state) { toast.error('City and State are required'); return; }
    setSaving(true);
    try {
      const url = isNew ? `${API}/api/seo/local-pages` : `${API}/api/seo/local-pages/${page.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(isNew ? 'Page created' : 'Page updated');
      onBack();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const addFaq = () => {
    setForm(prev => ({ ...prev, faqs: [...prev.faqs, { q: '', a: '' }] }));
    setFaqOpen(form.faqs.length);
  };

  const updateFaq = (index, field, value) => {
    const updated = [...form.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setForm(prev => ({ ...prev, faqs: updated }));
  };

  const removeFaq = (index) => {
    setForm(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  };

  const addService = () => {
    if (!newService.trim()) return;
    setForm(prev => ({ ...prev, services: [...prev.services, newService.trim()] }));
    setNewService('');
  };

  const removeService = (index) => {
    setForm(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6 max-w-4xl" data-testid="local-page-editor">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-indigo-600 hover:underline mb-1 flex items-center gap-1">
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to List
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Add Local Landing Page' : `Edit: ${form.city}, ${form.state}`}</h1>
        </div>
        <div className="flex gap-2">
          <select
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            data-testid="local-page-status"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button onClick={handleSave} disabled={saving} data-testid="save-local-page-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {isNew ? 'Create Page' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Location Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">City *</label>
            <Input value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="e.g. Philadelphia" data-testid="local-page-city" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">State *</label>
            <Input value={form.state} onChange={e => handleChange('state', e.target.value)} placeholder="e.g. PA" data-testid="local-page-state" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">URL Slug</label>
          <Input value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="credit-repair-philadelphia" data-testid="local-page-slug" />
          <p className="text-xs text-slate-400 mt-1">Page will be accessible at: /{form.slug}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Headline (H1)</label>
          <Input value={form.headline} onChange={e => handleChange('headline', e.target.value)} placeholder="Credit Repair Services in Philadelphia, PA" data-testid="local-page-headline" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Page Description</label>
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="SEO-rich description about credit repair in this city..."
            data-testid="local-page-description"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Additional Content (HTML supported)</label>
          <textarea
            value={form.content}
            onChange={e => handleChange('content', e.target.value)}
            rows={5}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none"
            placeholder="Optional additional body content..."
            data-testid="local-page-content"
          />
        </div>
      </div>

      {/* SEO Meta */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">SEO Metadata</h2>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Meta Title</label>
          <Input value={form.meta_title} onChange={e => handleChange('meta_title', e.target.value)} placeholder="Credit Repair in Philadelphia | Credlocity" data-testid="local-page-meta-title" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Meta Description</label>
          <textarea
            value={form.meta_description}
            onChange={e => handleChange('meta_description', e.target.value)}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="150-160 character description for search results..."
            data-testid="local-page-meta-desc"
          />
          <p className="text-xs text-slate-400 mt-1">{(form.meta_description || '').length}/160 characters</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Keywords</label>
          <Input value={form.keywords} onChange={e => handleChange('keywords', e.target.value)} placeholder="credit repair philadelphia, PA credit repair" data-testid="local-page-keywords" />
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Services Offered</h2>
        <div className="flex flex-wrap gap-2">
          {form.services.map((svc, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1.5 rounded-full">
              {svc}
              <button onClick={() => removeService(i)} className="hover:text-red-600 ml-0.5">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newService}
            onChange={e => setNewService(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
            placeholder="Add a service..."
            className="flex-1"
            data-testid="local-page-add-service"
          />
          <Button variant="outline" onClick={addService}>Add</Button>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">FAQs ({form.faqs.length})</h2>
          <Button variant="outline" size="sm" onClick={addFaq} data-testid="add-faq-btn">
            <Plus className="w-3 h-3 mr-1" /> Add FAQ
          </Button>
        </div>
        {form.faqs.map((faq, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-sm text-left"
            >
              <span className="font-medium text-slate-700">{faq.q || `FAQ #${i + 1}`}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); removeFaq(i); }}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {faqOpen === i ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {faqOpen === i && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Question</label>
                  <Input value={faq.q} onChange={e => updateFaq(i, 'q', e.target.value)} placeholder="How does credit repair work in...?" data-testid={`faq-question-${i}`} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Answer</label>
                  <textarea
                    value={faq.a}
                    onChange={e => updateFaq(i, 'a', e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    placeholder="Detailed answer..."
                    data-testid={`faq-answer-${i}`}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalLandingPagesManager;
