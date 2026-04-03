import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, ExternalLink, Upload, Save, X, Search, Globe, Instagram, Facebook, Youtube, Linkedin, Twitter, Users, Image, Video, Code, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import api from '../../utils/api';

const TYPE_LABELS = {
  real_estate: 'Real Estate',
  social_media: 'Social Media',
  credit_repair_educator: 'Credit Repair Educator',
  mortgage: 'Mortgage',
  car_dealership: 'Car Dealership',
};
const TYPE_COLORS = {
  real_estate: 'bg-green-100 text-green-700',
  social_media: 'bg-purple-100 text-purple-700',
  credit_repair_educator: 'bg-blue-100 text-blue-700',
  mortgage: 'bg-amber-100 text-amber-700',
  car_dealership: 'bg-red-100 text-red-700',
};

const AffiliateForm = ({ affiliate, onSave, onCancel }) => {
  const isNew = !affiliate?.id;
  const [form, setForm] = useState({
    name: '', display_name: '', affiliate_type: 'real_estate', status: 'draft',
    bio: '', tagline: '', city: '', state: '', niche_keywords: '',
    website: '', custom_form_html: '',
    seo_title: '', seo_description: '', seo_keywords: '',
    instagram: '', facebook: '', youtube: '', tiktok: '', linkedin: '', twitter: '',
    services_highlight: [],
    ...(affiliate || {}),
    instagram: affiliate?.social_media?.instagram || '',
    facebook: affiliate?.social_media?.facebook || '',
    youtube: affiliate?.social_media?.youtube || '',
    tiktok: affiliate?.social_media?.tiktok || '',
    linkedin: affiliate?.social_media?.linkedin || '',
    twitter: affiliate?.social_media?.twitter || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [newService, setNewService] = useState('');

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, social_media: { instagram: form.instagram, facebook: form.facebook, youtube: form.youtube, tiktok: form.tiktok, linkedin: form.linkedin, twitter: form.twitter } };
      let res;
      if (isNew) {
        res = await api.post('/affiliate-pages', payload);
        toast.success('Affiliate created');
      } else {
        res = await api.put(`/affiliate-pages/${affiliate.id}`, payload);
        toast.success('Affiliate updated');
      }
      onSave(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleUpload = async (fileType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = fileType === 'video' ? 'video/*' : 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file || !affiliate?.id) { toast.error('Save the affiliate first, then upload'); return; }
      setUploading(p => ({ ...p, [fileType]: true }));
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await api.post(`/affiliate-pages/${affiliate.id}/upload/${fileType}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        update(`${fileType}_url`, res.data.url);
        toast.success(`${fileType} uploaded`);
      } catch { toast.error('Upload failed'); }
      finally { setUploading(p => ({ ...p, [fileType]: false })); }
    };
    input.click();
  };

  const addService = () => {
    if (!newService.trim()) return;
    update('services_highlight', [...(form.services_highlight || []), newService.trim()]);
    setNewService('');
  };

  const removeService = (idx) => {
    update('services_highlight', (form.services_highlight || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6" data-testid="affiliate-form">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{isNew ? 'New Affiliate' : `Edit: ${form.display_name || form.name}`}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="save-affiliate-btn">
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" />Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Full Name *</label><Input value={form.name} onChange={e => update('name', e.target.value)} className="mt-1" data-testid="aff-name" /></div>
          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Display Name / Brand</label><Input value={form.display_name} onChange={e => update('display_name', e.target.value)} className="mt-1" placeholder="e.g., Mr. Ohana Credit" data-testid="aff-display-name" /></div>
          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Affiliate Type *</label>
            <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={form.affiliate_type} onChange={e => update('affiliate_type', e.target.value)} data-testid="aff-type">
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Status</label>
            <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" value={form.status} onChange={e => update('status', e.target.value)} data-testid="aff-status">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">City / Region</label><Input value={form.city} onChange={e => update('city', e.target.value)} className="mt-1" placeholder="e.g., South Jersey" data-testid="aff-city" /></div>
          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">State</label><Input value={form.state} onChange={e => update('state', e.target.value)} className="mt-1" placeholder="e.g., NJ" data-testid="aff-state" /></div>
        </div>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Tagline</label><Input value={form.tagline} onChange={e => update('tagline', e.target.value)} className="mt-1" placeholder="Short tagline" data-testid="aff-tagline" /></div>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Bio / Description</label>
          <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Affiliate bio..." data-testid="aff-bio" />
        </div>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Niche Keywords</label><Input value={form.niche_keywords} onChange={e => update('niche_keywords', e.target.value)} className="mt-1" placeholder="credit repair, financial literacy, homebuyers" data-testid="aff-keywords" /></div>
      </CardContent></Card>

      {/* Media */}
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><Image className="w-4 h-4 text-green-500" />Media & Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['headshot', 'logo', 'video'].map(ft => (
            <div key={ft} className="border-2 border-dashed rounded-xl p-4 text-center">
              {form[`${ft}_url`] ? (
                <div>
                  {ft !== 'video' ? (
                    <img src={form[`${ft}_url`]} alt={ft} className="w-20 h-20 rounded-lg mx-auto object-cover mb-2" />
                  ) : (
                    <Video className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  )}
                  <p className="text-[10px] text-green-600">Uploaded</p>
                </div>
              ) : (
                <div className="py-4">
                  {ft === 'headshot' ? <Users className="w-8 h-8 text-gray-300 mx-auto" /> : ft === 'logo' ? <Image className="w-8 h-8 text-gray-300 mx-auto" /> : <Video className="w-8 h-8 text-gray-300 mx-auto" />}
                </div>
              )}
              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => handleUpload(ft)} disabled={uploading[ft] || !affiliate?.id} data-testid={`upload-${ft}`}>
                <Upload className="w-3 h-3 mr-1" />{uploading[ft] ? 'Uploading...' : `Upload ${ft}`}
              </Button>
              {!affiliate?.id && <p className="text-[9px] text-amber-500 mt-1">Save first to enable uploads</p>}
            </div>
          ))}
        </div>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Video URL (YouTube/Vimeo embed)</label><Input value={form.video_url} onChange={e => update('video_url', e.target.value)} className="mt-1" placeholder="https://youtube.com/embed/..." data-testid="aff-video-url" /></div>
      </CardContent></Card>

      {/* Social & Website */}
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-500" />Social Media & Website</h3>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Website</label><Input value={form.website} onChange={e => update('website', e.target.value)} className="mt-1" placeholder="https://" data-testid="aff-website" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{k:'instagram',i:Instagram},{k:'facebook',i:Facebook},{k:'youtube',i:Youtube},{k:'tiktok',i:Globe},{k:'linkedin',i:Linkedin},{k:'twitter',i:Twitter}].map(({k,i:Icon}) => (
            <div key={k} className="flex items-center gap-2"><Icon className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input value={form[k]} onChange={e => update(k, e.target.value)} placeholder={`${k} URL`} data-testid={`aff-${k}`} /></div>
          ))}
        </div>
      </CardContent></Card>

      {/* Services */}
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500" />Services Highlight</h3>
        <div className="flex flex-wrap gap-2">
          {(form.services_highlight || []).map((s, i) => (
            <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
              {s}<button onClick={() => removeService(i)} className="text-blue-400 hover:text-blue-600"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2"><Input value={newService} onChange={e => setNewService(e.target.value)} placeholder="Add a service..." onKeyDown={e => e.key === 'Enter' && addService()} /><Button size="sm" onClick={addService}>Add</Button></div>
      </CardContent></Card>

      {/* Custom HTML */}
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><Code className="w-4 h-4 text-rose-500" />Custom Form HTML</h3>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm font-mono" rows={6} value={form.custom_form_html} onChange={e => update('custom_form_html', e.target.value)} placeholder="Paste custom HTML form code here..." data-testid="aff-custom-html" />
      </CardContent></Card>

      {/* SEO */}
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><Search className="w-4 h-4 text-green-500" />SEO Settings</h3>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">SEO Title</label><Input value={form.seo_title} onChange={e => update('seo_title', e.target.value)} className="mt-1" data-testid="aff-seo-title" /></div>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">SEO Description</label>
          <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={2} value={form.seo_description} onChange={e => update('seo_description', e.target.value)} data-testid="aff-seo-desc" />
        </div>
        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">SEO Keywords</label><Input value={form.seo_keywords} onChange={e => update('seo_keywords', e.target.value)} className="mt-1" data-testid="aff-seo-keywords" /></div>
      </CardContent></Card>
    </div>
  );
};

const AffiliateManager = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // list, create, edit
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = typeFilter ? `?affiliate_type=${typeFilter}` : '';
    api.get(`/affiliate-pages${params}`).then(r => setAffiliates(r.data.affiliates || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this affiliate?')) return;
    try { await api.delete(`/affiliate-pages/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  if (mode === 'create') return <AffiliateForm onSave={() => { setMode('list'); load(); }} onCancel={() => setMode('list')} />;
  if (mode === 'edit' && selected) return <AffiliateForm affiliate={selected} onSave={() => { setMode('list'); load(); }} onCancel={() => setMode('list')} />;

  return (
    <div className="space-y-6" data-testid="affiliate-manager">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Affiliate Landing Pages</h1>
        <Button onClick={() => setMode('create')} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="new-affiliate-btn"><Plus className="w-4 h-4 mr-1" />New Affiliate</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={!typeFilter ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('')} className={!typeFilter ? 'bg-blue-600 text-white' : ''}>All</Button>
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <Button key={k} variant={typeFilter === k ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(k)} className={typeFilter === k ? 'bg-blue-600 text-white' : ''}>{v}</Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : affiliates.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No affiliates yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {affiliates.map(a => (
            <Card key={a.id} className="overflow-hidden hover:shadow-lg transition" data-testid={`affiliate-card-${a.id}`}>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {a.headshot_url ? (
                      <img src={a.headshot_url} alt={a.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400">{a.name?.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{a.display_name || a.name}</p>
                      <p className="text-xs text-gray-500 truncate">{a.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={TYPE_COLORS[a.affiliate_type] || 'bg-gray-100'}>{TYPE_LABELS[a.affiliate_type]}</Badge>
                        <Badge className={a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{a.status}</Badge>
                      </div>
                    </div>
                  </div>
                  {a.city && <p className="text-xs text-gray-400 mt-2">{a.city}{a.state ? `, ${a.state}` : ''}</p>}
                  {a.tagline && <p className="text-xs text-gray-600 mt-1 italic">{a.tagline}</p>}
                </div>
                <div className="border-t px-4 py-2 flex items-center gap-2 bg-gray-50">
                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setSelected(a); setMode('edit'); }} data-testid={`edit-${a.id}`}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                  {a.status === 'published' && (
                    <a href={`/p/${a.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Eye className="w-3 h-3" />Preview</a>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs h-7 text-red-500 ml-auto" onClick={() => handleDelete(a.id)} data-testid={`delete-${a.id}`}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AffiliateManager;
