import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Flame, Sun, Snowflake, Search, Filter, Eye, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLead, setFilterLead] = useState('all');
  const [filterDays, setFilterDays] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filterLead, filterDays]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      let params = {};
      if (filterLead !== 'all') params.lead_status = filterLead;
      if (filterDays !== 'all') params.days = parseInt(filterDays);
      
      const [clientsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/clients`, { headers, params }),
        axios.get(`${API_URL}/api/admin/clients/stats`, { headers })
      ]);
      
      setClients(clientsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = `${client.first_name} ${client.last_name} ${client.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getLeadStatusBadge = (status) => {
    const badges = {
      hot: { icon: Flame, class: 'bg-red-100 text-red-700 border-red-200', label: 'Hot' },
      warm: { icon: Sun, class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Warm' },
      cold: { icon: Snowflake, class: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Cold' }
    };
    const badge = badges[status] || badges.cold;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
        <Icon className="w-3 h-3" /> {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-purple-100 text-purple-700',
      contacted: 'bg-blue-100 text-blue-700',
      consultation_scheduled: 'bg-green-100 text-green-700',
      converted: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-gray-100 text-gray-700'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.new}`}>{status?.replace(/_/g, ' ') || 'New'}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-500">Manage leads and clients from intake forms</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-green-600 opacity-50" />
            </div>
            <div className="mt-3 flex gap-2">
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1"><Flame className="w-3 h-3" /> {stats.by_lead_status?.hot || 0} Hot</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1"><Sun className="w-3 h-3" /> {stats.by_lead_status?.warm || 0} Warm</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"><Snowflake className="w-3 h-3" /> {stats.by_lead_status?.cold || 0} Cold</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last 30 Days</p>
                <p className="text-3xl font-bold text-gray-900">{stats.by_period?.last_30_days?.count || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <span className="text-green-600 font-medium">15d:</span> {stats.by_period?.last_15_days?.count || 0} | 
              <span className="text-green-600 font-medium ml-2">7d:</span> {stats.by_period?.last_7_days?.count || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upfront Income (30d)</p>
                <p className="text-3xl font-bold text-green-600">${(stats.by_period?.last_30_days?.income?.upfront || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
            </div>
            <p className="mt-3 text-xs text-gray-500">Credit Report + E-Notary Fees</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Est. Monthly (After Trial)</p>
                <p className="text-3xl font-bold text-blue-600">${(stats.income?.monthly_after_trial || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
            <p className="mt-3 text-xs text-gray-500">Based on selected packages</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <Select value={filterLead} onValueChange={setFilterLead}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Lead Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="warm">☀️ Warm</SelectItem>
              <SelectItem value="cold">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="consultation_scheduled">Consultation Scheduled</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDays} onValueChange={setFilterDays}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Time Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="15">Last 15 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lead Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Package</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Agreement</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getLeadStatusBadge(client.lead_status)}
                      <span className="text-xs text-gray-500">({client.assessment_score || 0})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{client.package_name || 'TBD'}</p>
                    {client.package_price > 0 && <p className="text-xs text-green-600">${client.package_price}/mo</p>}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(client.status)}</td>
                  <td className="px-4 py-3">
                    {client.agreement_signed ? (
                      <span className="text-green-600 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Signed</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No clients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Check = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

export default ClientsList;
