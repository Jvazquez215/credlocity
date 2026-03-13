import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const CreditBuilding = () => (
  <>
    <Helmet><title>Credit Building Guide | How to Build Credit | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Credit Building</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Learn proven strategies to build strong credit from scratch or rebuild after setbacks.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-8">How to Build Credit</h2>
        {[
          { title: "Secured Credit Cards", content: "Start with a secured card that reports to all three bureaus. Make small purchases and pay the full balance each month. After 6-12 months of on-time payments, you'll build a positive payment history." },
          { title: "Become an Authorized User", content: "Ask a family member with excellent credit to add you as an authorized user. Their positive payment history can help boost your score without you needing to use the card." },
          { title: "Credit Builder Loans", content: "These specialized loans hold the borrowed amount in savings while you make payments. Once paid off, you receive the funds plus a positive payment history on your credit report." },
          { title: "Keep Utilization Below 30%", content: "Your credit utilization ratio (balance vs. limit) accounts for 30% of your score. Keeping it below 30%—ideally below 10%—signals responsible credit use." },
          { title: "Diversify Credit Types", content: "Having a mix of revolving credit (credit cards) and installment loans (auto, personal) shows lenders you can handle different types of credit responsibly." },
          { title: "Never Miss a Payment", content: "Payment history is the single biggest factor (35%) in your credit score. Set up autopay to ensure you never miss a due date." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary-green" /> {item.title}</h3>
            <p className="text-gray-600 leading-relaxed pl-7">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4"><Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
        <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
      </Button></div>
    </section>
  </>
);

export default CreditBuilding;
