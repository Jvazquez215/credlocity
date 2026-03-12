import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Phone, PhoneCall, PhoneOff, MessageSquare, X, Delete,
  Clock, CheckCircle, XCircle, Settings, RefreshCw, History,
  Send, AlertTriangle, User, Loader2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Dialpad button component
const DialpadButton = ({ value, subtext, onClick, className = "" }) => (
  <button
    onClick={() => onClick(value)}
    className={`w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 
      flex flex-col items-center justify-center transition-all ${className}`}
  >
    <span className="text-2xl font-semibold text-gray-800">{value}</span>
    {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
  </button>
);

export default function Dialpad({ 
  isOpen, 
  onClose, 
  initialNumber = "",
  accountId = null,
  clientName = "",
  onCallComplete = null 
}) {
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [activeTab, setActiveTab] = useState('dialpad'); // dialpad, sms, history
  const [smsMessage, setSmsMessage] = useState('');
  const [dialerStatus, setDialerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calling, setCalling] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch dialer status on mount
  useEffect(() => {
    if (isOpen) {
      fetchDialerStatus();
      if (initialNumber) {
        setPhoneNumber(initialNumber);
      }
    }
  }, [isOpen, initialNumber]);

  const fetchDialerStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/dialer/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDialerStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch dialer status:', error);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/dialer/history?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDialpadPress = useCallback((value) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(prev => prev + value);
    }
  }, [phoneNumber]);

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const formatPhoneDisplay = (number) => {
    const digits = number.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const makeCall = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!dialerStatus?.is_connected) {
      toast.error('Google Voice not connected. Please configure your settings.');
      return;
    }

    setCalling(true);
    toast.loading('Initiating call...', { id: 'call' });

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/dialer/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          account_id: accountId
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('📞 Call initiated! Your phone will ring shortly.', { id: 'call' });
        if (onCallComplete) {
          onCallComplete({ type: 'call', success: true, phone: phoneNumber });
        }
      } else {
        toast.error(data.message || 'Failed to initiate call', { id: 'call' });
        if (data.needs_setup) {
          toast.info('Please configure your Google Voice settings first');
        }
      }
    } catch (error) {
      toast.error('Failed to initiate call', { id: 'call' });
    } finally {
      setCalling(false);
    }
  };

  const sendSMS = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!smsMessage || smsMessage.length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    if (!dialerStatus?.is_connected) {
      toast.error('Google Voice not connected. Please configure your settings.');
      return;
    }

    setLoading(true);
    toast.loading('Sending SMS...', { id: 'sms' });

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/dialer/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          message: smsMessage,
          account_id: accountId
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('📱 SMS sent successfully!', { id: 'sms' });
        setSmsMessage('');
        if (onCallComplete) {
          onCallComplete({ type: 'sms', success: true, phone: phoneNumber, message: smsMessage });
        }
      } else {
        toast.error(data.message || 'Failed to send SMS', { id: 'sms' });
      }
    } catch (error) {
      toast.error('Failed to send SMS', { id: 'sms' });
    } finally {
      setLoading(false);
    }
  };

  const syncHistory = async () => {
    setHistoryLoading(true);
    toast.loading('Syncing from Google Voice...', { id: 'sync' });

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/dialer/sync-gv-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { id: 'sync' });
        fetchHistory();
      } else {
        toast.error(data.message || 'Sync failed', { id: 'sync' });
      }
    } catch (error) {
      toast.error('Failed to sync history', { id: 'sync' });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Quick SMS templates
  const smsTemplates = [
    { label: 'Payment Reminder', text: 'Hi, this is Credlocity Collections. Please call us back at your earliest convenience regarding your account.' },
    { label: 'Callback Request', text: 'This is Credlocity Collections. We need to speak with you about an important matter. Please call us back today.' },
    { label: 'Payment Due', text: 'Reminder: Your payment is due. Please contact us to discuss payment options and avoid further collection activity.' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-semibold">Dialpad</h2>
                {clientName && <p className="text-sm text-blue-100">{clientName}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dialerStatus?.is_connected ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Connection Warning */}
        {!dialerStatus?.is_connected && dialerStatus !== null && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-yellow-800">Google Voice not connected.</span>
              <span className="text-yellow-700 ml-1">
                {dialerStatus.error || 'Configure your settings to make calls.'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto text-yellow-700 border-yellow-300"
              onClick={() => window.location.href = '/admin/collections/google-voice'}
            >
              <Settings className="w-4 h-4 mr-1" />
              Setup
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('dialpad')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'dialpad' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            <Phone className="w-4 h-4" />
            Dialpad
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'sms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            SMS
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchHistory(); }}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Phone Number Display */}
          <div className="mb-4">
            <div className="relative">
              <Input
                type="tel"
                value={formatPhoneDisplay(phoneNumber)}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter phone number"
                className="text-center text-2xl h-14 font-mono tracking-wider"
              />
              {phoneNumber && (
                <button
                  onClick={handleBackspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Dialpad Tab */}
          {activeTab === 'dialpad' && (
            <div className="space-y-4">
              {/* Dialpad Grid */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-4">
                  <DialpadButton value="1" subtext="" onClick={handleDialpadPress} />
                  <DialpadButton value="2" subtext="ABC" onClick={handleDialpadPress} />
                  <DialpadButton value="3" subtext="DEF" onClick={handleDialpadPress} />
                </div>
                <div className="flex gap-4">
                  <DialpadButton value="4" subtext="GHI" onClick={handleDialpadPress} />
                  <DialpadButton value="5" subtext="JKL" onClick={handleDialpadPress} />
                  <DialpadButton value="6" subtext="MNO" onClick={handleDialpadPress} />
                </div>
                <div className="flex gap-4">
                  <DialpadButton value="7" subtext="PQRS" onClick={handleDialpadPress} />
                  <DialpadButton value="8" subtext="TUV" onClick={handleDialpadPress} />
                  <DialpadButton value="9" subtext="WXYZ" onClick={handleDialpadPress} />
                </div>
                <div className="flex gap-4">
                  <DialpadButton value="*" subtext="" onClick={handleDialpadPress} />
                  <DialpadButton value="0" subtext="+" onClick={handleDialpadPress} />
                  <DialpadButton value="#" subtext="" onClick={handleDialpadPress} />
                </div>
              </div>

              {/* Call Button */}
              <div className="flex justify-center gap-4 pt-2">
                <Button
                  onClick={makeCall}
                  disabled={calling || !phoneNumber || !dialerStatus?.is_connected}
                  className="w-32 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {calling ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <PhoneCall className="w-6 h-6" />
                  )}
                </Button>
                {phoneNumber && (
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="w-14 h-14 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              {/* Quick Templates */}
              <div className="flex flex-wrap gap-2">
                {smsTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSmsMessage(template.text)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                  >
                    {template.label}
                  </button>
                ))}
              </div>

              {/* Message Input */}
              <Textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-32 resize-none"
                maxLength={480}
              />

              {/* Character Count */}
              <div className="flex justify-between text-xs text-gray-500">
                <span className={smsMessage.length >= 10 ? 'text-green-600' : ''}>
                  {smsMessage.length >= 10 ? '✓ ' : ''}{smsMessage.length}/10 min
                </span>
                <span>
                  {smsMessage.length}/480 chars • {Math.ceil(smsMessage.length / 160) || 1} segment(s)
                </span>
              </div>

              {/* Send Button */}
              <Button
                onClick={sendSMS}
                disabled={loading || smsMessage.length < 10 || !phoneNumber || !dialerStatus?.is_connected}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Send SMS
              </Button>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {/* Sync Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncHistory}
                  disabled={historyLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} />
                  Sync from GV
                </Button>
              </div>

              {/* History List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {historyLoading && history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading history...
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No call/SMS history yet
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => setPhoneNumber(item.phone_number?.replace(/\D/g, '') || '')}
                    >
                      <div className={`p-2 rounded-full ${
                        item.type === 'call' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {item.type === 'call' ? (
                          <Phone className={`w-4 h-4 ${
                            item.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.phone_number}</p>
                        {item.message && (
                          <p className="text-xs text-gray-500 truncate">{item.message}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                        <Badge variant={item.status === 'completed' || item.status === 'sent' || item.status === 'initiated' ? 'default' : 'destructive'} className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
