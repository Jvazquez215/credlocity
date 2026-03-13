import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Globe, FileText, MessageSquare, Star, Image, Eye,
  Loader2, ArrowUpRight, TrendingUp, CheckCircle2, Newspaper
} from 'lucide-react';
import api from '../../../utils/api';

export default function MarketingDashboard() {
  const [stats, setStats] = useState({ pages: 0, posts: 0, reviews: 0, media: 0, press: 0, pendingReviews: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [pagesRes, postsRes, reviewsRes, pressRes] = await Promise.all([
        api.get('/pages').catch(() => ({ data: [] })),
        api.get('/blog/posts').catch(() => ({ data: { posts: [] } })),
        api.get('/reviews').catch(() => ({ data: [] })),
        api.get('/press-releases').catch(() => ({ data: [] })),
      ]);
      const posts = postsRes.data?.posts || postsRes.data || [];
      const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      setStats({
        pages: Array.isArray(pagesRes.data) ? pagesRes.data.length : 0,
        posts: posts.length,
        reviews: reviews.length,
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        press: Array.isArray(pressRes.data) ? pressRes.data.length : 0,
      });
      setRecentPosts(posts.slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6" data-testid="marketing-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
        <p className="text-gray-500 mt-1">Content, reviews, and website performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI icon={FileText} label="Pages" value={stats.pages} color="bg-blue-500" />
        <KPI icon={MessageSquare} label="Blog Posts" value={stats.posts} color="bg-green-500" />
        <KPI icon={Star} label="Reviews" value={stats.reviews} color="bg-purple-500" />
        <KPI icon={Newspaper} label="Press Releases" value={stats.press} color="bg-orange-500" />
        <KPI icon={CheckCircle2} label="Pending Reviews" value={stats.pendingReviews} color="bg-yellow-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Blog Posts</CardTitle>
              <Link to="/admin/blog" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No posts yet.</p>
            ) : (
              <div className="space-y-2">
                {recentPosts.map((p, i) => (
                  <div key={p.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.created_at?.split('T')[0]}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{p.status || 'draft'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/blog" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium text-green-700">
                <MessageSquare className="w-4 h-4" /> Blog
              </Link>
              <Link to="/admin/pages" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium text-blue-700">
                <FileText className="w-4 h-4" /> Pages
              </Link>
              <Link to="/admin/review-approval" className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-sm font-medium text-yellow-700">
                <Star className="w-4 h-4" /> Review Queue
              </Link>
              <Link to="/admin/media" className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-sm font-medium text-purple-700">
                <Image className="w-4 h-4" /> Media
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
