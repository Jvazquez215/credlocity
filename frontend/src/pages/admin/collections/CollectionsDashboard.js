import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Phone, Users, DollarSign, AlertTriangle, CheckCircle, Clock,
  TrendingUp, ArrowRight, PhoneCall, MessageSquare, Mail
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CollectionsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/collections/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tierConfig = {
    1: { color: 'bg-blue-100 text-blue-700', label: 'Tier 1', desc: '1-45 days' },
    2: { color: 'bg-yellow-100 text-yellow-700', label: 'Tier 2', desc: '46-60 days' },
    3: { color: 'bg-orange-100 text-orange-700', label: 'Tier 3', desc: '61-90 days' },
    4: { color: 'bg-red-100 text-red-700', label: 'Tier 4', desc: '90+ days' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections Dashboard</h1>
          <p className="text-gray-500">Overview of collection accounts and performance</p>
        </div>
        <Link to="/admin/collections/accounts">
          <Button className="bg-primary-blue hover:bg-primary-blue/90">
            <Phone className="w-4 h-4 mr-2" />
            View All Accounts
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Accounts</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_accounts || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Collections</p>
                <p className="text-3xl font-bold text-green-600">{stats?.active_accounts || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Disputes</p>
                <p className="text-3xl font-bold text-amber-600">{stats?.open_tickets || 0}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Compliant Today</p>
                <p className="text-3xl font-bold text-emerald-600">{stats?.compliant_today || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Accounts by Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(tier => (
              <Link 
                key={tier} 
                to={`/admin/collections/accounts?tier=${tier}`}
                className="p-4 rounded-lg border hover:border-primary-blue transition-colors"
              >
                <Badge className={tierConfig[tier].color}>
                  {tierConfig[tier].label}
                </Badge>
                <p className="text-3xl font-bold mt-2">{stats?.tier_counts?.[`tier_${tier}`] || 0}</p>
                <p className="text-xs text-gray-500">{tierConfig[tier].desc}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Today's Calls</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <PhoneCall className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.today_calls || 0}</p>
                <p className="text-sm text-gray-500">calls logged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Today's Texts</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.today_texts || 0}</p>
                <p className="text-sm text-gray-500">SMS sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Today's Emails</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Mail className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.today_emails || 0}</p>
                <p className="text-sm text-gray-500">emails sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
