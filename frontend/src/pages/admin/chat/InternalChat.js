import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import {
  MessageCircle, Send, Search, Plus, Users, Hash, User, Paperclip, 
  Smile, MoreVertical, Phone, Video, Settings, X, Check, Image as ImageIcon,
  File, ChevronDown, Circle, Loader2, Building2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format time for messages
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Channel Icon Component
const ChannelIcon = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'dm': return <User className={className} />;
    case 'department': return <Building2 className={className} />;
    default: return <Hash className={className} />;
  }
};

// Message Component
const Message = ({ message, isOwn }) => (
  <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
      isOwn ? 'bg-green-100' : 'bg-gray-100'
    }`}>
      {message.sender?.photo_url ? (
        <img src={message.sender.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <span className="text-sm font-medium">
          {message.sender?.full_name?.charAt(0) || '?'}
        </span>
      )}
    </div>
    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <span className="text-sm font-medium text-gray-900">
          {isOwn ? 'You' : message.sender?.full_name || 'Unknown'}
        </span>
        <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
        {message.edited && <span className="text-xs text-gray-400">(edited)</span>}
      </div>
      <div className={`rounded-2xl px-4 py-2 ${
        isOwn ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.attachments?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((att, i) => (
              <a
                key={i}
                href={`${API_URL}${att.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-xs ${isOwn ? 'text-white/80' : 'text-blue-600'}`}
              >
                {att.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <File className="w-4 h-4" />}
                {att.filename}
              </a>
            ))}
          </div>
        )}
      </div>
      {message.reactions?.length > 0 && (
        <div className="flex gap-1 mt-1">
          {message.reactions.map((r, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {r.emoji} {r.users.length}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Channel List Item
const ChannelItem = ({ channel, isActive, onClick, currentUserId }) => {
  const getDisplayName = () => {
    if (channel.type === 'dm') {
      const otherMember = channel.member_details?.find(m => m.id !== currentUserId);
      return otherMember?.full_name || channel.name;
    }
    return channel.name;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'
      }`}
    >
      <ChannelIcon type={channel.type} className="w-5 h-5 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{getDisplayName()}</p>
        {channel.last_message && (
          <p className="text-xs text-gray-400 truncate">{channel.last_message}</p>
        )}
      </div>
      {channel.unread_count > 0 && (
        <Badge className="bg-green-500 text-white">{channel.unread_count}</Badge>
      )}
    </button>
  );
};

export default function InternalChat() {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token');
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [channelType, setChannelType] = useState('group');
  const [channelName, setChannelName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch channels
  const fetchChannels = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch messages for active channel
  const fetchMessages = useCallback(async (channelId) => {
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

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, [token]);

  // Search users
  const handleSearchUsers = async (query) => {
    setSearchUsers(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/chat/users/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  // Create channel
  const handleCreateChannel = async () => {
    if (channelType === 'dm' && selectedUsers.length !== 1) {
      toast.error('Select one user for direct message');
      return;
    }
    if (channelType === 'group' && !channelName.trim()) {
      toast.error('Enter a channel name');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/chat/channels`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: channelType,
          name: channelName,
          members: selectedUsers.map(u => u.id),
          department: selectedDepartment || undefined
        })
      });

      if (res.ok) {
        const channel = await res.json();
        setShowNewChannel(false);
        setSelectedUsers([]);
        setChannelName('');
        setSearchUsers('');
        fetchChannels();
        setActiveChannel(channel);
      }
    } catch (err) {
      toast.error('Failed to create channel');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChannel) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/channels/${activeChannel.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        const message = await res.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/chat/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const attachment = await res.json();
        // Send message with attachment
        const msgRes = await fetch(`${API_URL}/api/chat/channels/${activeChannel.id}/messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: '', attachments: [attachment] })
        });

        if (msgRes.ok) {
          const message = await msgRes.json();
          setMessages(prev => [...prev, message]);
        }
      }
    } catch (err) {
      toast.error('Failed to upload file');
    }
    e.target.value = '';
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial load
  useEffect(() => {
    fetchChannels();
    fetchDepartments();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchChannels, 5000);
    return () => clearInterval(interval);
  }, [fetchChannels, fetchDepartments]);

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);
      // Poll messages every 3 seconds when channel is active
      const interval = setInterval(() => fetchMessages(activeChannel.id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChannel, fetchMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-150px)] flex bg-white rounded-xl shadow-sm overflow-hidden" data-testid="internal-chat">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              Team Chat
            </h2>
            <Button size="sm" onClick={() => setShowNewChannel(true)} data-testid="new-chat-btn">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search channels..." className="pl-10" />
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Department Channels */}
          {channels.filter(c => c.type === 'department').length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Departments</p>
              {channels.filter(c => c.type === 'department').map(channel => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onClick={() => setActiveChannel(channel)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}

          {/* Group Channels */}
          {channels.filter(c => c.type === 'group').length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Channels</p>
              {channels.filter(c => c.type === 'group').map(channel => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onClick={() => setActiveChannel(channel)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}

          {/* Direct Messages */}
          {channels.filter(c => c.type === 'dm').length > 0 && (
            <div>
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Direct Messages</p>
              {channels.filter(c => c.type === 'dm').map(channel => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onClick={() => setActiveChannel(channel)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}

          {channels.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No channels yet</p>
              <p className="text-sm">Create a channel to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChannelIcon type={activeChannel.type} className="w-6 h-6 text-gray-500" />
                <div>
                  <h3 className="font-semibold">{activeChannel.name}</h3>
                  <p className="text-xs text-gray-400">
                    {activeChannel.members?.length || 0} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <Message
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  data-testid="message-input"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="bg-green-500 hover:bg-green-600"
                  data-testid="send-message-btn"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Select a channel to start chatting</h3>
              <p className="text-sm mt-1">Or create a new channel to connect with your team</p>
            </div>
          </div>
        )}
      </div>

      {/* New Channel Modal */}
      <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Channel Type */}
            <div className="flex gap-2">
              {[
                { type: 'dm', label: 'Direct Message', icon: User },
                { type: 'group', label: 'Group', icon: Users },
                { type: 'department', label: 'Department', icon: Building2 }
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setChannelType(type)}
                  className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                    channelType === type ? 'border-green-500 bg-green-50 text-green-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>

            {/* Channel Name (for group/department) */}
            {channelType !== 'dm' && (
              <Input
                placeholder="Channel name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            )}

            {/* Department Select */}
            {channelType === 'department' && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            )}

            {/* User Search */}
            <div>
              <Input
                placeholder="Search users to add..."
                value={searchUsers}
                onChange={(e) => handleSearchUsers(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        if (!selectedUsers.find(s => s.id === u.id)) {
                          setSelectedUsers([...selectedUsers, u]);
                        }
                        setSearchUsers('');
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.full_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(u => (
                  <Badge key={u.id} variant="secondary" className="gap-1">
                    {u.full_name}
                    <button onClick={() => setSelectedUsers(selectedUsers.filter(s => s.id !== u.id))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChannel(false)}>Cancel</Button>
            <Button onClick={handleCreateChannel} className="bg-green-500 hover:bg-green-600">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
