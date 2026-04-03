import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import api from '../../../utils/api';

const CredentialRotationGuard = ({ children }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(null); // 'password' | 'pin' | null
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const checkStatus = async () => {
    try {
      const res = await api.get('/auth/credential-status');
      setStatus(res.data);
      if (res.data.requires_action) {
        if (res.data.password?.expired) {
          setStep('password');
        } else if (res.data.pin?.expired || !res.data.pin?.set) {
          setStep('pin');
        }
      } else {
        setStep(null);
      }
    } catch {
      // If endpoint fails, don't block - let user through
      setStep(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkStatus(); }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/set-partner-password', { password });
      setSuccessMsg('Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(async () => {
        setSuccessMsg('');
        // Re-check - if PIN also expired, move to PIN step
        const res = await api.get('/auth/credential-status');
        setStatus(res.data);
        if (res.data.pin?.expired || !res.data.pin?.set) {
          setStep('pin');
          setCurrentPassword(password); // Carry over for PIN validation
        } else {
          setStep(null);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    if (!currentPassword) {
      setError('Please enter your current password to set PIN');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/set-credit-pin', { pin, current_password: currentPassword });
      setSuccessMsg('PIN updated successfully!');
      setPin('');
      setConfirmPin('');
      setCurrentPassword('');
      setTimeout(() => {
        setSuccessMsg('');
        setStep(null);
        checkStatus();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update PIN');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!step) return children;

  // Forced modal overlay - cannot be dismissed
  return (
    <>
      {children}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" data-testid="credential-rotation-modal">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Credential Rotation Required</h2>
                <p className="text-red-100 text-sm">
                  Your {step === 'password' ? 'password' : 'credit reporting PIN'} has expired. Update it to continue.
                </p>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg" data-testid="rotation-warning">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                CMS access is locked until you update your expired credentials. This modal cannot be closed.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" data-testid="rotation-error">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2" data-testid="rotation-success">
                <CheckCircle className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter new password"
                      required
                      data-testid="new-password-input"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Confirm new password"
                      required
                      data-testid="confirm-password-input"
                    />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-1">Password Requirements:</p>
                  <ul className="text-xs text-gray-500 space-y-0.5 list-disc pl-4">
                    <li>7+ characters with uppercase & lowercase letters</li>
                    <li>At least 2 numbers and 2 special characters</li>
                    <li>Cannot use "!" as a special character</li>
                  </ul>
                </div>
                <Button type="submit" className="w-full" disabled={submitting} data-testid="submit-password-btn">
                  {submitting ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}

            {step === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter current password"
                      required
                      data-testid="current-password-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New 6-Digit PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 tracking-[0.5em] text-center font-mono text-lg"
                      placeholder="------"
                      required
                      data-testid="new-pin-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 tracking-[0.5em] text-center font-mono text-lg"
                      placeholder="------"
                      required
                      data-testid="confirm-pin-input"
                    />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-1">PIN Requirements:</p>
                  <ul className="text-xs text-gray-500 space-y-0.5 list-disc pl-4">
                    <li>Exactly 6 digits</li>
                    <li>Cannot share digits with your password</li>
                  </ul>
                </div>
                <Button type="submit" className="w-full" disabled={submitting} data-testid="submit-pin-btn">
                  {submitting ? 'Updating...' : 'Update PIN'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CredentialRotationGuard;
