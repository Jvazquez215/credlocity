import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Gavel, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Trash2,
  Trophy,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  BarChart3
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Stats Card
const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Case Row Component
const CaseRow = ({ caseItem, onView, onEdit, onManageBids }) => {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'bidding':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1"><Trophy className="w-3 h-3" /> Bidding</span>;
      case 'class_action':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1"><Users className="w-3 h-3" /> Class Action</span>;
      default:
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Standard</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Available</span>;
      case 'pledged':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pledged</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">In Progress</span>;
      case 'settled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Settled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="font-mono text-sm text-gray-500">{caseItem.case_id}</div>
      </td>
      <td className="py-4 px-4">
        <div className="font-medium">{caseItem.title}</div>
        <div className="text-sm text-gray-500">{caseItem.type}</div>
      </td>
      <td className="py-4 px-4">{getCategoryBadge(caseItem.category)}</td>
      <td className="py-4 px-4">
        <span className="font-medium text-green-600">{formatCurrency(caseItem.estimated_value)}</span>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm">
          {caseItem.client_name_display || `${caseItem.client_first_name} ${caseItem.client_last_initial}.`}
        </div>
        <div className="text-xs text-gray-500">{caseItem.client_location_display}</div>
      </td>
      <td className="py-4 px-4">{getStatusBadge(caseItem.status)}</td>
      <td className="py-4 px-4">
        {caseItem.category !== 'standard' && (
          <div className="text-sm">
            <span className="font-medium">{caseItem.bidding_info?.current_bid_count || 0}</span> bids
            {caseItem.bidding_info?.highest_bid_amount > 0 && (
              <div className="text-xs text-gray-500">
                High: {formatCurrency(caseItem.bidding_info.highest_bid_amount)}
              </div>
            )}
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        {caseItem.assignment?.pledged_to_attorney_name && (
          <div className="text-sm">
            {caseItem.assignment.pledged_to_attorney_name}
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(caseItem)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(caseItem)}>
            <Edit className="w-4 h-4" />
          </Button>
          {caseItem.category !== 'standard' && caseItem.bidding_info?.current_bid_count > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onManageBids(caseItem)} className="text-orange-600">
              <Trophy className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Create/Edit Case Modal
const CaseModal = ({ open, onClose, onSave, editCase }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Consumer Protection',
    category: 'standard',
    description: '',
    client_first_name: '',
    client_last_name: '',
    client_city: '',
    client_state: '',
    client_email: '',
    client_phone: '',
    estimated_value: '',
    jurisdiction: '',
    practice_areas: [],
    bidding_deadline: '',
    settlement_requirements: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editCase) {
      setFormData({
        ...editCase,
        practice_areas: editCase.practice_areas || [],
        settlement_requirements: editCase.settlement_requirements || []
      });
    } else {
      setFormData({
        title: '',
        type: 'Consumer Protection',
        category: 'standard',
        description: '',
        client_first_name: '',
        client_last_name: '',
        client_city: '',
        client_state: '',
        client_email: '',
        client_phone: '',
        estimated_value: '',
        jurisdiction: '',
        practice_areas: [],
        bidding_deadline: '',
        settlement_requirements: []
      });
    }
  }, [editCase, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const practiceAreaOptions = ['Consumer Law', 'FDCPA', 'FCRA', 'TCPA', 'FCBA', 'Identity Theft', 'Class Action'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editCase ? 'Edit Case' : 'Create New Case'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Case Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="FDCPA Violation - Illegal Collection Practices"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Case Type *</label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consumer Protection">Consumer Protection</SelectItem>
                  <SelectItem value="Credit Reporting">Credit Reporting</SelectItem>
                  <SelectItem value="Identity Theft">Identity Theft</SelectItem>
                  <SelectItem value="Class Action">Class Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (First-Come)</SelectItem>
                  <SelectItem value="bidding">Bidding</SelectItem>
                  <SelectItem value="class_action">Class Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed case description..."
              rows={4}
              required
            />
          </div>

          {/* Client Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Client Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={formData.client_first_name}
                  onChange={(e) => setFormData({ ...formData, client_first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={formData.client_last_name}
                  onChange={(e) => setFormData({ ...formData, client_last_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">City *</label>
                <Input
                  value={formData.client_city}
                  onChange={(e) => setFormData({ ...formData, client_city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">State *</label>
                <Input
                  value={formData.client_state}
                  onChange={(e) => setFormData({ ...formData, client_state: e.target.value })}
                  placeholder="PA"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Case Value & Jurisdiction */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Case Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Estimated Value ($) *</label>
                <Input
                  type="number"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                  placeholder="8500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Jurisdiction *</label>
                <Input
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  placeholder="Pennsylvania"
                  required
                />
              </div>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <label className="text-sm font-medium">Practice Areas</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {practiceAreaOptions.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.practice_areas?.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, practice_areas: [...(formData.practice_areas || []), area] });
                      } else {
                        setFormData({ ...formData, practice_areas: formData.practice_areas?.filter(a => a !== area) || [] });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bidding Deadline (for bidding/class_action) */}
          {(formData.category === 'bidding' || formData.category === 'class_action') && (
            <div>
              <label className="text-sm font-medium">Bidding Deadline</label>
              <Input
                type="datetime-local"
                value={formData.bidding_deadline?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, bidding_deadline: e.target.value + ':00Z' })}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editCase ? 'Update Case' : 'Create Case'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Manage Bids Modal
const BidsModal = ({ open, onClose, caseItem, onAcceptBid, token }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && caseItem) {
      fetchBids();
    }
  }, [open, caseItem]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/cases/${caseItem.case_id}/bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBids(data.bids || []);
      }
    } catch (err) {
      console.error('Error fetching bids:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Manage Bids - {caseItem?.case_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">{caseItem?.title}</h4>
            <p className="text-sm text-gray-500">Estimated Value: {formatCurrency(caseItem?.estimated_value)}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : bids.length > 0 ? (
            <div className="space-y-3">
              {bids.sort((a, b) => b.total_bid_value - a.total_bid_value).map((bid, index) => (
                <div key={bid.bid_id} className={`p-4 border rounded-lg ${index === 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="w-4 h-4 text-orange-500" />}
                        <span className="font-medium">{bid.attorney_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          bid.status === 'active' ? 'bg-green-100 text-green-700' :
                          bid.status === 'winning' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{bid.firm_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(bid.total_bid_value)}</div>
                      <div className="text-xs text-gray-500">
                        Upfront: {formatCurrency(bid.bid_components?.standard_initial_fee + bid.bid_components?.upfront_bonus)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Upfront Bonus:</span>
                      <span className="ml-2 font-medium">{formatCurrency(bid.bid_components?.upfront_bonus)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Commission Bonus:</span>
                      <span className="ml-2 font-medium">+{((bid.bid_components?.commission_bonus_percentage || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Client Bonus:</span>
                      <span className="ml-2 font-medium">+{((bid.bid_components?.client_bonus_percentage || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  {bid.status === 'active' && caseItem?.status === 'available' && (
                    <div className="mt-3 pt-3 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => onAcceptBid(caseItem.case_id, bid)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept This Bid
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No bids yet</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function MarketplaceManagement() {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', category: 'all' });
  const [search, setSearch] = useState('');
  
  // Modals
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Get token from localStorage when user changes
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      setToken(authToken);
    }
  }, [user]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/marketplace/admin/cases?limit=100`;
      if (filter.status !== 'all') url += `&status=${filter.status}`;
      if (filter.category !== 'all') url += `&category=${filter.category}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCases();
      fetchStats();
    }
  }, [token, filter]);

  const handleCreateCase = async (formData) => {
    try {
      // Ensure estimated_value is a number
      const payload = {
        ...formData,
        estimated_value: parseFloat(formData.estimated_value) || 0
      };
      
      const response = await fetch(`${API_URL}/api/marketplace/admin/cases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setCaseModalOpen(false);
        setEditCase(null);
        fetchCases();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create case');
      }
    } catch (err) {
      console.error('Error creating case:', err);
      alert('Failed to create case: ' + err.message);
    }
  };

  const handleAcceptBid = async (caseId, bid) => {
    if (!window.confirm(`Accept bid from ${bid.attorney_name} for ${formatCurrency(bid.total_bid_value)}?`)) {
      return;
    }
    
    try {
      // Update case to assign to winning bidder
      const response = await fetch(`${API_URL}/api/marketplace/cases/${caseId}/pledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agreement_accepted: true,
          winning_bid_id: bid.bid_id,
          attorney_id: bid.attorney_id
        })
      });
      
      if (response.ok) {
        alert('Bid accepted successfully!');
        setBidsModalOpen(false);
        fetchCases();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to accept bid');
      }
    } catch (err) {
      console.error('Error accepting bid:', err);
    }
  };

  // Filter cases by search
  const filteredCases = cases.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.case_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attorney Marketplace</h1>
          <p className="text-gray-500">Manage cases and bids in the attorney network</p>
        </div>
        <Button onClick={() => { setEditCase(null); setCaseModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Case
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Cases"
          value={stats?.cases?.total || 0}
          icon={Gavel}
          color="bg-blue-500"
        />
        <StatCard
          title="Available"
          value={stats?.cases?.available || 0}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Pledged"
          value={stats?.cases?.pledged || 0}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="In Progress"
          value={stats?.cases?.in_progress || 0}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.revenue?.total)}
          icon={DollarSign}
          color="bg-emerald-500"
          subtext={`${stats?.revenue?.cases_settled || 0} cases settled`}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter.status} onValueChange={(v) => setFilter({ ...filter, status: v })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pledged">Pledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.category} onValueChange={(v) => setFilter({ ...filter, category: v })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="bidding">Bidding</SelectItem>
                <SelectItem value="class_action">Class Action</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchCases}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Case ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Value</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Bids</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Assigned To</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((caseItem) => (
                    <CaseRow
                      key={caseItem.case_id}
                      caseItem={caseItem}
                      onView={(c) => { setSelectedCase(c); }}
                      onEdit={(c) => { setEditCase(c); setCaseModalOpen(true); }}
                      onManageBids={(c) => { setSelectedCase(c); setBidsModalOpen(true); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Gavel className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No cases found</p>
              <Button className="mt-4" onClick={() => setCaseModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create First Case
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CaseModal
        open={caseModalOpen}
        onClose={() => { setCaseModalOpen(false); setEditCase(null); }}
        onSave={handleCreateCase}
        editCase={editCase}
      />

      <BidsModal
        open={bidsModalOpen}
        onClose={() => setBidsModalOpen(false)}
        caseItem={selectedCase}
        onAcceptBid={handleAcceptBid}
        token={token}
      />
    </div>
  );
}
