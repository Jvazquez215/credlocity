import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import {
  AlertTriangle, Clock, CheckCircle, XCircle, User, MessageSquare,
  Building2, Search, Filter, Eye, ChevronDown
} from 'lucide-react';

const OutsourceTicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterUrgency, filterPartner]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterUrgency) params.append('urgency', filterUrgency);
      if (filterPartner) params.append('partner_id', filterPartner);

      const [ticketsRes, partnersRes, categoriesRes] = await Promise.all([
        api.get(`/admin/outsource/tickets?${params.toString()}`),
        api.get('/admin/outsource/partners'),
        api.get('/admin/outsource/ticket-categories')
      ]);
      setTickets(ticketsRes.data);
      setPartners(partnersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getPartnerName = (partnerId) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.company_name || 'Unknown';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      low: { bg: 'bg-gray-100', text: 'text-gray-700' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700' },
      critical: { bg: 'bg-red-100', text: 'text-red-700' }
    };
    const style = styles[urgency] || styles.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${style.bg} ${style.text}`}>
        {urgency?.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Clock },
      waiting: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
    };
    const style = styles[status] || styles.open;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const handleUpdateStatus = async (ticketId, newStatus, resolution = '') => {
    try {
      await api.put(`/admin/outsource/tickets/${ticketId}`, {
        status: newStatus,
        resolution_notes: resolution
      });
      toast.success('Ticket updated');
      fetchData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    critical: tickets.filter(t => t.urgency === 'critical').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Escalation Tickets</h2>
        <p className="text-gray-600 mt-1">Manage and track escalation tickets across all partners</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Critical</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <Label className="text-xs">Status</Label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Label className="text-xs">Urgency</Label>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Partner</Label>
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Partners</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.company_name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => { setFilterStatus(''); setFilterUrgency(''); setFilterPartner(''); }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Found</h3>
          <p className="text-gray-500">No escalation tickets match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => { setSelectedTicket(ticket); setShowDetailModal(true); }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-500">{ticket.ticket_number}</span>
                    {getStatusBadge(ticket.status)}
                    {getUrgencyBadge(ticket.urgency)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {getPartnerName(ticket.partner_id)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {getCategoryName(ticket.category_id)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {ticket.response_time_hours}h response
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Submitted by: {ticket.submitted_by_name}</p>
                  <p>{formatDateTime(ticket.created_at)}</p>
                  {ticket.due_by && (
                    <p className="text-orange-600 font-medium">Due: {formatDateTime(ticket.due_by)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          partnerName={getPartnerName(selectedTicket.partner_id)}
          categoryName={getCategoryName(selectedTicket.category_id)}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

const TicketDetailModal = ({ ticket, partnerName, categoryName, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(ticket.status);
  const [resolution, setResolution] = useState(ticket.resolution_notes || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-mono text-sm text-gray-500">{ticket.ticket_number}</p>
              <h2 className="text-xl font-bold text-gray-900">{ticket.subject}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Partner</Label>
                <p className="font-medium">{partnerName}</p>
              </div>
              <div>
                <Label className="text-gray-500">Category</Label>
                <p className="font-medium">{categoryName}</p>
              </div>
              <div>
                <Label className="text-gray-500">Contact Name</Label>
                <p className="font-medium">{ticket.contact_name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Communication Method</Label>
                <p className="font-medium capitalize">{ticket.communication_method}</p>
              </div>
              <div>
                <Label className="text-gray-500">Submitted By</Label>
                <p className="font-medium">{ticket.submitted_by_name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Response Time</Label>
                <p className="font-medium">{ticket.response_time_hours} hours</p>
              </div>
            </div>

            <div>
              <Label className="text-gray-500">Notes</Label>
              <p className="bg-gray-50 p-4 rounded-lg mt-1">{ticket.notes}</p>
            </div>

            <div className="border-t pt-4">
              <Label>Update Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {(status === 'resolved' || status === 'closed') && (
              <div>
                <Label>Resolution Notes</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  placeholder="Describe how the issue was resolved..."
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => onUpdateStatus(ticket.id, status, resolution)}
              >
                Update Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutsourceTicketsList;
