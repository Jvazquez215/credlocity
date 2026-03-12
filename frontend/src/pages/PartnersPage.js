import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Building, Users, Award, Star, ChevronRight, Search, Filter } from 'lucide-react';

const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, searchTerm, activeType]);

  const fetchData = async () => {
    try {
      const [partnersRes, typesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/partners`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/partner-types`)
      ]);
      
      if (partnersRes.ok) setPartners(await partnersRes.json());
      if (typesRes.ok) setPartnerTypes(await typesRes.json());
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = partners;

    if (activeType !== 'all') {
      filtered = filtered.filter(p => p.partner_type_id === activeType);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.short_bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPartners(filtered);
  };

  const getTypeById = (id) => partnerTypes.find(t => t.id === id);

  // Generate structured data for SEO
  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Credlocity Partners",
      "description": "Trusted partners in real estate, funding, mortgage, and more. Browse our network of verified professionals.",
      "provider": {
        "@type": "Organization",
        "name": "Credlocity",
        "url": "https://credlocity.com"
      },
      "hasPart": filteredPartners.map(partner => ({
        "@type": "Person",
        "name": partner.name,
        "jobTitle": partner.tagline,
        "worksFor": {
          "@type": "Organization",
          "name": partner.company_name
        },
        "url": `https://credlocity.com/partners/${partner.slug}`
      }))
    };
  };

  return (
    <>
      <Helmet>
        <title>Credlocity Partners - Trusted Real Estate, Funding & Mortgage Professionals</title>
        <meta name="description" content="Explore Credlocity's network of trusted partners in real estate, funding, mortgage, and more. Each partner is verified for expertise, experience, and trustworthiness." />
        <meta name="keywords" content="credlocity partners, real estate partners, mortgage professionals, funding partners, trusted financial partners" />
        <meta property="og:title" content="Credlocity Partners - Our Trusted Network" />
        <meta property="og:description" content="Connect with verified professionals in real estate, funding, and mortgage services through Credlocity's partner network." />
        <link rel="canonical" href="https://credlocity.com/partners" />
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center gap-4 mb-6">
                <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                  <Users className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Credlocity Partners
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Our network of verified professionals in real estate, funding, mortgage, and more. 
                Each partner meets our strict standards for expertise, experience, and trustworthiness.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mt-10">
                <div className="text-center">
                  <div className="text-3xl font-bold">{partners.length}+</div>
                  <div className="text-sm text-blue-200">Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{partnerTypes.length}</div>
                  <div className="text-sm text-blue-200">Industries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm text-blue-200">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                <span>Background Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Client Reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Established Businesses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Search */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search partners by name or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-0 transition"
                />
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                onClick={() => setActiveType('all')}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  activeType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Partners ({partners.length})
              </button>
              {partnerTypes.map(type => {
                const count = partners.filter(p => p.partner_type_id === type.id).length;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveType(type.id)}
                    className={`px-6 py-2 rounded-full font-medium transition ${
                      activeType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {type.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading partners...</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No partners found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search' : 'Check back soon for new partners'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPartners.map((partner) => {
                  const type = getTypeById(partner.partner_type_id);
                  return (
                    <Link
                      key={partner.id}
                      to={`/partners/${partner.slug}`}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Cover Image or Gradient */}
                      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
                        {partner.cover_image && (
                          <img 
                            src={partner.cover_image} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {/* Partner Photo */}
                        <div className="absolute -bottom-12 left-6">
                          {partner.photo_url ? (
                            <img
                              src={partner.photo_url}
                              alt={partner.name}
                              className="w-24 h-24 rounded-xl border-4 border-white object-cover shadow-lg group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-xl border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
                              <Users className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {/* Company Logo */}
                        {partner.company_logo && (
                          <div className="absolute top-3 right-3 bg-white rounded-lg p-2 shadow-md">
                            <img 
                              src={partner.company_logo} 
                              alt={partner.company_name}
                              className="h-8 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="pt-16 p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                              {partner.name}
                            </h3>
                            <p className="text-sm text-gray-600">{partner.company_name}</p>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {type?.name || 'Partner'}
                          </span>
                          {partner.years_experience && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              {partner.years_experience}+ Years
                            </span>
                          )}
                          {partner.is_featured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Star size={12} /> Featured
                            </span>
                          )}
                        </div>

                        {/* Tagline */}
                        {partner.tagline && (
                          <p className="text-sm text-gray-500 italic mb-3">"{partner.tagline}"</p>
                        )}

                        {/* Bio */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {partner.short_bio}
                        </p>

                        {/* Credentials Preview */}
                        {partner.credentials && partner.credentials.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {partner.credentials.slice(0, 2).map((cred, i) => (
                              <span key={i} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                {cred}
                              </span>
                            ))}
                            {partner.credentials.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{partner.credentials.length - 2} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Read More */}
                        <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                          View Full Profile
                          <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Become a Credlocity Partner
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
              Join our network of trusted professionals and connect with clients who need your expertise.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition"
            >
              Apply to Become a Partner
              <ChevronRight size={20} />
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default PartnersPage;
