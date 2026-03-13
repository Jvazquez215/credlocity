import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { Shield, AlertTriangle, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';

const CreditRepairScams = () => {
  const redFlags = [
    { flag: "Demands upfront payment before any work", desc: "Under CROA, companies cannot charge before services are rendered." },
    { flag: "Guarantees specific score increases", desc: "No company can guarantee results. Legitimate companies set realistic expectations." },
    { flag: "Tells you to dispute accurate information", desc: "It's illegal to file false disputes. Only inaccurate items should be challenged." },
    { flag: "Suggests creating a 'new credit identity'", desc: "Using a CPN or fake SSN is federal fraud. Run from any company suggesting this." },
    { flag: "Refuses to explain your legal rights", desc: "CROA requires companies to inform you of your right to repair credit yourself." },
    { flag: "No physical address or proper registration", desc: "Legitimate companies are registered, bonded, and have verifiable locations." }
  ];

  return (
    <>
      <Helmet><title>Credit Repair Scam Info | How to Avoid Fraud | Credlocity</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Credit Repair Scam Info</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Learn how to identify credit repair scams and protect yourself from fraudulent companies.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">Red Flags to Watch For</h2>
          <div className="space-y-6 mb-12">
            {redFlags.map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-red-50 border border-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.flag}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">What a Legitimate Company Looks Like</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {["Registered with state attorney general", "Provides written contract before work begins", "Explains your legal rights under CROA", "Does NOT demand upfront fees", "Has verifiable BBB rating and reviews", "Complies with TSR and federal regulations"].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border-2 border-primary-blue rounded-2xl p-8 text-center">
            <Shield className="w-12 h-12 text-primary-blue mx-auto mb-4" />
            <h3 className="font-cinzel text-2xl font-bold text-gray-900 mb-3">Credlocity: Honest, Fair & Legal</h3>
            <p className="text-gray-600 mb-6">16+ years, A+ BBB rating, zero complaints, TSR compliant, no upfront service fees.</p>
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
              <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
            </Button>
          </div>
        </div>
      </section>
      <section className="py-12 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-700 mb-4">Had a bad experience with a credit repair company?</p>
          <Button variant="outline" asChild><Link to="/report-company">Report a Company <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </section>
    </>
  );
};

export default CreditRepairScams;
