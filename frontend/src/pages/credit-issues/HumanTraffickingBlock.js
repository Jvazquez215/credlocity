import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Shield, CheckCircle2, ArrowRight, Heart, AlertTriangle } from 'lucide-react';

const HumanTraffickingBlock = () => {
  return (
    <>
      <Helmet><title>Human Trafficking Credit Block | Credlocity</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Human Trafficking Credit Block</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Specialized credit repair services for survivors of human trafficking. We help restore your financial identity and rebuild your credit.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4">
              <Heart className="w-10 h-10 text-purple-600 flex-shrink-0" />
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-gray-900 mb-3">You Are Not Alone</h2>
                <p className="text-gray-700">Under the Fair Credit Reporting Act (FCRA) and the Trafficking Victims Protection Act, survivors of human trafficking have the legal right to block fraudulent debts and accounts that were opened using their identity. Credlocity provides these services with compassion and complete confidentiality.</p>
              </div>
            </div>
          </div>
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">How We Help Survivors</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              { title: "Credit Block Filing", desc: "We file credit blocks under FCRA Section 605A with all three credit bureaus to freeze and remove fraudulent accounts." },
              { title: "Debt Discharge", desc: "Challenge and remove debts that were incurred through trafficking, including loans, credit cards, and utility accounts." },
              { title: "Identity Restoration", desc: "Help rebuild your financial identity with clean credit reports and new account monitoring." },
              { title: "Ongoing Protection", desc: "Set up fraud alerts and credit monitoring to prevent future unauthorized use of your identity." }
            ].map((item, i) => (
              <div key={i} className="bg-white border rounded-xl p-6">
                <CheckCircle2 className="w-6 h-6 text-secondary-green mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mb-2" />
            <p className="text-gray-700 text-sm"><strong>Confidential:</strong> All cases are handled with the highest level of privacy. Your information is never shared.</p>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">Get Help Today</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Our team provides compassionate, confidential support. Contact us to begin restoring your credit.</p>
          <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
            <a href="mailto:support@credlocity.com">Contact Us Confidentially <ArrowRight className="w-4 h-4 ml-2" /></a>
          </Button>
        </div>
      </section>
    </>
  );
};

export default HumanTraffickingBlock;
