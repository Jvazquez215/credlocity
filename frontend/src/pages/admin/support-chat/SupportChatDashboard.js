import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import {
  MessageSquare, Send, Users, Clock, CheckCircle, AlertCircle, RefreshCw,
  Headphones, Bot, Settings, BookOpen, BarChart3, User, Paperclip, X, Plus,
  Star, ArrowRight, Phone, Mail, Globe, Loader2, ChevronDown, Zap, FileText
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    waiting: 'bg-yellow-100 text-yellow-700',
    active: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    abandoned: 'bg-gray-100 text-gray-700'
  };
  return <Badge className={styles[status] || styles.waiting}>{status}</Badge>;
};

// Session Card for Queue
const SessionCard = ({ session, onClaim, isActive }) => (
  <div 
    className={`p-4 border rounded-lg cursor-pointer transition-all ${
      isActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300 hover:shadow-sm'
    }`}
    onClick={() => onClaim(session)}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="font-medium">{session.visitor_name}</p>
          <p className="text-xs text-gray-400">{session.visitor_email || 'No email'}</p>
        </div>
      </div>
      <StatusBadge status={session.status} />
    </div>
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatTime(session.last_activity)}
      </span>
      <span className="flex items-center gap-1">
        <MessageSquare className="w-3 h-3" />
        {session.messages?.length || 0} messages
      </span>
    </div>
    {session.page_url && (
      <p className="text-xs text-gray-400 mt-2 truncate">
        <Globe className="w-3 h-3 inline mr-1" />
        {session.page_url}
      </p>
    )}
  </div>
);

// Chat Message
const ChatMessage = ({ message, isAgent }) => (
  <div className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
      message.sender_type === 'agent' ? 'bg-blue-100' : 
      message.sender_type === 'system' ? 'bg-gray-100' : 'bg-green-100'
    }`}>
      {message.sender_type === 'agent' ? <Headphones className="w-4 h-4 text-blue-600" /> :
       message.sender_type === 'system' ? <Bot className="w-4 h-4 text-gray-500" /> :
       <User className="w-4 h-4 text-green-600" />}
    </div>
    <div className={`max-w-[70%]`}>
      <div className={`flex items-center gap-2 mb-1 ${isAgent ? 'flex-row-reverse' : ''}`}>
        <span className="text-sm font-medium">{message.sender_name}</span>
        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
      </div>
      <div className={`rounded-2xl px-4 py-2 ${
        message.sender_type === 'agent' ? 'bg-blue-500 text-white' :
        message.sender_type === 'system' ? 'bg-gray-100 text-gray-600 italic' :
        'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  </div>
);

// Agent Dashboard Tab
const AgentDashboard = ({ token }) => {
  const [sessions, setSessions] = useState([]);
  const [counts, setCounts] = useState({ waiting: 0, active: 0, my_active: 0 });
  const [activeSession, setActiveSession] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [showCanned, setShowCanned] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/agent/sessions?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  const fetchCannedResponses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/canned-responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCannedResponses(data.responses || []);
      }
    } catch (err) {
      console.error('Error fetching canned responses:', err);
    }
  }, [token]);

  const claimSession = async (session) => {
    if (session.status === 'waiting') {
      try {
        await fetch(`${API_URL}/api/support-chat/agent/sessions/${session.id}/claim`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchSessions();
      } catch (err) {
        toast.error('Failed to claim session');
      }
    }
    setActiveSession(session);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/support-chat/agent/sessions/${activeSession.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
        // Refresh session to get new message
        const sessionRes = await fetch(`${API_URL}/api/support-chat/sessions/${activeSession.id}`);
        if (sessionRes.ok) {
          const updated = await sessionRes.json();
          setActiveSession(updated);
        }
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const resolveSession = async () => {
    if (!activeSession) return;
    try {
      await fetch(`${API_URL}/api/support-chat/agent/sessions/${activeSession.id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_message: 'Thank you for chatting with us!' })
      });
      toast.success('Session resolved');
      setActiveSession(null);
      fetchSessions();
    } catch (err) {
      toast.error('Failed to resolve session');
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchCannedResponses();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchCannedResponses]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Refresh active session messages
  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(async () => {
        const res = await fetch(`${API_URL}/api/support-chat/sessions/${activeSession.id}`);
        if (res.ok) {
          const updated = await res.json();
          setActiveSession(updated);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeSession?.id]);

  return (
    <div className="flex h-[calc(100vh-250px)] gap-4">
      {/* Sessions Queue */}
      <div className="w-80 flex flex-col">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'waiting', label: 'Waiting', count: counts.waiting },
            { key: 'active', label: 'Active', count: counts.active },
            { key: 'mine', label: 'Mine', count: counts.my_active }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                filter === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Headphones className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {filter} sessions</p>
            </div>
          ) : (
            sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClaim={claimSession}
                isActive={activeSession?.id === session.id}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            {/* Header */}
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{activeSession.visitor_name}</CardTitle>
                    <CardDescription className="text-xs">
                      {activeSession.visitor_email || 'No email'} • Started {formatTime(activeSession.started_at)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={activeSession.status} />
                  {activeSession.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={resolveSession}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSession.messages?.map((msg, i) => (
                <ChatMessage key={i} message={msg} isAgent={msg.sender_type === 'agent'} />
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            {activeSession.status === 'active' && (
              <div className="p-4 border-t">
                {/* Canned Responses */}
                {showCanned && cannedResponses.length > 0 && (
                  <div className="mb-2 p-2 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    {cannedResponses.map(cr => (
                      <button
                        key={cr.id}
                        onClick={() => {
                          setNewMessage(cr.content);
                          setShowCanned(false);
                        }}
                        className="block w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                      >
                        <span className="font-medium">{cr.title}</span>
                        <span className="text-gray-400 ml-2 text-xs">{cr.shortcut}</span>
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCanned(!showCanned)}
                    title="Canned responses"
                  >
                    <Zap className="w-5 h-5" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending} className="bg-blue-500 hover:bg-blue-600">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Headphones className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Select a chat to respond</h3>
              <p className="text-sm mt-1">Click on a waiting or active session to view</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Widget Page Exclusions Component
const WidgetPageExclusions = ({ token }) => {
  const [pages, setPages] = useState([]);
  const [newPath, setNewPath] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/widget/excluded-pages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { const d = await res.json(); setPages(d.pages || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  const addPage = async () => {
    if (!newPath.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/support-chat/widget/excluded-pages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_path: newPath.trim() })
      });
      if (res.ok) { setNewPath(''); fetchPages(); toast.success('Page excluded'); }
      else { const d = await res.json(); toast.error(d.detail || 'Error'); }
    } catch (err) { toast.error('Failed to add'); }
  };

  const removePage = async (id) => {
    try {
      await fetch(`${API_URL}/api/support-chat/widget/excluded-pages/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPages();
    } catch (err) { toast.error('Failed to remove'); }
  };

  useEffect(() => { fetchPages(); }, [fetchPages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Page Exclusions</CardTitle>
        <CardDescription>Hide the public chat widget on specific pages. Use * for wildcards (e.g., /blog/*)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newPath} onChange={e => setNewPath(e.target.value)} placeholder="/page-path or /section/*" className="flex-1" data-testid="exclude-page-input" />
          <Button onClick={addPage} disabled={!newPath.trim()} data-testid="exclude-page-btn">
            <Plus className="w-4 h-4 mr-1" /> Exclude
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : pages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No pages excluded. The chat widget shows on all public pages.</p>
        ) : (
          <div className="space-y-2">
            {pages.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <code className="text-sm font-mono">{p.page_path}</code>
                <button onClick={() => removePage(p.id)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Chatbot Settings Tab
const ChatbotSettings = ({ token }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/chatbot/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/support-chat/chatbot/settings`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Chatbot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable AI Chatbot</p>
              <p className="text-sm text-gray-500">When enabled, visitors will interact with AI first</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>Configure the AI model for the chatbot (settings only - AI integration pending)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Model Provider</label>
              <select
                value={settings.model_provider}
                onChange={(e) => setSettings({ ...settings, model_provider: e.target.value })}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Model Name</label>
              <Input
                value={settings.model_name}
                onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
                placeholder="gpt-4o"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Temperature (0-1)</label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Tokens</label>
              <Input
                type="number"
                value={settings.max_tokens}
                onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">System Prompt</label>
            <textarea
              value={settings.system_prompt}
              onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
              rows={6}
              className="w-full mt-1 p-3 border rounded-lg font-mono text-sm"
              placeholder="You are a helpful assistant..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Greeting Message</label>
            <Input
              value={settings.greeting_message}
              onChange={(e) => setSettings({ ...settings, greeting_message: e.target.value })}
              placeholder="Hi! How can I help you today?"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fallback Message (when AI doesn&apos;t understand)</label>
            <Input
              value={settings.fallback_message}
              onChange={(e) => setSettings({ ...settings, fallback_message: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Offline Message</label>
            <Input
              value={settings.offline_message}
              onChange={(e) => setSettings({ ...settings, offline_message: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Widget Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={settings.widget_appearance?.primary_color || '#10B981'}
                  onChange={(e) => setSettings({
                    ...settings,
                    widget_appearance: { ...settings.widget_appearance, primary_color: e.target.value }
                  })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={settings.widget_appearance?.primary_color || '#10B981'}
                  onChange={(e) => setSettings({
                    ...settings,
                    widget_appearance: { ...settings.widget_appearance, primary_color: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Position</label>
              <select
                value={settings.widget_appearance?.position || 'bottom-right'}
                onChange={(e) => setSettings({
                  ...settings,
                  widget_appearance: { ...settings.widget_appearance, position: e.target.value }
                })}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Widget Title</label>
              <Input
                value={settings.widget_appearance?.title || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  widget_appearance: { ...settings.widget_appearance, title: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subtitle</label>
              <Input
                value={settings.widget_appearance?.subtitle || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  widget_appearance: { ...settings.widget_appearance, subtitle: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Escalation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Escalation Keywords (comma-separated)</label>
            <Input
              value={settings.escalation_keywords?.join(', ') || ''}
              onChange={(e) => setSettings({
                ...settings,
                escalation_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="speak to human, real person, supervisor"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Auto-escalate after failed responses</label>
            <Input
              type="number"
              value={settings.auto_escalate_after || 3}
              onChange={(e) => setSettings({ ...settings, auto_escalate_after: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>Set when live agents are available. Outside these hours, the offline message is shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Working Hours</p>
              <p className="text-sm text-gray-500">Restrict live chat to specific hours</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.working_hours?.enabled || false}
                onChange={(e) => setSettings({ ...settings, working_hours: { ...settings.working_hours, enabled: e.target.checked } })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          {settings.working_hours?.enabled && (
            <div className="space-y-2">
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                const schedule = settings.working_hours?.schedule?.[day];
                const isEnabled = schedule !== null && schedule !== undefined;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <label className="w-24 text-sm capitalize font-medium">{day}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isEnabled}
                        onChange={(e) => {
                          const newSchedule = { ...settings.working_hours.schedule };
                          newSchedule[day] = e.target.checked ? { start: '09:00', end: '18:00' } : null;
                          setSettings({ ...settings, working_hours: { ...settings.working_hours, schedule: newSchedule } });
                        }}
                        className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                    {isEnabled ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={schedule?.start || '09:00'} onChange={(e) => {
                          const newSchedule = { ...settings.working_hours.schedule };
                          newSchedule[day] = { ...newSchedule[day], start: e.target.value };
                          setSettings({ ...settings, working_hours: { ...settings.working_hours, schedule: newSchedule } });
                        }} className="px-2 py-1 border rounded text-sm" />
                        <span className="text-gray-400">to</span>
                        <input type="time" value={schedule?.end || '18:00'} onChange={(e) => {
                          const newSchedule = { ...settings.working_hours.schedule };
                          newSchedule[day] = { ...newSchedule[day], end: e.target.value };
                          setSettings({ ...settings, working_hours: { ...settings.working_hours, schedule: newSchedule } });
                        }} className="px-2 py-1 border rounded text-sm" />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Widget Page Exclusions */}
      <WidgetPageExclusions token={token} />

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="bg-blue-500 hover:bg-blue-600">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

// Knowledge Base Tab
const KnowledgeBase = ({ token }) => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [form, setForm] = useState({
    title: '', content: '', category: 'general', tags: [], questions: []
  });

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/knowledge-base`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const saveArticle = async () => {
    try {
      const url = editArticle 
        ? `${API_URL}/api/support-chat/knowledge-base/${editArticle.id}`
        : `${API_URL}/api/support-chat/knowledge-base`;
      
      const res = await fetch(url, {
        method: editArticle ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success(editArticle ? 'Article updated' : 'Article created');
        setShowForm(false);
        setEditArticle(null);
        setForm({ title: '', content: '', category: 'general', tags: [], questions: [] });
        fetchArticles();
      }
    } catch (err) {
      toast.error('Failed to save article');
    }
  };

  const deleteArticle = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await fetch(`${API_URL}/api/support-chat/knowledge-base/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchArticles();
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  const importFromContent = async (source) => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/knowledge-base/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ source })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchArticles();
      }
    } catch (err) {
      toast.error('Failed to import');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Knowledge Base</h3>
          <p className="text-sm text-gray-500">{articles.length} articles for chatbot training</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => importFromContent('faqs')}>
            Import from FAQs
          </Button>
          <Button variant="outline" onClick={() => importFromContent('blog')}>
            Import from Blog
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" /> Add Article
          </Button>
        </div>
      </div>

      {/* Articles List */}
      <div className="grid gap-4">
        {articles.map(article => (
          <Card key={article.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{article.category}</Badge>
                    {article.source && <Badge variant="secondary">Imported from {article.source}</Badge>}
                  </div>
                  <h4 className="font-medium">{article.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.content}</p>
                  {article.questions?.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">Sample questions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.questions.slice(0, 3).map((q, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{q}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditArticle(article);
                      setForm({
                        title: article.title,
                        content: article.content,
                        category: article.category,
                        tags: article.tags || [],
                        questions: article.questions || []
                      });
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteArticle(article.id)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No knowledge base articles yet</p>
            <p className="text-sm mt-1">Add articles or import from existing content</p>
          </div>
        )}
      </div>

      {/* Article Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editArticle ? 'Edit Article' : 'New Article'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Article title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., FAQ, Services, Pricing"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full mt-1 p-3 border rounded-lg"
                  placeholder="Article content..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sample Questions (one per line)</label>
                <textarea
                  value={form.questions?.join('\n') || ''}
                  onChange={(e) => setForm({ ...form, questions: e.target.value.split('\n').filter(Boolean) })}
                  rows={3}
                  className="w-full mt-1 p-3 border rounded-lg"
                  placeholder="What questions does this article answer?"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowForm(false); setEditArticle(null); }}>
                  Cancel
                </Button>
                <Button onClick={saveArticle} className="bg-blue-500 hover:bg-blue-600">
                  Save Article
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Analytics Tab
const ChatAnalytics = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/support-chat/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [token, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {['day', 'week', 'month'].map(p => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <MessageSquare className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Total Sessions</p>
            <p className="text-3xl font-bold">{analytics?.total_sessions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-3xl font-bold">{analytics?.resolved_sessions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-500">Resolution Rate</p>
            <p className="text-3xl font-bold">{analytics?.resolution_rate?.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-sm text-gray-500">Avg Rating</p>
            <p className="text-3xl font-bold">{analytics?.average_rating?.toFixed(1) || '-'}/5</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents */}
      {analytics?.top_agents?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_agents.map((agent, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="font-medium">{agent.agent_name}</span>
                  </div>
                  <Badge>{agent.sessions} sessions</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main Component
export default function SupportChatDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please log in to access the support chat dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="support-chat-dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Headphones className="w-6 h-6 text-blue-500" />
          Customer Support Chat
        </h1>
        <p className="text-gray-500 mt-1">Manage live chats, chatbot settings, and knowledge base</p>
      </div>

      <Tabs defaultValue="agent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="agent" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" /> Live Chat
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <Bot className="w-4 h-4" /> Chatbot Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agent">
          <AgentDashboard token={token} />
        </TabsContent>

        <TabsContent value="chatbot">
          <ChatbotSettings token={token} />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBase token={token} />
        </TabsContent>

        <TabsContent value="analytics">
          <ChatAnalytics token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
