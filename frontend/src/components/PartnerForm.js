import React, { useState } from 'react';
import api from '../utils/api';

const PartnerForm = ({ partnerType, partnerTitle }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    companyName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Step 1: Submit to CRM (external)
      const crmFormData = new FormData();
      crmFormData.append('method', 'addWebFormData');
      crmFormData.append('tab_info_id', 'dDNSRWlFWmZ1N3VIR2RESDI3K0NjUT09');
      crmFormData.append('company_id', 'UmJ1YWN4dkUvbThaUXJqVkdKZ3paUT09');
      crmFormData.append('cust_type', '4');
      crmFormData.append('add_affiliate_flag', '1');
      crmFormData.append('assignedto_id', '-1');
      crmFormData.append('sales_representative_id', '-1');
      crmFormData.append('workflow_statusid', '30');
      crmFormData.append('folder_statusid', '-1');
      crmFormData.append('customer_statusid', '-1');
      crmFormData.append('portalAccess', '1');
      crmFormData.append('customerAgreementIDs', '0');
      crmFormData.append('firstName', formData.firstName);
      crmFormData.append('lastName', formData.lastName);
      crmFormData.append('email', formData.email);
      crmFormData.append('mobilePhone', formData.mobilePhone);
      crmFormData.append('companyName', formData.companyName);

      // Submit to CRM
      await fetch('https://pulse.disputeprocess.com/CustumFieldController?method=addWebFormData', {
        method: 'POST',
        body: crmFormData,
        mode: 'no-cors' // CRM doesn't support CORS, so we use no-cors
      });

      // Step 2: Submit to our CMS API
      await api.post('/partner-leads', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        mobile_phone: formData.mobilePhone,
        company_name: formData.companyName,
        partner_type: partnerType,
        source_url: window.location.pathname
      });

      // Show success
      setSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      setError('There was an error submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Application Submitted!
        </h3>
        <p className="text-green-800 text-lg">
          Thank you for your interest in partnering with Credlocity. 
          We'll review your application and reach out within <strong>24-48 hours</strong>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-8 border-4 border-blue-100"
      style={{ fontFamily: 'Lato, sans-serif' }}
    >
      <div className="text-center mb-6">
        <img
          src="https://pulse.disputeprocess.com//static-resources/company-logo/427aa2e2-c461-47c8-9894-898de6e05505.png"
          alt="Credlocity Logo"
          className="mx-auto mb-4"
          style={{ width: '250px' }}
        />
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Become a Partner
        </h3>
        <p className="text-gray-600">
          Join our {partnerTitle} program
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-0 rounded bg-gray-100 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-0 rounded bg-gray-100 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Mobile Phone *
          </label>
          <input
            type="tel"
            name="mobilePhone"
            value={formData.mobilePhone}
            onChange={handleChange}
            required
            placeholder="(___) ___-____"
            className="w-full px-4 py-3 border-0 rounded bg-gray-100 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-0 rounded bg-gray-100 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-3 border-0 rounded bg-gray-100 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By submitting, you agree to be contacted by Credlocity regarding partnership opportunities.
      </p>
    </form>
  );
};

export default PartnerForm;
