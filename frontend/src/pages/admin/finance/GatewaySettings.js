import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Shield, Settings, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Wifi, WifiOff, Star } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import axios from '../../../utils/api';

const GatewaySettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [testing, setTesting] = useState(null);
  const [showKeys, setShowKeys] = useState({});

  // Authorize.net form
  const [anetForm, setAnetForm] = useState({
    api_login_id: '', transaction_key: '', signature_key: '', environment: 'production', active: false,
  });
  // PayPal form
  const [ppForm, setPpForm] = useState({
    client_id: '', client_secret: '', environment: 'sandbox', active: false,
  });

  const loadSettings = useCallback(async () => {
    try {
      const res = await axios.get('/gateway-settings');
      setSettings(res.data);
      setAnetForm({
        api_login_id: res.data.authorize_net?.api_login_id || '',
        transaction_key: res.data.authorize_net?.transaction_key || '',
        signature_key: res.data.authorize_net?.signature_key || '',
        environment: res.data.authorize_net?.environment || 'production',
        active: res.data.authorize_net?.active || false,
      });
      setPpForm({
        client_id: res.data.paypal?.client_id || '',
        client_secret: res.data.paypal?.client_secret || '',
        environment: res.data.paypal?.environment || 'sandbox',
        active: res.data.paypal?.active || false,
      });
    } catch (e) {
      toast.error('Failed to load gateway settings');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveAuthorizeNet = async () => {
    setSaving('anet');
    try {
      await axios.put('/gateway-settings/authorize-net', anetForm);
      toast.success('Authorize.net settings saved');
      loadSettings();
    } catch (e) {
      toast.error('Failed to save Authorize.net settings');
    }
    setSaving(null);
  };

  const savePayPal = async () => {
    setSaving('paypal');
    try {
      await axios.put('/gateway-settings/paypal', ppForm);
      toast.success('PayPal settings saved');
      loadSettings();
    } catch (e) {
      toast.error('Failed to save PayPal settings');
    }
    setSaving(null);
  };

  const testConnection = async (gateway) => {
    setTesting(gateway);
    try {
      const res = await axios.post(`/gateway-settings/test/${gateway}`);
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error('Connection test failed');
    }
    setTesting(null);
  };

  const setDefault = async (gateway) => {
    try {
      await axios.put('/gateway-settings/default', { gateway });
      toast.success(`${gateway === 'authorize_net' ? 'Authorize.net' : 'PayPal'} set as default`);
      loadSettings();
    } catch (e) {
      toast.error('Failed to set default gateway');
    }
  };

  const toggleKey = (key) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  const defaultGw = settings?.default_gateway || 'authorize_net';

  return (
    <div className="space-y-6" data-testid="gateway-settings-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" data-testid="gateway-settings-title">Payment Gateway Settings</h1>
        <p className="text-sm text-gray-500">Configure your payment processors. Credentials are stored securely.</p>
      </div>

      {/* Authorize.net Card */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" data-testid="anet-settings-card">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Authorize.net</h2>
              <p className="text-xs text-gray-500">Credit card processing gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {defaultGw === 'authorize_net' && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs gap-1">
                <Star className="w-3 h-3" /> Default
              </Badge>
            )}
            {anetForm.active ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs gap-1"><Wifi className="w-3 h-3" /> Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs gap-1"><WifiOff className="w-3 h-3" /> Inactive</Badge>
            )}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">API Login ID</label>
              <div className="relative">
                <Input
                  type={showKeys['anet_login'] ? 'text' : 'password'}
                  value={anetForm.api_login_id}
                  onChange={e => setAnetForm(p => ({ ...p, api_login_id: e.target.value }))}
                  placeholder="Enter API Login ID"
                  data-testid="anet-login-id"
                />
                <button onClick={() => toggleKey('anet_login')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showKeys['anet_login'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Key</label>
              <div className="relative">
                <Input
                  type={showKeys['anet_key'] ? 'text' : 'password'}
                  value={anetForm.transaction_key}
                  onChange={e => setAnetForm(p => ({ ...p, transaction_key: e.target.value }))}
                  placeholder="Enter Transaction Key"
                  data-testid="anet-transaction-key"
                />
                <button onClick={() => toggleKey('anet_key')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showKeys['anet_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Signature Key <span className="text-gray-400 font-normal">(for webhooks)</span></label>
              <div className="relative">
                <Input
                  type={showKeys['anet_sig'] ? 'text' : 'password'}
                  value={anetForm.signature_key}
                  onChange={e => setAnetForm(p => ({ ...p, signature_key: e.target.value }))}
                  placeholder="Enter Signature Key (optional)"
                  data-testid="anet-signature-key"
                />
                <button onClick={() => toggleKey('anet_sig')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showKeys['anet_sig'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Environment</label>
              <select
                value={anetForm.environment}
                onChange={e => setAnetForm(p => ({ ...p, environment: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm"
                data-testid="anet-environment"
              >
                <option value="production">Production (Live)</option>
                <option value="sandbox">Sandbox (Testing)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={anetForm.active} onChange={e => setAnetForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Enable gateway</span>
              </label>
              {defaultGw !== 'authorize_net' && (
                <button onClick={() => setDefault('authorize_net')} className="text-xs text-blue-600 hover:underline">Set as default</button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => testConnection('authorize-net')} disabled={testing === 'authorize-net'} data-testid="test-anet-btn">
                {testing === 'authorize-net' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Shield className="w-4 h-4 mr-1" />}
                Test Connection
              </Button>
              <Button size="sm" onClick={saveAuthorizeNet} disabled={saving === 'anet'} data-testid="save-anet-btn">
                {saving === 'anet' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Settings className="w-4 h-4 mr-1" />}
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Card */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" data-testid="paypal-settings-card">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.771.771 0 0 1 .76-.654h6.21c2.046 0 3.478.503 4.293 1.44.38.44.62.912.732 1.444.117.555.12 1.219.01 2.03l-.01.067v.59l.46.26c.39.21.7.448.93.72.32.38.52.84.59 1.37.07.54.03 1.18-.13 1.89-.18.84-.48 1.57-.89 2.16-.37.54-.84.98-1.41 1.31a5.46 5.46 0 0 1-1.78.65 9.35 9.35 0 0 1-2.1.21h-.5a1.51 1.51 0 0 0-1.49 1.28l-.04.21-.63 3.99-.03.14a.09.09 0 0 1-.09.07H7.076z"/></svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">PayPal</h2>
              <p className="text-xs text-gray-500">PayPal payment processing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {defaultGw === 'paypal' && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs gap-1">
                <Star className="w-3 h-3" /> Default
              </Badge>
            )}
            {ppForm.active ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs gap-1"><Wifi className="w-3 h-3" /> Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs gap-1"><WifiOff className="w-3 h-3" /> Inactive</Badge>
            )}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Client ID</label>
              <div className="relative">
                <Input
                  type={showKeys['pp_client'] ? 'text' : 'password'}
                  value={ppForm.client_id}
                  onChange={e => setPpForm(p => ({ ...p, client_id: e.target.value }))}
                  placeholder="Enter PayPal Client ID"
                  data-testid="paypal-client-id"
                />
                <button onClick={() => toggleKey('pp_client')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showKeys['pp_client'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Client Secret</label>
              <div className="relative">
                <Input
                  type={showKeys['pp_secret'] ? 'text' : 'password'}
                  value={ppForm.client_secret}
                  onChange={e => setPpForm(p => ({ ...p, client_secret: e.target.value }))}
                  placeholder="Enter PayPal Client Secret"
                  data-testid="paypal-client-secret"
                />
                <button onClick={() => toggleKey('pp_secret')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showKeys['pp_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Environment</label>
              <select
                value={ppForm.environment}
                onChange={e => setPpForm(p => ({ ...p, environment: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm"
                data-testid="paypal-environment"
              >
                <option value="production">Production (Live)</option>
                <option value="sandbox">Sandbox (Testing)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ppForm.active} onChange={e => setPpForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Enable gateway</span>
              </label>
              {defaultGw !== 'paypal' && (
                <button onClick={() => setDefault('paypal')} className="text-xs text-indigo-600 hover:underline">Set as default</button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => testConnection('paypal')} disabled={testing === 'paypal'} data-testid="test-paypal-btn">
                {testing === 'paypal' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Shield className="w-4 h-4 mr-1" />}
                Test Connection
              </Button>
              <Button size="sm" onClick={savePayPal} disabled={saving === 'paypal'} data-testid="save-paypal-btn">
                {saving === 'paypal' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Settings className="w-4 h-4 mr-1" />}
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 text-sm mb-2">Getting Your API Credentials</h3>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-blue-800">
          <div>
            <p className="font-medium mb-1">Authorize.net:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Log in to your Merchant Interface</li>
              <li>Go to Account &gt; Security Settings &gt; API Credentials &amp; Keys</li>
              <li>Copy your API Login ID and generate a Transaction Key</li>
              <li>For webhooks, generate a Signature Key</li>
            </ol>
          </div>
          <div>
            <p className="font-medium mb-1">PayPal:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Log in to the PayPal Developer Dashboard</li>
              <li>Go to Apps &amp; Credentials</li>
              <li>Create or select your app</li>
              <li>Copy Client ID and Secret</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewaySettings;
