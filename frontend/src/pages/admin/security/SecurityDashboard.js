import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Activity, AlertTriangle, Users, Lock, FileText, 
  Clock, TrendingUp, RefreshCw, Eye, Search, Filter,
  CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import api from '../../../utils/api';

// Overview Stats Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className={`border-l-4 ${color}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-l-', 'text-')}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStatus, setHealthStatus] = useState(null);
  const [auditSummary, setAuditSummary] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [failedLogins, setFailedLogins] = useState([]);
  const [documentAccess, setDocumentAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    resourceType: '',
    days: 7
  });

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [healthRes, summaryRes, eventsRes, loginsRes, docAccessRes] = await Promise.all([
        api.get('/security/health'),
        api.get(`/security/audit-log/summary?days=${filters.days}`),
        api.get(`/security/audit-log?limit=50`),
        api.get(`/security/failed-logins?hours=${filters.days * 24}`),
        api.get(`/security/document-access?days=${filters.days}`)
      ]);
      
      setHealthStatus(healthRes.data);
      setAuditSummary(summaryRes.data);
      setAuditEvents(eventsRes.data.events || []);
      setFailedLogins(loginsRes.data.failed_attempts || []);
      setDocumentAccess(docAccessRes.data.access_events || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [filters.days]); // eslint-disable-line

  const getEventTypeColor = (type) => {
    if (type?.includes('denied') || type?.includes('failed')) return 'bg-red-100 text-red-800';
    if (type?.includes('override') || type?.includes('admin')) return 'bg-purple-100 text-purple-800';
    if (type?.includes('access') || type?.includes('login')) return 'bg-blue-100 text-blue-800';
    if (type?.includes('document')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-blue" />
            Security Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Monitor security events, access logs, and system health</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="border rounded-lg px-3 py-2 text-sm"
            value={filters.days}
            onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={fetchSecurityData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status Banner */}
      {healthStatus && (
        <Card className={`${healthStatus.status === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {healthStatus.status === 'healthy' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    System Status: {healthStatus.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last checked: {formatTimestamp(healthStatus.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                {healthStatus.services && Object.entries(healthStatus.services).map(([service, status]) => (
                  <Badge key={service} variant={status === 'active' ? 'default' : 'destructive'} className="capitalize">
                    {service.replace('_', ' ')}: {status}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      {auditSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Events" 
            value={auditSummary.total_events || 0}
            icon={Activity}
            color="border-l-blue-500"
            subtitle={`Last ${filters.days} days`}
          />
          <StatCard 
            title="Failed Access Attempts" 
            value={auditSummary.failed_access_attempts || 0}
            icon={AlertTriangle}
            color="border-l-red-500"
            subtitle="Blocked unauthorized access"
          />
          <StatCard 
            title="Unique Users" 
            value={auditSummary.unique_users || 0}
            icon={Users}
            color="border-l-green-500"
            subtitle="Active in period"
          />
          <StatCard 
            title="Failed Logins" 
            value={failedLogins.length}
            icon={Lock}
            color="border-l-orange-500"
            subtitle="Potential security threats"
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="audit-log" className="gap-2">
            <FileText className="w-4 h-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="failed-logins" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Failed Logins
          </TabsTrigger>
          <TabsTrigger value="document-access" className="gap-2">
            <Eye className="w-4 h-4" />
            Document Access
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Event Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Event Type Breakdown</CardTitle>
              <CardDescription>Distribution of security events by type</CardDescription>
            </CardHeader>
            <CardContent>
              {auditSummary?.event_counts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(auditSummary.event_counts).slice(0, 8).map(([type, count]) => (
                    <div key={type} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 truncate" title={type}>{type.replace(/\./g, ' ')}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events recorded in this period</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest 10 security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditEvents.slice(0, 10).map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type?.split('.').pop() || 'event'}
                      </Badge>
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-gray-500">
                          {event.resource_type && `${event.resource_type}`}
                          {event.user_id && ` • User: ${event.user_id.substring(0, 8)}...`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</p>
                      {event.success === false && (
                        <Badge variant="destructive" className="text-xs">Failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {auditEvents.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No events recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit-log">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Full Audit Log</CardTitle>
                  <CardDescription>Complete record of all security events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Filter by event type..." 
                    className="w-64"
                    value={filters.eventType}
                    onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditEvents
                      .filter(e => !filters.eventType || e.event_type?.includes(filters.eventType))
                      .map((event, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{formatTimestamp(event.timestamp)}</td>
                          <td className="px-4 py-3">
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {event.event_type || 'unknown'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{event.action}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {event.resource_type && `${event.resource_type}`}
                            {event.resource_id && `: ${event.resource_id.substring(0, 8)}...`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {event.user_id ? `${event.user_id.substring(0, 8)}...` : 'System'}
                          </td>
                          <td className="px-4 py-3">
                            {event.success !== false ? (
                              <Badge className="bg-green-100 text-green-800">Success</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {auditEvents.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No audit events found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Logins Tab */}
        <TabsContent value="failed-logins">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Failed Login Attempts
              </CardTitle>
              <CardDescription>Monitor potential brute force or unauthorized access attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {failedLogins.length > 0 ? (
                <div className="space-y-3">
                  {failedLogins.map((attempt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{attempt.metadata?.email || 'Unknown email'}</p>
                          <p className="text-sm text-gray-500">
                            IP: {attempt.ip_address || 'Unknown'} • 
                            Reason: {attempt.failure_reason || 'Invalid credentials'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">Failed</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(attempt.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No Failed Login Attempts</p>
                  <p className="text-gray-500">No suspicious login activity detected in this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Access Tab */}
        <TabsContent value="document-access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                Document Access Log
              </CardTitle>
              <CardDescription>Track who accessed case documents and when</CardDescription>
            </CardHeader>
            <CardContent>
              {documentAccess.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {documentAccess.map((access, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{formatTimestamp(access.timestamp)}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {access.user_id?.substring(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {access.resource_id?.substring(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {access.metadata?.case_id?.substring(0, 8) || 'N/A'}...
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="bg-blue-100 text-blue-800">
                              {access.metadata?.access_type || access.action || 'view'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No Document Access Logged</p>
                  <p className="text-gray-500">Document access events will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
