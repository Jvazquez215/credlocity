import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { Save, RefreshCw, Info, DollarSign, Percent } from 'lucide-react';

const BillingSettingsManager = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState({ amount: 10000, bonus: 0 });
  const [calculatorResult, setCalculatorResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/billing/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load billing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/billing/settings', settings);
      toast.success('Billing settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const calculateCommission = async () => {
    try {
      const response = await api.get('/billing/settings/commission-calculator', {
        params: {
          settlement_amount: calculatorInput.amount,
          bonus_rate: calculatorInput.bonus / 100
        }
      });
      setCalculatorResult(response.data);
    } catch (error) {
      console.error('Error calculating commission:', error);
      toast.error('Failed to calculate commission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="billing-settings">
      {/* Credit Repair Company Subscription Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Credit Repair Company Subscription Fees
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Signup Fee (One-Time)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings?.company_signup_fee || 0}
                onChange={(e) => handleChange('company_signup_fee', parseFloat(e.target.value))}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">One-time fee charged when companies sign up</p>
          </div>
          <div>
            <Label>Monthly Subscription Fee</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings?.company_monthly_fee || 0}
                onChange={(e) => handleChange('company_monthly_fee', parseFloat(e.target.value))}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Recurring monthly subscription fee</p>
          </div>
          <div>
            <Label>Trial Period (Days)</Label>
            <Input
              type="number"
              value={settings?.company_trial_days || 0}
              onChange={(e) => handleChange('company_trial_days', parseInt(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Number of free trial days (0 = no trial)</p>
          </div>
          <div>
            <Label>Grace Period (Days)</Label>
            <Input
              type="number"
              value={settings?.company_grace_period_days || 0}
              onChange={(e) => handleChange('company_grace_period_days', parseInt(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Days before suspending past-due accounts</p>
          </div>
        </div>
      </div>

      {/* Revenue Split Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-blue-600" />
          Revenue Split (When Cases Sell)
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Company Revenue Share (%)</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={settings?.company_revenue_split_percentage || 0}
                onChange={(e) => {
                  const companyPct = parseFloat(e.target.value);
                  handleChange('company_revenue_split_percentage', companyPct);
                  handleChange('credlocity_revenue_split_percentage', 100 - companyPct);
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Percentage of case sale going to credit repair company</p>
          </div>
          <div>
            <Label>Credlocity Revenue Share (%)</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={settings?.credlocity_revenue_split_percentage || 0}
                onChange={(e) => {
                  const credlocityPct = parseFloat(e.target.value);
                  handleChange('credlocity_revenue_split_percentage', credlocityPct);
                  handleChange('company_revenue_split_percentage', 100 - credlocityPct);
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Platform fee percentage</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="w-4 h-4" />
            <span className="text-sm">Current split: Company gets {settings?.company_revenue_split_percentage || 0}%, Credlocity keeps {settings?.credlocity_revenue_split_percentage || 0}%</span>
          </div>
        </div>
      </div>

      {/* Attorney Fee Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Attorney Marketplace Fees
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Initial Fee (Per Case)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings?.attorney_initial_fee || 0}
                onChange={(e) => handleChange('attorney_initial_fee', parseFloat(e.target.value))}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Upfront fee charged to attorneys per case</p>
          </div>
          <div>
            <Label>Max Bonus Commission (%)</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={(settings?.attorney_bonus_commission_cap || 0) * 100}
                onChange={(e) => handleChange('attorney_bonus_commission_cap', parseFloat(e.target.value) / 100)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum bonus commission rate</p>
          </div>
          <div>
            <Label>Max Upfront Bonus ($)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings?.attorney_upfront_bonus_cap || 0}
                onChange={(e) => handleChange('attorney_upfront_bonus_cap', parseFloat(e.target.value))}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum upfront bonus attorneys can pay</p>
          </div>
          <div>
            <Label>Client Bonus Cap (%)</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={(settings?.client_bonus_percentage_cap || 0) * 100}
                onChange={(e) => handleChange('client_bonus_percentage_cap', parseFloat(e.target.value) / 100)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum bonus percentage for clients</p>
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="mt-6">
          <Label className="text-base">Commission Tiers</Label>
          <div className="mt-2 space-y-2">
            {settings?.attorney_commission_tiers?.map((tier, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 w-8">#{index + 1}</span>
                <span className="text-sm text-gray-600 flex-1">{tier.description}</span>
                <span className="font-mono text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                  {(tier.rate * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <Info className="w-3 h-3 inline mr-1" />
            Commission tiers are applied based on settlement amount ranges
          </p>
        </div>
      </div>

      {/* Commission Calculator */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Calculator</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Settlement Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                value={calculatorInput.amount}
                onChange={(e) => setCalculatorInput(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label>Bonus Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="15"
              step="0.5"
              value={calculatorInput.bonus}
              onChange={(e) => setCalculatorInput(prev => ({ ...prev, bonus: parseFloat(e.target.value) || 0 }))}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={calculateCommission} className="w-full">
              Calculate
            </Button>
          </div>
        </div>

        {calculatorResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tier</p>
                <p className="font-medium">{calculatorResult.tier_description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Standard Rate</p>
                <p className="font-medium">{(calculatorResult.standard_rate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Rate (w/ Bonus)</p>
                <p className="font-medium">{(calculatorResult.total_rate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Initial Fee</p>
                <p className="font-medium">${calculatorResult.initial_fee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commission Amount</p>
                <p className="font-medium text-green-600">${calculatorResult.commission_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Due to Credlocity</p>
                <p className="font-bold text-primary-blue text-lg">${calculatorResult.total_due.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <Label>Late Payment Fee</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings?.late_payment_fee || 0}
                onChange={(e) => handleChange('late_payment_fee', parseFloat(e.target.value))}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label>Payment Terms (Days)</Label>
            <Input
              type="number"
              value={settings?.payment_terms_days || 30}
              onChange={(e) => handleChange('payment_terms_days', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Currency</Label>
            <select
              value={settings?.currency || 'USD'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchSettings} disabled={saving}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BillingSettingsManager;
