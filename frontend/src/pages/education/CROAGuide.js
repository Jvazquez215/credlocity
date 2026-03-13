import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Scale, CheckCircle2 } from 'lucide-react';

const CROAGuide = () => (
  <>
    <Helmet><title>CROA Guide | Credit Repair Organizations Act | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">CROA Guide</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">The Credit Repair Organizations Act protects consumers from fraudulent credit repair companies.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">What CROA Requires</h2>
        {[
          { title: "No Upfront Fees", content: "Credit repair companies cannot charge you before they've actually performed the services promised. This is the single biggest protection against scams." },
          { title: "Written Contract Required", content: "Before any work begins, the company must provide a written contract detailing services, timeline, total cost, and your cancellation rights." },
          { title: "3-Day Cancellation Right", content: "You have the right to cancel any credit repair contract within 3 business days of signing, with a full refund." },
          { title: "Disclosure of Your Rights", content: "Companies must inform you that you can dispute items yourself for free under FCRA. They cannot discourage you from exercising this right." },
          { title: "No False Claims", content: "Companies cannot guarantee specific results, make false claims about their services, or advise you to dispute accurate information." },
          { title: "How Credlocity Complies", content: "Credlocity follows all CROA requirements: no upfront service fees (30-day free trial), written agreements, full disclosure of your rights, and transparent pricing. We believe compliance equals trust." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0 p-6 bg-gray-50 rounded-xl border">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4">
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default CROAGuide;
