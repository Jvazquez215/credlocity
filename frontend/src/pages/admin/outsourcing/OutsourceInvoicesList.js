import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Plus, Receipt, CheckCircle, Clock, XCircle, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const OutsourceInvoicesList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partner');
  
  const [invoices, setInvoices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [partnerId]);

  const fetchData = async () => {
    try {
      const [invoicesRes, partnersRes] = await Promise.all([
        api.get(`/admin/outsource/invoices${partnerId ? `?partner_id=${partnerId}` : ''}`),
        api.get('/admin/outsource/partners')
      ]);
      setInvoices(invoicesRes.data);
      setPartners(partnersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getPartnerName = (id) => {
    const partner = partners.find(p => p.id === id);
    return partner?.company_name || 'Unknown Partner';
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Receipt },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const style = styles[status] || styles.draft;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(i => i.status === filter);

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">
            {partnerId ? `Invoices for ${getPartnerName(partnerId)}` : 'Manage outsourcing invoices'}
          </p>
        </div>
        <Button onClick={() => navigate('/admin/outsourcing/invoices/new')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Paid</p>
          <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Outstanding</p>
          <p className="text-2xl font-bold text-red-600">${(totalAmount - paidAmount).toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices</h3>
          <p className="text-gray-500 mb-6">Create your first invoice to get started.</p>
          <Button onClick={() => navigate('/admin/outsourcing/invoices/new')}>
            <Plus className="w-4 h-4 mr-2" /> Create First Invoice
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Partner</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-gray-900">
                      #{invoice.invoice_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{getPartnerName(invoice.partner_id)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      ${(invoice.total_amount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/outsourcing/invoices/${invoice.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutsourceInvoicesList;