import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, AlertCircle, DollarSign, Gavel, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Notification type icons and colors
const getNotificationStyle = (type) => {
  switch (type) {
    case 'outbid':
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' };
    case 'bid_won':
      return { icon: Gavel, color: 'text-green-500', bg: 'bg-green-50' };
    case 'payment_received':
      return { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    case 'case_update':
      return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'new_case':
      return { icon: Gavel, color: 'text-purple-500', bg: 'bg-purple-50' };
    default:
      return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

// Format relative time
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Single notification item
const NotificationItem = ({ notification, onMarkRead }) => {
  const style = getNotificationStyle(notification.type);
  const Icon = style.icon;

  return (
    <div 
      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
        !notification.is_read ? 'bg-blue-50/50' : ''
      }`}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-full ${style.bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${style.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.is_read ? 'font-medium' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">
              {formatTimeAgo(notification.created_at)}
            </span>
            {notification.link && (
              <Link 
                to={notification.link} 
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="p-1.5 hover:bg-gray-200 rounded-full flex-shrink-0"
            title="Mark as read"
          >
            <Check className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function NotificationDropdown({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/notifications?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/marketplace/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/marketplace/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    const doFetch = async () => {
      try {
        const response = await fetch(`${API_URL}/api/marketplace/notifications?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unread_count || 0);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      }
    };

    if (token) {
      doFetch();
      
      // Poll every 30 seconds for new notifications
      pollIntervalRef.current = setInterval(doFetch, 30000);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
        data-testid="notification-bell"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse"
            data-testid="notification-badge"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          data-testid="notification-dropdown"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-purple-200 text-xs">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-purple-200 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-purple-200 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">You&apos;ll be notified when something happens</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t">
              <Link
                to="/attorney/notifications"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
