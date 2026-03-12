import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, X, Send, Loader2, Minimize2, Maximize2, Plus, Search,
  User, Users, Hash, Building2, Paperclip, Link2, FileText, Briefcase,
  UserCheck, Scale, ChevronDown, Check
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Record type icons
const RECORD_TYPES = [
  { type: 'client', label: 'Client', icon: User, collection: 'clients' },
  { type: 'lead', label: 'Lead', icon: UserCheck, collection: 'leads' },
  { type: 'case', label: 'Case', icon: Scale, collection: 'cases' },
  { type: 'company', label: 'Company', icon: Building2, collection: 'companies' }
];

// Format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Attached Record Badge
const AttachedRecordBadge = ({ record, onRemove }) => {
  const typeConfig = RECORD_TYPES.find(t => t.type === record.type);
  const Icon = typeConfig?.icon || FileText;
  
  return (
    <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
      <Icon className="w-3 h-3" />
      <span className="font-medium">{record.name || record.id}</span>
      {onRemove && (
        <button onClick={() => onRemove(record)} className="hover:text-blue-900">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// Record Search Popup
const RecordSearchPopup = ({ onSelect, onClose, token }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('client');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRecords = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/chat/search-records?type=${selectedType}&q=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.records || []);
      }
    } catch (err) {
      console.error('Error searching records:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, token]);

  useEffect(() => {
    const timer = setTimeout(searchRecords, 300);
    return () => clearTimeout(timer);
  }, [searchRecords]);

  const typeConfig = RECORD_TYPES.find(t => t.type === selectedType);
  const Icon = typeConfig?.icon || FileText;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-xl border z-50">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">Attach Record</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Type Selector */}
        <div className="flex gap-1 mb-2">
          {RECORD_TYPES.map(({ type, label, icon: TypeIcon }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                selectedType === type 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TypeIcon className="w-3 h-3 mx-auto mb-0.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${typeConfig?.label || 'records'}...`}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            {searchQuery ? 'No records found' : 'Type to search...'}
          </div>
        ) : (
          results.map(record => (
            <button
              key={record.id}
              onClick={() => {
                onSelect({ ...record, type: selectedType });
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{record.name || record.title || record.id}</p>
                <p className="text-xs text-gray-400 truncate">{record.email || record.description || ''}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// Message with attachments
const ChatMessage = ({ message, isOwn }) => (
  <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} mb-3`}>
    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium ${
      isOwn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`}>
      {message.sender?.full_name?.charAt(0) || '?'}
    </div>
    <div className={`max-w-[75%]`}>
      <div className={`rounded-2xl px-3 py-2 ${
        isOwn ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {/* Attached Records */}
      {message.attached_records?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {message.attached_records.map((record, i) => (
            <AttachedRecordBadge key={i} record={record} />
          ))}
        </div>
      )}
      <p className={`text-xs mt-1 ${isOwn ? 'text-right' : ''} text-gray-400`}>
        {formatTime(message.created_at)}
      </p>
    </div>
  </div>
);

// Channel selector
const ChannelSelector = ({ channels, activeChannel, onSelect, onCreateNew }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
      >
        {activeChannel ? (
          <>
            <Hash className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{activeChannel.name}</span>
          </>
        ) : (
          <span>Select Channel</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border z-50 max-h-64 overflow-y-auto">
          <button
            onClick={() => { onCreateNew(); setIsOpen(false); }}
            className="w-full flex items-center gap-2 p-3 text-green-600 hover:bg-green-50 border-b"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Channel</span>
          </button>
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => { onSelect(channel); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 ${
                activeChannel?.id === channel.id ? 'bg-green-50' : ''
              }`}
            >
              {channel.type === 'dm' ? <User className="w-4 h-4 text-gray-400" /> :
               channel.type === 'department' ? <Building2 className="w-4 h-4 text-gray-400" /> :
               <Hash className="w-4 h-4 text-gray-400" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{channel.name}</p>
                {channel.unread_count > 0 && (
                  <span className="text-xs text-green-600">{channel.unread_count} unread</span>
                )}
              </div>
              {activeChannel?.id === channel.id && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main CMS Chat Bubble
export default function CMSChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [showRecordSearch, setShowRecordSearch] = useState(false);
  const [attachedRecords, setAttachedRecords] = useState([]);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch channels
  const fetchChannels = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  }, [token]);

  // Fetch unread count
  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/unread`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadTotal(data.total_unread || 0);
      }
    } catch (err) {
      console.error('Error fetching unread:', err);
    }
  }, [token]);

  // Fetch messages
  const fetchMessages = useCallback(async (channelId) => {
    if (!token || !channelId) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/channels/${channelId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [token]);

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChannel) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/channels/${activeChannel.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          attached_records: attachedRecords
        })
      });

      if (res.ok) {
        const message = await res.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setAttachedRecords([]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle record attachment
  const handleAttachRecord = (record) => {
    if (!attachedRecords.find(r => r.id === record.id && r.type === record.type)) {
      setAttachedRecords([...attachedRecords, record]);
    }
  };

  // Remove attached record
  const handleRemoveRecord = (record) => {
    setAttachedRecords(attachedRecords.filter(r => !(r.id === record.id && r.type === record.type)));
  };

  // Initial load
  useEffect(() => {
    fetchChannels();
    fetchUnread();
    
    const interval = setInterval(() => {
      fetchChannels();
      fetchUnread();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchChannels, fetchUnread]);

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);
      const interval = setInterval(() => fetchMessages(activeChannel.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChannel, fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!token) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50" data-testid="cms-chat-bubble">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[500px]'
          }`}
          style={{ width: '400px' }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-between cursor-pointer"
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center gap-3">
              <ChannelSelector
                channels={channels}
                activeChannel={activeChannel}
                onSelect={setActiveChannel}
                onCreateNew={() => setShowNewChannel(true)}
              />
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
              {!activeChannel ? (
                <div className="flex-1 flex items-center justify-center h-[400px] text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Select a channel</p>
                    <p className="text-sm">or create a new one to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="h-[340px] overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          isOwn={msg.sender_id === user?.id}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attached Records Preview */}
                  {attachedRecords.length > 0 && (
                    <div className="px-3 py-2 bg-blue-50 border-t flex flex-wrap gap-1">
                      {attachedRecords.map((record, i) => (
                        <AttachedRecordBadge 
                          key={i} 
                          record={record} 
                          onRemove={handleRemoveRecord}
                        />
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-3 border-t bg-white relative">
                    {showRecordSearch && (
                      <RecordSearchPopup
                        onSelect={handleAttachRecord}
                        onClose={() => setShowRecordSearch(false)}
                        token={token}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRecordSearch(!showRecordSearch)}
                        className={`p-2 rounded-full transition-colors ${
                          showRecordSearch ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        title="Attach record"
                      >
                        <Link2 className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        data-testid="cms-chat-input"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2 bg-green-500 text-white rounded-full disabled:opacity-50 hover:bg-green-600 transition-colors"
                        data-testid="cms-chat-send"
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
        className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 relative"
        data-testid="cms-chat-bubble-btn"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
