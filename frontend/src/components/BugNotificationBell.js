import React, { useState, useEffect, useRef } from 'react';
import { Bug, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-600',
};

export default function BugNotificationBell({ token }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [recentTickets, setRecentTickets] = useState([]);
  const ref = useRef(null);

  const fetchCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tickets/notifications/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.open_count || 0);
      }
    } catch (e) { /* silent */ }
  };

  const fetchRecent = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentTickets((data.tickets || []).slice(0, 5));
      }
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    fetchCount();
    const iv = setInterval(fetchCount, 60000);
    return () => clearInterval(iv);
  }, [token]);

  useEffect(() => {
    if (open) fetchRecent();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        data-testid="bug-notification-bell"
        title="Bug Tickets"
      >
        <Bug className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] px-1" data-testid="bug-count-badge">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border z-[60] overflow-hidden" data-testid="bug-notification-dropdown">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Bug Reports</span>
            {count > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{count} open</Badge>}
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y">
            {recentTickets.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">No bug reports</div>
            ) : (
              recentTickets.map(t => (
                <Link
                  key={t.ticket_number}
                  to="/admin/bug-tickets"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-red-600">{t.ticket_number}</span>
                        <Badge className={`text-[10px] ${SEVERITY_COLORS[t.severity] || ''}`}>{t.severity}</Badge>
                        <span className="text-[10px] text-gray-400">{t.submitted_at?.slice(0, 10)}</span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${t.status === 'open' ? 'bg-red-100 text-red-700' : t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            to="/admin/bug-tickets"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 bg-gray-50 border-t text-center text-sm font-medium text-red-600 hover:text-red-700 hover:bg-gray-100"
            data-testid="view-all-tickets-link"
          >
            View All Bug Tickets
          </Link>
        </div>
      )}
    </div>
  );
}
