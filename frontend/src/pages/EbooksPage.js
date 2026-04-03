import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, DollarSign, Tag, Loader2, CreditCard, Star, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const API = process.env.REACT_APP_BACKEND_URL;

const EbooksPage = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const params = filter !== 'all' ? `?category=${filter}` : '';
        const res = await fetch(`${API}/api/ebooks/public${params}`);
        if (res.ok) { const data = await res.json(); setEbooks(data.ebooks || []); }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [filter]);

  const featured = ebooks.filter(e => e.is_featured);
  const regular = ebooks.filter(e => !e.is_featured);

  return (
    <>
      <Helmet>
        <title>Credlocity Store - E-Books & Guides on Credit Repair</title>
        <meta name="description" content="Shop free and premium e-books on credit repair, debt management, FCRA rights, and financial wellness. Expert-written guides from Credlocity's legal team." />
        <link rel="canonical" href={`${window.location.origin}/store`} />
        <meta property="og:title" content="Credlocity Store - Credit Education E-Books & Guides" />
        <meta property="og:description" content="Expert-written resources on credit repair, debt management, and financial protection. Free and premium guides." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/store`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6">
            <BookOpen className="w-4 h-4" /> Credlocity Store
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">E-Books & Guides</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Expert-written resources on credit repair, debt management, and financial protection.
            Free downloads and premium guides for consumers and credit repair organizations.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2">
            {[
              { val: 'all', label: 'All E-Books' },
              { val: 'consumers', label: 'For Consumers' },
              { val: 'cros', label: 'For CROs' },
            ].map(t => (
              <button key={t.val} onClick={() => setFilter(t.val)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === t.val ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`} data-testid={`filter-${t.val}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured E-Books */}
      {featured.length > 0 && (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Featured
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map(ebook => (
                <Link key={ebook.id} to={`/store/${ebook.slug || ebook.id}`} className="flex bg-gray-50 rounded-xl overflow-hidden border hover:shadow-lg transition group" data-testid={`featured-${ebook.id}`}>
                  <div className="w-40 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-blue-50">
                    {ebook.cover_image_url ? (
                      <img src={ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`} alt={ebook.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[200px]"><BookOpen className="w-10 h-10 text-indigo-200" /></div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-2 ${ebook.price === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {ebook.price === 0 ? 'FREE' : `$${ebook.price.toFixed(2)}`}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition">{ebook.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ebook.description}</p>
                    <span className="text-indigo-600 text-sm font-medium flex items-center gap-1">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* E-Book Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></div>
          ) : ebooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No e-books available yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {regular.length > 0 && featured.length > 0 && (
                <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">All E-Books</h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="ebook-grid">
                {(featured.length > 0 ? regular : ebooks).map(ebook => (
                  <Link key={ebook.id} to={`/store/${ebook.slug || ebook.id}`} className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition group" data-testid={`ebook-card-${ebook.id}`}>
                    <div className="aspect-[3/4] bg-gradient-to-br from-indigo-100 to-blue-50 relative overflow-hidden">
                      {ebook.cover_image_url ? (
                        <img src={ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`} alt={ebook.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-16 h-16 text-indigo-200" /></div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-md ${ebook.price === 0 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {ebook.price === 0 ? 'FREE' : `$${ebook.price.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="text-xs px-2 py-1 bg-white/90 text-gray-700 rounded-full shadow-sm">
                          {ebook.category === 'cros' ? 'For CROs' : ebook.category === 'both' ? 'For All' : 'For Consumers'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-indigo-600 transition">{ebook.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ebook.description}</p>
                      {ebook.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {ebook.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                        ebook.price === 0 ? 'bg-green-600 text-white group-hover:bg-green-700' : 'bg-indigo-600 text-white group-hover:bg-indigo-700'
                      }`}>
                        {ebook.price === 0 ? <><Download className="w-4 h-4" /> Get Free</> : <><CreditCard className="w-4 h-4" /> View Details</>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default EbooksPage;
