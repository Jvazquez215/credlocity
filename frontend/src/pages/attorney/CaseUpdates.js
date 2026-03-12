import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  AlertTriangle, Clock, CheckCircle, ArrowLeft, 
  FileText, Send, RefreshCw, AlertCircle, Bell
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Blinking notification indicator
const BlinkingNotification = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <div className="relative">
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping" />
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-xs text-white font-bold">{count}</span>
      </div>
    </div>
  );
};

// Cases Needing Update Card for Dashboard
export function CasesNeedingUpdateCard({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCasesNeedingUpdate();
  }, [token]);

  const fetchCasesNeedingUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/case-updates/attorney/cases-needing-update?token=${token}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching cases needing update:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Show penalty warning if marketplace is locked
  if (data?.penalty_status?.locked) {
    return (
      <Card className="border-2 border-red-600 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg">⚠️ Account Suspended</h3>
              <p className="text-red-700 mt-1">
                Your marketplace access has been temporarily suspended due to overdue case updates.
              </p>
              <div className="mt-4 bg-red-100 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-600 font-medium">Reason:</span>
                    <p className="text-red-800">{data.penalty_status.reason || 'Case updates overdue by 3+ days'}</p>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">Held Balance:</span>
                    <p className="text-red-800 font-bold">${data.penalty_status.held_balance?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-3">
                  Please update the following cases to restore your access:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.penalty_status.case_ids?.map(caseId => (
                    <Link 
                      key={caseId} 
                      to={`/attorney/cases/${caseId}`}
                      className="bg-white px-3 py-1 rounded-full text-sm text-red-700 border border-red-300 hover:bg-red-50"
                    >
                      {caseId}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/attorney/case-updates">
                  <Button variant="destructive">
                    <FileText className="w-4 h-4 mr-2" />
                    Update Cases Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.total_overdue === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">All Cases Up to Date</h3>
              <p className="text-sm text-green-600">No case updates are required at this time.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${data.urgent_count > 0 ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.urgent_count > 0 ? (
              <div className="relative">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
              </div>
            ) : (
              <Clock className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <CardTitle className={data.urgent_count > 0 ? 'text-red-800' : 'text-amber-800'}>
                {data.total_overdue} Case{data.total_overdue !== 1 ? 's' : ''} Need Update
              </CardTitle>
              {data.urgent_count > 0 && (
                <CardDescription className="text-red-600 font-medium">
                  ⚠️ {data.urgent_count} case{data.urgent_count !== 1 ? 's' : ''} overdue by 3+ days - ACTION REQUIRED
                </CardDescription>
              )}
            </div>
          </div>
          <Link to="/attorney/case-updates">
            <Button 
              variant={data.urgent_count > 0 ? 'destructive' : 'default'}
              className={!data.urgent_count ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              <Bell className="w-4 h-4 mr-2" />
              Update Now
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.cases_needing_update.slice(0, 3).map((caseItem) => (
            <div 
              key={caseItem.case_id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                caseItem.is_urgent ? 'bg-red-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {caseItem.is_urgent && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <div>
                  <p className="font-medium text-sm">{caseItem.title}</p>
                  <p className="text-xs text-gray-500">
                    {caseItem.case_id} • {caseItem.days_overdue} days overdue
                  </p>
                </div>
              </div>
              <Link to={`/attorney/case-updates/${caseItem.case_id}`}>
                <Button size="sm" variant="outline">
                  Update
                </Button>
              </Link>
            </div>
          ))}
          {data.total_overdue > 3 && (
            <Link to="/attorney/case-updates" className="block text-center text-sm text-blue-600 hover:underline pt-2">
              View all {data.total_overdue} cases →
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Case Update Page
export default function CaseUpdatePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getToken = () => localStorage.getItem('attorney_token');

  useEffect(() => {
    fetchData();
  }, [caseId]);

  const fetchData = async () => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }

    try {
      // Fetch status options and case history in parallel
      const [optionsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/case-updates/status-options`),
        caseId ? fetch(`${API_URL}/api/case-updates/attorney/cases/${caseId}/history?token=${token}`) : Promise.resolve(null)
      ]);

      if (optionsRes.ok) {
        const options = await optionsRes.json();
        setStatusOptions(options);
      }

      if (historyRes && historyRes.ok) {
        const history = await historyRes.json();
        setCaseData(history);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load case data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }

    if (!notes.trim()) {
      setError('Please provide update notes');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/case-updates/attorney/cases/${caseId}/update?token=${getToken()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: selectedStatus,
            notes: notes
          })
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/attorney');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to submit update');
      }
    } catch (err) {
      setError('Failed to submit update. Please try again.');
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Update Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your case update has been recorded successfully.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/attorney" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit Case Update</h1>
          <p className="text-gray-500 mt-1">
            Provide a status update for this case to maintain your marketplace access.
          </p>
        </div>

        {/* Case Info */}
        {caseData?.case && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {caseData.case.title}
              </CardTitle>
              <CardDescription>
                Case ID: {caseData.case.case_id} • Type: {caseData.case.type}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Case Status Update</CardTitle>
            <CardDescription>
              Select the current status and provide details about the case progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Case Status *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedStatus(option.name)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedStatus === option.name
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.name}</p>
                      {option.description && (
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Notes *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Provide details about the case progress, any recent developments, next steps, etc."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This information helps us keep the client informed about their case.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={submitting || !selectedStatus || !notes.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
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
            </form>
          </CardContent>
        </Card>

        {/* Update History */}
        {caseData?.updates && caseData.updates.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Previous Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseData.updates.map((update, index) => (
                  <div key={update.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{update.status}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{update.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
