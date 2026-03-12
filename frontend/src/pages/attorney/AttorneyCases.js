import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Clock, CheckCircle, AlertTriangle, 
  DollarSign, Eye, FileText, RefreshCw, Search, Filter,
  Gavel, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pledged': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'settled': return 'bg-green-100 text-green-800 border-green-300';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function AttorneyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getToken = () => localStorage.getItem('attorney_token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }
    
    // Check for filter from URL
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      setFilter(urlFilter);
    }
    
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/my-cases`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    // Status filter
    if (filter === 'pending_payment') {
      return c.status === 'pledged' && !c.initial_fee_paid;
    }
    if (filter === 'overdue_update') {
      return c.needs_update;
    }
    if (filter !== 'all' && c.status !== filter) {
      return false;
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        c.title?.toLowerCase().includes(searchLower) ||
        c.case_id?.toLowerCase().includes(searchLower) ||
        c.client_name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/attorney" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Cases</h1>
                <p className="text-sm text-gray-500">{cases.length} total cases</p>
              </div>
            </div>
            <Link to="/attorney/marketplace">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pledged', 'in_progress', 'settled'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className={filter === status ? 'bg-purple-600' : ''}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Found</h3>
              <p className="text-gray-500 mb-6">
                {filter !== 'all' 
                  ? `No cases matching the "${filter.replace('_', ' ')}" filter.`
                  : "You haven't pledged any cases yet."}
              </p>
              <Link to="/attorney/marketplace">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Browse Available Cases
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.case_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-500">{caseItem.case_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status?.replace('_', ' ')}
                        </span>
                        {caseItem.needs_update && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300 animate-pulse">
                            Update Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{caseItem.title}</h3>
                      <p className="text-sm text-gray-500">
                        {caseItem.type} • {caseItem.client_city}, {caseItem.client_state}
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Estimated Value</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(caseItem.estimated_value)}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {caseItem.needs_update && (
                          <Link to={`/attorney/case-updates/${caseItem.case_id}`}>
                            <Button size="sm" variant="destructive">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Update
                            </Button>
                          </Link>
                        )}
                        <Link to={`/attorney/cases/${caseItem.case_id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Case Details */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Pledged Date</p>
                      <p className="text-sm font-medium">
                        {caseItem.pledged_at ? new Date(caseItem.pledged_at).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Initial Fee</p>
                      <p className="text-sm font-medium">
                        {caseItem.initial_fee_paid ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> $500 Due
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Update</p>
                      <p className="text-sm font-medium">
                        {caseItem.last_update_at ? new Date(caseItem.last_update_at).toLocaleDateString() : 'Not yet'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Commission Rate</p>
                      <p className="text-sm font-medium">{caseItem.commission_rate || '4'}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
