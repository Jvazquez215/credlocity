import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Calendar, Check, X, RotateCcw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CalendarsManager = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', owner_name: '', weight: 1, is_active: true });

  useEffect(() => {
    fetchCalendars();
  }, []);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  });

  const fetchCalendars = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/calendars`, getAuthHeaders());
      setCalendars(res.data);
    } catch (err) {
      console.error('Error fetching calendars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCalendar) {
        await axios.put(`${API_URL}/api/admin/calendars/${editingCalendar.id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API_URL}/api/admin/calendars`, formData, getAuthHeaders());
      }
      fetchCalendars();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving calendar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this calendar?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/calendars/${id}`, getAuthHeaders());
      fetchCalendars();
    } catch (err) {
      alert('Error deleting calendar');
    }
  };

  const resetAssignments = async (id) => {
    if (!window.confirm('Reset assignment count for this calendar?')) return;
    try {
      await axios.put(`${API_URL}/api/admin/calendars/${id}`, { total_assignments: 0, last_assigned: null }, getAuthHeaders());
      fetchCalendars();
    } catch (err) {
      alert('Error resetting calendar');
    }
  };

  const openModal = (calendar = null) => {
    if (calendar) {
      setEditingCalendar(calendar);
      setFormData({
        name: calendar.name,
        url: calendar.url,
        owner_name: calendar.owner_name || '',
        weight: calendar.weight || 1,
        is_active: calendar.is_active !== false
      });
    } else {
      setEditingCalendar(null);
      setFormData({ name: '', url: '', owner_name: '', weight: 1, is_active: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCalendar(null);
    setFormData({ name: '', url: '', owner_name: '', weight: 1, is_active: true });
  };

  const totalWeight = calendars.filter(c => c.is_active).reduce((sum, c) => sum + (c.weight || 1), 0);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendars</h1>
          <p className="text-gray-600">Manage calendars for round-robin scheduling</p>
        </div>
        <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Add Calendar
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📅 Round-Robin Scheduling</h3>
        <p className="text-sm text-blue-700">
          When multiple calendars are assigned to a form, leads are distributed based on weight. 
          Higher weight = more assignments. A calendar with weight 2 gets twice as many leads as weight 1.
        </p>
      </div>

      {/* Calendars List */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium">Calendar</th>
              <th className="text-left p-4 font-medium">URL</th>
              <th className="text-center p-4 font-medium">Weight</th>
              <th className="text-center p-4 font-medium">Distribution</th>
              <th className="text-center p-4 font-medium">Assignments</th>
              <th className="text-center p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calendars.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No calendars configured. Add your first calendar to enable round-robin scheduling.
                </td>
              </tr>
            ) : (
              calendars.map((cal) => (
                <tr key={cal.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{cal.name}</p>
                        {cal.owner_name && <p className="text-xs text-gray-500">{cal.owner_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <a href={cal.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate block max-w-xs">
                      {cal.url}
                    </a>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-gray-100 rounded font-medium">{cal.weight || 1}</span>
                  </td>
                  <td className="p-4 text-center">
                    {cal.is_active && totalWeight > 0 ? (
                      <span className="text-green-600 font-medium">
                        {Math.round(((cal.weight || 1) / totalWeight) * 100)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium">{cal.total_assignments || 0}</span>
                  </td>
                  <td className="p-4 text-center">
                    {cal.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        <X className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => resetAssignments(cal.id)} title="Reset Assignments">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openModal(cal)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cal.id)} className="text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{editingCalendar ? 'Edit Calendar' : 'Add Calendar'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Calendar Name *</label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., John's Calendar" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Booking URL *</label>
                <Input 
                  value={formData.url} 
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
                  placeholder="https://calendly.com/..." 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Owner Name</label>
                <Input 
                  value={formData.owner_name} 
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} 
                  placeholder="e.g., John Smith" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Weight</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={formData.weight} 
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })} 
                />
                <p className="text-xs text-gray-500 mt-1">Higher weight = more lead assignments (1-10)</p>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  checked={formData.is_active} 
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} 
                  className="rounded" 
                />
                <label htmlFor="is_active">Calendar is Active</label>
              </div>
            </form>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                {editingCalendar ? 'Save Changes' : 'Add Calendar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarsManager;
