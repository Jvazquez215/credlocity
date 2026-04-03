import React, { useState, useCallback } from 'react';
import { Shield, FileText, ArrowRight, CheckCircle2, X, Scale, ExternalLink, ChevronDown, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
];

const FAQS = [
  {
    q: "Why do I need to sign a service agreement for a free trial?",
    a: "Under the Telemarketing Sales Rule (TSR), credit repair companies are legally prohibited from discussing your credit situation or providing any services over the phone until a written agreement is in place. This agreement protects you — it's a federal requirement designed to prevent scams. Without it, we literally cannot speak to you about your credit."
  },
  {
    q: "Will I be charged anything during the free trial?",
    a: "No. Your service agreement is set at $0.00 per month for 30 days. This free trial is for credit repair services only. You will not be charged any setup fees, enrollment fees, or advance fees — those practices are illegal under both the TSR and the Credit Repair Organizations Act (CROA). You only pay if you voluntarily decide to become a paying client after speaking with us."
  },
  {
    q: "What is the Telemarketing Sales Rule (TSR)?",
    a: "The TSR is a federal regulation enforced by the FTC that prohibits credit repair companies from charging fees before services are fully performed. It also means we cannot discuss your credit repair options with you over the phone unless a written service agreement exists. This is why becoming a conditional client is the only legal pathway for us to communicate with you."
  },
  {
    q: "What is the Credit Repair Organizations Act (CROA)?",
    a: "CROA is the primary federal law governing credit repair companies. It requires that all agreements be in writing, grants you a 3-day right to cancel without penalty, and prohibits companies from making false promises. Credlocity is 100% CROA-compliant — our agreement includes every protection the law requires."
  },
  {
    q: "Can I cancel at any time?",
    a: "Absolutely. Under CROA, you have a 3-day right to cancel any credit repair agreement without penalty. Beyond that, Credlocity allows cancellation at any time — there are no long-term contracts, no cancellation fees, and no hidden obligations. Your free trial is exactly that: free and non-binding."
  },
  {
    q: "What happens after I sign the agreement?",
    a: "If you chose 'Start Free Trial,' the next step is ordering your credit report ($49.95 through ScoreFusion) so our team can analyze your credit profile. If you chose 'Book a Free Consultation,' you'll be directed to schedule a call with our credit specialists. Either way, the agreement simply opens the legal door for us to help you."
  },
  {
    q: "What happens if I become a paying client?",
    a: "If you decide to become a paying client after your free trial or consultation, you will sign a new service agreement during onboarding that supersedes this free trial agreement. The new agreement will be the controlling document. This free trial agreement will have no further force or effect once the new agreement is signed."
  },
  {
    q: "Why can't Credlocity just talk to me without a signed agreement?",
    a: "Federal law (TSR §310.4(a)(2)) strictly prohibits credit repair companies from providing telemarketed services or even discussing your specific credit situation unless a written contract is in place. We take compliance seriously — it's what separates legitimate companies like Credlocity from scams. Signing this agreement is the only legal way we can begin helping you."
  },
];

/* ─── Step 1: Intro Popup ─── */
const IntroPopup = ({ leadType, onAgree, onClose }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" data-testid="lead-intro-popup">
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" data-testid="close-intro-popup">
        <X className="w-5 h-5" />
      </button>
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="font-cinzel text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {leadType === 'consultation' ? 'Book Your Free Consultation' : '30-Day Free Trial'}
        </h2>
        <p className="text-sm text-gray-600">No upfront charge. Cancel anytime.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">Federal Law Requires This Step</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Under the <strong>Telemarketing Sales Rule (TSR)</strong>, credit repair companies are legally prohibited from speaking with you about your credit until a written service agreement is in place. 
              Becoming a conditional client by signing a no-cost agreement is the <strong>only legal way</strong> we can communicate with you.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {[
          "Your agreement is $0.00/month for 30 days — this is a genuine free trial for credit repair only",
          "No setup fees, no enrollment fees, no hidden charges",
          "You can cancel at any time with no penalty",
          "This agreement simply allows us to legally discuss your credit with you",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">{item}</p>
          </div>
        ))}
      </div>

      <Button onClick={onAgree} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base" data-testid="agree-btn">
        I Agree — Continue to Service Agreement <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
      <p className="text-[10px] text-gray-400 text-center mt-3">
        By clicking "I Agree," you acknowledge that signing this service agreement is required under federal law (TSR) for us to speak with you. The agreement can be cancelled at any time.
      </p>
    </div>
  </div>
);

/* ─── Step 2: Full Scrollable Service Agreement + Form ─── */
const ServiceAgreement = ({ leadType, onComplete, onClose }) => {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '', state: '', zip_code: '', signed_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSubmit = async () => {
    const required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'signed_name'];
    const missing = required.filter(f => !form[f]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lead_type: leadType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Submission failed');
      }
      const data = await res.json();
      toast.success('Service agreement signed successfully!');
      onComplete(data);
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4" data-testid="lead-agreement-overlay">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-cinzel text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-blue" />
            Credlocity Service Agreement
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" data-testid="close-agreement">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Agreement Header */}
          <div className="bg-gray-50 rounded-xl p-5 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-cinzel text-lg font-bold text-primary-blue">CREDIT REPAIR SERVICE AGREEMENT</h3>
              <span className="text-xs text-gray-500">{today}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This Credit Repair Service Agreement ("Agreement") is entered into between <strong>Credlocity Business Group LLC</strong> ("Company"), 
              and the undersigned consumer ("Client"), effective as of the date of electronic signature below.
            </p>
          </div>

          {/* Agreement Sections — full scrollable document */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">1. SERVICES PROVIDED</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                The Company agrees to provide credit repair services including, but not limited to: review of consumer credit reports, identification of 
                potentially inaccurate, incomplete, unverifiable, or misleading information, preparation and submission of dispute correspondence to credit 
                bureaus (Equifax, Experian, TransUnion) and/or data furnishers, and ongoing monitoring of dispute results on Client's behalf.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <h4 className="font-semibold text-sm text-green-800 mb-2">2. FREE TRIAL TERMS — $0.00 PER MONTH FOR 30 DAYS (FREE TRIAL FOR CREDIT REPAIR ONLY)</h4>
              <p className="text-xs text-green-700 leading-relaxed">
                This agreement establishes a <strong>conditional client relationship at no cost ($0.00 per month for 30 days)</strong> during the trial period. 
                This free trial is for credit repair services only. 
                The Client will not be charged any fees — including setup fees, enrollment fees, advance fees, or first-work fees — until 
                such time as the Client voluntarily elects to become a paying client after consultation with the Company. 
                <strong> No payment is required, collected, or expected at any point during the free trial period.</strong>
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm text-blue-800 mb-2">3. TELEMARKETING SALES RULE (TSR) DISCLOSURE</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                The Client understands and acknowledges that under the <strong>Telemarketing Sales Rule (TSR), 16 CFR Part 310, §310.4(a)(2)</strong>, 
                it is unlawful for a credit repair company to request or receive payment for credit repair services sold via telemarketing 
                before such services are fully performed. Furthermore, the TSR prohibits credit repair companies from engaging in substantive 
                discussions about a consumer's credit repair needs via telephone without a written service agreement in place.
              </p>
              <p className="text-xs text-blue-700 leading-relaxed mt-2 font-semibold">
                By signing this agreement, the Client acknowledges that because of the Telemarketing Sales Rule, Credlocity cannot under 
                any circumstances discuss credit repair services with the Client over the phone without this signed agreement. This 
                agreement is the only legal mechanism by which the Company and Client may communicate about credit repair services.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
              <h4 className="font-semibold text-sm text-amber-800 mb-2">4. YOUR RIGHT TO CANCEL — CROA §1679e</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>YOU MAY CANCEL THIS CONTRACT WITHOUT PENALTY OR OBLIGATION AT ANY TIME BEFORE MIDNIGHT OF THE 3RD BUSINESS DAY 
                AFTER THE DATE ON WHICH YOU SIGNED THIS CONTRACT.</strong>
              </p>
              <p className="text-xs text-amber-700 leading-relaxed mt-2">
                If you cancel this contract, the Company will return to you any money you paid within five (5) business days of receiving 
                your cancellation notice. To cancel, send written notice to: Credlocity Business Group LLC, or email support@credlocity.com.
              </p>
              <p className="text-xs text-amber-700 leading-relaxed mt-2">
                Additionally, beyond the 3-day CROA cancellation period, Credlocity allows cancellation at any time with no penalty, 
                no cancellation fees, and no hidden obligations. This agreement is entirely non-binding beyond the free trial terms described herein.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">5. CROA CONSUMER RIGHTS DISCLOSURE — 15 U.S.C. §1679c</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                As required by the Credit Repair Organizations Act, you are informed of the following rights:
              </p>
              <ul className="text-xs text-gray-600 leading-relaxed mt-2 space-y-1 list-disc list-inside">
                <li>You have the right to dispute inaccurate information in your credit report by contacting the credit bureau directly.</li>
                <li>Nothing in this agreement prevents you from contacting or communicating directly with any credit bureau.</li>
                <li>You have the right to obtain a copy of your credit report from each credit bureau once every 12 months at no charge (AnnualCreditReport.com).</li>
                <li>No one can lawfully remove accurate, current, and verifiable information from your credit report.</li>
                <li>You have the right to sue a credit repair organization that violates the CROA.</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
              <h4 className="font-semibold text-sm text-purple-800 mb-2">6. SUPERSEDING AGREEMENT</h4>
              <p className="text-xs text-purple-700 leading-relaxed">
                The Client understands and agrees that upon electing to become a paying client, the Client will be required to sign a 
                new service agreement as part of the onboarding process. <strong>That new agreement shall supersede this agreement in its entirety, 
                and the terms of the new agreement shall be the controlling agreement between the Company and Client.</strong> This free trial 
                agreement shall have no further force or effect once the superseding agreement is executed.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">7. COMPANY INFORMATION</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Credlocity Business Group LLC</strong><br />
                Website: www.credlocity.com<br />
                Email: support@credlocity.com<br />
                Established: 2008 | BBB Rating: A+ | Zero Complaints
              </p>
            </div>
          </div>

          {/* Client Information Form */}
          <div className="border-t-2 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-blue" />
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="First Name *" value={form.first_name} onChange={e => update('first_name', e.target.value)} data-testid="lead-first-name" />
              <Input placeholder="Last Name *" value={form.last_name} onChange={e => update('last_name', e.target.value)} data-testid="lead-last-name" />
              <Input placeholder="Email *" type="email" value={form.email} onChange={e => update('email', e.target.value)} data-testid="lead-email" />
              <Input placeholder="Phone *" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} data-testid="lead-phone" />
              <Input placeholder="Street Address *" value={form.address} onChange={e => update('address', e.target.value)} className="md:col-span-2" data-testid="lead-address" />
              <Input placeholder="City *" value={form.city} onChange={e => update('city', e.target.value)} data-testid="lead-city" />
              <div className="grid grid-cols-2 gap-2">
                <select className="border rounded-md px-3 py-2 text-sm bg-white" value={form.state} onChange={e => update('state', e.target.value)} data-testid="lead-state">
                  <option value="">State *</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input placeholder="Zip *" value={form.zip_code} onChange={e => update('zip_code', e.target.value)} data-testid="lead-zip" />
              </div>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="border-t-2 pt-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-blue" />
              Electronic Signature
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              By typing your full name below, you are electronically signing this service agreement and acknowledging that you have read and agree to all terms above, including the TSR and CROA disclosures. Your IP address and the date and time of signing will be recorded.
            </p>
            <Input
              placeholder="Type your full legal name to sign *"
              value={form.signed_name}
              onChange={e => update('signed_name', e.target.value)}
              className="text-lg font-medium border-2 border-gray-300 focus:border-primary-blue h-12"
              data-testid="lead-signature"
            />
            <p className="text-[10px] text-gray-400 mt-1">Date of signature: {today}</p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.signed_name.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base"
            data-testid="submit-agreement-btn"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Processing...</>
            ) : (
              <>Sign Agreement & {leadType === 'consultation' ? 'Book Consultation' : 'Start Free Trial'} <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>

          {/* FAQs */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border rounded-lg overflow-hidden" data-testid={`lead-faq-${i}`}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 py-3 text-xs text-gray-600 leading-relaxed border-t bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Step 3: Post-Signing Screen ─── */
const PostSigningScreen = ({ leadType, leadData, onClose }) => {
  const downloadAgreement = () => {
    if (leadData?.id) {
      window.open(`${API}/api/leads/${leadData.id}/agreement-pdf`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" data-testid="lead-post-signing">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" data-testid="close-post-signing">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-2">Agreement Signed Successfully</h2>
          <p className="text-sm text-gray-600">
            Welcome to Credlocity! You're now a conditional client.
          </p>
        </div>

        {/* Download Agreement Button */}
        <button
          onClick={downloadAgreement}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
          data-testid="download-agreement-btn"
        >
          <Download className="w-4 h-4" />
          Download Your Signed Agreement (PDF)
        </button>

        {leadType === 'free_trial' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <h3 className="font-semibold text-blue-800 mb-2">Next Step: Order Your Credit Report</h3>
              <p className="text-sm text-blue-700 mb-4">
                To understand your credit situation and begin your free trial, the next step is ordering your credit report through ScoreFusion. The cost is <strong>$49.95</strong> for a comprehensive 3-bureau report.
              </p>
              <a
                href="https://credlocity.scorexer.com/scorefusion/scorefusion-signup.jsp?code=50a153cc-c"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary-blue hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors"
                data-testid="order-credit-report-btn"
              >
                <ExternalLink className="w-4 h-4" />
                Order Credit Report — $49.95
              </a>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              Your credit report will be securely shared with Credlocity for analysis. This allows us to identify disputable items and build your personalized credit repair strategy.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <h3 className="font-semibold text-green-800 mb-2">Next Step: Schedule Your Consultation</h3>
              <p className="text-sm text-green-700 mb-4">
                Now that your agreement is in place, let's schedule your free one-on-one consultation with a Credlocity credit specialist.
              </p>
              <a
                href="https://calendly.com/credlocity/oneonone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-3 transition-colors"
                data-testid="schedule-consultation-btn"
              >
                <ExternalLink className="w-4 h-4" />
                Schedule Free Consultation
              </a>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              You'll be taken to our Calendly scheduling page to pick a time that works best for you.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 py-2"
          data-testid="close-post-signing-secondary"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ─── Main Controller ─── */
const LeadCaptureFlow = ({ isOpen, onClose, leadType = 'free_trial' }) => {
  const [step, setStep] = useState('intro');
  const [leadData, setLeadData] = useState(null);

  const handleClose = useCallback(() => {
    setStep('intro');
    setLeadData(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  if (step === 'intro') {
    return <IntroPopup leadType={leadType} onAgree={() => setStep('agreement')} onClose={handleClose} />;
  }

  if (step === 'agreement') {
    return <ServiceAgreement leadType={leadType} onComplete={(data) => { setLeadData(data); setStep('complete'); }} onClose={handleClose} />;
  }

  if (step === 'complete') {
    return <PostSigningScreen leadType={leadType} leadData={leadData} onClose={handleClose} />;
  }

  return null;
};

export default LeadCaptureFlow;
