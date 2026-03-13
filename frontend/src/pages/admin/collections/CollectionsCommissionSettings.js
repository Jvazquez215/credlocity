import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import {
  DollarSign, Percent, Save, Loader2, Settings, RotateCcw,
  Plus, X, Clock, ShieldCheck, ArrowLeft
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CollectionsCommissionSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('auth_token');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/collections/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setSettings(d.settings); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/collections/settings`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (res.ok) toast.success('Settings saved');
      else toast.error('Failed to save');
    } catch (e) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const resetDefaults = async () => {
    if (!window.confirm('Reset all settings to defaults? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/collections/settings/defaults`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setSettings(d.settings); toast.success('Reset to defaults'); }
    } catch (e) { toast.error('Failed'); }
  };

  const updateNested = (path, value) => {
    setSettings(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!settings) return <p className="text-center text-gray-400 py-16">Failed to load settings</p>;

  return (
    <div className="p-6 space-y-6" data-testid="commission-settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-blue-500" /> Commission & Fee Settings</h1>
          <p className="text-gray-500 mt-1">Configure commission rates, fees, late fee schedule, and tier waiver rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetDefaults}><RotateCcw className="w-4 h-4 mr-1" /> Reset Defaults</Button>
          <Button onClick={saveSettings} disabled={saving} className="bg-green-600 hover:bg-green-700" data-testid="save-settings-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="commission" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commission"><Percent className="w-4 h-4 mr-1" /> Commission</TabsTrigger>
          <TabsTrigger value="fees"><DollarSign className="w-4 h-4 mr-1" /> Fees</TabsTrigger>
          <TabsTrigger value="late_fees"><Clock className="w-4 h-4 mr-1" /> Late Fees</TabsTrigger>
          <TabsTrigger value="tiers"><ShieldCheck className="w-4 h-4 mr-1" /> Tier Rules</TabsTrigger>
          <TabsTrigger value="bonuses"><DollarSign className="w-4 h-4 mr-1" /> Bonuses</TabsTrigger>
        </TabsList>

        {/* COMMISSION TAB */}
        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rules</CardTitle>
              <CardDescription>Base commission rate and payout thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Base Commission Rate (%)</label>
                  <Input type="number" value={settings.commission.base_rate} onChange={e => updateNested('commission.base_rate', parseFloat(e.target.value) || 0)} data-testid="base-rate" />
                  <p className="text-xs text-gray-500 mt-1">Applied to total collected amount (excl. collection fee)</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Plan Threshold (%)</label>
                  <Input type="number" value={settings.commission.payment_plan_threshold} onChange={e => updateNested('commission.payment_plan_threshold', parseFloat(e.target.value) || 0)} data-testid="threshold" />
                  <p className="text-xs text-gray-500 mt-1">% of tier owed that must be collected before commission is paid</p>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={settings.commission.collection_fee_immediate} onChange={e => updateNested('commission.collection_fee_immediate', e.target.checked)} className="w-4 h-4" />
                  <label className="text-sm font-medium">Collection fee pays immediately</label>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <strong>How it works:</strong> Rep earns {settings.commission.base_rate}% of the collected amount (past due + late fees kept). 
                The collection fee ($350 or portion collected) goes directly to rep upon payment. 
                The {settings.commission.base_rate}% commission is only paid when {settings.commission.payment_plan_threshold}% of the total owed is collected on payment plans.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEES TAB */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Schedule (2024+ Accounts)</CardTitle>
              <CardDescription>Standard fees charged to clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.fees).map(([key, fee]) => (
                <div key={key} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                  <div className="col-span-2">
                    <label className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</label>
                    <Badge variant="outline" className="ml-2 text-xs">{fee.waivable ? 'Waivable' : 'Non-waivable'}</Badge>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Amount</label>
                    <Input type="number" value={fee.amount} onChange={e => updateNested(`fees.${key}.amount`, parseFloat(e.target.value) || 0)} />
                  </div>
                  {fee.waivable && (
                    <>
                      <div>
                        <label className="text-xs text-gray-500">Max Waive</label>
                        <Input type="number" value={fee.max_waive_amount || 0} onChange={e => updateNested(`fees.${key}.max_waive_amount`, parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Min Collect</label>
                        <Input type="number" value={fee.min_collect || 0} onChange={e => updateNested(`fees.${key}.min_collect`, parseFloat(e.target.value) || 0)} />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LATE FEES TAB */}
        <TabsContent value="late_fees">
          <Card>
            <CardHeader>
              <CardTitle>Late Fee Schedule</CardTitle>
              <CardDescription>Late fees by days past due range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.late_fees.map((lf, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                  <div>
                    <label className="text-xs text-gray-500">Label</label>
                    <Input value={lf.label} onChange={e => {
                      const arr = [...settings.late_fees]; arr[i] = {...arr[i], label: e.target.value}; updateNested('late_fees', arr);
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Min Days</label>
                    <Input type="number" value={lf.min_days} onChange={e => {
                      const arr = [...settings.late_fees]; arr[i] = {...arr[i], min_days: parseInt(e.target.value) || 0}; updateNested('late_fees', arr);
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max Days</label>
                    <Input type="number" value={lf.max_days} onChange={e => {
                      const arr = [...settings.late_fees]; arr[i] = {...arr[i], max_days: parseInt(e.target.value) || 0}; updateNested('late_fees', arr);
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Amount ($)</label>
                    <Input type="number" step="0.01" value={lf.amount} onChange={e => {
                      const arr = [...settings.late_fees]; arr[i] = {...arr[i], amount: parseFloat(e.target.value) || 0}; updateNested('late_fees', arr);
                    }} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const arr = settings.late_fees.filter((_, idx) => idx !== i); updateNested('late_fees', arr);
                  }} className="text-red-400 self-end"><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                updateNested('late_fees', [...settings.late_fees, { label: '', min_days: 0, max_days: 0, amount: 0 }]);
              }}><Plus className="w-4 h-4 mr-1" /> Add Late Fee Tier</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIERS TAB */}
        <TabsContent value="tiers">
          <div className="space-y-4">
            {Object.entries(settings.tiers).map(([tierKey, tier]) => (
              <Card key={tierKey}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={tierKey === '1' ? 'bg-green-100 text-green-700' : tierKey === '2' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                      Tier {tierKey}
                    </Badge>
                    <Input value={tier.name} onChange={e => updateNested(`tiers.${tierKey}.name`, e.target.value)} className="max-w-xs" />
                  </CardTitle>
                  <Input value={tier.description} onChange={e => updateNested(`tiers.${tierKey}.description`, e.target.value)} className="text-sm" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Min Down Payment %</label>
                      <Input type="number" value={tier.min_down_percent} onChange={e => updateNested(`tiers.${tierKey}.min_down_percent`, parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max Months</label>
                      <Input type="number" value={tier.max_months} onChange={e => updateNested(`tiers.${tierKey}.max_months`, parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mt-2">Waiver Limits</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Collection Fee Max Waive ($)</label>
                      <Input type="number" value={tier.waiver_limits?.collection_fee_max_waive || 0} onChange={e => updateNested(`tiers.${tierKey}.waiver_limits.collection_fee_max_waive`, parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Processing Fee Max Waive ($)</label>
                      <Input type="number" value={tier.waiver_limits?.payment_processing_max_waive || 0} onChange={e => updateNested(`tiers.${tierKey}.waiver_limits.payment_processing_max_waive`, parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max Late Fees Waivable</label>
                      <Input type="number" value={tier.waiver_limits?.late_fees_max_count || 0} onChange={e => updateNested(`tiers.${tierKey}.waiver_limits.late_fees_max_count`, parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* BONUSES TAB */}
        <TabsContent value="bonuses">
          <Card>
            <CardHeader>
              <CardTitle>Bonus Rules</CardTitle>
              <CardDescription>Configure bonus amounts by dollar or percentage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(settings.bonuses || []).map((bonus, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <Input value={bonus.name} onChange={e => {
                      const arr = [...settings.bonuses]; arr[i] = {...arr[i], name: e.target.value}; updateNested('bonuses', arr);
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <select value={bonus.type} onChange={e => {
                      const arr = [...settings.bonuses]; arr[i] = {...arr[i], type: e.target.value}; updateNested('bonuses', arr);
                    }} className="w-full p-2 border rounded-lg text-sm">
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">{bonus.type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}</label>
                    <Input type="number" step="0.01" value={bonus.type === 'fixed' ? (bonus.amount || 0) : (bonus.percentage || 0)} onChange={e => {
                      const arr = [...settings.bonuses];
                      if (bonus.type === 'fixed') arr[i] = {...arr[i], amount: parseFloat(e.target.value) || 0};
                      else arr[i] = {...arr[i], percentage: parseFloat(e.target.value) || 0};
                      updateNested('bonuses', arr);
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Condition</label>
                    <Input value={bonus.condition || ''} onChange={e => {
                      const arr = [...settings.bonuses]; arr[i] = {...arr[i], condition: e.target.value}; updateNested('bonuses', arr);
                    }} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    updateNested('bonuses', settings.bonuses.filter((_, idx) => idx !== i));
                  }} className="text-red-400 self-end"><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                updateNested('bonuses', [...(settings.bonuses || []), { name: '', type: 'fixed', amount: 0, condition: '' }]);
              }}><Plus className="w-4 h-4 mr-1" /> Add Bonus Rule</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
