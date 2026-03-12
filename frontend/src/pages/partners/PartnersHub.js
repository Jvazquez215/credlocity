import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Building2, Home, Car, Users, Scale } from 'lucide-react';

const PartnersHub = () => {
  const partnerTypes = [
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "Mortgage Professionals",
      description: "Help your clients build better credit to qualify for better mortgage rates and close more deals.",
      link: "/become-a-partner/mortgage-professionals",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Home className="w-12 h-12" />,
      title: "Real Estate Agents",
      description: "Empower your clients with credit repair to expand your buyer pool and increase sales.",
      link: "/become-a-partner/real-estate",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Car className="w-12 h-12" />,
      title: "Car Dealerships",
      description: "Turn credit declines into approvals. Earn up to $200 per successful referral.",
      link: "/become-a-partner/car-dealerships",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Social Media Influencers",
      description: "Monetize your audience with recurring commissions. $75 per signup + $20/month residual.",
      link: "/become-a-partner/social-media-influencers",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <Scale className="w-12 h-12" />,
      title: "Attorneys",
      description: "Access pre-qualified consumer protection cases. FDCPA, FCRA, TCPA violations with documented evidence.",
      link: "/become-a-partner/attorneys",
      color: "from-slate-700 to-slate-800"
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Partner with Credlocity | Credit Repair Referral Program</title>
        <meta name="description" content="Join Credlocity's partner program. Earn referral fees and help your clients improve their credit. Programs for mortgage professionals, real estate agents, car dealerships, and influencers." />
        <meta name="keywords" content="credit repair partner program, referral program, mortgage professional partnership, real estate agent partnership, car dealership partnership, influencer program" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Partner with Credlocity
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8 opacity-90">
            Join America's trusted credit repair partner network. Help your clients while growing your business.
          </p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">10,000+</div>
              <div className="text-sm opacity-80">Clients Helped</div>
            </div>
            <div className="w-px bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-sm opacity-80">Active Partners</div>
            </div>
            <div className="w-px bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-4xl font-bold">4.9★</div>
              <div className="text-sm opacity-80">Partner Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Partner Program
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the program that fits your business. Each is tailored to your industry's unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map((partner, index) => (
              <Link
                key={index}
                to={partner.link}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${partner.color} p-8 text-white`}>
                  <div className="flex items-center gap-4 mb-4">
                    {partner.icon}
                    <h3 className="text-2xl font-bold">{partner.title}</h3>
                  </div>
                  <p className="text-white opacity-90">{partner.description}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold group-hover:underline">
                      Learn More & Apply →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Partner with Credlocity?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Proven Results</h3>
              <p className="text-gray-600">Average 100+ point credit score increase for our clients</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Onboarding</h3>
              <p className="text-gray-600">Get approved and start referring within 24-48 hours</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Compensation</h3>
              <p className="text-gray-600">Industry-leading referral fees and recurring commissions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Choose your partner program above and complete the simple application.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PartnersHub;
