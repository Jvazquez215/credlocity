import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Trash2, DollarSign, User, FileText, Calculator
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Default service plans
const SERVICE_PLANS = [
  { id: 'individual', name: 'Individual Plan', default_price: 179.95, type: 'credit_repair' },
  { id: 'couple', name: 'Couple/Family Plan', default_price: 279.95, type: 'credit_repair' },
  { id: 'legacy_individual', name: 'Legacy Individual', default_price: 119.95, type: 'credit_repair' },
  { id: 'credit_monitoring_3b', name: 'Credit Monitoring (3B Reports)', default_price: 29.95, type: 'credit_monitoring' },
  { id: 'credit_monitoring_partner', name: 'Credit Monitoring (Partner)', default_price: 19.95, type: 'credit_monitoring' },
  { id: 'custom', name: 'Custom Plan', default_price: 0, type: 'custom' }
];

// Line item types
const LINE_ITEM_TYPES = [
  { id: 'plan', name: 'Service Plan', is_waivable: false },
  { id: 'late_fee', name: 'Late Fee', is_waivable: true },
  { id: 'collection_fee', name: 'Collection Fee', is_waivable: true, default_amount: 350.00 },
  { id: 'payment_processing', name: 'Payment Processing', is_waivable: true },
  { id: 'file_processing', name: 'Collection File Processing Fee', is_waivable: true, default_amount: 35.00 },
  { id: 'credit_reports', name: '3B Credit Reports', is_waivable: false, default_amount: 199.80 },
  { id: 'other', name: 'Other Charge', is_waivable: true }
];

export default function CollectionsCreateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Client info
  const [clientInfo, setClientInfo] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    client_city: '',
    client_state: '',
    client_zip: '',
    ssn_last_4: ''
  });
  
  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planAmount, setPlanAmount] = useState(0);
  const [customPlanName, setCustomPlanName] = useState('');
  
  // Line items (invoice style)
  const [lineItems, setLineItems] = useState([]);
  
  // Dates
  const [firstFailedDate, setFirstFailedDate] = useState('');
  
  // Assignment
  const [employees, setEmployees] = useState([]);
  const [assignedRepId, setAssignedRepId] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handlePlanSelect = (planId) => {
    const plan = SERVICE_PLANS.find(p => p.id === planId);
    setSelectedPlan(plan);
    setPlanAmount(plan?.default_price || 0);
    
    // Auto-add plan as first line item
    if (plan && planId !== 'custom') {
      const existingPlanIndex = lineItems.findIndex(item => item.item_type === 'plan');
      if (existingPlanIndex >= 0) {
        const newItems = [...lineItems];
        newItems[existingPlanIndex] = {
          ...newItems[existingPlanIndex],
          description: plan.name,
          amount: plan.default_price,
          total: plan.default_price
        };
        setLineItems(newItems);
      }
    }
  };

  const addLineItem = (typeId) => {
    const itemType = LINE_ITEM_TYPES.find(t => t.id === typeId);
    if (!itemType) return;
    
    const newItem = {
      id: Date.now().toString(),
      item_type: typeId,
      description: itemType.name,
      amount: itemType.default_amount || 0,
      quantity: 1,
      total: itemType.default_amount || 0,
      is_waivable: itemType.is_waivable,
      processing_source: typeId === 'payment_processing' ? 'collection_department' : null
    };
    
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total
        if (field === 'amount' || field === 'quantity') {
          updated.total = parseFloat(updated.amount || 0) * parseInt(updated.quantity || 1);
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async () => {
    if (!clientInfo.client_name || !firstFailedDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/accounts/invoice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientInfo,
          plan_id: selectedPlan?.id,
          plan_name: selectedPlan?.id === 'custom' ? customPlanName : selectedPlan?.name,
          plan_type: selectedPlan?.type,
          monthly_rate: planAmount,
          first_failed_payment_date: firstFailedDate,
          line_items: lineItems.map(item => ({
            item_type: item.item_type,
            description: item.description,
            amount: item.amount,
            quantity: item.quantity,
            is_waivable: item.is_waivable,
            processing_source: item.processing_source
          })),
          assigned_rep_id: assignedRepId || undefined
        })
      });

      if (res.ok) {
        const account = await res.json();
        toast.success('Account created successfully!');
        navigate(`/admin/collections/accounts/${account.id}`);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to create account');
      }
    } catch (error) {
      toast.error('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Client Info', icon: User },
    { num: 2, label: 'Plan & Charges', icon: FileText },
    { num: 3, label: 'Review', icon: Calculator }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/collections/accounts">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Collections Account</h1>
          <p className="text-gray-500">Invoice-style account creation</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div 
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer ${step === s.num ? 'bg-primary-blue text-white' : step > s.num ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              <s.icon className="w-4 h-4" />
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Client Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Client Information</CardTitle>
            <CardDescription>Enter the client's contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input 
                  value={clientInfo.client_name} 
                  onChange={(e) => setClientInfo({...clientInfo, client_name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={clientInfo.client_email} 
                  onChange={(e) => setClientInfo({...clientInfo, client_email: e.target.value})}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={clientInfo.client_phone} 
                  onChange={(e) => setClientInfo({...clientInfo, client_phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>SSN Last 4 (for verification)</Label>
                <Input 
                  maxLength={4}
                  value={clientInfo.ssn_last_4} 
                  onChange={(e) => setClientInfo({...clientInfo, ssn_last_4: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="1234"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Address</Label>
              <Input 
                value={clientInfo.client_address} 
                onChange={(e) => setClientInfo({...clientInfo, client_address: e.target.value})}
                placeholder="123 Main St"
                className="mt-1"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input 
                  value={clientInfo.client_city} 
                  onChange={(e) => setClientInfo({...clientInfo, client_city: e.target.value})}
                  placeholder="Philadelphia"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input 
                  maxLength={2}
                  value={clientInfo.client_state} 
                  onChange={(e) => setClientInfo({...clientInfo, client_state: e.target.value.toUpperCase()})}
                  placeholder="PA"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input 
                  value={clientInfo.client_zip} 
                  onChange={(e) => setClientInfo({...clientInfo, client_zip: e.target.value})}
                  placeholder="19103"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>First Failed Payment Date *</Label>
                <Input 
                  type="date"
                  value={firstFailedDate} 
                  onChange={(e) => setFirstFailedDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Assign to Rep (optional)</Label>
                <Select value={assignedRepId} onValueChange={setAssignedRepId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Auto-assign to me" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Plan & Line Items */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Service Plan</CardTitle>
              <CardDescription>Choose the client's subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {SERVICE_PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'border-primary-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-lg font-bold text-primary-blue">${plan.default_price.toFixed(2)}/mo</p>
                    <Badge variant="outline" className="mt-2 text-xs">{plan.type.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
              
              {selectedPlan?.id === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>Custom Plan Name</Label>
                    <Input value={customPlanName} onChange={(e) => setCustomPlanName(e.target.value)} placeholder="Enter plan name" className="mt-1" />
                  </div>
                  <div>
                    <Label>Monthly Rate</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="number" value={planAmount} onChange={(e) => setPlanAmount(parseFloat(e.target.value) || 0)} className="pl-9" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText className="w-5 h-5" />Charges (Invoice Style)</span>
                <Select onValueChange={addLineItem}>
                  <SelectTrigger className="w-[200px]"><Plus className="w-4 h-4 mr-2" />Add Charge</SelectTrigger>
                  <SelectContent>
                    {LINE_ITEM_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No charges added yet. Click "Add Charge" to add line items.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-2">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  
                  {lineItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg">
                      <div className="col-span-4">
                        <Input 
                          value={item.description} 
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex gap-1 mt-1">
                          {item.is_waivable && <Badge variant="outline" className="text-xs text-orange-600">Waivable</Badge>}
                          {item.item_type === 'payment_processing' && (
                            <Select value={item.processing_source} onValueChange={(v) => updateLineItem(item.id, 'processing_source', v)}>
                              <SelectTrigger className="h-6 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="collection_department">Collection Dept</SelectItem>
                                <SelectItem value="collection_agency">Collection Agency</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                          <Input 
                            type="number" 
                            value={item.amount} 
                            onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="pl-6 text-sm"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          min={1}
                          value={item.quantity} 
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">${item.total?.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2">
                        <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Past Due</p>
                      <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" />Review Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Client Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{clientInfo.client_name}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{clientInfo.client_email || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{clientInfo.client_phone || 'N/A'}</span></div>
                  <div><span className="text-gray-500">SSN Last 4:</span> <span className="font-medium">***{clientInfo.ssn_last_4 || 'N/A'}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{clientInfo.client_address}, {clientInfo.client_city}, {clientInfo.client_state} {clientInfo.client_zip}</span></div>
                </div>
              </div>

              {/* Plan & Date */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3">Plan Details</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Plan:</span> <span className="font-medium">{selectedPlan?.id === 'custom' ? customPlanName : selectedPlan?.name}</span></div>
                  <div><span className="text-gray-500">Monthly Rate:</span> <span className="font-medium">${planAmount.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">First Failed Date:</span> <span className="font-medium">{firstFailedDate}</span></div>
                </div>
              </div>

              {/* Line Items Summary */}
              <div>
                <h3 className="font-semibold mb-3">Charges Summary</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3">Description</th>
                        <th className="text-right p-3">Amount</th>
                        <th className="text-center p-3">Qty</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map(item => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            {item.description}
                            {item.is_waivable && <Badge variant="outline" className="ml-2 text-xs">Waivable</Badge>}
                          </td>
                          <td className="text-right p-3">${item.amount?.toFixed(2)}</td>
                          <td className="text-center p-3">{item.quantity}</td>
                          <td className="text-right p-3 font-medium">${item.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <td colSpan={3} className="p-3 text-right">Total Past Due:</td>
                        <td className="p-3 text-right text-lg">${calculateTotal().toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)} className="bg-primary-blue hover:bg-primary-blue/90">
            Next <span className="ml-2">→</span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? 'Creating...' : 'Create Account'}
          </Button>
        )}
      </div>
    </div>
  );
}
