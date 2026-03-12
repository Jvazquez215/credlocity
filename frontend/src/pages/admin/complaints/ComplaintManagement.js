import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, Eye, Mail, Building2,
  RefreshCw, Search, Filter, ChevronDown, MessageSquare,
  Shield, Phone, MapPin, DollarSign, Calendar, FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
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

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    under_investigation: 'bg-blue-100 text-blue-800 border-blue-300',
    contacted_company: 'bg-purple-100 text-purple-800 border-purple-300',
    published: 'bg-green-100 text-green-800 border-green-300',
    archived: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const labels = {
    pending_review: 'Pending Review',
    under_investigation: 'Under Investigation',
    contacted_company: 'Company Contacted',
    published: 'Published',
    archived: 'Archived'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending_review}`}>
      {labels[status] || status}
    </span>
  );
};

// Complaint Detail Modal
const ComplaintDetailModal = ({ complaint, isOpen, onClose, onUpdate }) => {
  const [adminFindings, setAdminFindings] = useState(complaint?.admin_findings || '');
  const [companyResponse, setCompanyResponse] = useState(complaint?.company_response || '');
  const [status, setStatus] = useState(complaint?.status || 'pending_review');
  const [displayName, setDisplayName] = useState(complaint?.display_complainant_name ?? true);
  const [companyContacted, setCompanyContacted] = useState(complaint?.company_contacted || false);
  const [saving, setSaving] = useState(false);
  
  // SEO fields
  const [seoSlug, setSeoSlug] = useState(complaint?.seo?.url_slug || '');
  const [seoTitle, setSeoTitle] = useState(complaint?.seo?.meta_title || '');
  const [seoDescription, setSeoDescription] = useState(complaint?.seo?.meta_description || '');

  useEffect(() => {
    if (complaint) {
      setAdminFindings(complaint.admin_findings || '');
      setCompanyResponse(complaint.company_response || '');
      setStatus(complaint.status || 'pending_review');
      setDisplayName(complaint.display_complainant_name ?? true);
      setCompanyContacted(complaint.company_contacted || false);
      setSeoSlug(complaint.seo?.url_slug || '');
      setSeoTitle(complaint.seo?.meta_title || '');
      setSeoDescription(complaint.seo?.meta_description || '');
    }
  }, [complaint]);

  if (!isOpen || !complaint) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/credit-repair/admin/complaints/${complaint.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admin_findings: adminFindings,
          company_response: companyResponse,
          status,
          display_complainant_name: displayName,
          company_contacted: companyContacted,
          company_contacted_date: companyContacted ? new Date().toISOString() : null,
          seo: {
            url_slug: seoSlug,
            meta_title: seoTitle,
            meta_description: seoDescription
          }
        })
      });

      if (response.ok) {
        onUpdate();
        if (status === 'published') {
          alert('Complaint published successfully!');
        }
      } else {
        alert('Failed to update complaint');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update complaint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Complaint Review</h2>
              <p className="text-blue-200 text-sm">ID: {complaint.id}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Complaint Details */}
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Company
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">{complaint.company_name}</p>
                </CardContent>
              </Card>

              {/* Complainant Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Complainant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="font-medium w-20">Name:</span>
                    {complaint.complainant_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {complaint.complainant_email}
                  </p>
                  {complaint.complainant_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {complaint.complainant_phone}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {complaint.complainant_state || 'N/A'}
                  </p>
                </CardContent>
              </Card>

              {/* Complaint Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Complaint Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Service Date: {complaint.date_of_service || 'N/A'}</span>
                  </div>
                  {complaint.amount_paid && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>Amount Paid: {formatCurrency(complaint.amount_paid)}</span>
                    </div>
                  )}
                  {complaint.person_spoke_to && (
                    <p><strong>Spoke With:</strong> {complaint.person_spoke_to}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {complaint.complaint_types?.map((type, i) => (
                      <span key={i} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{complaint.complaint_details}</p>
                  </div>
                  {complaint.resolution_sought && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Resolution Sought:</p>
                      <p className="text-blue-800">{complaint.resolution_sought}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Evidence */}
              {(complaint.screenshots?.length > 0 || complaint.documents?.length > 0) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{complaint.screenshots?.length || 0} screenshots</p>
                    <p>{complaint.documents?.length || 0} documents</p>
                    <p>{complaint.audio_recordings?.length || 0} audio recordings</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Admin Actions */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending_review">Pending Review</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="contacted_company">Company Contacted</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </CardContent>
              </Card>

              {/* Options */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={displayName}
                      onChange={(e) => setDisplayName(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Display complainant's name publicly</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={companyContacted}
                      onChange={(e) => setCompanyContacted(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Company has been contacted</span>
                  </label>
                </CardContent>
              </Card>

              {/* Admin Findings */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={adminFindings}
                    onChange={(e) => setAdminFindings(e.target.value)}
                    rows={4}
                    placeholder="Document your findings after investigating this complaint..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be displayed publicly if complaint is published</p>
                </CardContent>
              </Card>

              {/* Company Response */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Company Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={companyResponse}
                    onChange={(e) => setCompanyResponse(e.target.value)}
                    rows={4}
                    placeholder="Enter the company's response if they replied..."
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card className="border-purple-200">
                <CardHeader className="pb-2 bg-purple-50">
                  <CardTitle className="text-sm text-purple-800">SEO Settings</CardTitle>
                  <CardDescription className="text-xs">Control how this review appears in search engines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">URL Slug</label>
                    <Input
                      value={seoSlug}
                      onChange={(e) => setSeoSlug(e.target.value)}
                      placeholder="company-name-review-john-abc123"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Meta Title</label>
                    <Input
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Company Name Review by John D. | Credlocity"
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">{seoTitle.length}/60 chars</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Meta Description</label>
                    <Textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      rows={2}
                      placeholder="Read John's honest review and complaint about..."
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">{seoDescription.length}/160 chars</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-500">
            Submitted: {formatDate(complaint.created_at)}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className={status === 'published' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {saving ? 'Saving...' : status === 'published' ? 'Save & Publish' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ComplaintManagement() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getToken = () => localStorage.getItem('auth_token');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/api/credit-repair/admin/complaints`);
      if (statusFilter) url.searchParams.set('status', statusFilter);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complaint_details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Investigating</p>
                <p className="text-2xl font-bold text-blue-800">{stats.investigating || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-800">{stats.published || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Total Complaints</p>
                <p className="text-2xl font-bold text-purple-800">{complaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="contacted_company">Company Contacted</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button onClick={fetchComplaints} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complainant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Types</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{complaint.company_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm">{complaint.complainant_name}</p>
                          <p className="text-xs text-gray-500">{complaint.complainant_state}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {complaint.complaint_types?.slice(0, 2).map((type, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                              {type}
                            </span>
                          ))}
                          {complaint.complaint_types?.length > 2 && (
                            <span className="text-xs text-gray-400">+{complaint.complaint_types.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {formatCurrency(complaint.amount_paid)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdate={() => {
          fetchComplaints();
          setSelectedComplaint(null);
        }}
      />
    </div>
  );
}
