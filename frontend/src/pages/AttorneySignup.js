import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Scale, CheckCircle, ArrowRight, Building2, User, Phone, Mail, Globe } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function AttorneySignup() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    bar_number: '',
    state: '',
    years_experience: '',
    firm_name: '',
    firm_address: '',
    firm_city: '',
    firm_state: '',
    firm_zip: '',
    website: '',
    practice_areas: [],
    bio: ''
  });

  const practiceAreaOptions = [
    'Collections', 'Debt Recovery', 'Consumer Law', 'Credit Repair',
    'Bankruptcy', 'Real Estate', 'Business Law', 'Civil Litigation'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/attorneys/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      if (res.ok) {
        setReferralCode(data.referral_code);
        setSuccess(true);
        toast.success('Application submitted successfully!');
      } else {
        toast.error(data.detail || 'Signup failed. Please try again.');
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePracticeArea = (area) => {
    setForm(f => ({
      ...f,
      practice_areas: f.practice_areas.includes(area)
        ? f.practice_areas.filter(a => a !== area)
        : [...f.practice_areas, area]
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to join the Credlocity Attorney Network. 
              We'll review your application and contact you within 2-3 business days.
            </p>
            <div className="p-4 bg-indigo-50 rounded-lg mb-6">
              <p className="text-sm text-gray-500 mb-1">Your Referral Code</p>
              <code className="text-2xl font-mono font-bold text-indigo-700">{referralCode}</code>
            </div>
            <Link to="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join Our Attorney Network</h1>
          <p className="text-gray-600 mt-2">Partner with Credlocity to expand your practice and earn additional revenue</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">15%</p>
            <p className="text-xs text-gray-500">Commission Rate</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">100+</p>
            <p className="text-xs text-gray-500">Active Cases/Month</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">24/7</p>
            <p className="text-xs text-gray-500">Portal Access</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Attorney Application</CardTitle>
            <CardDescription>Step {step} of 3</CardDescription>
            {/* Progress */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-2 flex-1 rounded ${s <= step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" />Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Full Name *</Label>
                      <Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required className="mt-1" />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required className="mt-1" />
                    </div>
                    <div>
                      <Label>Password *</Label>
                      <Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required className="mt-1" />
                    </div>
                    <div>
                      <Label>Confirm Password *</Label>
                      <Input type="password" value={form.confirm_password} onChange={(e) => setForm({...form, confirm_password: e.target.value})} required className="mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Bar Information */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Scale className="w-4 h-4" />Bar Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bar Number *</Label>
                      <Input value={form.bar_number} onChange={(e) => setForm({...form, bar_number: e.target.value})} required className="mt-1" />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <select value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required className="w-full h-10 mt-1 px-3 border rounded-md">
                        <option value="">Select State</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input type="number" value={form.years_experience} onChange={(e) => setForm({...form, years_experience: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="https://" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Practice Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {practiceAreaOptions.map(area => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => togglePracticeArea(area)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            form.practice_areas.includes(area)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Firm Information */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" />Firm Information</h3>
                  <div>
                    <Label>Firm Name *</Label>
                    <Input value={form.firm_name} onChange={(e) => setForm({...form, firm_name: e.target.value})} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Firm Address</Label>
                    <Input value={form.firm_address} onChange={(e) => setForm({...form, firm_address: e.target.value})} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input value={form.firm_city} onChange={(e) => setForm({...form, firm_city: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>State</Label>
                      <select value={form.firm_state} onChange={(e) => setForm({...form, firm_state: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md">
                        <option value="">Select</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>ZIP</Label>
                      <Input value={form.firm_zip} onChange={(e) => setForm({...form, firm_zip: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Bio / About You</Label>
                    <Textarea 
                      value={form.bio} 
                      onChange={(e) => setForm({...form, bio: e.target.value})}
                      placeholder="Tell us about your experience and why you'd like to partner with Credlocity..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
                ) : (
                  <Link to="/"><Button type="button" variant="outline">Cancel</Button></Link>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={() => setStep(s => s + 1)}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already a partner? <Link to="/attorney/login" className="text-indigo-600 hover:underline">Sign in to your portal</Link>
        </p>
      </div>
    </div>
  );
}
