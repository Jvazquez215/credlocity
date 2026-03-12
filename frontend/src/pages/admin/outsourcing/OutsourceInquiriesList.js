import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { CheckCircle, XCircle, Clock, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const OutsourceInquiriesList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.get('/admin/outsource/inquiries');
      setInquiries(response.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      // When approving, automatically create a partner record
      const payload = { status };
      if (status === 'approved') {
        payload.create_partner = true;
      }
      await api.patch(`/admin/outsource/inquiries/${id}/status`, payload);
      toast.success(status === 'approved' ? 'Inquiry approved & partner created!' : `Inquiry ${status}`);
      fetchInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === filter);

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      disapproved: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Partner Inquiries</h2>
          <p className="text-gray-600 mt-1">Review and manage outsourcing partnership requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'disapproved'].map((status) => (
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
            {status === 'pending' && inquiries.filter(i => i.status === 'pending').length > 0 && (
              <span className="ml-2 bg-white text-primary-blue px-2 py-0.5 rounded-full text-xs">
                {inquiries.filter(i => i.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Inquiries</h3>
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} inquiries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{inquiry.company_name}</h3>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Contact Person</p>
                      <p className="font-medium text-gray-900">
                        {inquiry.contact_first_name} {inquiry.contact_last_name}
                        <span className="text-gray-500 font-normal"> ({inquiry.position})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">CRM Platform</p>
                      <p className="font-medium text-gray-900">{inquiry.current_platform || 'Not specified'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${inquiry.contact_email}`} className="text-primary-blue hover:underline">
                        {inquiry.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${inquiry.contact_phone}`} className="text-primary-blue hover:underline">
                        {inquiry.contact_phone}
                      </a>
                    </div>
                  </div>

                  {inquiry.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-700">{inquiry.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-4">
                    Submitted: {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {inquiry.status === 'pending' && (
                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      onClick={() => updateStatus(inquiry.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      onClick={() => updateStatus(inquiry.id, 'disapproved')}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutsourceInquiriesList;