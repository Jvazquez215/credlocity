import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Edit, Star, MessageSquare, Users, Image, 
  TrendingUp, Eye, Clock, ArrowUpRight, BarChart3,
  Scale, Newspaper, Building2, AlertCircle, DollarSign,
  Flame, Calendar
} from 'lucide-react';
import api from '../../utils/api';

const StatCard = ({ icon: Icon, label, value, color, link, subtitle, trend }) => (
  <Link 
    to={link} 
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
  >
    <div className="flex items-start justify-between">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-sm font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
          <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 font-medium mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </Link>
);

const QuickAction = ({ icon: Icon, label, to, color }) => (
  <Link 
    to={to}
    className={`flex items-center gap-3 p-4 rounded-xl ${color} hover:opacity-90 transition text-white`}
  >
    <Icon className="w-6 h-6" />
    <span className="font-semibold">{label}</span>
    <ArrowUpRight className="w-4 h-4 ml-auto" />
  </Link>
);

const ActivityItem = ({ icon: Icon, title, subtitle, time, color }) => (
  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition">
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">{title}</p>
      <p className="text-sm text-gray-500 truncate">{subtitle}</p>
    </div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

const DashboardHome = () => {
  const [stats, setStats] = useState({
    pages: 0,
    blogPosts: 0,
    reviews: 0,
    authors: 0,
    lawsuits: 0,
    pressReleases: 0,
    partners: 0,
    pendingInquiries: 0,
    openTickets: 0,
    totalClients: 0,
    hotLeads: 0,
    clientsLast30Days: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pagesRes, postsRes, reviewsRes, authorsRes, lawsuitsRes, pressRes, partnersRes, inquiriesRes, ticketsRes, clientStatsRes] = await Promise.all([
          api.get('/pages').catch(() => ({ data: [] })),
          api.get('/blog/posts').catch(() => ({ data: { posts: [] } })),
          api.get('/reviews').catch(() => ({ data: [] })),
          api.get('/authors').catch(() => ({ data: [] })),
          api.get('/lawsuits').catch(() => ({ data: { lawsuits: [] } })),
          api.get('/press-releases').catch(() => ({ data: [] })),
          api.get('/admin/outsource/partners').catch(() => ({ data: [] })),
          api.get('/admin/outsource/inquiries').catch(() => ({ data: [] })),
          api.get('/admin/outsource/tickets').catch(() => ({ data: [] })),
          api.get('/admin/clients/stats').catch(() => ({ data: { total: 0, by_lead_status: {}, by_period: {} } }))
        ]);

        const posts = postsRes.data.posts || postsRes.data || [];
        const lawsuits = lawsuitsRes.data.lawsuits || lawsuitsRes.data || [];
        const inquiries = inquiriesRes.data || [];
        const tickets = ticketsRes.data || [];
        const clientStats = clientStatsRes.data || {};

        setStats({
          pages: Array.isArray(pagesRes.data) ? pagesRes.data.length : 0,
          blogPosts: posts.length,
          reviews: Array.isArray(reviewsRes.data) ? reviewsRes.data.length : 0,
          authors: Array.isArray(authorsRes.data) ? authorsRes.data.length : 0,
          lawsuits: lawsuits.length,
          pressReleases: Array.isArray(pressRes.data) ? pressRes.data.length : 0,
          partners: Array.isArray(partnersRes.data) ? partnersRes.data.length : 0,
          pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
          openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
          totalClients: clientStats.total || 0,
          hotLeads: clientStats.by_lead_status?.hot || 0,
          clientsLast30Days: clientStats.by_period?.last_30_days?.count || 0
        });

        setRecentPosts(posts.slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-blue to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Credlocity CMS</h1>
            <p className="text-blue-100 text-lg">Manage your content, partners, and business operations</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-blue-200">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction icon={Edit} label="New Blog Post" to="/admin/blog/create" color="bg-green-500" />
          <QuickAction icon={Scale} label="Add Lawsuit" to="/admin/lawsuits/new" color="bg-purple-500" />
          <QuickAction icon={Building2} label="Manage Partners" to="/admin/outsourcing" color="bg-blue-500" />
          <QuickAction icon={Star} label="Add Review" to="/admin/reviews/create" color="bg-amber-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={FileText} 
            label="Pages" 
            value={loading ? '...' : stats.pages}
            color="bg-blue-500"
            link="/admin/pages"
          />
          <StatCard 
            icon={Edit} 
            label="Blog Posts" 
            value={loading ? '...' : stats.blogPosts}
            color="bg-green-500"
            link="/admin/blog"
          />
          <StatCard 
            icon={Star} 
            label="Reviews" 
            value={loading ? '...' : stats.reviews}
            color="bg-purple-500"
            link="/admin/reviews"
          />
          <StatCard 
            icon={Users} 
            label="Team Members" 
            value={loading ? '...' : stats.authors}
            color="bg-amber-500"
            link="/admin/authors"
          />
        </div>
      </div>

      {/* Legal & Outsourcing Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Content</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              icon={Scale} 
              label="Lawsuits Filed" 
              value={loading ? '...' : stats.lawsuits}
              color="bg-red-500"
              link="/admin/lawsuits"
            />
            <StatCard 
              icon={Newspaper} 
              label="Press Releases" 
              value={loading ? '...' : stats.pressReleases}
              color="bg-indigo-500"
              link="/admin/press-releases"
            />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clients</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard 
              icon={Users} 
              label="Total Clients" 
              value={loading ? '...' : stats.totalClients}
              color="bg-green-500"
              link="/admin/clients"
            />
            <StatCard 
              icon={Flame} 
              label="Hot Leads" 
              value={loading ? '...' : stats.hotLeads}
              color={stats.hotLeads > 0 ? "bg-red-500" : "bg-gray-400"}
              link="/admin/clients?lead=hot"
              subtitle={stats.hotLeads > 0 ? "Ready to convert" : "No hot leads"}
            />
            <StatCard 
              icon={Calendar} 
              label="New (30 days)" 
              value={loading ? '...' : stats.clientsLast30Days}
              color="bg-blue-500"
              link="/admin/clients?days=30"
            />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Outsourcing</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard 
              icon={Building2} 
              label="Active Partners" 
              value={loading ? '...' : stats.partners}
              color="bg-teal-500"
              link="/admin/outsourcing/partners"
            />
            <StatCard 
              icon={AlertCircle} 
              label="Pending Inquiries" 
              value={loading ? '...' : stats.pendingInquiries}
              color={stats.pendingInquiries > 0 ? "bg-orange-500" : "bg-gray-400"}
              link="/admin/outsourcing/inquiries"
              subtitle={stats.pendingInquiries > 0 ? "Needs attention" : "All caught up!"}
            />
            <StatCard 
              icon={AlertCircle} 
              label="Open Tickets" 
              value={loading ? '...' : stats.openTickets}
              color={stats.openTickets > 0 ? "bg-red-500" : "bg-gray-400"}
              link="/admin/outsourcing/tickets"
              subtitle={stats.openTickets > 0 ? "Escalations" : "No open tickets"}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blog Posts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Blog Posts</h2>
            <Link to="/admin/blog" className="text-primary-blue text-sm font-medium hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="space-y-1">
              {recentPosts.map((post) => (
                <ActivityItem 
                  key={post.id}
                  icon={Edit}
                  title={post.title}
                  subtitle={post.category || 'Uncategorized'}
                  time={formatDate(post.created_at || post.date)}
                  color="bg-green-500"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No blog posts yet</p>
              <Link to="/admin/blog/create" className="text-primary-blue text-sm hover:underline">Create your first post</Link>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-800">Website</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-800">API</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-800">Database</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Connected</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/media" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm">
                <Image className="w-4 h-4 text-gray-500" />
                Media Library
              </Link>
              <Link to="/admin/settings" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                Site Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
