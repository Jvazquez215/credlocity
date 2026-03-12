import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  Phone, Settings, CheckCircle, XCircle, AlertTriangle,
  Eye, EyeOff, Loader2, Trash2, RefreshCw, Shield
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function GoogleVoiceSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    gv_email: '',
    gv_password: '',
    gv_number: '',
    forwarding_number: '',
    is_enabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/google-voice/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.is_configured) {
          setFormData({
            gv_email: data.gv_email || '',
            gv_password: '', // Never returned from API for security
            gv_number: data.gv_number || '',
            forwarding_number: data.forwarding_number || '',
            is_enabled: data.is_enabled !== false
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch Google Voice settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, is_enabled: checked }));
  };

  const testConnection = async () => {
    if (!formData.gv_email || !formData.gv_password) {
      setMessage({ type: 'error', text: 'Email and password are required to test connection' });
      return;
    }

    setTesting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/google-voice/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gv_email: formData.gv_email,
          gv_password: formData.gv_password
        })
      });

      const data = await res.json();
      
      if (data.success && data.authenticated) {
        setMessage({ type: 'success', text: 'Successfully connected to Google Voice!' });
      } else {
        // Show helpful error message with troubleshooting tips
        let errorText = data.message || 'Connection failed';
        if (data.help) {
          setMessage({ type: 'error', text: errorText, help: data.help });
        } else {
          setMessage({ type: 'error', text: errorText });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test connection. Please try again.' });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = async () => {
    if (!formData.gv_email) {
      setMessage({ type: 'error', text: 'Google Voice email is required' });
      return;
    }

    // If this is a new setup, password is required
    if (!settings?.is_configured && !formData.gv_password) {
      setMessage({ type: 'error', text: 'Password is required for initial setup' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/google-voice/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Google Voice settings saved successfully!' });
        fetchSettings(); // Refresh settings
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteSettings = async () => {
    if (!window.confirm('Are you sure you want to delete your Google Voice settings? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/google-voice/settings`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Google Voice settings deleted' });
        setSettings(null);
        setFormData({
          gv_email: '',
          gv_password: '',
          gv_number: '',
          forwarding_number: '',
          is_enabled: true
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete settings' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Voice Settings</h1>
          <p className="text-gray-500">Configure your Google Voice account for calls and SMS</p>
        </div>
        {settings?.is_configured && (
          <Badge variant={settings.is_enabled ? 'default' : 'secondary'} className={settings.is_enabled ? 'bg-green-100 text-green-700' : ''}>
            {settings.is_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        )}
      </div>

      {/* Status Card */}
      {settings?.is_configured && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${settings.login_error ? 'bg-red-100' : 'bg-green-100'}`}>
                {settings.login_error ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {settings.login_error ? 'Connection Error' : 'Connected'}
                </h3>
                <p className="text-sm text-gray-500">
                  {settings.login_error || 
                    (settings.last_successful_login 
                      ? `Last successful login: ${new Date(settings.last_successful_login).toLocaleString()}`
                      : 'Ready to make calls and send SMS'
                    )
                  }
                </p>
              </div>
              {settings.login_error && (
                <Button variant="outline" size="sm" onClick={fetchSettings}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Alert */}
      {message.text && (
        <Alert className={message.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            <div>{message.text}</div>
            {message.help && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm whitespace-pre-wrap">
                <strong>💡 Troubleshooting Tips:</strong>
                <div className="mt-2">{message.help}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Configuration
          </CardTitle>
          <CardDescription>
            Enter your Google Voice credentials. Each rep uses their own account for calls and texts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-medium">Enable Google Voice</Label>
              <p className="text-sm text-gray-500">Turn on to use Google Voice for calls and SMS</p>
            </div>
            <Switch
              checked={formData.is_enabled}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          {/* Google Voice Email */}
          <div className="space-y-2">
            <Label htmlFor="gv_email">Google Voice Email *</Label>
            <Input
              id="gv_email"
              name="gv_email"
              type="email"
              placeholder="your-email@gmail.com"
              value={formData.gv_email}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-500">The email address associated with your Google Voice account</p>
          </div>

          {/* Google Voice Password */}
          <div className="space-y-2">
            <Label htmlFor="gv_password">
              Google Voice Password {settings?.is_configured ? '(leave blank to keep current)' : '*'}
            </Label>
            <div className="relative">
              <Input
                id="gv_password"
                name="gv_password"
                type={showPassword ? 'text' : 'password'}
                placeholder={settings?.is_configured ? '••••••••' : 'Enter your password'}
                value={formData.gv_password}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Your password is encrypted and stored securely</p>
          </div>

          {/* Google Voice Number */}
          <div className="space-y-2">
            <Label htmlFor="gv_number">Google Voice Phone Number</Label>
            <Input
              id="gv_number"
              name="gv_number"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.gv_number}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-500">Your Google Voice phone number (for reference)</p>
          </div>

          {/* Forwarding Number */}
          <div className="space-y-2">
            <Label htmlFor="forwarding_number">Forwarding Phone Number</Label>
            <Input
              id="forwarding_number"
              name="forwarding_number"
              type="tel"
              placeholder="(555) 987-6543"
              value={formData.forwarding_number}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-500">
              The phone that will ring when you make calls (your desk phone or mobile)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || !formData.gv_email || !formData.gv_password}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-primary-blue hover:bg-primary-blue/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>

            {settings?.is_configured && (
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={deleteSettings}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Password Instructions */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Important: Using App Passwords</h4>
              <p className="text-sm text-amber-700 mt-1">
                If you have <strong>2-Step Verification</strong> enabled on your Google account (which most accounts do), 
                you <strong>must</strong> use an App Password instead of your regular password.
              </p>
              <div className="mt-3 text-sm text-amber-800 space-y-2">
                <p><strong>How to generate an App Password:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">myaccount.google.com/security</a></li>
                  <li>Under &quot;Signing in to Google&quot;, click on &quot;App passwords&quot;</li>
                  <li>Select &quot;Mail&quot; or &quot;Other (Custom name)&quot; and enter &quot;Credlocity&quot;</li>
                  <li>Click &quot;Generate&quot; and copy the 16-character password</li>
                  <li>Use this App Password in the password field above</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Security Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your Google Voice credentials are encrypted before being stored. Only you can use them to make calls 
                and send texts. Your password is never displayed or shared with anyone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
