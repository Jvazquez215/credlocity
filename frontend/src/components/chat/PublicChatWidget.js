import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Pre-chat form to collect visitor info
const PreChatForm = ({ onSubmit, loading, settings }) => {
  const [form, setForm] = useState({ first_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-gray-900">Start a Conversation</h3>
        <p className="text-sm text-gray-500 mt-1">Please enter your details to begin</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="First Name *"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            data-testid="chat-first-name"
          />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <input
            type="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            data-testid="chat-email"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <input
            type="tel"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            data-testid="chat-phone"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="chat-start-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Start Chat
        </button>
      </form>
    </div>
  );
};

// Chat message component
const ChatMessage = ({ message }) => {
  const isVisitor = message.sender_type === 'visitor';
  const isSystem = message.sender_type === 'system';

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isVisitor ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        isVisitor 
          ? 'bg-green-500 text-white rounded-br-md' 
          : 'bg-gray-100 text-gray-900 rounded-bl-md'
      }`}>
        {!isVisitor && (
          <p className="text-xs font-medium mb-1 opacity-70">{message.sender_name}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isVisitor ? 'text-white/70' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// Main chat widget
export default function PublicChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState(null);
  const [shouldShow, setShouldShow] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch widget settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/support-chat/widget/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          
          const currentPath = window.location.pathname;
          const excludedPaths = data.excluded_pages || [];
          // Auto-exclude admin, attorney, company, partner portals
          const portalPrefixes = ['/admin', '/attorney', '/company', '/partner'];
          const isPortal = portalPrefixes.some(p => currentPath.startsWith(p));
          const isExcluded = excludedPaths.some(path => {
            if (path.endsWith('*')) {
              return currentPath.startsWith(path.slice(0, -1));
            }
            return currentPath === path;
          });
          setShouldShow(!isPortal && !isExcluded && data.widget_enabled !== false);
        }
      } catch (err) {
        console.error('Error fetching chat settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Start chat session
  const startSession = async (visitorInfo) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/support-chat/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: visitorInfo.first_name,
          email: visitorInfo.email,
          phone: visitorInfo.phone,
          page_url: window.location.href,
          create_lead: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setMessages(data.messages || []);
        
        // Add greeting message if configured
        if (settings?.greeting_message) {
          setMessages([{
            id: 'greeting',
            sender_type: 'agent',
            sender_name: settings?.widget_appearance?.title || 'Support',
            content: settings.greeting_message,
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !session) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Optimistically add message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_type: 'visitor',
      sender_name: 'You',
      content: messageContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/support-chat/sessions/${session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent })
      });

      if (res.ok) {
        // Message sent successfully
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (session && isOpen) {
      const pollMessages = async () => {
        try {
          const res = await fetch(`${API_URL}/api/support-chat/sessions/${session.id}`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
          }
        } catch (err) {
          console.error('Error polling messages:', err);
        }
      };

      pollIntervalRef.current = setInterval(pollMessages, 3000);
      return () => clearInterval(pollIntervalRef.current);
    }
  }, [session, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't render if widget should not show
  if (!shouldShow) return null;

  const primaryColor = settings?.widget_appearance?.primary_color || '#10B981';
  const position = settings?.widget_appearance?.position || 'bottom-right';
  const positionClasses = position === 'bottom-left' ? 'left-4' : 'right-24';

  return (
    <div className={`fixed bottom-4 ${positionClasses} z-50`} data-testid="public-chat-widget">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[500px]'
          }`}
          style={{ width: '380px' }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center justify-between cursor-pointer"
            style={{ backgroundColor: primaryColor }}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {settings?.widget_appearance?.title || 'Credlocity Support'}
                </h3>
                <p className="text-white/80 text-xs">
                  {settings?.widget_appearance?.subtitle || 'We typically reply within minutes'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1 hover:bg-white/20 rounded"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {!session ? (
                <PreChatForm onSubmit={startSession} loading={loading} settings={settings} />
              ) : (
                <>
                  {/* Messages */}
                  <div className="h-[360px] overflow-y-auto p-4 bg-gray-50">
                    {messages.map((msg, i) => (
                      <ChatMessage key={msg.id || i} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-3 border-t bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        data-testid="chat-message-input"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2 rounded-full text-white disabled:opacity-50 transition-colors"
                        style={{ backgroundColor: primaryColor }}
                        data-testid="chat-send-btn"
                      >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: primaryColor }}
        data-testid="chat-bubble-btn"
        aria-label="Open live chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
