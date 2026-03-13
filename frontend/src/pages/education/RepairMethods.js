import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

const RepairMethods = () => (
  <>
    <Helmet><title>Credit Repair Methods | Proven Strategies | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Credit Repair Methods</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Proven dispute strategies and legal methods used by professionals to remove negative items from your credit report.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {[
          { title: "FCRA Dispute Letters", content: "The most common method. Under the Fair Credit Reporting Act, you can dispute any inaccurate, incomplete, or unverifiable information. Bureaus must investigate within 30 days." },
          { title: "FDCPA Violation Challenges", content: "If a debt collector violated the Fair Debt Collection Practices Act, the entire account may be removable. Common violations include harassment, misrepresentation, and improper validation." },
          { title: "Metro2 Compliance Challenges", content: "Credit data must be reported in Metro2 format. Technical errors in how data is formatted can be grounds for removal. This advanced strategy is typically used by professionals." },
          { title: "Goodwill Letters", content: "For legitimate late payments, a goodwill letter asks the creditor to remove the negative mark as a courtesy. Best for one-time lates with otherwise perfect history." },
          { title: "Pay-for-Delete Negotiations", content: "Negotiate with collection agencies to remove the account from your report in exchange for payment. Must be agreed upon in writing before payment." },
          { title: "Debt Validation Requests", content: "Within 30 days of initial contact, you can demand a collector validate the debt. If they can't provide proper documentation, they must stop collection and remove the reporting." },
          { title: "FCRA 605B Identity Theft Block", content: "For fraud victims, this specialized process blocks fraudulent accounts within 4 business days. Requires an FTC identity theft report and police report." },
          { title: "FCBA Billing Disputes", content: "The Fair Credit Billing Act protects against billing errors on credit cards. Disputed charges must be investigated and potentially reversed." }
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
        <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">Let Professionals Handle Your Disputes</h2>
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default RepairMethods;
