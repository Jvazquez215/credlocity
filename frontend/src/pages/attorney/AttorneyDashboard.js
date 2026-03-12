import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Gavel, 
  Wallet, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronRight,
  User,
  LogOut,
  RefreshCw,
  Eye,
  FileText,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import NotificationDropdown from '../../components/attorney/NotificationDropdown';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend }) => (
  <Card className="overflow-hidden">
    <div className={`p-6 ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
              {trend && <TrendingUp className="w-3 h-3" />}
              {subtitle}
            </p>
          )}
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  </Card>
);

// Alert Card
const AlertCard = ({ icon: Icon, title, count, color, link }) => (
  <Link to={link} className="block">
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${color} hover:shadow-md transition-shadow`}>
      <Icon className="w-5 h-5" />
      <div className="flex-1">
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-lg font-bold">{count}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  </Link>
);

// Case Card for Recent Cases
const RecentCaseCard = ({ case: caseItem }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'settled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border-b last:border-b-0 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-500">{caseItem.case_id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
              {caseItem.status?.replace('_', ' ')}
            </span>
          </div>
          <h4 className="font-medium mt-1">{caseItem.title}</h4>
          {caseItem.assignment && (
            <p className="text-sm text-gray-500 mt-1">
              Pledged: {new Date(caseItem.assignment.pledged_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <Link to={`/attorney/cases/${caseItem.case_id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        </Link>
      </div>
    </div>
  );
};

import { CasesNeedingUpdateCard } from './CaseUpdates';
import AttorneyAgreementModal from './AttorneyAgreementModal';

export default function AttorneyDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('attorney_token');

  const checkAgreementStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/attorney-agreement/status?token=${getToken()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.requires_agreement && !data.agreement_signed) {
          setShowAgreementModal(true);
        }
      }
    } catch (err) {
      console.error('Error checking agreement status:', err);
    } finally {
      setAgreementChecked(true);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/dashboard`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        navigate('/attorney/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      } else {
        setError('Failed to load dashboard');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }
    checkAgreementStatus();
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('attorney_token');
    navigate('/attorney/login');
  };

  const handleAgreementAccepted = () => {
    setShowAgreementModal(false);
    // Refresh dashboard after agreement
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboard}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Gavel className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Attorney Portal</span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/attorney" className="text-purple-600 font-medium">Dashboard</Link>
              <Link to="/attorney/cases" className="text-gray-600 hover:text-purple-600">My Cases</Link>
              <Link to="/attorney/marketplace" className="text-gray-600 hover:text-purple-600">Marketplace</Link>
              <Link to="/attorney/payments" className="text-gray-600 hover:text-purple-600">Payments</Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">
                  {formatCurrency(dashboard?.stats?.account_balance)}
                </span>
              </div>
              
              {/* Notification Dropdown */}
              <NotificationDropdown token={getToken()} />

              <div className="relative group">
                <button className="flex items-center gap-2 p-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 hidden group-hover:block">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-sm">{dashboard?.attorney?.name}</p>
                    <p className="text-xs text-gray-500">{dashboard?.attorney?.firm}</p>
                  </div>
                  <Link to="/attorney/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Profile
                  </Link>
                  <Link to="/attorney/reviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Reviews
                  </Link>
                  <Link to="/attorney/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {dashboard?.attorney?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your cases today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Cases"
            value={dashboard?.stats?.active_cases || 0}
            subtitle="+1 this month"
            icon={Briefcase}
            gradient="bg-gradient-to-br from-blue-500 to-purple-600"
            trend
          />
          <StatCard
            title="Available Cases"
            value={dashboard?.stats?.available_cases || 0}
            subtitle="2 new today"
            icon={Gavel}
            gradient="bg-gradient-to-br from-orange-400 to-yellow-500"
          />
          <StatCard
            title="Account Balance"
            value={formatCurrency(dashboard?.stats?.account_balance)}
            subtitle="For bidding"
            icon={Wallet}
            gradient="bg-gradient-to-br from-green-500 to-teal-500"
          />
          <StatCard
            title="Total Earned"
            value={formatCurrency(dashboard?.stats?.total_earnings)}
            subtitle="All time"
            icon={DollarSign}
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            trend
          />
        </div>

        {/* Cases Needing Update Card - 30 Day Requirement */}
        <div className="mb-8">
          <CasesNeedingUpdateCard token={getToken()} />
        </div>

        {/* Alerts & Actions */}
        {((dashboard?.alerts?.pending_payments || 0) > 0 || (dashboard?.alerts?.overdue_updates || 0) > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {dashboard?.alerts?.pending_payments > 0 && (
              <AlertCard
                icon={Clock}
                title="Pending Initial Fee Payments"
                count={dashboard.alerts.pending_payments}
                color="bg-yellow-50 border-yellow-200 text-yellow-700"
                link="/attorney/cases?filter=pending_payment"
              />
            )}
            {dashboard?.alerts?.overdue_updates > 0 && (
              <AlertCard
                icon={AlertTriangle}
                title="Overdue Status Updates"
                count={dashboard.alerts.overdue_updates}
                color="bg-red-50 border-red-200 text-red-700"
                link="/attorney/cases?filter=overdue_update"
              />
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Active Cases</CardTitle>
                  <CardDescription>Your current case assignments</CardDescription>
                </div>
                <Link to="/attorney/cases">
                  <Button variant="outline" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {dashboard?.recent_cases?.length > 0 ? (
                  dashboard.recent_cases.map((c) => (
                    <RecentCaseCard key={c.case_id} case={c} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No active cases yet</p>
                    <Link to="/attorney/marketplace">
                      <Button variant="outline" className="mt-4">
                        Browse Marketplace
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Performance */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/attorney/marketplace" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Gavel className="w-4 h-4 mr-2" />
                    Browse Available Cases
                  </Button>
                </Link>
                <Link to="/attorney/reviews" className="block">
                  <Button variant="outline" className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50">
                    <Star className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </Link>
                <Link to="/attorney/account/deposit" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Wallet className="w-4 h-4 mr-2" />
                    Add Funds for Bidding
                  </Button>
                </Link>
                <Link to="/attorney/payments" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Cases Completed</span>
                    <span className="font-medium">{dashboard?.performance?.cases_completed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {((dashboard?.performance?.success_rate || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Avg. Settlement</span>
                    <span className="font-medium">
                      {formatCurrency(dashboard?.performance?.average_settlement_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Bids Won</span>
                    <span className="font-medium">{dashboard?.performance?.bids_won || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Agreement Modal */}
      <AttorneyAgreementModal 
        isOpen={showAgreementModal}
        onClose={() => {}} // Cannot close without accepting
        onAccept={handleAgreementAccepted}
        token={getToken()}
      />
    </div>
  );
}
