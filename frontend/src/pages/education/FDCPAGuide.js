import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Scale, Shield } from 'lucide-react';

const FDCPAGuide = () => (
  <>
    <Helmet><title>FDCPA Guide | Fair Debt Collection Practices Act | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">FDCPA Guide</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">The Fair Debt Collection Practices Act protects you from abusive, unfair, and deceptive debt collection practices.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">What Debt Collectors Cannot Do</h2>
        {[
          { title: "Harassment (Section 1692d)", content: "Collectors cannot use threats of violence, obscene language, publish your name on a 'bad debt' list, or call repeatedly to annoy you." },
          { title: "False Representations (Section 1692e)", content: "They cannot misrepresent the amount owed, falsely claim to be attorneys, threaten legal action they can't take, or imply you committed a crime." },
          { title: "Unfair Practices (Section 1692f)", content: "Collectors cannot collect amounts not authorized by the original agreement, deposit post-dated checks early, or threaten to seize property without legal right." },
          { title: "Calling at Improper Times", content: "Collectors can only call between 8 AM and 9 PM in your local time zone. They cannot call your workplace if told not to." },
          { title: "Your Right to Validation (Section 1692g)", content: "Within 5 days of first contact, collectors must send a written validation notice with the debt amount, creditor name, and your right to dispute within 30 days." },
          { title: "Your Right to Stop Contact", content: "Send a written cease-and-desist letter, and the collector must stop all communication except to confirm they'll stop or to notify of specific legal action." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0 p-6 bg-gray-50 rounded-xl border">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2"><Scale className="w-5 h-5 text-primary-blue" /> {item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.content}</p>
          </div>
        ))}
        <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">FDCPA Violations Can Remove Collections</h3>
          <p className="text-gray-700">If a debt collector violates the FDCPA, you may be able to have the collection removed from your credit report entirely, plus recover up to $1,000 in statutory damages per violation.</p>
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

export default FDCPAGuide;
