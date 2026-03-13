import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

const TSRCompliance = () => (
  <>
    <Helmet><title>TSR Compliance | Telemarketing Sales Rule | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">TSR Compliance</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Understanding the Telemarketing Sales Rule and how it protects credit repair consumers.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">What is the TSR?</h2>
        <p className="text-gray-700 mb-8">The Telemarketing Sales Rule (TSR), enforced by the FTC, prohibits credit repair companies from collecting fees before services are performed when the sale is made over the phone. This is why Credlocity operates 100% online.</p>
        <h3 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">How Credlocity Complies</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { title: "100% Online Enrollment", desc: "No phone enrollment means full TSR compliance. Our secure platform handles everything." },
            { title: "No Upfront Service Fees", desc: "30-day free trial. You don't pay for service until work has been performed." },
            { title: "Transparent Process", desc: "Clear written contracts, cancellation rights, and full disclosure before you commit." },
            { title: "Secure Platform", desc: "All communications and agreements handled through our encrypted online system." }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
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

export default TSRCompliance;
