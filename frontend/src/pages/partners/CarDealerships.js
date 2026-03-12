import React from 'react';
import { Helmet } from 'react-helmet-async';
import PartnerForm from '../../components/PartnerForm';
import { Car, DollarSign, TrendingUp, Users } from 'lucide-react';

const CarDealerships = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Car Dealership Partnership | Credlocity Credit Repair</title>
        <meta name="description" content="Partner with Credlocity and earn up to $200 per successful credit repair referral. Turn credit declines into approvals." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Turn Credit Declines Into Approvals
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Partner with Credlocity and earn referral fees while helping customers get financed. Get paid up to $200 per successful signup.
            </p>
          </div>
        </div>
      </section>

      {/* Compensation */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Tiered Referral Compensation</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-purple-200">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">$100</div>
                <div className="text-gray-600 font-semibold mb-4">Per Signup</div>
                <div className="text-sm text-gray-500">
                  <strong>Signups 1-5</strong><br/>
                  First 5 successful referrals
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-purple-400">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">$150</div>
                <div className="text-gray-600 font-semibold mb-4">Per Signup</div>
                <div className="text-sm text-gray-500">
                  <strong>Signups 6-20</strong><br/>
                  Next 15 successful referrals
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-purple-600">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">$200</div>
                <div className="text-gray-600 font-semibold mb-4">Per Signup</div>
                <div className="text-sm text-gray-500">
                  <strong>Signups 21+</strong><br/>
                  Every signup after 20
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-700 text-lg">
              <strong>Example:</strong> Refer 25 customers = $100×5 + $150×15 + $200×5 = <strong className="text-purple-600">$3,750</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Car Dealers Choose Credlocity</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Car className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Increase Your Close Rate</h3>
              <p className="text-gray-600">
                Stop losing deals to credit issues. Refer declined customers to credit repair and bring them back as approved buyers.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <DollarSign className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Earn Additional Revenue</h3>
              <p className="text-gray-600">
                Get paid for every successful referral. The more you refer, the more you earn with our tiered compensation structure.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Build Customer Loyalty</h3>
              <p className="text-gray-600">
                Help customers improve their credit and come back for better financing. Create lifetime customers.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">No Upfront Costs</h3>
              <p className="text-gray-600">
                Free to join. No monthly fees. You only get paid when we successfully sign up your referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How the Program Works</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Join the Program</h3>
                <p className="text-gray-600">Submit your application below. Get approved within 24-48 hours and receive your unique referral link.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Refer Customers</h3>
                <p className="text-gray-600">When customers are declined for financing, refer them to Credlocity using your link or our co-branded materials.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">We Repair Their Credit</h3>
                <p className="text-gray-600">Our team works with customers to improve their credit scores through professional dispute and repair services.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Get Paid & Close Sales</h3>
                <p className="text-gray-600">Earn $100-$200 per successful signup, and customers return with better credit ready to buy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Start Earning Today</h2>
            <p className="text-xl text-gray-600">Join hundreds of dealerships earning referral fees with Credlocity.</p>
          </div>
          <PartnerForm partnerType="car-dealership" partnerTitle="Car Dealership" />
        </div>
      </section>
    </div>
  );
};

export default CarDealerships;
