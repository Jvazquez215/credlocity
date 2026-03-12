import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Plus, Pencil, Building2, CheckCircle, XCircle, Clock, DollarSign, Users, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const OutsourcePartnersList = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await api.get('/admin/outsource/partners');
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const style = styles[status] || styles.inactive;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const calculateMonthly = (partner) => {
    const cost = partner.cost_per_consumer || 0;
    const count = partner.active_client_count || 0;
    return (cost * count).toFixed(2);
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
          <h2 className="text-3xl font-bold text-gray-900">Outsource Partners</h2>
          <p className="text-gray-600 mt-1">Manage your outsourcing client accounts and billing</p>
        </div>
        <Button onClick={() => navigate('/admin/outsourcing/partners/new')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Partner
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Partners</p>
          <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Active Partners</p>
          <p className="text-2xl font-bold text-green-600">{partners.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold text-blue-600">
            {partners.reduce((sum, p) => sum + (p.active_client_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Est. Monthly Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ${partners.reduce((sum, p) => sum + ((p.cost_per_consumer || 0) * (p.active_client_count || 0)), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Partners Yet</h3>
          <p className="text-gray-500 mb-6">Add your first outsourcing partner to get started.</p>
          <Button onClick={() => navigate('/admin/outsourcing/partners/new')}>
            <Plus className="w-4 h-4 mr-2" /> Add First Partner
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Per Client
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    Clients
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Monthly Est.</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-blue" />
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/admin/outsourcing/partners/profile/${partner.id}`)}
                          className="font-semibold text-primary-blue hover:underline text-left"
                        >
                          {partner.company_name}
                        </button>
                        <p className="text-sm text-gray-500">{partner.crm_platform_id || 'No CRM'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {partner.contact_first_name} {partner.contact_last_name}
                    </p>
                    <p className="text-sm text-gray-500">{partner.contact_email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-semibold text-gray-900">
                      ${(partner.cost_per_consumer || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      <Users className="w-3 h-3" />
                      {partner.active_client_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-green-600">
                      ${calculateMonthly(partner)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(partner.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/outsourcing/invoices/new?partner=${partner.id}`)}
                        title="Create Invoice"
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/outsourcing/partners/edit/${partner.id}`)}
                        title="Edit Partner"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Billing Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set the <strong>Cost Per Consumer</strong> on each partner&apos;s profile - this will auto-populate invoices</li>
          <li>• Update the <strong>Active Clients</strong> count when partners add or remove consumers</li>
          <li>• Pricing history is automatically tracked when you change rates or client counts</li>
          <li>• Click the invoice icon to quickly create a new invoice for any partner</li>
        </ul>
      </div>
    </div>
  );
};

export default OutsourcePartnersList;
