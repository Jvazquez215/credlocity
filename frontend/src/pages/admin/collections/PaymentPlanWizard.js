import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, DollarSign, Calculator,
  CreditCard, FileText, Calendar, AlertCircle, Percent, Lock, Unlock, ShieldCheck
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Tier configuration per Credlocity Waiver Rules
// Tier 1 = Maximum Authority (Escalation/Risk Resolution)
// Tier 2 = Standard Collections  
// Tier 3 = Limited Authority
const TIER_CONFIG = {
  1: { 
    label: 'Tier 1', 
    name: 'Escalation / Risk Resolution',
    color: 'bg-green-100 text-green-700 border-green-300', 
    approval: 'supervisor',
    fullPayDiscount: 35, 
    planDiscount: 20,
    minDownPercent: 50, 
    maxMonths: 6, 
    commission: { full: 30, plan: 15, downPayment: 5, monthly: 3, completion: 2 }
  },
  2: { 
    label: 'Tier 2', 
    name: 'Standard Collections',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
    approval: 'supervisor',
    fullPayDiscount: 25, 
    planDiscount: 10,
    minDownPercent: 40, 
    maxMonths: 6, 
    commission: { full: 20, plan: 10, downPayment: 5, monthly: 3, completion: 2 }
  },
  3: { 
    label: 'Tier 3', 
    name: 'Limited Authority',
    color: 'bg-red-100 text-red-700 border-red-300', 
    approval: 'collections_manager',
    fullPayDiscount: 15, 
    planDiscount: 0,
    minDownPercent: 40, 
    maxMonths: 3, 
    commission: { full: 12, plan: 6, downPayment: 5, monthly: 3, completion: 2 }
  }
};

// Waiver rules per Tier and Customer Type
const WAIVER_RULES = {
  // Payment Plan rules
  plan: {
    3: { // Tier 3 - Payment Plan
      collection_fee: { enabled: true, approval: 'auto', max_percent: 100 },
      payment_processing: { enabled: true, approval: 'auto', max_percent: 50 },
      file_processing: { enabled: true, approval: 'supervisor', max_percent: 100, min_collect: 75 },
      conditional_credit: { enabled: false }
    },
    2: { // Tier 2 - Payment Plan
      collection_fee: { enabled: true, approval: 'auto', max_percent: 100 },
      payment_processing: { enabled: true, approval: 'auto', max_percent: 100 },
      file_processing: { enabled: true, approval: 'supervisor', max_percent: 50 },
      conditional_credit: { enabled: false }
    },
    1: { // Tier 1 - Payment Plan (Maximum Authority)
      collection_fee: { enabled: true, approval: 'auto', max_percent: 100 },
      payment_processing: { enabled: true, approval: 'auto', max_percent: 100 },
      file_processing: { enabled: true, approval: 'supervisor', max_percent: 100 },
      conditional_credit: { enabled: true, approval: 'compliance', label: 'Earned Credit (Post-Performance)' }
    }
  },
  // Pay-In-Full rules (Higher Authority)
  full: {
    3: { // Tier 3 - PIF
      collection_fee: { enabled: true, approval: 'auto', max_percent: 100 },
      payment_processing: { enabled: true, approval: 'auto', max_percent: 100 },
      file_processing: { enabled: true, approval: 'supervisor', max_percent: 50 },
      conditional_credit: { enabled: false }
    },
    2: { // Tier 2 - PIF
      collection_fee: { enabled: true, approval: 'auto', max_percent: 100 },
      payment_processing: { enabled: true, approval: 'auto', max_percent: 100 },
      file_processing: { enabled: true, approval: 'supervisor', max_percent: 100 },
      conditional_credit: { enabled: true, approval: 'supervisor', max_percent: 50, label: 'Partial Credit Only' }
    },
    1: { // Tier 1 - PIF (MAXIMUM AUTHORITY)
      collection_fee: { enabled: true, approval: 'auto', max_percent: 100 },
      payment_processing: { enabled: true, approval: 'auto', max_percent: 100 },
      file_processing: { enabled: true, approval: 'auto', max_percent: 100 },
      conditional_credit: { enabled: true, approval: 'compliance', max_percent: 100 }
    }
  }
};

export default function PaymentPlanWizard() {
  const { accountId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // REQUIRED FIRST STEP: Customer Type selection
  const [customerType, setCustomerType] = useState(''); // 'full' or 'plan'
  // Ensure tier is valid (1, 2, or 3) - map tier 4 to tier 3
  const initialTier = parseInt(searchParams.get('tier')) || 2;
  const [selectedTier, setSelectedTier] = useState(Math.min(Math.max(initialTier, 1), 3));
  
  // Fee amounts (from account line items or defaults)
  const [fees, setFees] = useState({
    // Non-waivable (system-locked)
    monthly_service_fees: 0,
    services_rendered: 0,
    // Waivable with rules
    collection_fee: 350.00,
    payment_processing: 0,
    file_processing: 199.80,
    conditional_credit: 0
  });
  
  // Waiver amounts (how much is being waived)
  const [waivers, setWaivers] = useState({
    collection_fee: 0,
    collection_fee_reason: '',
    payment_processing: 0,
    payment_processing_reason: '',
    file_processing: 0,
    file_processing_reason: '',
    conditional_credit: 0,
    conditional_credit_reason: ''
  });
  
  // Approval tracking
  const [approvalRequired, setApprovalRequired] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('collections_agent');

  // Payment plan state
  const [plan, setPlan] = useState({
    down_payment_amount: 0,
    down_payment_date: new Date().toISOString().split('T')[0],
    payment_frequency: 'monthly',
    number_of_payments: 1,
    payment_amount: 0
  });

  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  const fetchAccount = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        
        // Initialize fees from account line items or defaults
        const monthsOverdue = Math.ceil(data.days_past_due / 30);
        setFees(f => ({
          ...f,
          monthly_service_fees: monthsOverdue * (data.monthly_rate || 179.95),
          services_rendered: monthsOverdue * (data.monthly_rate || 179.95),
          collection_fee: 350.00,
          payment_processing: 0,
          file_processing: 199.80
        }));
      }
    } catch (error) {
      console.error('Failed to fetch account:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current waiver rules based on customer type and tier
  const getWaiverRules = () => {
    if (!customerType) return null;
    return WAIVER_RULES[customerType]?.[selectedTier] || null;
  };

  // Check if a waiver needs approval
  const checkApprovalRequired = () => {
    const rules = getWaiverRules();
    if (!rules) return [];
    
    const approvals = [];
    
    // Collection Fee - always auto-approved (rep-owned)
    // No approval needed
    
    // Payment Processing
    if (waivers.payment_processing > 0 && rules.payment_processing.approval !== 'auto') {
      approvals.push({ type: 'payment_processing', approval: rules.payment_processing.approval, amount: waivers.payment_processing });
    }
    
    // File Processing
    if (waivers.file_processing > 0 && rules.file_processing.approval !== 'auto') {
      approvals.push({ type: 'file_processing', approval: rules.file_processing.approval, amount: waivers.file_processing });
    }
    
    // Conditional Credit
    if (waivers.conditional_credit > 0 && rules.conditional_credit?.approval) {
      approvals.push({ type: 'conditional_credit', approval: rules.conditional_credit.approval, amount: waivers.conditional_credit });
    }
    
    return approvals;
  };

  useEffect(() => {
    setApprovalRequired(checkApprovalRequired());
  }, [waivers, customerType, selectedTier]);

  // Calculate totals
  const calculateNonWaivableTotal = () => {
    return fees.monthly_service_fees;
  };

  const calculateWaivableTotal = () => {
    return fees.collection_fee + fees.payment_processing + fees.file_processing + fees.conditional_credit;
  };

  const calculateTotalWaived = () => {
    return waivers.collection_fee + waivers.payment_processing + waivers.file_processing + waivers.conditional_credit;
  };

  const calculateAdjustedWaivable = () => {
    return calculateWaivableTotal() - calculateTotalWaived();
  };

  const calculateTotalBeforeDiscount = () => {
    return calculateNonWaivableTotal() + calculateAdjustedWaivable();
  };

  const calculateTierDiscount = () => {
    const tier = TIER_CONFIG[selectedTier];
    if (!tier || !customerType) return 0;
    const discountPercent = customerType === 'full' ? tier.fullPayDiscount : tier.planDiscount;
    return calculateTotalBeforeDiscount() * (discountPercent / 100);
  };

  const calculateAdjustedTotal = () => {
    return calculateTotalBeforeDiscount() - calculateTierDiscount();
  };

  // Collection fee rep keeps (100% of what's not waived)
  const collectionFeeKept = fees.collection_fee - waivers.collection_fee;

  // Safe calculation for remaining balance
  const safeAdjustedTotal = () => {
    try {
      return calculateAdjustedTotal();
    } catch {
      return 0;
    }
  };

  const remainingBalance = safeAdjustedTotal() - plan.down_payment_amount;

  useEffect(() => {
    if (plan.number_of_payments > 0 && remainingBalance > 0) {
      setPlan(p => ({ ...p, payment_amount: Math.ceil(remainingBalance / plan.number_of_payments * 100) / 100 }));
    }
  }, [remainingBalance, plan.number_of_payments]);

  // Commission calculation
  const calculateCommission = () => {
    const tier = TIER_CONFIG[selectedTier];
    if (!tier || !customerType) return null;
    
    const total = safeAdjustedTotal();
    
    if (customerType === 'full') {
      const baseCommission = total * (tier.commission.full / 100);
      return { 
        collectionFee: collectionFeeKept,
        collectionFeeNote: '100% yours (minus waived)',
        baseCommission, 
        baseRate: tier.commission.full,
        immediate: collectionFeeKept + baseCommission,
        total: collectionFeeKept + baseCommission,
        type: 'Full Payment' 
      };
    } else {
      const downCommission = plan.down_payment_amount * (tier.commission.downPayment / 100);
      const monthlyCommission = remainingBalance * (tier.commission.monthly / 100);
      const completionBonus = total * (tier.commission.completion / 100);
      return {
        collectionFee: collectionFeeKept,
        collectionFeeNote: '100% yours (minus waived)',
        downPayment: downCommission,
        downRate: tier.commission.downPayment,
        monthly: monthlyCommission,
        monthlyRate: tier.commission.monthly,
        completion: completionBonus,
        completionRate: tier.commission.completion,
        immediate: collectionFeeKept + downCommission,
        totalPotential: collectionFeeKept + downCommission + monthlyCommission + completionBonus,
        type: 'Payment Plan'
      };
    }
  };

  // Helper function to handle waiver input change (not a component to avoid focus loss)
  const handleWaiverChange = (feeKey, value, originalAmount, maxPercent, minCollect = 0) => {
    const maxWaiver = originalAmount * (maxPercent / 100);
    let val = parseFloat(value) || 0;
    if (val > maxWaiver) val = maxWaiver;
    if (minCollect > 0 && (originalAmount - val) < minCollect) val = originalAmount - minCollect;
    setWaivers(w => ({ ...w, [feeKey]: val }));
  };

  const handleReasonChange = (feeKey, value) => {
    setWaivers(w => ({ ...w, [`${feeKey}_reason`]: value }));
  };

  const handleSubmit = async () => {
    // Validate reason codes for all waivers
    if (waivers.collection_fee > 0 && !waivers.collection_fee_reason) {
      toast.error('Please select a reason for Collection Fee waiver');
      return;
    }
    if (waivers.payment_processing > 0 && !waivers.payment_processing_reason) {
      toast.error('Please select a reason for Payment Processing waiver');
      return;
    }
    if (waivers.file_processing > 0 && !waivers.file_processing_reason) {
      toast.error('Please select a reason for File Processing waiver');
      return;
    }

    const tier = TIER_CONFIG[selectedTier];
    const minDown = calculateAdjustedTotal() * (tier.minDownPercent / 100);
    
    if (customerType === 'plan' && plan.down_payment_amount < minDown) {
      toast.error(`Minimum down payment is $${minDown.toFixed(2)} (${tier.minDownPercent}%)`);
      return;
    }

    // Check if approvals are required
    const pendingApprovals = checkApprovalRequired();
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // If approvals required, create approval request first
      if (pendingApprovals.length > 0) {
        const approvalRes = await fetch(`${API_URL}/api/collections/approval-requests`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: accountId,
            request_type: 'waiver_approval',
            tier_requested: selectedTier,
            customer_type: customerType,
            original_balance: calculateTotalBeforeDiscount(),
            proposed_settlement_amount: calculateAdjustedTotal(),
            waiver_amount: calculateTotalWaived(),
            waiver_details: pendingApprovals.map(a => ({
              type: a.type,
              original: fees[a.type],
              waived: waivers[a.type],
              remaining: fees[a.type] - waivers[a.type],
              reason: waivers[`${a.type}_reason`]
            })),
            reason: 'Settlement negotiation per tier rules'
          })
        });
        
        if (!approvalRes.ok) {
          const err = await approvalRes.json();
          toast.error(err.detail || 'Failed to create approval request');
          setSubmitting(false);
          return;
        }
        
        toast.success('Approval request submitted. Awaiting manager approval.');
        navigate(`/admin/collections/accounts/${accountId}`);
        return;
      }

      // No approvals needed - create agreement directly
      const res = await fetch(`${API_URL}/api/collections/accounts/${accountId}/payment-plan`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier_accepted: selectedTier,
          tier_name: tier.label,
          customer_type: customerType,
          payment_type: customerType,
          original_balance: account.past_due_balance,
          discount_percentage: customerType === 'full' ? tier.fullPayDiscount : tier.planDiscount,
          // Fee breakdown
          non_waivable_total: calculateNonWaivableTotal(),
          collection_fee_original: fees.collection_fee,
          collection_fee_waived: waivers.collection_fee,
          collection_fee_adjusted: fees.collection_fee - waivers.collection_fee,
          collection_fee_reason: waivers.collection_fee_reason,
          payment_processing_original: fees.payment_processing,
          payment_processing_waived: waivers.payment_processing,
          payment_processing_adjusted: fees.payment_processing - waivers.payment_processing,
          file_processing_original: fees.file_processing,
          file_processing_waived: waivers.file_processing,
          file_processing_adjusted: fees.file_processing - waivers.file_processing,
          // Totals
          total_waived: calculateTotalWaived(),
          tier_discount: calculateTierDiscount(),
          adjusted_balance: calculateAdjustedTotal(),
          // Payment terms
          ...plan,
          remaining_balance: remainingBalance,
          total_plan_amount: customerType === 'full' ? calculateAdjustedTotal() : plan.down_payment_amount + (plan.payment_amount * plan.number_of_payments)
        })
      });
      
      if (res.ok) {
        toast.success('Payment agreement created successfully!');
        navigate(`/admin/collections/accounts/${accountId}`);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to create payment agreement');
      }
    } catch (error) {
      toast.error('Failed to create payment agreement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div></div>;
  if (!account) return null;

  const tier = TIER_CONFIG[selectedTier];
  const commission = customerType ? calculateCommission() : null;
  const rules = getWaiverRules();

  const steps = [
    { num: 1, label: 'Customer Type', icon: CreditCard },
    { num: 2, label: 'Tier Selection', icon: Percent },
    { num: 3, label: 'Waivers', icon: Calculator },
    { num: 4, label: 'Payment Terms', icon: Calendar },
    { num: 5, label: 'Review', icon: FileText }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/admin/collections/accounts/${accountId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Payment Agreement</h1>
            <p className="text-gray-500">{account.client_name} - ${account.past_due_balance?.toFixed(2)} past due ({account.days_past_due} days)</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs ${step === s.num ? 'bg-primary-blue text-white' : step > s.num ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {step > s.num ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-2 h-0.5 bg-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Customer Type Selection (REQUIRED FIRST) */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Select Customer Type</CardTitle>
            <CardDescription>This determines available waiver options and authority levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => setCustomerType('full')}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${customerType === 'full' ? 'border-primary-blue ring-2 ring-primary-blue/20 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-full"><DollarSign className="w-6 h-6 text-green-600" /></div>
                  <h3 className="text-lg font-semibold">Pay-In-Full (PIF)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Customer will pay the full settlement amount immediately. Higher waiver authority available.</p>
                <div className="space-y-1 text-sm">
                  <p className="text-green-600">✓ Maximum waiver flexibility</p>
                  <p className="text-green-600">✓ Up to 35% tier discount</p>
                  <p className="text-green-600">✓ Higher commission rates</p>
                </div>
              </div>
              
              <div
                onClick={() => setCustomerType('plan')}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${customerType === 'plan' ? 'border-primary-blue ring-2 ring-primary-blue/20 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-full"><Calendar className="w-6 h-6 text-blue-600" /></div>
                  <h3 className="text-lg font-semibold">Payment Plan</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Customer will pay over time with scheduled installments. Limited waiver options.</p>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-600">✓ Flexible payment schedule</p>
                  <p className="text-blue-600">✓ Lower down payment options</p>
                  <p className="text-orange-600">⚠ Some waivers require approval</p>
                </div>
              </div>
            </div>
            
            {!customerType && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-700">You must select a Customer Type before proceeding to waiver options.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Tier Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Settlement Tier</CardTitle>
            <CardDescription>Tier controls waiver limits, discounts, and approval routing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(t => {
                const tc = TIER_CONFIG[t];
                return (
                  <div
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTier === t ? 'border-primary-blue ring-2 ring-primary-blue/20' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={tc.color}>{tc.label}</Badge>
                      {t === 1 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Max Authority</span>}
                    </div>
                    <p className="font-medium text-sm mb-1">{tc.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">PIF Discount</p>
                        <p className="font-semibold">{tc.fullPayDiscount}%</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Plan Discount</p>
                        <p className="font-semibold">{tc.planDiscount}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {tier.label} - {tier.name} | 
                <strong> {customerType === 'full' ? 'PIF' : 'Payment Plan'}:</strong> {customerType === 'full' ? tier.fullPayDiscount : tier.planDiscount}% discount
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Waiver Controls */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" />Fee Waivers</CardTitle>
            <CardDescription>
              {customerType === 'full' ? 'PIF' : 'Payment Plan'} - {tier.label}: Configure waivers per handbook rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Non-Waivable Section */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />Non-Waivable Charges (System-Locked)
              </h3>
              <p className="text-sm text-red-600 mb-3">Monthly Service Fees and Contractually Earned Charges cannot be waived.</p>
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span>Monthly Service Fees</span>
                <span className="font-bold">${fees.monthly_service_fees.toFixed(2)}</span>
              </div>
            </div>

            {/* Waivable Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Unlock className="w-4 h-4" />Waivable Fees
              </h3>
              
              {/* Collection Fee - Rep Owned - INLINE to prevent focus loss */}
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <Label className="font-medium">Collection Fee (Rep-Owned - 100% yours)</Label>
                  </div>
                  <Badge className="bg-green-100 text-green-700"><Unlock className="w-3 h-3 mr-1" />Rep-Owned</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Original</p>
                    <p className="font-semibold">${fees.collection_fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Waive Amount (max 100%)</p>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        type="number" 
                        min={0}
                        max={fees.collection_fee}
                        step={0.01}
                        value={waivers.collection_fee}
                        onChange={(e) => handleWaiverChange('collection_fee', e.target.value, fees.collection_fee, 100)}
                        className="w-full pl-6 h-8 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Final Amount</p>
                    <p className="font-semibold text-lg">${(fees.collection_fee - waivers.collection_fee).toFixed(2)}</p>
                  </div>
                </div>
                {waivers.collection_fee > 0 && (
                  <div className="mt-3">
                    <Label className="text-xs">Reason Code (required)</Label>
                    <select 
                      value={waivers.collection_fee_reason || ''} 
                      onChange={(e) => handleReasonChange('collection_fee', e.target.value)}
                      className="w-full h-8 text-sm mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select reason...</option>
                      <option value="hardship">Financial Hardship</option>
                      <option value="goodwill">Goodwill Adjustment</option>
                      <option value="error">Billing Error</option>
                      <option value="retention">Customer Retention</option>
                      <option value="negotiation">Settlement Negotiation</option>
                    </select>
                  </div>
                )}
              </div>
              
              {/* Payment Processing - INLINE */}
              {rules?.payment_processing?.enabled && (
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">Payment Processing Fee</Label>
                    </div>
                    <Badge className={rules.payment_processing.approval === 'auto' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                      {rules.payment_processing.approval === 'auto' ? <><ShieldCheck className="w-3 h-3 mr-1" />Auto-Approved</> : <><Lock className="w-3 h-3 mr-1" />{rules.payment_processing.approval}</>}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Original</p>
                      <p className="font-semibold">${fees.payment_processing.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Waive Amount (max {rules.payment_processing.max_percent}%)</p>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input 
                          type="number" 
                          min={0}
                          max={fees.payment_processing * rules.payment_processing.max_percent / 100}
                          step={0.01}
                          value={waivers.payment_processing}
                          onChange={(e) => handleWaiverChange('payment_processing', e.target.value, fees.payment_processing, rules.payment_processing.max_percent)}
                          className="w-full pl-6 h-8 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Final Amount</p>
                      <p className="font-semibold text-lg">${(fees.payment_processing - waivers.payment_processing).toFixed(2)}</p>
                    </div>
                  </div>
                  {waivers.payment_processing > 0 && (
                    <div className="mt-3">
                      <Label className="text-xs">Reason Code (required)</Label>
                      <select 
                        value={waivers.payment_processing_reason || ''} 
                        onChange={(e) => handleReasonChange('payment_processing', e.target.value)}
                        className="w-full h-8 text-sm mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select reason...</option>
                        <option value="hardship">Financial Hardship</option>
                        <option value="goodwill">Goodwill Adjustment</option>
                        <option value="error">Billing Error</option>
                        <option value="retention">Customer Retention</option>
                        <option value="negotiation">Settlement Negotiation</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              
              {/* File Processing - INLINE */}
              {rules?.file_processing?.enabled && (
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">Collection File Processing Fee</Label>
                    </div>
                    <Badge className={rules.file_processing.approval === 'auto' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                      {rules.file_processing.approval === 'auto' ? <><ShieldCheck className="w-3 h-3 mr-1" />Auto-Approved</> : <><Lock className="w-3 h-3 mr-1" />{rules.file_processing.approval}</>}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Original</p>
                      <p className="font-semibold">${fees.file_processing.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Waive Amount (max {rules.file_processing.max_percent}%)</p>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input 
                          type="number" 
                          min={0}
                          max={fees.file_processing * rules.file_processing.max_percent / 100}
                          step={0.01}
                          value={waivers.file_processing}
                          onChange={(e) => handleWaiverChange('file_processing', e.target.value, fees.file_processing, rules.file_processing.max_percent, rules.file_processing.min_collect)}
                          className="w-full pl-6 h-8 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {rules.file_processing.min_collect > 0 && <p className="text-xs text-orange-600 mt-1">Min collect: ${rules.file_processing.min_collect}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Final Amount</p>
                      <p className="font-semibold text-lg">${(fees.file_processing - waivers.file_processing).toFixed(2)}</p>
                    </div>
                  </div>
                  {waivers.file_processing > 0 && (
                    <div className="mt-3">
                      <Label className="text-xs">Reason Code (required)</Label>
                      <select 
                        value={waivers.file_processing_reason || ''} 
                        onChange={(e) => handleReasonChange('file_processing', e.target.value)}
                        className="w-full h-8 text-sm mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select reason...</option>
                        <option value="hardship">Financial Hardship</option>
                        <option value="goodwill">Goodwill Adjustment</option>
                        <option value="error">Billing Error</option>
                        <option value="retention">Customer Retention</option>
                        <option value="negotiation">Settlement Negotiation</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              
              {/* Conditional Credit - INLINE */}
              {rules?.conditional_credit?.enabled && (
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <Label className="font-medium">Conditional Pricing Credit</Label>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">
                      {rules.conditional_credit.label || 'Requires Compliance'}
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-600 mb-3">
                    Note: This is NOT a waiver. It's a conditional credit that auto-voids on default.
                  </p>
                  <input 
                    type="number"
                    placeholder="Enter credit amount"
                    value={waivers.conditional_credit}
                    onChange={(e) => setWaivers(w => ({ ...w, conditional_credit: parseFloat(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Non-Waivable:</span>
                  <p className="font-bold">${calculateNonWaivableTotal().toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Waivable Fees:</span>
                  <p className="font-bold">${calculateAdjustedWaivable().toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Waived:</span>
                  <p className="font-bold text-green-600">-${calculateTotalWaived().toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Before Tier Discount:</span>
                  <p className="font-bold text-lg">${calculateTotalBeforeDiscount().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Approval Warning */}
            {approvalRequired.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />Approval Required
                </h4>
                <p className="text-sm text-orange-600 mt-2">
                  The following waivers require approval before the agreement can be finalized:
                </p>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  {approvalRequired.map((a, i) => (
                    <li key={i}>• {a.type.replace('_', ' ')}: ${a.amount.toFixed(2)} → Requires {a.approval} approval</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Payment Terms */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Payment Terms</CardTitle>
            <CardDescription>
              {customerType === 'full' 
                ? `Full payment of $${calculateAdjustedTotal().toFixed(2)} required` 
                : `Min ${tier.minDownPercent}% down, max ${tier.maxMonths} months`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Settlement Amount</p>
              <p className="text-3xl font-bold">${calculateAdjustedTotal().toFixed(2)}</p>
              <p className="text-sm text-green-600">({tier.label} {customerType === 'full' ? tier.fullPayDiscount : tier.planDiscount}% discount applied)</p>
            </div>

            {customerType === 'plan' ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Down Payment Amount</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="number" value={plan.down_payment_amount} onChange={(e) => setPlan(p => ({ ...p, down_payment_amount: parseFloat(e.target.value) || 0 }))} className="pl-9" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Min: ${(calculateAdjustedTotal() * tier.minDownPercent / 100).toFixed(2)} ({tier.minDownPercent}%)</p>
                  </div>
                  <div>
                    <Label>Down Payment Date</Label>
                    <Input type="date" value={plan.down_payment_date} onChange={(e) => setPlan(p => ({ ...p, down_payment_date: e.target.value }))} className="mt-2" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Payment Frequency</Label>
                    <Select value={plan.payment_frequency} onValueChange={(v) => setPlan(p => ({ ...p, payment_frequency: v }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Payments</Label>
                    <Input type="number" min={1} max={tier.maxMonths} value={plan.number_of_payments} onChange={(e) => setPlan(p => ({ ...p, number_of_payments: parseInt(e.target.value) || 1 }))} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Max: {tier.maxMonths} payments</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-xs text-gray-500">Down Payment</p><p className="text-xl font-bold">${plan.down_payment_amount.toFixed(2)}</p></div>
                    <div><p className="text-xs text-gray-500">Each Payment</p><p className="text-xl font-bold">${plan.payment_amount.toFixed(2)}</p></div>
                    <div><p className="text-xs text-gray-500">Remaining</p><p className="text-xl font-bold text-green-600">${remainingBalance.toFixed(2)}</p></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-lg">Full Payment Required</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">${calculateAdjustedTotal().toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Review Payment Agreement</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Client</h4>
                <p className="font-medium">{account.client_name}</p>
                <p className="text-sm text-gray-500">{account.client_email} • {account.client_phone}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Original Balance</p><p className="text-lg font-bold">${account.past_due_balance?.toFixed(2)}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Waivers Applied</p><p className="text-lg font-bold text-green-600">-${calculateTotalWaived().toFixed(2)}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Tier Discount</p><p className="text-lg font-bold text-green-600">-${calculateTierDiscount().toFixed(2)}</p></div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200"><p className="text-xs text-gray-500">Settlement Amount</p><p className="text-lg font-bold">${calculateAdjustedTotal().toFixed(2)}</p></div>
              </div>
              
              {/* Waiver Summary */}
              {calculateTotalWaived() > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-700 mb-2">Waivers Applied</h4>
                  <div className="space-y-1 text-sm">
                    {waivers.collection_fee > 0 && <p>• Collection Fee: -${waivers.collection_fee.toFixed(2)} ({waivers.collection_fee_reason})</p>}
                    {waivers.payment_processing > 0 && <p>• Payment Processing: -${waivers.payment_processing.toFixed(2)} ({waivers.payment_processing_reason})</p>}
                    {waivers.file_processing > 0 && <p>• File Processing: -${waivers.file_processing.toFixed(2)} ({waivers.file_processing_reason})</p>}
                  </div>
                </div>
              )}

              {customerType === 'plan' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Payment Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-white rounded"><span>Down Payment</span><span className="font-medium">${plan.down_payment_amount.toFixed(2)} on {plan.down_payment_date}</span></div>
                    <div className="flex justify-between p-2 bg-white rounded"><span>Installments</span><span className="font-medium">{plan.number_of_payments}x ${plan.payment_amount.toFixed(2)} ({plan.payment_frequency})</span></div>
                  </div>
                </div>
              )}
              
              {/* Approval Status */}
              {approvalRequired.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-700">⚠️ Approval Required</h4>
                  <p className="text-sm text-orange-600 mt-1">This agreement will be submitted for approval before finalization.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commission Preview */}
          {commission && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />Your Commission Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500">Collection Fee (100% yours)</p>
                    <p className="text-xl font-bold text-green-600">${commission.collectionFee.toFixed(2)}</p>
                  </div>
                  {customerType === 'full' ? (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Base Commission ({commission.baseRate}%)</p>
                        <p className="text-xl font-bold">${commission.baseCommission.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg border border-green-300 col-span-2">
                        <p className="text-xs text-gray-500">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-700">${commission.total.toFixed(2)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Immediate (Down {commission.downRate}%)</p>
                        <p className="text-xl font-bold">${commission.immediate.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Monthly + Completion</p>
                        <p className="text-xl font-bold">${(commission.monthly + commission.completion).toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                        <p className="text-xs text-gray-500">Total Potential</p>
                        <p className="text-2xl font-bold text-green-700">${commission.totalPotential.toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {step < 5 ? (
          <Button 
            onClick={() => setStep(s => s + 1)} 
            disabled={step === 1 && !customerType}
            className="bg-primary-blue hover:bg-primary-blue/90"
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {approvalRequired.length > 0 ? 'Submit for Approval' : 'Create Agreement'}
          </Button>
        )}
      </div>
    </div>
  );
}
