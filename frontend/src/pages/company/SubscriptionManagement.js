import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Check, Calendar, AlertCircle, DollarSign, 
  ChevronRight, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import api from '../../utils/api';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    const token = localStorage.getItem('company_token');
    const companyInfo = JSON.parse(localStorage.getItem('company_info') || '{}');
    
    if (!companyInfo.id) {
      navigate('/company/login');
      return;
    }

    setCompany(companyInfo);
    
    try {
      const [subRes, transRes] = await Promise.all([
        api.get(`/stripe/company/${companyInfo.id}/subscription`),
        api.get(`/stripe/company/${companyInfo.id}/transactions`)
      ]);
      
      setSubscription(subRes.data.subscription);
      setTransactions(transRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySignupFee = async () => {
    setProcessingPayment(true);
    
    try {
      const response = await api.post('/stripe/checkout/session', {
        package_id: 'company_signup',
        company_id: company.id,
        origin_url: window.location.origin,
        metadata: {
          company_name: company.company_name || company.name
        }
      });
      
      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const needsSignupFee = !subscription || !subscription.signup_fee_paid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-gray-500">Manage your subscription and billing</p>
      </div>

      {/* Signup Fee Required Banner */}
      {needsSignupFee && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Signup Fee Required</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Complete your one-time signup fee of $500 to activate your subscription and start submitting cases.
                </p>
                <Button 
                  onClick={handlePaySignupFee}
                  disabled={processingPayment}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Signup Fee ($500)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">Standard Plan</h3>
              <p className="text-gray-500">Monthly subscription for credit repair companies</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Submit unlimited cases</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Access attorney marketplace</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>60% revenue share on settlements</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Analytics dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">$199.99</div>
              <div className="text-gray-500 text-sm">per month</div>
              
              {subscription ? (
                <Badge className={`mt-3 ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                  subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {subscription.status}
                </Badge>
              ) : (
                <Badge className="mt-3 bg-gray-100 text-gray-800">Not Active</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Info */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Current Period</p>
                <p className="font-medium">
                  {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="font-medium">{formatDate(subscription.next_billing_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Signup Fee</p>
                <p className="font-medium">
                  {subscription.signup_fee_paid ? (
                    <span className="text-green-600">Paid on {formatDate(subscription.signup_fee_paid_at)}</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No payment history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{tx.package_name}</td>
                      <td className="px-4 py-3 text-sm">${tx.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${
                          tx.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          tx.payment_status === 'initiated' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-4">Pricing Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">One-time Signup Fee</span>
              <span className="font-medium text-blue-900">$500.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Monthly Subscription</span>
              <span className="font-medium text-blue-900">$199.99/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue Share (You Keep)</span>
              <span className="font-medium text-blue-900">60%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Platform Fee</span>
              <span className="font-medium text-blue-900">40%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
