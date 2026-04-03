import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, ChevronDown, ChevronRight, ArrowRight, Home, BookOpen, TrendingUp, Car, Users, Globe, Shield, Award, Star, CheckCircle2 } from 'lucide-react';

const TYPE_META = {
  real_estate: { label: 'Real Estate', icon: Home, color: 'from-green-600 to-emerald-700', badge: 'bg-green-100 text-green-800 border-green-200', accent: 'text-green-600', desc: 'Real estate professionals who help homebuyers build credit-ready profiles for mortgage approval.', partnerLink: '/become-a-partner/real-estate', partnerCta: 'real estate professional' },
  social_media: { label: 'Social Media', icon: Globe, color: 'from-fuchsia-600 to-purple-700', badge: 'bg-purple-100 text-purple-800 border-purple-200', accent: 'text-purple-600', desc: 'Content creators educating their audiences on credit repair, financial literacy, and smart money moves.', partnerLink: '/become-a-partner/social-media-influencers', partnerCta: 'content creator' },
  credit_repair_educator: { label: 'Credit Repair Educators', icon: BookOpen, color: 'from-indigo-600 to-blue-700', badge: 'bg-blue-100 text-blue-800 border-blue-200', accent: 'text-indigo-600', desc: 'Educators and coaches who teach proven credit repair strategies and financial empowerment.', partnerLink: '/become-a-partner', partnerCta: 'credit repair educator' },
  mortgage: { label: 'Mortgage Professionals', icon: TrendingUp, color: 'from-emerald-600 to-teal-700', badge: 'bg-teal-100 text-teal-800 border-teal-200', accent: 'text-teal-600', desc: 'Mortgage brokers and loan officers who partner with Credlocity to get clients mortgage-ready.', partnerLink: '/become-a-partner/mortgage-professionals', partnerCta: 'mortgage professional' },
  car_dealership: { label: 'Car Dealerships', icon: Car, color: 'from-red-600 to-rose-700', badge: 'bg-red-100 text-red-800 border-red-200', accent: 'text-red-600', desc: 'Auto dealers helping customers secure better financing through improved credit scores.', partnerLink: '/become-a-partner/car-dealerships', partnerCta: 'auto dealership' },
};

const CATEGORY_ORDER = ['real_estate', 'credit_repair_educator', 'mortgage', 'social_media', 'car_dealership'];

const FAQ_ITEMS = [
  { q: 'What is a Credlocity affiliate partner?', a: 'A Credlocity affiliate partner is a vetted professional — such as a real estate agent, mortgage broker, credit educator, social media creator, or car dealership — who collaborates with Credlocity to help their clients and audiences access professional credit repair services. Each partner has a personalized landing page where you can learn about their expertise and get started with credit repair.' },
  { q: 'How does credit repair help me buy a home?', a: 'A higher credit score qualifies you for better mortgage rates, potentially saving tens of thousands of dollars over the life of your loan. Our real estate and mortgage partners work directly with Credlocity to help you dispute errors on your credit report, remove negative items, and build a strong credit profile before you apply for a mortgage. Learn more on our credit building guide.' },
  { q: 'Can I get my credit repaired to qualify for a car loan?', a: 'Yes. Many of our car dealership partners refer customers to Credlocity specifically to improve their credit scores for better auto financing rates. Even a modest score increase can mean significantly lower interest rates and monthly payments on your vehicle.' },
  { q: 'How do I choose the right affiliate partner?', a: 'Browse our directory by category to find a partner who matches your needs. Real estate partners specialize in homebuyer readiness, mortgage partners focus on loan qualification, educators provide knowledge and coaching, and social media creators offer accessible credit tips. Each partner\'s page details their expertise and services.' },
  { q: 'Is Credlocity credit repair legitimate?', a: 'Absolutely. Credlocity operates in full compliance with the Credit Repair Organizations Act (CROA), the Fair Credit Reporting Act (FCRA), and the Telemarketing Sales Rule (TSR). We never charge upfront fees before work is completed, and we provide a written contract with a 3-day cancellation right as required by federal law. Visit our compliance page to learn more.' },
  { q: 'How much does credit repair cost?', a: 'Credlocity offers transparent, competitive pricing with no hidden fees. Visit our pricing page for current rates and packages. Many of our affiliate partners can also guide you to the best plan for your specific credit situation.' },
];

const AffiliateCard = ({ affiliate }) => {
  const meta = TYPE_META[affiliate.affiliate_type] || TYPE_META.real_estate;
  return (
    <Link
      to={`/p/${affiliate.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
      data-testid={`affiliate-card-${affiliate.slug}`}
    >
      <div className={`h-2 bg-gradient-to-r ${meta.color}`} />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
            {affiliate.headshot_url ? (
              <img src={affiliate.headshot_url} alt={`${affiliate.display_name || affiliate.name} — Credlocity credit repair partner`} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl font-cinzel font-bold text-white`}>
                {affiliate.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel font-bold text-gray-900 text-base group-hover:text-primary-blue transition-colors truncate">
              {affiliate.display_name || affiliate.name}
            </h3>
            <span className={`inline-block mt-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${meta.badge}`}>
              {meta.label}
            </span>
            {affiliate.city && (
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                <MapPin className="w-3 h-3" />{affiliate.city}{affiliate.state ? `, ${affiliate.state}` : ''}
              </p>
            )}
          </div>
        </div>
        {affiliate.tagline && (
          <p className="text-sm text-gray-600 mt-3 italic line-clamp-2">"{affiliate.tagline}"</p>
        )}
        <div className="mt-4 flex items-center text-sm font-semibold text-primary-blue group-hover:gap-2 transition-all">
          View Partner Page <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

const RecruitmentCard = ({ type }) => {
  const meta = TYPE_META[type] || TYPE_META.real_estate;
  const Icon = meta.icon;
  return (
    <Link
      to={meta.partnerLink}
      className="group block bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden hover:border-primary-blue/40 hover:bg-blue-50/30 transition-all duration-300"
      data-testid={`become-partner-${type}`}
    >
      <div className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-3 opacity-60 group-hover:opacity-100 transition`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="font-cinzel font-bold text-gray-700 text-sm mb-1">Are you a {meta.partnerCta}?</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-3 max-w-[200px]">Join Credlocity's partner network and grow your business with credit repair referrals.</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-blue group-hover:gap-2 transition-all">
          Become a Partner <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
};

const FAQItem = ({ item, isOpen, toggle }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden" data-testid="faq-item">
    <button onClick={toggle} className="w-full text-left px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition">
      <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
      <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{item.a}</div>}
  </div>
);

const AffiliateDirectory = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/affiliate-pages/public/all`)
      .then(r => r.json())
      .then(data => setAffiliates(data.affiliates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = CATEGORY_ORDER.reduce((acc, type) => {
    const items = affiliates.filter(a => a.affiliate_type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  const filtered = activeType === 'all'
    ? affiliates
    : affiliates.filter(a => a.affiliate_type === activeType);

  const searched = searchTerm
    ? filtered.filter(a =>
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.city || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filtered;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Credlocity Affiliate Partners — Credit Repair Professionals Near You",
    description: "Browse Credlocity's network of vetted credit repair affiliate partners including real estate agents, mortgage brokers, credit educators, and car dealerships.",
    url: window.location.href,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: affiliates.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: a.display_name || a.name,
          description: a.bio,
          url: `${window.location.origin}/p/${a.slug}`,
          ...(a.headshot_url ? { image: a.headshot_url } : {}),
        }
      }))
    },
    provider: {
      "@type": "Organization",
      name: "Credlocity",
      url: window.location.origin,
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  return (
    <div className="min-h-screen bg-white" data-testid="affiliate-directory">
      <Helmet>
        <title>Credit Repair Partners & Affiliates Near You | Credlocity</title>
        <meta name="description" content="Find trusted credit repair partners in real estate, mortgage, auto, and education. Credlocity's affiliate network helps you build better credit for homeownership, car loans, and financial freedom." />
        <meta name="keywords" content="credit repair partners, credit repair near me, credit repair for homebuyers, mortgage credit repair, auto loan credit repair, credit repair educator, credit repair affiliate, Credlocity partners, improve credit score, fix credit report" />
        <meta property="og:title" content="Credit Repair Partners & Affiliates | Credlocity" />
        <meta property="og:description" content="Browse Credlocity's network of trusted credit repair partners — real estate agents, mortgage brokers, educators, and dealerships helping you build better credit." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/affiliate-partners`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,64,175,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(101,163,13,0.15),transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 relative z-10">
          <div className="max-w-3xl">
            <p className="text-secondary-green font-semibold text-sm uppercase tracking-widest mb-4">Credlocity Partner Network</p>
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Trusted Credit Repair Partners in Your Industry
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-2xl">
              Whether you're buying a home, financing a car, or building financial literacy — our vetted affiliate partners connect you with
              <Link to="/how-it-works" className="text-secondary-green hover:underline font-medium"> professional credit repair</Link> tailored to your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-green hover:bg-secondary-light text-white font-bold rounded-full transition" data-testid="hero-cta-pricing">
                View Credit Repair Plans <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/become-a-partner" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white hover:bg-white/10 rounded-full transition" data-testid="hero-cta-become-partner">
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-600">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary-blue" /><Link to="/croa-guide" className="hover:text-primary-blue transition">CROA Compliant</Link></span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-secondary-green" /><Link to="/fcra-guide" className="hover:text-primary-blue transition">FCRA Certified</Link></span>
          <span className="flex items-center gap-2"><Award className="w-4 h-4 text-primary-blue" /><Link to="/success-stories" className="hover:text-primary-blue transition">Proven Results</Link></span>
          <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /><Link to="/credit-repair-reviews" className="hover:text-primary-blue transition">Top Rated</Link></span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary-green" />{affiliates.length} Active Partners</span>
        </div>
      </section>

      {/* Intro Copy (SEO) */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Credit Repair Starts With the Right Partner
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Credlocity's affiliate partner program connects consumers with industry professionals who understand the link between credit health and life goals.
          From <Link to="/become-a-partner/real-estate" className="text-primary-blue hover:underline font-medium">real estate agents</Link> preparing first-time homebuyers
          to <Link to="/become-a-partner/mortgage-professionals" className="text-primary-blue hover:underline font-medium">mortgage brokers</Link> optimizing loan eligibility,
          our partners are committed to helping you achieve <Link to="/financial-wellness" className="text-primary-blue hover:underline font-medium">financial wellness</Link> through
          legitimate, <Link to="/tsr-compliance" className="text-primary-blue hover:underline font-medium">compliant credit repair</Link>.
        </p>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2" data-testid="category-filters">
            <button
              onClick={() => setActiveType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${activeType === 'all' ? 'bg-primary-blue text-white border-primary-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              data-testid="filter-all"
            >
              All Partners
            </button>
            {CATEGORY_ORDER.map(type => {
              const meta = TYPE_META[type];
              if (!grouped[type]) return null;
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${activeType === type ? 'bg-primary-blue text-white border-primary-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                  data-testid={`filter-${type}`}
                >
                  {meta.label} ({grouped[type]?.length || 0})
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
              data-testid="partner-search"
            />
          </div>
        </div>
      </section>

      {/* Partner Grid */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Loading partners...</p>
          </div>
        ) : searched.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No partners found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter.</p>
          </div>
        ) : activeType === 'all' && !searchTerm ? (
          /* Grouped view when showing all */
          CATEGORY_ORDER.map(type => {
            const items = grouped[type];
            if (!items) return null;
            const meta = TYPE_META[type];
            const Icon = meta.icon;
            return (
              <div key={type} className="mb-14" data-testid={`category-section-${type}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-cinzel font-bold text-xl text-gray-900">{meta.label}</h2>
                    <p className="text-sm text-gray-500">{meta.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map(a => <AffiliateCard key={a.id || a.slug} affiliate={a} />)}
                  <RecruitmentCard type={type} />
                </div>
              </div>
            );
          })
        ) : (
          /* Flat grid when filtered */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {searched.map(a => <AffiliateCard key={a.id || a.slug} affiliate={a} />)}
          </div>
        )}
      </section>

      {/* Why Credit Repair Matters — SEO Content */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Why Credit Repair Matters for Every Major Purchase
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <Home className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-cinzel font-bold text-lg mb-2">Buying a Home</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A 50-point credit score increase can save you <strong>over $40,000</strong> in mortgage interest over 30 years.
                Our <Link to="/become-a-partner/real-estate" className="text-primary-blue hover:underline">real estate partners</Link> help
                first-time homebuyers get <Link to="/credit-building" className="text-primary-blue hover:underline">credit-ready</Link> before they start house hunting.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <Car className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-cinzel font-bold text-lg mb-2">Financing a Vehicle</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Bad credit auto loans can carry <strong>20%+ interest rates</strong>. Improving your score by just 40 points could cut your rate in half.
                Our <Link to="/become-a-partner/car-dealerships" className="text-primary-blue hover:underline">dealership partners</Link> connect you
                with <Link to="/how-it-works" className="text-primary-blue hover:underline">Credlocity's repair process</Link> before financing.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <TrendingUp className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-cinzel font-bold text-lg mb-2">Financial Freedom</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Credit impacts insurance rates, rental applications, and even employment. Our
                <Link to="/education-hub" className="text-primary-blue hover:underline"> education resources</Link> and
                <Link to="/become-a-partner/social-media-influencers" className="text-primary-blue hover:underline"> content creator partners</Link> make
                <Link to="/debt-management" className="text-primary-blue hover:underline"> financial literacy</Link> accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-primary-blue to-blue-800 rounded-3xl p-8 lg:p-12 text-white text-center">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold mb-3">Ready to Repair Your Credit?</h2>
          <p className="text-blue-200 max-w-xl mx-auto mb-6">
            Join thousands of Americans who've improved their credit scores with Credlocity. Start with a free consultation or explore our affordable plans.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/credit-builder-store" className="inline-flex items-center gap-2 px-7 py-3 bg-secondary-green hover:bg-secondary-light text-white font-bold rounded-full transition" data-testid="cta-credit-builder">
              Browse Credit Builder Plans <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/30-day-free-trial" className="inline-flex items-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full transition" data-testid="cta-free-trial">
              30-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-16" data-testid="faq-section">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-center mb-8 max-w-lg mx-auto">
          Everything you need to know about Credlocity's affiliate partner network and credit repair services.
        </p>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} item={item} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </section>

      {/* Bottom SEO interlink block */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h3 className="font-cinzel font-bold text-lg text-gray-900 mb-4">Explore More from Credlocity</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { to: '/how-it-works', label: 'How Credit Repair Works' },
              { to: '/pricing', label: 'Credit Repair Pricing' },
              { to: '/credit-scores', label: 'Understanding Credit Scores' },
              { to: '/repair-methods', label: 'Dispute & Repair Methods' },
              { to: '/collection-removal', label: 'Collection Removal' },
              { to: '/late-payment-removal', label: 'Late Payment Removal' },
              { to: '/hard-inquiry-removal', label: 'Hard Inquiry Removal' },
              { to: '/charge-off-removal', label: 'Charge-Off Removal' },
              { to: '/bankruptcy-credit-repair', label: 'Bankruptcy Credit Repair' },
              { to: '/identity-theft-credit-repair', label: 'Identity Theft Repair' },
              { to: '/credit-repair-scams', label: 'Avoid Credit Repair Scams' },
              { to: '/success-stories', label: 'Client Success Stories' },
              { to: '/faqs', label: 'All FAQs' },
              { to: '/become-a-partner', label: 'Become a Partner' },
              { to: '/education-hub', label: 'Education Hub' },
              { to: '/store', label: 'Credlocity Store' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-blue transition py-1.5">
                <ChevronRight className="w-3 h-3 text-gray-400" />{link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AffiliateDirectory;
