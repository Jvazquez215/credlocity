import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, LayoutDashboard, FileText, Upload, BarChart3, 
  Settings, LogOut, CreditCard, Users, Bell, ChevronRight,
  Plus, Eye, TrendingUp, DollarSign, Clock, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import api from '../../utils/api';

// Lazy loaded components
const CaseSubmissionWizard = lazy(() => import('./CaseSubmissionWizard'));
const SubscriptionManagement = lazy(() => import('./SubscriptionManagement'));

const LazyLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

const CaseSubmissionWizardLazy = () => (
  <Suspense fallback={<LazyLoader />}>
    <CaseSubmissionWizard />
  </Suspense>
);

const SubscriptionManagementLazy = () => (
  <Suspense fallback={<LazyLoader />}>
    <SubscriptionManagement />
  </Suspense>
);

// Dashboard Home Component
const DashboardHome = ({ company, subscription, analytics }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {company?.company_name || 'Company'}</h1>
        <p className="text-blue-100">Manage your cases and track your marketplace performance</p>
        <div className="mt-4 flex gap-3">
          <Link to="/company/cases/new">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Case
            </Button>
          </Link>
          <Link to="/company/cases">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Eye className="w-4 h-4 mr-2" />
              View Cases
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card className={`border-l-4 ${subscription.status === 'active' ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-semibold">Subscription: {subscription.plan_name || 'Standard'}</p>
                <p className="text-sm text-gray-500">
                  Status: <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {subscription.status}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Next billing</p>
              <p className="font-medium">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cases</p>
                <p className="text-3xl font-bold">{analytics?.current_period?.cases_submitted || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-3xl font-bold">{analytics?.current_period?.cases_published || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cases Sold</p>
                <p className="text-3xl font-bold">{analytics?.current_period?.cases_sold || 0}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue Earned</p>
                <p className="text-3xl font-bold">${(analytics?.current_period?.revenue_earned || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/company/cases/new">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Submit a Case</p>
                <p className="text-sm text-gray-500">Create a new FCRA case</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/company/analytics">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">View Analytics</p>
                <p className="text-sm text-gray-500">Performance metrics</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/company/settings">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">Company Settings</p>
                <p className="text-sm text-gray-500">Manage your account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

// Cases List Component (Placeholder)
const CasesList = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">My Cases</h1>
      <Link to="/company/cases/new">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </Link>
    </div>
    <Card>
      <CardContent className="p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No Cases Yet</h3>
        <p className="text-gray-500 mb-4">Start by submitting your first FCRA case to the marketplace</p>
        <Link to="/company/cases/new">
          <Button>Submit Your First Case</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);

// Main Company Dashboard
const CompanyDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('company_token');
    if (!token) {
      navigate('/company/login');
      return;
    }

    fetchCompanyData();
  }, [navigate]); // eslint-disable-line

  const fetchCompanyData = async () => {
    const token = localStorage.getItem('company_token');
    try {
      const [companyRes, analyticsRes] = await Promise.all([
        api.get('/companies/me', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/companies/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);

      setCompany(companyRes.data.company);
      setSubscription(companyRes.data.subscription);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_user');
    localStorage.removeItem('company_info');
    navigate('/company/login');
  };

  const isActivePath = (to) => {
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-gray-900">Credlocity</h1>
              <p className="text-xs text-gray-500">Company Portal</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <Link to="/company/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/dashboard') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5" /><span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/company/cases" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/cases') && !isActivePath('/company/cases/new') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FileText className="w-5 h-5" /><span className="font-medium">My Cases</span>
          </Link>
          <Link to="/company/cases/new" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/cases/new') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Upload className="w-5 h-5" /><span className="font-medium">Submit Case</span>
          </Link>
          <Link to="/company/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/analytics') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BarChart3 className="w-5 h-5" /><span className="font-medium">Analytics</span>
          </Link>
          <Link to="/company/team" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/team') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5" /><span className="font-medium">Team</span>
          </Link>
          <Link to="/company/subscription" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/subscription') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <CreditCard className="w-5 h-5" /><span className="font-medium">Subscription</span>
          </Link>
          <Link to="/company/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/company/settings') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings className="w-5 h-5" /><span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{company?.company_name}</p>
              <p className="text-xs text-gray-500 truncate">{company?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route index element={<DashboardHome company={company} subscription={subscription} analytics={analytics} />} />
          <Route path="dashboard" element={<DashboardHome company={company} subscription={subscription} analytics={analytics} />} />
          <Route path="cases" element={<CasesList />} />
          <Route path="cases/new" element={<CaseSubmissionWizardLazy />} />
          <Route path="analytics" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Analytics Dashboard Coming Soon</h2></div>} />
          <Route path="team" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Team Management Coming Soon</h2></div>} />
          <Route path="subscription" element={<SubscriptionManagementLazy />} />
          <Route path="settings" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Company Settings Coming Soon</h2></div>} />
        </Routes>
      </main>
    </div>
  );
};

export default CompanyDashboard;
