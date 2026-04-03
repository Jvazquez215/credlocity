import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Instagram, Facebook, Youtube, Linkedin, Twitter, MapPin, Star, ChevronRight, ArrowRight, Shield, Award, Users, Home, Car, BookOpen, TrendingUp, Phone, Mail, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, youtube: Youtube, tiktok: Globe, linkedin: Linkedin, twitter: Twitter };

const SocialLinks = ({ social, className = '' }) => {
  if (!social) return null;
  const links = Object.entries(social).filter(([, v]) => v);
  if (links.length === 0) return null;
  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="social-links">
      {links.map(([platform, url]) => {
        const Icon = SOCIAL_ICONS[platform] || Globe;
        return (
          <a key={platform} href={url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" data-testid={`social-${platform}`}>
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};

const ServiceCard = ({ service, icon: Icon }) => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
    <Icon className="w-6 h-6 mb-2 text-blue-400" />
    <p className="text-sm font-medium">{service}</p>
  </div>
);

const TestimonialCard = ({ t }) => (
  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
    <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
    <p className="text-sm italic opacity-80">"{t.text}"</p>
    <p className="text-xs mt-3 opacity-60">— {t.name}{t.title ? `, ${t.title}` : ''}</p>
  </div>
);

// ================================================================
// REAL ESTATE TEMPLATE — City-focused, property themed
// ================================================================
const RealEstateTemplate = ({ aff }) => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
    <Helmet>
      <title>{aff.seo_title || `${aff.display_name} | Real Estate & Credit Repair`}</title>
      <meta name="description" content={aff.seo_description || aff.bio} />
      <meta name="keywords" content={aff.seo_keywords} />
      <meta property="og:title" content={aff.seo_title || aff.display_name} />
      <meta property="og:description" content={aff.seo_description || aff.bio} />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "RealEstateAgent",
        name: aff.display_name || aff.name, description: aff.bio,
        url: window.location.href, areaServed: aff.city,
        address: { "@type": "PostalAddress", addressLocality: aff.city, addressRegion: aff.state },
      })}</script>
    </Helmet>

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.15),transparent_50%)]" />
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Credlocity Affiliate Partner</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              {aff.display_name || aff.name}
            </h1>
            {aff.tagline && <p className="text-xl text-green-300 font-medium">{aff.tagline}</p>}
            {aff.city && (
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" /><span>{aff.city}{aff.state ? `, ${aff.state}` : ''}</span>
              </div>
            )}
            <p className="text-gray-300 text-base leading-relaxed max-w-xl">{aff.bio}</p>
            <div className="flex flex-wrap gap-3">
              {aff.website && <a href={aff.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition" data-testid="cta-website"><Globe className="w-4 h-4" />Visit Website</a>}
              <a href="#contact-form" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white/10 rounded-full transition" data-testid="cta-contact"><ArrowRight className="w-4 h-4" />Get Started</a>
            </div>
            <SocialLinks social={aff.social_media} />
          </div>
          <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border-4 border-green-500/30 shadow-2xl flex-shrink-0">
            {aff.headshot_url ? (
              <img src={aff.headshot_url} alt={aff.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-slate-700 flex items-center justify-center text-6xl font-black text-green-400/30">{aff.name?.charAt(0)}</div>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* Services */}
    {aff.services_highlight?.length > 0 && (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-lg font-bold mb-6 text-green-400">How {aff.display_name || aff.name} Helps You</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {aff.services_highlight.map((s, i) => <ServiceCard key={i} service={s} icon={[Home, Shield, Award, TrendingUp][i % 4]} />)}
        </div>
      </section>
    )}

    {/* Why Credit Matters */}
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-gradient-to-r from-green-900/40 to-slate-800/40 rounded-2xl p-8 border border-green-500/20">
        <h2 className="text-lg font-bold mb-4">Why Credit Matters When Buying a Home{aff.city ? ` in ${aff.city}` : ''}</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-300">
          <div><CheckCircle2 className="w-5 h-5 text-green-400 mb-2" /><p>A higher credit score means lower mortgage rates and thousands saved over the life of your loan.</p></div>
          <div><CheckCircle2 className="w-5 h-5 text-green-400 mb-2" /><p>Pre-approval becomes easier, giving you a competitive edge in {aff.city || 'your local'} market.</p></div>
          <div><CheckCircle2 className="w-5 h-5 text-green-400 mb-2" /><p>Credlocity's credit repair program can help you qualify for your dream home faster.</p></div>
        </div>
      </div>
    </section>

    {/* Testimonials */}
    {aff.testimonials?.length > 0 && (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-lg font-bold mb-6">What People Are Saying</h2>
        <div className="grid sm:grid-cols-2 gap-4">{aff.testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
      </section>
    )}

    {/* Contact Form / CTA */}
    <section id="contact-form" className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Get Credit-Ready for Homeownership?</h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">Partner with {aff.display_name || aff.name} and Credlocity to build your credit and buy your dream home.</p>
        {aff.custom_form_html ? (
          <div dangerouslySetInnerHTML={{ __html: aff.custom_form_html }} data-testid="custom-form" />
        ) : (
          <a href="/credit-builder-store" className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition text-lg" data-testid="default-cta">
            Start Your Credit Journey <ArrowRight className="w-5 h-5" />
          </a>
        )}
      </div>
    </section>

    <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
      <p>Powered by <a href="/" className="text-blue-400 hover:underline">Credlocity</a> — America's Credit Repair Partner</p>
    </footer>
  </div>
);

// ================================================================
// CREDIT REPAIR EDUCATOR TEMPLATE — Authority/educator layout
// ================================================================
const EducatorTemplate = ({ aff }) => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white">
    <Helmet>
      <title>{aff.seo_title || `${aff.display_name} | Credit Repair Education`}</title>
      <meta name="description" content={aff.seo_description || aff.bio} />
      <meta name="keywords" content={aff.seo_keywords} />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "Person",
        name: aff.display_name || aff.name, description: aff.bio,
        url: window.location.href, jobTitle: "Credit Repair Educator",
        sameAs: Object.values(aff.social_media || {}).filter(Boolean),
      })}</script>
    </Helmet>

    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.2),transparent_50%)]" />
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">Credit Education Expert</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">{aff.display_name || aff.name}</h1>
            {aff.tagline && <p className="text-xl text-indigo-300 font-medium">{aff.tagline}</p>}
            <p className="text-gray-300 text-base leading-relaxed max-w-xl">{aff.bio}</p>
            <div className="flex flex-wrap gap-3">
              <a href="#learn" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full transition" data-testid="cta-learn"><BookOpen className="w-4 h-4" />Learn From Me</a>
              <a href="#contact-form" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white/10 rounded-full transition"><ArrowRight className="w-4 h-4" />Get Started</a>
            </div>
            <SocialLinks social={aff.social_media} />
          </div>
          <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border-4 border-indigo-500/30 shadow-2xl flex-shrink-0">
            {aff.headshot_url ? (
              <img src={aff.headshot_url} alt={aff.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-slate-700 flex items-center justify-center text-6xl font-black text-indigo-400/30">{aff.name?.charAt(0)}</div>
            )}
          </div>
        </div>
      </div>
    </section>

    {aff.video_url && (
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="aspect-video rounded-2xl overflow-hidden border border-indigo-500/20">
          <iframe src={aff.video_url} title="Video" className="w-full h-full" allowFullScreen />
        </div>
      </section>
    )}

    {aff.services_highlight?.length > 0 && (
      <section id="learn" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-lg font-bold mb-6 text-indigo-400">What You'll Learn</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {aff.services_highlight.map((s, i) => <ServiceCard key={i} service={s} icon={[BookOpen, Shield, Award, TrendingUp][i % 4]} />)}
        </div>
      </section>
    )}

    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800/40 rounded-2xl p-8 border border-indigo-500/20">
        <h2 className="text-lg font-bold mb-4">Your Credit Score Is Your Financial Foundation</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-300">
          <div><CheckCircle2 className="w-5 h-5 text-indigo-400 mb-2" /><p>Understand how credit scores work and what impacts them the most.</p></div>
          <div><CheckCircle2 className="w-5 h-5 text-indigo-400 mb-2" /><p>Learn proven strategies to dispute errors and remove negative items.</p></div>
          <div><CheckCircle2 className="w-5 h-5 text-indigo-400 mb-2" /><p>Build credit the right way with Credlocity's credit builder program.</p></div>
        </div>
      </div>
    </section>

    {aff.testimonials?.length > 0 && (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-lg font-bold mb-6">Student Success Stories</h2>
        <div className="grid sm:grid-cols-2 gap-4">{aff.testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
      </section>
    )}

    <section id="contact-form" className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Start Your Credit Transformation Today</h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">Follow {aff.display_name || aff.name} and partner with Credlocity for professional credit repair.</p>
        {aff.custom_form_html ? (
          <div dangerouslySetInnerHTML={{ __html: aff.custom_form_html }} data-testid="custom-form" />
        ) : (
          <a href="/credit-builder-store" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full transition text-lg" data-testid="default-cta">
            Start Your Credit Journey <ArrowRight className="w-5 h-5" />
          </a>
        )}
      </div>
    </section>

    <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
      <p>Powered by <a href="/" className="text-indigo-400 hover:underline">Credlocity</a></p>
    </footer>
  </div>
);

// ================================================================
// MORTGAGE TEMPLATE — Professional finance
// ================================================================
const MortgageTemplate = ({ aff }) => (
  <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white">
    <Helmet>
      <title>{aff.seo_title || `${aff.display_name} | Mortgage & Credit Solutions`}</title>
      <meta name="description" content={aff.seo_description || aff.bio} />
      <meta name="keywords" content={aff.seo_keywords} />
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "FinancialService", name: aff.display_name || aff.name, description: aff.bio, url: window.location.href, areaServed: aff.city })}</script>
    </Helmet>
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2"><TrendingUp className="w-4 h-4" />Mortgage Partner</span>
          <h1 className="text-4xl sm:text-5xl font-black">{aff.display_name || aff.name}</h1>
          {aff.tagline && <p className="text-xl text-emerald-300">{aff.tagline}</p>}
          {aff.city && <p className="flex items-center gap-2 text-gray-300"><MapPin className="w-4 h-4" />{aff.city}{aff.state ? `, ${aff.state}` : ''}</p>}
          <p className="text-gray-300 max-w-xl">{aff.bio}</p>
          <div className="flex flex-wrap gap-3">
            {aff.website && <a href={aff.website} target="_blank" rel="noreferrer" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition">Visit Website</a>}
            <a href="#contact-form" className="px-6 py-3 border border-white/30 hover:bg-white/10 rounded-full transition">Get Pre-Qualified</a>
          </div>
          <SocialLinks social={aff.social_media} />
        </div>
        <div className="w-64 h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-4 border-emerald-500/30 shadow-2xl">
          {aff.headshot_url ? <img src={aff.headshot_url} alt={aff.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-emerald-900/30 flex items-center justify-center text-6xl font-black text-emerald-400/30">{aff.name?.charAt(0)}</div>}
        </div>
      </div>
    </section>
    {aff.services_highlight?.length > 0 && <section className="max-w-6xl mx-auto px-6 py-16"><h2 className="text-lg font-bold mb-6 text-emerald-400">Services</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{aff.services_highlight.map((s, i) => <ServiceCard key={i} service={s} icon={[TrendingUp, Shield, Home, Award][i % 4]} />)}</div></section>}
    <section className="max-w-6xl mx-auto px-6 py-16"><div className="bg-emerald-900/30 rounded-2xl p-8 border border-emerald-500/20"><h2 className="text-lg font-bold mb-4">Better Credit = Better Mortgage Rates</h2><div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-300"><div><CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" /><p>Even a 20-point credit score increase can save you thousands on your mortgage.</p></div><div><CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" /><p>Credlocity helps you dispute errors and boost your score before applying.</p></div><div><CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" /><p>Get pre-qualified faster with a clean credit profile.</p></div></div></div></section>
    {aff.testimonials?.length > 0 && <section className="max-w-6xl mx-auto px-6 py-16"><h2 className="text-lg font-bold mb-6">Client Testimonials</h2><div className="grid sm:grid-cols-2 gap-4">{aff.testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}</div></section>}
    <section id="contact-form" className="max-w-6xl mx-auto px-6 py-16"><div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"><h2 className="text-2xl font-bold mb-3">Ready to Get Mortgage-Ready?</h2><p className="text-gray-400 mb-6">Work with {aff.display_name || aff.name} and Credlocity to build your credit for the best rates.</p>{aff.custom_form_html ? <div dangerouslySetInnerHTML={{ __html: aff.custom_form_html }} /> : <a href="/credit-builder-store" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition text-lg inline-flex items-center gap-2">Start Now <ArrowRight className="w-5 h-5" /></a>}</div></section>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500"><p>Powered by <a href="/" className="text-emerald-400 hover:underline">Credlocity</a></p></footer>
  </div>
);

// ================================================================
// SOCIAL MEDIA TEMPLATE — Creator-style
// ================================================================
const SocialMediaTemplate = ({ aff }) => (
  <div className="min-h-screen bg-gradient-to-b from-fuchsia-950 via-slate-900 to-slate-950 text-white">
    <Helmet>
      <title>{aff.seo_title || `${aff.display_name} | Social Media Creator`}</title>
      <meta name="description" content={aff.seo_description || aff.bio} />
      <meta name="keywords" content={aff.seo_keywords} />
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: aff.display_name || aff.name, description: aff.bio, url: window.location.href, sameAs: Object.values(aff.social_media || {}).filter(Boolean) })}</script>
    </Helmet>
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-fuchsia-500/50 shadow-2xl mx-auto mb-6">
        {aff.headshot_url ? <img src={aff.headshot_url} alt={aff.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-fuchsia-900/30 flex items-center justify-center text-4xl font-black text-fuchsia-400/30">{aff.name?.charAt(0)}</div>}
      </div>
      <span className="text-fuchsia-400 text-sm font-semibold uppercase tracking-wider">Content Creator</span>
      <h1 className="text-4xl sm:text-5xl font-black mt-2">{aff.display_name || aff.name}</h1>
      {aff.tagline && <p className="text-xl text-fuchsia-300 mt-3">{aff.tagline}</p>}
      <p className="text-gray-300 max-w-2xl mx-auto mt-4">{aff.bio}</p>
      <SocialLinks social={aff.social_media} className="justify-center mt-6" />
    </section>
    {aff.video_url && <section className="max-w-4xl mx-auto px-6 py-8"><div className="aspect-video rounded-2xl overflow-hidden border border-fuchsia-500/20"><iframe src={aff.video_url} title="Video" className="w-full h-full" allowFullScreen /></div></section>}
    {aff.services_highlight?.length > 0 && <section className="max-w-6xl mx-auto px-6 py-16"><h2 className="text-lg font-bold mb-6 text-fuchsia-400 text-center">What I Share</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{aff.services_highlight.map((s, i) => <ServiceCard key={i} service={s} icon={[BookOpen, Shield, Award, TrendingUp][i % 4]} />)}</div></section>}
    <section className="max-w-6xl mx-auto px-6 py-16"><div className="bg-fuchsia-900/20 rounded-2xl p-8 border border-fuchsia-500/20 text-center"><h2 className="text-lg font-bold mb-4">Level Up Your Credit Game</h2><p className="text-gray-300 max-w-xl mx-auto">Follow {aff.display_name || aff.name} for daily credit tips and partner with Credlocity for professional credit repair.</p></div></section>
    {aff.testimonials?.length > 0 && <section className="max-w-6xl mx-auto px-6 py-16"><div className="grid sm:grid-cols-2 gap-4">{aff.testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}</div></section>}
    <section id="contact-form" className="max-w-6xl mx-auto px-6 py-16"><div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"><h2 className="text-2xl font-bold mb-3">Start Your Credit Transformation</h2>{aff.custom_form_html ? <div dangerouslySetInnerHTML={{ __html: aff.custom_form_html }} /> : <a href="/credit-builder-store" className="px-8 py-4 bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold rounded-full transition text-lg inline-flex items-center gap-2 mx-auto">Get Started <ArrowRight className="w-5 h-5" /></a>}</div></section>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500"><p>Powered by <a href="/" className="text-fuchsia-400 hover:underline">Credlocity</a></p></footer>
  </div>
);

// ================================================================
// CAR DEALERSHIP TEMPLATE — Bold automotive
// ================================================================
const CarDealerTemplate = ({ aff }) => (
  <div className="min-h-screen bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 text-white">
    <Helmet>
      <title>{aff.seo_title || `${aff.display_name} | Auto Credit Solutions`}</title>
      <meta name="description" content={aff.seo_description || aff.bio} />
      <meta name="keywords" content={aff.seo_keywords} />
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "AutoDealer", name: aff.display_name || aff.name, description: aff.bio, url: window.location.href, areaServed: aff.city })}</script>
    </Helmet>
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <span className="text-red-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2"><Car className="w-5 h-5" />Auto Credit Partner</span>
          <h1 className="text-4xl sm:text-5xl font-black">{aff.display_name || aff.name}</h1>
          {aff.tagline && <p className="text-xl text-red-300">{aff.tagline}</p>}
          {aff.city && <p className="flex items-center gap-2 text-gray-300"><MapPin className="w-4 h-4" />{aff.city}{aff.state ? `, ${aff.state}` : ''}</p>}
          <p className="text-gray-300 max-w-xl">{aff.bio}</p>
          <div className="flex flex-wrap gap-3">
            {aff.website && <a href={aff.website} target="_blank" rel="noreferrer" className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition">Visit Dealership</a>}
            <a href="#contact-form" className="px-6 py-3 border border-white/30 hover:bg-white/10 rounded-full transition">Get Approved</a>
          </div>
          <SocialLinks social={aff.social_media} />
        </div>
        <div className="w-64 h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-4 border-red-500/30 shadow-2xl">
          {aff.headshot_url ? <img src={aff.headshot_url} alt={aff.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-red-900/30 flex items-center justify-center"><Car className="w-20 h-20 text-red-400/30" /></div>}
        </div>
      </div>
    </section>
    {aff.services_highlight?.length > 0 && <section className="max-w-6xl mx-auto px-6 py-16"><h2 className="text-lg font-bold mb-6 text-red-400">Our Services</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{aff.services_highlight.map((s, i) => <ServiceCard key={i} service={s} icon={[Car, Shield, Award, TrendingUp][i % 4]} />)}</div></section>}
    <section className="max-w-6xl mx-auto px-6 py-16"><div className="bg-red-900/20 rounded-2xl p-8 border border-red-500/20"><h2 className="text-lg font-bold mb-4">Bad Credit? No Problem.</h2><div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-300"><div><CheckCircle2 className="w-5 h-5 text-red-400 mb-2" /><p>We work with all credit types — get approved today.</p></div><div><CheckCircle2 className="w-5 h-5 text-red-400 mb-2" /><p>Credlocity can help improve your score for better financing rates.</p></div><div><CheckCircle2 className="w-5 h-5 text-red-400 mb-2" /><p>Drive away in your dream car while building your credit.</p></div></div></div></section>
    {aff.testimonials?.length > 0 && <section className="max-w-6xl mx-auto px-6 py-16"><div className="grid sm:grid-cols-2 gap-4">{aff.testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}</div></section>}
    <section id="contact-form" className="max-w-6xl mx-auto px-6 py-16"><div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"><h2 className="text-2xl font-bold mb-3">Get Approved Today</h2><p className="text-gray-400 mb-6">Let {aff.display_name || aff.name} and Credlocity help you drive away in your new car.</p>{aff.custom_form_html ? <div dangerouslySetInnerHTML={{ __html: aff.custom_form_html }} /> : <a href="/credit-builder-store" className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition text-lg inline-flex items-center gap-2">Apply Now <ArrowRight className="w-5 h-5" /></a>}</div></section>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500"><p>Powered by <a href="/" className="text-red-400 hover:underline">Credlocity</a></p></footer>
  </div>
);

// ================================================================
// ROUTER COMPONENT
// ================================================================
const TEMPLATES = {
  real_estate: RealEstateTemplate,
  credit_repair_educator: EducatorTemplate,
  mortgage: MortgageTemplate,
  social_media: SocialMediaTemplate,
  car_dealership: CarDealerTemplate,
};

const AffiliateLandingPage = () => {
  const { slug } = useParams();
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/affiliate-pages/public/by-slug/${slug}`)
      .then(r => setAffiliate(r.data))
      .catch(err => setError(err.response?.status === 404 ? 'Affiliate not found' : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !affiliate) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-center">
      <div><h1 className="text-3xl font-bold mb-2">404</h1><p className="text-gray-400">{error || 'Partner page not found'}</p><a href="/" className="text-blue-400 hover:underline mt-4 inline-block">Back to Credlocity</a></div>
    </div>
  );

  const Template = TEMPLATES[affiliate.affiliate_type] || RealEstateTemplate;
  return <Template aff={affiliate} />;
};

export default AffiliateLandingPage;
