import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { CheckCircle2, ArrowRight, Shield, Star, Clock, DollarSign } from 'lucide-react';

const FreeTrialPage = () => {
  const benefits = [
    "$0 due today — start immediately",
    "Full credit report analysis included",
    "180-day money-back guarantee",
    "Cancel anytime, no long-term contracts",
    "Free Credit Tracker app included",
    "Dedicated credit repair specialist assigned"
  ];

  return (
    <>
      <Helmet><title>30-Day Free Trial | Credlocity Credit Repair</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-secondary-green/20 px-4 py-1 rounded-full mb-4">
            <span className="text-secondary-green font-semibold">Limited Time Offer</span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">30-Day Free Trial</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Experience professional credit repair risk-free. No service fees for 30 days.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">What's Included</h2>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
                  <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Your Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border">
              <h3 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">Required Services</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg">Credit Report Analysis</h4>
                    <span className="text-2xl font-bold text-primary-blue">$49.95</span>
                  </div>
                  <p className="text-gray-600 text-sm">Comprehensive review of all three credit reports. Due when you meet your assigned agent.</p>
                </div>
                <div className="bg-white rounded-xl p-6 border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg">Power of Attorney (E-Notary)</h4>
                    <span className="text-2xl font-bold text-primary-blue">$39.95</span>
                  </div>
                  <p className="text-gray-600 text-sm">Electronic notarization giving us legal authority to dispute on your behalf.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">*Credit card required but not charged for service fee for 30 days. After trial: $99/month.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div><div className="text-4xl font-bold text-primary-blue">16+</div><div className="text-gray-600">Years Experience</div></div>
            <div><div className="text-4xl font-bold text-primary-blue">0</div><div className="text-gray-600">BBB Complaints</div></div>
            <div><div className="text-4xl font-bold text-primary-blue">A+</div><div className="text-gray-600">BBB Rating</div></div>
          </div>
          <Button variant="outline" asChild><Link to="/success-stories">See Success Stories <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </section>
    </>
  );
};

export default FreeTrialPage;
