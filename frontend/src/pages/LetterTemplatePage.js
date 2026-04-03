import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FileText, Download, ChevronRight, Shield, AlertTriangle, CheckCircle,
  Phone, MapPin, Globe, Mail, ArrowRight, Clock, Target, BookOpen,
  Send, FileCheck, Printer, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import useSEO from '../hooks/useSEO';
import { TrialButton } from '../components/LeadButtons';

const API = process.env.REACT_APP_BACKEND_URL;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
];

const LetterTemplatePage = () => {
  const { slug } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '', state: '', zip_code: '',
    account_name: '', account_number: '',
    bureau: 'Equifax',
    collector_name: '', collector_address: '',
  });

  useSEO({ title: template?.meta_title || 'Free Letter Template' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/letter-templates/${slug}`);
        if (res.ok) {
          setTemplate(await res.json());
        } else {
          setTemplate(null);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    const required = template?.required_fields || [];
    const missing = required.filter(f => !form[f]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/letter-templates/${slug}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Generation failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}_${form.last_name || 'letter'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Letter generated and downloaded! Remember to sign and date it before sending.', { duration: 6000 });
    } catch (err) {
      toast.error(err.message);
    }
    setGenerating(false);
  };

  // Inject JSON-LD schemas directly into DOM (must be before conditional returns)
  useEffect(() => {
    if (!template) return;

    const schemas = [];

    // Article schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": template.title,
      "description": template.meta_description,
      "url": `https://www.credlocity.com/free-letters/${slug}`,
      "author": { "@type": "Organization", "name": "Credlocity", "url": "https://www.credlocity.com" },
      "publisher": { "@type": "Organization", "name": "Credlocity", "url": "https://www.credlocity.com" },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.credlocity.com/free-letters/${slug}` },
      "articleSection": template.category,
    });

    // FAQ schema
    if (template.faqs?.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": template.faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      });
    }

    // Breadcrumb schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.credlocity.com/" },
        { "@type": "ListItem", "position": 2, "name": "Free Letters", "item": "https://www.credlocity.com/free-letters" },
        { "@type": "ListItem", "position": 3, "name": template.title, "item": `https://www.credlocity.com/free-letters/${slug}` }
      ]
    });

    // HowTo schema
    const steps = template.how_to_use?.split('\n').filter(s => s.trim()) || [];
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to Use the ${template.title}`,
      "description": template.short_description,
      "step": steps.map((step, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "text": step.replace(/^\d+\.\s*/, '')
      }))
    });

    // Inject into DOM
    const elements = schemas.map((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-letter-schema', `letter-${i}`);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => elements.forEach(el => el.remove());
  }, [template, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Letter Not Found</h2>
          <p className="text-gray-500 mb-6">This letter template doesn't exist.</p>
          <Button asChild><Link to="/free-letters">Back to Free Letters</Link></Button>
        </div>
      </div>
    );
  }

  const bureaus = template.credit_bureaus || [];
  const sendToBureaus = template.send_to === 'credit_bureaus';
  const howToSteps = template.how_to_use?.split('\n').filter(s => s.trim()) || [];
  const aftercareLines = template.aftercare?.split('\n').filter(s => s.trim()) || [];
  const faqs = template.faqs || [];

  return (
    <div className="min-h-screen bg-white" data-testid="letter-template-page">
      <Helmet>
        <title>{template.meta_title}</title>
        <meta name="description" content={template.meta_description} />
        <link rel="canonical" href={`https://www.credlocity.com/free-letters/${slug}`} />
        <meta property="og:title" content={template.meta_title} />
        <meta property="og:description" content={template.meta_description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.credlocity.com/free-letters/${slug}`} />
        <meta property="og:site_name" content="Credlocity" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={template.meta_title} />
        <meta name="twitter:description" content={template.meta_description} />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content={`${template.title.toLowerCase()}, free ${template.category.toLowerCase()} template, credit repair letter, FCRA dispute, ${template.title.toLowerCase()} template download`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-14 md:py-18">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-5" data-testid="breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link><ChevronRight className="w-3 h-3" />
            <Link to="/free-letters" className="hover:text-white">Free Letters</Link><ChevronRight className="w-3 h-3" />
            <span className="text-white">{template.title}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-white/20 text-white border-0 text-xs">{template.category}</Badge>
            {sendToBureaus && <Badge className="bg-secondary-green/80 text-white border-0 text-xs">Send to Credit Bureaus</Badge>}
          </div>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold mb-4" data-testid="letter-title">{template.title}</h1>
          <p className="text-base md:text-lg text-gray-200 max-w-3xl leading-relaxed">{template.short_description}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* What This Letter Does */}
            <section data-testid="letter-description">
              <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-blue" /> What This Letter Does
              </h2>
              <p className="text-gray-700 leading-relaxed">{template.description}</p>
            </section>

            {/* How to Use */}
            <section data-testid="how-to-use">
              <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-blue" /> How to Use This Letter
              </h2>
              <div className="space-y-3">
                {howToSteps.map((step, i) => {
                  const text = step.replace(/^\d+\.\s*/, '');
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-7 h-7 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Results Likelihood */}
            <section data-testid="results-section">
              <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> How Likely Are You to Get Results?
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-gray-700 leading-relaxed">{template.results_likelihood}</p>
              </div>
            </section>

            {/* Certified Mail Section */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-6" data-testid="certified-mail-section">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" /> Why You Must Send via Certified Mail, Return Receipt Requested
              </h3>
              <div className="space-y-2 text-sm text-amber-800">
                <p><strong>Certified Mail</strong> provides official USPS tracking and proof that the letter was sent. The Return Receipt (also called a "green card") is a signed confirmation that the recipient received your letter.</p>
                <p>This is critical because:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><strong>Legal Proof of Delivery:</strong> If a creditor or bureau claims they never received your dispute, your certified mail receipt proves otherwise</li>
                  <li><strong>Starts the Clock:</strong> The 30-day investigation period begins when the bureau receives your letter — the return receipt documents this date</li>
                  <li><strong>Court Evidence:</strong> If you need to file a lawsuit under the FCRA or FDCPA, certified mail receipts are admissible as evidence</li>
                  <li><strong>Accountability:</strong> Companies take certified mail more seriously than regular mail or online disputes</li>
                </ul>
                <p className="pt-2"><strong>Cost:</strong> Approximately $7-$10 per letter at the post office. This small investment protects your legal rights and is well worth it.</p>
              </div>
            </section>

            {/* After Care / Follow Up */}
            <section data-testid="aftercare-section">
              <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-blue" /> After You Send: Follow-Up & After-Care
              </h2>
              <div className="bg-gray-50 border rounded-xl p-5 space-y-2">
                {aftercareLines.map((line, i) => {
                  const trimmed = line.replace(/^-\s*/, '').trim();
                  if (!trimmed) return null;
                  const isBold = trimmed.startsWith('**') || trimmed.includes('**');
                  const cleaned = trimmed.replace(/\*\*/g, '');
                  const [heading, ...rest] = cleaned.split(':');
                  return (
                    <div key={i} className="flex gap-2 items-start text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                      <p>
                        {rest.length > 0 ? (
                          <><strong className="text-gray-900">{heading}:</strong> {rest.join(':')}</>
                        ) : cleaned}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Generate Letter Form */}
            <section id="generate" className="scroll-mt-20" data-testid="generate-form-section">
              <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-blue" /> Generate Your Personalized Letter
              </h2>
              <p className="text-sm text-gray-500 mb-6">Fill out the form below with your information. Your letter will be automatically generated and downloaded as a PDF.</p>

              <form onSubmit={handleGenerate} className="bg-gray-50 border rounded-xl p-6 space-y-5">
                {/* Personal Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase tracking-wide">Your Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">First Name *</label>
                      <Input value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="John" data-testid="form-first-name" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Last Name *</label>
                      <Input value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Smith" data-testid="form-last-name" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Email Address *</label>
                      <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@example.com" data-testid="form-email" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Phone Number *</label>
                      <Input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 123-4567" data-testid="form-phone" required />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase tracking-wide">Mailing Address</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Street Address *</label>
                      <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main Street, Apt 4B" data-testid="form-address" required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 font-medium">City *</label>
                        <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Miami" data-testid="form-city" required />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">State *</label>
                        <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.state} onChange={e => update('state', e.target.value)} data-testid="form-state" required>
                          <option value="">Select</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Zip Code *</label>
                        <Input value={form.zip_code} onChange={e => update('zip_code', e.target.value)} placeholder="33101" data-testid="form-zip" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase tracking-wide">Account Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">{sendToBureaus ? 'Creditor / Account Name *' : 'Collection Agency / Account Name *'}</label>
                      <Input value={form.account_name} onChange={e => update('account_name', e.target.value)} placeholder="Capital One" data-testid="form-account-name" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Account Number *</label>
                      <Input value={form.account_number} onChange={e => update('account_number', e.target.value)} placeholder="XXXX-XXXX-1234" data-testid="form-account-number" required />
                    </div>
                  </div>
                </div>

                {/* Bureau Selection (for bureau letters) */}
                {sendToBureaus && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase tracking-wide">Send To Which Bureau?</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {bureaus.map(b => (
                        <label
                          key={b.name}
                          className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            form.bureau === b.name ? 'border-primary-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="bureau"
                            value={b.name}
                            checked={form.bureau === b.name}
                            onChange={e => update('bureau', e.target.value)}
                            className="accent-primary-blue"
                          />
                          <span className="text-sm font-medium">{b.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">You should send to each bureau reporting the error. Generate one letter per bureau.</p>
                  </div>
                )}

                {/* Collector Address (for collector/creditor letters) */}
                {!sendToBureaus && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase tracking-wide">Collector/Creditor Address (Optional)</h3>
                    <Input value={form.collector_address} onChange={e => update('collector_address', e.target.value)} placeholder="123 Collection Ave, Suite 200, City, ST 00000" />
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2 border-t space-y-3">
                  <Button type="submit" disabled={generating} className="w-full bg-primary-blue text-white py-3" size="lg" data-testid="generate-letter-btn">
                    {generating ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Generating...</>
                    ) : (
                      <><Download className="w-5 h-5 mr-2" /> Generate & Download Letter</>
                    )}
                  </Button>
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <Printer className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      <strong>Important:</strong> After downloading, print the letter and <strong>sign it by hand</strong>. Add today's date next to your signature. Unsigned letters may not be processed.
                    </p>
                  </div>
                </div>
              </form>
            </section>

            {/* FAQ Section */}
            {faqs.length > 0 && (
              <section data-testid="letter-faq-section">
                <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-blue" /> Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <LetterFAQItem key={i} question={faq.q} answer={faq.a} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Related Links */}
            {template.related_links?.length > 0 && (
              <section data-testid="related-links">
                <h3 className="font-cinzel text-lg font-bold text-gray-900 mb-3">Related Resources</h3>
                <div className="flex flex-wrap gap-3">
                  {template.related_links.map((link, i) => (
                    <Link
                      key={i}
                      to={link.url}
                      className="text-sm text-primary-blue hover:text-primary-blue/80 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {link.text} <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Quick Generate CTA */}
            <Card className="border-primary-blue/20 bg-blue-50">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary-blue" /> Ready to Generate?
                </h3>
                <p className="text-sm text-gray-600 mb-3">Fill in your details in the form and get your personalized letter instantly.</p>
                <Button className="w-full bg-primary-blue text-white" size="sm" asChild>
                  <a href="#generate">Go to Form <ArrowRight className="w-3 h-3 ml-1" /></a>
                </Button>
              </CardContent>
            </Card>

            {/* Credit Bureau Contacts */}
            <Card data-testid="bureau-contacts-card">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-blue" /> Credit Bureau Addresses
                </h3>
                <div className="space-y-4">
                  {bureaus.map(b => (
                    <div key={b.name} className="border-b pb-3 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-gray-800 text-sm">{b.name}</h4>
                      <div className="space-y-1 mt-1.5 text-xs text-gray-600">
                        <p className="flex items-start gap-1.5"><MapPin className="w-3 h-3 shrink-0 mt-0.5" />{b.address}</p>
                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{b.phone}</p>
                        <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 shrink-0" />{b.website}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Professional Help CTA */}
            <Card className="bg-gradient-primary text-white border-0">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Need Professional Help?</h3>
                <p className="text-sm text-gray-200 mb-3">Let our Board Certified Credit Consultants handle your disputes professionally.</p>
                <Button className="w-full bg-secondary-green hover:bg-secondary-light text-white" size="sm" asChild>
                  <TrialButton variant="link" className="inline-flex items-center">
                    Start Free Trial <ArrowRight className="w-3 h-3 ml-1" />
                  </TrialButton>
                </Button>
              </CardContent>
            </Card>

            {/* Other Letters */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Other Free Letters</h3>
                <div className="space-y-2">
                  <Link to="/free-letters" className="flex items-center gap-2 text-sm text-primary-blue hover:underline">
                    <FileText className="w-3 h-3" /> View All Free Letters
                  </Link>
                  {template.related_links?.filter(l => l.url.startsWith('/free-letters/')).map((link, i) => (
                    <Link key={i} to={link.url} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-blue">
                      <FileText className="w-3 h-3" /> {link.text}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-14 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-3">Explore More Free Letter Templates</h2>
          <p className="text-gray-600 text-sm mb-6 max-w-xl mx-auto">We offer a full library of dispute letters, debt validation requests, cease and desist notices, and more — all free to download.</p>
          <Button size="lg" className="bg-primary-blue text-white" asChild>
            <Link to="/free-letters">View All Free Letters <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

// === FAQ Accordion Item for individual letter pages ===
const LetterFAQItem = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden" data-testid={`letter-faq-${index}`}>
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

export default LetterTemplatePage;
