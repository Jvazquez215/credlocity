import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, LayoutDashboard, Clock, Receipt, AlertCircle, 
  Settings, LogOut, FileText, TrendingUp, DollarSign,
  Plus, ChevronRight, CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import api from '../../utils/api';

// Dashboard Home Component
const DashboardHome = ({ partner, stats }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome, {partner?.company_name || 'Partner'}</h1>
        <p className="text-emerald-100">Manage your work logs, invoices, and support tickets</p>
        <div className="mt-4 flex gap-3">
          <Link to="/partner/work-logs/new">
            <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
              <Plus className="w-4 h-4 mr-2" />
              Log Work Hours
            </Button>
          </Link>
          <Link to="/partner/tickets/new">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <AlertCircle className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hours This Month</p>
                <p className="text-3xl font-bold">{stats?.hours_this_month || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Invoices</p>
                <p className="text-3xl font-bold">{stats?.pending_invoices || 0}</p>
              </div>
              <Receipt className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Tickets</p>
                <p className="text-3xl font-bold">{stats?.open_tickets || 0}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earned</p>
                <p className="text-3xl font-bold">${(stats?.total_earned || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/partner/work-logs">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold">Work Logs</p>
                <p className="text-sm text-gray-500">Track your hours</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/partner/invoices">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Invoices</p>
                <p className="text-sm text-gray-500">View payments</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/partner/tickets">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold">Support Tickets</p>
                <p className="text-sm text-gray-500">Get help</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Partner Status */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={`${partner?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {partner?.status || 'Active'}
            </Badge>
            <span className="text-gray-500">|</span>
            <span className="text-sm text-gray-600">Partner since: {partner?.created_at ? new Date(partner.created_at).toLocaleDateString() : 'N/A'}</span>
            <span className="text-gray-500">|</span>
            <span className="text-sm text-gray-600">Rate: ${partner?.hourly_rate || 0}/hr</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Placeholder components
const WorkLogs = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Work Logs</h1>
      <Button className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="w-4 h-4 mr-2" />
        Log Hours
      </Button>
    </div>
    <Card>
      <CardContent className="p-12 text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No Work Logs Yet</h3>
        <p className="text-gray-500">Start logging your work hours</p>
      </CardContent>
    </Card>
  </div>
);

const Invoices = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Invoices</h1>
    <Card>
      <CardContent className="p-12 text-center">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No Invoices</h3>
        <p className="text-gray-500">Your invoices will appear here</p>
      </CardContent>
    </Card>
  </div>
);

const Tickets = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <Button className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="w-4 h-4 mr-2" />
        New Ticket
      </Button>
    </div>
    <Card>
      <CardContent className="p-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No Tickets</h3>
        <p className="text-gray-500">Submit a ticket if you need assistance</p>
      </CardContent>
    </Card>
  </div>
);

// Main Partner Dashboard
const PartnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('partner_token');
    if (!token) {
      navigate('/partner/login');
      return;
    }

    fetchPartnerData();
  }, [navigate]); // eslint-disable-line

  const fetchPartnerData = async () => {
    try {
      // For now, use stored partner info
      const storedPartner = localStorage.getItem('partner_info');
      if (storedPartner) {
        setPartner(JSON.parse(storedPartner));
      }
      
      // Mock stats for now
      setStats({
        hours_this_month: 0,
        pending_invoices: 0,
        open_tickets: 0,
        total_earned: 0
      });
    } catch (error) {
      console.error('Error fetching partner data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_info');
    navigate('/partner/login');
  };

  const isActivePath = (to) => {
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="font-bold text-gray-900">Credlocity</h1>
              <p className="text-xs text-gray-500">Partner Portal</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <Link to="/partner/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/partner/dashboard') ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5" /><span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/partner/work-logs" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/partner/work-logs') ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Clock className="w-5 h-5" /><span className="font-medium">Work Logs</span>
          </Link>
          <Link to="/partner/invoices" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/partner/invoices') ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Receipt className="w-5 h-5" /><span className="font-medium">Invoices</span>
          </Link>
          <Link to="/partner/tickets" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/partner/tickets') ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <AlertCircle className="w-5 h-5" /><span className="font-medium">Tickets</span>
          </Link>
          <Link to="/partner/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActivePath('/partner/settings') ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings className="w-5 h-5" /><span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{partner?.company_name || 'Partner'}</p>
              <p className="text-xs text-gray-500 truncate">{partner?.email}</p>
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
          <Route index element={<DashboardHome partner={partner} stats={stats} />} />
          <Route path="dashboard" element={<DashboardHome partner={partner} stats={stats} />} />
          <Route path="work-logs" element={<WorkLogs />} />
          <Route path="work-logs/new" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Log Work Hours Form Coming Soon</h2></div>} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/new" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">New Ticket Form Coming Soon</h2></div>} />
          <Route path="settings" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Partner Settings Coming Soon</h2></div>} />
        </Routes>
      </main>
    </div>
  );
};

export default PartnerDashboard;
