import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CollectionPaymentPortal() {
  const { token } = useParams();
  const [step, setStep] = useState('loading'); // loading, verify, payment, success, error, paid
  const [verifying, setVerifying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ssn, setSsn] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [txnResult, setTxnResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) { setStep('error'); setErrorMsg('Invalid payment link'); return; }
    axios.get(`${API_URL}/api/collections/pay/${token}/info`)
      .then(r => {
        if (r.data.payment_status === 'paid') setStep('paid');
        else setStep('verify');
      })
      .catch(() => { setStep('error'); setErrorMsg('This payment link is not valid or has expired.'); });
  }, [token]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await axios.post(`${API_URL}/api/collections/pay/${token}/verify`, {
        ssn_last_four: ssn, birth_year: birthYear
      });
      setSessionToken(res.data.session_token);
      setAccountInfo(res.data);
      setPayAmount(res.data.amount_remaining.toFixed(2));
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally { setVerifying(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!card.number || !card.expiry || !card.cvv) { toast.error('Please fill in all card fields'); return; }
    setProcessing(true);
    try {
      const res = await axios.post(`${API_URL}/api/collections/pay/${token}/process`, {
        session_token: sessionToken,
        amount: parseFloat(payAmount),
        card_number: card.number,
        expiration_date: card.expiry,
        card_code: card.cvv
      });
      setTxnResult(res.data);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed');
    } finally { setProcessing(false); }
  };

  const formatCardNumber = (v) => {
    const nums = v.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4" data-testid="payment-portal">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Credlocity</h1>
          <p className="text-sm text-slate-500">Secure Payment Portal</p>
        </div>

        {/* Loading */}
        {step === 'loading' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500">Loading payment information...</p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center" data-testid="payment-error">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Link Not Found</h2>
            <p className="text-sm text-slate-500">{errorMsg}</p>
          </div>
        )}

        {/* Already Paid */}
        {step === 'paid' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center" data-testid="payment-already-paid">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Account Paid</h2>
            <p className="text-sm text-slate-500">This account has been paid in full. No further action is required.</p>
          </div>
        )}

        {/* Step 1: Verify Identity */}
        {step === 'verify' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" data-testid="verify-form">
            <div className="bg-slate-900 text-white p-5">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="font-bold">Identity Verification</h2>
                  <p className="text-xs text-slate-300">Please verify your identity to access your payment portal</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleVerify} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last 4 Digits of SSN</label>
                <Input
                  type="text" maxLength={4} inputMode="numeric" placeholder="1234"
                  value={ssn} onChange={e => setSsn(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  data-testid="ssn-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year of Birth</label>
                <Input
                  type="text" maxLength={4} inputMode="numeric" placeholder="1985"
                  value={birthYear} onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-lg tracking-[0.3em] font-mono"
                  data-testid="birth-year-input"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={verifying || ssn.length !== 4 || birthYear.length !== 4} data-testid="verify-btn">
                {verifying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying...</> : <>
                  <ShieldCheck className="w-4 h-4 mr-2" />Verify Identity
                </>}
              </Button>
              <p className="text-[10px] text-slate-400 text-center">Your information is encrypted and secure. We will never share your personal data.</p>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && accountInfo && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" data-testid="payment-form">
            <div className="bg-slate-900 text-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">{accountInfo.consumer_name}</h2>
                  <p className="text-xs text-slate-300">Account: {accountInfo.account_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-cyan-400">${accountInfo.amount_remaining.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">Balance Due</p>
                </div>
              </div>
              {accountInfo.amount_paid > 0 && (
                <div className="mt-2 text-xs text-slate-400">
                  Previously paid: ${accountInfo.amount_paid.toFixed(2)} of ${accountInfo.amount_owed.toFixed(2)}
                </div>
              )}
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <Input
                    type="number" step="0.01" min="0.01" max={accountInfo.amount_remaining}
                    value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="pl-7 text-lg font-semibold"
                    data-testid="pay-amount-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                <Input
                  type="text" inputMode="numeric" placeholder="4111 1111 1111 1111"
                  value={card.number} onChange={e => setCard({...card, number: formatCardNumber(e.target.value)})}
                  className="font-mono tracking-wider"
                  data-testid="card-number-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiration</label>
                  <Input
                    type="text" placeholder="MM/YY" maxLength={5}
                    value={card.expiry} onChange={e => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                      setCard({...card, expiry: v});
                    }}
                    className="font-mono"
                    data-testid="card-expiry-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                  <Input
                    type="text" inputMode="numeric" placeholder="123" maxLength={4}
                    value={card.cvv} onChange={e => setCard({...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                    className="font-mono"
                    data-testid="card-cvv-input"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white" disabled={processing} data-testid="process-payment-btn">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</> : <>
                  <CreditCard className="w-4 h-4 mr-2" />Pay ${parseFloat(payAmount || 0).toFixed(2)}
                </>}
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <Lock className="w-3 h-3" />
                <span>Secured by Authorize.net | 256-bit SSL Encryption</span>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && txnResult && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center" data-testid="payment-success">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Successful</h2>
            <p className="text-sm text-slate-500 mb-6">Thank you for your payment.</p>
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Amount Paid</span><span className="font-semibold">${txnResult.amount_paid?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Transaction ID</span><span className="font-mono text-xs">{txnResult.transaction_id}</span></div>
              {txnResult.amount_remaining > 0 && (
                <div className="flex justify-between"><span className="text-slate-500">Remaining Balance</span><span className="font-semibold text-red-600">${txnResult.amount_remaining?.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-green-600">{txnResult.payment_status === 'paid' ? 'Paid in Full' : 'Partial Payment'}</span></div>
            </div>
            {txnResult.amount_remaining > 0 && (
              <Button className="mt-4 bg-blue-600 hover:bg-blue-500" onClick={() => { setAccountInfo({...accountInfo, amount_remaining: txnResult.amount_remaining, amount_paid: txnResult.total_paid}); setPayAmount(txnResult.amount_remaining.toFixed(2)); setCard({number:'',expiry:'',cvv:''}); setStep('payment'); }} data-testid="make-another-payment-btn">
                Make Another Payment
              </Button>
            )}
            <p className="text-xs text-slate-400 mt-4">A confirmation will be sent to your email on file.</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          Credlocity Business Group LLC | 1500 Chestnut Street, Suite 2, Philadelphia, PA 19102
        </p>
      </div>
    </div>
  );
}
