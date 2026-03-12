import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, FileText, CheckCircle, Scale, Shield, Users, 
  AlertCircle, ExternalLink, Clock, Send
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AttorneyAgreementModal({ isOpen, onClose, onAccept, token }) {
  const [loading, setLoading] = useState(false);
  const [agreementText, setAgreementText] = useState('');
  const [documents, setDocuments] = useState(null);
  const [step, setStep] = useState(1); // 1: review, 2: accept
  const [acceptances, setAcceptances] = useState({
    terms_of_service: false,
    privacy_policy: false,
    diversity_inclusion_policy: false,
    affiliate_terms: false,
    right_to_update_acknowledgment: false
  });
  const [signatureName, setSignatureName] = useState('');
  const [requestCopy, setRequestCopy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAgreementData();
    }
  }, [isOpen]);

  const fetchAgreementData = async () => {
    try {
      const [textRes, docsRes] = await Promise.all([
        fetch(`${API_URL}/api/attorney-agreement/full-text`),
        fetch(`${API_URL}/api/attorney-agreement/documents`)
      ]);

      if (textRes.ok) {
        const textData = await textRes.json();
        setAgreementText(textData.agreement_text);
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData);
      }
    } catch (err) {
      console.error('Error fetching agreement:', err);
    }
  };

  const handleAcceptanceChange = (key) => {
    setAcceptances(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allAccepted = Object.values(acceptances).every(v => v);

  const handleSubmit = async () => {
    if (!allAccepted) {
      setError('Please accept all required agreements');
      return;
    }

    if (!signatureName.trim()) {
      setError('Please enter your signature name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/attorney-agreement/accept?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...acceptances,
          signature_name: signatureName,
          signature_date: new Date().toISOString(),
          request_copy_email: requestCopy
        })
      });

      if (response.ok) {
        onAccept();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to submit agreement');
      }
    } catch (err) {
      setError('Failed to submit agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Attorney Network Agreement</h2>
                <p className="text-blue-200 text-sm">Please review and accept to continue</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span className="text-sm">Step {step} of 2</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Agreement Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Attorney Network Participation Agreement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {agreementText}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Related Documents */}
              {documents && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Related Policy Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      By accepting this agreement, you also agree to the following policies. 
                      Please review each document before proceeding.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(documents).map(([key, doc]) => (
                        <a
                          key={key}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Important Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Credlocity reserves the right to update these terms and policies as necessary. 
                      You will be notified of any material changes via email or through our platform. 
                      You may request copies of all documents to be sent to your registered email at any time.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue to Accept Agreement
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Acceptance Checkboxes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Agreement Acceptance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'terms_of_service', label: 'I have read and agree to the Terms of Service' },
                    { key: 'privacy_policy', label: 'I have read and agree to the Privacy Policy' },
                    { key: 'diversity_inclusion_policy', label: 'I have read and agree to the Diversity and Inclusion Policy' },
                    { key: 'affiliate_terms', label: 'I have read and agree to the Affiliate Terms and Services' },
                    { key: 'right_to_update_acknowledgment', label: 'I acknowledge that Credlocity has the right to update these terms as necessary and will notify me of material changes' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptances[key]}
                        onChange={() => handleAcceptanceChange(key)}
                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Signature */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Electronic Signature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type your full legal name to sign *
                    </label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="e.g., John Michael Smith"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signature Date
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      disabled
                      className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  {/* Request Copy */}
                  <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={requestCopy}
                      onChange={() => setRequestCopy(!requestCopy)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Send me copies of all agreement documents
                      </span>
                      <p className="text-xs text-gray-500">
                        We'll email copies to your registered email address
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>

              {/* E-SIGN Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">E-SIGN Act Notice</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      By typing your name and clicking "Accept Agreement", you are signing this agreement electronically. 
                      You agree that your electronic signature is the legal equivalent of your manual signature.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back to Review
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!allAccepted || !signatureName.trim() || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Agreement
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
