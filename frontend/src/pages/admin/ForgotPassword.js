import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/security/forgot-password', { email });
      setSent(true);
      // In dev mode, the token is returned directly
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token);
      }
      toast.success('Reset instructions sent');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4" data-testid="forgot-password-page">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">Credlocity</h1>
          <p className="text-gray-600">Reset Your Password</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                  data-testid="forgot-email-input"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">We'll send password reset instructions to this email.</p>
            </div>

            <Button type="submit" className="w-full bg-secondary-green hover:bg-secondary-light text-white" disabled={loading} data-testid="forgot-submit-btn">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link to="/admin/login" className="text-sm text-primary-blue hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-secondary-green mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">Check Your Email</h2>
            <p className="text-gray-600 text-sm">If an account exists with <strong>{email}</strong>, you'll receive password reset instructions.</p>

            {resetToken && (
              <div className="bg-blue-50 rounded-xl p-4 text-left mt-4" data-testid="reset-token-display">
                <p className="text-xs font-semibold text-blue-800 mb-1">Development Mode — Reset Link:</p>
                <Link
                  to={`/admin/reset-password?token=${resetToken}`}
                  className="text-sm text-primary-blue hover:underline break-all"
                  data-testid="reset-link"
                >
                  Click here to reset password
                </Link>
              </div>
            )}

            <div className="pt-4">
              <Link to="/admin/login" className="text-sm text-primary-blue hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
