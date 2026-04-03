import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, Lock, IdCard, AlertTriangle, Clock, Settings } from 'lucide-react';
import api from '../utils/api';

const PIN_SESSION_KEY = 'cr_pin_session';
const PIN_SESSION_EXPIRY_KEY = 'cr_pin_expiry';
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const CreditReportingPinGate = ({ children }) => {
  const { user, logout } = useAuth();
  const [verified, setVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPinSetup, setHasPinSetup] = useState(null);
  const [setupMode, setSetupMode] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const inactivityTimer = useRef(null);
  const expiryInterval = useRef(null);

  // Check existing session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(PIN_SESSION_KEY);
    const expiry = sessionStorage.getItem(PIN_SESSION_EXPIRY_KEY);
    if (session && expiry && new Date(expiry) > new Date()) {
      setVerified(true);
    }
    // Check if user has PIN set up
    api.get('/security/pin-status').then(res => {
      setHasPinSetup(res.data.has_pin && res.data.has_employee_id);
      if (res.data.employee_id) setEmployeeId(res.data.employee_id);
    }).catch(() => setHasPinSetup(false));
  }, []);

  // Inactivity auto-lock
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!verified) return;
    inactivityTimer.current = setTimeout(() => {
      sessionStorage.removeItem(PIN_SESSION_KEY);
      sessionStorage.removeItem(PIN_SESSION_EXPIRY_KEY);
      setVerified(false);
      setPin('');
      toast.warning('Session expired due to inactivity. Please re-enter your PIN.', { duration: 5000 });
    }, INACTIVITY_TIMEOUT_MS);
  }, [verified]);

  useEffect(() => {
    if (!verified) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();

    // Countdown timer
    expiryInterval.current = setInterval(() => {
      const expiry = sessionStorage.getItem(PIN_SESSION_EXPIRY_KEY);
      if (expiry) {
        const diff = Math.max(0, Math.floor((new Date(expiry).getTime() - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) {
          sessionStorage.removeItem(PIN_SESSION_KEY);
          sessionStorage.removeItem(PIN_SESSION_EXPIRY_KEY);
          setVerified(false);
          setPin('');
        }
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (expiryInterval.current) clearInterval(expiryInterval.current);
    };
  }, [verified, resetInactivityTimer]);

  // Extend session on activity
  useEffect(() => {
    if (!verified) return;
    const extendSession = async () => {
      const session = sessionStorage.getItem(PIN_SESSION_KEY);
      if (!session) return;
      try {
        const res = await api.post('/security/extend-pin-session', { session_token: session });
        if (res.data.extended) {
          const newExpiry = new Date(Date.now() + res.data.expires_in_minutes * 60 * 1000);
          sessionStorage.setItem(PIN_SESSION_EXPIRY_KEY, newExpiry.toISOString());
        }
      } catch {
        sessionStorage.removeItem(PIN_SESSION_KEY);
        sessionStorage.removeItem(PIN_SESSION_EXPIRY_KEY);
        setVerified(false);
      }
    };

    const activityExtend = () => extendSession();
    const throttled = (() => {
      let last = 0;
      return () => { const now = Date.now(); if (now - last > 60000) { last = now; activityExtend(); } };
    })();
    window.addEventListener('mousedown', throttled);
    return () => window.removeEventListener('mousedown', throttled);
  }, [verified]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) { toast.error('PIN must be 6 digits'); return; }
    setLoading(true);
    try {
      const res = await api.post('/security/verify-pin', { pin, employee_id: employeeId });
      sessionStorage.setItem(PIN_SESSION_KEY, res.data.session_token);
      const expiry = new Date(Date.now() + res.data.expires_in_minutes * 60 * 1000);
      sessionStorage.setItem(PIN_SESSION_EXPIRY_KEY, expiry.toISOString());
      setVerified(true);
      toast.success('Access granted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (newPin.length !== 6 || !newPin.match(/^\d{6}$/)) { toast.error('PIN must be exactly 6 digits'); return; }
    if (newPin !== confirmPin) { toast.error('PINs do not match'); return; }
    if (!newEmployeeId.trim()) { toast.error('Employee ID is required'); return; }
    setLoading(true);
    try {
      await api.post('/security/set-pin', { pin: newPin, employee_id: newEmployeeId.trim() });
      setHasPinSetup(true);
      setSetupMode(false);
      setEmployeeId(newEmployeeId.trim());
      toast.success('PIN and Employee ID configured');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div>
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900/90 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2 backdrop-blur" data-testid="pin-session-indicator">
          <Lock className="w-3 h-3 text-green-400" />
          <span>Secured</span>
          <span className="text-gray-400">|</span>
          <Clock className="w-3 h-3 text-yellow-400" />
          <span className={timeLeft < 60 ? 'text-red-400 font-bold' : 'text-gray-300'}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        {children}
      </div>
    );
  }

  // PIN not configured yet
  if (hasPinSetup === false || setupMode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="pin-setup-form">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-gray-900">Configure Credit Reporting Access</h2>
            <p className="text-sm text-gray-500 mt-1">Set up your 6-digit PIN and Employee ID for secure access.</p>
          </div>
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <Label className="text-gray-700">Employee ID</Label>
              <div className="relative mt-1">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={newEmployeeId} onChange={e => setNewEmployeeId(e.target.value)} placeholder="Enter Employee ID" className="pl-10" required data-testid="setup-employee-id" />
              </div>
            </div>
            <div>
              <Label className="text-gray-700">6-Digit PIN</Label>
              <Input type="password" value={newPin} onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setNewPin(e.target.value); }} maxLength={6} placeholder="000000" className="text-center text-2xl tracking-[0.5em] font-mono" required data-testid="setup-pin" />
            </div>
            <div>
              <Label className="text-gray-700">Confirm PIN</Label>
              <Input type="password" value={confirmPin} onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setConfirmPin(e.target.value); }} maxLength={6} placeholder="000000" className="text-center text-2xl tracking-[0.5em] font-mono" required data-testid="setup-confirm-pin" />
              {confirmPin && newPin !== confirmPin && <p className="text-xs text-red-500 mt-1">PINs do not match</p>}
            </div>
            <Button type="submit" className="w-full bg-secondary-green hover:bg-secondary-light text-white" disabled={loading} data-testid="setup-submit-btn">
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // PIN verification gate
  return (
    <div className="flex items-center justify-center min-h-[60vh]" data-testid="pin-verify-form">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="font-cinzel text-xl font-bold text-gray-900">Credit Reporting Access</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your Employee ID and 6-digit PIN to access sensitive credit reporting data.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">This area contains sensitive consumer data. Sessions auto-lock after 5 minutes of inactivity.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <Label className="text-gray-700">Employee ID</Label>
            <div className="relative mt-1">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="Employee ID" className="pl-10" required data-testid="verify-employee-id" />
            </div>
          </div>
          <div>
            <Label className="text-gray-700">6-Digit PIN</Label>
            <Input
              type="password"
              value={pin}
              onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value); }}
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              required
              autoFocus
              data-testid="verify-pin"
            />
          </div>
          <Button type="submit" className="w-full bg-primary-blue hover:bg-blue-800 text-white" disabled={loading || pin.length !== 6} data-testid="verify-submit-btn">
            {loading ? 'Verifying...' : 'Unlock Access'}
          </Button>
          <button type="button" onClick={() => setSetupMode(true)} className="w-full text-xs text-gray-500 hover:text-primary-blue transition" data-testid="change-pin-btn">
            Change PIN or Employee ID
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreditReportingPinGate;
