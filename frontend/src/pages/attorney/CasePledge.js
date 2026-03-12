import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Gavel, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Signature,
  RefreshCw,
  DollarSign,
  MapPin,
  Scale
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Agreement Document Component
const AgreementDocument = ({ caseItem, attorneyName }) => {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const feeBreakdown = caseItem?.fee_breakdown || {};

  return (
    <div className="bg-white border rounded-lg p-8 max-h-[60vh] overflow-y-auto text-sm">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold">ATTORNEY REFERRAL AGREEMENT</h1>
        <p className="text-gray-500 mt-2">Agreement ID: AGR-{caseItem?.case_id}-{Date.now()}</p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-4">
            <strong>Between:</strong><br />
            CREDLOCITY BUSINESS GROUP LLC<br />
            ("Credlocity")
          </p>
          <p>
            <strong>AND</strong>
          </p>
          <p className="mt-4">
            <strong>{attorneyName || '[ATTORNEY NAME]'}</strong><br />
            ("Attorney")
          </p>
          <p className="mt-4">
            <strong>Agreement Date:</strong> {today}
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-bold mb-3">1. CASE DESCRIPTION</h2>
          <p className="mb-4">
            WHEREAS, Credlocity has referred to Attorney the following legal matter:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Case ID:</span>
                <span className="ml-2 font-medium">{caseItem?.case_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Title:</span>
                <span className="ml-2 font-medium">{caseItem?.title}</span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="ml-2 font-medium">{caseItem?.client_display?.name || caseItem?.client_name_display}</span>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 font-medium">{caseItem?.client_display?.location || caseItem?.client_location_display}</span>
              </div>
              <div>
                <span className="text-gray-500">Case Type:</span>
                <span className="ml-2 font-medium">{caseItem?.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Estimated Value:</span>
                <span className="ml-2 font-medium text-green-600">{formatCurrency(caseItem?.estimated_value)}</span>
              </div>
              <div>
                <span className="text-gray-500">Jurisdiction:</span>
                <span className="ml-2 font-medium">{caseItem?.jurisdiction}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-bold mb-3">2. FEE STRUCTURE</h2>
          <p className="mb-4">
            Attorney agrees to pay Credlocity the following referral fees:
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>a. Initial Referral Fee:</span>
                <span className="font-medium">{formatCurrency(feeBreakdown.initial_fee || 500)}</span>
              </div>
              <p className="text-gray-600 text-xs pl-4">
                Due upon client execution of retainer agreement.
              </p>
              <div className="flex justify-between mt-4">
                <span>b. Success Fee:</span>
                <span className="font-medium">{((feeBreakdown.total_rate || 0) * 100).toFixed(1)}% of settlement</span>
              </div>
              <p className="text-gray-600 text-xs pl-4">
                Commission Tier: {feeBreakdown.tier_description || 'Standard rate'}
              </p>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Estimated Total Due (if settled at estimated value):</span>
                <span>{formatCurrency(feeBreakdown.total_due)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-bold mb-3">3. PAYMENT TERMS</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Initial Referral Fee shall be paid within 24 hours of client's execution of retainer agreement via the Credlocity platform.</li>
            <li>Success Fee shall be paid within 5 business days of case settlement or judgment from settlement proceeds.</li>
            <li>All payments shall be made via ACH transfer or as otherwise directed by Credlocity.</li>
          </ul>
        </div>

        {caseItem?.settlement_requirements?.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="font-bold mb-3">4. SETTLEMENT REQUIREMENTS</h2>
            <p className="mb-4">
              Attorney acknowledges the following settlement conditions must be satisfied:
            </p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <ul className="space-y-3">
                {caseItem.settlement_requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      req.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.required ? 'REQUIRED' : 'OPTIONAL'}
                    </span>
                    <span>{req.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <h2 className="font-bold mb-3">5. ATTORNEY OBLIGATIONS</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attorney shall provide competent and diligent representation to the Client in accordance with applicable Rules of Professional Conduct.</li>
            <li>Attorney shall maintain all required malpractice insurance throughout the duration of representation.</li>
            <li>Attorney shall keep Credlocity reasonably informed of case status and material developments.</li>
            <li>Attorney shall obtain client consent for all settlement decisions in accordance with ethical obligations.</li>
            <li>Attorney shall submit status updates every 30 days via the Credlocity platform.</li>
          </ul>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-bold mb-3">6. GOVERNING LAW</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of laws principles.
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-bold mb-3">7. BINDING ARBITRATION</h2>
          <p>
            Any dispute arising out of or relating to this Agreement shall be resolved by binding arbitration in Philadelphia, Pennsylvania in accordance with the rules of the American Arbitration Association.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function CasePledge() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreements, setAgreements] = useState({
    read: false,
    binding: false,
    terms: false
  });
  const [attorney, setAttorney] = useState(null);

  const getToken = () => localStorage.getItem('attorney_token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }
    fetchCase();
    fetchAttorneyInfo();
  }, [caseId]);

  const fetchCase = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCaseItem(data);
      } else {
        navigate('/attorney/marketplace');
      }
    } catch (err) {
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttorneyInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/dashboard`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttorney(data.attorney);
      }
    } catch (err) {
      console.error('Error fetching attorney info:', err);
    }
  };

  const handlePledge = async () => {
    if (!agreements.read || !agreements.binding || !agreements.terms) {
      alert('Please accept all agreement terms');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/cases/${caseId}/pledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agreement_accepted: true,
          ip_address: '' // Would be captured server-side in production
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Case pledged successfully!\n\nAgreement ID: ${data.agreement_id}\n\nNext Step: ${data.next_step}`);
        navigate('/attorney/cases');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to pledge case');
      }
    } catch (err) {
      console.error('Error pledging case:', err);
      alert('Failed to pledge case');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p>Case not found</p>
            <Link to="/attorney/marketplace">
              <Button className="mt-4">Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canPledge = agreements.read && agreements.binding && agreements.terms;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/attorney/marketplace" className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Gavel className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>{caseItem.title}</CardTitle>
                    <CardDescription>{caseItem.case_id} • {caseItem.type}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{caseItem.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm text-gray-500">Estimated Value</div>
                      <div className="font-bold text-green-600">{formatCurrency(caseItem.estimated_value)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium">{caseItem.client_display?.location || caseItem.client_location_display}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm text-gray-500">Jurisdiction</div>
                      <div className="font-medium">{caseItem.jurisdiction}</div>
                    </div>
                  </div>
                </div>

                {/* Settlement Requirements */}
                {caseItem.settlement_requirements?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 text-amber-700 mb-3">
                      <AlertTriangle className="w-5 h-5" />
                      Required Settlement Conditions
                    </h4>
                    <ul className="space-y-2">
                      {caseItem.settlement_requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className={`w-4 h-4 mt-0.5 ${req.required ? 'text-red-500' : 'text-gray-400'}`} />
                          <span>{req.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Structure with Clear Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settlement Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Estimated Settlement */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between font-medium">
                    <span>Estimated Settlement</span>
                    <span>{formatCurrency(caseItem.estimated_value)}</span>
                  </div>
                </div>

                {/* Client Gets */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-green-800">Client Receives</span>
                      <p className="text-xs text-green-600">~67% after attorney fees</p>
                    </div>
                    <span className="font-bold text-green-700">
                      {formatCurrency(caseItem.estimated_value * 0.67)}
                    </span>
                  </div>
                </div>
                
                {/* Attorney Gets */}
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-purple-800">Your Earnings</span>
                      <p className="text-xs text-purple-600">After Credlocity fees</p>
                    </div>
                    <span className="font-bold text-purple-700">
                      {formatCurrency(
                        (caseItem.estimated_value * 0.33) - 
                        (caseItem.fee_breakdown?.total_due || 0)
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Credlocity Gets */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-blue-800">Credlocity Receives</span>
                      <p className="text-xs text-blue-600">
                        ${caseItem.fee_breakdown?.initial_fee || 500} + {((caseItem.fee_breakdown?.total_rate || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(caseItem.fee_breakdown?.total_due)}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 italic text-center pt-2">
                  *Based on typical 33% contingency fee arrangement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pledge Action */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Pledge This Case
                </CardTitle>
                <CardDescription>
                  Review and accept the referral agreement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAgreement(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Agreement
                </Button>

                <div className="border-t pt-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.read}
                      onChange={(e) => setAgreements({ ...agreements, read: e.target.checked })}
                      className="mt-1 rounded"
                    />
                    <span className="text-sm">
                      I have read and understand the full Attorney Referral Agreement.
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.binding}
                      onChange={(e) => setAgreements({ ...agreements, binding: e.target.checked })}
                      className="mt-1 rounded"
                    />
                    <span className="text-sm">
                      I understand this is a legally binding contract with Credlocity Business Group LLC.
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.terms}
                      onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
                      className="mt-1 rounded"
                    />
                    <span className="text-sm">
                      I agree to pay the initial referral fee and commission as specified.
                    </span>
                  </label>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                  <Signature className="w-4 h-4 inline mr-2" />
                  By clicking "Accept & Pledge", you are providing your electronic signature in accordance with the E-SIGN Act.
                </div>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!canPledge || submitting}
                  onClick={handlePledge}
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Accept Agreement & Pledge Case
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Full Agreement Modal */}
      <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Attorney Referral Agreement
            </DialogTitle>
          </DialogHeader>
          
          <AgreementDocument caseItem={caseItem} attorneyName={attorney?.name} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgreement(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setAgreements({ read: true, binding: true, terms: true });
              setShowAgreement(false);
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              I Accept These Terms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
