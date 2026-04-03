import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Globe, Search, Save, ChevronDown, ChevronRight, X, Settings, FileText, Code, Eye, RefreshCw, ExternalLink, Shield } from 'lucide-react';
import api from '../../utils/api';

const CHANGEFREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
const ROBOTS_OPTIONS = ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'];

const SEOControlPanel = () => {
  const [tab, setTab] = useState('pages');
  const [pages, setPages] = useState([]);
  const [domainSettings, setDomainSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editPage, setEditPage] = useState(null);
  const [pageForm, setPageForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [schemaPresets, setSchemaPresets] = useState([]);

  const loadPages = useCallback(async () => {
    try {
      const res = await api.get('/seo/pages');
      setPages(res.data.pages || []);
    } catch { toast.error('Failed to load SEO pages'); }
    finally { setLoading(false); }
  }, []);

  const loadDomainSettings = useCallback(async () => {
    try {
      const res = await api.get('/seo/domain-settings');
      setDomainSettings(res.data);
    } catch { toast.error('Failed to load domain settings'); }
  }, []);

  useEffect(() => {
    loadPages();
    loadDomainSettings();
    api.get('/seo/schema-presets').then(r => setSchemaPresets(r.data.presets || [])).catch(() => {});
  }, [loadPages, loadDomainSettings]);

  const filteredPages = pages.filter(p => p.path?.toLowerCase().includes(searchTerm.toLowerCase()) || p.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const openPageEdit = (page) => {
    setPageForm({
      title: page.title || '', description: page.description || '', keywords: page.keywords || '',
      og_title: page.og_title || '', og_description: page.og_description || '', og_image: page.og_image || '',
      canonical_url: page.canonical_url || '', robots_meta: page.robots_meta || 'index, follow',
      schema_type: page.schema_type || 'WebPage', schema_json: page.schema_json || '',
      priority: page.priority ?? 0.5, changefreq: page.changefreq || 'monthly',
    });
    setEditPage(page);
  };

  const savePage = async () => {
    setSaving(true);
    try {
      const path = editPage.path.startsWith('/') ? editPage.path.substring(1) : editPage.path;
      await api.put(`/seo/pages/${path}`, pageForm);
      toast.success('SEO settings saved');
      setEditPage(null);
      loadPages();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const saveDomainSettings = async () => {
    setSaving(true);
    try {
      await api.put('/seo/domain-settings', domainSettings);
      toast.success('Domain settings saved');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'pages', label: 'Page SEO', icon: FileText },
    { id: 'domain', label: 'Domain & Schema', icon: Globe },
    { id: 'robots', label: 'Robots & Sitemap', icon: Shield },
    { id: 'aeo', label: 'AEO / GEO', icon: Code },
  ];

  return (
    <div className="space-y-6" data-testid="seo-control-panel">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings className="w-6 h-6 text-primary-blue" /> SEO & Domain Control</h1>
          <p className="text-sm text-gray-500 mt-1">Manage SEO settings, schemas, sitemaps, and domain configuration across all pages.</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${tab === t.id ? 'bg-white shadow text-primary-blue' : 'text-gray-600 hover:text-gray-900'}`} data-testid={`seo-tab-${t.id}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Page SEO Tab */}
      {tab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search pages by path or title..." className="pl-9" data-testid="seo-search" />
            </div>
            <span className="text-sm text-gray-500">{filteredPages.length} pages</span>
          </div>

          {loading ? (
            <div className="text-center py-16"><div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full" data-testid="seo-pages-table">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Path</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Title</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Robots</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Priority</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPages.map((p, i) => (
                    <tr key={p.path || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-primary-blue">{p.path}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[300px] truncate">{p.title || <span className="text-gray-400 italic">Not set</span>}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.robots_meta || 'index, follow'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.priority ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.custom ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {p.custom ? 'Custom' : 'Default'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => openPageEdit(p)} data-testid={`edit-seo-${p.path}`}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Domain & Schema Tab */}
      {tab === 'domain' && domainSettings && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Site Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Site Name</Label><Input value={domainSettings.site_name || ''} onChange={e => setDomainSettings(p => ({ ...p, site_name: e.target.value }))} data-testid="domain-site-name" /></div>
              <div><Label>Site URL</Label><Input value={domainSettings.site_url || ''} onChange={e => setDomainSettings(p => ({ ...p, site_url: e.target.value }))} placeholder="https://www.credlocity.com" data-testid="domain-site-url" /></div>
              <div><Label>Default OG Image URL</Label><Input value={domainSettings.default_og_image || ''} onChange={e => setDomainSettings(p => ({ ...p, default_og_image: e.target.value }))} placeholder="https://..." /></div>
              <div><Label>Twitter Handle</Label><Input value={domainSettings.twitter_handle || ''} onChange={e => setDomainSettings(p => ({ ...p, twitter_handle: e.target.value }))} placeholder="@credlocity" /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Verification & Analytics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Google Analytics ID</Label><Input value={domainSettings.google_analytics_id || ''} onChange={e => setDomainSettings(p => ({ ...p, google_analytics_id: e.target.value }))} placeholder="G-XXXXXXXXXX" data-testid="domain-ga-id" /></div>
              <div><Label>Google Search Console Verification</Label><Input value={domainSettings.google_search_console_verification || ''} onChange={e => setDomainSettings(p => ({ ...p, google_search_console_verification: e.target.value }))} placeholder="Verification meta content" /></div>
              <div><Label>Bing Webmaster Verification</Label><Input value={domainSettings.bing_webmaster_verification || ''} onChange={e => setDomainSettings(p => ({ ...p, bing_webmaster_verification: e.target.value }))} /></div>
              <div><Label>Facebook Pixel ID</Label><Input value={domainSettings.facebook_pixel_id || ''} onChange={e => setDomainSettings(p => ({ ...p, facebook_pixel_id: e.target.value }))} /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Organization Schema (JSON-LD)</h3>
            <p className="text-xs text-gray-500">This structured data helps Google and AI assistants understand your business.</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Business Name</Label><Input value={domainSettings.organization_schema?.name || ''} onChange={e => setDomainSettings(p => ({ ...p, organization_schema: { ...p.organization_schema, name: e.target.value } }))} /></div>
              <div><Label>Phone</Label><Input value={domainSettings.organization_schema?.phone || ''} onChange={e => setDomainSettings(p => ({ ...p, organization_schema: { ...p.organization_schema, phone: e.target.value } }))} /></div>
              <div><Label>Email</Label><Input value={domainSettings.organization_schema?.email || ''} onChange={e => setDomainSettings(p => ({ ...p, organization_schema: { ...p.organization_schema, email: e.target.value } }))} /></div>
              <div><Label>Logo URL</Label><Input value={domainSettings.organization_schema?.logo || ''} onChange={e => setDomainSettings(p => ({ ...p, organization_schema: { ...p.organization_schema, logo: e.target.value } }))} /></div>
            </div>
            <div><Label>Business Description</Label>
              <textarea value={domainSettings.organization_schema?.description || ''} onChange={e => setDomainSettings(p => ({ ...p, organization_schema: { ...p.organization_schema, description: e.target.value } }))} className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveDomainSettings} disabled={saving} data-testid="save-domain-btn">
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Domain Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Robots & Sitemap Tab */}
      {tab === 'robots' && domainSettings && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Robots.txt Configuration</h3>
            <p className="text-xs text-gray-500 mb-3">Auto-generated robots.txt blocks /admin/, /company/, /partner/, /attorney/, /payment/, and /api/. Add custom rules below.</p>
            <Label>Custom Robots.txt Rules</Label>
            <textarea
              value={domainSettings.robots_txt_custom || ''}
              onChange={e => setDomainSettings(p => ({ ...p, robots_txt_custom: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm font-mono min-h-[120px]"
              placeholder="# Additional rules&#10;Disallow: /private/&#10;Allow: /blog/"
              data-testid="robots-custom"
            />
            <div className="flex items-center gap-3 mt-3">
              <a href={`${process.env.REACT_APP_BACKEND_URL}/api/seo/robots.txt`} target="_blank" rel="noreferrer" className="text-sm text-primary-blue hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Preview robots.txt</a>
              <a href={`${process.env.REACT_APP_BACKEND_URL}/api/seo/sitemap.xml`} target="_blank" rel="noreferrer" className="text-sm text-primary-blue hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Preview sitemap.xml</a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Global Robots Meta Tag</h3>
            <p className="text-xs text-gray-500 mb-3">Default robots meta tag for all pages (can be overridden per page).</p>
            <select value={domainSettings.global_robots_meta || 'index, follow'} onChange={e => setDomainSettings(p => ({ ...p, global_robots_meta: e.target.value }))} className="border rounded-md px-3 py-2 text-sm" data-testid="global-robots-meta">
              {ROBOTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveDomainSettings} disabled={saving} data-testid="save-robots-btn">
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* AEO / GEO Tab */}
      {tab === 'aeo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Answer Engine Optimization (AEO)</h3>
            <p className="text-sm text-gray-600 mb-4">Optimize content for AI assistants like ChatGPT, Claude, Alexa, and Siri. These strategies help your content appear in AI-generated answers.</p>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Key AEO Strategies (Applied)</h4>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span> <strong>FAQ Schema on every content page</strong> — Structured Q&A data helps AI extract answers</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span> <strong>Speakable Schema on blog posts</strong> — Marks content suitable for voice assistants</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span> <strong>Clear entity definitions</strong> — Organization, Service, and Person schemas help AI understand who you are</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span> <strong>Concise, direct answers</strong> — First paragraph of each page answers the primary query directly</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span> <strong>Canonical URLs</strong> — Prevents duplicate content confusion for AI crawlers</li>
                </ul>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 text-sm mb-2">Generative Engine Optimization (GEO)</h4>
                <ul className="text-sm text-amber-800 space-y-1.5">
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span> <strong>Cite authoritative sources</strong> — Reference FCRA, FDCPA, CROA statutes in content</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span> <strong>Include statistics and data</strong> — Concrete numbers are preferred by AI models</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span> <strong>Structured, scannable content</strong> — H2/H3 headers, bullet lists, definition lists</li>
                  <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span> <strong>E-E-A-T signals</strong> — Author bios, credentials, reviews boost AI trust</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Global Head Scripts</h3>
            <p className="text-xs text-gray-500 mb-3">Custom scripts injected into the &lt;head&gt; of every page (analytics, verification, etc.)</p>
            {domainSettings && (
              <>
                <textarea
                  value={domainSettings.global_head_scripts || ''}
                  onChange={e => setDomainSettings(p => ({ ...p, global_head_scripts: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm font-mono min-h-[100px]"
                  placeholder='<!-- Google tag (gtag.js) -->&#10;<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>'
                  data-testid="global-head-scripts"
                />
                <div className="flex justify-end mt-3">
                  <Button onClick={saveDomainSettings} disabled={saving}><Save className="w-4 h-4 mr-2" /> Save</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Page Edit Modal */}
      {editPage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 overflow-y-auto" data-testid="seo-edit-modal">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 mb-10">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit SEO Settings</h2>
                <p className="text-sm font-mono text-primary-blue">{editPage.path}</p>
              </div>
              <button onClick={() => setEditPage(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div><Label>Meta Title <span className="text-xs text-gray-400">({(pageForm.title || '').length}/60 chars)</span></Label>
                <Input value={pageForm.title} onChange={e => setPageForm(p => ({ ...p, title: e.target.value }))} placeholder="Page Title | Credlocity" data-testid="seo-edit-title" />
              </div>
              <div><Label>Meta Description <span className="text-xs text-gray-400">({(pageForm.description || '').length}/160 chars)</span></Label>
                <textarea value={pageForm.description} onChange={e => setPageForm(p => ({ ...p, description: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]" placeholder="Concise description for search engines..." data-testid="seo-edit-desc" />
              </div>
              <div><Label>Keywords</Label>
                <Input value={pageForm.keywords} onChange={e => setPageForm(p => ({ ...p, keywords: e.target.value }))} placeholder="credit repair, FCRA, dispute" data-testid="seo-edit-keywords" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>OG Title (Social)</Label><Input value={pageForm.og_title} onChange={e => setPageForm(p => ({ ...p, og_title: e.target.value }))} placeholder="Defaults to meta title" /></div>
                <div><Label>OG Image URL</Label><Input value={pageForm.og_image} onChange={e => setPageForm(p => ({ ...p, og_image: e.target.value }))} placeholder="https://..." /></div>
              </div>
              <div><Label>OG Description</Label>
                <Input value={pageForm.og_description} onChange={e => setPageForm(p => ({ ...p, og_description: e.target.value }))} placeholder="Defaults to meta description" />
              </div>
              <div><Label>Canonical URL</Label><Input value={pageForm.canonical_url} onChange={e => setPageForm(p => ({ ...p, canonical_url: e.target.value }))} placeholder="Auto-generated if blank" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Robots Meta</Label>
                  <select value={pageForm.robots_meta} onChange={e => setPageForm(p => ({ ...p, robots_meta: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="seo-edit-robots">
                    {ROBOTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div><Label>Priority</Label><Input type="number" min="0" max="1" step="0.1" value={pageForm.priority} onChange={e => setPageForm(p => ({ ...p, priority: parseFloat(e.target.value) }))} /></div>
                <div><Label>Change Frequency</Label>
                  <select value={pageForm.changefreq} onChange={e => setPageForm(p => ({ ...p, changefreq: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                    {CHANGEFREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Schema Type</Label>
                <select value={pageForm.schema_type} onChange={e => setPageForm(p => ({ ...p, schema_type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                  {schemaPresets.map(sp => <option key={sp.id} value={sp.id}>{sp.label} — {sp.description}</option>)}
                  <option value="WebPage">WebPage (Generic)</option>
                </select>
              </div>
              <div><Label>Custom Schema JSON-LD</Label>
                <textarea value={pageForm.schema_json} onChange={e => setPageForm(p => ({ ...p, schema_json: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm font-mono min-h-[80px]" placeholder='{"@context":"https://schema.org","@type":"ProfessionalService",...}' data-testid="seo-edit-schema" />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs font-semibold text-gray-500 mb-2">Google Search Preview</p>
                <div>
                  <p className="text-lg text-blue-800 truncate">{pageForm.title || 'Page Title'}</p>
                  <p className="text-sm text-green-700 font-mono truncate">credlocity.com{editPage.path}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{pageForm.description || 'No description set...'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setEditPage(null)}>Cancel</Button>
              <Button onClick={savePage} disabled={saving} data-testid="save-seo-page-btn"><Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save SEO Settings'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOControlPanel;
