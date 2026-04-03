import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'listed', label: 'Listed' },
  { value: 'pledged', label: 'Pledged' },
  { value: 'bidding', label: 'Bidding' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

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

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export default function CROCaseTracker({ token }) {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCase, setExpandedCase] = useState(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');
      const res = await fetch(`${API_URL}/api/cro/cases?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, [statusFilter]);

  const filtered = cases.filter(c =>
    !searchTerm || c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.case_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div data-testid="cro-case-tracker">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Tracker</h1>
          <p className="text-gray-500 mt-1">{total} total cases</p>
        </div>
        <Button onClick={fetchCases} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or case number..." className="pl-9" data-testid="case-tracker-search" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" data-testid="case-tracker-filter">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No cases found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-gray-500">{c.case_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>{c.status?.replace(/_/g, ' ')}</span>
                      {c.qualifies_bidding && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Bidding Eligible</span>}
                      {c.class_action && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">Class Action</span>}
                    </div>
                    <h3 className="font-medium mt-1">{c.client_name}</h3>
                    <p className="text-sm text-gray-500">{c.violation_type} &middot; {c.bureau} &middot; Est. {formatCurrency(c.estimated_value)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    {expandedCase === c.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {expandedCase === c.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">State</p>
                        <p className="font-medium">{c.client_state}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mail Method</p>
                        <p className="font-medium capitalize">{c.mail_method}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Violations</p>
                        <p className="font-medium">{c.violation_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Documentation Quality</p>
                        <p className="font-medium capitalize">{c.documentation_quality}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Dispute Date</p>
                        <p className="font-medium">{c.dispute_date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pledge Fee</p>
                        <p className="font-medium">{formatCurrency(c.pledge_fee)}</p>
                      </div>
                      {c.attorney_name && (
                        <div>
                          <p className="text-gray-500">Assigned Attorney</p>
                          <p className="font-medium">{c.attorney_name}</p>
                        </div>
                      )}
                      {c.bid_amount && (
                        <div>
                          <p className="text-gray-500">Winning Bid</p>
                          <p className="font-medium text-green-600">{formatCurrency(c.bid_amount)}</p>
                        </div>
                      )}
                      {c.cro_payout_amount && (
                        <div>
                          <p className="text-gray-500">Your Payout (80%)</p>
                          <p className="font-medium text-green-600">{formatCurrency(c.cro_payout_amount)}</p>
                        </div>
                      )}
                    </div>
                    {c.case_summary && (
                      <div className="mt-4">
                        <p className="text-gray-500 text-sm">Case Summary</p>
                        <p className="text-sm mt-1">{c.case_summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
