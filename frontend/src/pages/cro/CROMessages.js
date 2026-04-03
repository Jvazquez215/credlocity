import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, RefreshCw, User, Building2, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CROMessages({ token }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cro/messages`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (caseId) => {
    try {
      const res = await fetch(`${API_URL}/api/cro/messages/${caseId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/cro/messages/${selectedThread.case_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedThread.case_id);
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { fetchThreads(); }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.case_id);
      const interval = setInterval(() => fetchMessages(selectedThread.case_id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedThread]);

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div data-testid="cro-messages">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '500px' }}>
        {/* Thread List */}
        <Card className={`${selectedThread ? 'hidden md:block' : ''}`}>
          <CardHeader><CardTitle className="text-lg">Conversations</CardTitle></CardHeader>
          <CardContent className="p-0">
            {threads.length > 0 ? (
              threads.map(t => (
                <button key={t.case_id} onClick={() => setSelectedThread(t)} className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${selectedThread?.case_id === t.case_id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">{t.case_number}</span>
                    {t.unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.unread}</span>}
                  </div>
                  <p className="font-medium text-sm mt-1">{t.attorney_name || 'Attorney'}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{t.last_message}</p>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Messages appear when an attorney pledges on your case</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="md:col-span-2">
          {selectedThread ? (
            <Card className="flex flex-col" style={{ height: '500px' }}>
              <CardHeader className="border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button className="md:hidden" onClick={() => setSelectedThread(null)}><ChevronLeft className="w-5 h-5" /></button>
                  <div>
                    <CardTitle className="text-lg">{selectedThread.attorney_name || 'Attorney'}</CardTitle>
                    <p className="text-xs text-gray-500 font-mono">{selectedThread.case_number}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'cro' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${m.sender_type === 'cro' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {m.sender_type === 'cro' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span className="text-xs font-medium opacity-80">{m.sender_name}</span>
                      </div>
                      <p className="text-sm">{m.content}</p>
                      <p className={`text-xs mt-1 ${m.sender_type === 'cro' ? 'text-teal-200' : 'text-gray-400'}`}>
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t p-4 flex gap-2 flex-shrink-0">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} className="flex-1" data-testid="cro-message-input" />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-teal-600 hover:bg-teal-700" data-testid="cro-message-send">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="hidden md:flex items-center justify-center" style={{ height: '500px' }}>
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from the list to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
