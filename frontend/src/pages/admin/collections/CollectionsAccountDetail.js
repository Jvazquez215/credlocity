import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, Phone, MessageSquare, Mail, CheckCircle, Clock, DollarSign,
  AlertTriangle, User, FileText, Plus, CreditCard, Percent, Calendar
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Tier configuration based on Collections Handbook
const TIER_CONFIG = {
  1: {
    label: 'Level 1',
    days: '30-45 Days',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    approval: 'Agent Approval',
    fullPayDiscount: 0,
    planDiscount: 0,
    minDownPercent: 50,
    maxMonths: 2,
    commission: { full: 5, plan: 5, bonus48hr: 1 }
  },
  2: {
    label: 'Level 2',
    days: '46-60 Days',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    approval: 'Team Lead Approval',
    fullPayDiscount: 15,
    planDiscount: 0,
    minDownPercent: 40,
    maxMonths: 3,
    commission: { full: 12, plan: 6 }
  },
  3: {
    label: 'Level 3',
    days: '61-90 Days',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    approval: 'Collections Manager',
    fullPayDiscount: 25,
    fullPayTimeLimit: '48 hours',
    planDiscount: 10,
    minDownPercent: 40,
    maxMonths: 6,
    commission: { full: 20, plan: 10 }
  },
  4: {
    label: 'Level 4',
    days: '90+ Days',
    color: 'bg-red-100 text-red-700 border-red-300',
    approval: 'Director of Collections',
    fullPayDiscount: 35,
    fullPayTimeLimit: '24 hours',
    planDiscount: 20,
    minDownPercent: 50,
    maxMonths: 6,
    commission: { full: 30, plan: 15 }
  }
};

import Dialpad from './Dialpad';

export default function CollectionsAccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactModal, setContactModal] = useState({ open: false, type: null });
  const [noteModal, setNoteModal] = useState(false);
  const [smsModal, setSmsModal] = useState(false);
  const [dialpadOpen, setDialpadOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [noteText, setNoteText] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        setSelectedTier(data.current_tier);
      } else {
        toast.error('Account not found');
        navigate('/admin/collections/accounts');
      }
    } catch (error) {
      console.error('Failed to fetch account:', error);
      toast.error('Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogContact = async () => {
    if (outcome.length < 10) {
      toast.error('Outcome must be at least 10 characters');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${accountId}/contacts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_type: contactModal.type, outcome })
      });
      if (res.ok) {
        toast.success(`${contactModal.type.charAt(0).toUpperCase() + contactModal.type.slice(1)} logged!`);
        setContactModal({ open: false, type: null });
        setOutcome('');
        fetchAccount();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to log contact');
      }
    } catch (error) {
      toast.error('Failed to log contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeCall = async () => {
    // Confirm before calling
    if (!window.confirm(`📞 Initiate call to ${account.client_phone}?\n\nYour phone will ring and connect you to ${account.client_name}.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      toast.loading('Initiating call via Google Voice...', { id: 'call' });
      
      const res = await fetch(`${API_URL}/api/collections/call`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId, phone_number: account.client_phone })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.call_initiated) {
          toast.success('📞 Call initiated! Your phone will ring shortly.', { id: 'call' });
        } else {
          toast.info('📝 Call logged. Please dial manually: ' + account.client_phone, { id: 'call' });
        }
        // Open modal to log the outcome
        setContactModal({ open: true, type: 'call' });
        fetchAccount();
      } else {
        toast.error(data.detail || 'Failed to initiate call', { id: 'call' });
      }
    } catch (error) {
      toast.error('Failed to initiate call', { id: 'call' });
    }
  };

  const handleSendSMS = async () => {
    if (smsMessage.length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/sms`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId, phone_number: account.client_phone, message: smsMessage })
      });
      if (res.ok) {
        toast.success('SMS sent successfully!');
        setSmsModal(false);
        setSmsMessage('');
        fetchAccount();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to send SMS');
      }
    } catch (error) {
      toast.error('Failed to send SMS');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${accountId}/notes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: noteText, note_type: 'manual' })
      });
      if (res.ok) {
        toast.success('Note added!');
        setNoteModal(false);
        setNoteText('');
        fetchAccount();
      }
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDisputed = async () => {
    if (!window.confirm('Mark this account as disputed? A dispute ticket will be created.')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${accountId}/dispute`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Account marked as disputed');
        fetchAccount();
      }
    } catch (error) {
      toast.error('Failed to mark as disputed');
    }
  };

  // Calculate fee breakdown for each tier
  const calculateTierBreakdown = (tierNum) => {
    if (!account) return null;
    const tier = TIER_CONFIG[tierNum];
    const balance = account.past_due_balance || 0;
    const monthsOverdue = Math.ceil(account.days_past_due / 30);
    
    // Non-waivable fees
    const creditReportFee = 199.80; // 3B Credit Reports
    const servicesRendered = monthsOverdue * account.monthly_rate; // Months of service
    
    // Waivable fees (can be adjusted by agent)
    const lateFees = balance * 0.10; // 10% late fees
    const collectionFee = balance * 0.15; // 15% collection fee (agent can waive)
    const fileProcessingFee = 35.00;
    
    const totalOriginal = creditReportFee + servicesRendered + lateFees + collectionFee + fileProcessingFee;
    
    // Apply tier discount
    const fullPayDiscount = tier.fullPayDiscount / 100;
    const planDiscount = tier.planDiscount / 100;
    
    const fullPayAmount = totalOriginal * (1 - fullPayDiscount);
    const planAmount = totalOriginal * (1 - planDiscount);
    
    // Commission calculations
    const fullPayCommission = fullPayAmount * (tier.commission.full / 100);
    const planCommission = planAmount * (tier.commission.plan / 100);
    
    return {
      tier,
      creditReportFee,
      servicesRendered,
      lateFees,
      collectionFee,
      fileProcessingFee,
      totalOriginal,
      fullPayDiscount: tier.fullPayDiscount,
      planDiscount: tier.planDiscount,
      fullPayAmount,
      planAmount,
      minDownPayment: planAmount * (tier.minDownPercent / 100),
      maxMonths: tier.maxMonths,
      fullPayCommission,
      planCommission,
      bonus48hr: tier.commission.bonus48hr ? fullPayAmount * (tier.commission.bonus48hr / 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
      </div>
    );
  }

  if (!account) return null;

  const currentTier = TIER_CONFIG[account.current_tier];
  const compliance = account.today_compliance || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/collections/accounts">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.client_name}</h1>
            <p className="text-gray-500">{account.client_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={currentTier?.color}>{currentTier?.label} ({account.days_past_due} days)</Badge>
          <Badge className={account.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
            {account.account_status}
          </Badge>
        </div>
      </div>

      {/* Top Row: Client Info + Compliance */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-gray-400" />Client Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-gray-500 text-xs">Phone</Label><p className="font-medium">{account.client_phone}</p></div>
            <div><Label className="text-gray-500 text-xs">Address</Label><p>{account.client_address}</p><p>{account.client_city}, {account.client_state} {account.client_zip}</p></div>
            <div><Label className="text-gray-500 text-xs">Package</Label><p className="capitalize">{account.package_type} - ${account.monthly_rate}/mo</p></div>
            <div><Label className="text-gray-500 text-xs">Assigned Rep</Label><p>{account.assigned_rep_name || 'Unassigned'}</p></div>
          </CardContent>
        </Card>

        {/* Balance Overview */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-gray-400" />Account Balance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">${account.past_due_balance?.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{account.days_past_due} days past due</p>
              <p className="text-xs text-gray-400">First failed: {account.first_failed_payment_date}</p>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50">
              <p className="text-xs text-gray-400 mb-1">Current Settlement Level</p>
              <p className="font-semibold">{currentTier?.label} - {currentTier?.approval}</p>
            </div>
            {account.account_status !== 'disputed' && (
              <Button variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50" onClick={handleMarkDisputed}>
                <AlertTriangle className="w-4 h-4 mr-2" />Mark as Disputed
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Today's Compliance + Google Voice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />Today&apos;s Compliance
            </CardTitle>
            <p className="text-xs text-gray-500">📞 Powered by Google Voice</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setDialpadOpen(true)} 
                disabled={compliance.calls_completed >= 3}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  compliance.calls_completed >= 3 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'hover:border-green-500 hover:bg-green-50 border-gray-200'
                }`}
              >
                <Phone className={`w-6 h-6 ${compliance.calls_completed >= 3 ? '' : 'text-green-600'}`} />
                <span className="text-xs font-semibold">CALL</span>
                <span className="text-xs font-medium">{compliance.calls_completed || 0}/3</span>
              </button>
              <button 
                onClick={() => setDialpadOpen(true)} 
                disabled={compliance.texts_completed >= 3}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  compliance.texts_completed >= 3 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'hover:border-purple-500 hover:bg-purple-50 border-gray-200'
                }`}
              >
                <MessageSquare className={`w-6 h-6 ${compliance.texts_completed >= 3 ? '' : 'text-purple-600'}`} />
                <span className="text-xs font-semibold">TEXT</span>
                <span className="text-xs font-medium">{compliance.texts_completed || 0}/3</span>
              </button>
              <button 
                onClick={() => setContactModal({ open: true, type: 'email' })} 
                disabled={compliance.emails_completed >= 3}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  compliance.emails_completed >= 3 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'hover:border-blue-500 hover:bg-blue-50 border-gray-200'
                }`}
              >
                <Mail className={`w-6 h-6 ${compliance.emails_completed >= 3 ? '' : 'text-blue-600'}`} />
                <span className="text-xs font-semibold">EMAIL</span>
                <span className="text-xs font-medium">{compliance.emails_completed || 0}/3</span>
              </button>
            </div>
            
            {/* Compliance Status */}
            <div className={`p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
              compliance.compliance_met 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {compliance.compliance_met 
                ? <><CheckCircle className="w-4 h-4" /> ✅ Compliance Met!</> 
                : <><Clock className="w-4 h-4" /> 9 contacts needed (3 calls + 3 texts + 3 emails)</>
              }
            </div>
            
            {/* Phone Number Display */}
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Client Phone</p>
              <p className="text-lg font-bold">{account.client_phone}</p>
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => setNoteModal(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Manual Note
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Options - ALL 3 TIERS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-gray-400" />
            Settlement Options
          </CardTitle>
          <p className="text-sm text-gray-500">Present all available settlement levels to the client. Current tier: {currentTier?.label}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(tierNum => {
              const breakdown = calculateTierBreakdown(tierNum);
              if (!breakdown) return null;
              const isCurrentTier = tierNum === account.current_tier;
              const tier = breakdown.tier;
              
              return (
                <div 
                  key={tierNum}
                  className={`p-4 rounded-lg border-2 ${isCurrentTier ? tier.color + ' border-2' : 'border-gray-200'} ${selectedTier === tierNum ? 'ring-2 ring-primary-blue' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={tier.color}>{tier.label}</Badge>
                    {isCurrentTier && <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded">CURRENT</span>}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">{tier.days} Past Due</p>
                  <p className="text-xs text-gray-600 mb-3">{tier.approval}</p>
                  
                  {/* Full Pay Option */}
                  <div className="p-2 bg-white rounded border mb-2">
                    <p className="text-xs font-semibold text-gray-700">Full Pay Option</p>
                    {tier.fullPayDiscount > 0 ? (
                      <>
                        <p className="text-lg font-bold text-green-600">${breakdown.fullPayAmount.toFixed(2)}</p>
                        <p className="text-xs text-green-600">-{tier.fullPayDiscount}% discount</p>
                        {tier.fullPayTimeLimit && <p className="text-xs text-orange-600">Must pay within {tier.fullPayTimeLimit}</p>}
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold">${breakdown.totalOriginal.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">No discount at this level</p>
                      </>
                    )}
                    <p className="text-xs text-blue-600 mt-1">Commission: ${breakdown.fullPayCommission.toFixed(2)} ({tier.commission.full}%)</p>
                    {breakdown.bonus48hr > 0 && <p className="text-xs text-purple-600">+${breakdown.bonus48hr.toFixed(2)} if paid within 48hr</p>}
                  </div>
                  
                  {/* Payment Plan Option */}
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs font-semibold text-gray-700">Payment Plan</p>
                    <p className="text-lg font-bold">${breakdown.planAmount.toFixed(2)}</p>
                    {tier.planDiscount > 0 && <p className="text-xs text-green-600">-{tier.planDiscount}% discount</p>}
                    <p className="text-xs text-gray-600">Min down: ${breakdown.minDownPayment.toFixed(2)} ({tier.minDownPercent}%)</p>
                    <p className="text-xs text-gray-600">Max {tier.maxMonths} months</p>
                    <p className="text-xs text-blue-600 mt-1">Commission: {tier.commission.plan}% of collected</p>
                  </div>
                  
                  <Link to={`/admin/collections/accounts/${accountId}/payment-plan?tier=${tierNum}`}>
                    <Button className="w-full mt-3 bg-primary-blue hover:bg-primary-blue/90" size="sm">
                      <CreditCard className="w-3 h-3 mr-1" /> Select {tier.label}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          
          {/* Fee Breakdown Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Fee Breakdown (for current balance)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div><span className="text-gray-500">3B Credit Reports:</span><br/><span className="font-medium">$199.80</span></div>
              <div><span className="text-gray-500">Services Rendered:</span><br/><span className="font-medium">${(Math.ceil(account.days_past_due / 30) * account.monthly_rate).toFixed(2)}</span></div>
              <div><span className="text-gray-500">Late Fees (10%):</span><br/><span className="font-medium">${(account.past_due_balance * 0.10).toFixed(2)}</span></div>
              <div><span className="text-gray-500">Collection Fee (15%):</span><br/><span className="font-medium text-orange-600">${(account.past_due_balance * 0.15).toFixed(2)} <span className="text-xs">(waivable)</span></span></div>
              <div><span className="text-gray-500">File Processing:</span><br/><span className="font-medium">$35.00</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" />Account Notes ({account.notes?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {account.notes?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {account.notes.map((note, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 ${note.note_type === 'system' ? 'bg-blue-50 border-blue-500' : note.note_type === 'auto_compliance' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{note.created_by_name || 'System'} • {new Date(note.created_at).toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs">{note.note_type}</Badge>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No notes yet</p>
          )}
        </CardContent>
      </Card>

      {/* Contact Log Modal */}
      <Dialog open={contactModal.open} onOpenChange={(o) => { if (!o) { setContactModal({ open: false, type: null }); setOutcome(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {contactModal.type === 'call' && <Phone className="w-5 h-5 text-green-600" />}
              {contactModal.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
              {contactModal.type === 'text' && <MessageSquare className="w-5 h-5 text-purple-600" />}
              Log {contactModal.type?.charAt(0).toUpperCase() + contactModal.type?.slice(1)} Contact
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600"><strong>Client:</strong> {account?.client_name}</p>
              <p className="text-sm text-gray-600"><strong>Phone:</strong> {account?.client_phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Outcome/Notes <span className="text-red-500">*</span></Label>
              <p className="text-xs text-gray-500 mb-2">Describe the outcome of this contact (minimum 10 characters)</p>
              <Textarea 
                value={outcome} 
                onChange={(e) => setOutcome(e.target.value)} 
                placeholder="e.g., Left voicemail message, Client answered - will pay Friday, No answer..."
                className="mt-1 min-h-[120px] border-gray-300 focus:border-primary-blue focus:ring-primary-blue"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey && outcome.length >= 10) handleLogContact(); }}
              />
              <p className={`text-xs mt-1 ${outcome.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                {outcome.length}/10 minimum characters {outcome.length >= 10 && '✓'}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setContactModal({ open: false, type: null }); setOutcome(''); }}>Cancel</Button>
            <Button 
              onClick={handleLogContact} 
              disabled={submitting || outcome.length < 10}
              className={outcome.length >= 10 ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {submitting ? 'Logging...' : 'Log Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Modal with Google Voice Integration */}
      <Dialog open={smsModal} onOpenChange={(o) => { if (!o) { setSmsModal(false); setSmsMessage(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Send SMS via Google Voice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-700">📱 Sending to: {account?.client_phone}</p>
              <p className="text-sm text-purple-600">{account?.client_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Message <span className="text-red-500">*</span></Label>
              <Textarea 
                value={smsMessage} 
                onChange={(e) => setSmsMessage(e.target.value.slice(0, 480))} 
                placeholder="Type your message... (min 10 characters)"
                className="mt-2 min-h-[140px] border-gray-300 focus:border-purple-500"
              />
              <div className="flex justify-between mt-2 text-xs">
                <span className={smsMessage.length >= 10 ? 'text-green-600' : 'text-gray-400'}>
                  {smsMessage.length}/10 min {smsMessage.length >= 10 && '✓'}
                </span>
                <span className="text-gray-500">
                  {smsMessage.length}/480 chars • {Math.ceil(smsMessage.length / 160) || 1} SMS segment(s)
                </span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <p>💡 <strong>Quick templates:</strong></p>
              <div className="flex flex-wrap gap-1 mt-2">
                <button className="px-2 py-1 bg-white border rounded hover:bg-gray-100" onClick={() => setSmsMessage('Hi, this is Credlocity Collections. Please call us back at your earliest convenience regarding your account.')}>Payment Reminder</button>
                <button className="px-2 py-1 bg-white border rounded hover:bg-gray-100" onClick={() => setSmsMessage('Hi, we tried to reach you today. Please contact Credlocity Collections at your earliest convenience.')}>Callback Request</button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setSmsModal(false); setSmsMessage(''); }}>Cancel</Button>
            <Button 
              onClick={handleSendSMS} 
              disabled={submitting || smsMessage.length < 10}
              className={smsMessage.length >= 10 ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {submitting ? 'Sending...' : '📤 Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={noteModal} onOpenChange={setNoteModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note about this account..." className="min-h-[100px]" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteModal(false)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={submitting}>{submitting ? 'Adding...' : 'Add Note'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Voice Dialpad */}
      <Dialpad 
        isOpen={dialpadOpen}
        onClose={() => setDialpadOpen(false)}
        initialNumber={account?.client_phone || ''}
        accountId={accountId}
        clientName={account?.client_name}
        onCallComplete={(result) => {
          // Refresh the account to update compliance counts
          fetchAccount();
          if (result.success) {
            // Open contact log modal after successful call/sms
            setContactModal({ open: true, type: result.type });
          }
        }}
      />
    </div>
  );
}
