import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { Search, Filter, Phone, MessageSquare, Mail, CheckCircle, ArrowRight, RefreshCw, MoreVertical, Archive, Trash2, RotateCcw, Plus } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const tierConfig = {
  1: { color: 'bg-blue-100 text-blue-700', label: 'Tier 1' },
  2: { color: 'bg-yellow-100 text-yellow-700', label: 'Tier 2' },
  3: { color: 'bg-orange-100 text-orange-700', label: 'Tier 3' },
  4: { color: 'bg-red-100 text-red-700', label: 'Tier 4' }
};

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  disputed: { color: 'bg-amber-100 text-amber-700', label: 'Disputed' },
  payment_plan: { color: 'bg-blue-100 text-blue-700', label: 'Payment Plan' },
  resolved: { color: 'bg-gray-100 text-gray-700', label: 'Resolved' },
  archived: { color: 'bg-slate-100 text-slate-600', label: 'Archived' }
};

export default function CollectionsAccountsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    tier: searchParams.get('tier') || ''
  });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, [filters]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.tier) params.append('tier', filters.tier);

      const res = await fetch(`${API_URL}/api/collections/accounts?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value === 'all' ? '' : value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleArchive = async (account) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${account.id}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Account for ${account.client_name} archived`);
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to archive account');
      }
    } catch (error) {
      toast.error('Failed to archive account');
    }
    setActionMenu(null);
  };

  const handleRestore = async (account) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${account.id}/restore`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Account for ${account.client_name} restored`);
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to restore account');
      }
    } catch (error) {
      toast.error('Failed to restore account');
    }
    setActionMenu(null);
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${selectedAccount.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Account for ${selectedAccount.client_name} deleted permanently`);
        fetchAccounts();
        setDeleteModal(false);
        setSelectedAccount(null);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const ComplianceIndicator = ({ compliance }) => {
    const calls = compliance?.calls_completed || 0;
    const texts = compliance?.texts_completed || 0;
    const emails = compliance?.emails_completed || 0;

    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 ${calls >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
          <Phone className="w-3 h-3" />
          <span className="text-xs">{calls}/3</span>
        </div>
        <div className={`flex items-center gap-1 ${texts >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
          <MessageSquare className="w-3 h-3" />
          <span className="text-xs">{texts}/3</span>
        </div>
        <div className={`flex items-center gap-1 ${emails >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
          <Mail className="w-3 h-3" />
          <span className="text-xs">{emails}/3</span>
        </div>
        {calls >= 3 && texts >= 3 && emails >= 3 && (
          <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collection Accounts</h1>
          <p className="text-gray-500">Manage and track past-due accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAccounts} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/admin/collections/accounts/new">
            <Button className="bg-primary-blue hover:bg-primary-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by client name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => handleFilterChange('status', v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="payment_plan">Payment Plan</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.tier || 'all'}
              onValueChange={(v) => handleFilterChange('tier', v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="1">Tier 1</SelectItem>
                <SelectItem value="2">Tier 2</SelectItem>
                <SelectItem value="3">Tier 3</SelectItem>
                <SelectItem value="4">Tier 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Days Past Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Today's Compliance</TableHead>
                <TableHead>Assigned Rep</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Loading accounts...
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{account.client_name}</p>
                        <p className="text-sm text-gray-500">{account.client_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tierConfig[account.current_tier]?.color}>
                        {tierConfig[account.current_tier]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-red-600">
                        ${account.past_due_balance?.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700">{account.days_past_due} days</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[account.account_status]?.color}>
                        {statusConfig[account.account_status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ComplianceIndicator compliance={account.today_compliance} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{account.assigned_rep_name || 'Unassigned'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/collections/accounts/${account.id}`}>
                          <Button size="sm" variant="ghost" className="text-primary-blue hover:text-primary-blue/80">
                            View <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        
                        {/* Actions dropdown */}
                        <div className="relative">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setActionMenu(actionMenu === account.id ? null : account.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          
                          {actionMenu === account.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded-lg shadow-lg z-50">
                              {account.account_status === 'archived' ? (
                                <button
                                  onClick={() => handleRestore(account)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <RotateCcw className="w-4 h-4 text-green-600" />
                                  Restore
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleArchive(account)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Archive className="w-4 h-4 text-orange-600" />
                                  Archive
                                </button>
                              )}
                              <button
                                onClick={() => { setSelectedAccount(account); setDeleteModal(true); setActionMenu(null); }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Account Permanently?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to permanently delete this account? This action cannot be undone.
            </p>
            {selectedAccount && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold">{selectedAccount.client_name}</p>
                <p className="text-sm text-gray-600">{selectedAccount.client_email}</p>
                <p className="text-sm text-red-600 mt-2">Balance: ${selectedAccount.past_due_balance?.toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDeleteModal(false); setSelectedAccount(null); }}>
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Click outside to close action menu */}
      {actionMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
      )}
    </div>
  );
}
