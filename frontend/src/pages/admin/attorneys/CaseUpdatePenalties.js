import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Clock, CheckCircle, RefreshCw, 
  AlertCircle, Shield, Lock, Unlock, Eye, User, Mail
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function CaseUpdatePenalties() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [applyingPenalty, setApplyingPenalty] = useState(null);
  const [removingPenalty, setRemovingPenalty] = useState(null);

  const getToken = () => localStorage.getItem('auth_token');

  useEffect(() => {
    fetchOverdueCases();
  }, []);

  const fetchOverdueCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/case-updates/admin/overdue-cases`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Failed to fetch overdue cases');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPenalty = async (attorneyId, caseIds) => {
    if (!window.confirm('Are you sure you want to apply a penalty to this attorney? Their marketplace access will be suspended and balance will be held.')) {
      return;
    }

    setApplyingPenalty(attorneyId);
    try {
      const response = await fetch(`${API_URL}/api/case-updates/admin/apply-penalty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attorney_id: attorneyId,
          reason: 'Case updates overdue by 3+ days',
          case_ids: caseIds
        })
      });

      if (response.ok) {
        fetchOverdueCases(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to apply penalty');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to apply penalty');
    } finally {
      setApplyingPenalty(null);
    }
  };

  const handleRemovePenalty = async (attorneyId) => {
    if (!window.confirm('Are you sure you want to remove the penalty? The attorney will regain marketplace access and their balance will be restored.')) {
      return;
    }

    setRemovingPenalty(attorneyId);
    try {
      const response = await fetch(`${API_URL}/api/case-updates/admin/remove-penalty/${attorneyId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (response.ok) {
        fetchOverdueCases(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to remove penalty');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to remove penalty');
    } finally {
      setRemovingPenalty(null);
    }
  };

  // Group cases by attorney
  const groupByAttorney = (cases) => {
    const grouped = {};
    cases.forEach(caseItem => {
      if (!grouped[caseItem.attorney_id]) {
        grouped[caseItem.attorney_id] = {
          attorney_id: caseItem.attorney_id,
          attorney_name: caseItem.attorney_name,
          attorney_email: caseItem.attorney_email,
          attorney_locked: caseItem.attorney_locked,
          cases: []
        };
      }
      grouped[caseItem.attorney_id].cases.push(caseItem);
    });
    return Object.values(grouped);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchOverdueCases} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedAttorneys = groupByAttorney(data?.overdue_cases || []);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-amber-600">Total Overdue Cases</p>
                <p className="text-2xl font-bold text-amber-800">{data?.total_overdue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Requiring Penalty</p>
                <p className="text-2xl font-bold text-red-800">{data?.penalty_required_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Attorneys Affected</p>
                <p className="text-2xl font-bold text-purple-800">{groupedAttorneys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={fetchOverdueCases} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Attorney List */}
      {groupedAttorneys.length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800">No Overdue Cases</h3>
            <p className="text-green-600 mt-2">
              All attorneys have submitted their required case updates on time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedAttorneys.map((attorney) => {
            const hasUrgentCases = attorney.cases.some(c => c.requires_penalty);
            
            return (
              <Card 
                key={attorney.attorney_id} 
                className={`${attorney.attorney_locked ? 'border-red-500 bg-red-50' : hasUrgentCases ? 'border-amber-500 bg-amber-50' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${attorney.attorney_locked ? 'bg-red-100' : 'bg-purple-100'}`}>
                        <User className={`w-6 h-6 ${attorney.attorney_locked ? 'text-red-600' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {attorney.attorney_name}
                          {attorney.attorney_locked && (
                            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3" /> SUSPENDED
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {attorney.attorney_email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        hasUrgentCases ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {attorney.cases.length} Overdue Case{attorney.cases.length !== 1 ? 's' : ''}
                      </span>
                      
                      {attorney.attorney_locked ? (
                        <Button 
                          variant="outline"
                          onClick={() => handleRemovePenalty(attorney.attorney_id)}
                          disabled={removingPenalty === attorney.attorney_id}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          {removingPenalty === attorney.attorney_id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Unlock className="w-4 h-4 mr-2" />
                          )}
                          Restore Access
                        </Button>
                      ) : hasUrgentCases ? (
                        <Button 
                          variant="destructive"
                          onClick={() => handleApplyPenalty(
                            attorney.attorney_id, 
                            attorney.cases.filter(c => c.requires_penalty).map(c => c.case_id)
                          )}
                          disabled={applyingPenalty === attorney.attorney_id}
                        >
                          {applyingPenalty === attorney.attorney_id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 mr-2" />
                          )}
                          Apply Penalty
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attorney.cases.map((caseItem) => (
                      <div 
                        key={caseItem.case_id}
                        className={`p-4 rounded-lg border ${
                          caseItem.requires_penalty 
                            ? 'bg-red-100 border-red-300' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm text-gray-500">{caseItem.case_id}</span>
                              {caseItem.requires_penalty && (
                                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                  ACTION REQUIRED
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium mt-1">{caseItem.case_title}</h4>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${caseItem.requires_penalty ? 'text-red-600' : 'text-amber-600'}`}>
                              {caseItem.days_overdue} days overdue
                            </p>
                            <p className="text-xs text-gray-500">
                              Last update: {formatDate(caseItem.last_update_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
