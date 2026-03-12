import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { 
  DollarSign, 
  TrendingUp, 
  Building2,
  Users,
  RefreshCw,
  Download,
  Search,
  Filter,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Gavel,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Summary Stat Card
const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subValue && (
            <div className="flex items-center gap-1 mt-1">
              {trend !== undefined && (
                trend >= 0 
                  ? <ArrowUpRight className="w-4 h-4 text-green-500" />
                  : <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>{subValue}</p>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Revenue Split Distribution Chart (Visual)
const SplitDistributionChart = ({ credlocityTotal, companyTotal }) => {
  const total = credlocityTotal + companyTotal;
  const credlocityPct = total > 0 ? (credlocityTotal / total) * 100 : 40;
  const companyPct = total > 0 ? (companyTotal / total) * 100 : 60;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-500" />
          Revenue Split Distribution
        </CardTitle>
        <CardDescription>40% Credlocity / 60% Company (default split)</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual bar */}
        <div className="h-8 flex rounded-full overflow-hidden mb-6">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${credlocityPct}%` }}
          >
            {credlocityPct.toFixed(1)}%
          </div>
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${companyPct}%` }}
          >
            {companyPct.toFixed(1)}%
          </div>
        </div>

        {/* Legend with amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm font-medium text-gray-700">Credlocity Share</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(credlocityTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">Platform revenue</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-700">Company Share</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(companyTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">Partner payouts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function RevenueSplitReport() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [splits, setSplits] = useState([]);
  const [summary, setSummary] = useState({
    total_revenue: 0,
    credlocity_total: 0,
    company_total: 0,
    cases_count: 0,
    pending_payouts: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    company: '',
    dateRange: 'all',
    search: ''
  });
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSplits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.company) params.append('company_id', filters.company);
      if (filters.dateRange !== 'all') params.append('date_range', filters.dateRange);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_URL}/api/admin/revenue-splits?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSplits(data.splits || []);
        setSummary(data.summary || summary);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.error('Error fetching revenue splits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/companies?active_only=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  useEffect(() => {
    fetchSplits();
    fetchCompanies();
  }, [token, page, filters]);

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/revenue-splits/export?format=csv`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.csv) {
          const blob = new Blob([data.csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename || 'revenue_splits.csv';
          a.click();
        }
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending_payout':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="w-3 h-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Split Report</h1>
          <p className="text-gray-500 mt-1">Track revenue splits between Credlocity and partner companies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchSplits}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.total_revenue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Credlocity Share (40%)"
          value={formatCurrency(summary.credlocity_total)}
          icon={Building2}
          color="bg-purple-500"
        />
        <StatCard
          title="Company Share (60%)"
          value={formatCurrency(summary.company_total)}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Cases Settled"
          value={summary.cases_count || 0}
          icon={Gavel}
          color="bg-orange-500"
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(summary.pending_payouts)}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
      </div>

      {/* Distribution Chart */}
      <SplitDistributionChart 
        credlocityTotal={summary.credlocity_total} 
        companyTotal={summary.company_total} 
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by case ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-48"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_payout">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.company || "none"}
              onValueChange={(value) => setFilters({ ...filters, company: value === "none" ? "" : value })}
            >
              <SelectTrigger className="w-48">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
            >
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Splits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Split Transactions</CardTitle>
          <CardDescription>Detailed breakdown of each settled case</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : splits.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No revenue splits found</p>
              <p className="text-sm mt-1">Revenue splits are created when cases are settled</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Settlement</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Credlocity (40%)</TableHead>
                    <TableHead>Company (60%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {splits.map(split => (
                    <TableRow key={split.id}>
                      <TableCell className="font-mono text-sm">{split.case_id}</TableCell>
                      <TableCell>{split.company_name || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(split.settlement_amount)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(split.total_revenue)}</TableCell>
                      <TableCell className="text-purple-600 font-medium">
                        {formatCurrency(split.split_details?.credlocity_amount)}
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {formatCurrency(split.split_details?.company_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(split.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(split.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
