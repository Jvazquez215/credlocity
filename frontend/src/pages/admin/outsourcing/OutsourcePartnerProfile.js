import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, User, DollarSign, History, Calendar, Receipt,
  ClipboardList, AlertTriangle, Pencil, Save, X, Archive, ArchiveRestore,
  Phone, Mail, Clock, CheckCircle, XCircle, Plus, Eye, MessageSquare,
  FileText, Upload, Trash2, Tag, Percent, Gift, Ticket, StickyNote, Download, Pen
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OutsourcePartnerProfile = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [workLogs, setWorkLogs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [credits, setCredits] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Modal states
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showWorkLogForm, setShowWorkLogForm] = useState(false);
  const [showWorkLogDetail, setShowWorkLogDetail] = useState(null);
  const [showServiceAgreementForm, setShowServiceAgreementForm] = useState(false);
  const [serviceAgreements, setServiceAgreements] = useState([]);
  const [generatingAgreement, setGeneratingAgreement] = useState(false);
  const [serviceAgreementFormData, setServiceAgreementFormData] = useState({
    rate_per_account: 30.00,
    min_accounts: 35,
    max_accounts: 50,
    package_name: 'Bureau Letters Only - Variable Volume',
    additional_terms: '',
    provider_name: 'Credlocity LLC',
    provider_address: ''
  });
  const [showEsignModal, setShowEsignModal] = useState(null);
  const [esignFormData, setEsignFormData] = useState({ signer_name: '', signer_email: '' });
  const [sendingEsign, setSendingEsign] = useState(false);
  
  const [ticketCategories, setTicketCategories] = useState([]);
  const [noteCategories, setNoteCategories] = useState([]);
  const [editingWorkLog, setEditingWorkLog] = useState(null);
  
  const [ticketForm, setTicketForm] = useState({
    category_id: '', subject: '', notes: '', contact_name: '', communication_method: 'phone'
  });
  
  const [noteForm, setNoteForm] = useState({
    title: '', content: '', category: '', source_type: 'phone',
    contact_email: '', contact_phone: '', contact_name: '', attachments: []
  });
  
  const [agreementForm, setAgreementForm] = useState({
    title: '', description: '', agreement_type: 'service_agreement',
    file_name: '', file_url: '', effective_date: '', expiration_date: ''
  });
  
  const [creditForm, setCreditForm] = useState({
    credit_type: 'month_credit', description: '', months: 1, dollar_amount: 0
  });
  
  const [discountForm, setDiscountForm] = useState({
    discount_type: 'percentage', description: '', percentage: 0,
    dollar_amount: 0, per_file_amount: 0, duration_months: 1
  });
  
  const [couponCode, setCouponCode] = useState('');
  
  const [workLogForm, setWorkLogForm] = useState({
    work_date: new Date().toISOString().split('T')[0],
    disputes_processed: 0, letters_sent: 0, description: ''
  });

  useEffect(() => {
    fetchPartner();
    fetchTicketCategories();
    fetchNoteCategories();
  }, [partnerId]);

  useEffect(() => {
    if (partner) fetchTabData();
  }, [activeTab, partner]);

  const fetchPartner = async () => {
    try {
      const response = await api.get(`/admin/outsource/partners/${partnerId}`);
      setPartner(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error('Error fetching partner:', error);
      toast.error('Failed to load partner');
      navigate('/admin/outsourcing/partners');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketCategories = async () => {
    try {
      const response = await api.get('/admin/outsource/ticket-categories');
      setTicketCategories(response.data);
    } catch (error) {
      console.error('Error fetching ticket categories:', error);
    }
  };

  const fetchNoteCategories = async () => {
    try {
      const response = await api.get('/admin/outsource/note-categories');
      setNoteCategories(response.data);
    } catch (error) {
      console.error('Error fetching note categories:', error);
    }
  };

  const fetchTabData = async () => {
    try {
      if (activeTab === 'work-logs') {
        const response = await api.get(`/admin/outsource/partners/${partnerId}/work-logs?include_archived=true`);
        setWorkLogs(response.data);
      } else if (activeTab === 'billing') {
        const [invoicesRes, creditsRes, discountsRes, couponsRes] = await Promise.all([
          api.get(`/admin/outsource/partners/${partnerId}/invoices`),
          api.get(`/admin/outsource/partners/${partnerId}/credits`),
          api.get(`/admin/outsource/partners/${partnerId}/discounts`),
          api.get(`/admin/outsource/partners/${partnerId}/coupons`)
        ]);
        setInvoices(invoicesRes.data);
        setCredits(creditsRes.data);
        setDiscounts(discountsRes.data);
        setAppliedCoupons(couponsRes.data);
      } else if (activeTab === 'escalations') {
        const response = await api.get(`/admin/outsource/partners/${partnerId}/tickets`);
        setTickets(response.data);
      } else if (activeTab === 'notes') {
        const response = await api.get(`/admin/outsource/partners/${partnerId}/notes`);
        setNotes(response.data);
      } else if (activeTab === 'agreements') {
        const [docsRes, saRes] = await Promise.all([
          api.get(`/admin/outsource/partners/${partnerId}/agreements`),
          api.get(`/admin/outsource/partners/${partnerId}/service-agreements`)
        ]);
        setAgreements(docsRes.data);
        setServiceAgreements(saRes.data);
      }
    } catch (error) {
      console.error('Error fetching tab data:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/admin/outsource/partners/${partnerId}`, editData);
      toast.success('Partner updated successfully');
      setIsEditing(false);
      fetchPartner();
    } catch (error) {
      console.error('Error updating partner:', error);
      toast.error('Failed to update partner');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/outsource/tickets', { ...ticketForm, partner_id: partnerId });
      toast.success('Escalation ticket created!');
      setShowTicketForm(false);
      setTicketForm({ category_id: '', subject: '', notes: '', contact_name: '', communication_method: 'phone' });
      fetchTabData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/outsource/partners/${partnerId}/notes`, noteForm);
      toast.success('Note added!');
      setShowNoteForm(false);
      setNoteForm({ title: '', content: '', category: '', source_type: 'phone', contact_email: '', contact_phone: '', contact_name: '', attachments: [] });
      fetchTabData();
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/admin/outsource/notes/${noteId}`);
      toast.success('Note deleted');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleCreateAgreement = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/outsource/partners/${partnerId}/agreements`, agreementForm);
      toast.success('Agreement uploaded!');
      setShowAgreementForm(false);
      setAgreementForm({ title: '', description: '', agreement_type: 'service_agreement', file_name: '', file_url: '', effective_date: '', expiration_date: '' });
      fetchTabData();
    } catch (error) {
      console.error('Error creating agreement:', error);
      toast.error('Failed to upload agreement');
    }
  };

  const handleDeleteAgreement = async (agreementId) => {
    if (!window.confirm('Delete this agreement?')) return;
    try {
      await api.delete(`/admin/outsource/agreements/${agreementId}`);
      toast.success('Agreement deleted');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to delete agreement');
    }
  };

  const handleGenerateServiceAgreement = async (e) => {
    e.preventDefault();
    setGeneratingAgreement(true);
    try {
      await api.post(`/admin/outsource/partners/${partnerId}/agreement`, serviceAgreementFormData);
      toast.success('Service agreement generated successfully!');
      setShowServiceAgreementForm(false);
      setServiceAgreementFormData({
        rate_per_account: 30.00, min_accounts: 35, max_accounts: 50,
        package_name: 'Bureau Letters Only - Variable Volume',
        additional_terms: '', provider_name: 'Credlocity LLC', provider_address: ''
      });
      fetchTabData();
    } catch (error) {
      console.error('Error generating agreement:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate service agreement');
    } finally {
      setGeneratingAgreement(false);
    }
  };

  const handleUpdateAgreementStatus = async (agreementId, newStatus) => {
    try {
      await api.patch(`/admin/outsource/agreements/${agreementId}/status`, { status: newStatus });
      toast.success('Agreement status updated');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to update agreement status');
    }
  };

  const handleSendForEsign = async (e) => {
    e.preventDefault();
    if (!showEsignModal) return;
    setSendingEsign(true);
    try {
      const res = await api.post(`/esign/send/${showEsignModal}`, esignFormData);
      const signUrl = `${window.location.origin}/sign/${res.data.sign_token}`;
      toast.success('E-signature request sent!');
      await navigator.clipboard.writeText(signUrl).catch(() => {});
      toast.info('Signing link copied to clipboard!');
      setShowEsignModal(null);
      setEsignFormData({ signer_name: '', signer_email: '' });
      fetchTabData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send for e-signature');
    } finally {
      setSendingEsign(false);
    }
  };

  const handleCreateCredit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/outsource/partners/${partnerId}/credits`, creditForm);
      toast.success('Credit added!');
      setShowCreditForm(false);
      setCreditForm({ credit_type: 'month_credit', description: '', months: 1, dollar_amount: 0 });
      fetchTabData();
    } catch (error) {
      console.error('Error creating credit:', error);
      toast.error('Failed to add credit');
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/outsource/partners/${partnerId}/discounts`, discountForm);
      toast.success('Discount added!');
      setShowDiscountForm(false);
      setDiscountForm({ discount_type: 'percentage', description: '', percentage: 0, dollar_amount: 0, per_file_amount: 0, duration_months: 1 });
      fetchTabData();
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error('Failed to add discount');
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      await api.delete(`/admin/outsource/discounts/${discountId}`);
      toast.success('Discount deleted');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/outsource/partners/${partnerId}/apply-coupon`, { coupon_code: couponCode });
      toast.success('Coupon applied!');
      setShowCouponForm(false);
      setCouponCode('');
      fetchTabData();
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(error.response?.data?.detail || 'Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = async (appliedId) => {
    if (!window.confirm('Remove this coupon?')) return;
    try {
      await api.delete(`/admin/outsource/applied-coupons/${appliedId}`);
      toast.success('Coupon removed');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to remove coupon');
    }
  };

  const handleSaveWorkLog = async (e) => {
    e.preventDefault();
    try {
      if (editingWorkLog) {
        await api.put(`/admin/outsource/work-logs/${editingWorkLog}`, workLogForm);
        toast.success('Work log updated!');
      } else {
        await api.post('/admin/outsource/work-logs', { ...workLogForm, partner_id: partnerId });
        toast.success('Work log created!');
      }
      setShowWorkLogForm(false);
      setEditingWorkLog(null);
      setWorkLogForm({ work_date: new Date().toISOString().split('T')[0], disputes_processed: 0, letters_sent: 0, description: '' });
      fetchTabData();
    } catch (error) {
      console.error('Error saving work log:', error);
      toast.error('Failed to save work log');
    }
  };

  const handleArchiveWorkLog = async (logId) => {
    try {
      await api.patch(`/admin/outsource/work-logs/${logId}/archive`);
      toast.success('Work log archived');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to archive work log');
    }
  };

  const handleDeleteWorkLog = async (logId) => {
    if (!window.confirm('Delete this work log permanently?')) return;
    try {
      await api.delete(`/admin/outsource/work-logs/${logId}`);
      toast.success('Work log deleted');
      fetchTabData();
    } catch (error) {
      toast.error('Failed to delete work log');
    }
  };

  const openEditWorkLog = (log) => {
    setEditingWorkLog(log.id);
    setWorkLogForm({
      work_date: log.work_date ? log.work_date.split('T')[0] : new Date().toISOString().split('T')[0],
      disputes_processed: log.disputes_processed || 0,
      letters_sent: log.letters_sent || 0,
      description: log.description || ''
    });
    setShowWorkLogForm(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const styles = { active: { bg: 'bg-green-100', text: 'text-green-800' }, inactive: { bg: 'bg-gray-100', text: 'text-gray-800' }, suspended: { bg: 'bg-red-100', text: 'text-red-800' } };
    const style = styles[status] || styles.inactive;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>{status}</span>;
  };

  const getUrgencyBadge = (urgency) => {
    const styles = { low: { bg: 'bg-gray-100', text: 'text-gray-700' }, medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' }, high: { bg: 'bg-orange-100', text: 'text-orange-700' }, critical: { bg: 'bg-red-100', text: 'text-red-700' } };
    const style = styles[urgency] || styles.medium;
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${style.bg} ${style.text}`}>{urgency?.toUpperCase()}</span>;
  };

  const getTicketStatusBadge = (status) => {
    const styles = { open: { bg: 'bg-blue-100', text: 'text-blue-700' }, in_progress: { bg: 'bg-purple-100', text: 'text-purple-700' }, resolved: { bg: 'bg-green-100', text: 'text-green-700' }, closed: { bg: 'bg-gray-100', text: 'text-gray-700' } };
    const style = styles[status] || styles.open;
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${style.bg} ${style.text}`}>{status?.replace('_', ' ')}</span>;
  };

  const getCategoryBadge = (category) => {
    const colors = { billing: 'bg-green-100 text-green-700', customer_care: 'bg-blue-100 text-blue-700', technical: 'bg-purple-100 text-purple-700', contract: 'bg-orange-100 text-orange-700', general: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[category] || colors.general}`}>{category?.replace('_', ' ')}</span>;
  };

  const getSourceIcon = (source) => {
    const icons = { email: Mail, phone: Phone, text: MessageSquare, internal_update: FileText, file_processing: ClipboardList };
    const Icon = icons[source] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!partner) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'agreements', label: 'Agreements', icon: FileText },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'work-logs', label: 'Work Logs', icon: ClipboardList },
    { id: 'escalations', label: 'Escalations', icon: AlertTriangle }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/outsourcing/partners')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center"><Building2 className="w-6 h-6 text-primary-blue" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{partner.company_name}</h1>
              <p className="text-gray-500">{partner.contact_first_name} {partner.contact_last_name} • {partner.contact_email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(partner.status)}
          <Button onClick={() => setShowTicketForm(true)} className="bg-orange-500 hover:bg-orange-600"><AlertTriangle className="w-4 h-4 mr-2" /> Create Escalation</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition whitespace-nowrap ${activeTab === tab.id ? 'border-primary-blue text-primary-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setIsEditing(false); setEditData(partner); }}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                  <Button onClick={handleSaveProfile}><Save className="w-4 h-4 mr-2" /> Save</Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Company Name', field: 'company_name' },
                { label: 'First Name', field: 'contact_first_name' },
                { label: 'Last Name', field: 'contact_last_name' },
                { label: 'Email', field: 'contact_email', type: 'email' },
                { label: 'Phone', field: 'contact_phone' },
                { label: 'Position', field: 'position' },
                { label: 'Billing Email', field: 'billing_email', type: 'email' }
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  {isEditing ? (
                    <Input type={type || 'text'} value={editData[field] || ''} onChange={(e) => setEditData({...editData, [field]: e.target.value})} className="mt-1" />
                  ) : (
                    <p className="text-gray-900 mt-1">{partner[field] || 'N/A'}</p>
                  )}
                </div>
              ))}
              <div>
                <Label>Status</Label>
                {isEditing ? (
                  <select value={editData.status || 'active'} onChange={(e) => setEditData({...editData, status: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                ) : (
                  <p className="mt-1">{getStatusBadge(partner.status)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
              <Button onClick={() => setShowNoteForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Note</Button>
            </div>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryBadge(note.category)}
                          <span className="flex items-center gap-1 text-sm text-gray-500">{getSourceIcon(note.source_type)} {note.source_type?.replace('_', ' ')}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{note.title}</h3>
                        <p className="text-gray-600 mt-1 text-sm">{note.content}</p>
                        {(note.contact_email || note.contact_phone || note.contact_name) && (
                          <div className="mt-2 text-sm text-gray-500">
                            {note.contact_name && <span className="mr-3">Contact: {note.contact_name}</span>}
                            {note.contact_email && <span className="mr-3"><Mail className="w-3 h-3 inline" /> {note.contact_email}</span>}
                            {note.contact_phone && <span><Phone className="w-3 h-3 inline" /> {note.contact_phone}</span>}
                          </div>
                        )}
                        {note.attachments?.length > 0 && (
                          <div className="mt-2 flex gap-2">{note.attachments.map((a, i) => <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-blue hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />{a.filename}</a>)}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDateTime(note.created_at)}</span>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteNote(note.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500"><StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No notes yet</p></div>
            )}
          </div>
        )}

        {/* Agreements Tab */}
        {activeTab === 'agreements' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Agreements & Documents</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowServiceAgreementForm(true)} className="bg-blue-600 hover:bg-blue-700" data-testid="generate-agreement-btn"><FileText className="w-4 h-4 mr-2" /> Generate Service Agreement</Button>
                <Button variant="outline" onClick={() => setShowAgreementForm(true)}><Upload className="w-4 h-4 mr-2" /> Upload Document</Button>
              </div>
            </div>

            {/* Service Agreements (generated) */}
            {serviceAgreements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Service Agreements</h3>
                <div className="space-y-2">
                  {serviceAgreements.map((sa) => (
                    <div key={sa.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50" data-testid={`service-agreement-${sa.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
                        <div>
                          <p className="font-medium">Credit Repair Outsourcing Service Agreement</p>
                          <p className="text-sm text-gray-500">${sa.rate_per_account}/account | {sa.min_accounts}-{sa.max_accounts} accounts | {sa.package_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Created: {formatDate(sa.created_at)}{sa.pdf_url ? ' | PDF stored' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${sa.status === 'active' ? 'bg-green-100 text-green-700' : sa.status === 'signed' ? 'bg-blue-100 text-blue-700' : sa.status === 'sent' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{sa.status}</span>
                        <select value={sa.status} onChange={(e) => handleUpdateAgreementStatus(sa.id, e.target.value)} className="text-xs border rounded px-2 py-1">
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="sent_for_signing">Sent for Signing</option>
                          <option value="signed">Signed</option>
                          <option value="active">Active</option>
                          <option value="terminated">Terminated</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={() => { setEsignFormData({ signer_name: partner?.contact_name || '', signer_email: partner?.contact_email || '' }); setShowEsignModal(sa.id); }} title="Send for E-Signature" data-testid={`esign-agreement-${sa.id}`}><Pen className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="outline" size="sm" onClick={() => window.open(`${API_URL}/api/admin/outsource/agreements/${sa.id}/download`, '_blank')} data-testid={`download-agreement-${sa.id}`}><Download className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner Documents (uploaded + generated) */}
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Partner Documents</h3>
            {agreements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Effective</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expires</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {agreements.map((agreement) => (
                      <tr key={agreement.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><div><p className="font-medium">{agreement.title}</p>{agreement.description && <p className="text-sm text-gray-500">{agreement.description}</p>}</div></div></td>
                        <td className="px-4 py-3 text-sm capitalize">{agreement.agreement_type?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(agreement.effective_date)}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(agreement.expiration_date)}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs font-semibold ${agreement.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{agreement.status}</span></td>
                        <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2">
                          {agreement.file_url && <Button variant="outline" size="sm" onClick={() => window.open(agreement.file_url.startsWith('/media') ? `${API_URL}${agreement.file_url}` : agreement.file_url, '_blank')} data-testid={`view-doc-${agreement.id}`}><Eye className="w-4 h-4" /></Button>}
                          {agreement.file_url && <Button variant="outline" size="sm" onClick={() => { const a = document.createElement('a'); a.href = agreement.file_url.startsWith('/media') ? `${API_URL}${agreement.file_url}` : agreement.file_url; a.download = agreement.file_name || 'document'; a.click(); }} data-testid={`download-doc-${agreement.id}`}><Download className="w-4 h-4" /></Button>}
                          <Button variant="outline" size="sm" onClick={() => handleDeleteAgreement(agreement.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No documents yet</p></div>
            )}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Current Pricing</h2>
                <Button variant="outline" onClick={() => navigate(`/admin/outsourcing/partners/edit/${partnerId}`)}><Pencil className="w-4 h-4 mr-2" /> Edit Pricing</Button>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-green-50 p-4 rounded-lg"><p className="text-sm text-green-700">Cost Per Consumer</p><p className="text-3xl font-bold text-green-800">${(partner.cost_per_consumer || 0).toFixed(2)}</p></div>
                <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-blue-700">Active Clients</p><p className="text-3xl font-bold text-blue-800">{partner.active_client_count || 0}</p></div>
                <div className="bg-purple-50 p-4 rounded-lg"><p className="text-sm text-purple-700">Billing Cycle</p><p className="text-3xl font-bold text-purple-800 capitalize">{partner.billing_cycle || 'monthly'}</p></div>
                <div className="bg-orange-50 p-4 rounded-lg"><p className="text-sm text-orange-700">Est. Monthly</p><p className="text-3xl font-bold text-orange-800">${((partner.cost_per_consumer || 0) * (partner.active_client_count || 0)).toFixed(2)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><History className="w-5 h-5 text-purple-600" /> Pricing History</h2>
              {partner.pricing_history && partner.pricing_history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cost/Consumer</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Active Clients</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {partner.pricing_history.slice().reverse().map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDateTime(entry.date)}</td>
                          <td className="px-4 py-3 text-right font-mono">${(entry.cost_per_consumer || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-mono">{entry.active_client_count || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{entry.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500"><History className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No pricing history yet</p></div>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Credits, Discounts, Coupons Section */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Credits */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Gift className="w-4 h-4 text-green-600" /> Credits</h3>
                  <Button size="sm" onClick={() => setShowCreditForm(true)}><Plus className="w-3 h-3" /></Button>
                </div>
                {credits.filter(c => c.status === 'active').length > 0 ? (
                  <div className="space-y-2">
                    {credits.filter(c => c.status === 'active').map((credit) => (
                      <div key={credit.id} className="p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{credit.credit_type === 'month_credit' ? `${credit.months} Month Credit` : credit.credit_type === 'freemium' ? 'Freemium Credit' : `$${credit.dollar_amount} Credit`}</p>
                            <p className="text-xs text-gray-500">{credit.description}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{credit.status}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Issued:</span>
                            <span className="ml-1 text-gray-700">{credit.valid_from ? new Date(credit.valid_from).toLocaleDateString() : credit.created_at ? new Date(credit.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Expires:</span>
                            <span className="ml-1 text-gray-700">{credit.valid_until ? new Date(credit.valid_until).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active credits</p>
                )}
              </div>

              {/* Discounts */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Percent className="w-4 h-4 text-blue-600" /> Discounts</h3>
                  <Button size="sm" onClick={() => setShowDiscountForm(true)}><Plus className="w-3 h-3" /></Button>
                </div>
                {discounts.filter(d => d.status === 'active').length > 0 ? (
                  <div className="space-y-2">
                    {discounts.filter(d => d.status === 'active').map((discount) => (
                      <div key={discount.id} className="p-2 bg-blue-50 rounded border border-blue-200 flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {discount.discount_type === 'percentage' && `${discount.percentage}% Off`}
                            {discount.discount_type === 'dollar_amount' && `$${discount.dollar_amount} Off`}
                            {discount.discount_type === 'per_file' && `$${discount.per_file_amount}/file`}
                          </p>
                          <p className="text-xs text-gray-500">{discount.description}</p>
                          {discount.duration_months && <p className="text-xs text-blue-600">{discount.duration_months} months</p>}
                        </div>
                        <button onClick={() => handleDeleteDiscount(discount.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active discounts</p>
                )}
              </div>

              {/* Coupons */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Ticket className="w-4 h-4 text-purple-600" /> Applied Coupons</h3>
                  <Button size="sm" onClick={() => setShowCouponForm(true)}><Plus className="w-3 h-3" /></Button>
                </div>
                {appliedCoupons.filter(c => c.status === 'active').length > 0 ? (
                  <div className="space-y-2">
                    {appliedCoupons.filter(c => c.status === 'active').map((coupon) => (
                      <div key={coupon.id} className="p-2 bg-purple-50 rounded border border-purple-200 flex justify-between items-start">
                        <div>
                          <p className="font-mono font-bold text-sm">{coupon.coupon_code}</p>
                          {coupon.months_remaining && <p className="text-xs text-purple-600">{coupon.months_remaining} months remaining</p>}
                        </div>
                        <button onClick={() => handleRemoveCoupon(coupon.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No coupons applied</p>
                )}
              </div>
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Invoice History</h2>
                <Button onClick={() => navigate(`/admin/outsourcing/invoices/new?partner=${partnerId}`)}><Plus className="w-4 h-4 mr-2" /> Create Invoice</Button>
              </div>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono font-semibold">{invoice.invoice_number}</td>
                          <td className="px-4 py-3">{formatDate(invoice.invoice_date)}</td>
                          <td className="px-4 py-3">{formatDate(invoice.due_date)}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">${(invoice.total_amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{invoice.status}</span></td>
                          <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => navigate(`/admin/outsourcing/invoices/${invoice.id}`)}><Eye className="w-4 h-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500"><Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No invoices yet</p></div>
              )}
            </div>
          </div>
        )}

        {/* Work Logs Tab */}
        {activeTab === 'work-logs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Work Log History</h2>
              <Button onClick={() => { setEditingWorkLog(null); setShowWorkLogForm(true); }}><Plus className="w-4 h-4 mr-2" /> Add Work Log</Button>
            </div>
            {showWorkLogForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-4">{editingWorkLog ? 'Edit Work Log' : 'Add Work Log Entry'}</h3>
                <form onSubmit={handleSaveWorkLog} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div><Label>Date</Label><Input type="date" value={workLogForm.work_date} onChange={(e) => setWorkLogForm({...workLogForm, work_date: e.target.value})} className="mt-1" /></div>
                    <div><Label>Disputes Processed</Label><Input type="number" min="0" value={workLogForm.disputes_processed} onChange={(e) => setWorkLogForm({...workLogForm, disputes_processed: parseInt(e.target.value) || 0})} className="mt-1" /></div>
                    <div><Label>Letters Sent</Label><Input type="number" min="0" value={workLogForm.letters_sent} onChange={(e) => setWorkLogForm({...workLogForm, letters_sent: parseInt(e.target.value) || 0})} className="mt-1" /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={workLogForm.description} onChange={(e) => setWorkLogForm({...workLogForm, description: e.target.value})} rows={2} className="mt-1" /></div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingWorkLog ? 'Update' : 'Save'}</Button>
                    <Button type="button" variant="outline" onClick={() => { setShowWorkLogForm(false); setEditingWorkLog(null); }}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}
            {workLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Disputes</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Letters</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {workLogs.map((log) => (
                      <tr key={log.id} className={`hover:bg-gray-50 ${log.is_archived ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{formatDate(log.work_date)}{log.is_archived && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">Archived</span>}</div></td>
                        <td className="px-4 py-3 text-center font-semibold text-primary-blue">{log.disputes_processed || 0}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{log.letters_sent || 0}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{log.description || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => setShowWorkLogDetail(log)} title="Open"><Eye className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => openEditWorkLog(log)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleArchiveWorkLog(log.id)} title={log.is_archived ? 'Unarchive' : 'Archive'}>{log.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}</Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteWorkLog(log.id)} title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500"><ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No work logs yet</p></div>
            )}
          </div>
        )}

        {/* Escalations Tab */}
        {activeTab === 'escalations' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Escalation Tickets</h2>
              <Button onClick={() => setShowTicketForm(true)} className="bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Create Ticket</Button>
            </div>
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-gray-500">{ticket.ticket_number}</span>
                          {getTicketStatusBadge(ticket.status)}
                          {getUrgencyBadge(ticket.urgency)}
                        </div>
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500 mt-1">{ticket.notes}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span><User className="w-4 h-4 inline" /> {ticket.contact_name}</span>
                          <span><MessageSquare className="w-4 h-4 inline" /> {ticket.communication_method}</span>
                          <span><Clock className="w-4 h-4 inline" /> {ticket.response_time_hours}h</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{ticket.submitted_by_name}</p>
                        <p>{formatDateTime(ticket.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500"><AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No escalation tickets</p></div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Create Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Escalation Ticket</h2>
                <button onClick={() => setShowTicketForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div><Label>Category *</Label><select value={ticketForm.category_id} onChange={(e) => setTicketForm({...ticketForm, category_id: e.target.value})} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"><option value="">Select Category...</option>{ticketCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                <div><Label>Subject *</Label><Input value={ticketForm.subject} onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})} required className="mt-1" /></div>
                <div><Label>Notes *</Label><Textarea value={ticketForm.notes} onChange={(e) => setTicketForm({...ticketForm, notes: e.target.value})} required rows={4} className="mt-1" /></div>
                <div><Label>Person Spoken To *</Label><Input value={ticketForm.contact_name} onChange={(e) => setTicketForm({...ticketForm, contact_name: e.target.value})} required className="mt-1" /></div>
                <div><Label>Communication Method *</Label><div className="flex gap-4 mt-2">{['phone', 'email', 'text'].map((method) => <label key={method} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="comm_method" value={method} checked={ticketForm.communication_method === method} onChange={(e) => setTicketForm({...ticketForm, communication_method: e.target.value})} className="text-primary-blue" /><span className="capitalize">{method}</span></label>)}</div></div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setShowTicketForm(false)}>Cancel</Button><Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">Create Ticket</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Note</h2>
                <button onClick={() => setShowNoteForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div><Label>Title *</Label><Input value={noteForm.title} onChange={(e) => setNoteForm({...noteForm, title: e.target.value})} required className="mt-1" /></div>
                <div><Label>Category *</Label><select value={noteForm.category} onChange={(e) => setNoteForm({...noteForm, category: e.target.value})} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"><option value="">Select Category...</option>{noteCategories.map(cat => <option key={cat.id} value={cat.name.toLowerCase().replace(' ', '_')}>{cat.name}</option>)}</select></div>
                <div><Label>Source Type *</Label><select value={noteForm.source_type} onChange={(e) => setNoteForm({...noteForm, source_type: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"><option value="phone">Phone Call</option><option value="email">Email</option><option value="text">Text Message</option><option value="internal_update">Internal Update</option><option value="file_processing">File Processing</option></select></div>
                {noteForm.source_type === 'email' && <div><Label>Sender Email *</Label><Input type="email" value={noteForm.contact_email} onChange={(e) => setNoteForm({...noteForm, contact_email: e.target.value})} required className="mt-1" /></div>}
                {(noteForm.source_type === 'phone' || noteForm.source_type === 'text') && (<><div><Label>Contact Name *</Label><Input value={noteForm.contact_name} onChange={(e) => setNoteForm({...noteForm, contact_name: e.target.value})} required className="mt-1" /></div><div><Label>Phone Number *</Label><Input value={noteForm.contact_phone} onChange={(e) => setNoteForm({...noteForm, contact_phone: e.target.value})} required className="mt-1" /></div></>)}
                <div><Label>Notes *</Label><Textarea value={noteForm.content} onChange={(e) => setNoteForm({...noteForm, content: e.target.value})} required rows={4} className="mt-1" /></div>
                <div><Label>Attachments (URLs, comma separated)</Label><Input placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf" onChange={(e) => setNoteForm({...noteForm, attachments: e.target.value.split(',').filter(u => u.trim()).map(u => ({filename: u.trim().split('/').pop(), url: u.trim()}))})} className="mt-1" /></div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setShowNoteForm(false)}>Cancel</Button><Button type="submit" className="flex-1">Save Note</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Agreement Modal */}
      {showAgreementForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload Agreement</h2>
                <button onClick={() => setShowAgreementForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateAgreement} className="space-y-4">
                <div><Label>Title *</Label><Input value={agreementForm.title} onChange={(e) => setAgreementForm({...agreementForm, title: e.target.value})} required className="mt-1" /></div>
                <div><Label>Description</Label><Textarea value={agreementForm.description} onChange={(e) => setAgreementForm({...agreementForm, description: e.target.value})} rows={2} className="mt-1" /></div>
                <div><Label>Agreement Type *</Label><select value={agreementForm.agreement_type} onChange={(e) => setAgreementForm({...agreementForm, agreement_type: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"><option value="service_agreement">Service Agreement</option><option value="nda">NDA</option><option value="amendment">Amendment</option><option value="addendum">Addendum</option><option value="other">Other</option></select></div>
                <div><Label>File URL *</Label><Input value={agreementForm.file_url} onChange={(e) => setAgreementForm({...agreementForm, file_url: e.target.value, file_name: e.target.value.split('/').pop()})} required placeholder="https://example.com/agreement.pdf" className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Effective Date</Label><Input type="date" value={agreementForm.effective_date} onChange={(e) => setAgreementForm({...agreementForm, effective_date: e.target.value})} className="mt-1" /></div>
                  <div><Label>Expiration Date</Label><Input type="date" value={agreementForm.expiration_date} onChange={(e) => setAgreementForm({...agreementForm, expiration_date: e.target.value})} className="mt-1" /></div>
                </div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setShowAgreementForm(false)}>Cancel</Button><Button type="submit" className="flex-1">Upload Agreement</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Credit Modal */}
      {showCreditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Credit</h2>
                <button onClick={() => setShowCreditForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateCredit} className="space-y-4">
                <div><Label>Credit Type *</Label><select value={creditForm.credit_type} onChange={(e) => setCreditForm({...creditForm, credit_type: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"><option value="month_credit">Month Credit</option><option value="dollar_credit">Dollar Credit</option><option value="freemium">Freemium</option></select></div>
                {creditForm.credit_type === 'month_credit' && <div><Label>Number of Months *</Label><Input type="number" min="1" value={creditForm.months} onChange={(e) => setCreditForm({...creditForm, months: parseInt(e.target.value) || 1})} className="mt-1" /></div>}
                {creditForm.credit_type === 'dollar_credit' && <div><Label>Dollar Amount *</Label><Input type="number" min="0" step="0.01" value={creditForm.dollar_amount} onChange={(e) => setCreditForm({...creditForm, dollar_amount: parseFloat(e.target.value) || 0})} className="mt-1" /></div>}
                <div><Label>Description *</Label><Textarea value={creditForm.description} onChange={(e) => setCreditForm({...creditForm, description: e.target.value})} required rows={2} placeholder="Reason for credit..." className="mt-1" /></div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreditForm(false)}>Cancel</Button><Button type="submit" className="flex-1">Add Credit</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Discount Modal */}
      {showDiscountForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Discount</h2>
                <button onClick={() => setShowDiscountForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateDiscount} className="space-y-4">
                <div><Label>Discount Type *</Label><select value={discountForm.discount_type} onChange={(e) => setDiscountForm({...discountForm, discount_type: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"><option value="percentage">Percentage Off</option><option value="dollar_amount">Dollar Amount Off</option><option value="per_file">Per File Discount</option></select></div>
                {discountForm.discount_type === 'percentage' && <div><Label>Percentage (%) *</Label><Input type="number" min="0" max="100" value={discountForm.percentage} onChange={(e) => setDiscountForm({...discountForm, percentage: parseFloat(e.target.value) || 0})} className="mt-1" /></div>}
                {discountForm.discount_type === 'dollar_amount' && <div><Label>Dollar Amount ($) *</Label><Input type="number" min="0" step="0.01" value={discountForm.dollar_amount} onChange={(e) => setDiscountForm({...discountForm, dollar_amount: parseFloat(e.target.value) || 0})} className="mt-1" /></div>}
                {discountForm.discount_type === 'per_file' && <div><Label>Amount Per File ($) *</Label><Input type="number" min="0" step="0.01" value={discountForm.per_file_amount} onChange={(e) => setDiscountForm({...discountForm, per_file_amount: parseFloat(e.target.value) || 0})} className="mt-1" /></div>}
                <div><Label>Duration (Months)</Label><Input type="number" min="1" value={discountForm.duration_months} onChange={(e) => setDiscountForm({...discountForm, duration_months: parseInt(e.target.value) || 1})} className="mt-1" /></div>
                <div><Label>Description *</Label><Textarea value={discountForm.description} onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})} required rows={2} placeholder="Reason for discount..." className="mt-1" /></div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setShowDiscountForm(false)}>Cancel</Button><Button type="submit" className="flex-1">Add Discount</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Apply Coupon Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Apply Coupon</h2>
                <button onClick={() => setShowCouponForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleApplyCoupon} className="space-y-4">
                <div><Label>Coupon Code *</Label><Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} required placeholder="Enter coupon code" className="mt-1 uppercase" /></div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setShowCouponForm(false)}>Cancel</Button><Button type="submit" className="flex-1">Apply Coupon</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Service Agreement Modal */}
      {showServiceAgreementForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900" data-testid="generate-agreement-modal-title">Generate Service Agreement</h2>
                <button onClick={() => setShowServiceAgreementForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleGenerateServiceAgreement} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-800">Credit Repair Outsourcing Service Agreement</p>
                  <p className="text-xs text-blue-600 mt-1">This will generate a professional PDF agreement with the pricing details below.</p>
                </div>
                <div>
                  <Label>Package Name *</Label>
                  <select value={serviceAgreementFormData.package_name} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, package_name: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg" data-testid="agreement-package-name">
                    <option value="Bureau Letters Only - Variable Volume">Bureau Letters Only - Variable Volume</option>
                    <option value="Full Service - Variable Volume">Full Service - Variable Volume</option>
                    <option value="Custom Package">Custom Package</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rate Per Account ($) *</Label>
                    <Input type="number" min="0" step="0.01" value={serviceAgreementFormData.rate_per_account} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, rate_per_account: parseFloat(e.target.value) || 0})} className="mt-1" data-testid="agreement-rate-per-account" />
                  </div>
                  <div>
                    <Label>Provider Name</Label>
                    <Input value={serviceAgreementFormData.provider_name} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, provider_name: e.target.value})} className="mt-1" data-testid="agreement-provider-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Accounts *</Label>
                    <Input type="number" min="1" value={serviceAgreementFormData.min_accounts} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, min_accounts: parseInt(e.target.value) || 1})} className="mt-1" data-testid="agreement-min-accounts" />
                  </div>
                  <div>
                    <Label>Max Accounts *</Label>
                    <Input type="number" min="1" value={serviceAgreementFormData.max_accounts} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, max_accounts: parseInt(e.target.value) || 1})} className="mt-1" data-testid="agreement-max-accounts" />
                  </div>
                </div>
                <div>
                  <Label>Provider Address</Label>
                  <Input value={serviceAgreementFormData.provider_address} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, provider_address: e.target.value})} placeholder="123 Main St, City, State ZIP" className="mt-1" data-testid="agreement-provider-address" />
                </div>
                <div>
                  <Label>Additional Terms</Label>
                  <Textarea value={serviceAgreementFormData.additional_terms} onChange={(e) => setServiceAgreementFormData({...serviceAgreementFormData, additional_terms: e.target.value})} rows={3} placeholder="Any additional terms or conditions..." className="mt-1" data-testid="agreement-additional-terms" />
                </div>

                {/* Pricing Preview */}
                <div className="bg-gray-50 border rounded-lg p-4 space-y-2" data-testid="agreement-pricing-preview">
                  <h4 className="text-sm font-semibold text-gray-700">Pricing Preview</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate per account:</span>
                    <span className="font-semibold">${serviceAgreementFormData.rate_per_account.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account range:</span>
                    <span className="font-semibold">{serviceAgreementFormData.min_accounts} - {serviceAgreementFormData.max_accounts} accounts</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly min:</span>
                      <span className="font-bold text-green-700">${(serviceAgreementFormData.min_accounts * serviceAgreementFormData.rate_per_account).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly max:</span>
                      <span className="font-bold text-green-700">${(serviceAgreementFormData.max_accounts * serviceAgreementFormData.rate_per_account).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowServiceAgreementForm(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={generatingAgreement} data-testid="submit-generate-agreement">
                    {generatingAgreement ? 'Generating...' : 'Generate Agreement PDF'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Send Modal */}
      {showEsignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900" data-testid="esign-modal-title">Send for E-Signature</h2>
                <button onClick={() => setShowEsignModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Enter the signer's details. They will receive a unique link to review and sign the agreement electronically.</p>
              <form onSubmit={handleSendForEsign} className="space-y-4">
                <div>
                  <Label>Signer Name *</Label>
                  <Input value={esignFormData.signer_name} onChange={(e) => setEsignFormData({...esignFormData, signer_name: e.target.value})} required placeholder="Full legal name" className="mt-1" data-testid="esign-signer-name" />
                </div>
                <div>
                  <Label>Signer Email *</Label>
                  <Input type="email" value={esignFormData.signer_email} onChange={(e) => setEsignFormData({...esignFormData, signer_email: e.target.value})} required placeholder="email@company.com" className="mt-1" data-testid="esign-signer-email" />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                  A unique signing link will be generated and copied to your clipboard. The link expires in 30 days.
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEsignModal(null)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={sendingEsign} data-testid="submit-esign-btn">
                    {sendingEsign ? 'Sending...' : 'Send for Signature'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Work Log Detail Modal */}
      {showWorkLogDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Work Log Details</h2>
                <button onClick={() => setShowWorkLogDetail(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div><Label className="text-gray-500">Date</Label><p className="font-medium">{formatDate(showWorkLogDetail.work_date)}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Disputes Processed</Label><p className="text-2xl font-bold text-primary-blue">{showWorkLogDetail.disputes_processed || 0}</p></div>
                  <div><Label className="text-gray-500">Letters Sent</Label><p className="text-2xl font-bold text-green-600">{showWorkLogDetail.letters_sent || 0}</p></div>
                </div>
                {showWorkLogDetail.description && <div><Label className="text-gray-500">Description</Label><p className="mt-1">{showWorkLogDetail.description}</p></div>}
                <div><Label className="text-gray-500">Created</Label><p className="text-sm">{formatDateTime(showWorkLogDetail.created_at)}</p></div>
                {showWorkLogDetail.is_archived && <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-sm text-yellow-800">This work log is archived</p></div>}
              </div>
              <div className="flex gap-3 pt-6"><Button variant="outline" className="flex-1" onClick={() => setShowWorkLogDetail(null)}>Close</Button><Button className="flex-1" onClick={() => { openEditWorkLog(showWorkLogDetail); setShowWorkLogDetail(null); }}>Edit</Button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutsourcePartnerProfile;
