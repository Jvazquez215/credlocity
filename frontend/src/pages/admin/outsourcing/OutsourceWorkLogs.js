import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Plus, ClipboardList, Calendar, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const OutsourceWorkLogs = () => {
  const [logs, setLogs] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterPartner, setFilterPartner] = useState('');
  const [formData, setFormData] = useState({
    partner_id: '',
    work_date: new Date().toISOString().split('T')[0],
    disputes_processed: 0,
    letters_sent: 0,
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [filterPartner]);

  const fetchData = async () => {
    try {
      const [logsRes, partnersRes] = await Promise.all([
        api.get(`/admin/outsource/work-logs${filterPartner ? `?partner_id=${filterPartner}` : ''}`),
        api.get('/admin/outsource/partners')
      ]);
      setLogs(logsRes.data);
      setPartners(partnersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load work logs');
    } finally {
      setLoading(false);
    }
  };

  const getPartnerName = (id) => {
    const partner = partners.find(p => p.id === id);
    return partner?.company_name || 'Unknown Partner';
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.partner_id) {
      toast.error('Please select a partner');
      return;
    }

    try {
      await api.post('/admin/outsource/work-logs', formData);
      toast.success('Work log added successfully');
      setShowForm(false);
      setFormData({
        partner_id: '',
        work_date: new Date().toISOString().split('T')[0],
        disputes_processed: 0,
        letters_sent: 0,
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving work log:', error);
      toast.error('Failed to save work log');
    }
  };

  // Calculate totals
  const totalDisputes = logs.reduce((sum, log) => sum + (log.disputes_processed || 0), 0);
  const totalLetters = logs.reduce((sum, log) => sum + (log.letters_sent || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Work Logs</h2>
          <p className="text-gray-600 mt-1">Track disputes processed and letters sent for each partner</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Log Work
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Disputes Processed</p>
          <p className="text-2xl font-bold text-primary-blue">{totalDisputes.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Letters Sent</p>
          <p className="text-2xl font-bold text-green-600">{totalLetters.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Log Entries</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
      </div>

      {/* Add Work Log Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Add Work Log Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="partner_id">Partner *</Label>
                <select
                  id="partner_id"
                  name="partner_id"
                  value={formData.partner_id}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Partner...</option>
                  {partners.filter(p => p.status === 'active').map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.company_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="work_date">Date</Label>
                <Input
                  id="work_date"
                  name="work_date"
                  type="date"
                  value={formData.work_date}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="disputes_processed">Disputes Processed</Label>
                <Input
                  id="disputes_processed"
                  name="disputes_processed"
                  type="number"
                  value={formData.disputes_processed}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="letters_sent">Letters Sent</Label>
                <Input
                  id="letters_sent"
                  name="letters_sent"
                  type="number"
                  value={formData.letters_sent}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Notes about this work..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary-blue hover:bg-primary-dark">
                Save Work Log
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterPartner}
          onChange={(e) => setFilterPartner(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Partners</option>
          {partners.map(partner => (
            <option key={partner.id} value={partner.id}>{partner.company_name}</option>
          ))}
        </select>
      </div>

      {/* Work Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Work Logs Yet</h3>
          <p className="text-gray-500">Start logging work to track disputes processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Partner</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Disputes</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Letters</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {new Date(log.work_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{getPartnerName(log.partner_id)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-primary-blue">{log.disputes_processed || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-green-600">{log.letters_sent || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm">{log.description || '-'}</span>
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

export default OutsourceWorkLogs;