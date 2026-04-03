import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  FileText, Download, Search, ChevronRight, Shield, ArrowRight,
  Filter, Target, CheckCircle, Send, BookOpen, HelpCircle,
  Users, Award, Wrench
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { TrialButton } from '../components/LeadButtons';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['All', 'Dispute Letters', 'Debt Validation', 'Goodwill Letters', 'Cease & Desist', 'Identity Theft', 'Credit Bureau', 'Legal Templates', 'Other'];

const CATEGORY_ICONS = {
  'Dispute Letters': FileText,
  'Debt Validation': Shield,
  'Goodwill Letters': CheckCircle,
  'Cease & Desist': Target,
  'Identity Theft': Shield,
  'Credit Bureau': BookOpen,
};

const FreeLetters = () => {
  useSEO({ title: 'Free Downloadable Letters', description: 'Download free credit repair dispute letter templates, debt validation letters, and more.' });
  const [templates, setTemplates] = useState([]);
  const [uploadedLetters, setUploadedLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, uRes] = await Promise.all([
          fetch(`${API}/api/letter-templates/list`),
          fetch(`${API}/api/letters/public`),
        ]);
        if (tRes.ok) setTemplates(await tRes.json());
        if (uRes.ok) setUploadedLetters(await uRes.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  // Combine template letters and uploaded letters
  const allLetters = [
    ...templates.map(t => ({ ...t, type: 'template', id: t.slug })),
    ...uploadedLetters.map(l => ({ ...l, type: 'uploaded' })),
  ];

  const filtered = allLetters.filter(l => {
    const matchCat = filter === 'All' || l.category === filter;
    const matchSearch = !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.short_description?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category
  const grouped = {};
  CATEGORIES.slice(1).forEach(cat => {
    const items = filtered.filter(l => l.category === cat);
    if (items.length > 0) grouped[cat] = items;
  });
  const otherItems = filtered.filter(l => !CATEGORIES.slice(1).includes(l.category));
  if (otherItems.length > 0) grouped['Other'] = [...(grouped['Other'] || []), ...otherItems];

  // Main page FAQs
  const MAIN_FAQS = [
    { q: "Are these credit repair letter templates really free?", a: "Yes, all letter templates on Credlocity are 100% free to use. Simply choose the letter that fits your situation, fill in your personal information, and click Generate to download a personalized PDF. There's no signup, no hidden fees, and no credit card required." },
    { q: "Can I really dispute my credit report myself without hiring a company?", a: "Absolutely. Under the Fair Credit Reporting Act (FCRA), every consumer has the legal right to dispute inaccurate information on their credit report. You don't need a credit repair company or attorney to exercise these rights. Our free letter templates make the process straightforward — just fill in your information and send the letter via Certified Mail." },
    { q: "Why would I hire Credlocity if I can dispute on my own?", a: "Think of it like doing your own taxes versus hiring a tax preparer, or fixing your own car versus going to a mechanic. Yes, you absolutely can do it yourself — and we encourage it. But credit repair professionals know the nuances: which items to dispute first for maximum score impact, how to sequence disputes across all three bureaus, when to use a validation letter versus a direct dispute, and how to handle re-investigations and escalations. Just because you can change your own oil doesn't mean you should rebuild your own transmission. Our Board Certified Credit Consultants handle thousands of disputes every month and achieve an average 236-point score increase." },
    { q: "What types of letters are available?", a: "We offer 9 professionally written letter templates covering the most common credit repair situations: Credit Bureau Dispute Letters, Debt Validation Letters, Goodwill Adjustment Letters, Cease & Desist Letters, Identity Theft Dispute Letters, Pay for Delete Negotiation Letters, Hard Inquiry Removal Letters, Method of Verification (MOV) Letters, and Statute of Limitations Expiration Letters." },
    { q: "Should I send my dispute letter via Certified Mail?", a: "Yes, always. Sending via USPS Certified Mail with Return Receipt Requested costs approximately $7-$10 per letter but provides official proof that the bureau or collector received your letter. This is critical because: (1) it starts the 30-day investigation clock, (2) it creates a legal paper trail, and (3) it's admissible as evidence in court if needed. Online disputes through credit bureau websites are processed through the automated e-OSCAR system, which often results in superficial investigations." },
    { q: "How long does it take for a dispute to be resolved?", a: "Under the FCRA, credit bureaus must complete their investigation within 30 days of receiving your dispute (45 days if you provide additional information). You'll receive a written response with the results. If the disputed item is corrected or removed, you'll also receive an updated copy of your credit report. The entire process from mailing to resolution typically takes 5-6 weeks when accounting for mail delivery time." },
    { q: "What if my dispute is denied or the item is verified?", a: "Don't give up. A 'verified' result doesn't mean the item is actually accurate — it often means the bureau used the automated e-OSCAR system for a superficial check. Your next steps include: (1) Send a Method of Verification (MOV) letter demanding to know how they investigated, (2) Re-dispute with additional supporting documentation, (3) File a complaint with the CFPB, or (4) Consult an FCRA attorney about potential legal action." },
    { q: "How many items can I dispute at once?", a: "While there's no legal limit, experts recommend disputing 2-3 items per letter per bureau. Disputing too many items at once can trigger the bureau's right under FCRA Section 611(a)(3) to classify your dispute as frivolous if it appears to be a blanket challenge. Focus on the most impactful items first — collections, charge-offs, and late payments on current accounts typically have the biggest score impact." },
    { q: "Do I need a lawyer to dispute my credit report?", a: "No, you do not need a lawyer for standard credit bureau disputes. The dispute process is designed for consumers to use on their own. However, if you've experienced willful FCRA violations (bureau ignoring disputes, failing to investigate, continuing to report verified false information), an FCRA attorney can pursue legal action and may recover statutory damages of $100-$1,000 per violation plus actual damages and attorney fees." },
    { q: "What's the difference between disputing online and by mail?", a: "Online disputes are processed through the e-OSCAR automated system, which reduces your detailed dispute to a 2-digit code. Mail disputes create a legal paper trail and tend to receive more thorough investigation. For important disputes — especially those involving identity theft, collections, or items significantly impacting your score — always dispute by mail via Certified Mail with Return Receipt Requested." },
  ];

  // JSON-LD Schemas
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": MAIN_FAQS.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.credlocity.com/" },
      { "@type": "ListItem", "position": 2, "name": "Education", "item": "https://www.credlocity.com/credit-repair-laws" },
      { "@type": "ListItem", "position": 3, "name": "Free Letters", "item": "https://www.credlocity.com/free-letters" }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Free Credit Repair Dispute Letters & Templates",
    "description": "Download free credit repair dispute letter templates. Professional letters pre-filled with your information for credit bureau disputes, debt validation, goodwill adjustments, and more.",
    "url": "https://www.credlocity.com/free-letters",
    "publisher": {
      "@type": "Organization",
      "name": "Credlocity",
      "url": "https://www.credlocity.com"
    },
    "isPartOf": { "@type": "WebSite", "name": "Credlocity", "url": "https://www.credlocity.com" }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Free Credit Repair Letter Templates",
    "numberOfItems": templates.length,
    "itemListElement": templates.map((t, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": t.title,
      "url": `https://www.credlocity.com/free-letters/${t.slug}`
    }))
  };

  return (
    <div className="min-h-screen" data-testid="free-letters-page">
      <Helmet>
        <title>Free Credit Repair Dispute Letters & Templates | Download Now | Credlocity</title>
        <meta name="description" content="Download 9 free credit repair letter templates: dispute letters, debt validation, goodwill adjustments, cease & desist, identity theft disputes, and more. Pre-filled with your information — instant PDF download, no signup required." />
        <link rel="canonical" href="https://www.credlocity.com/free-letters" />
        <meta property="og:title" content="Free Credit Repair Dispute Letters & Templates | Credlocity" />
        <meta property="og:description" content="Download 9 free credit repair letter templates. Professional dispute letters pre-filled with your personal information. Instant PDF download, no signup required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.credlocity.com/free-letters" />
        <meta property="og:site_name" content="Credlocity" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Credit Repair Dispute Letters | Credlocity" />
        <meta name="twitter:description" content="Download 9 free dispute letter templates. Pre-filled PDFs for credit bureau disputes, debt validation, goodwill letters, and more." />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="free credit repair letters, dispute letter template, debt validation letter, goodwill letter, cease and desist letter, credit bureau dispute, FCRA dispute letter, free credit dispute template, credit repair DIY" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-6">
            <Link to="/" className="hover:text-white">Home</Link><span>/</span>
            <Link to="/credit-repair-laws" className="hover:text-white">Education</Link><span>/</span>
            <span className="text-white">Free Letters</span>
          </nav>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold mb-4" data-testid="free-letters-title">Free Credit Repair Letter Templates</h1>
          <p className="text-lg text-gray-200 max-w-3xl">
            Professional dispute letter templates you can personalize and download instantly. Each letter includes step-by-step instructions, success likelihood ratings, and follow-up guidance.
          </p>
          <div className="flex gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2 text-gray-200">
              <FileText className="w-4 h-4" /> {templates.length} Letter Templates
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Download className="w-4 h-4" /> Free PDF Download
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Send className="w-4 h-4" /> Pre-filled with Your Info
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search letters..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none text-sm"
                data-testid="letters-search"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === cat ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  data-testid={`filter-${cat.toLowerCase().replace(/\s|&/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Letters List */}
      <section className="py-12 bg-gray-50" data-testid="letters-list">
        <div className="container mx-auto px-4 max-w-5xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {allLetters.length === 0 ? 'Letters Coming Soon' : 'No letters match your search'}
              </h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or filter.</p>
            </div>
          ) : filter === 'All' && !search ? (
            Object.entries(grouped).map(([cat, items]) => {
              const CatIcon = CATEGORY_ICONS[cat] || FileText;
              return (
                <div key={cat} className="mb-10" data-testid={`category-${cat.toLowerCase().replace(/\s|&/g, '-')}`}>
                  <h2 className="font-cinzel text-xl font-bold text-primary-blue mb-4 flex items-center gap-2">
                    <CatIcon className="w-5 h-5" /> {cat}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {items.map(l => <LetterCard key={l.id || l.slug} letter={l} />)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(l => <LetterCard key={l.id || l.slug} letter={l} />)}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8 text-center">How Our Free Letters Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Choose a Letter', desc: 'Browse our collection and click on the letter template that matches your situation.', icon: Search },
              { step: '2', title: 'Fill the Form', desc: 'Enter your personal details and account information into the on-page form.', icon: FileText },
              { step: '3', title: 'Generate & Download', desc: 'Click "Generate" — your personalized letter downloads instantly as a PDF.', icon: Download },
              { step: '4', title: 'Sign, Date & Mail', desc: 'Print, sign, and send via Certified Mail with Return Receipt Requested.', icon: Send },
            ].map((s) => (
              <div key={s.step} className="bg-gray-50 rounded-xl p-6 border text-center">
                <div className="w-10 h-10 bg-primary-blue text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.step}</div>
                <s.icon className="w-6 h-6 text-primary-blue mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Right to Dispute — Professional Messaging */}
      <section className="py-16 bg-gray-50 border-y" data-testid="professional-messaging">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 mb-5">
                Your Right to Dispute — And Why Professionals Exist
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                <p>
                  At Credlocity, we believe every consumer has the right to dispute inaccurate information on their credit report. That's exactly why we built these free letter templates — so you can exercise your rights under the <Link to="/credit-repair-laws" className="text-primary-blue font-semibold hover:underline">Fair Credit Reporting Act (FCRA)</Link> without spending a dime.
                </p>
                <p>
                  But here's the truth: <strong>just because you <em>can</em> do something yourself doesn't always mean you <em>should</em>.</strong>
                </p>
                <p>
                  Think about it this way — you <em>can</em> do your own taxes, but a tax preparer catches deductions you'd miss. You <em>can</em> change your own oil, but when it comes to rebuilding a transmission, you go to a mechanic. You <em>can</em> represent yourself in court, but even lawyers hire lawyers.
                </p>
                <p>
                  Credit repair works the same way. A simple dispute over a wrong address? You can handle that. But if you're dealing with multiple collections, charge-offs, late payments across all three bureaus, identity theft, or mixed credit files — <strong>one wrong move can reset the statute of limitations, trigger a frivolous dispute flag, or miss the strategy that would have raised your score the fastest.</strong>
                </p>
                <p>
                  Our Board Certified Credit Consultants handle thousands of disputes every month. They know which items to challenge first, how to sequence disputes across bureaus for maximum impact, when to escalate to a Method of Verification, and how to navigate the e-OSCAR system that bureaus use to rubber-stamp responses.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-primary-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">DIY Credit Repair</h4>
                    <p className="text-xs text-gray-600 mt-1">Great for simple errors like wrong addresses, duplicate accounts, or single disputes. Use our free templates — it's your legal right.</p>
                  </div>
                </div>
              </div>
              <div className="bg-primary-blue/5 rounded-xl p-5 border border-primary-blue/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Professional Credit Repair</h4>
                    <p className="text-xs text-gray-600 mt-1">Best for complex situations — multiple negative items, identity theft, mixed files, or when you need maximum score improvement in minimum time. Average <strong>236-point increase</strong> in 3-7 months.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Start Free, Upgrade When Ready</h4>
                    <p className="text-xs text-gray-600 mt-1">Use our free letters to start your credit repair journey. If you need expert help, our <Link to="/pricing" className="text-primary-blue font-semibold hover:underline">free trial</Link> lets you experience professional service risk-free.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white" data-testid="faq-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-3 text-center">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Everything you need to know about using our free credit repair letter templates</p>
          <div className="space-y-3">
            {MAIN_FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Important Legal Notice:</strong> These letter templates are provided for educational purposes and are based on legitimate consumer rights under the FCRA, FDCPA, CROA, and other federal laws. Credlocity is not a law firm, and using these templates does not constitute legal advice. The effectiveness of any dispute depends on your specific situation and the accuracy of the information on your credit report. For complex credit issues, identity theft cases, or situations requiring legal expertise, we recommend consulting with a qualified <Link to="/pro-se-center" className="underline font-semibold">FCRA attorney</Link> or working with a professional credit repair service like <Link to="/pricing" className="underline font-semibold">Credlocity</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-3xl font-bold mb-4">Ready for Professional Credit Repair?</h2>
          <p className="text-gray-100 mb-6 max-w-2xl mx-auto">Our Board Certified Credit Consultants handle all disputes for you — strategically sequenced for maximum score impact. Average 236-point increase in 3-7 months.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8" asChild>
              <TrialButton variant="link" className="inline-flex items-center">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </TrialButton>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8" asChild>
              <Link to="/pricing">
                View Plans & Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// === FAQ Accordion Item ===
const FAQItem = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden" data-testid={`faq-item-${index}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

// === Letter Card ===
const LetterCard = ({ letter }) => {
  const isTemplate = letter.type === 'template';

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-primary-blue/30 hover:shadow-md transition-all overflow-hidden" data-testid={`letter-card-${letter.slug || letter.id}`}>
      {isTemplate ? (
        <Link to={`/free-letters/${letter.slug}`} className="block p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-primary-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{letter.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{letter.short_description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-blue-50 text-primary-blue border-blue-200 text-[10px]">{letter.category}</Badge>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">Free PDF</Badge>
                {letter.send_to === 'credit_bureaus' && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Bureau Addresses Included</Badge>
                )}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-blue shrink-0 mt-1" />
          </div>
        </Link>
      ) : (
        <div className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{letter.title}</h3>
            {letter.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{letter.description}</p>}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="bg-gray-100 px-2 py-0.5 rounded">{letter.category}</span>
              <span>{letter.file_type?.toUpperCase()}</span>
            </div>
          </div>
          <a
            href={`${API}/api/letters/download/${letter.id}`}
            className="flex items-center gap-1 text-primary-blue hover:text-primary-blue/80 text-sm font-medium whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Download
          </a>
        </div>
      )}
    </div>
  );
};

export default FreeLetters;
