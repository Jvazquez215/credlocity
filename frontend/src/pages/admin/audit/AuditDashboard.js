import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Users, Clock, Activity, AlertTriangle, Search, Eye, ChevronDown, ChevronRight,
  LogIn, LogOut, MousePointer, FileText, BarChart3, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

const AuditDashboard = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [activeSessions, setActiveSessions] = useState([]);
  const [allUsersSummary, setAllUsersSummary] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [userSummary, setUserSummary] = useState(null);
  const [daysFilter, setDaysFilter] = useState(7);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await api.get('/audit/active-sessions');
      setActiveSessions(res.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/audit/all-users-summary?days=${daysFilter}`);
      setAllUsersSummary(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [daysFilter]);

  useEffect(() => {
    fetchActiveSessions();
    fetchAllUsers();
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveSessions, fetchAllUsers]);

  const viewUserDetail = async (email) => {
    setSelectedUser(email);
    setActiveTab('user-detail');
    try {
      const [logsRes, sessRes, sumRes] = await Promise.all([
        api.get(`/audit/user/${encodeURIComponent(email)}/logs?days=${daysFilter}`),
        api.get(`/audit/user/${encodeURIComponent(email)}/sessions?days=${daysFilter}`),
        api.get(`/audit/user/${encodeURIComponent(email)}/summary?days=${daysFilter}`)
      ]);
      setUserLogs(logsRes.data || []);
      setUserSessions(sessRes.data || []);
      setUserSummary(sumRes.data);
    } catch (e) { console.error(e); }
  };

  const onlineCount = activeSessions.length;
  const idleCount = activeSessions.filter(s => s.is_idle).length;

  const tabs = [
    { id: 'live', label: 'Live Sessions', icon: Wifi },
    { id: 'overview', label: 'All Users', icon: Users },
    ...(selectedUser ? [{ id: 'user-detail', label: `User: ${selectedUser}`, icon: Eye }] : [])
  ];

  const roleColor = (role) => {
    const map = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-purple-100 text-purple-800', editor: 'bg-blue-100 text-blue-800', author: 'bg-green-100 text-green-800' };
    return map[role] || 'bg-gray-100 text-gray-700';
  };

  const eventIcon = (type) => {
    const map = { login: LogIn, logout: LogOut, login_failed: AlertTriangle, page_view: Eye, action: MousePointer, heartbeat: Activity };
    return map[type] || FileText;
  };

  return (
    <div className="p-6 space-y-6" data-testid="audit-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time & Audit Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor employee activity, sessions, and productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={daysFilter} onChange={e => setDaysFilter(parseInt(e.target.value))} className="border rounded-lg px-3 py-2 text-sm" data-testid="days-filter">
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { fetchActiveSessions(); fetchAllUsers(); }} data-testid="refresh-audit">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Wifi className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Online Now</p><p className="text-2xl font-bold text-green-700" data-testid="online-count">{onlineCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-xs text-gray-500">Idle</p><p className="text-2xl font-bold text-amber-700" data-testid="idle-count">{idleCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Staff</p><p className="text-2xl font-bold text-blue-700">{allUsersSummary.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Total Actions ({daysFilter}d)</p><p className="text-2xl font-bold text-purple-700">{allUsersSummary.reduce((s, u) => s + u.total_actions, 0)}</p></div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              data-testid={`audit-tab-${t.id}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Live Sessions */}
      {activeTab === 'live' && (
        <div className="space-y-3" data-testid="live-sessions">
          {activeSessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <WifiOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No Active Sessions</p>
              <p className="text-sm text-gray-500">No users are currently logged in</p>
            </div>
          ) : (
            activeSessions.map(s => (
              <div key={s.session_id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${s.is_idle ? 'border-amber-500' : 'border-green-500'}`} data-testid={`session-${s.session_id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${s.is_idle ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{s.user_name || s.user_email}</p>
                        <Badge className={roleColor(s.user_role)}>{s.user_role}</Badge>
                        {s.is_partner && <Badge className="bg-yellow-100 text-yellow-800">Partner</Badge>}
                        {s.is_idle && <Badge className="bg-amber-100 text-amber-800">IDLE {Math.round(s.idle_minutes)}m</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{s.user_email}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Session: <strong>{Math.round(s.session_duration_minutes)}m</strong></p>
                    <p className="text-xs text-gray-500">Page: {s.current_page || '—'}</p>
                    <p className="text-xs text-gray-400">Last action: {s.last_meaningful_action_detail || '—'}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => viewUserDetail(s.user_email)} data-testid={`view-user-${s.user_email}`}>
                    <Eye className="w-3 h-3 mr-1" /> Detail
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Users Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4" data-testid="users-overview">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} data-testid="search-users" />
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500">User</th>
                    <th className="px-4 py-3 text-left text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-gray-500">Logins</th>
                    <th className="px-4 py-3 text-left text-gray-500">Actions</th>
                    <th className="px-4 py-3 text-left text-gray-500">Last Login</th>
                    <th className="px-4 py-3 text-right text-gray-500">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allUsersSummary.filter(u => {
                    if (!search) return true;
                    const s = search.toLowerCase();
                    return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
                  }).map(u => (
                    <tr key={u.email} className="hover:bg-gray-50" data-testid={`user-row-${u.email}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3"><Badge className={roleColor(u.role)}>{u.role}</Badge></td>
                      <td className="px-4 py-3">
                        {u.is_online ? (
                          <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full" /> Online</span>
                        ) : (
                          <span className="text-gray-400">Offline</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{u.total_logins}</td>
                      <td className="px-4 py-3 font-semibold">{u.total_actions}</td>
                      <td className="px-4 py-3 text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => viewUserDetail(u.email)}><Eye className="w-3 h-3" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Detail */}
      {activeTab === 'user-detail' && selectedUser && (
        <UserDetailView
          email={selectedUser}
          logs={userLogs}
          sessions={userSessions}
          summary={userSummary}
          onBack={() => setActiveTab('overview')}
          roleColor={roleColor}
          eventIcon={eventIcon}
        />
      )}
    </div>
  );
};

const UserDetailView = ({ email, logs, sessions, summary, onBack, roleColor, eventIcon }) => {
  const [detailTab, setDetailTab] = useState('summary');

  return (
    <div className="space-y-4" data-testid="user-detail-view">
      <Button variant="ghost" onClick={onBack} className="text-gray-500 -ml-2">&larr; Back to All Users</Button>

      <h2 className="text-xl font-bold text-gray-900">{summary?.user_email || email}</h2>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{summary.total_sessions}</p>
            <p className="text-xs text-gray-500">Sessions</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{Math.round(summary.total_session_minutes)}m</p>
            <p className="text-xs text-gray-500">Total Time</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{summary.total_actions}</p>
            <p className="text-xs text-gray-500">Actions</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{summary.actions_per_hour}</p>
            <p className="text-xs text-gray-500">Actions/Hour</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{summary.idle_logouts}</p>
            <p className="text-xs text-gray-500">Idle Logouts</p>
          </CardContent></Card>
        </div>
      )}

      {/* Login Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-green-700">{summary.successful_logins}</p>
            <p className="text-xs text-gray-500">Successful Logins</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-red-600">{summary.login_attempts_failed}</p>
            <p className="text-xs text-gray-500">Failed Attempts</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{summary.page_views}</p>
            <p className="text-xs text-gray-500">Page Views</p>
          </CardContent></Card>
        </div>
      )}

      {/* Action Breakdown */}
      {summary?.action_counts && Object.keys(summary.action_counts).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Actions Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.action_counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <Badge key={k} className="bg-gray-100 text-gray-700 text-sm px-3 py-1">{k}: <strong className="ml-1">{v}</strong></Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub tabs */}
      <div className="border-b">
        <nav className="flex space-x-4">
          {[{ id: 'summary', label: 'Sessions' }, { id: 'activity', label: 'Activity Log' }].map(t => (
            <button key={t.id} onClick={() => setDetailTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${detailTab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sessions List */}
      {detailTab === 'summary' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-gray-500">Login</th>
                <th className="px-4 py-2 text-left text-gray-500">Logout</th>
                <th className="px-4 py-2 text-left text-gray-500">Duration</th>
                <th className="px-4 py-2 text-left text-gray-500">Last Action</th>
                <th className="px-4 py-2 text-left text-gray-500">Logout Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map(s => (
                <tr key={s.session_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(s.login_time).toLocaleString()}</td>
                  <td className="px-4 py-2">{s.logout_time ? new Date(s.logout_time).toLocaleString() : <Badge className="bg-green-100 text-green-800">Active</Badge>}</td>
                  <td className="px-4 py-2 font-medium">{Math.round(s.session_duration_minutes)}m</td>
                  <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{s.last_meaningful_action_detail || '—'}</td>
                  <td className="px-4 py-2">
                    {s.logout_reason === 'idle' && <Badge className="bg-amber-100 text-amber-800">Idle Timeout</Badge>}
                    {s.logout_reason === 'manual' && <Badge className="bg-blue-100 text-blue-800">Manual</Badge>}
                    {!s.logout_reason && !s.logout_time && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                    {s.logout_reason && s.logout_reason !== 'idle' && s.logout_reason !== 'manual' && <Badge className="bg-gray-100 text-gray-700">{s.logout_reason}</Badge>}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No sessions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Log */}
      {detailTab === 'activity' && (
        <div className="bg-white rounded-lg shadow max-h-[500px] overflow-y-auto">
          <div className="divide-y">
            {logs.map(log => {
              const Icon = eventIcon(log.event_type);
              const colors = {
                login: 'text-green-600', logout: 'text-blue-600', login_failed: 'text-red-600',
                page_view: 'text-gray-500', action: 'text-purple-600', heartbeat: 'text-gray-300'
              };
              if (log.event_type === 'heartbeat') return null;
              return (
                <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors[log.event_type] || 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.action_detail || log.event_type}</p>
                    <p className="text-xs text-gray-500">{log.page && `${log.page} · `}{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <Badge className={`text-xs ${log.event_type === 'login_failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{log.event_type}</Badge>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">No activity logs found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
