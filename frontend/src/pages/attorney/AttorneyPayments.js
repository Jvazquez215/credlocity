import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wallet, DollarSign, Clock, CheckCircle, 
  AlertTriangle, CreditCard, RefreshCw, Download, Plus,
  TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export default function AttorneyPayments() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('attorney_token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Fetch payment summary
      const summaryRes = await fetch(`${API_URL}/api/marketplace/attorney/payment-summary`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setPaymentData(data);
      }

      // Fetch transactions
      const transRes = await fetch(`${API_URL}/api/marketplace/attorney/transactions`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (transRes.ok) {
        const data = await transRes.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/attorney" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Payments & Billing</h1>
                <p className="text-sm text-gray-500">Manage your account balance and transactions</p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available Balance</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(paymentData?.account_balance || 0)}
                  </p>
                  <p className="text-green-100 text-xs mt-1">For bidding on cases</p>
                </div>
                <Wallet className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Earnings</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(paymentData?.total_earnings || 0)}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">From settled cases</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending Fees</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(paymentData?.pending_fees || 0)}
                  </p>
                  <p className="text-amber-100 text-xs mt-1">Initial fees due</p>
                </div>
                <Clock className="w-12 h-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Initial Fees */}
        {paymentData?.pending_initial_fees?.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Pending Initial Fees
              </CardTitle>
              <CardDescription className="text-amber-700">
                The $500 initial referral fee is due for each pledged case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentData.pending_initial_fees.map((fee) => (
                  <div key={fee.case_id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                    <div>
                      <p className="font-medium">{fee.case_title}</p>
                      <p className="text-sm text-gray-500">{fee.case_id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-amber-700">$500</span>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Breakdown Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
            <CardDescription>Understanding how fees are calculated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Initial Referral Fee</h4>
                <p className="text-2xl font-bold text-blue-700 mb-2">$500</p>
                <p className="text-sm text-blue-600">
                  Non-negotiable fee due upon pledging a case. This goes to Credlocity.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Commission on Settlement</h4>
                <p className="text-2xl font-bold text-green-700 mb-2">3-10%</p>
                <p className="text-sm text-green-600">
                  Percentage of settlement based on tier. Split between Credlocity and you keep the rest.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Your Earnings</h4>
                <p className="text-2xl font-bold text-purple-700 mb-2">85-95%</p>
                <p className="text-sm text-purple-600">
                  After Credlocity's fee and commission, the rest is your attorney fee.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div key={tx.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowDownRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()} • {tx.reference}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
