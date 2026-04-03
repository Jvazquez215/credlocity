import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Award, Users, Heart, Scale, Star, CheckCircle, ArrowRight, MapPin, TrendingUp, Building2, Crown, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import useSEO from '../hooks/useSEO';
import { TrialButton } from '../components/LeadButtons';

const AboutCredlocity = () => {
  useSEO({ title: 'About Credlocity', description: 'Learn about Credlocity Business Group LLC — the most trusted FCRA-compliant credit repair company in America. Founded in 2008.' });

  return (
    <div className="min-h-screen" data-testid="about-credlocity-page">
      <Helmet>
        <title>About Credlocity | Our Mission, Values & 17-Year History | Credlocity</title>
        <meta name="description" content="Credlocity Business Group LLC has been the most trusted credit repair company since 2008. Learn about our mission to put consumers first, our CROA-compliant 30-day free trial, and why we're changing the credit repair industry." />
        <link rel="canonical" href="https://www.credlocity.com/about-credlocity" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-8">
            <Link to="/" className="hover:text-white transition">Home</Link><span>/</span><span className="text-white">About Credlocity</span>
          </nav>
          <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="about-credlocity-title">
            About Credlocity
          </h1>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl">
            Credlocity Business Group LLC, formerly Ficostar Credit Services, has been the most trusted name in credit repair since 2008. We exist to change the way credit repair companies operate — by putting consumers first, always.
          </p>
        </div>
      </section>

      {/* Mission & Identity */}
      <section className="py-16 md:py-20 bg-white" data-testid="about-mission-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">Who We Are</h2>
              <div className="prose prose-slate max-w-none space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Credlocity is a <strong>Hispanic-owned, Minority-owned credit repair company</strong> headquartered in Philadelphia, Pennsylvania, with a local office in Ontario, Oregon serving the Idaho market. Founded in 2008 by <strong>Joeziel Vazquez</strong>, a Board Certified Credit Consultant, Credlocity has helped over <strong>79,000 clients</strong> improve their credit scores and reclaim their financial futures.
                </p>
                <p>
                  We are not just another credit repair company. We are a <strong>consumer advocacy organization</strong> that uses the full weight of the <Link to="/fcra-guide" className="text-primary-blue font-medium hover:underline">Fair Credit Reporting Act (FCRA)</Link>, the <Link to="/croa-guide" className="text-primary-blue font-medium hover:underline">Credit Repair Organizations Act (CROA)</Link>, the <Link to="/fdcpa-guide" className="text-primary-blue font-medium hover:underline">Fair Debt Collection Practices Act (FDCPA)</Link>, and the <Link to="/tsr-compliance" className="text-primary-blue font-medium hover:underline">Telemarketing Sales Rule (TSR)</Link> to protect consumers.
                </p>
                <p>
                  On average, our clients work with us for <strong>3 to 7 months</strong> and see an average score increase of <strong>236 points</strong>. Many enter the exclusive 800+ Score Club.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Building2, label: 'Founded', value: '2008 (17+ Years)' },
                { icon: Users, label: 'Clients Served', value: '79,000+' },
                { icon: Star, label: 'Rating', value: '5.0 Stars (A+ BBB, 0 Complaints)' },
                { icon: Crown, label: 'Avg Score Increase', value: '236 Points' },
                { icon: MapPin, label: 'Headquarters', value: '1500 Chestnut St, Suite 2, Philadelphia, PA 19102' },
                { icon: MapPin, label: 'Idaho Office', value: '964 W Idaho Ave, Ontario, OR 97914' },
                { icon: AlertTriangle, label: 'Phone Policy', value: 'TSR Compliant — No phone enrollment' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <item.icon className="w-5 h-5 text-primary-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {item.label === 'Phone Policy' ? (
                        <span>Per the <Link to="/tsr-compliance" className="text-primary-blue hover:underline">Telemarketing Sales Rule (TSR)</Link>, we do not accept clients by phone. All enrollments are through our secure online system.</span>
                      ) : item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Stand For */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="about-values-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">What We Stand For</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            We believe the credit repair industry is broken. Too many companies charge consumers upfront fees, use template disputes, and deliver no results. Credlocity exists to change that.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Consumers First — Always', desc: 'Every decision we make starts with one question: Is this in the best interest of the consumer? We will never prioritize profits over people.' },
              { icon: Scale, title: 'Full Legal Compliance', desc: 'We are 100% compliant with the CROA, FCRA, FDCPA, and TSR. We never charge upfront fees, we always provide written contracts, and we honor the 3-day cancellation right.' },
              { icon: Shield, title: 'The 30-Day Free Trial Promise', desc: 'We offer a 30-day free trial because we believe it\'s what the CROA calls for — ensuring consumers are not charged for credit repair upfront. No other major company does this.' },
              { icon: Award, title: 'Certified Expertise', desc: 'Our team is led by Board Certified Credit Consultants with 17+ years of experience. Every case is handled individually by a real specialist.' },
              { icon: TrendingUp, title: 'Changing the Industry', desc: 'By leading with free trials, transparent pricing, no upfront fees, and real results, we\'re setting a new standard that other companies should follow.' },
              { icon: Users, title: 'Community & Advocacy', desc: 'As a Hispanic-owned, Minority-owned business, we serve underrepresented communities disproportionately affected by credit reporting errors.' },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-blue/30 hover:shadow-md transition">
                <v.icon className="w-8 h-8 text-primary-blue mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Costs Transparency */}
      <section className="py-16 md:py-20 bg-white" data-testid="about-costs-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">Transparency About Costs</h2>
          <p className="text-gray-500 text-center max-w-3xl mx-auto mb-10">
            While our <Link to="/30-day-free-trial" className="text-primary-blue font-medium hover:underline">30-day free trial</Link> means $0 in service fees upfront, there are two required costs not paid to Credlocity:
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="font-cinzel text-xl font-bold text-gray-900">Credit Report & Monitoring</h3><p className="text-sm text-blue-700 font-medium">Paid to ScoreFusion (not Credlocity)</p></div>
                <div className="text-right"><div className="text-3xl font-bold text-primary-blue">$49.95</div><div className="text-xs text-gray-500">/month</div></div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">Before we can dispute inaccurate items, we need to pull your credit reports from all three bureaus. This fee goes directly to <strong>ScoreFusion</strong> for your initial 3-bureau pull and ongoing monthly monitoring.</p>
              <p className="text-xs text-gray-500 italic">This $49.95/month is charged by ScoreFusion, not by Credlocity.</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="font-cinzel text-xl font-bold text-gray-900">E-Notary (Limited Power of Attorney)</h3><p className="text-sm text-green-700 font-medium">Paid to NotaryFox (not Credlocity)</p></div>
                <div className="text-right"><div className="text-3xl font-bold text-secondary-green">$39.95</div><div className="text-xs text-gray-500">one-time</div></div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">To legally dispute items on your behalf, we need a <strong>notarized Limited Power of Attorney</strong>. This one-time fee goes to <strong>NotaryFox</strong> for electronic notarization.</p>
              <p className="text-xs text-gray-500 italic">This $39.95 is a one-time fee charged by NotaryFox, not by Credlocity.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              <strong>After your 30-day free trial</strong>, Credlocity's service fee starts at <strong>$99.95/month</strong> (Fraud Package).
            </p>
            <Link to="/pricing"><Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white">View All Pricing Plans <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="about-approach-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">Our Approach to Credit Repair</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">We don't use shortcuts, loopholes, or illegal tactics. We use the law — correctly and ethically.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-green" /> What We DO</h3>
              <ul className="space-y-3">
                {['File customized, legally compliant dispute letters under FCRA Section 611','Challenge inaccurate, misleading, or unverifiable information with all three bureaus','Send debt validation requests under the FDCPA to collectors','File direct disputes with original creditors (Method of Verification challenges)','Leverage FCRA Section 605B for legitimate identity theft victims','Connect clients with FCRA attorneys for potential lawsuits against violators','Provide ongoing credit education and financial wellness guidance'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><CheckCircle className="w-4 h-4 text-secondary-green mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /> What We NEVER Do</h3>
              <ul className="space-y-3">
                {['Charge upfront fees before work is completed (CROA violation)','Guarantee specific score increases (no legitimate company can)','Use "credit sweep" tactics or file false identity theft claims','Advise clients to create new identities (CPN/file segregation fraud)','Use template dispute letters — every letter is custom','Pressure clients into services they don\'t need','Hide behind fine print or misleading marketing'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">&times;</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CEO */}
      <section className="py-16 md:py-20 bg-white" data-testid="about-leadership-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Our Leadership</h2>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-primary-blue text-white rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">JV</div>
              <div>
                <h3 className="font-cinzel text-2xl font-bold text-gray-900">Joeziel Vazquez</h3>
                <p className="text-primary-blue font-medium mb-4">Founder & CEO, Board Certified Credit Consultant</p>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
                  <p>Joeziel Vazquez founded Credlocity (originally Ficostar Credit Services) in 2008 after being personally victimized by a large credit repair company. That experience drives our commitment to ethics and consumer protection.</p>
                  <p>With over 17 years of experience, Joeziel is a Board Certified Credit Consultant (BCCC, CCSC, CCRS, FCRA Certified) who has personally overseen the credit repair of more than 79,000 clients.</p>
                  <p>Under his leadership, Credlocity has maintained a <strong>perfect 5.0-star rating</strong>, an <strong>A+ BBB rating with zero complaints</strong>, and has become the only major credit repair company to offer a genuine <Link to="/30-day-free-trial" className="text-primary-blue hover:underline">30-day free trial</Link>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Credlocity Difference?</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">Join 79,000+ clients who trust us. Start your 30-day free trial — no service fees, no risk.</p>
          <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8" asChild>
            <TrialButton variant="link" className="inline-flex items-center">
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </TrialButton>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutCredlocity;
