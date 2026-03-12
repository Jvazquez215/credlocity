import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Clock, CheckCircle, AlertTriangle, 
  DollarSign, FileText, RefreshCw, User, MapPin, Phone, Mail,
  Calendar, Scale, Send, History, Edit, MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pledged': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'settled': return 'bg-green-100 text-green-800 border-green-300';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function AttorneyCaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [updateHistory, setUpdateHistory] = useState([]);

  const getToken = () => localStorage.getItem('attorney_token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }
    fetchCaseData();
    fetchStatusOptions();
  }, [caseId]);

  const fetchCaseData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/case/${caseId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCaseData(data.case);
        setUpdateHistory(data.updates || []);
      } else if (response.status === 404) {
        navigate('/attorney/cases');
      }
    } catch (err) {
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/case-updates/status-options`);
      if (response.ok) {
        const data = await response.json();
        setStatusOptions(data);
      }
    } catch (err) {
      console.error('Error fetching status options:', err);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.status || !updateForm.notes.trim()) {
      alert('Please select a status and provide notes');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/case-updates/attorney/cases/${caseId}/update?token=${getToken()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateForm)
        }
      );

      if (response.ok) {
        setShowUpdateModal(false);
        setUpdateForm({ status: '', notes: '' });
        fetchCaseData(); // Refresh data
        alert('Status update submitted successfully!');
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to submit update');
      }
    } catch (err) {
      alert('Failed to submit update. Please try again.');
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

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Case Not Found</h2>
            <p className="text-gray-500 mb-4">This case may not exist or you don't have access to it.</p>
            <Link to="/attorney/cases">
              <Button>Back to My Cases</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/attorney/cases" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">{caseData.case_id}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(caseData.status)}`}>
                    {caseData.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{caseData.type}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowUpdateModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">{caseData.title}</h2>
                <p className="text-gray-600 mb-6">{caseData.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Case Type</p>
                        <p className="font-medium">{caseData.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Jurisdiction</p>
                        <p className="font-medium">{caseData.jurisdiction || `${caseData.client_city}, ${caseData.client_state}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Pledged Date</p>
                        <p className="font-medium">
                          {caseData.pledged_at ? new Date(caseData.pledged_at).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Estimated Value</p>
                        <p className="font-medium text-green-600">{formatCurrency(caseData.estimated_value)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Practice Areas</p>
                        <p className="font-medium">
                          {caseData.practice_areas?.join(', ') || caseData.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Client Name</p>
                      <p className="font-medium">{caseData.client_first_name} {caseData.client_last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{caseData.client_city}, {caseData.client_state}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{caseData.client_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{caseData.client_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-green-600" />
                  Case Update History
                </CardTitle>
                <CardDescription>
                  Status updates you've submitted for this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updateHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No updates submitted yet</p>
                    <p className="text-sm mt-1">Click "Update Status" to add your first update</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {updateHistory.map((update, index) => (
                      <div key={update.id || index} className="border-l-4 border-purple-400 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-purple-700">{update.status}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{update.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fee Breakdown - Clear Distribution */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Settlement Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Estimated Settlement */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-semibold text-gray-700">Estimated Settlement</span>
                  <span className="text-xl font-bold">{formatCurrency(caseData.estimated_value)}</span>
                </div>
                
                {/* Distribution Breakdown */}
                <div className="space-y-3">
                  {/* Client Gets */}
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-green-800">Client Receives</span>
                        <p className="text-xs text-green-600">After attorney's contingency fee</p>
                      </div>
                      <span className="text-lg font-bold text-green-700">
                        {formatCurrency((caseData.estimated_value || 0) * 0.67)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ~67% of settlement (typical contingency arrangement)
                    </p>
                  </div>

                  {/* Attorney Gets */}
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-purple-800">Your Earnings (Attorney)</span>
                        <p className="text-xs text-purple-600">After Credlocity fees</p>
                      </div>
                      <span className="text-lg font-bold text-purple-700">
                        {formatCurrency(
                          ((caseData.estimated_value || 0) * 0.33) - 500 - 
                          ((caseData.estimated_value || 0) * ((caseData.commission_rate || 4) / 100))
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Contingency Fee (33%)</span>
                        <span>{formatCurrency((caseData.estimated_value || 0) * 0.33)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Less: Credlocity Referral Fee</span>
                        <span>-$500</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Less: Credlocity Commission ({caseData.commission_rate || 4}%)</span>
                        <span>-{formatCurrency((caseData.estimated_value || 0) * ((caseData.commission_rate || 4) / 100))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Credlocity Gets */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-blue-800">Credlocity Receives</span>
                        <p className="text-xs text-blue-600">Referral fee + commission</p>
                      </div>
                      <span className="text-lg font-bold text-blue-700">
                        {formatCurrency(
                          500 + ((caseData.estimated_value || 0) * ((caseData.commission_rate || 4) / 100))
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Initial Referral Fee</span>
                        <span>$500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission ({caseData.commission_rate || 4}%)</span>
                        <span>{formatCurrency((caseData.estimated_value || 0) * ((caseData.commission_rate || 4) / 100))}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 italic text-center pt-2">
                  *Based on typical 33% contingency fee arrangement. Actual client amount depends on your fee agreement.
                </p>
              </CardContent>
            </Card>

            {/* Initial Fee Status */}
            <Card className={caseData.initial_fee_paid ? 'border-green-200' : 'border-amber-200 bg-amber-50'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {caseData.initial_fee_paid ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium">Initial Fee ($500)</p>
                      <p className="text-sm text-gray-500">
                        {caseData.initial_fee_paid ? 'Paid' : 'Payment Required'}
                      </p>
                    </div>
                  </div>
                  {!caseData.initial_fee_paid && (
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      Pay Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowUpdateModal(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Case Status
                </Button>
                <Link to={`/attorney/case-updates/${caseId}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Detailed Update Form
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Status Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Update Case Status</h3>
              <p className="text-gray-500 text-sm">
                Case: {caseData.case_id} - {caseData.title}
              </p>
            </div>
            <form onSubmit={handleSubmitUpdate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setUpdateForm({ ...updateForm, status: option.name })}
                      className={`p-3 rounded-lg border-2 text-left text-sm transition-colors ${
                        updateForm.status === option.name
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Notes *
                </label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  rows={4}
                  placeholder="Describe the current status, recent progress, and next steps..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={submitting || !updateForm.status || !updateForm.notes.trim()}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Update
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
