import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { MapPin, Plus, Trash2, Edit2, Eye, EyeOff, Save, X, Upload, GripVertical, Search, Building2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const REGIONS = ['East Coast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Idaho', 'Other'];

const emptyForm = {
  city: '', state: '', region: 'Other', slug: '', tagline: '', description: '',
  image_url: '', population: '', metro_area: '', avg_credit_score: '', subprime_pct: '',
  office_address: '', seo_title: '', seo_description: '', is_published: true, sort_order: 0,
};

const LocationsManager = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState('');

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/locations/admin/list`);
      if (res.ok) setLocations(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleSeed = async () => {
    try {
      const res = await fetch(`${API}/api/locations/admin/seed`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Seeded ${data.seeded} locations (${data.skipped} already existed)`);
        fetchLocations();
      }
    } catch (e) { toast.error('Seed failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.city.trim() || !form.state.trim()) return toast.error('City and State are required');

    try {
      if (editingId) {
        const res = await fetch(`${API}/api/locations/admin/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Location updated'); resetForm(); fetchLocations(); }
        else { const err = await res.json(); toast.error(err.detail || 'Update failed'); }
      } else {
        const res = await fetch(`${API}/api/locations/admin/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Location created'); resetForm(); fetchLocations(); }
        else { const err = await res.json(); toast.error(err.detail || 'Create failed'); }
      }
    } catch (e) { toast.error('Operation failed'); }
  };

  const handleEdit = (loc) => {
    setEditingId(loc.id);
    setForm({
      city: loc.city || '', state: loc.state || '', region: loc.region || 'Other',
      slug: loc.slug || '', tagline: loc.tagline || '', description: loc.description || '',
      image_url: loc.image_url || '', population: loc.population || '', metro_area: loc.metro_area || '',
      avg_credit_score: loc.avg_credit_score || '', subprime_pct: loc.subprime_pct || '',
      office_address: loc.office_address || '', seo_title: loc.seo_title || '', seo_description: loc.seo_description || '',
      is_published: loc.is_published !== false, sort_order: loc.sort_order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location permanently?')) return;
    try {
      const res = await fetch(`${API}/api/locations/admin/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Location deleted'); fetchLocations(); }
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleTogglePublish = async (loc) => {
    try {
      const res = await fetch(`${API}/api/locations/admin/${loc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !loc.is_published }),
      });
      if (res.ok) { toast.success(loc.is_published ? 'Unpublished' : 'Published'); fetchLocations(); }
    } catch (e) { toast.error('Toggle failed'); }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleDuplicate = (loc) => {
    setEditingId(null);
    setForm({
      city: '', state: '', region: loc.region || 'Other',
      slug: '', tagline: loc.tagline || '', description: loc.description || '',
      image_url: '', population: loc.population || '', metro_area: loc.metro_area || '',
      avg_credit_score: loc.avg_credit_score || '', subprime_pct: loc.subprime_pct || '',
      office_address: loc.office_address || '', seo_title: '', seo_description: '',
      is_published: false, sort_order: (loc.sort_order || 0) + 1,
    });
    setShowForm(true);
    toast.info(`Duplicated template from ${loc.city}, ${loc.state}. Fill in the new city details.`);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = locations.filter(l =>
    !search || l.city?.toLowerCase().includes(search.toLowerCase()) || l.state?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="locations-manager">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations CMS</h1>
          <p className="text-sm text-gray-500">Manage cities shown on the Locations page. New cities auto-generate landing pages.</p>
        </div>
        <div className="flex gap-2">
          {locations.length === 0 && (
            <Button variant="outline" onClick={handleSeed} data-testid="seed-locations-btn">
              <Upload className="w-4 h-4 mr-2" /> Seed Default Cities
            </Button>
          )}
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary-blue text-white" data-testid="add-location-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Location
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5" data-testid="location-form">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{editingId ? 'Edit Location' : 'New Location'}</h2>
            <button type="button" onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input type="text" value={form.city} onChange={e => setField('city', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-blue/20 outline-none" placeholder="e.g., Los Angeles" data-testid="loc-city-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input type="text" value={form.state} onChange={e => setField('state', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-blue/20 outline-none" placeholder="e.g., CA" data-testid="loc-state-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select value={form.region} onChange={e => setField('region', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-blue/20 outline-none" data-testid="loc-region-select">
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input type="text" value={form.tagline} onChange={e => setField('tagline', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="e.g., The City of Angels" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated if empty)</label>
              <input type="text" value={form.slug} onChange={e => setField('slug', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="credit-repair-los-angeles" data-testid="loc-slug-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="City-specific description for SEO and the locations page..." data-testid="loc-desc-input" />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
              <input type="text" value={form.population} onChange={e => setField('population', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="e.g., 3.9M" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metro Area</label>
              <input type="text" value={form.metro_area} onChange={e => setField('metro_area', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="e.g., 13.2M" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avg Credit Score</label>
              <input type="text" value={form.avg_credit_score} onChange={e => setField('avg_credit_score', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="e.g., 680" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subprime %</label>
              <input type="text" value={form.subprime_pct} onChange={e => setField('subprime_pct', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="e.g., 32%" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="text" value={form.image_url} onChange={e => setField('image_url', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="https://images.unsplash.com/..." data-testid="loc-image-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Address (if local)</label>
              <input type="text" value={form.office_address} onChange={e => setField('office_address', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="Leave empty if no local office" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title (auto-generated if empty)</label>
              <input type="text" value={form.seo_title} onChange={e => setField('seo_title', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description (auto-generated if empty)</label>
              <input type="text" value={form.seo_description} onChange={e => setField('seo_description', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setField('sort_order', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setField('is_published', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Published (visible on website)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-primary-blue text-white" data-testid="save-location-btn">
              <Save className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Create'} Location
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none" />
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="mb-4">No locations yet. Click "Seed Default Cities" to pre-populate with existing cities, or "Add Location" to create one.</p>
          </div>
        ) : (
          <table className="w-full text-sm" data-testid="locations-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">City</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Region</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Stats</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Office</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loc, i) => (
                <tr key={loc.id} className="border-b last:border-0 hover:bg-gray-50" data-testid={`loc-row-${loc.slug}`}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{loc.sort_order || i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {loc.image_url ? (
                        <img src={loc.image_url} alt={loc.city} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-gray-400" /></div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{loc.city}, {loc.state}</div>
                        <div className="text-xs text-gray-400">/{loc.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{loc.region}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {loc.avg_credit_score && <span className="mr-2">Score: {loc.avg_credit_score}</span>}
                    {loc.subprime_pct && <span>Subprime: {loc.subprime_pct}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {loc.office_address ? <Building2 className="w-4 h-4 text-secondary-green mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${loc.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {loc.is_published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleDuplicate(loc)} className="p-1.5 rounded hover:bg-gray-100" title="Duplicate" data-testid={`duplicate-${loc.slug}`}>
                        <Copy className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleEdit(loc)} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => handleTogglePublish(loc)} className="p-1.5 rounded hover:bg-gray-100" title={loc.is_published ? 'Unpublish' : 'Publish'}>
                        {loc.is_published ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-green-500" />}
                      </button>
                      <button onClick={() => handleDelete(loc.id)} className="p-1.5 rounded hover:bg-red-50" title="Delete" data-testid={`delete-${loc.slug}`}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LocationsManager;
