import React, { useState, useEffect } from 'react';
import {
  Mail, Search, RefreshCw, Users, Tag, Download, Plus, Trash2, Eye,
  CheckCircle, XCircle, ToggleLeft, ToggleRight, X, Bell, Send, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TAG_COLORS = {
  cro: 'bg-teal-100 text-teal-800',
  attorney: 'bg-purple-100 text-purple-800',
  client: 'bg-blue-100 text-blue-800',
  blog: 'bg-green-100 text-green-800',
  press_release: 'bg-orange-100 text-orange-800',
  updates: 'bg-indigo-100 text-indigo-800',
  newsletter: 'bg-pink-100 text-pink-800',
  general: 'bg-gray-100 text-gray-800',
};

export default function EmailSubscriberManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [tagCounts, setTagCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', name: '', tags: ['general', 'blog', 'press_release', 'updates'] });
  const [activeTab, setActiveTab] = useState('subscribers');
  const [notifications, setNotifications] = useState([]);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifQueued, setNotifQueued] = useState(0);

  const token = localStorage.getItem('auth_token');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tagFilter) params.set('tag', tagFilter);
      if (search) params.set('search', search);
      params.set('limit', '200');
      const res = await fetch(`${API_URL}/api/subscribers/list?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setTotal(data.total || 0);
        setTagCounts(data.tag_counts || {});
      }
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/subscribers/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/subscribers/notifications?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotifTotal(data.total || 0);
        setNotifQueued(data.queued || 0);
      }
    } catch {}
  };

  useEffect(() => { fetchSubscribers(); fetchStats(); fetchNotifications(); }, [tagFilter]);

  const handleSearch = () => fetchSubscribers();

  const toggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    try {
      const res = await fetch(`${API_URL}/api/subscribers/${sub.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { toast.success(`Status changed to ${newStatus}`); fetchSubscribers(); }
    } catch { toast.error('Failed to update'); }
  };

  const deleteSub = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return;
    try {
      const res = await fetch(`${API_URL}/api/subscribers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { toast.success('Deleted'); fetchSubscribers(); fetchStats(); }
    } catch { toast.error('Failed to delete'); }
  };

  const addSubscriber = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/subscribers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        toast.success('Subscriber added');
        setShowAddForm(false);
        setAddForm({ email: '', name: '', tags: ['general', 'blog', 'press_release', 'updates'] });
        fetchSubscribers();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Failed');
      }
    } catch { toast.error('Failed to add'); }
  };

  const exportSubscribers = async () => {
    try {
      const params = tagFilter ? `?tag=${tagFilter}` : '';
      const res = await fetch(`${API_URL}/api/subscribers/export${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const csv = ['Email,Name,Tags', ...data.subscribers.map(s => `${s.email},${s.name},"${(s.tags || []).join(', ')}"`).join('\n')];
        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success(`Exported ${data.count} subscribers`);
      }
    } catch { toast.error('Export failed'); }
  };

  const toggleTag = (tag) => {
    setAddForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const updateNotifStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/subscribers/notifications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { toast.success(`Notification ${status}`); fetchNotifications(); }
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div data-testid="email-subscriber-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" /> Email Subscribers
          </h1>
          <p className="text-gray-500 mt-1">Manage email lists for blogs, press releases, and updates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportSubscribers} variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-indigo-600 hover:bg-indigo-700" size="sm" data-testid="add-subscriber-btn">
            <Plus className="w-4 h-4 mr-1" /> Add Subscriber
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button onClick={() => setActiveTab('subscribers')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subscribers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Users className="w-4 h-4 inline mr-1" /> Subscribers
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${activeTab === 'notifications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} data-testid="notifications-tab">
          <Bell className="w-4 h-4 inline mr-1" /> Notification Queue
          {notifQueued > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{notifQueued}</span>}
        </button>
      </div>

      {activeTab === 'notifications' ? (
        /* Notification Queue */
        <div data-testid="notification-queue">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Publish Notification Queue</CardTitle>
                  <CardDescription>Blog posts and press releases queued for subscriber notification</CardDescription>
                </div>
                <Button onClick={fetchNotifications} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications in queue</p>
                  <p className="text-sm mt-1">Notifications are auto-created when blogs or press releases are published</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start justify-between p-4 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${n.type === 'blog_published' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{n.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.type === 'blog_published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {n.type === 'blog_published' ? 'Blog' : 'Press Release'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.status === 'queued' ? 'bg-yellow-100 text-yellow-800' : n.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {n.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Target: {(n.target_tags || []).join(', ')} &middot; {new Date(n.created_at).toLocaleString()}
                            {n.sent_to_count && <> &middot; Sent to {n.sent_to_count} subscribers</>}
                          </p>
                          {n.excerpt && <p className="text-sm text-gray-400 mt-1 line-clamp-1">{n.excerpt}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {n.status === 'queued' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateNotifStatus(n.id, 'sent')} data-testid={`send-notif-${n.id}`}>
                              <Send className="w-3 h-3 mr-1" /> Mark Sent
                            </Button>
                            <Button size="sm" variant="outline" className="text-gray-500" onClick={() => updateNotifStatus(n.id, 'cancelled')}>
                              <XCircle className="w-3 h-3 mr-1" /> Cancel
                            </Button>
                          </>
                        )}
                        {n.status === 'sent' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {n.status === 'cancelled' && <XCircle className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-800">
            <p className="font-medium">How Notifications Work</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Notifications are automatically queued when a blog post or press release is published</li>
              <li>"Mark Sent" records that the notification was delivered to all matching subscribers</li>
              <li>Once a real email service is integrated (SendGrid/Resend), marking as "sent" will trigger actual email delivery</li>
              <li>Target tags determine which subscribers receive the notification</li>
            </ul>
          </div>
        </div>
      ) : (
      <>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Users className="w-5 h-5" /></div>
            <div><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{stats.total}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-600"><CheckCircle className="w-5 h-5" /></div>
            <div><p className="text-sm text-gray-500">Active</p><p className="text-xl font-bold">{stats.active}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-red-600"><XCircle className="w-5 h-5" /></div>
            <div><p className="text-sm text-gray-500">Unsubscribed</p><p className="text-xl font-bold">{stats.unsubscribed}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">By Source</p>
            <div className="space-y-1 text-sm">
              {Object.entries(stats.by_source || {}).slice(0, 3).map(([source, count]) => (
                <div key={source} className="flex justify-between"><span className="text-gray-600 capitalize">{source.replace(/_/g, ' ')}</span><span className="font-medium">{count}</span></div>
              ))}
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setTagFilter('')} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!tagFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All ({total})
        </button>
        {Object.entries(tagCounts).map(([tag, count]) => (
          <button key={tag} onClick={() => setTagFilter(tag)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${tagFilter === tag ? 'bg-indigo-600 text-white' : `${TAG_COLORS[tag] || 'bg-gray-100 text-gray-700'} hover:opacity-80`}`}>
            {tag.replace(/_/g, ' ')} ({count})
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="mb-6 border-indigo-200">
          <CardHeader><CardTitle className="text-lg">Add Subscriber</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={addSubscriber} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <Input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} required data-testid="subscriber-email-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <Input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TAG_COLORS).map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${addForm.tags.includes(tag) ? 'bg-indigo-600 text-white' : `${TAG_COLORS[tag]} hover:opacity-80`}`}>
                      {tag.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="subscriber-save-btn">Add</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or name..." className="pl-9" onKeyDown={e => e.key === 'Enter' && handleSearch()} data-testid="subscriber-search" />
            </div>
            <Button onClick={handleSearch} variant="outline"><Search className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriber List */}
      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : subscribers.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-500"><Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No subscribers found</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-500">Email</th>
                    <th className="text-left p-3 font-medium text-gray-500">Name</th>
                    <th className="text-left p-3 font-medium text-gray-500">Tags</th>
                    <th className="text-left p-3 font-medium text-gray-500">Source</th>
                    <th className="text-left p-3 font-medium text-gray-500">Status</th>
                    <th className="text-left p-3 font-medium text-gray-500">Date</th>
                    <th className="text-right p-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(s => (
                    <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.email}</td>
                      <td className="p-3">{s.name || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(s.tags || []).map(t => (
                            <span key={t} className={`px-1.5 py-0.5 rounded text-xs ${TAG_COLORS[t] || 'bg-gray-100 text-gray-800'}`}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 capitalize text-gray-500">{(s.sources || []).join(', ').replace(/_/g, ' ')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleStatus(s)} className="p-1 hover:bg-gray-100 rounded" title={s.status === 'active' ? 'Unsubscribe' : 'Reactivate'}>
                            {s.status === 'active' ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </button>
                          <button onClick={() => deleteSub(s.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      </>
      )}
    </div>
  );
}
