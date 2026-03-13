import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Shield, CheckCircle2, AlertTriangle, ArrowRight, FileText, Scale, Users } from 'lucide-react';

const FraudRemoval = () => {
  return (
    <>
      <Helmet><title>Fraud Removal from Credit Report | Credlocity</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Fraud Removal</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Expert removal of fraudulent accounts, unauthorized inquiries, and identity theft items from your credit report.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">How We Remove Fraud</h2>
              <p className="text-gray-700 mb-6">If you've been a victim of fraud or identity theft, we use specialized FCRA Section 605B procedures to block fraudulent accounts from your credit report. This process is faster and more effective than standard disputes.</p>
              <ul className="space-y-3">
                {["File identity theft reports with the FTC", "Submit FCRA 605B credit blocks to all three bureaus", "Challenge unauthorized hard inquiries", "Remove fraudulent collection accounts", "Dispute unauthorized account openings", "Monitor for recurring fraudulent activity"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Signs of Credit Fraud</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>- Accounts you didn't open on your credit report</li>
                  <li>- Hard inquiries from companies you never contacted</li>
                  <li>- Unexpected collection notices for debts you don't owe</li>
                  <li>- Sudden score drops without explanation</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <Shield className="w-8 h-8 text-primary-blue mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Our Success Rate</h3>
                <p className="text-gray-700 text-sm">89% success rate for identity theft and fraud removal cases. Average score improvement of 150+ points for fraud victims.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">Fraud Victim? We Can Help.</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Start your free consultation and let our experts clean up your credit report.</p>
          <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
            <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
          </Button>
        </div>
      </section>
    </>
  );
};

export default FraudRemoval;
