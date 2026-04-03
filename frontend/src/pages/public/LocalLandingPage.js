import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, CheckCircle, ChevronRight, Star, Shield, Clock, ArrowRight, Users, TrendingUp, BarChart3, Award, Building2, Scale, AlertTriangle, FileText, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import useSEO from '../../hooks/useSEO';

const API = process.env.REACT_APP_BACKEND_URL;

/* Internal link map — topics mentioned in content link to relevant pages */
const INTERLINKS = {
  'FCRA': { url: '/fcra', label: 'Fair Credit Reporting Act (FCRA)' },
  'Fair Credit Reporting Act': { url: '/fcra', label: 'Fair Credit Reporting Act (FCRA)' },
  'CROA': { url: '/croa', label: 'Credit Repair Organizations Act (CROA)' },
  'Credit Repair Organizations Act': { url: '/croa', label: 'Credit Repair Organizations Act (CROA)' },
  'FDCPA': { url: '/fdcpa', label: 'Fair Debt Collection Practices Act (FDCPA)' },
  'Fair Debt Collection Practices Act': { url: '/fdcpa', label: 'Fair Debt Collection Practices Act (FDCPA)' },
  'FCBA': { url: '/fcba', label: 'Fair Credit Billing Act (FCBA)' },
  'Fair Credit Billing Act': { url: '/fcba', label: 'Fair Credit Billing Act (FCBA)' },
  'late payments': { url: '/late-payment-removal', label: 'Late Payment Removal' },
  'Late Payment': { url: '/late-payment-removal', label: 'Late Payment Removal' },
  'identity theft': { url: '/identity-theft', label: 'Identity Theft Credit Repair' },
  'Identity Theft': { url: '/identity-theft', label: 'Identity Theft Credit Repair' },
  'bankruptcy': { url: '/bankruptcy-credit-repair', label: 'Bankruptcy Credit Repair' },
  'Bankruptcy': { url: '/bankruptcy-credit-repair', label: 'Bankruptcy Credit Repair' },
  'collections': { url: '/collection-removal', label: 'Collection Account Removal' },
  'collection': { url: '/collection-removal', label: 'Collection Account Removal' },
  'hard inquiries': { url: '/hard-inquiry-removal', label: 'Hard Inquiry Removal' },
  'Hard Inquiry': { url: '/hard-inquiry-removal', label: 'Hard Inquiry Removal' },
  'charge-offs': { url: '/charge-off-removal', label: 'Charge-Off Removal' },
  'Charge-Off': { url: '/charge-off-removal', label: 'Charge-Off Removal' },
  'charge-off': { url: '/charge-off-removal', label: 'Charge-Off Removal' },
  'repossessions': { url: '/repossession-removal', label: 'Repossession Removal' },
  'foreclosures': { url: '/foreclosure-removal', label: 'Foreclosure Removal' },
  'medical debt': { url: '/medical-debt-removal', label: 'Medical Debt Removal' },
  'student loan': { url: '/student-loan-credit-repair', label: 'Student Loan Credit Repair' },
  'credit score': { url: '/how-it-works', label: 'How Credit Repair Works' },
};

const LocalLandingPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [allPages, setAllPages] = useState([]);

  useSEO({
    title: page?.meta_title || page?.headline || 'Credit Repair Services',
    description: page?.meta_description || page?.description || '',
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${API}/api/seo/local-pages/by-slug/${slug}`);
        if (!res.ok) throw new Error('Not found');
        setPage(await res.json());
      } catch { setError(true); }
      finally { setLoading(false); }
    };
    fetchPage();
    // Fetch other local pages for cross-linking
    fetch(`${API}/api/seo/local-pages/public`)
      .then(r => r.json())
      .then(d => setAllPages((d.pages || []).filter(p => p.slug !== slug)))
      .catch(() => {});
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !page) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <MapPin className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-6">This local landing page doesn't exist or hasn't been published yet.</p>
      <Link to="/" className="text-indigo-600 hover:underline font-medium">Return to Home</Link>
    </div>
  );

  const stats = page.stats || {};
  const reviews = page.reviews || [];
  const pricing = [
    { name: 'Fraud Package', price: '$99.95', period: '/month', trial: '15-Day Free Trial', features: ['Single Bureau Disputes', 'Fraud Item Removal', 'Basic Credit Monitoring', 'Email Support'], popular: false },
    { name: 'Aggressive Package', price: '$179.95', period: '/month', trial: '30-Day Free Trial', features: ['All Three Bureau Disputes', 'Unlimited Item Challenges', 'Advanced Credit Monitoring', 'Priority Phone Support', 'Creditor Interventions'], popular: true },
    { name: 'Family Package', price: '$279.95', period: '/month', trial: '30-Day Free Trial', features: ['Two Person Coverage', 'All Three Bureau Disputes', 'Unlimited Item Challenges', 'Dedicated Consultant', 'Priority Support', 'Joint Account Disputes'], popular: false },
  ];
  const officeAddress = page.office_address || '1500 Chestnut Street, Suite 2, Philadelphia, PA 19102';
  const isIdaho = page.use_idaho_office;

  return (
    <>
      <Helmet>
        <title>{page.meta_title || page.headline}</title>
        <meta name="description" content={page.meta_description || page.description} />
        {page.keywords && <meta name="keywords" content={page.keywords} />}
        <link rel="canonical" href={`https://www.credlocity.com/${page.slug}`} />
        <meta property="og:title" content={page.meta_title || page.headline} />
        <meta property="og:description" content={page.meta_description || page.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.credlocity.com/${page.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-white" data-testid="local-landing-page">

        {/* ===== HERO ===== */}
        <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6" aria-label="Breadcrumb" data-testid="breadcrumb-nav">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/credit-repair-services" className="hover:text-white transition">Credit Repair</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-300">{page.city}, {page.state}</span>
            </nav>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-medium text-indigo-300 mb-6">
                  <MapPin className="w-3 h-3" /> {isIdaho ? 'Local Idaho Office' : 'Serving'} {page.city}, {page.state}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" data-testid="local-page-title" data-speakable="true">
                  {page.headline}
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed mb-8" data-speakable="true">
                  {page.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/intake">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8" data-testid="local-cta-consultation">
                      Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/tsr-compliance">
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="local-cta-call">
                      <Shield className="w-4 h-4 mr-2" /> Why No Phone? (TSR)
                    </Button>
                  </Link>
                </div>
              </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="space-y-5">
                  {[
                    { icon: CheckCircle, bgClass: 'bg-emerald-500/20', iconClass: 'text-emerald-400', title: '79,000+ Clients Served', desc: 'Trusted by clients nationwide since 2008' },
                    { icon: Star, bgClass: 'bg-amber-500/20', iconClass: 'text-amber-400', title: '5.0 Star Rating', desc: 'Consistently rated the best credit repair service' },
                    { icon: Shield, bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400', title: 'FCRA, CROA & TSR Compliant', desc: 'Fully compliant with all federal regulations' },
                    { icon: Clock, bgClass: 'bg-indigo-500/20', iconClass: 'text-indigo-400', title: '180-Day Money-Back Guarantee', desc: 'Risk-free with our satisfaction guarantee' },
                    { icon: Award, bgClass: 'bg-purple-500/20', iconClass: 'text-purple-400', title: 'Board Certified Consultants', desc: 'Led by CEO Joeziel Vazquez, 17+ years experience' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`p-2 ${item.bgClass} rounded-lg flex-shrink-0`}>
                        <item.icon className={`w-5 h-5 ${item.iconClass}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CITY STATISTICS ===== */}
        {Object.keys(stats).length > 0 && (
          <section className="py-16 md:py-20 bg-white border-b" data-testid="city-stats-section">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-3" data-speakable="true">
                  Credit Statistics for {page.city}, {page.state}
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Understanding the credit landscape in {page.city} helps explain why professional credit repair services are essential for local residents.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Population', value: stats.population, icon: Users, iconClass: 'text-indigo-500' },
                  { label: 'Metro Area', value: stats.metro_population, icon: Building2, iconClass: 'text-blue-500' },
                  { label: 'Avg Credit Score', value: stats.avg_credit_score, icon: BarChart3, iconClass: 'text-emerald-500' },
                  { label: 'Subprime Credit', value: stats.pct_subprime, icon: AlertTriangle, iconClass: 'text-amber-500' },
                  { label: 'With Collections', value: stats.pct_with_collections, icon: FileText, iconClass: 'text-red-500' },
                  { label: 'Median Income', value: stats.median_income, icon: TrendingUp, iconClass: 'text-green-500' },
                  { label: 'Carry Debt', value: stats.pct_with_debt, icon: Scale, iconClass: 'text-orange-500' },
                  { label: 'Avg Debt', value: stats.avg_debt, icon: BarChart3, iconClass: 'text-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100 hover:border-indigo-200 transition" data-testid={`stat-card-${i}`}>
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.iconClass}`} />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center mt-6">
                Source: U.S. Census Bureau, Experian State of Credit Reports, Federal Reserve Consumer Credit Data. {page.city}, {page.state} metropolitan area estimates.
              </p>
            </div>
          </section>
        )}

        {/* ===== WHY CREDLOCITY — TRUST SECTION ===== */}
        <section className="py-16 md:py-20 bg-slate-50" data-testid="why-credlocity-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3" data-speakable="true">
                Why {page.city} Residents Trust Credlocity
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Credlocity Business Group LLC has been the trusted choice for credit repair since 2008. Here's why we're the #1 choice for {page.city} families.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: '17 Years of Proven Results', desc: `Since 2008, Credlocity has served over 79,000 clients nationwide, including thousands in ${page.state}. Our track record speaks for itself — clients average 50-150 point score improvements.`, icon: Award },
                { title: 'Board Certified Credit Consultants', desc: 'Our team is led by CEO Joeziel Vazquez, a Board Certified Credit Consultant with 17+ years of experience in consumer credit law, FCRA compliance, and credit bureau dispute strategies.', icon: Shield },
                { title: 'FCRA, CROA & TSR Compliant', desc: `Every dispute we file for ${page.city} clients is fully compliant with the Fair Credit Reporting Act (FCRA), Credit Repair Organizations Act (CROA), and Telemarketing Sales Rule (TSR). We never use illegal tactics.`, icon: Scale },
                { title: 'No Upfront Fees — Ever', desc: 'Unlike many credit repair companies, Credlocity never charges upfront fees before work is completed. This is required by the Credit Repair Organizations Act (CROA) and is a practice we strictly follow.', icon: CheckCircle },
                { title: '180-Day Money-Back Guarantee', desc: `If you're not satisfied with your results within 180 days, we'll refund your money. No questions asked. That's how confident we are in our ability to help ${page.city} residents.`, icon: Clock },
                { title: isIdaho ? 'Local Idaho Office' : `Serving ${page.city}`, desc: isIdaho ? `Our Idaho office at ${officeAddress} provides convenient access for ${page.city} residents. We offer both in-person and remote consultations.` : `Credlocity serves ${page.city} and the entire ${page.state} area with comprehensive remote credit repair services. Per the Telemarketing Sales Rule (TSR), we cannot enroll clients by phone — all enrollments are through our secure online system.`, icon: MapPin },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition">
                  <item.icon className="w-8 h-8 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SERVICES ===== */}
        {page.services && page.services.length > 0 && (
          <section className="py-16 md:py-20 bg-white" data-testid="local-services-section">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Credit Repair Services in {page.city}
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Comprehensive credit repair solutions tailored to {page.city} residents. Every service is backed by the{' '}
                  <Link to="/fcra" className="text-indigo-600 hover:underline">FCRA</Link>,{' '}
                  <Link to="/croa" className="text-indigo-600 hover:underline">CROA</Link>, and{' '}
                  <Link to="/fdcpa" className="text-indigo-600 hover:underline">FDCPA</Link>.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {page.services.map((service, i) => {
                  const linkMap = {
                    'Collection Account Removal': '/collection-removal',
                    'Late Payment Removal': '/late-payment-removal',
                    'Hard Inquiry Removal': '/hard-inquiry-removal',
                    'Identity Theft Recovery': '/identity-theft',
                    'Bankruptcy Credit Repair': '/bankruptcy-credit-repair',
                    'Charge-Off Disputes': '/charge-off-removal',
                    'Medical Debt Dispute': '/medical-debt-removal',
                    'Student Loan Error Correction': '/student-loan-credit-repair',
                    'Repossession Record Removal': '/repossession-removal',
                    'Foreclosure Dispute': '/foreclosure-removal',
                  };
                  const serviceLink = linkMap[service];
                  const inner = (
                    <div className={`bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition group h-full ${serviceLink ? 'cursor-pointer' : ''}`} data-testid={`service-card-${i}`}>
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition">{service}</h3>
                      {serviceLink && <span className="text-xs text-indigo-500 mt-1 inline-block">Learn more &rarr;</span>}
                    </div>
                  );
                  return serviceLink ? <Link key={i} to={serviceLink}>{inner}</Link> : <div key={i}>{inner}</div>;
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===== FIRST-TIME HOME BUYER CTA ===== */}
        <section className="py-16 md:py-20 bg-blue-50" data-testid="homebuyer-cta-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden md:flex">
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <Home className="w-3 h-3" /> {page.city} Resource
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  {page.city} First-Time Home Buyer Guide
                </h2>
                <p className="text-slate-600 mb-4">
                  Discover grants, down payment assistance programs, credit score requirements, homebuyer education courses, and use our interactive mortgage calculator to estimate your monthly payment.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 mb-6">
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Local grants & down payment assistance</li>
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Credit score requirements & interest rate guide</li>
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Interactive mortgage payment calculator</li>
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Why credit repair saves you thousands in interest</li>
                </ul>
                <Link to={`/${slug}/first-time-home-buyer`} data-testid="homebuyer-guide-link">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Read the Full Guide <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center p-8 md:p-12">
                <div className="text-center text-white">
                  <Home className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-2">First-Time Buyer?</div>
                  <p className="text-lg opacity-90">Grants, Calculator & Resources</p>
                  <p className="text-sm opacity-70 mt-2">Everything you need to buy your first home in {page.city}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-16 md:py-20 bg-slate-50" data-testid="how-it-works-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">How Credit Repair Works in {page.city}</h2>
              <p className="text-slate-500">Our proven 4-step process is fully compliant with the <Link to="/fcra" className="text-indigo-600 hover:underline">FCRA</Link> and <Link to="/croa" className="text-indigo-600 hover:underline">CROA</Link></p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Free Consultation', desc: `We pull your credit reports from Equifax, Experian, and TransUnion and conduct a comprehensive analysis. We identify every inaccurate, misleading, or unverifiable item that may be hurting your ${page.city} credit score.` },
                { step: '2', title: 'Dispute Strategy', desc: `Our Board Certified Credit Consultants create a personalized dispute plan targeting each negative item. We use FCRA Section 611 dispute rights and FDCPA violations to build the strongest possible case.` },
                { step: '3', title: 'Bureau Disputes', desc: `We send legally compliant dispute letters to all three credit bureaus and original creditors. Under the FCRA, bureaus must investigate within 30 days and remove items they cannot verify as accurate.` },
                { step: '4', title: 'Monitor & Improve', desc: `Track your progress as items are removed and your credit score improves. We continue disputing until your credit report is clean and accurate. Average improvement: 50-150 points.` },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
                  <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/how-it-works" className="text-indigo-600 hover:underline font-medium text-sm">
                Learn more about our credit repair process &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ===== REVIEWS / TESTIMONIALS ===== */}
        {reviews.length > 0 && (
          <section className="py-16 md:py-20 bg-white" data-testid="local-reviews-section">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  What {page.city} Clients Say About Credlocity
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Real results from real people in {page.city} and the surrounding {page.state} area. Read more on our{' '}
                  <Link to="/success-stories" className="text-indigo-600 hover:underline font-medium">Success Stories page</Link>.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition" data-testid={`review-card-${i}`}>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: review.rating || 5 }).map((_, s) => (
                        <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-4 italic">"{review.text}"</p>
                    <div className="flex items-center gap-2 border-t pt-3 border-slate-200">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{review.name}</div>
                        <div className="text-xs text-slate-400">{review.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/success-stories">
                  <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50" data-testid="view-success-stories-btn">
                    View All Success Stories <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== KNOW YOUR RIGHTS — INTERLINKED CONTENT ===== */}
        <section className="py-16 md:py-20 bg-slate-900 text-white" data-testid="know-your-rights-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" data-speakable="true">
                Know Your Credit Rights in {page.city}, {page.state}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Federal and state laws protect {page.city} residents from inaccurate credit reporting and abusive debt collection. Understanding these rights is the first step to repairing your credit.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Fair Credit Reporting Act (FCRA)', desc: 'Your right to dispute inaccurate items. Bureaus must investigate within 30 days and remove unverifiable entries.', link: '/fcra' },
                { title: 'Credit Repair Organizations Act (CROA)', desc: 'Protects you from credit repair scams. Companies cannot charge upfront fees or make false promises.', link: '/croa' },
                { title: 'Fair Debt Collection Practices Act (FDCPA)', desc: 'Prohibits harassment, false statements, and unfair practices by debt collectors in your area.', link: '/fdcpa' },
                { title: 'Fair Credit Billing Act (FCBA)', desc: 'Protects against billing errors on credit card accounts and requires creditors to investigate disputes.', link: '/fcba' },
                { title: 'Identity Theft Protection', desc: `${page.city} residents can freeze credit, place fraud alerts, and block fraudulent accounts under FCRA Section 605B.`, link: '/identity-theft' },
                { title: 'Late Payment & Collection Rights', desc: 'You can dispute inaccurate late payments and demand debt validation from collection agencies before they report.', link: '/late-payment-removal' },
              ].map((right, i) => (
                <Link key={i} to={right.link} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-indigo-400/30 transition block">
                  <h3 className="font-bold text-white mb-2">{right.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-2">{right.desc}</p>
                  <span className="text-indigo-400 text-xs font-medium">Learn more &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="py-16 md:py-20 bg-white" data-testid="local-pricing-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Credit Repair Pricing for {page.city}</h2>
              <p className="text-slate-500">Affordable plans with no hidden fees and no upfront charges. Cancel anytime.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {pricing.map((plan, i) => (
                <div key={i} className={`bg-white rounded-2xl border-2 p-6 relative transition hover:shadow-lg ${plan.popular ? 'border-indigo-500 shadow-indigo-100' : 'border-slate-200'}`} data-testid={`pricing-card-${i}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{plan.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium mb-4">{plan.trial}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/intake">
                    <Button className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/pricing" className="text-indigo-600 hover:underline text-sm font-medium">View full pricing details &rarr;</Link>
            </div>
          </div>
        </section>

        {/* ===== ADDITIONAL CONTENT ===== */}
        {page.content && (
          <section className="py-16 md:py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 prose prose-slate prose-lg" dangerouslySetInnerHTML={{ __html: page.content }} data-testid="local-page-additional-content" />
          </section>
        )}

        {/* ===== FAQ ===== */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="py-16 md:py-20 bg-white" data-testid="local-faq-section">
            <div className="max-w-3xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Credit Repair FAQs for {page.city}, {page.state}
                </h2>
                <p className="text-slate-500">Common questions about credit repair in your area</p>
              </div>
              <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
                {page.faqs.map((faq, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden" itemScope itemProp="mainEntity" itemType="https://schema.org/Question" data-testid={`faq-item-${i}`}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <span className="font-semibold text-slate-800 pr-4" itemProp="name">{faq.q}</span>
                      <ChevronRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-3 faq-answer" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                        <span itemProp="text">{faq.a}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== OTHER CITIES (Cross-linking) ===== */}
        {allPages.length > 0 && (
          <section className="py-12 bg-slate-50 border-t" data-testid="other-cities-section">
            <div className="max-w-6xl mx-auto px-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
                Credlocity Credit Repair in Other Cities
              </h3>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {allPages.map((p, i) => (
                  <Link key={i} to={`/${p.slug}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition" data-testid={`cross-link-${p.slug}`}>
                    <MapPin className="w-3 h-3" /> {p.city}, {p.state}
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link to="/locations" className="text-indigo-600 hover:underline text-sm font-medium inline-flex items-center gap-1">
                  View All Locations <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Related Resources */}
        <section className="py-12 bg-white border-t" data-testid="related-resources-section">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Learn More About Credit Repair</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { title: 'Credit Scores Explained', link: '/credit-scores', desc: 'FICO vs VantageScore, 800 Club' },
                { title: 'Credit Repair Laws', link: '/credit-repair-laws', desc: 'FCRA, CROA, TSR, FDCPA guides' },
                { title: 'Free Letters', link: '/free-letters', desc: 'Download dispute templates' },
                { title: '30-Day Free Trial', link: '/30-day-free-trial', desc: '$0 service fees to start' },
              ].map((item, i) => (
                <Link key={i} to={item.link} className="bg-gray-50 rounded-xl p-4 border hover:border-indigo-300 hover:shadow-md transition group text-center">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-indigo-600">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section className="py-16 md:py-20 bg-indigo-600 text-white" data-testid="local-cta-section">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-speakable="true">
              Ready to Repair Your Credit in {page.city}?
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join 79,000+ clients who have improved their credit scores with Credlocity. Start your free consultation today — no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/intake">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 font-bold" data-testid="local-bottom-cta">
                  Start Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/tsr-compliance">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                  <Shield className="w-4 h-4 mr-2" /> Why No Phone? (TSR)
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-indigo-200">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 30-Day Free Trial</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 180-Day Money-Back Guarantee</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> No Credit Card Required</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> No Upfront Fees</span>
            </div>
          </div>
        </section>

        {/* ===== FOOTER CONTACT ===== */}
        <section className="py-12 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <MapPin className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                <h3 className="font-bold mb-1">{isIdaho ? 'Idaho Office' : 'Headquarters'}</h3>
                <p className="text-sm text-slate-400">{officeAddress}</p>
                {isIdaho && (
                  <p className="text-xs text-slate-500 mt-1">Headquarters: 1500 Chestnut St, Suite 2, Philadelphia, PA 19102</p>
                )}
              </div>
              <div>
                <Shield className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                <h3 className="font-bold mb-1">Phone Policy</h3>
                <p className="text-sm text-slate-400">Per the <Link to="/tsr-compliance" className="text-indigo-400 hover:text-white underline">Telemarketing Sales Rule (TSR)</Link>, we cannot accept clients by phone.</p>
              </div>
              <div>
                <Mail className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                <h3 className="font-bold mb-1">Email</h3>
                <a href="mailto:admin@credlocity.com" className="text-sm text-slate-400 hover:text-white transition">admin@credlocity.com</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LocalLandingPage;
