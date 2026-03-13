import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

const FCRAGuide = () => (
  <>
    <Helmet><title>FCRA Guide | Fair Credit Reporting Act | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">FCRA Guide</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">The Fair Credit Reporting Act (FCRA) is your most powerful tool for credit repair. Understand your rights.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">Your Rights Under FCRA</h2>
        {[
          { title: "Right to Accuracy (Section 611)", content: "You can dispute any information you believe is inaccurate, incomplete, or unverifiable. Credit bureaus must investigate within 30 days and remove items they cannot verify." },
          { title: "Right to Know (Section 609)", content: "You can request a copy of everything in your credit file. Bureaus must disclose all information, sources, and who has accessed your report." },
          { title: "Right to Privacy (Section 604)", content: "Only authorized parties with a permissible purpose can access your credit report. Unauthorized access is a violation." },
          { title: "7-Year Reporting Limit (Section 605)", content: "Most negative items must be removed after 7 years. Bankruptcies: 10 years. Tax liens: 7 years from payment date." },
          { title: "Identity Theft Protection (Section 605B)", content: "Fraud victims can request a credit block that removes fraudulent accounts within 4 business days." },
          { title: "Right to Sue (Section 616/617)", content: "If a credit bureau or furnisher willfully or negligently violates your FCRA rights, you can sue for damages of $100-$1,000 per violation plus attorney fees." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0 p-6 bg-gray-50 rounded-xl border">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2"><Scale className="w-5 h-5 text-primary-blue" /> {item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4">
        <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">Need Help Exercising Your Rights?</h2>
        <p className="text-gray-600 mb-6">Our FCRA-certified professionals know exactly how to use these laws to your advantage.</p>
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default FCRAGuide;
