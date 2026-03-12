import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, MessageSquare, Gift, DollarSign, Flame, Sun, Snowflake, Mail, Phone, Calendar, Clock, Edit, Save, Plus, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [notes, setNotes] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' });
  const [newCredit, setNewCredit] = useState({ credit_type: 'dollar_credit', description: '', dollar_amount: 0, months: 1 });

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [clientRes, agreementsRes, notesRes, creditsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/clients/${clientId}`, { headers }),
        axios.get(`${API_URL}/api/admin/clients/${clientId}/agreements`, { headers }),
        axios.get(`${API_URL}/api/admin/clients/${clientId}/notes`, { headers }),
        axios.get(`${API_URL}/api/admin/clients/${clientId}/credits`, { headers })
      ]);
      
      setClient(clientRes.data);
      setEditData(clientRes.data);
      setAgreements(agreementsRes.data);
      setNotes(notesRes.data);
      setCredits(creditsRes.data);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_URL}/api/admin/clients/${clientId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClient(editData);
      setEditing(false);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_URL}/api/admin/clients/${clientId}/notes`, newNote, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([response.data, ...notes]);
      setShowNoteForm(false);
      setNewNote({ title: '', content: '', category: 'general' });
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddCredit = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_URL}/api/admin/clients/${clientId}/credits`, newCredit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredits([response.data, ...credits]);
      setShowCreditForm(false);
      setNewCredit({ credit_type: 'dollar_credit', description: '', dollar_amount: 0, months: 1 });
    } catch (error) {
      console.error('Error adding credit:', error);
    }
  };

  const getLeadStatusBadge = (status) => {
    const badges = {
      hot: { icon: Flame, class: 'bg-red-100 text-red-700', label: 'Hot Lead' },
      warm: { icon: Sun, class: 'bg-yellow-100 text-yellow-700', label: 'Warm Lead' },
      cold: { icon: Snowflake, class: 'bg-blue-100 text-blue-700', label: 'Cold Lead' }
    };
    const badge = badges[status] || badges.cold;
    const Icon = badge.icon;
    return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}><Icon className="w-4 h-4" /> {badge.label}</span>;
  };

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
  const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : 'N/A';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  if (!client) return <div className="text-center py-10">Client not found</div>;

  const tabs = [
    { id: 'info', label: 'Info', icon: User },
    { id: 'agreements', label: 'Agreements', icon: FileText },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'billing', label: 'Billing', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/clients')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.first_name} {client.last_name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {getLeadStatusBadge(client.lead_status)}
            <span className="text-sm text-gray-500">Score: {client.assessment_score || 0}</span>
            {client.agreement_signed && <span className="text-sm text-green-600 flex items-center gap-1"><CheckIcon className="w-4 h-4" /> Agreement Signed</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Package</p>
          <p className="font-semibold text-green-600">{client.package_name || 'TBD'}</p>
          {client.package_price > 0 && <p className="text-sm text-gray-500">${client.package_price}/month</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 flex items-center gap-2 font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              {!editing ? (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditData(client); }}>Cancel</Button>
                  <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Save</Button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label>{editing ? <Input value={editData.first_name} onChange={e => setEditData({...editData, first_name: e.target.value})} /> : <p className="font-medium">{client.first_name}</p>}</div>
                <div><Label>Last Name</Label>{editing ? <Input value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})} /> : <p className="font-medium">{client.last_name}</p>}</div>
              </div>
              <div><Label>Email</Label>{editing ? <Input value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /> : <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {client.email}</p>}</div>
              <div><Label>Phone</Label>{editing ? <Input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} /> : <p className="font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {client.phone}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date of Birth</Label><p className="text-sm">{client.date_of_birth || 'Not provided'}</p></div>
                <div><Label>SSN Last 4</Label><p className="text-sm">{client.ssn_last4 ? `****${client.ssn_last4}` : 'Not provided'}</p></div>
              </div>
            </div>
          </div>

          {/* Status & Workflow */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Status & Workflow</h2>
            <div className="space-y-4">
              <div><Label>Status</Label>
                {editing ? (
                  <Select value={editData.status} onValueChange={v => setEditData({...editData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="consultation_scheduled">Consultation Scheduled</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <p className="font-medium capitalize">{client.status?.replace(/_/g, ' ')}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Created</Label><p className="text-sm flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> {formatDate(client.created_at)}</p></div>
                <div><Label>Last Updated</Label><p className="text-sm flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {formatDate(client.updated_at)}</p></div>
              </div>
              <div><Label>Source</Label><p className="text-sm">{client.source || 'Intake Form'}</p></div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Assessment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Credit Score Range</span><span className="font-medium capitalize">{client.credit_score_range || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Timeline</span><span className="font-medium">{client.timeline || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Selected Package</span><span className="font-medium">{client.selected_package || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium capitalize">{client.experience?.replace(/-/g, ' ') || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Decision Maker</span><span className="font-medium capitalize">{client.decision_maker?.replace(/-/g, ' ') || 'N/A'}</span></div>
            </div>
          </div>

          {/* Fees & Payments */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Fees & Payments</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Credit Report Fee</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${client.credit_report_fee || 49.95}</span>
                  {client.credit_report_paid ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Paid</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>}
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>E-Notary Fee</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${client.enotary_fee || 39.95}</span>
                  {client.enotary_paid ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Paid</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>}
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between"><span className="font-medium">Monthly (After Trial)</span><span className="font-bold text-green-600">${client.package_price || 0}/mo</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agreements' && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b"><h2 className="text-lg font-semibold">Signed Agreements</h2></div>
          {agreements.length > 0 ? (
            <div className="divide-y">
              {agreements.map(agreement => (
                <div key={agreement.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{agreement.agreement_type === 'free_trial' ? 'Free Trial Service Agreement' : 'Service Agreement'}</h3>
                      <p className="text-sm text-gray-500 mt-1">Signed: {agreement.signature_date}</p>
                      <p className="text-sm text-gray-500">Signature: {agreement.electronic_signature}</p>
                      <p className="text-sm text-gray-500">IP: {agreement.signature_ip}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{agreement.package_name}</p>
                      <p className="text-sm text-green-600">${agreement.package_price}/month</p>
                      <p className="text-xs text-gray-500 mt-2">Federal Cancel: {agreement.federal_cancel_date}</p>
                      {agreement.pa_state_cancel_date && <p className="text-xs text-gray-500">PA Cancel: {agreement.pa_state_cancel_date}</p>}
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const token = localStorage.getItem('auth_token');
                            window.open(`${process.env.REACT_APP_BACKEND_URL}/api/admin/clients/${clientId}/agreements/${agreement.id}/pdf?token=${token}&view=true`, '_blank');
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const token = localStorage.getItem('auth_token');
                            window.open(`${process.env.REACT_APP_BACKEND_URL}/api/admin/clients/${clientId}/agreements/${agreement.id}/pdf?token=${token}`, '_blank');
                          }}
                        >
                          <FileText className="w-4 h-4 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
                    <p className="font-medium text-green-800">Upfront Fees at Signing:</p>
                    <p className="text-green-700">Credit Report: ${agreement.credit_report_fee} | E-Notary: ${agreement.enotary_fee}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">No agreements signed yet</div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notes</h2>
            <Button size="sm" onClick={() => setShowNoteForm(true)}><Plus className="w-4 h-4 mr-1" /> Add Note</Button>
          </div>
          {notes.length > 0 ? (
            <div className="divide-y">
              {notes.map(note => (
                <div key={note.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{note.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{note.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{note.created_by_name} - {formatDateTime(note.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">No notes yet</div>
          )}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Credits & Billing</h2>
            <Button size="sm" onClick={() => setShowCreditForm(true)}><Plus className="w-4 h-4 mr-1" /> Add Credit</Button>
          </div>
          {credits.filter(c => c.status === 'active').length > 0 ? (
            <div className="p-6 space-y-3">
              {credits.filter(c => c.status === 'active').map(credit => (
                <div key={credit.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{credit.credit_type === 'month_credit' ? `${credit.months} Month Credit` : credit.credit_type === 'freemium' ? 'Freemium Credit' : `$${credit.dollar_amount} Credit`}</p>
                      <p className="text-sm text-gray-500">{credit.description}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{credit.status}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Issued:</span> <span>{formatDate(credit.valid_from || credit.created_at)}</span></div>
                    <div><span className="text-gray-500">Expires:</span> <span>{credit.valid_until ? formatDate(credit.valid_until) : 'Never'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">No active credits</div>
          )}
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} /></div>
            <div><Label>Content</Label><Textarea value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} rows={4} /></div>
            <div><Label>Category</Label>
              <Select value={newNote.category} onValueChange={v => setNewNote({...newNote, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddNote} className="w-full">Add Note</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Credit Dialog */}
      <Dialog open={showCreditForm} onOpenChange={setShowCreditForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Credit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Credit Type</Label>
              <Select value={newCredit.credit_type} onValueChange={v => setNewCredit({...newCredit, credit_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dollar_credit">Dollar Credit</SelectItem>
                  <SelectItem value="month_credit">Month Credit</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={newCredit.description} onChange={e => setNewCredit({...newCredit, description: e.target.value})} /></div>
            {newCredit.credit_type === 'dollar_credit' && (
              <div><Label>Dollar Amount</Label><Input type="number" value={newCredit.dollar_amount} onChange={e => setNewCredit({...newCredit, dollar_amount: parseFloat(e.target.value) || 0})} /></div>
            )}
            {newCredit.credit_type === 'month_credit' && (
              <div><Label>Months</Label><Input type="number" value={newCredit.months} onChange={e => setNewCredit({...newCredit, months: parseInt(e.target.value) || 1})} /></div>
            )}
            <Button onClick={handleAddCredit} className="w-full">Add Credit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CheckIcon = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

export default ClientProfile;
