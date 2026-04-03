import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import {
  Building2, LayoutDashboard, FileText, Search, DollarSign,
  CreditCard, Settings, LogOut, User, ChevronRight,
  TrendingUp, Clock, AlertTriangle, RefreshCw, Briefcase,
  MessageSquare, Bell, Menu, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

import CROCaseSubmit from './CROCaseSubmit';
import CROCaseTracker from './CROCaseTracker';
import CROEarnings from './CROEarnings';
import CROSubscription from './CROSubscription';
import CROSettings from './CROSettings';
import CROMessages from './CROMessages';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

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

function DashboardHome({ dashboard }) {
  const getStatusColor = (status) => {
    const colors = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      listed: 'bg-indigo-100 text-indigo-800',
      pledged: 'bg-purple-100 text-purple-800',
      bidding: 'bg-orange-100 text-orange-800',
      awarded: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900" data-testid="cro-dashboard-welcome">
          Welcome back
        </h1>
        <p className="text-gray-500 mt-1">Here's your CRO partnership overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Cases" value={dashboard?.summary?.total_cases || 0} subtitle="All submissions" icon={Briefcase} gradient="bg-gradient-to-br from-blue-500 to-teal-600" />
        <StatCard title="Active Cases" value={(dashboard?.summary?.listed_cases || 0) + (dashboard?.summary?.pledged_cases || 0) + (dashboard?.summary?.bidding_cases || 0)} subtitle="In marketplace" icon={Search} gradient="bg-gradient-to-br from-orange-400 to-amber-500" />
        <StatCard title="Total Earnings" value={formatCurrency(dashboard?.summary?.total_earnings)} subtitle="All time" icon={DollarSign} gradient="bg-gradient-to-br from-green-500 to-emerald-600" trend />
        <StatCard title="Pending Payouts" value={formatCurrency(dashboard?.summary?.pending_payouts)} subtitle="Processing" icon={Clock} gradient="bg-gradient-to-br from-purple-500 to-pink-500" />
      </div>

      {(dashboard?.summary?.rejected_cases > 0 || dashboard?.summary?.unread_messages > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {dashboard?.summary?.rejected_cases > 0 && (
            <Link to="/cro/cases?status=rejected" className="block">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-50 border-red-200 text-red-700 hover:shadow-md transition-shadow">
                <AlertTriangle className="w-5 h-5" />
                <div className="flex-1"><span className="font-medium">Rejected Cases</span></div>
                <span className="text-lg font-bold">{dashboard.summary.rejected_cases}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          )}
          {dashboard?.summary?.unread_messages > 0 && (
            <Link to="/cro/messages" className="block">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-teal-50 border-teal-200 text-teal-700 hover:shadow-md transition-shadow">
                <MessageSquare className="w-5 h-5" />
                <div className="flex-1"><span className="font-medium">Unread Messages</span></div>
                <span className="text-lg font-bold">{dashboard.summary.unread_messages}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Your latest case submissions</CardDescription>
              </div>
              <Link to="/cro/cases">
                <Button variant="outline" size="sm">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboard?.recent_cases?.length > 0 ? (
                dashboard.recent_cases.map((c) => (
                  <div key={c.id} className="border-b last:border-b-0 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-500">{c.case_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                            {c.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="font-medium mt-1">{c.client_name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {c.violation_type} &middot; Est. Value: {formatCurrency(c.estimated_value)}
                        </p>
                      </div>
                      <Link to={`/cro/cases?selected=${c.id}`}>
                        <Button variant="ghost" size="sm"><Search className="w-4 h-4 mr-1" /> View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No cases submitted yet</p>
                  <Link to="/cro/submit-case">
                    <Button variant="outline" className="mt-4">Submit Your First Case</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/cro/submit-case" className="block">
                <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" />Submit New Case</Button>
              </Link>
              <Link to="/cro/cases" className="block">
                <Button variant="outline" className="w-full justify-start"><Search className="w-4 h-4 mr-2" />Track My Cases</Button>
              </Link>
              <Link to="/cro/earnings" className="block">
                <Button variant="outline" className="w-full justify-start"><DollarSign className="w-4 h-4 mr-2" />View Earnings</Button>
              </Link>
              <Link to="/cro/messages" className="block">
                <Button variant="outline" className="w-full justify-start text-teal-600 border-teal-200 hover:bg-teal-50"><MessageSquare className="w-4 h-4 mr-2" />Messages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Case Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Pending Review', count: dashboard?.summary?.pending_cases || 0, color: 'bg-yellow-500' },
                  { label: 'Listed / Bidding', count: (dashboard?.summary?.listed_cases || 0) + (dashboard?.summary?.bidding_cases || 0), color: 'bg-blue-500' },
                  { label: 'Pledged', count: dashboard?.summary?.pledged_cases || 0, color: 'bg-purple-500' },
                  { label: 'Awarded', count: dashboard?.summary?.awarded_cases || 0, color: 'bg-green-500' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function CRODashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const croUser = JSON.parse(localStorage.getItem('cro_user') || '{}');

  const getToken = () => localStorage.getItem('cro_token');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cro/dashboard`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.status === 401 || response.status === 403) {
        navigate('/cro/login');
        return;
      }
      if (response.ok) {
        setDashboard(await response.json());
      } else {
        setError('Failed to load dashboard');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cro/unread-count`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread || 0);
      }
    } catch {}
  };

  useEffect(() => {
    if (!getToken()) { navigate('/cro/login'); return; }
    fetchDashboard();
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cro_token');
    localStorage.removeItem('cro_user');
    navigate('/cro/login');
  };

  const navItems = [
    { to: '/cro', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cro/submit-case', label: 'Submit Case', icon: FileText },
    { to: '/cro/cases', label: 'Case Tracker', icon: Search },
    { to: '/cro/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/cro/messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { to: '/cro/subscription', label: 'Subscription', icon: CreditCard },
    { to: '/cro/settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
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
    <div className="min-h-screen bg-gray-50" data-testid="cro-dashboard">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">CRO Portal</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.slice(0, 5).map(({ to, label, badge }) => (
                <Link key={to} to={to} className="text-gray-600 hover:text-teal-600 relative text-sm font-medium">
                  {label}
                  {badge > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span className="font-medium text-teal-700 text-sm">{formatCurrency(dashboard?.summary?.total_earnings)}</span>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 p-2" data-testid="cro-user-menu">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-sm">{croUser.company_name}</p>
                    <p className="text-xs text-gray-500">{croUser.email}</p>
                  </div>
                  <Link to="/cro/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account Settings</Link>
                  <Link to="/cro/subscription" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Subscription</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" data-testid="cro-logout-btn">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>

              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {badge > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<DashboardHome dashboard={dashboard} />} />
          <Route path="submit-case" element={<CROCaseSubmit token={getToken()} />} />
          <Route path="cases" element={<CROCaseTracker token={getToken()} />} />
          <Route path="earnings" element={<CROEarnings token={getToken()} />} />
          <Route path="messages" element={<CROMessages token={getToken()} />} />
          <Route path="subscription" element={<CROSubscription token={getToken()} />} />
          <Route path="settings" element={<CROSettings token={getToken()} />} />
        </Routes>
      </main>
    </div>
  );
}
