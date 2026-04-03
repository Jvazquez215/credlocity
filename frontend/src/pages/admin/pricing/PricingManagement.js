import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Pencil, Trash2, Eye, EyeOff, Star, Save, ChevronDown, ChevronUp, GripVertical, Package, FileText, Shield, Settings, X, Monitor } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import axios from '../../../utils/api';
import PricingPreview from './PricingPreview';

const TABS = [
  { key: 'plans', label: 'Pricing Plans', icon: DollarSign },
  { key: 'products', label: 'Products & Add-ons', icon: Package },
  { key: 'config', label: 'Page Settings', icon: Settings },
];

/* ══════════════ Plan Editor Modal ══════════════ */
const PlanEditorModal = ({ plan, onSave, onClose }) => {
  const isEdit = !!plan?.id;
  const [form, setForm] = useState({
    name: '', code: '', description: '',
    monthly_fee: 0, show_on_website: true, is_featured: false, display_order: 0,
    website_settings: {
      display_name: '', tagline: '', price_display: '', price_period: '/month',
      trial_text: '', cta_text: 'Start Free Trial', cta_url: '',
      banner: null, features_included: [], features_not_included: [],
      highlight_color: '',
    },
    ...(plan || {}),
  });
  const [featureInput, setFeatureInput] = useState('');
  const [notIncInput, setNotIncInput] = useState('');
  const [saving, setSaving] = useState(false);

  const ws = form.website_settings || {};
  const updateWs = (k, v) => setForm(p => ({ ...p, website_settings: { ...p.website_settings, [k]: v } }));

  const addFeature = (type) => {
    const input = type === 'included' ? featureInput : notIncInput;
    if (!input.trim()) return;
    const key = type === 'included' ? 'features_included' : 'features_not_included';
    updateWs(key, [...(ws[key] || []), input.trim()]);
    type === 'included' ? setFeatureInput('') : setNotIncInput('');
  };

  const removeFeature = (type, idx) => {
    const key = type === 'included' ? 'features_included' : 'features_not_included';
    updateWs(key, (ws[key] || []).filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Plan name is required'); return; }
    setSaving(true);
    try {
      await onSave(form);
      toast.success(isEdit ? 'Plan updated' : 'Plan created');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
          <h3 className="font-semibold text-lg">{isEdit ? 'Edit Plan' : 'Create New Plan'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Plan Name *</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Aggressive Plan" data-testid="plan-name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Code</label>
              <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="AGGRESSIVE" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <Input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Best value credit repair plan" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Monthly Fee ($)</label>
              <Input type="number" step="0.01" value={form.monthly_fee} onChange={e => setForm(p => ({ ...p, monthly_fee: parseFloat(e.target.value) || 0 }))} data-testid="plan-monthly-fee" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Display Price</label>
              <Input value={ws.price_display || ''} onChange={e => updateWs('price_display', e.target.value)} placeholder="$179.95" data-testid="plan-price-display" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Display Order</label>
              <Input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Trial Text</label>
              <Input value={ws.trial_text || ''} onChange={e => updateWs('trial_text', e.target.value)} placeholder="30-Day Free Trial" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">CTA Button Text</label>
              <Input value={ws.cta_text || ''} onChange={e => updateWs('cta_text', e.target.value)} placeholder="Start Free Trial" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Banner Text (optional)</label>
              <Input value={ws.banner?.text || ''} onChange={e => updateWs('banner', e.target.value ? { text: e.target.value, color: ws.banner?.color || 'green' } : null)} placeholder="Most Popular" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Banner Color</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={ws.banner?.color || 'green'} onChange={e => ws.banner && updateWs('banner', { ...ws.banner, color: e.target.value })}>
                {['green','gold','blue','purple','red','orange','pink','teal'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Highlight Color (ring border)</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={ws.highlight_color || ''} onChange={e => updateWs('highlight_color', e.target.value)}>
              <option value="">None</option>
              {['green','blue','purple','red','orange','gold','teal'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Features Included */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Features Included</label>
            <div className="flex gap-2 mb-2">
              <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add feature..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature('included'))} />
              <Button size="sm" onClick={() => addFeature('included')} type="button"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-1">
              {(ws.features_included || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-green-50 px-3 py-1.5 rounded text-sm">
                  <span>{f}</span>
                  <button onClick={() => removeFeature('included', i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Features Not Included */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Not Included (shown with X)</label>
            <div className="flex gap-2 mb-2">
              <Input value={notIncInput} onChange={e => setNotIncInput(e.target.value)} placeholder="Add exclusion..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature('notIncluded'))} />
              <Button size="sm" onClick={() => addFeature('notIncluded')} type="button"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-1">
              {(ws.features_not_included || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-red-50 px-3 py-1.5 rounded text-sm">
                  <span>{f}</span>
                  <button onClick={() => removeFeature('notIncluded', i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.show_on_website} onChange={e => setForm(p => ({ ...p, show_on_website: e.target.checked }))} className="rounded" data-testid="plan-show-on-website" />
              <span className="text-sm">Show on Website</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} className="rounded" />
              <span className="text-sm">Featured (Popular)</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="flex-1" data-testid="save-plan-btn">
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />{isEdit ? 'Update Plan' : 'Create Plan'}</>}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════ Product Editor Modal ══════════════ */
const ProductEditorModal = ({ product, onSave, onClose }) => {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: '', code: '', description: '', category: 'pay_per_delete',
    price: 0, price_display: '', price_note: '', icon: 'file-minus',
    features: [], cta_text: 'Get Started', cta_url: '',
    show_on_website: true, display_order: 0,
    ...(product || {}),
  });
  const [featureInput, setFeatureInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm(p => ({ ...p, features: [...p.features, featureInput.trim()] }));
    setFeatureInput('');
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Product name is required'); return; }
    setSaving(true);
    try {
      await onSave(form);
      toast.success(isEdit ? 'Product updated' : 'Product created');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
          <h3 className="font-semibold text-lg">{isEdit ? 'Edit Product' : 'Create New Product'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Product Name *</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} data-testid="product-name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Code</label>
              <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} data-testid="product-category">
              <option value="pay_per_delete">Pay Per Delete</option>
              <option value="setup_service">Setup Service</option>
              <option value="one_time">One-Time</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price ($)</label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} data-testid="product-price" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Display Price</label>
              <Input value={form.price_display} onChange={e => setForm(p => ({ ...p, price_display: e.target.value }))} placeholder="$150" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price Note</label>
              <Input value={form.price_note} onChange={e => setForm(p => ({ ...p, price_note: e.target.value }))} placeholder="Per deletion" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Icon</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}>
                {['file-minus','chart','scale','clock','building','file','shield'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Display Order</label>
              <Input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">CTA Text</label>
              <Input value={form.cta_text} onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">CTA URL</label>
              <Input value={form.cta_url} onChange={e => setForm(p => ({ ...p, cta_url: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Features</label>
            <div className="flex gap-2 mb-2">
              <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add feature..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
              <Button size="sm" onClick={addFeature} type="button"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-1">
              {(form.features || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded text-sm">
                  <span>{f}</span>
                  <button onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, fi) => fi !== i) }))}><X className="w-3 h-3 text-red-400" /></button>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.show_on_website} onChange={e => setForm(p => ({ ...p, show_on_website: e.target.checked }))} className="rounded" data-testid="product-show-on-website" />
            <span className="text-sm">Show on Website</span>
          </label>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="flex-1" data-testid="save-product-btn">
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />{isEdit ? 'Update' : 'Create'}</>}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════ Main Page ══════════════ */
const PricingManagement = () => {
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [plansRes, productsRes, configRes] = await Promise.all([
        axios.get('/billing/subscription-plans'),
        axios.get('/billing/pricing-products'),
        axios.get('/billing/pricing-page-config'),
      ]);
      setPlans(plansRes.data || []);
      setProducts(productsRes.data || []);
      setConfig(configRes.data || {});
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Plan CRUD
  const savePlan = async (data) => {
    if (data.id) {
      await axios.put(`/billing/subscription-plans/${data.id}`, data);
    } else {
      await axios.post('/billing/subscription-plans', data);
    }
    fetchData();
  };

  const togglePlanVisibility = async (plan) => {
    await axios.put(`/billing/subscription-plans/${plan.id}`, { show_on_website: !plan.show_on_website });
    fetchData();
    toast.success(plan.show_on_website ? 'Plan hidden from website' : 'Plan shown on website');
  };

  const deletePlan = async (plan) => {
    if (!window.confirm(`Deactivate "${plan.name}"?`)) return;
    try {
      await axios.delete(`/billing/subscription-plans/${plan.id}`);
      fetchData();
      toast.success('Plan deactivated');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Cannot delete');
    }
  };

  // Product CRUD
  const saveProduct = async (data) => {
    if (data.id) {
      await axios.put(`/billing/pricing-products/${data.id}`, data);
    } else {
      await axios.post('/billing/pricing-products', data);
    }
    fetchData();
  };

  const toggleProductVisibility = async (product) => {
    await axios.put(`/billing/pricing-products/${product.id}`, { show_on_website: !product.show_on_website });
    fetchData();
    toast.success(product.show_on_website ? 'Product hidden from website' : 'Product shown on website');
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Deactivate "${product.name}"?`)) return;
    await axios.delete(`/billing/pricing-products/${product.id}`);
    fetchData();
    toast.success('Product deactivated');
  };

  // Config
  const saveConfig = async () => {
    try {
      await axios.put('/billing/pricing-page-config', config);
      toast.success('Page settings saved');
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      const keys = path.split('.');
      let obj = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading pricing data...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="pricing-management-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="pricing-management-title">Pricing Management</h1>
          <p className="text-sm text-gray-500">Manage plans, products, and pricing page content</p>
        </div>
        <Button onClick={() => setShowPreview(true)} variant="outline" className="gap-2" data-testid="preview-pricing-btn">
          <Monitor className="w-4 h-4" /> Live Preview
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            data-testid={`tab-${t.key}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ──── Plans Tab ──── */}
      {tab === 'plans' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Subscription Plans</h2>
            <Button onClick={() => { setEditPlan(null); setShowPlanModal(true); }} data-testid="add-plan-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Plan
            </Button>
          </div>
          <div className="space-y-3">
            {plans.filter(p => p.status === 'active').map(plan => {
              const ws = plan.website_settings || {};
              return (
                <div key={plan.id} className="bg-white rounded-lg border p-4 flex items-center gap-4" data-testid={`plan-card-${plan.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{ws.display_name || plan.name}</h3>
                      {plan.is_featured && <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">Featured</Badge>}
                      {plan.show_on_website ? (
                        <Badge className="bg-green-100 text-green-800 text-[10px]">Visible</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 text-[10px]">Hidden</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {ws.price_display || `$${plan.monthly_fee}`}/month
                      {ws.trial_text && ` | ${ws.trial_text}`}
                      {ws.banner?.text && ` | Banner: "${ws.banner.text}"`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(ws.features_included || []).length} features | Order: {plan.display_order}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePlanVisibility(plan)} className="p-2 rounded hover:bg-gray-100" title={plan.show_on_website ? 'Hide from website' : 'Show on website'}>
                      {plan.show_on_website ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => { setEditPlan(plan); setShowPlanModal(true); }} className="p-2 rounded hover:bg-gray-100" data-testid={`edit-plan-${plan.id}`}>
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button onClick={() => deletePlan(plan)} className="p-2 rounded hover:bg-gray-100">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {plans.filter(p => p.status === 'active').length === 0 && (
              <p className="text-center text-gray-400 py-8">No plans yet. Click "Add Plan" to create your first pricing plan.</p>
            )}
          </div>
        </div>
      )}

      {/* ──── Products Tab ──── */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Products & Add-ons</h2>
            <Button onClick={() => { setEditProduct(null); setShowProductModal(true); }} data-testid="add-product-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>

          {['setup_service', 'pay_per_delete', 'one_time'].map(cat => {
            const catProducts = products.filter(p => p.category === cat && p.status === 'active');
            if (catProducts.length === 0) return null;
            const labels = { setup_service: 'Setup Services', pay_per_delete: 'Pay-Per-Delete', one_time: 'One-Time Products' };
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{labels[cat]}</h3>
                <div className="space-y-2">
                  {catProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-lg border p-4 flex items-center gap-4" data-testid={`product-card-${product.id}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          {product.show_on_website ? (
                            <Badge className="bg-green-100 text-green-800 text-[10px]">Visible</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 text-[10px]">Hidden</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{product.price_display} — {product.price_note}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleProductVisibility(product)} className="p-2 rounded hover:bg-gray-100">
                          {product.show_on_website ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button onClick={() => { setEditProduct(product); setShowProductModal(true); }} className="p-2 rounded hover:bg-gray-100" data-testid={`edit-product-${product.id}`}>
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button onClick={() => deleteProduct(product)} className="p-2 rounded hover:bg-gray-100">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {products.filter(p => p.status === 'active').length === 0 && (
            <p className="text-center text-gray-400 py-8">No products yet. Click "Add Product" to create setup services or pay-per-delete options.</p>
          )}
        </div>
      )}

      {/* ──── Page Config Tab ──── */}
      {tab === 'config' && config && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Hero Section</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Title</label>
                <Input value={config.hero?.title || ''} onChange={e => updateConfig('hero.title', e.target.value)} data-testid="config-hero-title" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Subtitle</label>
                <Input value={config.hero?.subtitle || ''} onChange={e => updateConfig('hero.subtitle', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Highlights (comma separated)</label>
                <Input value={(config.hero?.highlights || []).join(', ')} onChange={e => updateConfig('hero.highlights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="$0 First Work Fee, 30-Day Free Trial, Cancel Anytime" />
              </div>
            </div>
          </div>

          {/* Section Toggles */}
          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Section Visibility</h3>
            <div className="space-y-3">
              {[
                { key: 'setup_services', label: 'Setup Services Section' },
                { key: 'pay_per_delete', label: 'Pay-Per-Delete Section' },
                { key: 'guarantee', label: 'Money-Back Guarantee Section' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm">{s.label}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={config.sections?.[s.key]?.enabled !== false} onChange={e => updateConfig(`sections.${s.key}.enabled`, e.target.checked)} className="rounded" />
                    <span className="text-xs text-gray-500">{config.sections?.[s.key]?.enabled !== false ? 'Visible' : 'Hidden'}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Section */}
          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Guarantee Section</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Guarantee Title</label>
                <Input value={config.sections?.guarantee?.title || ''} onChange={e => updateConfig('sections.guarantee.title', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Guarantee Description</label>
                <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]" value={config.sections?.guarantee?.description || ''} onChange={e => updateConfig('sections.guarantee.description', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Compliance Notice</h3>
            <Input value={config.compliance_notice || ''} onChange={e => updateConfig('compliance_notice', e.target.value)} />
          </div>

          <Button onClick={saveConfig} className="w-full" data-testid="save-config-btn">
            <Save className="w-4 h-4 mr-2" /> Save Page Settings
          </Button>
        </div>
      )}

      {/* Modals */}
      {showPlanModal && (
        <PlanEditorModal
          plan={editPlan}
          onSave={savePlan}
          onClose={() => { setShowPlanModal(false); setEditPlan(null); }}
        />
      )}
      {showProductModal && (
        <ProductEditorModal
          product={editProduct}
          onSave={saveProduct}
          onClose={() => { setShowProductModal(false); setEditProduct(null); }}
        />
      )}
      {showPreview && (
        <PricingPreview
          plans={plans}
          products={products}
          config={config}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default PricingManagement;
