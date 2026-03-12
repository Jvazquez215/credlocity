import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Megaphone, Calendar, User, Newspaper, ChevronRight } from 'lucide-react';

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [relatedPressReleases, setRelatedPressReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/announcements/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
        
        // Fetch related press releases if any
        if (data.related_press_releases && data.related_press_releases.length > 0) {
          fetchRelatedPressReleases(data.related_press_releases);
        }
      } else {
        navigate('/press-releases');
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      navigate('/press-releases');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPressReleases = async (prIds) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/press-releases`);
      if (response.ok) {
        const allPRs = await response.json();
        const related = allPRs.filter(pr => prIds.includes(pr.id));
        setRelatedPressReleases(related);
      }
    } catch (error) {
      console.error('Error fetching related press releases:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeInfo = (type) => {
    const types = {
      general: { label: 'Announcement', color: 'bg-purple-100 text-purple-700', bgColor: 'from-purple-50 to-indigo-50' },
      promotion: { label: 'Promotion', color: 'bg-yellow-100 text-yellow-700', bgColor: 'from-yellow-50 to-amber-50' },
      acquisition: { label: 'Acquisition', color: 'bg-green-100 text-green-700', bgColor: 'from-green-50 to-emerald-50' },
      product: { label: 'New Product', color: 'bg-cyan-100 text-cyan-700', bgColor: 'from-cyan-50 to-blue-50' },
      service: { label: 'New Service', color: 'bg-indigo-100 text-indigo-700', bgColor: 'from-indigo-50 to-violet-50' },
      partnership: { label: 'Partnership', color: 'bg-pink-100 text-pink-700', bgColor: 'from-pink-50 to-rose-50' }
    };
    return types[type] || types.general;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading announcement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!announcement) {
    return null;
  }

  const typeInfo = getTypeInfo(announcement.announcement_type);
  // Use pre-fetched employee details from the API
  const relatedEmployees = announcement.related_employee_details || [];

  return (
    <>
      <Helmet>
        <title>{announcement.meta_title || `${announcement.title} - Credlocity`}</title>
        <meta name="description" content={announcement.meta_description || announcement.excerpt} />
        {announcement.meta_keywords && announcement.meta_keywords.length > 0 && (
          <meta name="keywords" content={announcement.meta_keywords.join(', ')} />
        )}
        <meta property="og:title" content={announcement.og_title || announcement.title} />
        <meta property="og:description" content={announcement.og_description || announcement.excerpt} />
        {announcement.og_image && <meta property="og:image" content={announcement.og_image} />}
        {announcement.canonical_url && <link rel="canonical" href={announcement.canonical_url} />}
        {announcement.schema_data && Object.keys(announcement.schema_data).length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(announcement.schema_data)}
          </script>
        )}
      </Helmet>

      <Header />

      <div className={`min-h-screen bg-gradient-to-b ${typeInfo.bgColor} to-gray-50 py-12`}>
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/press-releases')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to News & Announcements
          </button>

          {/* Main Content */}
          <article className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Featured Image */}
            {announcement.featured_image && (
              <div className="relative h-64 md:h-96">
                <img
                  src={announcement.featured_image}
                  alt={announcement.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${typeInfo.color}`}>
                    <Megaphone size={16} />
                    {typeInfo.label}
                  </span>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                {!announcement.featured_image && (
                  <div className="mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${typeInfo.color}`}>
                      <Megaphone size={16} />
                      {typeInfo.label}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={16} />
                  {formatDate(announcement.publish_date)}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {announcement.title}
                </h1>
                <p className="text-xl text-gray-600">{announcement.excerpt}</p>
              </div>

              {/* Related People - Show BEFORE content */}
              {relatedEmployees.length > 0 && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-purple-600" />
                    Featured Team Members
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedEmployees.map((member) => (
                      <Link
                        key={member.id}
                        to={`/team/${member.slug || member.id}`}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:shadow-md transition group border-2 border-purple-100 hover:border-purple-300"
                      >
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.full_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center">
                            <User size={24} className="text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition">
                            {member.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">{member.title}</p>
                          <p className="text-xs text-purple-600 mt-1 group-hover:underline">View Profile →</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-600 transition" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />

              {/* Related Press Releases */}
              {relatedPressReleases.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Newspaper size={20} className="text-blue-600" />
                    Related Press Releases
                  </h2>
                  <div className="space-y-4">
                    {relatedPressReleases.map((pr) => (
                      <Link
                        key={pr.id}
                        to={`/press-releases/${pr.slug}`}
                        className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition group"
                      >
                        <div className="flex items-center gap-3 text-sm text-blue-600 mb-1">
                          <Newspaper size={14} />
                          {formatDate(pr.publish_date)}
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {pr.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pr.excerpt}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AnnouncementDetail;
