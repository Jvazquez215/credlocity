import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Copy, Eye, Settings, Calendar, Link, Package, Check, X, ExternalLink } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IntakeFormsManager = () => {
  const [forms, setForms] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingForm, setEditingForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const defaultForm = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
    header_title: 'Unlock Your Credit Potential',
    header_subtitle: 'Take our 2-minute assessment to discover your personalized path to financial freedom',
    credit_report_url: 'https://credlocity.scorexer.com/scorefusion/scorefusion-signup.jsp?code=50a153cc-c',
    credit_report_button_text: 'Get My Credit Report ($49.95)',
    calendar_ids: [],
    default_calendar_url: 'https://calendly.com/credlocity/oneonone',
    warm_lead_button_text: 'Schedule My Free Strategy Session',
    cold_lead_button_text: 'Get My Free Consultation',
    packages: [
      { key: 'fraud', name: 'Fraud Protection Plan', price: 99.95, description: 'Perfect for recent identity theft victims' },
      { key: 'aggressive', name: 'Aggressive Package', price: 179.95, description: 'Our most popular comprehensive plan' },
      { key: 'family', name: 'Family Plan', price: 279.95, description: 'Coverage for you and your spouse' }
    ],
    credit_report_fee: 49.95,
    enotary_fee: 39.95,
    crm_enabled: true,
    crm_tab_info_id: 'QTduWHF0U2lXOWNPNFZvN085bUJ3dz09',
    crm_company_id: 'UmJ1YWN4dkUvbThaUXJqVkdKZ3paUT09'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [calendarEditData, setCalendarEditData] = useState({ name: '', url: '', weight: 1 });

  useEffect(() => {
    fetchForms();
    fetchCalendars();
  }, []);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  });

  const fetchForms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/intake-forms`, getAuthHeaders());
      setForms(res.data);
    } catch (err) {
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendars = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/calendars`, getAuthHeaders());
      setCalendars(res.data);
    } catch (err) {
      console.error('Error fetching calendars:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingForm) {
        await axios.put(`${API_URL}/api/admin/intake-forms/${editingForm.id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API_URL}/api/admin/intake-forms`, formData, getAuthHeaders());
      }
      fetchForms();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving form');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/intake-forms/${id}`, getAuthHeaders());
      fetchForms();
    } catch (err) {
      alert('Error deleting form');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await axios.post(`${API_URL}/api/admin/intake-forms/${id}/duplicate`, {}, getAuthHeaders());
      fetchForms();
    } catch (err) {
      alert('Error duplicating form');
    }
  };

  const openModal = (form = null) => {
    if (form) {
      setEditingForm(form);
      setFormData(form);
    } else {
      setEditingForm(null);
      setFormData(defaultForm);
    }
    setActiveTab('basic');
    setShowFormModal(true);
  };

  const closeModal = () => {
    setShowFormModal(false);
    setEditingForm(null);
    setFormData(defaultForm);
  };

  const toggleCalendar = (calendarId) => {
    const current = formData.calendar_ids || [];
    if (current.includes(calendarId)) {
      setFormData({ ...formData, calendar_ids: current.filter(id => id !== calendarId) });
    } else {
      setFormData({ ...formData, calendar_ids: [...current, calendarId] });
    }
  };

  const updatePackage = (index, field, value) => {
    const newPackages = [...formData.packages];
    newPackages[index] = { ...newPackages[index], [field]: field === 'price' ? parseFloat(value) || 0 : value };
    setFormData({ ...formData, packages: newPackages });
  };

  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { key: '', name: '', price: 0, description: '' }]
    });
  };

  const removePackage = (index) => {
    setFormData({
      ...formData,
      packages: formData.packages.filter((_, i) => i !== index)
    });
  };

  const openCalendarEdit = (calendar) => {
    setEditingCalendar(calendar);
    setCalendarEditData({
      name: calendar.name,
      url: calendar.url,
      weight: calendar.weight || 1,
      owner_name: calendar.owner_name || ''
    });
  };

  const saveCalendarEdit = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/calendars/${editingCalendar.id}`, calendarEditData, getAuthHeaders());
      fetchCalendars();
      setEditingCalendar(null);
    } catch (err) {
      alert('Error saving calendar');
    }
  };

  const addNewCalendar = async () => {
    const name = prompt('Enter team member name (e.g., John Smith):');
    if (!name) return;
    const url = prompt('Enter their calendar URL (e.g., https://calendly.com/john-smith/consultation):');
    if (!url) return;
    
    try {
      await axios.post(`${API_URL}/api/admin/calendars`, {
        name: `${name} Calendar`,
        url: url,
        owner_name: name,
        weight: 1,
        is_active: true
      }, getAuthHeaders());
      fetchCalendars();
    } catch (err) {
      alert('Error adding calendar');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intake Forms</h1>
          <p className="text-gray-600">Manage your client intake form configurations</p>
        </div>
        <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Create New Form
        </Button>
      </div>

      {/* Forms List */}
      <div className="grid gap-4">
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No intake forms configured yet. Create your first form to get started.
          </div>
        ) : (
          forms.map((form) => (
            <div key={form.id} className={`bg-white rounded-lg border p-5 ${form.is_active ? 'border-green-200' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                    {form.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{form.description || 'No description'}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Link className="w-4 h-4 mr-1" />
                      <span>/{form.slug}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{(form.calendar_ids || []).length} calendars</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Package className="w-4 h-4 mr-1" />
                      <span>{(form.packages || []).length} packages</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => window.open(`/${form.slug}`, '_blank')} title="Preview Form">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(form.id)} title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openModal(form)} title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(form.id)} className="text-red-500 hover:text-red-700" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calendar Edit Modal */}
      {editingCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Edit Team Member Calendar</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input 
                  value={calendarEditData.name} 
                  onChange={(e) => setCalendarEditData({ ...calendarEditData, name: e.target.value })} 
                  placeholder="e.g., John Smith Calendar" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calendar URL *</label>
                <Input 
                  value={calendarEditData.url} 
                  onChange={(e) => setCalendarEditData({ ...calendarEditData, url: e.target.value })} 
                  placeholder="https://calendly.com/john-smith/consultation" 
                />
                <p className="text-xs text-gray-500 mt-1">This is the booking link where leads will be sent</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Owner Name</label>
                <Input 
                  value={calendarEditData.owner_name || ''} 
                  onChange={(e) => setCalendarEditData({ ...calendarEditData, owner_name: e.target.value })} 
                  placeholder="John Smith" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (1-10)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={calendarEditData.weight} 
                  onChange={(e) => setCalendarEditData({ ...calendarEditData, weight: parseInt(e.target.value) || 1 })} 
                />
                <p className="text-xs text-gray-500 mt-1">Higher weight = more lead assignments in round-robin</p>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingCalendar(null)}>Cancel</Button>
              <Button onClick={saveCalendarEdit} className="bg-green-600 hover:bg-green-700">Save Calendar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold">{editingForm ? 'Edit Form' : 'Create New Form'}</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b">
              {['basic', 'routing', 'packages', 'crm'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                >
                  {tab === 'crm' ? 'CRM Settings' : tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Basic Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Form Name *</label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Main Intake Form" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL Slug *</label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">/</span>
                        <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="intake" required />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Header Title</label>
                    <Input value={formData.header_title} onChange={(e) => setFormData({ ...formData, header_title: e.target.value })} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Header Subtitle</label>
                    <Input value={formData.header_subtitle} onChange={(e) => setFormData({ ...formData, header_subtitle: e.target.value })} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                    <label htmlFor="is_active" className="text-sm">Form is Active</label>
                  </div>
                </div>
              )}

              {/* Routing Tab */}
              {activeTab === 'routing' && (
                <div className="space-y-6">
                  {/* Hot Leads - Credit Report */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">🔥 Hot Leads (Score 59+)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Credit Report URL</label>
                        <Input value={formData.credit_report_url} onChange={(e) => setFormData({ ...formData, credit_report_url: e.target.value })} placeholder="https://credlocity.scorexer.com/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Button Text</label>
                        <Input value={formData.credit_report_button_text} onChange={(e) => setFormData({ ...formData, credit_report_button_text: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Warm/Cold Leads - Calendars */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📅 Warm/Cold Leads - Calendar Routing</h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Select Team Members for Round-Robin</label>
                        <Button type="button" variant="outline" size="sm" onClick={addNewCalendar}>
                          <Plus className="w-4 h-4 mr-1" /> Add Team Member
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {calendars.length === 0 ? (
                          <p className="text-sm text-gray-500">No team members configured. Click "Add Team Member" to add calendars.</p>
                        ) : (
                          calendars.map((cal) => (
                            <div key={cal.id} className="border rounded bg-white">
                              <div className="flex items-center gap-2 p-3">
                                <input
                                  type="checkbox"
                                  checked={(formData.calendar_ids || []).includes(cal.id)}
                                  onChange={() => toggleCalendar(cal.id)}
                                  className="rounded"
                                />
                                <div className="flex-1">
                                  <button
                                    type="button"
                                    onClick={() => openCalendarEdit(cal)}
                                    className="font-medium text-blue-600 hover:underline text-left"
                                  >
                                    {cal.name}
                                  </button>
                                  <p className="text-xs text-gray-500 truncate">{cal.url}</p>
                                </div>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Weight: {cal.weight}</span>
                                {cal.is_active ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-400" />}
                                <button
                                  type="button"
                                  onClick={() => openCalendarEdit(cal)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Edit Calendar"
                                >
                                  <Edit className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click on a team member's name to edit their calendar link. Higher weight = more lead assignments.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Default Calendar URL (fallback)</label>
                      <Input value={formData.default_calendar_url} onChange={(e) => setFormData({ ...formData, default_calendar_url: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Warm Lead Button Text</label>
                        <Input value={formData.warm_lead_button_text} onChange={(e) => setFormData({ ...formData, warm_lead_button_text: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cold Lead Button Text</label>
                        <Input value={formData.cold_lead_button_text} onChange={(e) => setFormData({ ...formData, cold_lead_button_text: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Packages Tab */}
              {activeTab === 'packages' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Package Options (Step 3)</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addPackage}>
                      <Plus className="w-4 h-4 mr-1" /> Add Package
                    </Button>
                  </div>

                  {formData.packages.map((pkg, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium">Package {index + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removePackage(index)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Key (internal)</label>
                          <Input value={pkg.key} onChange={(e) => updatePackage(index, 'key', e.target.value)} placeholder="aggressive" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Name (display)</label>
                          <Input value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} placeholder="Aggressive Package" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Price ($/month)</label>
                          <Input type="number" step="0.01" value={pkg.price} onChange={(e) => updatePackage(index, 'price', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Description</label>
                          <Input value={pkg.description} onChange={(e) => updatePackage(index, 'description', e.target.value)} placeholder="Short description" />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Upfront Fees</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Credit Report Fee ($)</label>
                        <Input type="number" step="0.01" value={formData.credit_report_fee} onChange={(e) => setFormData({ ...formData, credit_report_fee: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">E-Notary Fee ($)</label>
                        <Input type="number" step="0.01" value={formData.enotary_fee} onChange={(e) => setFormData({ ...formData, enotary_fee: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CRM Tab */}
              {activeTab === 'crm' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="crm_enabled" checked={formData.crm_enabled} onChange={(e) => setFormData({ ...formData, crm_enabled: e.target.checked })} className="rounded" />
                    <label htmlFor="crm_enabled" className="font-medium">Enable CRM Integration</label>
                  </div>

                  {formData.crm_enabled && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <p className="text-sm text-gray-600">Form submissions will be sent to: <code className="bg-gray-200 px-1 rounded">pulse.disputeprocess.com/CustumFieldController</code></p>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tab Info ID</label>
                        <Input value={formData.crm_tab_info_id} onChange={(e) => setFormData({ ...formData, crm_tab_info_id: e.target.value })} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Company ID</label>
                        <Input value={formData.crm_company_id} onChange={(e) => setFormData({ ...formData, crm_company_id: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                {editingForm ? 'Save Changes' : 'Create Form'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntakeFormsManager;
