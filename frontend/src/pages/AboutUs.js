import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Award, Users, Heart, Scale, Star, ArrowRight, MapPin, TrendingUp, Building2, Crown, BookOpen, FileText, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import useSEO from '../hooks/useSEO';
import { useLeadCapture } from '../context/LeadCaptureContext';

const AboutUs = () => {
  useSEO({ title: 'About Us', description: 'Learn about Credlocity — our team, mission, values, and 17 years of credit repair excellence.' });
  const { openFreeTrial } = useLeadCapture();

  return (
    <div className="min-h-screen" data-testid="about-us-page">
      <Helmet>
        <title>About Us | Credlocity Credit Repair</title>
        <meta name="description" content="Meet the team behind Credlocity. 17 years of experience, 79,000+ clients served, 5.0-star rating. Learn about our mission, leadership, and why we're the most trusted credit repair company." />
        <link rel="canonical" href="https://www.credlocity.com/about-us" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-8">
            <Link to="/" className="hover:text-white transition">Home</Link><span>/</span><span className="text-white">About Us</span>
          </nav>
          <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="about-page-title">About Us</h1>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl">
            Credlocity has helped over 79,000 Americans improve their credit scores since 2008. We're Board Certified, CROA-compliant, and the only major credit repair company offering a genuine 30-day free trial.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-10 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto text-center">
            {[
              { val: '2008', label: 'Founded' },
              { val: '79,000+', label: 'Clients Served' },
              { val: '236 pts', label: 'Avg Score Increase' },
              { val: '5.0', label: 'Star Rating' },
              { val: '3-7 mo', label: 'Avg Client Duration' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-primary-blue">{s.val}</div>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="py-16 bg-gray-50" data-testid="about-overview">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">Get to Know Credlocity</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">Everything you need to know about who we are, what we do, and why we do it differently.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'About Credlocity', desc: 'Our full company story — founded in 2008, Hispanic-owned, and committed to changing the credit repair industry. Learn about our mission, values, and 17-year history.', link: '/about-credlocity', cta: 'Read Our Story' },
              { icon: Users, title: 'Our Team', desc: 'Meet the Board Certified Credit Consultants and specialists behind 79,000+ successful cases. Led by Joeziel Vazquez, BCCC.', link: '/team', cta: 'Meet the Team' },
              { icon: Star, title: 'Success Stories', desc: 'Real results from real clients. See before-and-after scores, timelines, and the strategies that worked.', link: '/success-stories', cta: 'View Results' },
              { icon: Shield, title: 'Why Choose Us', desc: 'What sets Credlocity apart: 30-day free trial, no upfront fees, CROA/TSR compliance, 180-day guarantee, and 5.0-star rating.', link: '/why-us', cta: 'See Why' },
              { icon: TrendingUp, title: '30-Day Free Trial', desc: 'We\'re the only major credit repair company to offer a genuine 30-day free trial. Learn why we believe this is what CROA compliance really means.', link: '/30-day-free-trial', cta: 'Learn More' },
              { icon: Scale, title: 'How It Works', desc: 'Our proven 6-step credit repair process, from free analysis to credit building. Transparent and effective.', link: '/how-it-works', cta: 'See the Process' },
              { icon: BookOpen, title: 'Credit Repair Laws', desc: 'Comprehensive guide to FCRA, CROA, FDCPA, TSR, and FCBA — the laws that protect your credit rights.', link: '/credit-repair-laws', cta: 'Read the Guide' },
              { icon: Award, title: 'Pricing Plans', desc: 'Three transparent plans starting after your free trial. No hidden fees, no setup costs, no advance charges.', link: '/pricing', cta: 'View Plans' },
              { icon: FileText, title: 'Free Letters', desc: 'Download free dispute letter templates and guides to exercise your consumer rights.', link: '/free-letters', cta: 'Get Letters' },
            ].map((item, i) => (
              <Link key={i} to={item.link} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-blue/30 hover:shadow-lg transition-all group" data-testid={`about-card-${i}`}>
                <item.icon className="w-8 h-8 text-primary-blue mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.desc}</p>
                <span className="text-primary-blue text-sm font-medium inline-flex items-center gap-1">{item.cta} <ChevronRight className="w-3 h-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Quick View */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Our Leadership</h2>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-primary-blue text-white rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">JV</div>
              <div>
                <h3 className="font-cinzel text-2xl font-bold text-gray-900">Joeziel Vazquez</h3>
                <p className="text-primary-blue font-medium mb-4">Founder & CEO, Board Certified Credit Consultant (BCCC, CCSC, CCRS, FCRA Certified)</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  With 17+ years of experience and 79,000+ clients, Joeziel leads Credlocity with an unwavering commitment to consumer protection and ethical credit repair.
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/team/joeziel-joey-vazquez-davila" className="text-primary-blue text-sm font-medium hover:underline inline-flex items-center gap-1" data-testid="meet-founder-link">
                    Meet Our Founder <ChevronRight className="w-3 h-3" />
                  </Link>
                  <Link to="/team" className="text-primary-blue text-sm font-medium hover:underline inline-flex items-center gap-1" data-testid="meet-team-link">
                    Meet Our Team <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Join 79,000+ clients who trust Credlocity. Start your 30-day free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8" onClick={openFreeTrial} data-testid="about-start-trial-btn">
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/about-credlocity">About Credlocity <ChevronRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
