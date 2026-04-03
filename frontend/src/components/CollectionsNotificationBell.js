import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, DollarSign, TrendingUp, Target, Edit, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const typeStyle = (type) => {
  switch (type) {
    case 'collection_fee_earned': return { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' };
    case 'commission_earned': return { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'monthly_target_hit': return { icon: Target, color: 'text-amber-500', bg: 'bg-amber-50' };
    case 'commission_edited': return { icon: Edit, color: 'text-purple-500', bg: 'bg-purple-50' };
    default: return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

const timeAgo = (d) => {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dd = Math.floor(ms / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dd < 7) return `${dd}d ago`;
  return new Date(d).toLocaleDateString();
};

export default function CollectionsNotificationBell({ token }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/collections/notifications?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications || []);
        setUnread(data.unread_count || 0);
      }
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [token]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/collections/notifications/${id}/read`, {
        method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
      });
      setItems(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(p => Math.max(0, p - 1));
    } catch (e) { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/collections/notifications/mark-all-read`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      setItems(p => p.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (e) { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
        data-testid="collections-notification-bell"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse min-w-[18px] h-[18px]" data-testid="notification-unread-badge">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50" data-testid="notification-panel">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              {unread > 0 && <p className="text-indigo-200 text-xs">{unread} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-indigo-200 hover:text-white text-xs flex items-center gap-1" data-testid="mark-all-read-btn">
                  <CheckCheck className="w-3.5 h-3.5" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-indigo-200 hover:text-white p-0.5"><X className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">You'll be notified about commissions and targets</p>
              </div>
            ) : items.map(n => {
              const s = typeStyle(n.type);
              const Icon = s.icon;
              return (
                <div key={n.id} className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50/40' : ''}`} data-testid={`notif-${n.id}`}>
                  <div className="flex gap-3">
                    <div className={`p-1.5 rounded-full ${s.bg} flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
                        {n.link && <Link to={n.link} onClick={() => setOpen(false)} className="text-[11px] text-indigo-600 hover:underline">View</Link>}
                      </div>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)} className="p-1 hover:bg-gray-200 rounded-full flex-shrink-0" title="Mark read">
                        <Check className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
