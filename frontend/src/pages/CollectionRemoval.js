import React from 'react';
import { Button } from '../components/ui/button';
import { Shield, CheckCircle2, FileText, Scale } from 'lucide-react';

const CollectionRemoval = () => {
  return (
    <div className="min-h-screen" data-testid="collection-removal-page">
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6 text-center">
            Expert Collection Account Removal
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto text-center">
            Leverage FDCPA violations and advanced dispute strategies to remove collections from your credit report
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">Our Collection Removal Process</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-blue">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Comprehensive Review</h3>
                  <p className="text-gray-600">We analyze all collection accounts on your credit reports from all three bureaus.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-blue">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Identify Violations</h3>
                  <p className="text-gray-600">We look for FDCPA violations, inaccuracies, and unverifiable information.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-blue">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Strategic Disputes</h3>
                  <p className="text-gray-600">We file disputes with credit bureaus and collectors using multiple proven methods.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-blue">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Follow-Up & Monitor</h3>
                  <p className="text-gray-600">We track results and re-dispute if necessary until collections are removed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-3xl font-bold text-center text-primary-blue mb-12">Why Collections Can Be Removed</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Shield className="w-12 h-12 text-primary-blue mb-4" />
              <h3 className="font-semibold text-lg mb-2">FDCPA Violations</h3>
              <p className="text-gray-600 text-sm">Collectors often violate federal law. We identify and leverage these violations.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FileText className="w-12 h-12 text-secondary-green mb-4" />
              <h3 className="font-semibold text-lg mb-2">Inaccurate Info</h3>
              <p className="text-gray-600 text-sm">Many collections contain errors in dates, amounts, or account details.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-primary-blue mb-4" />
              <h3 className="font-semibold text-lg mb-2">Unverifiable</h3>
              <p className="text-gray-600 text-sm">Collectors can't always verify the debt when challenged properly.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Scale className="w-12 h-12 text-secondary-green mb-4" />
              <h3 className="font-semibold text-lg mb-2">Pay-for-Delete</h3>
              <p className="text-gray-600 text-sm">We negotiate removal in exchange for payment when appropriate.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">The Fair Debt Collection Practices Act (FDCPA)</h2>
          <p className="text-gray-700 mb-6">
            The FDCPA is a federal law that protects consumers from abusive debt collection practices. Credlocity's experts have extensive knowledge of this law and use it to your advantage.
          </p>
          <h3 className="font-semibold text-xl mb-4">Common FDCPA Violations We Find:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
              <span>Calling outside permitted hours (before 8am or after 9pm)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
              <span>Harassing or threatening language</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
              <span>False statements about the debt amount or consequences</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
              <span>Contacting third parties about your debt</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
              <span>Failure to provide debt validation when requested</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-4xl font-bold mb-6">
            Let Our Experts Remove Your Collections
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start your 30-day free trial and see how we can help remove collection accounts from your credit report.
          </p>
          <Button
            size="lg"
            className="bg-secondary-green hover:bg-secondary-light text-white px-8"
            asChild
          >
            <a
              href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Your Free Trial
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CollectionRemoval;