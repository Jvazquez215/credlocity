import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Users, Phone, Mail, Building2 } from 'lucide-react';

const PartnerLeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.partner_type = filter;
      }
      const response = await api.get('/partner-leads', { params });
      setLeads(response.data);
    } catch (err) {
      console.error('Error fetching partner leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[status] || colors.new}`}>
        {status}
      </span>
    );
  };

  const getPartnerTypeLabel = (type) => {
    const labels = {
      'real-estate': 'Real Estate Agent',
      'mortgage': 'Mortgage Professional',
      'car-dealership': 'Car Dealership',
      'social-media-influencer': 'Social Media Influencer'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Program Applications</h1>
          <p className="text-gray-600 mt-1">Real Estate, Mortgage, Car Dealers, and Influencer partner applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          All ({leads.length})
        </button>
        <button
          onClick={() => setFilter('real-estate')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'real-estate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Real Estate
        </button>
        <button
          onClick={() => setFilter('mortgage')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'mortgage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Mortgage
        </button>
        <button
          onClick={() => setFilter('car-dealership')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'car-dealership' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Car Dealerships
        </button>
        <button
          onClick={() => setFilter('social-media-influencer')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'social-media-influencer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Influencers
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading partner leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No partner applications yet.</p>
          <p className="text-sm text-gray-500">
            Applications from your partner program pages will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Partner Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3" />
                        {lead.mobile_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.company_name ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{lead.company_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {getPartnerTypeLabel(lead.partner_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-3">About Partner Leads</h3>
        <p className="text-sm text-gray-700 mb-2">
          These are applications from your partner program pages (/partners). Each lead has been submitted to:
        </p>
        <ul className="text-sm text-gray-700 ml-4 list-disc space-y-1">
          <li><strong>Your CRM</strong> (pulse.disputeprocess.com) - for follow-up</li>
          <li><strong>This CMS</strong> - for tracking and reporting</li>
        </ul>
        <p className="text-sm text-gray-700 mt-3">
          Next steps: Review leads, reach out within 24-48 hours as promised, and update their status.
        </p>
      </div>
    </div>
  );
};

export default PartnerLeadsList;
