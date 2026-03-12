import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Linkedin, Twitter, Facebook, Award, Calendar, Megaphone, Newspaper } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AuthorProfile = () => {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pressAnnouncements, setPressAnnouncements] = useState({ press_releases: [], announcements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorData();
  }, [slug]);

  const fetchAuthorData = async () => {
    try {
      // Fetch author by slug
      const authorRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authors/slug/${slug}`);
      setAuthor(authorRes.data);

      // Fetch author's published blog posts
      const postsRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/posts?author_id=${authorRes.data.id}&status=published`);
      setPosts(postsRes.data);

      // Fetch related press releases and announcements
      try {
        const pressRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/team/${authorRes.data.id}/press-announcements`);
        setPressAnnouncements(pressRes.data);
      } catch (error) {
        console.log('No press/announcements for this team member');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching author data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600">Loading author profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!author) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Author Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The author you're looking for doesn't exist.</p>
          <Link to="/team" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Team
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{author.seo_meta_title || `${author.full_name} - ${author.title} | Credlocity`}</title>
        <meta
          name="description"
          content={author.seo_meta_description || `Learn more about ${author.full_name}, ${author.title} at Credlocity. ${author.specialization}`}
        />
        <meta property="og:title" content={`${author.full_name} - ${author.title}`} />
        <meta property="og:description" content={author.seo_meta_description || author.specialization} />
        {author.photo_url && <meta property="og:image" content={author.photo_url} />}
        <meta property="og:type" content="profile" />

        {/* Schema.org Person markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: author.full_name,
            jobTitle: author.title,
            description: author.specialization,
            image: author.photo_url,
            url: `https://credlocity.com/team/${author.slug}`,
            sameAs: [
              author.social_links?.linkedin,
              author.social_links?.twitter,
              author.social_links?.facebook
            ].filter(Boolean)
          })}
        </script>
      </Helmet>

      <Header />

      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>&gt;</span>
            <Link to="/team" className="hover:text-blue-600">Team</Link>
            <span>&gt;</span>
            <span className="text-gray-900 font-semibold">{author.full_name}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              {author.photo_url ? (
                <img
                  src={author.photo_url}
                  alt={author.full_name}
                  className="w-48 h-48 rounded-full object-cover border-8 border-white shadow-xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center text-6xl text-gray-600 font-bold border-8 border-white shadow-xl">
                  {author.full_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{author.full_name}</h1>
              <p className="text-xl text-gray-700 mb-2">{author.title}</p>
              {author.specialization && (
                <p className="text-lg text-blue-600 font-semibold mb-4">{author.specialization}</p>
              )}

              {/* Years of Experience Badge */}
              {author.years_experience > 0 && (
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-4">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">{author.years_experience}+ Years Experience</span>
                </div>
              )}

              {/* Social Links */}
              {(author.social_links?.linkedin || author.social_links?.twitter || author.social_links?.facebook) && (
                <div className="flex justify-center md:justify-start gap-3 mt-4">
                  {author.social_links?.linkedin && (
                    <a
                      href={author.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </a>
                  )}
                  {author.social_links?.twitter && (
                    <a
                      href={author.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition flex items-center gap-2"
                    >
                      <Twitter className="w-5 h-5" />
                      Twitter
                    </a>
                  )}
                  {author.social_links?.facebook && (
                    <a
                      href={author.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition flex items-center gap-2"
                    >
                      <Facebook className="w-5 h-5" />
                      Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About {author.full_name}</h2>
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: author.bio }}
          />
        </div>
      </section>

      {/* Credentials Section */}
      {author.credentials && author.credentials.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Credentials & Certifications</h2>
            <div className="flex flex-wrap gap-3">
              {author.credentials.map((credential, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold"
                >
                  <Award className="w-4 h-4" />
                  {credential}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Articles by {author.full_name} ({posts.length})
          </h2>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  to={`/blog/${post.slug}`}
                  key={post.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-xl text-gray-600">No articles published yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Press Releases & Announcements Section */}
      {(pressAnnouncements.press_releases?.length > 0 || pressAnnouncements.announcements?.length > 0) && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span>News & Announcements featuring {author.full_name}</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Announcements */}
              {pressAnnouncements.announcements?.map((announcement) => (
                <Link
                  to={`/announcements/${announcement.slug}`}
                  key={announcement.id}
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border-2 border-purple-100 hover:border-purple-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Megaphone size={12} />
                        Announcement
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(announcement.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{announcement.excerpt}</p>
                  </div>
                </Link>
              ))}

              {/* Press Releases */}
              {pressAnnouncements.press_releases?.map((pr) => (
                <Link
                  to={`/press-releases/${pr.slug}`}
                  key={pr.id}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Newspaper size={12} />
                        Press Release
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(pr.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{pr.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{pr.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
};

export default AuthorProfile;
