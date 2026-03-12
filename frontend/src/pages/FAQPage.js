import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQs, setOpenFAQs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faqsRes, catsRes] = await Promise.all([
          api.get('/faqs?status=published'),
          api.get('/faq-categories')
        ]);
        setFaqs(faqsRes.data);
        setCategories(catsRes.data.sort((a, b) => a.order - b.order));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category_slug === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && faq.status === 'published';
  });

  const toggleFAQ = (faqId) => {
    setOpenFAQs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const totalFAQs = faqs.filter(f => f.status === 'published').length;
  const selectedCat = categories.find(c => c.slug === selectedCategory);

  return (
    <>
      <Header />
      <Helmet>
        <title>Credit Repair & Credit Score FAQs - Expert Answers | Credlocity</title>
        <meta name="description" content="Get expert answers to 60+ credit repair questions. Complete FAQ guide covering credit scores, bureaus, FICO, and more. 16+ years experience, 79K+ clients helped." />
        <meta property="og:title" content="Credit Repair FAQs | Credlocity" />
        <meta property="og:description" content="Expert answers to all your credit questions" />
        
        {/* FAQPage Schema.org Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": filteredFAQs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": stripHtml(faq.answer),
                "author": faq.author_name ? {
                  "@type": "Person",
                  "name": faq.author_name,
                  "jobTitle": "CEO & Credit Repair Expert"
                } : undefined
              }
            }))
          })}
        </script>
      </Helmet>

      {/* HERO SECTION with gradient background */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Credit Repair & Credit Score FAQs - Complete Guide
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
            Get expert answers to all your credit questions. From understanding credit scores 
            to choosing the right credit repair service, find comprehensive answers to help 
            you make informed financial decisions.
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                {totalFAQs}+
              </div>
              <div className="text-sm md:text-base">Expert Answers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                {categories.length}
              </div>
              <div className="text-sm md:text-base">FAQ Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                16+
              </div>
              <div className="text-sm md:text-base">Years Experience</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                79K+
              </div>
              <div className="text-sm md:text-base">Clients Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR SECTION */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Search className="w-6 h-6" />
              Search FAQs
            </h2>
            <div className="relative">
              <input
                type="search"
                placeholder="Search for credit questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-xl text-lg border-2 border-white/30 focus:border-white focus:outline-none bg-white/90 text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID SECTION */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            📚 Browse FAQ Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  // Scroll to FAQ section
                  document.getElementById('faq-accordion')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  selectedCategory === cat.slug
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                }`}
              >
                <div className="text-4xl mb-3">{cat.icon || '📋'}</div>
                <div className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-600">
                  {faqs.filter(f => f.category_slug === cat.slug && f.status === 'published').length} questions
                </div>
              </button>
            ))}
          </div>
          
          {selectedCategory && (
            <div className="text-center mt-6">
              <button
                onClick={() => setSelectedCategory('')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← View All Categories
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section id="faq-accordion" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          {selectedCategory ? (
            <>
              <div className="mb-8 text-center">
                <div className="text-5xl mb-4">{selectedCat?.icon || '📋'}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {selectedCat?.name}
                </h2>
                {selectedCat?.description && (
                  <p className="text-lg text-gray-600">{selectedCat.description}</p>
                )}
              </div>
              
              {filteredFAQs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFAQs.map(faq => (
                    <div key={faq.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        <span className="text-3xl text-blue-600 flex-shrink-0">
                          {openFAQs.includes(faq.id) ? '−' : '+'}
                        </span>
                      </button>
                      
                      {openFAQs.includes(faq.id) && (
                        <div className="px-6 pb-6 border-t border-gray-200">
                          {/* Answer Content */}
                          <div 
                            className="prose prose-blue max-w-none mt-4"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                          
                          {/* Author Attribution (E-E-A-T) */}
                          {faq.author_name && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-semibold text-blue-900 mb-1">
                                Expert Answer by:
                              </p>
                              <Link 
                                to={`/team/${faq.author_slug || 'joeziel-joey-vazquez-davila'}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {faq.author_name}
                              </Link>
                              {faq.author_credentials && faq.author_credentials.length > 0 && (
                                <p className="text-sm text-gray-700 mt-1">
                                  {faq.author_credentials.join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Related Content */}
                          {faq.related_blog_posts && faq.related_blog_posts.length > 0 && (
                            <div className="mt-4">
                              <p className="font-semibold text-gray-900 mb-2">📖 Related Articles:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {faq.related_blog_posts.slice(0, 3).map(postId => (
                                  <li key={postId} className="text-blue-600 hover:text-blue-800">
                                    <Link to={`/blog/${postId}`}>Related Article</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-12">
                  No FAQs found. Try a different search or category.
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-600 py-12">
              Select a category above to view FAQs
            </p>
          )}
        </div>
      </section>

      {/* RELATED RESOURCES SECTION */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            📖 Related Credit Education Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Understanding Credit Scores
              </h3>
              <p className="text-gray-600 mb-4">
                Complete guide to FICO and VantageScore models
              </p>
              <Link to="/blog" className="text-blue-600 hover:text-blue-800 font-semibold">
                Learn More →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Credit Report Basics
              </h3>
              <p className="text-gray-600 mb-4">
                Everything you need to know about your credit report
              </p>
              <Link to="/blog" className="text-blue-600 hover:text-blue-800 font-semibold">
                Read Guide →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Your Consumer Rights
              </h3>
              <p className="text-gray-600 mb-4">
                Learn about FCRA, CROA, and TSR protections
              </p>
              <Link to="/why-us" className="text-blue-600 hover:text-blue-800 font-semibold">
                Know Your Rights →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl mb-8">
            Our credit repair experts are here to help. Get personalized answers and 
            start your journey to better credit today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/pricing"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Expert Help - Free Trial
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Chat With Us Live
            </Link>
          </div>
          <div className="space-y-2 text-sm md:text-base">
            <p>✓ Free consultation available</p>
            <p>✓ 180-day money-back guarantee</p>
            <p>✓ Trusted by 79,000+ clients</p>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default FAQPage;
