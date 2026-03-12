import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Newspaper, Megaphone, Filter, Calendar, ChevronRight } from 'lucide-react';

const PressReleasesPage = () => {
  const navigate = useNavigate();
  const [pressReleases, setPressReleases] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, press_releases, announcements

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [pressReleases, announcements, searchTerm, activeFilter]);

  const fetchData = async () => {
    try {
      const [prResponse, annResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/press-releases`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/announcements`)
      ]);
      
      if (prResponse.ok) {
        const prData = await prResponse.json();
        setPressReleases(prData.map(item => ({ ...item, itemType: 'press_release' })));
      }
      
      if (annResponse.ok) {
        const annData = await annResponse.json();
        setAnnouncements(annData.map(item => ({ ...item, itemType: 'announcement' })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let items = [];
    
    if (activeFilter === 'all' || activeFilter === 'press_releases') {
      items = [...items, ...pressReleases];
    }
    if (activeFilter === 'all' || activeFilter === 'announcements') {
      items = [...items, ...announcements];
    }

    if (searchTerm) {
      items = items.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by publish date descending
    items.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

    setFilteredItems(items);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeInfo = (item) => {
    if (item.itemType === 'press_release') {
      return { 
        label: 'Press Release', 
        color: 'bg-blue-100 text-blue-700',
        icon: Newspaper,
        route: `/press-releases/${item.slug}`
      };
    }
    const typeLabels = {
      general: { label: 'Announcement', color: 'bg-purple-100 text-purple-700' },
      promotion: { label: 'Promotion', color: 'bg-yellow-100 text-yellow-700' },
      acquisition: { label: 'Acquisition', color: 'bg-green-100 text-green-700' },
      product: { label: 'New Product', color: 'bg-cyan-100 text-cyan-700' },
      service: { label: 'New Service', color: 'bg-indigo-100 text-indigo-700' },
      partnership: { label: 'Partnership', color: 'bg-pink-100 text-pink-700' }
    };
    return { 
      ...typeLabels[item.announcement_type] || typeLabels.general,
      icon: Megaphone,
      route: `/announcements/${item.slug}`
    };
  };

  return (
    <>
      <Helmet>
        <title>Press Releases & Announcements - Credlocity</title>
        <meta name="description" content="Latest news, press releases, and announcements from Credlocity, America's most trusted credit repair company." />
        <meta property="og:title" content="Press Releases & Announcements - Credlocity" />
        <meta property="og:description" content="Stay updated with the latest news and company updates from Credlocity." />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Newspaper className="w-10 h-10 text-blue-600" />
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Megaphone className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              News & Announcements
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest news, press releases, and company announcements from Credlocity.
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    activeFilter === 'all' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({pressReleases.length + announcements.length})
                </button>
                <button
                  onClick={() => setActiveFilter('press_releases')}
                  className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                    activeFilter === 'press_releases' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Newspaper size={16} />
                  Press Releases ({pressReleases.length})
                </button>
                <button
                  onClick={() => setActiveFilter('announcements')}
                  className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                    activeFilter === 'announcements' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Megaphone size={16} />
                  Announcements ({announcements.length})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading content...</p>
            </div>
          )}

          {/* Content List */}
          {!loading && (
            <div className="space-y-6">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="flex justify-center gap-2 mb-4">
                    <Newspaper className="w-12 h-12 text-gray-300" />
                    <Megaphone className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No content found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search' : 'Check back soon for updates'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredItems.map((item) => {
                    const typeInfo = getTypeInfo(item);
                    const TypeIcon = typeInfo.icon;
                    
                    return (
                      <div
                        key={`${item.itemType}-${item.id}`}
                        onClick={() => navigate(typeInfo.route)}
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer overflow-hidden group"
                      >
                        <div className="flex flex-col md:flex-row">
                          {item.featured_image && (
                            <div className="md:w-1/3 relative overflow-hidden">
                              <img
                                src={item.featured_image}
                                alt={item.title}
                                className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${typeInfo.color}`}>
                                  <TypeIcon size={12} />
                                  {typeInfo.label}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className={`p-6 ${item.featured_image ? 'md:w-2/3' : 'w-full'}`}>
                            {!item.featured_image && (
                              <div className="mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${typeInfo.color}`}>
                                  <TypeIcon size={12} />
                                  {typeInfo.label}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <Calendar size={14} />
                              {formatDate(item.publish_date)}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                              {item.title}
                            </h2>
                            <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt}</p>
                            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                              Read More
                              <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PressReleasesPage;
