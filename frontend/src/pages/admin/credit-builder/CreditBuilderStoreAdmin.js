import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const CATEGORIES = { credit_education: 'Credit Education', financial_literacy: 'Financial Literacy', legal_guides: 'Legal Guides', bundles: 'Bundles' };
const CAT_COLORS = { credit_education: 'bg-blue-100 text-blue-700', financial_literacy: 'bg-purple-100 text-purple-700', legal_guides: 'bg-amber-100 text-amber-700', bundles: 'bg-emerald-100 text-emerald-700' };

const CreditBuilderStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'credit_education', is_active: true, sort_order: 0 });

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = async () => {
    try { const res = await api.get('/credit-builder/products/admin', AUTH()); setProducts(res.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    const price = parseFloat(form.price);
    if (price < 10 || price > 50) { toast.error('Price must be $10–$50'); return; }
    try {
      const payload = { ...form, price };
      if (editId) {
        await api.put(`/credit-builder/products/${editId}`, payload, AUTH());
        toast.success('Product updated');
      } else {
        await api.post('/credit-builder/products', payload, AUTH());
        toast.success('Product created');
      }
      setShowForm(false); setEditId(null); setForm({ name: '', description: '', price: '', category: 'credit_education', is_active: true, sort_order: 0 });
      fetchProducts();
    } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
  };

  const toggleActive = async (p) => {
    try {
      if (p.is_active) {
        await api.delete(`/credit-builder/products/${p.id}`, AUTH());
      } else {
        await api.put(`/credit-builder/products/${p.id}`, { is_active: true }, AUTH());
      }
      fetchProducts();
    } catch (e) { toast.error('Failed to update'); }
  };

  const startEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, is_active: p.is_active, sort_order: p.sort_order });
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6" data-testid="cb-store-admin">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Digital Store</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', price: '', category: 'credit_education', is_active: true, sort_order: 0 }); }}>
          <Plus className="w-4 h-4 mr-2" />Add Product
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">{editId ? 'Edit' : 'New'} Product</h3>
            <Input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={3} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Price ($10–$50)</label><Input type="number" step="0.01" min="10" max="50" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              <div>
                <label className="text-xs text-gray-500">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                  {Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500">Sort Order</label><Input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})} /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
              <Button className="bg-emerald-600" onClick={handleSave}>{editId ? 'Update' : 'Create'} Product</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" /></div>
        ) : products.map(p => (
          <Card key={p.id} className={`transition ${!p.is_active ? 'opacity-50' : ''}`}>
            <CardContent className="p-5">
              <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{p.name}</h3>
                  <Badge className={`text-[10px] mt-1 ${CAT_COLORS[p.category] || ''}`}>{CATEGORIES[p.category] || p.category}</Badge>
                </div>
                <p className="text-lg font-bold text-emerald-700">${p.price?.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between">
                <Badge className={p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(p)}>
                    {p.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreditBuilderStore;
