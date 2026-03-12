import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../utils/api';

const OutsourcingLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/outsourcing/partner/login', formData);
      
      // Store token and partner info
      localStorage.setItem('partner_token', response.data.token);
      localStorage.setItem('partner_info', JSON.stringify(response.data.partner));
      
      // Redirect to partner dashboard
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12 text-emerald-400" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">Credlocity</h1>
              <p className="text-emerald-300 text-sm">Partner Portal</p>
            </div>
          </div>
          <p className="text-gray-400">Outsourcing Partner Access</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Partner Login</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Access your outsourcing partner dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="partner@example.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="partner-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="partner-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
                data-testid="partner-login-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-center text-gray-300 text-sm">
                Want to become a partner?{' '}
                <Link to="/outsourcing" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Learn more
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-gray-400 hover:text-white text-sm">
                ← Back to main site
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <h3 className="text-emerald-300 font-semibold mb-2">Outsourcing Partners</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Submit work logs and track hours</li>
            <li>• View and manage invoices</li>
            <li>• Submit and track support tickets</li>
            <li>• Access partner resources</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OutsourcingLogin;
