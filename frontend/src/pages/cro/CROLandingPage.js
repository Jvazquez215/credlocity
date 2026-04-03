import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Shield, DollarSign, Gavel, TrendingUp, CheckCircle,
  AlertTriangle, FileText, Users, Scale, ChevronDown, ChevronRight,
  ArrowRight, Star, Clock, Eye, Lock, Briefcase, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const PARTICIPATION_AGREEMENT = `CREDLOCITY CRO PARTNERSHIP PARTICIPATION AGREEMENT

This Participation Agreement ("Agreement") is entered into between Credlocity LLC ("Platform") and the Credit Repair Organization ("CRO Partner") identified in the registration form below.

1. PROGRAM OVERVIEW
The Credlocity CRO Partnership Program allows qualified Credit Repair Organizations to submit consumer dispute cases to the Credlocity Attorney Marketplace. Attorneys in the marketplace may pledge on or bid for these cases, generating revenue that is shared between the CRO Partner and Credlocity.

2. ELIGIBILITY REQUIREMENTS
To participate in the CRO Partnership Program, the CRO Partner must:
a) Be a legally registered Credit Repair Organization in good standing
b) Maintain a valid Employer Identification Number (EIN)
c) Comply with all applicable federal and state laws, including the Credit Repair Organizations Act (CROA)
d) Maintain professional liability insurance
e) Not have any pending regulatory actions or consumer complaints
f) Submit accurate and complete documentation for all cases

3. FEES AND PAYMENTS
a) One-Time Signup Fee: $500.00, payable at registration
b) Monthly Subscription: $99.99/month, billed on the same date each month
c) Revenue Share: CRO Partner receives 80% of all attorney pledge fees and winning bid amounts; Credlocity retains 20% as a platform fee
d) Payout Schedule: Payments to CRO Partners are processed within 7 business days of attorney payment confirmation

4. CASE SUBMISSION AND VALUATION
a) CRO Partners may submit individual consumer dispute cases with supporting documentation
b) Case valuation is based on: number of violations, mail method (regular vs. certified), documentation quality, and bureau responses received
c) Cases with an estimated value of $10,000+ and 2+ violations sent via certified mail qualify for competitive bidding
d) Class action cases with 50+ affected consumers qualify for extended 21-day bidding windows

5. PLEDGE SYSTEM
a) Standard Pledge Fee: $400.00 per case
b) Attorneys may pledge on any listed case by paying the pledge fee
c) Upon pledge, the CRO Partner receives 80% ($320.00) and Credlocity retains 20% ($80.00)
d) The pledging attorney is assigned to the case and may begin communication with the CRO Partner

6. BIDDING SYSTEM
a) High-value cases qualify for competitive bidding among attorneys
b) Bidding windows are 14 days (standard) or 21 days (class action with 50+ consumers)
c) The highest bid wins; the CRO Partner receives 80% of the winning bid amount
d) Credlocity retains 20% of the winning bid as a platform fee

7. CLASS ACTION PROVISIONS
a) Cases involving 50+ affected consumers may be designated as potential class actions
b) Class action cases receive extended bidding windows and enhanced visibility
c) Revenue sharing follows the same 80/20 split

8. ENFORCEMENT AND COMPLIANCE
a) CRO Partners must maintain accuracy in all case submissions
b) Submitting fraudulent, misleading, or unsubstantiated cases is grounds for immediate suspension
c) Strike System:
   - First Strike: Written warning
   - Second Strike: 30-day suspension
   - Third Strike: Permanent removal from the program
d) Credlocity reserves the right to audit case submissions at any time
e) CRO Partners must respond to platform inquiries within 48 business hours

9. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all consumer information, case details, and proprietary business information shared through the platform.

10. TERMINATION
a) Either party may terminate this Agreement with 30 days written notice
b) Credlocity may terminate immediately for violations of this Agreement
c) Upon termination, pending cases will be handled through completion
d) Refunds of the signup fee are not available after 14 days

11. LIMITATION OF LIABILITY
Credlocity's total liability to the CRO Partner shall not exceed the fees paid by the CRO Partner in the 12 months preceding any claim.

12. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Florida.

By checking the box below and completing the registration form, the CRO Partner acknowledges that they have read, understood, and agree to be bound by all terms and conditions of this Agreement.`;

export default function CROLandingPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [agreementScrolled, setAgreementScrolled] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company_name: '', owner_name: '', email: '', phone: '',
    ein: '', state: '', password: '', confirm_password: '',
    license_number: '', website: '', promo_code: '',
    card_number: '', expiration_date: '', card_code: ''
  });
  const [promoResult, setPromoResult] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAgreementScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) setAgreementScrolled(true);
  };

  const validatePromo = async () => {
    if (!form.promo_code.trim()) { setPromoResult(null); return; }
    setValidatingPromo(true);
    try {
      const res = await fetch(`${API_URL}/api/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.promo_code, applies_to: 'cro_registration' })
      });
      const data = await res.json();
      if (res.ok) {
        setPromoResult(data);
        toast.success(data.discount?.message || 'Promo code applied!');
      } else {
        setPromoResult(null);
        toast.error(data.detail || 'Invalid promo code');
      }
    } catch {
      setPromoResult(null);
      toast.error('Failed to validate code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreementAccepted) { toast.error('You must accept the participation agreement'); return; }
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    const needsPayment = !promoResult || (promoResult.discount?.final_signup_fee > 0);
    if (needsPayment && (!form.card_number || !form.expiration_date || !form.card_code)) {
      toast.error('Payment information is required');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Register
      const regRes = await fetch(`${API_URL}/api/cro/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, agreement_accepted: true })
      });
      const regData = await regRes.json();
      if (!regRes.ok) { toast.error(regData.detail || 'Registration failed'); setSubmitting(false); return; }

      // Step 2: Process payment if needed
      if (needsPayment && regData.cro_id) {
        const payRes = await fetch(`${API_URL}/api/cro/pay-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cro_id: regData.cro_id,
            card_number: form.card_number,
            expiration_date: form.expiration_date,
            card_code: form.card_code,
          })
        });
        const payData = await payRes.json();
        if (!payRes.ok) {
          toast.error(payData.detail || 'Payment failed — your registration was saved, please contact support.');
          setSubmitting(false);
          return;
        }
      }

      toast.success('Registration submitted! Your application will be reviewed within 24-48 hours.');
      setTimeout(() => navigate('/cro/login'), 3000);
    } catch {
      toast.error('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-teal-300" />
              <span className="text-teal-300 font-medium uppercase tracking-wider text-sm">CRO Partnership Program</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" data-testid="cro-landing-hero">
              Turn Your Credit Repair Cases Into Revenue
            </h1>
            <p className="text-lg text-teal-100 mb-8 leading-relaxed">
              Submit your FCRA, FDCPA, and TCPA violation cases to our Attorney Marketplace. When attorneys pledge or bid on your cases, you earn 80% of the fees — automatically.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => { setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="bg-white text-teal-900 hover:bg-teal-50 px-8 py-3 text-lg font-semibold" data-testid="cro-apply-now-btn">
                Apply Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/cro/login">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg">
                  Partner Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-teal-800 border-t border-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { label: 'Your Revenue Share', value: '80%' },
              { label: 'Standard Pledge Fee', value: '$400' },
              { label: 'Payout Timeline', value: '7 Days' },
              { label: 'Monthly Fee', value: '$99.99' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                <p className="text-teal-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How the CRO Partnership Works</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">A simple, transparent process from case submission to payout</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: FileText, title: 'Submit Cases', desc: 'Upload your consumer dispute cases with supporting documentation to our marketplace.' },
              { step: '2', icon: Eye, title: 'Case Review', desc: 'Our team reviews and values your case within 24-48 hours, then lists it for attorneys.' },
              { step: '3', icon: Gavel, title: 'Attorney Action', desc: 'Attorneys pledge on or bid for your case, paying the platform directly.' },
              { step: '4', icon: DollarSign, title: 'Get Paid', desc: 'You automatically receive 80% of all pledge fees and winning bids within 7 business days.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-sm font-bold text-teal-600 mb-2">STEP {step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Valuation */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Case Valuation System</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">Cases are valued based on multiple factors that determine their worth to attorneys</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Scale, title: 'Violation Count', desc: 'Base value of $1,000 per violation. More violations = higher case value.' },
              { icon: FileText, title: 'Mail Method', desc: 'Certified mail cases receive a 1.5x multiplier over regular mail.' },
              { icon: Star, title: 'Documentation Quality', desc: 'Excellent documentation adds a 1.3x multiplier; good adds 1.1x.' },
              { icon: Award, title: 'Bureau Responses', desc: 'Each bureau response received adds $500 to the case value.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 text-teal-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pledge vs Bidding */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Pledge vs. Competitive Bidding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-teal-200">
              <CardHeader className="bg-teal-50">
                <CardTitle className="flex items-center gap-2 text-teal-800"><Shield className="w-5 h-5" /> Standard Pledge</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <p className="text-sm text-gray-600">For standard-value cases</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Flat $400 pledge fee per case</span></div>
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>You earn $320 (80%)</span></div>
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Immediate attorney assignment</span></div>
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Direct messaging opens instantly</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-800"><TrendingUp className="w-5 h-5" /> Competitive Bidding</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <p className="text-sm text-gray-600">For high-value cases ($10K+ est. value)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Multiple attorneys compete with bids</span></div>
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>You earn 80% of the winning bid</span></div>
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>14-day bidding window (21 for class action)</span></div>
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Higher potential earnings per case</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Class Action */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Class Action Cases</h2>
            <p className="text-gray-600 mb-8">Cases involving 50 or more affected consumers qualify for class action status, receiving extended 21-day bidding windows and enhanced visibility in the marketplace. Class action cases often generate significantly higher bids from attorneys.</p>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Partnership Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              'Legally registered Credit Repair Organization',
              'Valid Employer Identification Number (EIN)',
              'Compliance with CROA and all applicable laws',
              'Professional liability insurance',
              'No pending regulatory actions',
              'Accurate and complete case documentation',
              '$500 one-time signup fee',
              '$99.99 monthly subscription',
            ].map((req, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enforcement */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Enforcement Policy</h2>
            <p className="text-gray-600 text-center mb-8">We maintain a strict enforcement policy to protect consumers and attorneys</p>
            <div className="space-y-4">
              {[
                { strike: 'First Strike', desc: 'Written warning with details of the violation', color: 'border-yellow-200 bg-yellow-50', icon: AlertTriangle, iconColor: 'text-yellow-600' },
                { strike: 'Second Strike', desc: '30-day suspension from the platform', color: 'border-orange-200 bg-orange-50', icon: Clock, iconColor: 'text-orange-600' },
                { strike: 'Third Strike', desc: 'Permanent removal from the CRO Partnership Program', color: 'border-red-200 bg-red-50', icon: Lock, iconColor: 'text-red-600' },
              ].map(({ strike, desc, color, icon: Icon, iconColor }) => (
                <div key={strike} className={`flex items-center gap-4 p-4 rounded-lg border ${color}`}>
                  <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} />
                  <div>
                    <p className="font-bold">{strike}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA + Agreement + Registration Form */}
      <section className="py-20 bg-teal-900 text-white" ref={formRef} id="register">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showForm ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Partner with Credlocity?</h2>
              <p className="text-teal-200 mb-8">Join our network and start earning from your credit repair cases today.</p>
              <Button onClick={() => setShowForm(true)} className="bg-white text-teal-900 hover:bg-teal-50 px-10 py-3 text-lg font-semibold" data-testid="cro-start-registration-btn">
                Start Registration <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-8">CRO Partnership Registration</h2>

              {/* Scrollable Participation Agreement */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Participation Agreement</h3>
                <div
                  onScroll={handleAgreementScroll}
                  className="bg-white text-gray-800 rounded-lg p-6 max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap"
                  data-testid="cro-participation-agreement"
                >
                  {PARTICIPATION_AGREEMENT}
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreementAccepted}
                    onChange={e => setAgreementAccepted(e.target.checked)}
                    disabled={!agreementScrolled}
                    className="rounded border-gray-300 w-5 h-5"
                    data-testid="cro-agreement-checkbox"
                  />
                  <span className={`text-sm ${!agreementScrolled ? 'text-teal-400' : 'text-white'}`}>
                    {!agreementScrolled ? 'Please scroll through the entire agreement to accept' : 'I have read and agree to the Participation Agreement'}
                  </span>
                </label>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="cro-registration-form">
                <Card className="bg-white/10 border-white/20">
                  <CardHeader><CardTitle className="text-white">Company Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-teal-200">Company Name *</label>
                        <Input value={form.company_name} onChange={e => updateField('company_name', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="Your CRO company name" required data-testid="cro-reg-company" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">Owner / Principal Name *</label>
                        <Input value={form.owner_name} onChange={e => updateField('owner_name', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="Full legal name" required data-testid="cro-reg-owner" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">Email *</label>
                        <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="business@company.com" required data-testid="cro-reg-email" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">Phone *</label>
                        <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="(555) 123-4567" required data-testid="cro-reg-phone" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">EIN (Employer Identification Number) *</label>
                        <Input value={form.ein} onChange={e => updateField('ein', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="XX-XXXXXXX" required data-testid="cro-reg-ein" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">State *</label>
                        <select value={form.state} onChange={e => updateField('state', e.target.value)} className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 text-sm" required data-testid="cro-reg-state">
                          <option value="" className="text-gray-900">Select state</option>
                          {US_STATES.map(s => <option key={s} value={s} className="text-gray-900">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">License Number</label>
                        <Input value={form.license_number} onChange={e => updateField('license_number', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="Optional" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">Website</label>
                        <Input value={form.website} onChange={e => updateField('website', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="https://" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardHeader><CardTitle className="text-white">Create Password</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-teal-200">Password *</label>
                        <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="Min. 8 characters" required data-testid="cro-reg-password" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-teal-200">Confirm Password *</label>
                        <Input type="password" value={form.confirm_password} onChange={e => updateField('confirm_password', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="Re-enter password" required data-testid="cro-reg-confirm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-white/10 rounded-lg p-4 border border-white/20 text-sm">
                  <p className="font-medium text-white mb-2">Registration Fees</p>
                  <div className="flex justify-between text-teal-200">
                    <span>One-Time Signup Fee</span>
                    <span className="font-bold text-white">
                      {promoResult?.discount?.final_signup_fee !== undefined
                        ? (promoResult.discount.final_signup_fee === 0 ? 'FREE' : `$${promoResult.discount.final_signup_fee.toFixed(2)}`)
                        : '$500.00'}
                      {promoResult?.discount?.final_signup_fee !== undefined && promoResult.discount.final_signup_fee < 500 && (
                        <span className="line-through text-teal-400 ml-2 text-xs">$500.00</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-teal-200 mt-1">
                    <span>Monthly Subscription</span>
                    <span className="font-bold text-white">
                      {promoResult?.discount?.final_monthly_fee !== undefined
                        ? (promoResult.discount.final_monthly_fee === 0 ? 'FREE' : `$${promoResult.discount.final_monthly_fee.toFixed(2)}/mo`)
                        : '$99.99/mo'}
                    </span>
                  </div>
                  {promoResult?.discount?.free_trial_days > 0 && (
                    <p className="text-green-300 text-xs mt-2 font-medium">{promoResult.discount.free_trial_days}-day free trial included!</p>
                  )}
                  {promoResult?.discount?.message && (
                    <p className="text-green-300 text-xs mt-1 font-medium">{promoResult.discount.message}</p>
                  )}
                  <p className="text-teal-300 text-xs mt-3">Payment will be processed upon submission.</p>
                </div>

                {/* Promo Code */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader><CardTitle className="text-white text-lg">Promo Code (Optional)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input value={form.promo_code} onChange={e => { updateField('promo_code', e.target.value.toUpperCase()); if (!e.target.value) setPromoResult(null); }} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300 flex-1" placeholder="Enter promo code" data-testid="cro-reg-promo" />
                      <Button type="button" onClick={validatePromo} variant="outline" className="border-white/30 text-white hover:bg-white/10" disabled={validatingPromo || !form.promo_code} data-testid="apply-promo-btn">
                        {validatingPromo ? 'Checking...' : 'Apply'}
                      </Button>
                    </div>
                    {promoResult && (
                      <p className="text-green-300 text-sm mt-2 font-medium" data-testid="promo-applied-msg">{promoResult.discount?.message}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Info - only if payment is needed */}
                {(!promoResult || promoResult.discount?.final_signup_fee > 0) && (
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader><CardTitle className="text-white text-lg">Payment Information</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <label className="text-sm font-medium text-teal-200">Card Number *</label>
                          <Input value={form.card_number} onChange={e => updateField('card_number', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="4111111111111111" required data-testid="cro-reg-card" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-teal-200">Expiration (MMYY) *</label>
                          <Input value={form.expiration_date} onChange={e => updateField('expiration_date', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="1228" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-teal-200">CVV *</label>
                          <Input value={form.card_code} onChange={e => updateField('card_code', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-teal-300" placeholder="123" required />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button type="submit" className="w-full bg-white text-teal-900 hover:bg-teal-50 py-3 text-lg font-semibold" disabled={submitting || !agreementAccepted} data-testid="cro-register-submit">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>

              <p className="text-center text-teal-300 text-sm mt-6">
                Already a partner? <Link to="/cro/login" className="text-white hover:underline font-medium">Sign in here</Link>
              </p>
            </>
          )}
        </div>
      </section>

      {/* Footer Link */}
      <div className="text-center py-8 bg-gray-50">
        <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">Back to Credlocity Home</Link>
      </div>
    </div>
  );
}
