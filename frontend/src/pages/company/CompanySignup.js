import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone, 
  MapPin, CheckCircle, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../utils/api';

const CompanySignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupResult, setSignupResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.company_name || !formData.owner_name || !formData.email) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/companies/signup', {
        company_name: formData.company_name,
        owner_name: formData.owner_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        website: formData.website
      });
      
      setSignupResult(response.data);
      setStep(4); // Success step
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-12 h-12 text-blue-400" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">Credlocity</h1>
              <p className="text-blue-300 text-sm">Company Registration</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {step === 4 ? 'Registration Complete!' : 'Register Your Company'}
            </CardTitle>
            {step !== 4 && (
              <CardDescription className="text-gray-300 text-center">
                Step {step} of 3
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {step !== 4 && renderStepIndicator()}

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="company_name"
                      placeholder="Your Credit Repair Company"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Owner Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="owner_name"
                      placeholder="John Doe"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.owner_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="company@example.com"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                  onClick={nextStep}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.password}
                      onChange={handleChange}
                      required
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={nextStep}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Address (Optional) */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Business Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="address"
                      placeholder="123 Main Street"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="city"
                    placeholder="City"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <Input
                    name="state"
                    placeholder="State"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  name="zip_code"
                  placeholder="ZIP Code"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  value={formData.zip_code}
                  onChange={handleChange}
                />
                <Input
                  name="website"
                  placeholder="Website (optional)"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  value={formData.website}
                  onChange={handleChange}
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && signupResult && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Welcome to Credlocity!</h3>
                <p className="text-gray-300">Your company has been registered successfully.</p>
                
                <div className="bg-white/10 rounded-lg p-4 text-left">
                  <h4 className="text-white font-medium mb-2">Next Steps:</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>1. Complete your one-time signup fee: <span className="text-green-400 font-bold">${signupResult.signup_fee}</span></p>
                    <p>2. Monthly subscription: <span className="text-blue-400 font-bold">${signupResult.monthly_fee}/month</span></p>
                    <p>3. Start submitting cases to the marketplace</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate('/company/login')}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {step !== 4 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-center text-gray-300 text-sm">
                  Already have an account?{' '}
                  <Link to="/company/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Info */}
        {step !== 4 && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="text-blue-300 font-semibold mb-2">Subscription Pricing</h3>
            <div className="text-gray-400 text-sm space-y-1">
              <p>• One-time signup fee: <span className="text-white">$500</span></p>
              <p>• Monthly subscription: <span className="text-white">$199.99/month</span></p>
              <p>• Revenue share: <span className="text-white">60% to you</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySignup;
