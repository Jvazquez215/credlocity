import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, FileText, Newspaper, 
  Building2, Briefcase, Activity, BarChart3, Loader2, RefreshCw,
  Phone, CreditCard, Target, Award, Calendar, Clock, Search, ChevronDown,
  Star, Gavel, MessageSquare, HelpCircle, Scale, CheckCircle, XCircle,
  Eye, MousePointer, Timer
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Tab Button Component
const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
      active 
        ? 'border-blue-600 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend, trendValue }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600'
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

// Revenue Tab
const RevenueTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${(data.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue={`${data.revenueChange || 0}%`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(data.monthlyRevenue || 0).toLocaleString()}`}
          icon={Calendar}
          color="blue"
          subtitle="This month"
        />
        <StatCard
          title="Average Order Value"
          value={`$${(data.averageOrderValue || 0).toLocaleString()}`}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Total Transactions"
          value={data.totalTransactions || 0}
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Revenue by Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Credit Repair Services</p>
              <p className="text-2xl font-bold text-blue-600">${(data.creditRepairRevenue || 0).toLocaleString()}</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Outsourcing</p>
              <p className="text-2xl font-bold text-green-600">${(data.outsourcingRevenue || 0).toLocaleString()}</p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-500">Collections</p>
              <p className="text-2xl font-bold text-purple-600">${(data.collectionsRevenue || 0).toLocaleString()}</p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data.recentTransactions || []).length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.slice(0, 5).map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{tx.description || 'Payment'}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                  <p className="font-bold text-green-600">+${tx.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent transactions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Content Stats Tab
const ContentTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Blog Posts Published"
          value={data.blogPostsCount || 0}
          icon={FileText}
          color="blue"
          subtitle={`${data.blogPostsThisMonth || 0} this month`}
        />
        <StatCard
          title="Press Releases"
          value={data.pressReleasesCount || 0}
          icon={Newspaper}
          color="purple"
          subtitle={`${data.pressReleasesThisMonth || 0} this month`}
        />
        <StatCard
          title="Lawsuits Filed"
          value={data.lawsuitsCount || 0}
          icon={Briefcase}
          color="amber"
          subtitle={`${data.lawsuitsThisMonth || 0} this month`}
        />
        <StatCard
          title="Total Pages"
          value={data.pagesCount || 0}
          icon={FileText}
          color="green"
        />
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.recentBlogPosts || []).slice(0, 5).map((post, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-sm text-gray-500">{post.author || 'Unknown'}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {post.status || 'published'}
                  </Badge>
                </div>
              ))}
              {(!data.recentBlogPosts || data.recentBlogPosts.length === 0) && (
                <p className="text-center text-gray-500 py-4">No blog posts yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Recent Press Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.recentPressReleases || []).slice(0, 5).map((pr, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{pr.title}</p>
                    <p className="text-sm text-gray-500">
                      {pr.published_at ? new Date(pr.published_at).toLocaleDateString() : 'Draft'}
                    </p>
                  </div>
                  <Badge className={pr.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {pr.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              ))}
              {(!data.recentPressReleases || data.recentPressReleases.length === 0) && (
                <p className="text-center text-gray-500 py-4">No press releases yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Content Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{data.faqsCount || 0}</p>
              <p className="text-sm text-gray-500">FAQs</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{data.legalPagesCount || 0}</p>
              <p className="text-sm text-gray-500">Legal Pages</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{data.bannersCount || 0}</p>
              <p className="text-sm text-gray-500">Active Banners</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{data.mediaCount || 0}</p>
              <p className="text-sm text-gray-500">Media Files</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Outsourcing Tab
const OutsourcingTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Outsourcing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Partners"
          value={data.activePartners || 0}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Total Inquiries"
          value={data.totalInquiries || 0}
          icon={Users}
          color="blue"
          subtitle={`${data.pendingInquiries || 0} pending`}
        />
        <StatCard
          title="Outsourcing Revenue"
          value={`$${(data.outsourcingRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Open Tickets"
          value={data.openTickets || 0}
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Partner Performance & Inquiry Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Top Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.topPartners || []).slice(0, 5).map((partner, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{partner.company_name || 'Partner'}</p>
                      <p className="text-sm text-gray-500">{partner.clients_count || 0} clients</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${(partner.revenue || 0).toLocaleString()}</p>
                    <Badge variant="outline">{partner.status || 'active'}</Badge>
                  </div>
                </div>
              ))}
              {(!data.topPartners || data.topPartners.length === 0) && (
                <p className="text-center text-gray-500 py-8">No partner data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inquiry Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600 font-medium">Pending</span>
                <Badge className="bg-yellow-100 text-yellow-700">{data.pendingInquiries || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 font-medium">In Progress</span>
                <Badge className="bg-blue-100 text-blue-700">{data.inProgressInquiries || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600 font-medium">Completed</span>
                <Badge className="bg-green-100 text-green-700">{data.completedInquiries || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600 font-medium">Cancelled</span>
                <Badge className="bg-red-100 text-red-700">{data.cancelledInquiries || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Log Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Work Log Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Hours Logged</p>
              <p className="text-2xl font-bold text-blue-600">{data.totalHoursLogged || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Invoices Generated</p>
              <p className="text-2xl font-bold text-green-600">{data.invoicesCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Collections Tab
const CollectionsTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collections Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected"
          value={`$${(data.totalCollected || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue={`${data.collectionTrend || 0}%`}
        />
        <StatCard
          title="Active Accounts"
          value={data.activeAccounts || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Calls Made"
          value={data.callsMade || 0}
          icon={Phone}
          color="purple"
          subtitle="This month"
        />
        <StatCard
          title="Success Rate"
          value={`${data.successRate || 0}%`}
          icon={Target}
          color="amber"
        />
      </div>

      {/* Rep Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Collection Rep Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data.topReps || []).slice(0, 5).map((rep, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-blue-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{rep.name || 'Rep'}</p>
                    <p className="text-sm text-gray-500">{rep.accounts || 0} accounts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${(rep.collected || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{rep.calls || 0} calls</p>
                </div>
              </div>
            ))}
            {(!data.topReps || data.topReps.length === 0) && (
              <p className="text-center text-gray-500 py-8">No collection rep data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active</span>
                <Badge className="bg-blue-100 text-blue-700">{data.activeAccounts || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Plan</span>
                <Badge className="bg-purple-100 text-purple-700">{data.paymentPlanAccounts || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Settled</span>
                <Badge className="bg-green-100 text-green-700">{data.settledAccounts || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Disputed</span>
                <Badge className="bg-red-100 text-red-700">{data.disputedAccounts || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Collection Goal</span>
                  <span>${(data.monthlyGoal || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((data.monthlyCollected || 0) / (data.monthlyGoal || 1)) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ${(data.monthlyCollected || 0).toLocaleString()} of ${(data.monthlyGoal || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Searchable Employee Dropdown Component
const EmployeeSelect = ({ employees = [], selectedEmployee, onSelect, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    const empList = employees || [];
    if (!searchQuery) return empList;
    const query = searchQuery.toLowerCase();
    return empList.filter(emp => 
      (emp.user_name || '').toLowerCase().includes(query) ||
      (emp.user_email || '').toLowerCase().includes(query) ||
      (emp.user_role || '').toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const selectedName = selectedEmployee 
    ? (employees.find(e => e.user_id === selectedEmployee)?.user_name || 'Unknown')
    : 'All Employees';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-64 flex items-center justify-between px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
        disabled={loading}
      >
        <span className="truncate">{selectedName}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full md:w-80 mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <button
              onClick={() => { onSelect(null); setIsOpen(false); setSearchQuery(''); }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                !selectedEmployee ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Employees</span>
            </button>
            {filteredEmployees.map((emp) => (
              <button
                key={emp.user_id}
                onClick={() => { onSelect(emp.user_id); setIsOpen(false); setSearchQuery(''); }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                  selectedEmployee === emp.user_id ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{emp.user_name || emp.user_email || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{emp.user_role || 'User'}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {emp.total_time_hours}h
                  </Badge>
                </div>
              </button>
            ))}
            {filteredEmployees.length === 0 && (
              <p className="px-4 py-3 text-gray-500 text-center">No employees found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Employee Activity Tab - Comprehensive Implementation with Searchable Dropdown
const EmployeeActivityTab = ({ data, loading }) => {
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userMetrics, setUserMetrics] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [cmsMetrics, setCmsMetrics] = useState({});
  const [timePeriod, setTimePeriod] = useState(7);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  // Fetch all employees from team/authors API
  const fetchAllEmployees = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      
      const [authorsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/authors`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/users`, { headers }).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      // Combine and dedupe employees
      const employeeMap = new Map();
      
      // Add current logged-in user first (Super Admin / Master Administrator)
      const currentUserData = localStorage.getItem('user');
      if (currentUserData) {
        try {
          const currentUser = JSON.parse(currentUserData);
          if (currentUser && currentUser.email) {
            employeeMap.set(currentUser.email, {
              user_id: currentUser.id || currentUser._id || currentUser.email,
              user_email: currentUser.email,
              user_name: currentUser.full_name || currentUser.name || 'Master Administrator',
              user_role: currentUser.role || 'super_admin',
              total_time_hours: 0,
              total_sessions: 0,
              total_page_views: 0,
              total_clicks: 0,
              days_active: 0,
              source: 'current_user'
            });
          }
        } catch (e) {
          console.log('Could not parse current user:', e);
        }
      }
      
      // Add authors/team members
      (authorsRes || []).forEach(author => {
        if (author.email && !employeeMap.has(author.email)) {
          employeeMap.set(author.email, {
            user_id: author.id || author.email,
            user_email: author.email,
            user_name: author.full_name || author.name,
            user_role: author.role === 'super_admin' ? 'Super Admin' : (author.title || 'Team Member'),
            total_time_hours: 0,
            total_sessions: 0,
            total_page_views: 0,
            total_clicks: 0,
            days_active: 0,
            source: 'team'
          });
        }
      });

      // Add users (may overlap with activity data)
      (usersRes || []).forEach(user => {
        if (user.email && !employeeMap.has(user.email)) {
          employeeMap.set(user.email, {
            user_id: user.id || user.email,
            user_email: user.email,
            user_name: user.full_name || user.name || user.email,
            user_role: user.role || 'User',
            total_time_hours: 0,
            total_sessions: 0,
            total_page_views: 0,
            total_clicks: 0,
            days_active: 0,
            source: 'users'
          });
        }
      });

      const employeeList = Array.from(employeeMap.values());
      setAllEmployees(employeeList);
      setEmployeesLoaded(true);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployeesLoaded(true);
    }
  };

  const fetchActivityData = async () => {
    setActivityLoading(true);
    try {
      const [overviewRes, leaderboardRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/activity/metrics/overview?days=${timePeriod}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_URL}/api/activity/metrics/leaderboard?metric=time&days=${timePeriod}&limit=10`).then(r => r.ok ? r.json() : { leaderboard: [] }).catch(() => ({ leaderboard: [] })),
        fetch(`${API_URL}/api/activity/metrics/users?days=${timePeriod}`).then(r => r.ok ? r.json() : { users: [] }).catch(() => ({ users: [] }))
      ]);

      setActivityData(overviewRes);
      setLeaderboard(leaderboardRes.leaderboard || []);
      setUserMetrics(usersRes.users || []);
    } catch (err) {
      console.error('Error fetching activity data:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
    fetchCmsMetrics();
    fetchAllEmployees();
  }, [timePeriod]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSelectedUserData(selectedEmployee);
    } else {
      setSelectedUserData(null);
    }
  }, [selectedEmployee]);

  const fetchSelectedUserData = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/activity/user/${userId}/activity?days=${timePeriod}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchCmsMetrics = async () => {
    try {
      const [
        reviewsRes, attorneyReviewsRes, partnerReviewsRes,
        blogRes, pressRes, lawsuitsRes, faqsRes,
        clientsRes, inquiriesRes
      ] = await Promise.all([
        fetch(`${API_URL}/api/reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/attorney-reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/outsource-reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/blog`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/press-releases`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/lawsuits`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/faqs`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/clients`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/outsource-inquiries`).then(r => r.ok ? r.json() : { inquiries: [] }).catch(() => ({ inquiries: [] }))
      ]);

      // Calculate metrics
      const reviews = reviewsRes || [];
      const pendingReviews = reviews.filter(r => !r.show_on_success_stories && r.approval_status !== 'approved');
      const approvedReviews = reviews.filter(r => r.show_on_success_stories || r.approval_status === 'approved');

      setCmsMetrics({
        totalReviews: reviews.length,
        pendingReviews: pendingReviews.length,
        approvedReviews: approvedReviews.length,
        attorneyReviews: (attorneyReviewsRes || []).length,
        partnerReviews: (partnerReviewsRes || []).length,
        blogPosts: (blogRes || []).length,
        publishedBlogs: (blogRes || []).filter(b => b.status === 'published').length,
        pressReleases: (pressRes || []).length,
        publishedPressReleases: (pressRes || []).filter(p => p.is_published).length,
        lawsuits: (lawsuitsRes || []).length,
        faqs: (faqsRes || []).length,
        totalClients: (clientsRes || []).length,
        totalInquiries: (inquiriesRes.inquiries || inquiriesRes || []).length,
        pendingInquiries: (inquiriesRes.inquiries || inquiriesRes || []).filter(i => i.status === 'pending').length
      });
    } catch (err) {
      console.error('Error fetching CMS metrics:', err);
    }
  };

  // Merge all employees with activity data - must be before any conditional returns
  const mergedEmployees = useMemo(() => {
    const employeeMap = new Map();
    
    // First add all employees from team/authors
    allEmployees.forEach(emp => {
      employeeMap.set(emp.user_email || emp.user_id, { ...emp });
    });
    
    // Then merge in activity metrics (these take precedence)
    userMetrics.forEach(metric => {
      const key = metric.user_email || metric.user_id;
      if (employeeMap.has(key)) {
        // Update existing employee with activity data
        employeeMap.set(key, { ...employeeMap.get(key), ...metric });
      } else {
        // Add new employee from activity data
        employeeMap.set(key, metric);
      }
    });
    
    return Array.from(employeeMap.values());
  }, [allEmployees, userMetrics]);

  if (loading || activityLoading || !employeesLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Loading employee data...</span>
      </div>
    );
  }

  // Selected employee view
  if (selectedEmployee && selectedUserData) {
    const userData = mergedEmployees.find(u => u.user_id === selectedEmployee || u.user_email === selectedEmployee) || {};
    
    return (
      <div className="space-y-6">
        {/* Header with Employee Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Employee Activity</h2>
            <p className="text-gray-500">Individual performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <EmployeeSelect 
              employees={mergedEmployees} 
              selectedEmployee={selectedEmployee}
              onSelect={setSelectedEmployee}
              loading={activityLoading}
            />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        </div>

        {/* Selected Employee Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(userData.user_name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{userData.user_name || userData.user_email || 'Unknown'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-700">{userData.user_role || 'User'}</Badge>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{userData.days_active || 0} days active</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                <Users className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Time"
            value={`${userData.total_time_hours || 0}h`}
            icon={Clock}
            color="blue"
            subtitle={`Last ${timePeriod} days`}
          />
          <StatCard
            title="Sessions"
            value={userData.total_sessions || 0}
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Page Views"
            value={userData.total_page_views || 0}
            icon={Eye}
            color="purple"
          />
          <StatCard
            title="Clicks"
            value={userData.total_clicks || 0}
            icon={MousePointer}
            color="amber"
          />
        </div>

        {/* Daily Activity History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Activity History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(selectedUserData.daily_activity || []).length > 0 ? (
                selectedUserData.daily_activity.map((day, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{day.date}</p>
                      <p className="text-xs text-gray-500">{day.total_sessions} sessions</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-blue-600">{Math.round((day.total_time_seconds || 0) / 3600 * 10) / 10}h</p>
                        <p className="text-xs text-gray-500">Time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{day.total_page_views || 0}</p>
                        <p className="text-xs text-gray-500">Pages</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-purple-600">{day.total_clicks || 0}</p>
                        <p className="text-xs text-gray-500">Clicks</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No daily activity data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(selectedUserData.recent_sessions || []).length > 0 ? (
                selectedUserData.recent_sessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(session.start_time).toLocaleDateString()} at {new Date(session.start_time).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.page_views || 0} pages • {session.clicks || 0} clicks
                      </p>
                    </div>
                    <Badge className={session.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {session.is_active ? 'Active' : 'Ended'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No recent sessions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview view (no employee selected)
  return (
    <div className="space-y-6">
      {/* Header with Employee Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Employee Activity</h2>
          <p className="text-gray-500">Track team performance and CMS engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <EmployeeSelect 
            employees={mergedEmployees} 
            selectedEmployee={selectedEmployee}
            onSelect={setSelectedEmployee}
            loading={activityLoading}
          />
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button variant="outline" onClick={() => { fetchActivityData(); fetchCmsMetrics(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Activity Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Now"
          value={activityData?.active_sessions_now || 0}
          icon={Users}
          color="green"
          subtitle="Current sessions"
        />
        <StatCard
          title="Total Sessions"
          value={activityData?.total_sessions || 0}
          icon={Activity}
          color="blue"
          subtitle={`Last ${timePeriod} days`}
        />
        <StatCard
          title="Total Time"
          value={`${activityData?.total_time_hours || 0}h`}
          icon={Clock}
          color="purple"
          subtitle="Active usage"
        />
        <StatCard
          title="Page Views"
          value={activityData?.total_page_views || 0}
          icon={Eye}
          color="amber"
        />
      </div>

      {/* CMS Activity Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            CMS Activity Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600">{cmsMetrics.totalReviews || 0}</p>
              <p className="text-xs text-gray-500">Total Reviews</p>
              <p className="text-xs text-green-600">{cmsMetrics.approvedReviews || 0} approved</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-center">
              <Gavel className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-600">{cmsMetrics.attorneyReviews || 0}</p>
              <p className="text-xs text-gray-500">Attorney Reviews</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <Building2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{cmsMetrics.partnerReviews || 0}</p>
              <p className="text-xs text-gray-500">Partner Reviews</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-600">{cmsMetrics.blogPosts || 0}</p>
              <p className="text-xs text-gray-500">Blog Posts</p>
              <p className="text-xs text-green-600">{cmsMetrics.publishedBlogs || 0} published</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-center">
              <Newspaper className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-indigo-600">{cmsMetrics.pressReleases || 0}</p>
              <p className="text-xs text-gray-500">Press Releases</p>
              <p className="text-xs text-green-600">{cmsMetrics.publishedPressReleases || 0} published</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <Scale className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">{cmsMetrics.lawsuits || 0}</p>
              <p className="text-xs text-gray-500">Lawsuits Filed</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-cyan-50 rounded-lg text-center">
              <HelpCircle className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-cyan-600">{cmsMetrics.faqs || 0}</p>
              <p className="text-xs text-gray-500">FAQs</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg text-center">
              <Users className="w-6 h-6 text-teal-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-teal-600">{cmsMetrics.totalClients || 0}</p>
              <p className="text-xs text-gray-500">Total Clients</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <Briefcase className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-600">{cmsMetrics.totalInquiries || 0}</p>
              <p className="text-xs text-gray-500">Inquiries</p>
              <p className="text-xs text-amber-600">{cmsMetrics.pendingInquiries || 0} pending</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-rose-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-rose-600">{cmsMetrics.pendingReviews || 0}</p>
              <p className="text-xs text-gray-500">Pending Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">{activityData?.today?.active_users || 0}</p>
              <p className="text-sm text-gray-500">Active Users Today</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">{activityData?.today?.total_time_hours || 0}h</p>
              <p className="text-sm text-gray-500">Total Time Today</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">{activityData?.avg_session_minutes || 0}m</p>
              <p className="text-sm text-gray-500">Avg Session Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard & User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Activity Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.length > 0 ? leaderboard.map((user, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEmployee(user.user_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <p className="font-medium">{user.user_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{user.user_role || 'User'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{user.total_time_hours}h</p>
                    <p className="text-xs text-gray-500">{user.total_page_views} pages</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No activity data yet</p>
                  <p className="text-sm text-gray-400 mt-1">Activity will appear as users interact with the CMS</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Breakdown - Clickable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Employee Breakdown
              <Badge variant="outline" className="ml-2">{mergedEmployees.length} employees</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {mergedEmployees.length > 0 ? mergedEmployees.map((user, i) => (
                <div 
                  key={i} 
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEmployee(user.user_id || user.user_email)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{user.user_name || user.user_email || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{user.user_role}</p>
                    </div>
                    <Badge variant="outline" className={user.days_active > 0 ? 'bg-green-50' : ''}>
                      {user.days_active || 0} days active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{user.total_time_hours || 0}h</p>
                      <p className="text-xs text-gray-500">Time</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-600">{user.total_sessions || 0}</p>
                      <p className="text-xs text-gray-500">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-purple-600">{user.total_page_views || 0}</p>
                      <p className="text-xs text-gray-500">Pages</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-amber-600">{user.total_clicks || 0}</p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No employees found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Session Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Average Session Duration</p>
              <p className="text-2xl font-bold text-blue-600">{activityData?.avg_session_minutes || 0} minutes</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Average Pages per Session</p>
              <p className="text-2xl font-bold text-green-600">{activityData?.avg_pages_per_session || 0} pages</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Metrics Dashboard
const MetricsDashboard = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({});
  const [contentData, setContentData] = useState({});
  const [outsourcingData, setOutsourcingData] = useState({});
  const [collectionsData, setCollectionsData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all metrics data in parallel
      const [
        blogRes, pressRes, lawsuitsRes, pagesRes, faqsRes, 
        legalRes, bannersRes, partnersRes, inquiriesRes,
        collectionsRes
      ] = await Promise.all([
        fetch(`${API_URL}/api/blog`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/press-releases`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/lawsuits`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/pages`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/faqs`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/legal-pages`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/banners-popups`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/outsource-partners`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_URL}/api/outsource-inquiries`).then(r => r.ok ? r.json() : { inquiries: [] }).catch(() => ({ inquiries: [] })),
        fetch(`${API_URL}/api/collections/accounts`).then(r => r.ok ? r.json() : { accounts: [] }).catch(() => ({ accounts: [] }))
      ]);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Calculate content stats
      const blogPosts = blogRes || [];
      const pressReleases = pressRes || [];
      const lawsuits = lawsuitsRes || [];

      const thisMonthFilter = (item) => {
        const date = new Date(item.created_at || item.published_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      };

      setContentData({
        blogPostsCount: blogPosts.length,
        blogPostsThisMonth: blogPosts.filter(thisMonthFilter).length,
        pressReleasesCount: pressReleases.length,
        pressReleasesThisMonth: pressReleases.filter(thisMonthFilter).length,
        lawsuitsCount: lawsuits.length,
        lawsuitsThisMonth: lawsuits.filter(thisMonthFilter).length,
        pagesCount: (pagesRes || []).length,
        faqsCount: (faqsRes || []).length,
        legalPagesCount: (legalRes || []).length,
        bannersCount: (bannersRes || []).filter(b => b.is_active).length,
        mediaCount: 0,
        recentBlogPosts: blogPosts.slice(0, 5),
        recentPressReleases: pressReleases.slice(0, 5)
      });

      // Calculate outsourcing stats
      const partners = partnersRes || [];
      const inquiries = inquiriesRes.inquiries || inquiriesRes || [];

      setOutsourcingData({
        activePartners: partners.filter(p => p.status === 'active').length,
        totalInquiries: inquiries.length,
        pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
        inProgressInquiries: inquiries.filter(i => i.status === 'in_progress').length,
        completedInquiries: inquiries.filter(i => i.status === 'completed').length,
        cancelledInquiries: inquiries.filter(i => i.status === 'cancelled').length,
        outsourcingRevenue: partners.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
        openTickets: 0,
        topPartners: partners.slice(0, 5),
        totalHoursLogged: 0,
        invoicesCount: 0
      });

      // Calculate collections stats
      const accounts = collectionsRes.accounts || collectionsRes || [];
      setCollectionsData({
        totalCollected: accounts.reduce((sum, a) => sum + (a.amount_paid || 0), 0),
        collectionTrend: 8.5,
        activeAccounts: accounts.filter(a => a.status === 'active').length,
        paymentPlanAccounts: accounts.filter(a => a.status === 'payment_plan').length,
        settledAccounts: accounts.filter(a => a.status === 'settled').length,
        disputedAccounts: accounts.filter(a => a.status === 'disputed').length,
        callsMade: 0,
        successRate: 68,
        monthlyGoal: 50000,
        monthlyCollected: accounts.reduce((sum, a) => sum + (a.amount_paid || 0), 0),
        topReps: []
      });

      // Revenue data (placeholder - would come from payment system)
      setRevenueData({
        totalRevenue: 125000,
        monthlyRevenue: 15000,
        revenueChange: 12.5,
        averageOrderValue: 150,
        totalTransactions: 834,
        creditRepairRevenue: 75000,
        outsourcingRevenue: 35000,
        collectionsRevenue: 15000,
        recentTransactions: []
      });

    } catch (err) {
      console.error('Error fetching metrics:', err);
      toast.error('Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metrics & KPIs</h1>
          <p className="text-gray-500">Track all key performance indicators across business areas</p>
        </div>
        <Button variant="outline" onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b bg-gray-50">
          <div className="flex overflow-x-auto">
            <TabButton 
              active={activeTab === 'revenue'} 
              onClick={() => setActiveTab('revenue')}
              icon={DollarSign}
            >
              Revenue
            </TabButton>
            <TabButton 
              active={activeTab === 'content'} 
              onClick={() => setActiveTab('content')}
              icon={FileText}
            >
              Content Stats
            </TabButton>
            <TabButton 
              active={activeTab === 'outsourcing'} 
              onClick={() => setActiveTab('outsourcing')}
              icon={Building2}
            >
              Outsourcing
            </TabButton>
            <TabButton 
              active={activeTab === 'collections'} 
              onClick={() => setActiveTab('collections')}
              icon={Phone}
            >
              Collections
            </TabButton>
            <TabButton 
              active={activeTab === 'activity'} 
              onClick={() => setActiveTab('activity')}
              icon={Activity}
            >
              Employee Activity
            </TabButton>
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === 'revenue' && <RevenueTab data={revenueData} loading={loading} />}
          {activeTab === 'content' && <ContentTab data={contentData} loading={loading} />}
          {activeTab === 'outsourcing' && <OutsourcingTab data={outsourcingData} loading={loading} />}
          {activeTab === 'collections' && <CollectionsTab data={collectionsData} loading={loading} />}
          {activeTab === 'activity' && <EmployeeActivityTab data={{}} loading={loading} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;
