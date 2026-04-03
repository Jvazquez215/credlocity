import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Save, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CROSettings({ token }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cro/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm({
          company_name: data.company_name || '',
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          website: data.website || '',
          license_number: data.license_number || '',
        });
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const body = { ...form };
      if (passwordForm.new_password) {
        if (passwordForm.new_password !== passwordForm.confirm_password) {
          toast.error('Passwords do not match');
          setSaving(false);
          return;
        }
        body.current_password = passwordForm.current_password;
        body.new_password = passwordForm.new_password;
      }
      const res = await fetch(`${API_URL}/api/cro/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated');
        setProfile(data.profile);
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        // Update localStorage
        const croUser = JSON.parse(localStorage.getItem('cro_user') || '{}');
        localStorage.setItem('cro_user', JSON.stringify({ ...croUser, company_name: form.company_name }));
      } else {
        toast.error(data.detail || 'Failed to update');
      }
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div data-testid="cro-settings">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-teal-600" /> Company Information</CardTitle>
            <CardDescription>Update your organization's details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} data-testid="settings-company-name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Owner Name</label>
                <Input value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Website</label>
                <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">License Number</label>
                <Input value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} />
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm mt-1">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">EIN</label>
                <p className="text-sm mt-1">{profile?.ein}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="text-sm mt-1">{profile?.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Referral Code</label>
                <p className="text-sm mt-1 font-mono">{profile?.referral_code}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-teal-600" /> Change Password</CardTitle>
            <CardDescription>Leave blank to keep current password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <Input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <Input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <Input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} className="bg-teal-600 hover:bg-teal-700 px-8" disabled={saving} data-testid="settings-save-btn">
            {saving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
