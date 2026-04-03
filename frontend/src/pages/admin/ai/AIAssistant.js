import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Trash2, Settings, Wifi, WifiOff, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    checkHealth();
    loadHistory();
  }, []);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  });

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API}/api/openclaw/health`, { headers: getHeaders() });
      const data = await res.json();
      setGatewayStatus(data);
      setGatewayUrl(data.gateway_url || '');
    } catch {
      setGatewayStatus({ status: 'error' });
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/api/openclaw/history/${sessionId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map(m => ({ role: m.role, content: m.content })));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const saveMessage = async (role, content) => {
    try {
      await fetch(`${API}/api/openclaw/history/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ session_id: sessionId, role, content })
      });
    } catch (e) {
      console.error('Failed to save message:', e);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try {
      await fetch(`${API}/api/openclaw/history/${sessionId}`, { method: 'DELETE', headers: getHeaders() });
      setMessages([]);
      toast.success('Chat history cleared');
    } catch {
      toast.error('Failed to clear history');
    }
  };

  const updateGatewayUrl = async () => {
    try {
      await fetch(`${API}/api/openclaw/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ gateway_url: gatewayUrl })
      });
      toast.success('Gateway URL updated');
      checkHealth();
      setShowSettings(false);
    } catch {
      toast.error('Failed to update');
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    saveMessage('user', text);

    const assistantMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch(`${API}/api/openclaw/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message: text, session_id: sessionId, stream: true })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: `Error: ${err.detail || err.error || 'Failed to connect'}` };
          return updated;
        });
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            // Handle error responses
            if (parsed.error) {
              fullText = `Error: ${parsed.error}`;
              break;
            }

            // Handle SSE streaming events from OpenClaw
            if (parsed.type === 'response.output_text.delta') {
              fullText += parsed.delta || '';
            } else if (parsed.type === 'response.completed') {
              // Extract text from completed response
              const output = parsed.response?.output || [];
              for (const item of output) {
                if (item.type === 'message' && item.content) {
                  for (const c of item.content) {
                    if (c.type === 'output_text' && c.text) {
                      if (!fullText) fullText = c.text;
                    }
                  }
                }
              }
            }
            // For non-streaming response format
            if (parsed.output && !fullText) {
              for (const item of parsed.output) {
                if (item.type === 'message' && item.content) {
                  for (const c of item.content) {
                    if (c.type === 'output_text') fullText += c.text || '';
                  }
                }
              }
            }
          } catch {
            // Skip unparseable lines
          }
        }

        if (fullText) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: fullText };
            return updated;
          });
        }
      }

      if (!fullText) fullText = 'No response received from OpenClaw.';
      saveMessage('assistant', fullText);

    } catch (e) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: `Connection error: ${e.message}` };
        return updated;
      });
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isReachable = gatewayStatus?.status === 'reachable';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50" data-testid="ai-assistant-page">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">OpenClaw AI Assistant</h1>
            <div className="flex items-center gap-2 text-xs">
              {isReachable ? (
                <span className="flex items-center gap-1 text-green-600"><Wifi className="w-3 h-3" /> Connected</span>
              ) : (
                <span className="flex items-center gap-1 text-red-500"><WifiOff className="w-3 h-3" /> Disconnected</span>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Superadmin Only</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Clear History" data-testid="clear-chat-btn">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Settings" data-testid="settings-btn">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 py-3 bg-white border-b shadow-sm" data-testid="settings-panel">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 shrink-0">Gateway URL:</label>
            <input
              type="text"
              value={gatewayUrl}
              onChange={e => setGatewayUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
              placeholder="http://127.0.0.1:18789"
              data-testid="gateway-url-input"
            />
            <button onClick={updateGatewayUrl} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700" data-testid="save-gateway-btn">
              Save
            </button>
            <button onClick={checkHealth} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50" data-testid="test-connection-btn">
              Test
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-indigo-50 rounded-2xl mb-4">
              <Bot className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">OpenClaw AI Assistant</h2>
            <p className="text-gray-500 max-w-md text-sm">
              Ask the AI to help with code changes, configurations, or any technical tasks. 
              Messages are sent to your OpenClaw Gateway.
            </p>
            {!isReachable && (
              <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                Gateway is not reachable. Configure the URL in settings or start your OpenClaw Gateway.
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} data-testid={`chat-msg-${idx}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              {msg.role === 'assistant' && !msg.content && loading && idx === messages.length - 1 ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 bg-white border-t">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask OpenClaw anything..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 max-h-32 overflow-y-auto"
              style={{ minHeight: '48px' }}
              data-testid="chat-input"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
            data-testid="send-btn"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
