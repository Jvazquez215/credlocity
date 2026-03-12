import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import { 
  Building2, Search, Eye, Ban, CheckCircle, Users, Briefcase, 
  TrendingUp, ArrowLeft, Clock, AlertTriangle
} from 'lucide-react';

const CompaniesManager = () => {
  return (
    <Routes>
      <Route index element={<CompaniesList />} />
      <Route path=":companyId" element={<CompanyDetail />} />
    </Routes>
  );
};

const CompaniesList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, [filterStatus]);

  const fetchCompanies = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.get('/companies/admin/list', { params });
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/companies/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending_payment: 'bg-yellow-100 text-yellow-700',
      trial: 'bg-blue-100 text-blue-700',
      past_due: 'bg-orange-100 text-orange-700',
      suspended: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      cancelling: 'bg-orange-100 text-orange-700'
    };
    return colors[status] || colors.pending_payment;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredCompanies = companies.filter(company => 
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="companies-manager">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Companies</p>
                <p className="text-xl font-bold">{stats.companies?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-xl font-bold">{stats.companies?.active || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Payment</p>
                <p className="text-xl font-bold">{stats.companies?.pending || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Suspended</p>
                <p className="text-xl font-bold">{stats.companies?.suspended || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </form>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="trial">Trial</option>
          <option value="past_due">Past Due</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {filteredCompanies.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Tier</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Cases</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Revenue</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company.company_name}</p>
                        <p className="text-sm text-gray-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{company.owner_name}</p>
                    <p className="text-sm text-gray-500">{company.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(company.subscription_status)}`}>
                      {company.subscription_status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                      {company.subscription_tier || 'standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium">{company.total_cases_submitted || 0}</p>
                    <p className="text-sm text-gray-500">{company.total_cases_sold || 0} sold</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">
                    ${(company.total_revenue_earned || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {formatDate(company.signup_date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/admin/billing/companies/${company.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Companies Found</h3>
            <p className="text-gray-500">Companies will appear here when they sign up</p>
          </div>
        )}
      </div>

      {/* Top Companies by Cases */}
      {stats?.top_companies_by_cases && stats.top_companies_by_cases.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies by Cases</h3>
          <div className="space-y-3">
            {stats.top_companies_by_cases.map((item, idx) => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-white' : 
                    idx === 1 ? 'bg-gray-400 text-white' : 
                    idx === 2 ? 'bg-orange-400 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium">{item.company_name}</span>
                </div>
                <span className="font-bold text-primary-blue">{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyDetail = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const companyId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      const response = await api.get(`/companies/admin/${companyId}`);
      setCompany(response.data.company);
      setSubscription(response.data.subscription);
      setUsers(response.data.users || []);
      setCases(response.data.recent_cases || []);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    const reason = prompt('Enter reason for suspension:');
    if (!reason) return;
    
    try {
      await api.post(`/companies/admin/${companyId}/suspend`, { reason });
      toast.success('Company suspended');
      fetchCompanyDetails();
    } catch (error) {
      console.error('Error suspending company:', error);
      toast.error('Failed to suspend company');
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Are you sure you want to reactivate this company?')) return;
    
    try {
      await api.post(`/companies/admin/${companyId}/reactivate`);
      toast.success('Company reactivated');
      fetchCompanyDetails();
    } catch (error) {
      console.error('Error reactivating company:', error);
      toast.error('Failed to reactivate company');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending_payment: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || colors.pending_payment;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Company Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/admin/billing/companies')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="company-detail">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/billing/companies')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(company.subscription_status)}`}>
            {company.subscription_status?.replace('_', ' ')}
          </span>
        </div>
        <div className="flex gap-2">
          {company.subscription_status === 'suspended' ? (
            <Button onClick={handleReactivate}>
              <CheckCircle className="w-4 h-4 mr-2" /> Reactivate
            </Button>
          ) : company.subscription_status === 'active' && (
            <Button variant="outline" className="text-red-600" onClick={handleSuspend}>
              <Ban className="w-4 h-4 mr-2" /> Suspend
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium">{company.owner_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{company.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{company.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <p className="font-medium">{company.website || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{company.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium capitalize">{company.business_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years in Business</p>
                <p className="font-medium">{company.years_in_business || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Clients Served</p>
                <p className="font-medium">{company.clients_served || '-'}</p>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Users ({users.length})</h3>
            {users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>

          {/* Recent Cases */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Cases</h3>
            {cases.length > 0 ? (
              <div className="space-y-3">
                {cases.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{caseItem.case_number}</p>
                      <p className="text-sm text-gray-500">{caseItem.client_name} - {caseItem.client_state}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      caseItem.status === 'published' ? 'bg-green-100 text-green-700' :
                      caseItem.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {caseItem.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No cases submitted yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium capitalize">{company.subscription_tier || 'Standard'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Signup Fee</p>
                <p className="font-medium">
                  ${company.signup_fee_amount || 500}
                  <span className={`ml-2 text-xs ${company.signup_fee_paid ? 'text-green-600' : 'text-red-600'}`}>
                    ({company.signup_fee_paid ? 'Paid' : 'Unpaid'})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Fee</p>
                <p className="font-medium">${company.monthly_fee_amount || 199.99}/month</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Signup Date</p>
                <p className="font-medium">{formatDate(company.signup_date)}</p>
              </div>
              {subscription && (
                <div>
                  <p className="text-sm text-gray-500">Next Billing</p>
                  <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cases Submitted</span>
                <span className="font-bold text-xl">{company.total_cases_submitted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cases Sold</span>
                <span className="font-bold text-xl text-green-600">{company.total_cases_sold || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Revenue</span>
                <span className="font-bold text-xl text-primary-blue">${(company.total_revenue_earned || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Suspension Info */}
          {company.subscription_status === 'suspended' && company.suspension_reason && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Suspended</h3>
              <p className="text-sm text-red-600">Reason: {company.suspension_reason}</p>
              <p className="text-sm text-red-500 mt-2">Suspended on: {formatDate(company.suspended_at)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompaniesManager;
