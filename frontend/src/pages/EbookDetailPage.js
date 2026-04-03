import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Download, CreditCard, ArrowLeft, Tag, Users, Star, Share2, X, Loader2, User, Mail, Facebook, Instagram, Twitter, Copy, Check, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const EbookDetailPage = () => {
  const { slug } = useParams();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [related, setRelated] = useState([]);
  const [complementary, setComplementary] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/ebooks/slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setEbook(data);
          // Load related e-books (same category)
          const relRes = await fetch(`${API}/api/ebooks/public?category=${data.category}`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelated((relData.ebooks || []).filter(e => e.id !== data.id).slice(0, 4));
          }
          // Load complementary e-books
          if (data.complementary_ebook_ids?.length > 0) {
            const compRes = await fetch(`${API}/api/ebooks/${data.id}/complementary`);
            if (compRes.ok) {
              const compData = await compRes.json();
              setComplementary(compData || []);
            }
          }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  if (!ebook) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">E-Book Not Found</h1>
      <Link to="/store" className="text-indigo-600 hover:underline">Browse all e-books</Link>
    </div>
  );

  const isFree = ebook.price === 0;
  const pageUrl = `${window.location.origin}/store/${ebook.slug}`;
  const ogImage = ebook.cover_image_url
    ? (ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`)
    : `${window.location.origin}/og-default.png`;
  const shareText = ebook.social_caption || `Check out "${ebook.title}" from Credlocity - ${isFree ? 'Free Download!' : `Only $${ebook.price.toFixed(2)}`}`;

  return (
    <>
      <Helmet>
        <title>{ebook.meta_title || ebook.title} | Credlocity Store</title>
        <meta name="description" content={ebook.meta_description || ebook.description} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={ebook.meta_title || ebook.title} />
        <meta property="og:description" content={ebook.meta_description || ebook.description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Credlocity" />
        <meta property="product:price:amount" content={ebook.price.toString()} />
        <meta property="product:price:currency" content="USD" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ebook.meta_title || ebook.title} />
        <meta name="twitter:description" content={ebook.meta_description || ebook.description} />
        <meta name="twitter:image" content={ogImage} />
        {/* Schema.org */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": ebook.title,
          "description": ebook.description,
          "image": ogImage,
          "url": pageUrl,
          "author": { "@type": "Organization", "name": "Credlocity" },
          "publisher": { "@type": "Organization", "name": "Credlocity" },
          "offers": {
            "@type": "Offer",
            "price": ebook.price.toString(),
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        })}</script>
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link to="/store" className="hover:text-indigo-600">Store</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{ebook.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Cover Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-blue-50 relative" data-testid="ebook-cover">
                {ebook.cover_image_url ? (
                  <img
                    src={ebook.cover_image_url.startsWith('http') ? ebook.cover_image_url : `${API}${ebook.cover_image_url}`}
                    alt={ebook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <BookOpen className="w-24 h-24 text-indigo-200" />
                    <span className="text-indigo-400 font-cinzel text-xl font-bold">{ebook.title}</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`text-base font-bold px-4 py-2 rounded-full shadow-lg ${isFree ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {isFree ? 'FREE' : `$${ebook.price.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center" data-testid="ebook-details">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  ebook.category === 'cros' ? 'bg-purple-100 text-purple-700'
                  : ebook.category === 'both' ? 'bg-gray-100 text-gray-700'
                  : 'bg-blue-100 text-blue-700'
                }`}>
                  {ebook.category === 'cros' ? 'For CROs' : ebook.category === 'both' ? 'For All' : 'For Consumers'}
                </span>
                {ebook.is_featured && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="ebook-title">
                {ebook.title}
              </h1>

              <p className="text-gray-600 text-base leading-relaxed mb-4" data-testid="ebook-description">
                {ebook.description}
              </p>

              {/* Author & Release Date */}
              <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-gray-500">
                {ebook.author && (
                  <span className="flex items-center gap-1.5" data-testid="ebook-author">
                    <User className="w-4 h-4 text-gray-400" /> By <strong className="text-gray-700">{ebook.author}</strong>
                  </span>
                )}
                {ebook.release_date && (
                  <span className="flex items-center gap-1.5" data-testid="ebook-release-date">
                    <Calendar className="w-4 h-4 text-gray-400" /> {new Date(ebook.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>

              {ebook.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {ebook.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price & CTA */}
              <div className="bg-white rounded-xl border p-6 mb-6">
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {isFree ? 'Free' : `$${ebook.price.toFixed(2)}`}
                  </span>
                  {ebook.bonus_value_display && ebook.bonus_value_display > ebook.price && (
                    <span className="text-lg text-gray-400 line-through">${ebook.bonus_value_display.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold transition shadow-lg hover:shadow-xl ${
                    isFree
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  data-testid="get-ebook-btn"
                >
                  {isFree ? <><Download className="w-5 h-5" /> Download Free E-Book</> : <><CreditCard className="w-5 h-5" /> Purchase Now</>}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  {isFree ? 'Enter your name and email to download instantly.' : 'Secure payment via Authorize.net. Instant PDF delivery.'}
                </p>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Share:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                  data-testid="share-facebook"
                  title="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition"
                  data-testid="share-twitter"
                  title="Share on Twitter/X"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setShowSharePanel(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white hover:opacity-90 transition"
                  data-testid="share-instagram"
                  title="Share on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </button>
                <CopyLinkButton url={pageUrl} />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {ebook.download_count || 0} downloads</span>
                {!isFree && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {ebook.purchase_count || 0} purchases</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complementary E-Books */}
      {complementary.length > 0 && (
        <section className="py-12 bg-indigo-50">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-2">Complements This E-Book</h2>
            <p className="text-gray-500 text-sm mb-6">These resources pair well with "{ebook.title}" for a complete understanding.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {complementary.map(r => (
                <Link key={r.id} to={`/store/${r.slug}`} className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition group" data-testid={`comp-${r.id}`}>
                  <div className="aspect-[3/4] bg-gradient-to-br from-indigo-50 to-blue-50 relative">
                    {r.cover_image_url ? (
                      <img src={r.cover_image_url.startsWith('http') ? r.cover_image_url : `${API}${r.cover_image_url}`} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-indigo-200" /></div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shadow ${r.price === 0 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {r.price === 0 ? 'FREE' : `$${r.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{r.title}</h3>
                    {r.author && <p className="text-xs text-gray-400 mt-0.5">by {r.author}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related E-Books */}
      {related.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">Related E-Books</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/store/${r.slug}`} className="bg-gray-50 rounded-xl overflow-hidden border hover:shadow-lg transition group" data-testid={`related-${r.id}`}>
                  <div className="aspect-[3/4] bg-gradient-to-br from-indigo-50 to-blue-50 relative">
                    {r.cover_image_url ? (
                      <img src={r.cover_image_url.startsWith('http') ? r.cover_image_url : `${API}${r.cover_image_url}`} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-indigo-200" /></div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shadow ${r.price === 0 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {r.price === 0 ? 'FREE' : `$${r.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Download/Purchase Modal */}
      {showModal && <EbookAcquireModal ebook={ebook} onClose={() => setShowModal(false)} />}

      {/* Instagram Share Panel */}
      {showSharePanel && (
        <InstagramSharePanel
          ebook={ebook}
          shareText={shareText}
          pageUrl={pageUrl}
          ogImage={ogImage}
          onClose={() => setShowSharePanel(false)}
        />
      )}
    </>
  );
};


const CopyLinkButton = ({ url }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition" data-testid="copy-link" title="Copy link">
      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
    </button>
  );
};


const InstagramSharePanel = ({ ebook, shareText, pageUrl, ogImage, onClose }) => {
  const [captionCopied, setCaptionCopied] = useState(false);
  const caption = `${shareText}\n\nGet yours: ${pageUrl}\n\n#creditrepair #creditbuilding #financialliteracy #ebook #credlocity`;

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    toast.success('Caption copied!');
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const downloadImage = () => {
    if (ogImage && !ogImage.includes('og-default')) {
      const a = document.createElement('a');
      a.href = ogImage;
      a.download = `${ebook.title.replace(/[^a-zA-Z0-9]/g, '_')}_instagram.png`;
      a.target = '_blank';
      a.click();
      toast.success('Image downloading - use it in your Instagram post!');
    } else {
      toast.info('No cover image available. Upload one first.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()} data-testid="instagram-share-panel">
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5" />
              <span className="font-bold">Share on Instagram</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Instagram doesn't support direct link sharing. Follow these steps:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Download the cover image</p>
                <button onClick={downloadImage} className="mt-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition" data-testid="ig-download-image">
                  Download Image
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Copy the caption</p>
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 whitespace-pre-line max-h-32 overflow-y-auto border">
                  {caption}
                </div>
                <button onClick={copyCaption} className="mt-2 flex items-center gap-1.5 text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition" data-testid="ig-copy-caption">
                  {captionCopied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Caption</>}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p className="text-sm font-medium text-gray-900">Open Instagram and create a new post with the image and caption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const EbookAcquireModal = ({ ebook, onClose }) => {
  const isFree = ebook.price === 0;
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', card_number: '', expiration_date: '', card_code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email) return toast.error('Please fill in all required fields');
    if (!isFree && (!form.card_number || !form.expiration_date || !form.card_code)) return toast.error('Please enter payment details');

    setSubmitting(true);
    try {
      const endpoint = isFree ? `${API}/api/ebooks/${ebook.id}/download` : `${API}/api/ebooks/${ebook.id}/purchase`;
      const payload = isFree ? { first_name: form.first_name, last_name: form.last_name, email: form.email } : { ...form };

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${ebook.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setSuccess(true);
        toast.success(isFree ? 'Download started!' : 'Purchase successful! Download started.');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Something went wrong');
      }
    } catch (e) {
      toast.error('Connection error');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()} data-testid="ebook-acquire-modal">
        <div className={`p-6 ${isFree ? 'bg-green-600' : 'bg-indigo-600'} text-white relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
            {isFree ? <Download className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            {isFree ? 'Free Download' : `Purchase - $${ebook.price.toFixed(2)}`}
          </div>
          <h2 className="text-xl font-bold">{ebook.title}</h2>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Download Complete!</h3>
            <p className="text-gray-500 text-sm mb-4">Check your downloads folder.</p>
            <button onClick={onClose} className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="John" data-testid="modal-first-name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Doe" data-testid="modal-last-name" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="john@example.com" data-testid="modal-email" />
              </div>
            </div>
            {!isFree && (
              <>
                <hr />
                <p className="text-xs font-medium text-gray-600">Payment Details</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Card Number *</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required maxLength={16} value={form.card_number} onChange={e => setForm(p => ({ ...p, card_number: e.target.value.replace(/\D/g, '') }))} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="4111111111111111" data-testid="modal-card-number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Exp. Date (MMYY) *</label>
                    <input type="text" required maxLength={4} value={form.expiration_date} onChange={e => setForm(p => ({ ...p, expiration_date: e.target.value.replace(/\D/g, '') }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="1226" data-testid="modal-exp-date" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CVV *</label>
                    <input type="text" required maxLength={4} value={form.card_code} onChange={e => setForm(p => ({ ...p, card_code: e.target.value.replace(/\D/g, '') }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="123" data-testid="modal-cvv" />
                  </div>
                </div>
              </>
            )}
            <button type="submit" disabled={submitting} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition ${isFree ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`} data-testid="modal-submit-btn">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : isFree ? <><Download className="w-4 h-4" /> Download Free E-Book</> : <><CreditCard className="w-4 h-4" /> Complete Purchase</>}
            </button>
            <p className="text-xs text-gray-400 text-center">{isFree ? 'Your information will be kept secure and never shared.' : 'Secure payment processed by Authorize.net'}</p>
          </form>
        )}
      </div>
    </div>
  );
};

export default EbookDetailPage;
