import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  AlertTriangle,
  Users,
  Briefcase,
  Scale,
  CreditCard,
  FileText,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react';

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

// Format percentage
const formatPercent = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

// Revenue Source Card Component
const SourceCard = ({ title, icon: Icon, amount, count, color, trend }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {formatPercent(Math.abs(trend))}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(amount)}</p>
        {count !== undefined && (
          <p className="text-xs text-gray-400 mt-1">{count} transactions</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// Summary Stat Card
const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Simple Bar Chart Component (no external library needed)
const SimpleBarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.total), 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(-6).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-16">{item.month?.slice(-5) || 'N/A'}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  style={{ width: `${(item.total / maxValue) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Source Distribution Chart
const SourceDistribution = ({ data }) => {
  const sources = [
    { key: 'attorney_network', label: 'Attorney Network', color: 'bg-purple-500' },
    { key: 'collections', label: 'Collections', color: 'bg-blue-500' },
    { key: 'credit_repair', label: 'Credit Repair', color: 'bg-green-500' },
    { key: 'outsourcing', label: 'Outsourcing', color: 'bg-orange-500' },
    { key: 'digital_products', label: 'Digital Products', color: 'bg-pink-500' }
  ];
  
  const total = sources.reduce((sum, s) => sum + (data[s.key]?.total || 0), 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Revenue by Source</CardTitle>
        <CardDescription>Distribution across business lines</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual bar */}
        <div className="h-6 flex rounded-full overflow-hidden mb-4">
          {sources.map(source => {
            const percentage = total > 0 ? ((data[source.key]?.total || 0) / total) * 100 : 0;
            return percentage > 0 ? (
              <div 
                key={source.key}
                className={`${source.color}`}
                style={{ width: `${percentage}%` }}
                title={`${source.label}: ${formatPercent(percentage)}`}
              />
            ) : null;
          })}
          {total === 0 && <div className="w-full bg-gray-200" />}
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {sources.map(source => {
            const amount = data[source.key]?.total || 0;
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            return (
              <div key={source.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${source.color}`} />
                  <span className="text-sm">{source.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                  <span className="text-xs text-gray-400 ml-2">({formatPercent(percentage)})</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function RevenueDashboard() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [projections, setProjections] = useState(null);
  const [attorneyRevenue, setAttorneyRevenue] = useState(null);
  const [collectionsRevenue, setCollectionsRevenue] = useState(null);
  const [creditRepairRevenue, setCreditRepairRevenue] = useState(null);
  const [outsourcingRevenue, setOutsourcingRevenue] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch all data in parallel
      const [summaryRes, trendsRes, projectionsRes, attorneyRes, collectionsRes, creditRes, outsourceRes] = await Promise.all([
        fetch(`${API_URL}/api/revenue/dashboard/summary?period=${period}`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/revenue/dashboard/trends?months=12`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/revenue/dashboard/projected`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/revenue/attorney-network/summary`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/revenue/collections/summary`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/revenue/credit-repair/summary`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/revenue/outsourcing/summary`, { headers }).catch(() => null)
      ]);
      
      if (summaryRes?.ok) setSummary(await summaryRes.json());
      if (trendsRes?.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData.trends || []);
      }
      if (projectionsRes?.ok) setProjections(await projectionsRes.json());
      if (attorneyRes?.ok) setAttorneyRevenue(await attorneyRes.json());
      if (collectionsRes?.ok) setCollectionsRevenue(await collectionsRes.json());
      if (creditRes?.ok) setCreditRepairRevenue(await creditRes.json());
      if (outsourceRes?.ok) setOutsourcingRevenue(await outsourceRes.json());
      
      // Only show error if all main requests failed
      if (!summaryRes?.ok && !attorneyRes?.ok && !collectionsRes?.ok) {
        setError('Failed to load revenue data');
      }
      
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, period]);

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/revenue/export?format=csv`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.csv) {
        const blob = new Blob([data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || 'revenue_export.csv';
        a.click();
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-500 mt-1">Track revenue across all business sources</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && !summary && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.total_revenue)}
          subValue={`${summary?.total_transactions || 0} transactions`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Revenue"
          value={formatCurrency(summary?.pending_revenue)}
          subValue={`${summary?.pending_count || 0} pending`}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Overdue Revenue"
          value={formatCurrency(summary?.overdue_revenue)}
          subValue="Requires attention"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Projected (Monthly)"
          value={formatCurrency(projections?.total_monthly_average)}
          subValue={`Annual: ${formatCurrency(projections?.total_annual_projection)}`}
          icon={TrendingUp}
          color="bg-blue-500"
        />
      </div>

      {/* Revenue by Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SourceCard
          title="Attorney Network"
          icon={Scale}
          amount={attorneyRevenue?.total_revenue || summary?.by_source?.attorney_network?.total}
          count={attorneyRevenue?.cases_resolved || summary?.by_source?.attorney_network?.count}
          color="bg-purple-500"
        />
        <SourceCard
          title="Collections"
          icon={Briefcase}
          amount={collectionsRevenue?.total_collected || summary?.by_source?.collections?.total}
          count={collectionsRevenue?.payment_count || summary?.by_source?.collections?.count}
          color="bg-blue-500"
        />
        <SourceCard
          title="Credit Repair"
          icon={CreditCard}
          amount={creditRepairRevenue?.monthly_recurring_revenue || summary?.by_source?.credit_repair?.total}
          count={creditRepairRevenue?.active_clients}
          color="bg-green-500"
        />
        <SourceCard
          title="Outsourcing"
          icon={Users}
          amount={outsourcingRevenue?.total_revenue || summary?.by_source?.outsourcing?.total}
          count={outsourcingRevenue?.invoices_paid || summary?.by_source?.outsourcing?.count}
          color="bg-orange-500"
        />
        <SourceCard
          title="Digital Products"
          icon={FileText}
          amount={summary?.by_source?.digital_products?.total || 0}
          count={summary?.by_source?.digital_products?.count || 0}
          color="bg-pink-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart data={trends} title="Monthly Revenue Trends" />
        <SourceDistribution data={summary?.by_source || {}} />
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attorney Network Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-500" />
              Attorney Network Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Initial Fees ($500/case)</span>
                <span className="font-medium">{formatCurrency(attorneyRevenue?.breakdown?.initial_fees)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Commissions</span>
                <span className="font-medium">{formatCurrency(attorneyRevenue?.breakdown?.commissions)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Bid Bonuses</span>
                <span className="font-medium">{formatCurrency(attorneyRevenue?.breakdown?.bid_bonuses)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-gray-50 px-2 rounded">
                <span className="font-medium">Total</span>
                <span className="font-bold text-purple-600">{formatCurrency(attorneyRevenue?.total_revenue)}</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cases Resolved</span>
                  <span>{attorneyRevenue?.cases_resolved || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Cases Pending</span>
                  <span>{attorneyRevenue?.cases_pending || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Projected Pending Revenue</span>
                  <span className="text-green-600">{formatCurrency(attorneyRevenue?.projected_pending_revenue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Collections Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Collected</span>
                <span className="font-medium text-green-600">{formatCurrency(collectionsRevenue?.total_collected)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Outstanding Balance</span>
                <span className="font-medium text-yellow-600">{formatCurrency(collectionsRevenue?.outstanding_balance)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Payment Count</span>
                <span className="font-medium">{collectionsRevenue?.payment_count || 0}</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Account Status</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{collectionsRevenue?.accounts?.settled || 0}</div>
                    <div className="text-xs text-gray-500">Settled</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{collectionsRevenue?.accounts?.payment_plan || 0}</div>
                    <div className="text-xs text-gray-500">Payment Plan</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{collectionsRevenue?.accounts?.active || 0}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Repair Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Credit Repair Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Monthly Recurring Revenue (MRR)</span>
                <span className="font-medium text-green-600">{formatCurrency(creditRepairRevenue?.monthly_recurring_revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Annual Recurring Revenue (ARR)</span>
                <span className="font-medium">{formatCurrency(creditRepairRevenue?.annual_recurring_revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Setup Fees Collected</span>
                <span className="font-medium">{formatCurrency(creditRepairRevenue?.setup_fees_collected)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Average Monthly Fee</span>
                <span className="font-medium">{formatCurrency(creditRepairRevenue?.average_monthly_fee)}</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Clients</span>
                  <span className="font-medium">{creditRepairRevenue?.active_clients || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Total Clients</span>
                  <span>{creditRepairRevenue?.total_clients || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outsourcing Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Outsourcing Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Revenue (Paid)</span>
                <span className="font-medium text-green-600">{formatCurrency(outsourcingRevenue?.total_revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Pending Revenue</span>
                <span className="font-medium text-yellow-600">{formatCurrency(outsourcingRevenue?.pending_revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Invoices Paid</span>
                <span className="font-medium">{outsourcingRevenue?.invoices_paid || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Invoices Pending</span>
                <span className="font-medium">{outsourcingRevenue?.invoices_pending || 0}</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Partners</span>
                  <span className="font-medium">{outsourcingRevenue?.active_partners || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Total Partners</span>
                  <span>{outsourcingRevenue?.total_partners || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projections Card */}
      {projections && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Revenue Projections
            </CardTitle>
            <CardDescription>Based on last 3 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">Monthly Average</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(projections.total_monthly_average)}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-500">Quarterly Projection</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(projections.total_quarterly_projection)}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-500">Annual Projection</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {formatCurrency(projections.total_annual_projection)}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-500">Total Pending</div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(projections.total_pending)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
