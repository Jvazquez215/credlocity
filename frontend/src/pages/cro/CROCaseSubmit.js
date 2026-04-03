import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const VIOLATION_TYPES = [
  'FCRA - Failure to Investigate',
  'FCRA - Failure to Remove Inaccurate Info',
  'FCRA - Failure to Respond in 30 Days',
  'FCRA - Reinsertion of Disputed Info',
  'FDCPA - Harassment',
  'FDCPA - False Representation',
  'FDCPA - Unfair Practices',
  'TCPA - Robocalls',
  'TCPA - Text Messages',
  'FCBA - Billing Error',
  'Other'
];

const BUREAUS = ['Equifax', 'Experian', 'TransUnion', 'All Three'];

export default function CROCaseSubmit({ token }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    client_name: '', client_email: '', client_phone: '', client_state: '',
    dispute_date: '', mail_method: 'regular', usps_tracking: '',
    violation_type: '', violation_count: 1, violation_details: '',
    bureau: '', bureau_responses_received: 0,
    documentation_quality: 'standard', case_summary: '',
    class_action: false, class_action_consumers: 0,
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/cro/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.case);
        toast.success('Case submitted successfully!');
      } else {
        toast.error(data.detail || 'Failed to submit case');
      }
    } catch {
      toast.error('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto" data-testid="case-submit-success">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Case Submitted!</h2>
            <p className="text-gray-600 mb-2">Case Number: <span className="font-mono font-bold">{success.case_number}</span></p>
            <p className="text-gray-500 mb-1">Estimated Value: <span className="font-bold text-green-600">${success.estimated_value?.toLocaleString()}</span></p>
            {success.qualifies_bidding && (
              <p className="text-purple-600 font-medium mt-2">This case qualifies for competitive bidding!</p>
            )}
            <p className="text-gray-500 mt-4 text-sm">Your case will be reviewed by our team within 24-48 hours.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Button onClick={() => { setSuccess(null); setForm({ client_name: '', client_email: '', client_phone: '', client_state: '', dispute_date: '', mail_method: 'regular', usps_tracking: '', violation_type: '', violation_count: 1, violation_details: '', bureau: '', bureau_responses_received: 0, documentation_quality: 'standard', case_summary: '', class_action: false, class_action_consumers: 0 }); }} variant="outline">
                Submit Another Case
              </Button>
              <Button onClick={() => navigate('/cro/cases')} className="bg-teal-600 hover:bg-teal-700">
                View Case Tracker
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="cro-case-submit">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-6 h-6 text-teal-600" /> Submit New Case</h1>
        <p className="text-gray-500 mt-1">Submit a client case to the Credlocity Attorney Marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Client Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Client Name *</label>
                <Input value={form.client_name} onChange={e => updateField('client_name', e.target.value)} placeholder="Full legal name" required data-testid="case-client-name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Client State *</label>
                <select value={form.client_state} onChange={e => updateField('client_state', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required data-testid="case-client-state">
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Client Email</label>
                <Input type="email" value={form.client_email} onChange={e => updateField('client_email', e.target.value)} placeholder="client@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Client Phone</label>
                <Input value={form.client_phone} onChange={e => updateField('client_phone', e.target.value)} placeholder="(555) 123-4567" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Details */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Dispute Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Dispute Date *</label>
                <Input type="date" value={form.dispute_date} onChange={e => updateField('dispute_date', e.target.value)} required data-testid="case-dispute-date" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mail Method *</label>
                <select value={form.mail_method} onChange={e => updateField('mail_method', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" data-testid="case-mail-method">
                  <option value="regular">Regular Mail</option>
                  <option value="certified">Certified Mail</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">USPS Tracking #</label>
                <Input value={form.usps_tracking} onChange={e => updateField('usps_tracking', e.target.value)} placeholder="Tracking number" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Credit Bureau *</label>
                <select value={form.bureau} onChange={e => updateField('bureau', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required data-testid="case-bureau">
                  <option value="">Select bureau</option>
                  {BUREAUS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violation Info */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Violation Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Violation Type *</label>
                <select value={form.violation_type} onChange={e => updateField('violation_type', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required data-testid="case-violation-type">
                  <option value="">Select violation</option>
                  {VIOLATION_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Violations *</label>
                <Input type="number" min="1" value={form.violation_count} onChange={e => updateField('violation_count', parseInt(e.target.value) || 1)} data-testid="case-violation-count" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bureau Responses Received</label>
                <Input type="number" min="0" value={form.bureau_responses_received} onChange={e => updateField('bureau_responses_received', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Documentation Quality</label>
                <select value={form.documentation_quality} onChange={e => updateField('documentation_quality', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="standard">Standard</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Violation Details</label>
              <textarea value={form.violation_details} onChange={e => updateField('violation_details', e.target.value)} placeholder="Describe the violations in detail..." className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Class Action */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Class Action (Optional)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.class_action} onChange={e => updateField('class_action', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">This case involves a potential class action</span>
            </label>
            {form.class_action && (
              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Number of Affected Consumers</label>
                <Input type="number" min="0" value={form.class_action_consumers} onChange={e => updateField('class_action_consumers', parseInt(e.target.value) || 0)} />
                <p className="text-xs text-gray-500 mt-1">Cases with 50+ affected consumers qualify for extended bidding window (21 days)</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Summary */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Case Summary</CardTitle></CardHeader>
          <CardContent>
            <textarea value={form.case_summary} onChange={e => updateField('case_summary', e.target.value)} placeholder="Provide a summary of the case for reviewing attorneys..." className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="case-summary" />
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important</p>
            <p>Cases are reviewed within 24-48 hours. Once approved, they will be listed in the Attorney Marketplace. You will receive 80% of all attorney pledge fees and bid payments.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8" disabled={submitting} data-testid="case-submit-btn">
            {submitting ? 'Submitting...' : 'Submit Case'}
          </Button>
        </div>
      </form>
    </div>
  );
}
