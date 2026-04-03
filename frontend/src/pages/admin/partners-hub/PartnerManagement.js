import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';
import { Shield, KeyRound, Check, X, Users } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const getToken = () => localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
const adminH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinModal, setPinModal] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/partner-pins/list`, { headers: adminH() });
      if (res.ok) { const d = await res.json(); setPartners(d.partners || []); }
      else toast.error('Failed to load partners');
    } catch { toast.error('Connection error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const savePin = async () => {
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      toast.error('PIN must be exactly 6 numeric digits');
      return;
    }
    if (newPin !== confirmPin) { toast.error('PINs do not match'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/partners/set-pin`, {
        method: 'POST', headers: adminH(),
        body: JSON.stringify({ partner_id: pinModal.id, new_pin: newPin })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`PIN updated. Share the new PIN with ${pinModal.display_name} directly.`);
        setPinModal(null);
        setNewPin('');
        setConfirmPin('');
        load();
      } else toast.error(data.detail);
    } catch { toast.error('Failed to set PIN'); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="partner-management">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-sm text-gray-500">Manage PartnersHub access PINs</p>
        </div>
      </div>

      <div className="space-y-3">
        {partners.map(p => (
          <Card key={p.id} data-testid={`partner-card-${p.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.role === 'master_partner' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                    <Shield className={`w-5 h-5 ${p.role === 'master_partner' ? 'text-indigo-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.display_name}</h3>
                    <p className="text-sm text-gray-500">{p.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{p.role?.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">PartnersHub PIN</p>
                    <div className="flex items-center gap-1.5">
                      {p.has_pin ? (
                        <>
                          <span className="font-mono text-sm tracking-widest">{'●'.repeat(6)}</span>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        </>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">Not Set</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => { setPinModal(p); setNewPin(''); setConfirmPin(''); }}
                    data-testid={`change-pin-${p.id}`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {p.has_pin ? 'Change PIN' : 'Set PIN'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PIN Modal */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setPinModal(null)}>
          <Card className="w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Set New PIN for {pinModal.display_name}</CardTitle>
                <button onClick={() => setPinModal(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">New PIN (6 digits)</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="______"
                  className="font-mono text-center text-lg tracking-[0.5em] mt-1"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  data-testid="new-pin-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm PIN</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="______"
                  className="font-mono text-center text-lg tracking-[0.5em] mt-1"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  data-testid="confirm-pin-input"
                />
              </div>
              {newPin.length === 6 && confirmPin.length === 6 && newPin !== confirmPin && (
                <p className="text-sm text-red-600">PINs do not match</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setPinModal(null)}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={newPin.length !== 6 || newPin !== confirmPin || saving}
                  onClick={savePin}
                  data-testid="save-pin-btn"
                >
                  {saving ? 'Saving...' : 'Save New PIN'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PartnerManagement;
