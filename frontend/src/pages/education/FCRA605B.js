import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Shield, FileText, CheckCircle2 } from 'lucide-react';

const FCRA605B = () => (
  <>
    <Helmet><title>FCRA 605B Credit Block | Identity Theft Protection | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">FCRA 605B Block</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">The fastest way to remove fraudulent accounts from your credit report. For identity theft and fraud victims.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">What is a 605B Block?</h2>
        <p className="text-gray-700 mb-8">Section 605B of the Fair Credit Reporting Act allows identity theft victims to request that credit bureaus block fraudulent information from their credit reports within 4 business days. This is significantly faster than the standard 30-day dispute process.</p>
        <h3 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">The 605B Process</h3>
        {[
          { step: "1", title: "File an Identity Theft Report", content: "Submit a report through IdentityTheft.gov (FTC) to generate an official Identity Theft Report." },
          { step: "2", title: "File a Police Report", content: "File a report with your local police department documenting the fraud." },
          { step: "3", title: "Submit the 605B Request", content: "Send your Identity Theft Report, police report, proof of identity, and a letter identifying each fraudulent account to all three credit bureaus." },
          { step: "4", title: "Bureau Must Block Within 4 Days", content: "Credit bureaus must block the reported information within 4 business days of receiving your complete submission." },
          { step: "5", title: "Notification to Furnishers", content: "The bureau notifies the creditor/furnisher that the information has been blocked due to identity theft." }
        ].map((item, i) => (
          <div key={i} className="flex gap-4 mb-6 last:mb-0">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold">{item.step}</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-gray-600">{item.content}</p>
            </div>
          </div>
        ))}
        <div className="mt-8 bg-blue-50 border-2 border-primary-blue rounded-xl p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Why Use Credlocity for 605B Claims?</h3>
          <p className="text-gray-700">Our team handles the entire 605B process for you — from filing FTC reports to drafting bureau letters. We have an 89% success rate for identity theft cases.</p>
        </div>
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4">
        <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">Identity Theft Victim?</h2>
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default FCRA605B;
