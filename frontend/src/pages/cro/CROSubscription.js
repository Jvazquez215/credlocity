import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CROSubscription({ token }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cro/subscription`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setSubscription(await res.json());
    } catch {
      toast.error('Failed to load subscription info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscription(); }, []);

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div data-testid="cro-subscription">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              CRO Partnership Plan
            </CardTitle>
            <CardDescription>Your current subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium">One-Time Signup Fee</p>
                <p className="text-sm text-gray-500">${subscription?.signup_fee?.toFixed(2) || '500.00'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription?.signup_fee_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {subscription?.signup_fee_paid ? <><CheckCircle className="w-4 h-4 inline mr-1" />Paid</> : <><Clock className="w-4 h-4 inline mr-1" />Pending</>}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium">Monthly Subscription</p>
                <p className="text-sm text-gray-500">${subscription?.monthly_fee?.toFixed(2) || '99.99'}/month</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription?.subscription_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {subscription?.subscription_active ? <><CheckCircle className="w-4 h-4 inline mr-1" />Active</> : <><AlertTriangle className="w-4 h-4 inline mr-1" />Inactive</>}
              </span>
            </div>

            {subscription?.subscription_start && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Subscription Started</p>
                  <p className="font-medium">{new Date(subscription.subscription_start).toLocaleDateString()}</p>
                </div>
                {subscription.subscription_next_billing && (
                  <div>
                    <p className="text-gray-500">Next Billing Date</p>
                    <p className="font-medium">{new Date(subscription.subscription_next_billing).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-800">
          <p className="font-medium">Subscription Benefits</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Submit unlimited cases to the Attorney Marketplace</li>
            <li>Earn 80% of all attorney pledge fees and bid payments</li>
            <li>Direct messaging with assigned attorneys</li>
            <li>Real-time case tracking and earnings dashboard</li>
            <li>Priority case review and listing</li>
          </ul>
        </div>

        <Card>
          <CardContent className="p-4 text-sm text-gray-600">
            <p>For billing questions or to update your payment method, please contact support at <a href="mailto:support@credlocity.com" className="text-teal-600 hover:underline">support@credlocity.com</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
