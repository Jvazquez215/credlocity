import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ArrowLeft, Award, GraduationCap, Briefcase, Star, MapPin, Phone, Mail, 
  Globe, Linkedin, Twitter, Facebook, Instagram, Building, Users, 
  ChevronRight, Quote, Newspaper, Megaphone, Calendar, Play
} from 'lucide-react';

const PartnerDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartner();
  }, [slug]);

  const fetchPartner = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/partners/${slug}`);
      if (response.ok) {
        setPartner(await response.json());
      } else {
        navigate('/partners');
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
      navigate('/partners');
    } finally {
      setLoading(false);
    }
  };

  const generateStructuredData = () => {
    if (!partner) return {};

    const schemas = [];

    // Person Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": partner.name,
      "jobTitle": partner.tagline,
      "description": partner.short_bio,
      "image": partner.photo_url,
      "worksFor": {
        "@type": "Organization",
        "name": partner.company_name,
        "logo": partner.company_logo
      },
      "address": partner.city && partner.state ? {
        "@type": "PostalAddress",
        "addressLocality": partner.city,
        "addressRegion": partner.state
      } : undefined,
      "email": partner.email,
      "telephone": partner.phone,
      "url": partner.website,
      "sameAs": Object.values(partner.social_links || {}).filter(Boolean),
      "knowsAbout": partner.specializations,
      "hasCredential": partner.credentials?.map(cred => ({
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "certification",
        "name": cred
      })),
      "alumniOf": partner.education?.map(edu => ({
        "@type": "EducationalOrganization",
        "name": edu.institution
      }))
    });

    // LocalBusiness Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": partner.company_name,
      "image": partner.company_logo,
      "description": partner.what_we_do || partner.short_bio,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": partner.address,
        "addressLocality": partner.city,
        "addressRegion": partner.state,
        "postalCode": partner.zip_code
      },
      "telephone": partner.phone,
      "email": partner.email,
      "url": partner.website
    });

    // AggregateRating if reviews exist
    if (partner.reviews && partner.reviews.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${partner.name}'s Services`,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5",
          "reviewCount": partner.reviews.length
        }
      });
    }

    // BreadcrumbList
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://credlocity.com" },
        { "@type": "ListItem", "position": 2, "name": "Partners", "item": "https://credlocity.com/partners" },
        { "@type": "ListItem", "position": 3, "name": partner.name, "item": `https://credlocity.com/partners/${partner.slug}` }
      ]
    });

    return schemas;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading partner profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!partner) return null;

  const socialIcons = {
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook,
    instagram: Instagram
  };

  return (
    <>
      <Helmet>
        <title>{partner.meta_title || `${partner.name} - ${partner.company_name} | Credlocity Partner`}</title>
        <meta name="description" content={partner.meta_description || partner.short_bio} />
        {partner.meta_keywords?.length > 0 && (
          <meta name="keywords" content={partner.meta_keywords.join(', ')} />
        )}
        <meta property="og:title" content={partner.og_title || `${partner.name} - Credlocity Partner`} />
        <meta property="og:description" content={partner.og_description || partner.short_bio} />
        {partner.og_image && <meta property="og:image" content={partner.og_image} />}
        {partner.canonical_url && <link rel="canonical" href={partner.canonical_url} />}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight size={14} />
              <Link to="/partners" className="hover:text-blue-600">Partners</Link>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium">{partner.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative">
          {/* Cover Image */}
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
            {partner.cover_image && (
              <img 
                src={partner.cover_image} 
                alt="" 
                className="w-full h-full object-cover opacity-40"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Profile Card */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-32 md:-mt-24 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo & Logo */}
                  <div className="flex-shrink-0 text-center md:text-left">
                    {partner.photo_url ? (
                      <img
                        src={partner.photo_url}
                        alt={partner.name}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-lg mx-auto md:mx-0"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto md:mx-0">
                        <Users className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {partner.company_logo && (
                      <img
                        src={partner.company_logo}
                        alt={partner.company_name}
                        className="h-12 object-contain mt-4 mx-auto md:mx-0"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {partner.partner_type?.name || 'Partner'}
                      </span>
                      {partner.is_featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Star size={14} /> Featured Partner
                        </span>
                      )}
                      {partner.years_experience && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {partner.years_experience}+ Years Experience
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {partner.name}
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">{partner.company_name}</p>
                    {partner.tagline && (
                      <p className="text-lg text-blue-600 italic mb-4">"{partner.tagline}"</p>
                    )}

                    {/* Contact Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Phone size={18} /> Call
                        </a>
                      )}
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          <Mail size={18} /> Email
                        </a>
                      )}
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          <Globe size={18} /> Website
                        </a>
                      )}
                      {/* Social Links */}
                      {Object.entries(partner.social_links || {}).map(([platform, url]) => {
                        if (!url) return null;
                        const Icon = socialIcons[platform];
                        return Icon ? (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            title={platform}
                          >
                            <Icon size={20} />
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  {(partner.client_count || partner.success_rate) && (
                    <div className="flex-shrink-0 text-center md:text-right">
                      {partner.client_count && (
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-blue-600">{partner.client_count.toLocaleString()}+</div>
                          <div className="text-sm text-gray-500">Clients Served</div>
                        </div>
                      )}
                      {partner.success_rate && (
                        <div>
                          <div className="text-3xl font-bold text-green-600">{partner.success_rate}</div>
                          <div className="text-sm text-gray-500">Success Rate</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <section className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {partner.name}</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {partner.full_bio?.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>

              {/* Services */}
              {partner.what_we_do && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="text-blue-600" />
                    What We Do
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    {partner.what_we_do.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* Credentials & Education */}
              {(partner.credentials?.length > 0 || partner.education?.length > 0) && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Award className="text-green-600" />
                    Credentials & Education
                  </h2>

                  {partner.credentials?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Certifications & Licenses</h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.credentials.map((cred, i) => (
                          <span key={i} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                            ✓ {cred}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {partner.education?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <GraduationCap size={20} className="text-purple-600" />
                        Education
                      </h3>
                      <div className="space-y-3">
                        {partner.education.map((edu, i) => (
                          <div key={i} className="p-4 bg-purple-50 rounded-lg">
                            <div className="font-semibold text-gray-800">{edu.degree}</div>
                            <div className="text-gray-600">{edu.institution}</div>
                            {edu.year && <div className="text-sm text-gray-500">Class of {edu.year}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Awards */}
              {partner.awards?.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Star className="text-yellow-500" />
                    Awards & Recognition
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {partner.awards.map((award, i) => (
                      <div key={i} className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="font-semibold text-gray-800">{award.name}</div>
                        <div className="text-sm text-gray-600">{award.issuer}</div>
                        {award.year && <div className="text-sm text-yellow-600 font-medium mt-1">{award.year}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Testimonials & Reviews */}
              {(partner.testimonials?.length > 0 || partner.reviews?.length > 0) && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Quote className="text-blue-600" />
                    What Clients Say
                  </h2>
                  <div className="space-y-6">
                    {partner.testimonials?.map((test, i) => (
                      <div key={`t-${i}`} className="p-6 bg-blue-50 rounded-xl">
                        <p className="text-gray-700 italic text-lg mb-4">"{test.text}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                            {test.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{test.name}</div>
                            {test.company && <div className="text-sm text-gray-500">{test.company}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {partner.reviews?.map((review, i) => (
                      <div key={`r-${i}`} className="p-6 bg-gray-50 rounded-xl">
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, s) => (
                            <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        <div className="text-sm text-gray-500">— {review.author_name}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Video Testimonials */}
              {partner.video_testimonials?.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Play className="text-red-600" />
                    Video Testimonials
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {partner.video_testimonials.map((video, i) => (
                      <div key={`v-${i}`} className="bg-gray-50 rounded-xl overflow-hidden">
                        <div className="aspect-video">
                          {video.video_url?.includes('youtube.com') || video.video_url?.includes('youtu.be') ? (
                            <iframe
                              src={video.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                              title={video.title}
                              className="w-full h-full"
                              allowFullScreen
                              frameBorder="0"
                            />
                          ) : video.video_url?.includes('vimeo.com') ? (
                            <iframe
                              src={video.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                              title={video.title}
                              className="w-full h-full"
                              allowFullScreen
                              frameBorder="0"
                            />
                          ) : (
                            <video
                              src={video.video_url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Announcements */}
              {partner.related_announcements?.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Megaphone className="text-purple-600" />
                    Related Announcements
                  </h2>
                  <div className="space-y-4">
                    {partner.related_announcements.map((ann) => (
                      <Link
                        key={ann.id}
                        to={`/announcements/${ann.slug}`}
                        className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition group"
                      >
                        <div className="flex items-center gap-2 text-sm text-purple-600 mb-1">
                          <Calendar size={14} />
                          {new Date(ann.publish_date).toLocaleDateString()}
                        </div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition">
                          {ann.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.excerpt}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Press Releases */}
              {partner.related_press_releases?.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Newspaper className="text-blue-600" />
                    In the News
                  </h2>
                  <div className="space-y-4">
                    {partner.related_press_releases.map((pr) => (
                      <Link
                        key={pr.id}
                        to={`/press-releases/${pr.slug}`}
                        className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition group"
                      >
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                          <Calendar size={14} />
                          {new Date(pr.publish_date).toLocaleDateString()}
                        </div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                          {pr.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pr.excerpt}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Specializations */}
              {partner.specializations?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.specializations.map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {(partner.city || partner.state) && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="text-red-500" />
                    Location
                  </h3>
                  <p className="text-gray-700">
                    {partner.address && <>{partner.address}<br /></>}
                    {partner.city}, {partner.state} {partner.zip_code}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white text-center">
                <h3 className="font-bold text-xl mb-2">Ready to Connect?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Reach out to {partner.name} today and see how they can help you.
                </p>
                {partner.phone ? (
                  <a
                    href={`tel:${partner.phone}`}
                    className="block w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition"
                  >
                    Call Now
                  </a>
                ) : partner.email ? (
                  <a
                    href={`mailto:${partner.email}`}
                    className="block w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition"
                  >
                    Send Email
                  </a>
                ) : null}
              </div>

              {/* Back Link */}
              <Link
                to="/partners"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition justify-center"
              >
                <ArrowLeft size={18} />
                Back to All Partners
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PartnerDetail;
