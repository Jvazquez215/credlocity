import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Upload, Trash2, Edit3, Download, DollarSign, Users, Eye, Plus, X, Search, Tag, Sparkles, Loader2, Globe, Share2, Facebook, Twitter, Instagram, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;
const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` });
const SITE_URL = window.location.origin;

const EbookManagement = () => {
  const [ebooks, setEbooks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [activeTab, setActiveTab] = useState('ebooks');
  const [searchTerm, setSearchTerm] = useState('');
  const [shareEbook, setShareEbook] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/ebooks/list`, { headers: getHeaders() });
      if (res.ok) { const data = await res.json(); setEbooks(data.ebooks || []); }
    } catch (e) { console.error('Failed to load ebooks:', e); }
    setLoading(false);
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/ebooks/leads/list?limit=200`, { headers: getHeaders() });
      if (res.ok) { const data = await res.json(); setLeads(data.leads || []); }
    } catch (e) { console.error('Failed to load leads:', e); }
  }, []);

  useEffect(() => { load(); loadLeads(); }, [load, loadLeads]);

  const deleteEbook = async (id) => {
    if (!window.confirm('Delete this e-book?')) return;
    const res = await fetch(`${API}/api/ebooks/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok) { toast.success('E-book deleted'); load(); } else toast.error('Delete failed');
  };

  const toggleActive = async (ebook) => {
    const res = await fetch(`${API}/api/ebooks/${ebook.id}`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ is_active: !ebook.is_active })
    });
    if (res.ok) { toast.success(ebook.is_active ? 'Deactivated' : 'Activated'); load(); }
  };

  const formatPrice = (price) => price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  const filteredEbooks = ebooks.filter(e => !searchTerm || e.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    total: ebooks.length,
    free: ebooks.filter(e => e.price === 0).length,
    paid: ebooks.filter(e => e.price > 0).length,
    downloads: ebooks.reduce((s, e) => s + (e.download_count || 0), 0),
    purchases: ebooks.reduce((s, e) => s + (e.purchase_count || 0), 0),
    revenue: ebooks.reduce((s, e) => s + (e.purchase_count || 0) * (e.price || 0), 0),
    totalLeads: leads.length,
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6" data-testid="ebook-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> E-Book Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage downloadable PDF e-books for consumers and CROs</p>
        </div>
        <button onClick={() => { setEditingEbook(null); setShowCreate(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium" data-testid="add-ebook-btn">
          <Plus className="w-4 h-4" /> Add E-Book
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: BookOpen, color: 'text-indigo-500' },
          { label: 'Free', value: stats.free, icon: Download, color: 'text-green-500' },
          { label: 'Paid', value: stats.paid, icon: DollarSign, color: 'text-amber-500' },
          { label: 'Downloads', value: stats.downloads, icon: Download, color: 'text-blue-500' },
          { label: 'Purchases', value: stats.purchases, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Leads', value: stats.totalLeads, icon: Users, color: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-lg border p-3 text-center">
            <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b">
        {['ebooks', 'leads'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} data-testid={`tab-${tab}`}>
            {tab === 'ebooks' ? `E-Books (${ebooks.length})` : `Leads (${leads.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'ebooks' && (
        <>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search e-books..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" data-testid="ebook-search" />
          </div>

          <div className="space-y-3" data-testid="ebook-list">
            {filteredEbooks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No e-books yet. Click "Add E-Book" to create one.</p>
              </div>
            ) : filteredEbooks.map(ebook => (
              <div key={ebook.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition group" data-testid={`ebook-item-${ebook.id}`}>
                {ebook.cover_image_url ? (
                  <img src={ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`} alt={ebook.title} className="w-16 h-20 object-cover rounded-lg border" />
                ) : (
                  <div className="w-16 h-20 bg-indigo-50 rounded-lg border flex items-center justify-center"><BookOpen className="w-6 h-6 text-indigo-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">{ebook.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ebook.price === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {formatPrice(ebook.price)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ebook.category === 'consumers' ? 'bg-blue-100 text-blue-700' : ebook.category === 'cros' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {ebook.category === 'cros' ? 'CROs' : ebook.category === 'both' ? 'All' : 'Consumers'}
                    </span>
                    {!ebook.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{ebook.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>{ebook.download_count || 0} downloads</span>
                    <span>{ebook.purchase_count || 0} purchases</span>
                    {ebook.slug && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> /store/{ebook.slug}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setShareEbook(ebook)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Share to Social Media" data-testid={`share-ebook-${ebook.id}`}><Share2 className="w-4 h-4" /></button>
                  {ebook.slug && (
                    <a href={`/store/${ebook.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View public page"><ExternalLink className="w-4 h-4" /></a>
                  )}
                  <button onClick={() => { setEditingEbook(ebook); setShowCreate(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit" data-testid={`edit-ebook-${ebook.id}`}><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => toggleActive(ebook)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title={ebook.is_active ? 'Deactivate' : 'Activate'} data-testid={`toggle-ebook-${ebook.id}`}><Eye className="w-4 h-4" /></button>
                  <button onClick={() => deleteEbook(ebook.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete" data-testid={`delete-ebook-${ebook.id}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'leads' && (
        <div className="bg-white rounded-lg border overflow-hidden" data-testid="leads-table">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">E-Book</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No leads yet</td></tr>
              ) : leads.map((lead, i) => (
                <tr key={lead.id || i} className="hover:bg-gray-50" data-testid={`lead-row-${i}`}>
                  <td className="px-4 py-3">{lead.first_name} {lead.last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{lead.ebook_title}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${lead.type === 'purchase' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{lead.type === 'purchase' ? 'Purchase' : 'Free'}</span></td>
                  <td className="px-4 py-3">{lead.amount > 0 ? `$${lead.amount.toFixed(2)}` : 'Free'}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <EbookFormModal
          ebook={editingEbook}
          onClose={() => { setShowCreate(false); setEditingEbook(null); }}
          onSaved={() => { setShowCreate(false); setEditingEbook(null); load(); }}
        />
      )}

      {shareEbook && (
        <SocialShareModal
          ebook={shareEbook}
          onClose={() => setShareEbook(null)}
        />
      )}
    </div>
  );
};


/* ============ SOCIAL SHARE MODAL ============ */
const SocialShareModal = ({ ebook, onClose }) => {
  const [copied, setCopied] = useState(null);
  const isFree = ebook.price === 0;
  const pageUrl = `${SITE_URL}/store/${ebook.slug || ebook.id}`;
  const coverUrl = ebook.cover_image_url
    ? (ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`)
    : null;
  const defaultCaption = ebook.social_caption || `Check out "${ebook.title}" from Credlocity - ${isFree ? 'Free Download!' : `Only $${ebook.price.toFixed(2)}`}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(defaultCaption)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(defaultCaption)}`;
  const igCaption = `${defaultCaption}\n\nGet yours: ${pageUrl}\n\n#creditrepair #creditbuilding #financialliteracy #ebook #credlocity`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCover = () => {
    if (coverUrl) {
      const a = document.createElement('a');
      a.href = coverUrl;
      a.download = `${ebook.title.replace(/[^a-zA-Z0-9]/g, '_')}_cover.png`;
      a.target = '_blank';
      a.click();
      toast.success('Cover image downloading');
    } else {
      toast.info('No cover image. Generate one first using AI Cover Generation.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()} data-testid="social-share-modal">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              <span className="font-bold text-lg">Share E-Book</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-blue-100 text-sm mt-1">{ebook.title}</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick Share Buttons */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Quick Share</label>
            <div className="grid grid-cols-2 gap-3">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
                data-testid="share-to-facebook">
                <Facebook className="w-5 h-5" /> Share on Facebook
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-medium text-sm"
                data-testid="share-to-twitter">
                <Twitter className="w-5 h-5" /> Share on Twitter
              </a>
            </div>
          </div>

          {/* Instagram Section */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-center gap-2 mb-3">
              <Instagram className="w-5 h-5 text-pink-600" />
              <span className="font-semibold text-sm text-gray-800">Instagram Post</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Download the cover and copy the caption to create your Instagram post.</p>
            <div className="flex gap-2">
              <button onClick={downloadCover} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 transition" data-testid="ig-download-cover">
                <Download className="w-4 h-4" /> Download Cover
              </button>
              <button onClick={() => copyToClipboard(igCaption, 'Instagram caption')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 transition" data-testid="ig-copy-caption">
                {copied === 'Instagram caption' ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Caption</>}
              </button>
            </div>
            <div className="mt-3 bg-white rounded-lg p-3 text-xs text-gray-600 max-h-24 overflow-y-auto border">
              <pre className="whitespace-pre-wrap font-sans">{igCaption}</pre>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Direct Link</label>
            <div className="flex gap-2">
              <input type="text" readOnly value={pageUrl} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-700" data-testid="share-link-input" />
              <button onClick={() => copyToClipboard(pageUrl, 'Link')} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition flex items-center gap-1" data-testid="copy-link-btn">
                {copied === 'Link' ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>

          {/* OG Preview */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Social Preview</label>
            <div className="border rounded-xl overflow-hidden bg-gray-50">
              {coverUrl ? (
                <div className="h-40 bg-gray-200">
                  <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-indigo-300" />
                </div>
              )}
              <div className="p-3">
                <p className="text-xs text-gray-400 uppercase">credlocity.com</p>
                <p className="font-semibold text-sm text-gray-900 mt-0.5">{ebook.meta_title || ebook.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ebook.meta_description || ebook.description}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">This is how the link will appear when shared on Facebook and Twitter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ============ E-BOOK FORM MODAL ============ */
const EbookFormModal = ({ ebook, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: ebook?.title || '',
    description: ebook?.description || '',
    price: ebook?.price || 0,
    category: ebook?.category || 'consumers',
    cover_image_url: ebook?.cover_image_url || '',
    is_active: ebook?.is_active ?? true,
    is_featured: ebook?.is_featured ?? false,
    tags: ebook?.tags?.join(', ') || '',
    is_signup_bonus: ebook?.is_signup_bonus ?? false,
    bonus_value_display: ebook?.bonus_value_display || 0,
    meta_title: ebook?.meta_title || '',
    meta_description: ebook?.meta_description || '',
    social_caption: ebook?.social_caption || '',
    author: ebook?.author || '',
    release_date: ebook?.release_date || new Date().toISOString().split('T')[0],
    complementary_ebook_ids: ebook?.complementary_ebook_ids?.join(', ') || '',
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverStyle, setCoverStyle] = useState('professional');
  const [coverPreview, setCoverPreview] = useState(null);
  const [showSeo, setShowSeo] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!ebook && !file) return toast.error('Please select a PDF file');
    setSaving(true);

    try {
      if (ebook) {
        const res = await fetch(`${API}/api/ebooks/${ebook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
          body: JSON.stringify({
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            bonus_value_display: form.bonus_value_display || null,
            complementary_ebook_ids: form.complementary_ebook_ids ? form.complementary_ebook_ids.split(',').map(t => t.trim()).filter(Boolean) : [],
          })
        });
        if (!res.ok) { toast.error('Update failed'); setSaving(false); return; }

        if (file) {
          const fd = new FormData(); fd.append('file', file);
          await fetch(`${API}/api/ebooks/${ebook.id}/upload-pdf`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }, body: fd });
        }
        if (coverPreview) await saveCoverToEbook(ebook.id, coverPreview);
        toast.success('E-book updated');
      } else {
        const fd = new FormData();
        Object.entries({ title: form.title, description: form.description, price: form.price, category: form.category, cover_image_url: form.cover_image_url, is_active: form.is_active, is_featured: form.is_featured, tags: form.tags, is_signup_bonus: form.is_signup_bonus, bonus_value_display: form.bonus_value_display || 0, meta_title: form.meta_title, meta_description: form.meta_description, social_caption: form.social_caption, author: form.author, release_date: form.release_date, complementary_ebook_ids: form.complementary_ebook_ids }).forEach(([k, v]) => fd.append(k, v));
        fd.append('file', file);

        const res = await fetch(`${API}/api/ebooks/create`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }, body: fd });
        if (!res.ok) { const err = await res.json(); toast.error(err.detail || 'Create failed'); setSaving(false); return; }
        const created = await res.json();
        if (coverPreview && created.id) await saveCoverToEbook(created.id, coverPreview);
        toast.success('E-book created');
      }
      onSaved();
    } catch (e) { toast.error('Error saving e-book'); }
    setSaving(false);
  };

  const saveCoverToEbook = async (ebookId, b64) => {
    try {
      await fetch(`${API}/api/ebooks/${ebookId}/save-generated-cover`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ image_base64: b64 })
      });
    } catch (e) { console.error('Failed to save cover:', e); }
  };

  const generateCover = async () => {
    if (!form.title.trim()) return toast.error('Enter a title first');
    setGeneratingCover(true);
    try {
      const res = await fetch(`${API}/api/ebooks/generate-cover`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ title: form.title, description: form.description, style: coverStyle }) });
      if (res.ok) { const data = await res.json(); setCoverPreview(data.image_base64); toast.success('Cover generated!'); }
      else { const err = await res.json().catch(() => ({})); toast.error(err.detail || 'Generation failed'); }
    } catch (e) { toast.error('Failed to generate cover'); }
    setGeneratingCover(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="ebook-form-modal">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">{ebook ? 'Edit E-Book' : 'Add New E-Book'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="E-book title" data-testid="ebook-title-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Brief description..." data-testid="ebook-description-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm" data-testid="ebook-price-input" />
              <p className="text-xs text-gray-400 mt-0.5">Set to 0 for free (email capture)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" data-testid="ebook-category-select">
                <option value="consumers">Consumers</option>
                <option value="cros">CROs</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Author & Release Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" value={form.author} onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Author name" data-testid="ebook-author-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
              <input type="date" value={form.release_date} onChange={e => setForm(prev => ({ ...prev, release_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" data-testid="ebook-release-date-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complementary E-Book IDs (comma-separated)</label>
            <input type="text" value={form.complementary_ebook_ids} onChange={e => setForm(prev => ({ ...prev, complementary_ebook_ids: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="ID of related e-books that complement this one" data-testid="ebook-complementary-input" />
            <p className="text-xs text-gray-400 mt-0.5">Enter e-book IDs of resources that pair well with this one</p>
          </div>

          {/* AI Cover Generation */}
          <div className="border rounded-xl p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI Cover Image
            </label>
            <div className="flex gap-3 items-end">
              <select value={coverStyle} onChange={e => setCoverStyle(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white" data-testid="cover-style-select">
                <option value="professional">Professional</option>
                <option value="modern">Modern</option>
                <option value="minimalist">Minimalist</option>
                <option value="bold">Bold</option>
              </select>
              <button onClick={generateCover} disabled={generatingCover} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap" data-testid="generate-cover-btn">
                {generatingCover ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Cover</>}
              </button>
            </div>
            {coverPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img src={`data:image/png;base64,${coverPreview}`} alt="Generated cover" className="w-24 h-32 object-cover rounded-lg border shadow-sm" />
                <div className="text-xs text-gray-500">
                  <p className="font-medium text-green-600 mb-1">Cover generated!</p>
                  <p>Will be saved when you save the e-book.</p>
                  <button onClick={() => setCoverPreview(null)} className="text-red-500 hover:underline mt-1">Remove</button>
                </div>
              </div>
            )}
            {!coverPreview && ebook?.cover_image_url && (
              <div className="mt-3 flex items-center gap-3">
                <img src={ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`} alt="Current cover" className="w-24 h-32 object-cover rounded-lg border" />
                <span className="text-xs text-gray-500">Current cover</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (optional)</label>
            <input type="text" value={form.cover_image_url} onChange={e => setForm(prev => ({ ...prev, cover_image_url: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." data-testid="ebook-cover-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF File {!ebook && '*'}</label>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm border rounded-lg p-2" data-testid="ebook-file-input" />
            {ebook && <p className="text-xs text-gray-400 mt-0.5">Leave empty to keep current: {ebook.original_filename}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="credit, repair, guide" data-testid="ebook-tags-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))} className="rounded" data-testid="ebook-featured-check" />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_signup_bonus} onChange={e => setForm(prev => ({ ...prev, is_signup_bonus: e.target.checked }))} className="rounded" data-testid="ebook-bonus-check" />
              <span className="text-sm text-gray-700">Signup Bonus</span>
            </label>
          </div>
          {form.is_signup_bonus && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Value ($)</label>
              <input type="number" min="0" step="0.01" value={form.bonus_value_display} onChange={e => setForm(prev => ({ ...prev, bonus_value_display: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm" data-testid="ebook-bonus-value-input" />
            </div>
          )}

          {/* Social Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Share2 className="w-4 h-4 text-gray-400" /> Social Media Caption</label>
            <textarea value={form.social_caption} onChange={e => setForm(prev => ({ ...prev, social_caption: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Custom caption for Facebook, Instagram, Twitter" data-testid="ebook-social-caption" />
          </div>

          {/* SEO Fields */}
          <div className="border rounded-lg">
            <button onClick={() => setShowSeo(!showSeo)} className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> SEO Settings</span>
              <span className="text-xs text-gray-400">{showSeo ? 'Hide' : 'Show'}</span>
            </button>
            {showSeo && (
              <div className="px-3 pb-3 space-y-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SEO Title</label>
                  <input type="text" value={form.meta_title} onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Custom title for search engines" data-testid="ebook-meta-title" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SEO Description</label>
                  <textarea value={form.meta_description} onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Custom description (max 160 chars)" data-testid="ebook-meta-description" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium" data-testid="save-ebook-btn">
            {saving ? 'Saving...' : ebook ? 'Update E-Book' : 'Create E-Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EbookManagement;
