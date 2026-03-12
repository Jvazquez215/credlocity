import React from 'react';
import { Helmet } from 'react-helmet-async';
import PartnerForm from '../../components/PartnerForm';
import { Building2, TrendingUp, Users, Shield } from 'lucide-react';

const MortgageProfessionals = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Mortgage Professional Partnership | Credlocity Credit Repair</title>
        <meta name="description" content="Partner with Credlocity to help borrowers qualify for better mortgage rates. RESPA compliant partnership for mortgage professionals." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Help Borrowers Qualify for Better Rates
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Partner with Credlocity to offer professional credit repair services. Help more clients qualify and close more loans.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                ✓ RESPA Compliant
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                ✓ No Commissions
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                ✓ Increase Approval Rates
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
              <div className="text-4xl font-bold text-blue-600 mb-2">78%</div>
              <div className="text-gray-600">Approval Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">120+</div>
              <div className="text-gray-600">Avg. Point Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3-6</div>
              <div className="text-gray-600">Months Timeline</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$0</div>
              <div className="text-gray-600">Partnership Cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Mortgage Professionals Partner with Us
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Building2 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Convert Declined Applications</h3>
              <p className="text-gray-600">
                Don't lose potential borrowers to credit issues. Refer them to credit repair and bring them back as qualified applicants within months.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Better Rates for Clients</h3>
              <p className="text-gray-600">
                Higher credit scores mean better interest rates. Help your clients save thousands over the life of their mortgage.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Build Long-Term Relationships</h3>
              <p className="text-gray-600">
                Provide comprehensive financial solutions. Position yourself as a trusted advisor beyond just mortgage lending.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">100% RESPA Compliant</h3>
              <p className="text-gray-600">
                Our partnership is fully compliant with RESPA regulations. No kickbacks, no commissions—just professional referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Partnership Process</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Apply to Partner</h3>
                <p className="text-gray-600">Complete the application below. We'll review and approve within 24-48 hours.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Refer Borrowers</h3>
                <p className="text-gray-600">When borrowers don't qualify due to credit issues, refer them to Credlocity with your unique link.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">We Fix Their Credit</h3>
                <p className="text-gray-600">Our experts dispute errors, remove negative items, and improve credit scores.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Close More Loans</h3>
                <p className="text-gray-600">Borrower returns with improved credit, qualifies for better rates, and you close the loan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Join Our Mortgage Partner Network</h2>
            <p className="text-xl text-gray-600">Help more borrowers qualify while staying RESPA compliant.</p>
          </div>
          <PartnerForm partnerType="mortgage" partnerTitle="Mortgage Professional" />
        </div>
      </section>
    </div>
  );
};

export default MortgageProfessionals;
