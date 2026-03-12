import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { 
  Users, FileText, DollarSign, Clock, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, Plus, ArrowRight,
  Building2, Receipt, ClipboardList, AlertTriangle, Settings
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, link, trend }) => (
  <Link to={link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group">
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-4">{value}</p>
    <p className="text-gray-500 text-sm mt-1">{label}</p>
  </Link>
);

const OutsourcingDashboard = () => {
  const [stats, setStats] = useState({
    totalPartners: 0,
    activePartners: 0,
    pendingInquiries: 0,
    totalInvoices: 0,
    unpaidInvoices: 0,
    totalRevenue: 0,
    thisMonthWork: 0,
    openTickets: 0,
    criticalTickets: 0
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentPartners, setRecentPartners] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inquiriesRes, partnersRes, invoicesRes, ticketsRes] = await Promise.all([
        api.get('/admin/outsource/inquiries').catch(() => ({ data: [] })),
        api.get('/admin/outsource/partners').catch(() => ({ data: [] })),
        api.get('/admin/outsource/invoices').catch(() => ({ data: [] })),
        api.get('/admin/outsource/tickets').catch(() => ({ data: [] }))
      ]);

      const inquiries = inquiriesRes.data || [];
      const partners = partnersRes.data || [];
      const invoices = invoicesRes.data || [];
      const tickets = ticketsRes.data || [];

      const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
      const activePartners = partners.filter(p => p.status === 'active').length;
      const unpaidInvoices = invoices.filter(i => i.status !== 'paid').length;
      const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);
      const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const criticalTickets = tickets.filter(t => t.urgency === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

      setStats({
        totalPartners: partners.length,
        activePartners,
        pendingInquiries,
        totalInvoices: invoices.length,
        unpaidInvoices,
        totalRevenue,
        thisMonthWork: 0,
        openTickets,
        criticalTickets
      });

      setRecentInquiries(inquiries.slice(0, 5));
      setRecentPartners(partners.slice(0, 5));
      setRecentTickets(tickets.slice(0, 5));
    } catch (error) {
      console.error('Error fetching outsourcing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      disapproved: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outsourcing Management</h1>
          <p className="text-gray-500 mt-1">Manage your outsourcing partners, work logs, and invoices</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/outsourcing/partners/new">
            <Button className="bg-primary-blue hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" /> Add Partner
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          icon={Building2} 
          label="Total Partners" 
          value={stats.totalPartners}
          color="bg-blue-500"
          link="/admin/outsourcing/partners"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Pending Inquiries" 
          value={stats.pendingInquiries}
          color="bg-yellow-500"
          link="/admin/outsourcing/inquiries"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Open Tickets" 
          value={stats.openTickets}
          color="bg-orange-500"
          link="/admin/outsourcing/tickets"
        />
        <StatCard 
          icon={Receipt} 
          label="Unpaid Invoices" 
          value={stats.unpaidInvoices}
          color="bg-red-500"
          link="/admin/outsourcing/invoices"
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`}
          color="bg-green-500"
          link="/admin/outsourcing/invoices"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/admin/outsourcing/inquiries" className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white hover:shadow-lg transition">
          <AlertCircle className="w-10 h-10 mb-4" />
          <h3 className="font-bold text-xl mb-1">Review Inquiries</h3>
          <p className="text-yellow-100 text-sm">{stats.pendingInquiries} pending approval</p>
        </Link>
        <Link to="/admin/outsourcing/tickets" className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white hover:shadow-lg transition">
          <AlertTriangle className="w-10 h-10 mb-4" />
          <h3 className="font-bold text-xl mb-1">Escalations</h3>
          <p className="text-orange-100 text-sm">{stats.openTickets} open tickets{stats.criticalTickets > 0 ? `, ${stats.criticalTickets} critical` : ''}</p>
        </Link>
        <Link to="/admin/outsourcing/work-logs" className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition">
          <ClipboardList className="w-10 h-10 mb-4" />
          <h3 className="font-bold text-xl mb-1">Log Work</h3>
          <p className="text-blue-100 text-sm">Track disputes processed</p>
        </Link>
        <Link to="/admin/outsourcing/invoices/new" className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg transition">
          <Receipt className="w-10 h-10 mb-4" />
          <h3 className="font-bold text-xl mb-1">Create Invoice</h3>
          <p className="text-green-100 text-sm">Bill a partner for work</p>
        </Link>
      </div>

      {/* Settings Link */}
      <div className="flex justify-end">
        <Link to="/admin/outsourcing/ticket-categories" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <Settings className="w-4 h-4" /> Manage Ticket Categories
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">Recent Inquiries</h3>
            <Link to="/admin/outsourcing/inquiries" className="text-primary-blue text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentInquiries.length > 0 ? (
            <div className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inquiry.company_name}</p>
                    <p className="text-sm text-gray-500">{inquiry.contact_email}</p>
                  </div>
                  {getStatusBadge(inquiry.status)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No inquiries yet</p>
          )}
        </div>

        {/* Recent Partners */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">Partners</h3>
            <Link to="/admin/outsourcing/partners" className="text-primary-blue text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentPartners.length > 0 ? (
            <div className="space-y-3">
              {recentPartners.map((partner) => (
                <Link key={partner.id} to={`/admin/outsourcing/partners/profile/${partner.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-900">{partner.company_name}</p>
                    <p className="text-sm text-gray-500">{partner.crm_platform || 'No CRM'}</p>
                  </div>
                  {getStatusBadge(partner.status)}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No partners yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutsourcingDashboard;