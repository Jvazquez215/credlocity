import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, User, AlertTriangle, Upload, CheckCircle, 
  ChevronRight, ChevronLeft, Save, Send, X, Plus, Trash2,
  Scale, DollarSign, Info, Loader2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import api from '../../../utils/api';

// Violation Types
const VIOLATION_TYPES = [
  { code: 'fcra_1681e', name: 'FCRA §1681e - Accuracy of Reports', category: 'FCRA' },
  { code: 'fcra_1681i', name: 'FCRA §1681i - Reinvestigation', category: 'FCRA' },
  { code: 'fcra_1681s2', name: 'FCRA §1681s-2 - Furnisher Duties', category: 'FCRA' },
  { code: 'fdcpa_1692e', name: 'FDCPA §1692e - False Representations', category: 'FDCPA' },
  { code: 'fdcpa_1692f', name: 'FDCPA §1692f - Unfair Practices', category: 'FDCPA' },
  { code: 'fdcpa_1692g', name: 'FDCPA §1692g - Validation', category: 'FDCPA' },
  { code: 'tcpa', name: 'TCPA Violations', category: 'TCPA' },
  { code: 'other', name: 'Other Violation', category: 'Other' }
];

const CASE_TYPES = [
  { value: 'credit_repair', label: 'Credit Repair' },
  { value: 'debt_collection', label: 'Debt Collection Defense' },
  { value: 'fcra_violation', label: 'FCRA Violation' },
  { value: 'fdcpa_violation', label: 'FDCPA Violation' }
];

const BUREAUS = [
  { value: 'experian', label: 'Experian' },
  { value: 'equifax', label: 'Equifax' },
  { value: 'transunion', label: 'TransUnion' }
];

const AdminCaseSubmission = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  
  const steps = ['Client', 'Case', 'Violations', 'Disputes', 'Review'];
  
  const [formData, setFormData] = useState({
    client_first_name: '',
    client_last_name: '',
    client_email: '',
    client_phone: '',
    client_state: '',
    case_title: '',
    case_type: 'credit_repair',
    case_description: '',
    estimated_value: '',
    violations: [],
    disputes: [],
    publish_to_marketplace: true
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add/Update/Remove violations
  const addViolation = () => {
    updateFormData('violations', [
      ...formData.violations,
      { id: Date.now(), violation_type: '', violation_description: '', severity: 'moderate', estimated_damages: '' }
    ]);
  };

  const updateViolation = (id, field, value) => {
    updateFormData('violations', formData.violations.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const removeViolation = (id) => {
    updateFormData('violations', formData.violations.filter(v => v.id !== id));
  };

  // Add/Update/Remove disputes
  const addDispute = () => {
    updateFormData('disputes', [
      ...formData.disputes,
      { id: Date.now(), creditor_name: '', account_number: '', bureau: 'experian', disputed_amount: '', dispute_reason: '' }
    ]);
  };

  const updateDispute = (id, field, value) => {
    updateFormData('disputes', formData.disputes.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const removeDispute = (id) => {
    updateFormData('disputes', formData.disputes.filter(d => d.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.client_first_name || !formData.client_last_name || !formData.case_title) {
      setError('Please fill in required fields: Client name and case title');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await api.post('/cases/create', {
        ...formData,
        company_name: 'Credlocity',
        violations: formData.violations.map(v => ({
          violation_type: v.violation_type,
          violation_description: v.violation_description,
          severity: v.severity,
          estimated_damages: parseFloat(v.estimated_damages) || 0
        })),
        disputes: formData.disputes.map(d => ({
          creditor_name: d.creditor_name,
          account_number: d.account_number,
          bureau: d.bureau,
          disputed_amount: parseFloat(d.disputed_amount) || 0,
          dispute_reason: d.dispute_reason
        }))
      });
      
      setSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit case');
    } finally {
      setSubmitting(false);
    }
  };

  // Step components
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Client
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={formData.client_first_name}
                  onChange={(e) => updateFormData('client_first_name', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={formData.client_last_name}
                  onChange={(e) => updateFormData('client_last_name', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => updateFormData('client_email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => updateFormData('client_phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Input
                value={formData.client_state}
                onChange={(e) => updateFormData('client_state', e.target.value)}
                placeholder="California"
              />
            </div>
          </div>
        );
      
      case 1: // Case
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Title *</label>
              <Input
                value={formData.case_title}
                onChange={(e) => updateFormData('case_title', e.target.value)}
                placeholder="FCRA Violation - Multiple Inaccurate Accounts"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Type</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.case_type}
                onChange={(e) => updateFormData('case_type', e.target.value)}
              >
                {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.case_description}
                onChange={(e) => updateFormData('case_description', e.target.value)}
                placeholder="Describe the case..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Value ($)</label>
              <Input
                type="number"
                value={formData.estimated_value}
                onChange={(e) => updateFormData('estimated_value', e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>
        );
      
      case 2: // Violations
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Violations ({formData.violations.length})</h3>
              <Button onClick={addViolation} size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
            {formData.violations.length === 0 && (
              <div className="text-center py-8 text-gray-500">No violations added</div>
            )}
            {formData.violations.map((v, idx) => (
              <Card key={v.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Violation #{idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeViolation(v.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select className="border rounded px-2 py-1.5 text-sm" value={v.violation_type} onChange={(e) => updateViolation(v.id, 'violation_type', e.target.value)}>
                      <option value="">Select type...</option>
                      {VIOLATION_TYPES.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
                    </select>
                    <select className="border rounded px-2 py-1.5 text-sm" value={v.severity} onChange={(e) => updateViolation(v.id, 'severity', e.target.value)}>
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                      <option value="willful">Willful</option>
                    </select>
                  </div>
                  <Input placeholder="Damages ($)" type="number" value={v.estimated_damages} onChange={(e) => updateViolation(v.id, 'estimated_damages', e.target.value)} />
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 3: // Disputes
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Disputes ({formData.disputes.length})</h3>
              <Button onClick={addDispute} size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
            {formData.disputes.length === 0 && (
              <div className="text-center py-8 text-gray-500">No disputes added</div>
            )}
            {formData.disputes.map((d, idx) => (
              <Card key={d.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Dispute #{idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeDispute(d.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Creditor Name" value={d.creditor_name} onChange={(e) => updateDispute(d.id, 'creditor_name', e.target.value)} />
                    <select className="border rounded px-2 py-1.5 text-sm" value={d.bureau} onChange={(e) => updateDispute(d.id, 'bureau', e.target.value)}>
                      {BUREAUS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <Input placeholder="Amount ($)" type="number" value={d.disputed_amount} onChange={(e) => updateDispute(d.id, 'disputed_amount', e.target.value)} />
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 4: // Review
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-gray-500">Client:</span> {formData.client_first_name} {formData.client_last_name}</div>
                <div><span className="text-gray-500">Case:</span> {formData.case_title}</div>
                <div><span className="text-gray-500">Type:</span> <Badge>{formData.case_type}</Badge></div>
                <div><span className="text-gray-500">Value:</span> ${formData.estimated_value || 0}</div>
                <div><span className="text-gray-500">Violations:</span> {formData.violations.length}</div>
                <div><span className="text-gray-500">Disputes:</span> {formData.disputes.length}</div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" checked={formData.publish_to_marketplace} onChange={(e) => updateFormData('publish_to_marketplace', e.target.checked)} />
              <span className="text-sm">Publish to Attorney Marketplace</span>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Case Submitted!</h2>
          <p className="text-gray-500 mb-4">Case #{success.case_number} has been created successfully.</p>
          <div className="space-x-3">
            <Button onClick={() => navigate('/admin/cases')}>View All Cases</Button>
            <Button variant="outline" onClick={() => { setSuccess(null); setFormData({...formData, client_first_name: '', client_last_name: '', case_title: '', violations: [], disputes: []}); setCurrentStep(0); }}>Submit Another</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Submit New Case (Admin)
          </CardTitle>
          <CardDescription>Create a case on behalf of Credlocity</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  idx < currentStep ? 'bg-blue-600 text-white' :
                  idx === currentStep ? 'border-2 border-blue-600 text-blue-600' :
                  'border-2 border-gray-300 text-gray-400'
                }`}>
                  {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && <div className={`w-12 h-1 mx-1 ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}

          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-1" />Submit Case</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCaseSubmission;
