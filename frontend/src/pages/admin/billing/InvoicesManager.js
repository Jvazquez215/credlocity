import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import { FileText, Search, Filter, Eye, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const InvoicesManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [filterType, filterStatus]);

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (filterType) params.invoice_type = filterType;
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.get('/billing/invoices', { params });
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;
    
    try {
      await api.post(`/billing/invoices/${selectedInvoice.id}/record-payment`, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        payment_reference: paymentReference
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentReference('');
      fetchInvoices();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      partial: 'bg-blue-100 text-blue-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      refunded: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.entity_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="invoices-manager">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="company_subscription">Company Subscription</option>
            <option value="attorney_fee">Attorney Fee</option>
            <option value="outsourcing">Outsourcing</option>
            <option value="case_settlement">Case Settlement</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-xl font-bold">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold">{invoices.filter(i => i.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-xl font-bold">{invoices.filter(i => i.status === 'paid').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold">{invoices.filter(i => i.status === 'overdue').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {filteredInvoices.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Entity</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Paid</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-primary-blue">{invoice.invoice_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.entity_name || '-'}</p>
                      <p className="text-sm text-gray-500">{invoice.entity_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                      {invoice.invoice_type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">
                    {formatCurrency(invoice.paid_amount)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentAmount((invoice.total_amount - (invoice.paid_amount || 0)).toFixed(2));
                            setShowPaymentModal(true);
                          }}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</h3>
            <p className="text-gray-500">Invoices will appear here when generated</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Invoice {selectedInvoice.invoice_number}</h2>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>×</Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Entity</p>
                  <p className="font-medium">{selectedInvoice.entity_name}</p>
                  <p className="text-sm text-gray-500">{selectedInvoice.entity_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedInvoice.invoice_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(selectedInvoice.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.due_date)}</p>
                </div>
              </div>

              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Line Items</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedInvoice.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                        <span>{item.description}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount_amount > 0 && (
                  <div className="flex justify-between py-2 text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedInvoice.discount_amount)}</span>
                  </div>
                )}
                {selectedInvoice.tax_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
                <div className="flex justify-between py-2 text-green-600">
                  <span>Paid</span>
                  <span>{formatCurrency(selectedInvoice.paid_amount)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Balance Due</span>
                  <span className={selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0))}
                  </span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="mt-1">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
              {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                <Button onClick={() => {
                  setPaymentAmount((selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0)).toFixed(2));
                  setShowPaymentModal(true);
                }}>
                  Record Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Record Payment</h2>
              <p className="text-gray-500">Invoice: {selectedInvoice.invoice_number}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Balance Due</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0))}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select method...</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID</label>
                <Input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowPaymentModal(false);
                setPaymentAmount('');
                setPaymentMethod('');
                setPaymentReference('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} disabled={!paymentAmount}>
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesManager;
