import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, User, AlertTriangle, Upload, CheckCircle, 
  ChevronRight, ChevronLeft, Save, Send, X, Plus, Trash2,
  Scale, Calendar, DollarSign, Info, Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import api from '../../utils/api';

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

// Step Components
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className={`flex flex-col items-center ${idx <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
            idx < currentStep ? 'bg-blue-600 border-blue-600 text-white' :
            idx === currentStep ? 'border-blue-600 text-blue-600 bg-white' :
            'border-gray-300 text-gray-400'
          }`}>
            {idx < currentStep ? <CheckCircle className="w-5 h-5" /> : idx + 1}
          </div>
          <span className="text-xs mt-1 hidden sm:block">{step}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`w-12 sm:w-24 h-1 mx-2 ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const CaseSubmissionWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const steps = ['Client Info', 'Case Details', 'Violations', 'Disputes', 'Documents', 'Review'];
  
  // Form State
  const [formData, setFormData] = useState({
    // Client Info
    client_first_name: '',
    client_last_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    client_city: '',
    client_state: '',
    client_zip: '',
    
    // Case Details
    case_title: '',
    case_type: 'credit_repair',
    case_description: '',
    estimated_value: '',
    
    // Violations
    violations: [],
    
    // Disputes
    disputes: [],
    
    // Documents
    documents: [],
    
    // Publishing
    publish_to_marketplace: false
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step 1: Client Information
  const ClientInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Client Information</h2>
        <p className="text-gray-500 text-sm">Enter the client&apos;s contact details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name *</label>
          <Input
            placeholder="John"
            value={formData.client_first_name}
            onChange={(e) => updateFormData('client_first_name', e.target.value)}
            data-testid="client-first-name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name *</label>
          <Input
            placeholder="Doe"
            value={formData.client_last_name}
            onChange={(e) => updateFormData('client_last_name', e.target.value)}
            data-testid="client-last-name"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={formData.client_email}
            onChange={(e) => updateFormData('client_email', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.client_phone}
            onChange={(e) => updateFormData('client_phone', e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Street Address</label>
        <Input
          placeholder="123 Main Street"
          value={formData.client_address}
          onChange={(e) => updateFormData('client_address', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">City</label>
          <Input
            placeholder="City"
            value={formData.client_city}
            onChange={(e) => updateFormData('client_city', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Input
            placeholder="CA"
            value={formData.client_state}
            onChange={(e) => updateFormData('client_state', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">ZIP</label>
          <Input
            placeholder="90210"
            value={formData.client_zip}
            onChange={(e) => updateFormData('client_zip', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Case Details
  const CaseDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Case Details</h2>
        <p className="text-gray-500 text-sm">Describe the case and its type</p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Case Title *</label>
        <Input
          placeholder="e.g., FCRA Violation - Multiple Inaccurate Accounts"
          value={formData.case_title}
          onChange={(e) => updateFormData('case_title', e.target.value)}
          data-testid="case-title"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Case Type *</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={formData.case_type}
          onChange={(e) => updateFormData('case_type', e.target.value)}
        >
          {CASE_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Case Description</label>
        <Textarea
          placeholder="Provide a detailed description of the case..."
          rows={5}
          value={formData.case_description}
          onChange={(e) => updateFormData('case_description', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Estimated Case Value ($)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="number"
            placeholder="5000"
            className="pl-10"
            value={formData.estimated_value}
            onChange={(e) => updateFormData('estimated_value', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">Estimated damages based on violations</p>
      </div>
    </div>
  );

  // Step 3: Violations
  const ViolationsStep = () => {
    const addViolation = () => {
      updateFormData('violations', [
        ...formData.violations,
        {
          id: Date.now(),
          violation_type: '',
          violation_description: '',
          severity: 'moderate',
          estimated_damages: '',
          violation_date: ''
        }
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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Violations</h2>
            <p className="text-gray-500 text-sm">Add specific legal violations for this case</p>
          </div>
          <Button onClick={addViolation} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Violation
          </Button>
        </div>
        
        {formData.violations.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No violations added yet</p>
              <Button onClick={addViolation} variant="outline" className="mt-4">
                Add First Violation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {formData.violations.map((violation, idx) => (
              <Card key={violation.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Violation #{idx + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeViolation(violation.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Violation Type *</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={violation.violation_type}
                        onChange={(e) => updateViolation(violation.id, 'violation_type', e.target.value)}
                      >
                        <option value="">Select violation type...</option>
                        {VIOLATION_TYPES.map(type => (
                          <option key={type.code} value={type.code}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Severity</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={violation.severity}
                        onChange={(e) => updateViolation(violation.id, 'severity', e.target.value)}
                      >
                        <option value="minor">Minor</option>
                        <option value="moderate">Moderate</option>
                        <option value="major">Major</option>
                        <option value="willful">Willful</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe this specific violation..."
                      value={violation.violation_description}
                      onChange={(e) => updateViolation(violation.id, 'violation_description', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estimated Damages ($)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={violation.estimated_damages}
                        onChange={(e) => updateViolation(violation.id, 'estimated_damages', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Violation Date</label>
                      <Input
                        type="date"
                        value={violation.violation_date}
                        onChange={(e) => updateViolation(violation.id, 'violation_date', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Step 4: Disputes
  const DisputesStep = () => {
    const addDispute = () => {
      updateFormData('disputes', [
        ...formData.disputes,
        {
          id: Date.now(),
          creditor_name: '',
          account_number: '',
          bureau: 'experian',
          disputed_amount: '',
          dispute_type: 'initial',
          dispute_reason: ''
        }
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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Credit Disputes</h2>
            <p className="text-gray-500 text-sm">Add credit report disputes for this case</p>
          </div>
          <Button onClick={addDispute} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Dispute
          </Button>
        </div>
        
        {formData.disputes.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No disputes added yet</p>
              <Button onClick={addDispute} variant="outline" className="mt-4">
                Add First Dispute
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {formData.disputes.map((dispute, idx) => (
              <Card key={dispute.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Dispute #{idx + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDispute(dispute.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Creditor Name *</label>
                      <Input
                        placeholder="e.g., Capital One"
                        value={dispute.creditor_name}
                        onChange={(e) => updateDispute(dispute.id, 'creditor_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Account Number (Last 4)</label>
                      <Input
                        placeholder="****1234"
                        value={dispute.account_number}
                        onChange={(e) => updateDispute(dispute.id, 'account_number', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Credit Bureau</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={dispute.bureau}
                        onChange={(e) => updateDispute(dispute.id, 'bureau', e.target.value)}
                      >
                        {BUREAUS.map(bureau => (
                          <option key={bureau.value} value={bureau.value}>{bureau.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dispute Type</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={dispute.dispute_type}
                        onChange={(e) => updateDispute(dispute.id, 'dispute_type', e.target.value)}
                      >
                        <option value="initial">Initial Dispute</option>
                        <option value="reinvestigation">Reinvestigation</option>
                        <option value="escalated">Escalated</option>
                        <option value="legal">Legal</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Disputed Amount</label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={dispute.disputed_amount}
                        onChange={(e) => updateDispute(dispute.id, 'disputed_amount', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dispute Reason</label>
                    <Textarea
                      placeholder="Explain why this item is being disputed..."
                      value={dispute.dispute_reason}
                      onChange={(e) => updateDispute(dispute.id, 'dispute_reason', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Step 5: Documents
  const DocumentsStep = () => {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setUploading(true);
      
      // For now, just add file metadata (actual upload would go to storage)
      const newDocs = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        document_type: 'evidence',
        uploaded_at: new Date().toISOString()
      }));
      
      updateFormData('documents', [...formData.documents, ...newDocs]);
      setUploading(false);
    };

    const removeDocument = (id) => {
      updateFormData('documents', formData.documents.filter(d => d.id !== id));
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          <p className="text-gray-500 text-sm">Upload supporting documents for this case</p>
        </div>
        
        {/* Upload Area */}
        <Card className="border-2 border-dashed">
          <CardContent className="p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Documents</p>
              <p className="text-gray-500 text-sm mb-4">
                Credit reports, dispute letters, correspondence, evidence
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={uploading}>
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Select Files'
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* Document List */}
        {formData.documents.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Uploaded Documents ({formData.documents.length})</h3>
            <div className="space-y-2">
              {formData.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={doc.document_type}
                      onChange={(e) => {
                        updateFormData('documents', formData.documents.map(d =>
                          d.id === doc.id ? { ...d, document_type: e.target.value } : d
                        ));
                      }}
                    >
                      <option value="credit_report">Credit Report</option>
                      <option value="dispute_letter">Dispute Letter</option>
                      <option value="response">Response</option>
                      <option value="evidence">Evidence</option>
                      <option value="identification">ID Document</option>
                      <option value="power_of_attorney">Power of Attorney</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Recommended Documents</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Credit reports from all 3 bureaus</li>
                <li>Dispute letters sent to bureaus/creditors</li>
                <li>Responses received</li>
                <li>Power of Attorney (if applicable)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 6: Review
  const ReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
        <p className="text-gray-500 text-sm">Review your case before submitting</p>
      </div>
      
      {/* Client Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{formData.client_first_name} {formData.client_last_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2">{formData.client_email || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <span className="ml-2">{formData.client_phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="ml-2">{formData.client_city}, {formData.client_state}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Case Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Case Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Title:</span>
              <span className="ml-2 font-medium">{formData.case_title}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <Badge className="ml-2">{formData.case_type}</Badge>
            </div>
            <div>
              <span className="text-gray-500">Estimated Value:</span>
              <span className="ml-2 font-medium text-green-600">${formData.estimated_value || '0'}</span>
            </div>
            {formData.case_description && (
              <div>
                <span className="text-gray-500">Description:</span>
                <p className="mt-1 text-gray-700">{formData.case_description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Violations & Disputes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Violations ({formData.violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.violations.length === 0 ? (
              <p className="text-gray-500 text-sm">No violations added</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {formData.violations.map((v, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{VIOLATION_TYPES.find(t => t.code === v.violation_type)?.name || v.violation_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Disputes ({formData.disputes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.disputes.length === 0 ? (
              <p className="text-gray-500 text-sm">No disputes added</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {formData.disputes.map((d, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{d.creditor_name} ({d.bureau})</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Documents Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Documents ({formData.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents uploaded</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.documents.map((d, idx) => (
                <Badge key={idx} variant="outline">{d.name}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Publish Option */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.publish_to_marketplace}
              onChange={(e) => updateFormData('publish_to_marketplace', e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div>
              <p className="font-medium">Publish to Attorney Marketplace</p>
              <p className="text-sm text-gray-600">Make this case available for attorneys to bid on</p>
            </div>
          </label>
        </CardContent>
      </Card>
    </div>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0: return <ClientInfoStep />;
      case 1: return <CaseDetailsStep />;
      case 2: return <ViolationsStep />;
      case 3: return <DisputesStep />;
      case 4: return <DocumentsStep />;
      case 5: return <ReviewStep />;
      default: return null;
    }
  };

  // Validation
  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.client_first_name || !formData.client_last_name) {
          setError('Client first and last name are required');
          return false;
        }
        break;
      case 1:
        if (!formData.case_title) {
          setError('Case title is required');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('company_token');
      
      const response = await api.post('/cases/create', {
        ...formData,
        violations: formData.violations.map(v => ({
          violation_type: v.violation_type,
          violation_description: v.violation_description,
          severity: v.severity,
          estimated_damages: parseFloat(v.estimated_damages) || 0,
          violation_date: v.violation_date
        })),
        disputes: formData.disputes.map(d => ({
          creditor_name: d.creditor_name,
          account_number: d.account_number,
          bureau: d.bureau,
          disputed_amount: parseFloat(d.disputed_amount) || 0,
          dispute_type: d.dispute_type,
          dispute_reason: d.dispute_reason
        }))
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // Navigate to success or case detail
      navigate('/company/cases', { state: { newCase: response.data } });
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Scale className="w-7 h-7 text-blue-600" />
            Submit New Case
          </CardTitle>
          <CardDescription>
            Complete all steps to submit your FCRA case to the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator currentStep={currentStep} steps={steps} />
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
          
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Case
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseSubmissionWizard;
