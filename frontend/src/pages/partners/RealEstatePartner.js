import React from 'react';
import { Helmet } from 'react-helmet-async';
import PartnerForm from '../../components/PartnerForm';
import { Home, TrendingUp, Users, Clock } from 'lucide-react';

const RealEstatePartner = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Real Estate Agent Partnership | Credlocity Credit Repair</title>
        <meta name="description" content="Partner with Credlocity to help your clients improve their credit scores. Expand your buyer pool and close more deals with professional credit repair services." />
        <meta name="keywords" content="real estate agent partnership, credit repair for realtors, buyer credit help, RESPA compliant, close more deals" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Expand Your Buyer Pool with Credit Repair
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Help more clients qualify for mortgages and close more deals. Partner with Credlocity to offer professional credit repair services.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                ✓ RESPA Compliant
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                ✓ No Commissions
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                ✓ Help Clients Qualify
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">73%</div>
              <div className="text-gray-600">Client Approval Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100+</div>
              <div className="text-gray-600">Avg. Point Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">45</div>
              <div className="text-gray-600">Days Average Timeline</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
              <div className="text-gray-600">Upfront Cost to Partner</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Real Estate Agents Choose Credlocity
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Home className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Turn "Not Yet" Into "Sold"</h3>
              <p className="text-gray-600">
                Don't lose clients due to credit issues. Refer them to professional credit repair and bring them back as qualified buyers within 3-6 months.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Increase Your Pipeline</h3>
              <p className="text-gray-600">
                Expand your pool of qualified buyers. Our credit repair services help clients reach the 620+ credit score needed for conventional loans.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Build Stronger Relationships</h3>
              <p className="text-gray-600">
                Provide additional value to your clients beyond property search. Position yourself as their trusted advisor for financial success.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Clock className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">RESPA Compliant Partnership</h3>
              <p className="text-gray-600">
                Our partnership program is fully compliant with RESPA regulations. No kickbacks or commissions—just a professional referral relationship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            How the Partnership Works
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Sign Up as a Partner</h3>
                  <p className="text-gray-600">Complete the simple application form below. We'll approve you within 24-48 hours.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Refer Your Clients</h3>
                  <p className="text-gray-600">When you have clients who need credit repair, refer them to Credlocity. We provide you with a unique referral link and materials.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">We Handle the Credit Repair</h3>
                  <p className="text-gray-600">Our team works directly with your client to dispute inaccurate items, remove collections, and improve their credit score.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Close More Deals</h3>
                  <p className="text-gray-600">Your client returns with improved credit, ready to qualify for a mortgage. You close the deal and earn your commission.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Expand Your Business?
            </h2>
            <p className="text-xl text-gray-600">
              Join hundreds of real estate professionals who partner with Credlocity.
            </p>
          </div>

          <PartnerForm partnerType="real-estate" partnerTitle="Real Estate Agent" />
        </div>
      </section>
    </div>
  );
};

export default RealEstatePartner;
