import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Linkedin, Twitter, Facebook } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Team = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authors?status=active`);
      setAuthors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setLoading(false);
    }
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getBioExcerpt = (bio) => {
    const plainText = stripHtmlTags(bio);
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  return (
    <>
      <Helmet>
        <title>Our Team - Credit Repair Experts | Credlocity</title>
        <meta name="description" content="Meet the Credlocity team of certified credit repair specialists dedicated to helping you achieve your financial goals and improve your credit score." />
        <meta property="og:title" content="Our Team | Credlocity" />
        <meta property="og:description" content="Meet our expert team of credit repair specialists" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Our experienced credit repair specialists are dedicated to helping you achieve your financial goals.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Loading team members...</p>
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No team members found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6 text-center">
                    {/* Photo */}
                    <div className="mb-4 flex justify-center">
                      {author.photo_url ? (
                        <img
                          src={author.photo_url}
                          alt={author.full_name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl text-gray-600 font-bold border-4 border-blue-100">
                          {author.full_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name and Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{author.full_name}</h3>
                    <p className="text-gray-600 mb-1">{author.title}</p>
                    
                    {/* Specialization */}
                    {author.specialization && (
                      <p className="text-sm text-blue-600 font-semibold mb-4">{author.specialization}</p>
                    )}

                    {/* Bio Excerpt */}
                    <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                      {getBioExcerpt(author.bio)}
                    </p>

                    {/* Social Links */}
                    {(author.social_links?.linkedin || author.social_links?.twitter || author.social_links?.facebook) && (
                      <div className="flex justify-center gap-3 mb-6">
                        {author.social_links?.linkedin && (
                          <a
                            href={author.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                            aria-label={`${author.full_name} LinkedIn`}
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {author.social_links?.twitter && (
                          <a
                            href={author.social_links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition"
                            aria-label={`${author.full_name} Twitter`}
                          >
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {author.social_links?.facebook && (
                          <a
                            href={author.social_links.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition"
                            aria-label={`${author.full_name} Facebook`}
                          >
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link
                      to={`/team/${author.slug}`}
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Team;
