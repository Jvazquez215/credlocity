import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import {
  DollarSign, Settings, Ticket, FileText, TrendingUp,
  Building2, CreditCard, Users, Receipt, Globe
} from 'lucide-react';

// Sub-components
import BillingSettingsManager from './BillingSettingsManager';
import CouponsManager from './CouponsManager';
import SubscriptionPlansManager from './SubscriptionPlansManager';
import InvoicesManager from './InvoicesManager';
import CompaniesManager from './CompaniesManager';
import WebsitePricingManager from './WebsitePricingManager';

// StatCard component
const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}% from last month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const BillingDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/billing/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching billing stats:', error);
      toast.error('Failed to load billing statistics');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { path: '/admin/billing', label: 'Overview', icon: TrendingUp, exact: true },
    { path: '/admin/billing/settings', label: 'Pricing Settings', icon: Settings },
    { path: '/admin/billing/coupons', label: 'Coupon Codes', icon: Ticket },
    { path: '/admin/billing/plans', label: 'Subscription Plans', icon: CreditCard },
    { path: '/admin/billing/website-pricing', label: 'Website Pricing', icon: Globe },
    { path: '/admin/billing/invoices', label: 'Invoices', icon: FileText },
    { path: '/admin/billing/companies', label: 'Companies', icon: Building2 },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Invoices" 
          value={stats?.invoices?.total || 0} 
          icon={FileText}
          color="blue"
        />
        <StatCard 
          title="Pending Invoices" 
          value={stats?.invoices?.pending || 0} 
          icon={Receipt}
          color="yellow"
        />
        <StatCard 
          title="Paid Invoices" 
          value={stats?.invoices?.paid || 0} 
          icon={DollarSign}
          color="green"
        />
        <StatCard 
          title="Active Coupons" 
          value={stats?.coupons?.active || 0} 
          icon={Ticket}
          color="purple"
        />
      </div>

      {/* Revenue by Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.revenue_by_status && Object.entries(stats.revenue_by_status).map(([status, data]) => (
            <div key={status} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 capitalize">{status}</p>
              <p className="text-xl font-bold text-gray-900">${(data.total || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500">{data.count || 0} invoices</p>
            </div>
          ))}
          {(!stats?.revenue_by_status || Object.keys(stats.revenue_by_status).length === 0) && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No revenue data available yet
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
        {stats?.monthly_revenue && stats.monthly_revenue.length > 0 ? (
          <div className="space-y-2">
            {stats.monthly_revenue.map((month) => (
              <div key={month._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{month._id}</span>
                <div className="text-right">
                  <span className="font-bold text-green-600">${(month.total || 0).toLocaleString()}</span>
                  <span className="text-sm text-gray-500 ml-2">({month.count} invoices)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No monthly data available yet
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/billing/coupons" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition">
            <Ticket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-purple-700">Create Coupon</p>
          </Link>
          <Link to="/admin/billing/plans" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-blue-700">Manage Plans</p>
          </Link>
          <Link to="/admin/billing/invoices" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-700">View Invoices</p>
          </Link>
          <Link to="/admin/billing/settings" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition">
            <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Settings</p>
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading && location.pathname === '/admin/billing') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="billing-dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
        <p className="text-gray-600">Manage pricing, coupons, subscriptions, and invoices</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                isActive(tab.path, tab.exact)
                  ? 'border-primary-blue text-primary-blue bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <Routes>
        <Route index element={<OverviewContent />} />
        <Route path="settings" element={<BillingSettingsManager />} />
        <Route path="coupons" element={<CouponsManager />} />
        <Route path="plans" element={<SubscriptionPlansManager />} />
        <Route path="website-pricing" element={<WebsitePricingManager />} />
        <Route path="invoices" element={<InvoicesManager />} />
        <Route path="companies/*" element={<CompaniesManager />} />
      </Routes>
    </div>
  );
};

export default BillingDashboard;
