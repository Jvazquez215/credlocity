import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, DollarSign, CheckCircle2 } from 'lucide-react';

const DebtManagement = () => (
  <>
    <Helmet><title>Debt Management Guide | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Debt Management</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Strategies for managing, reducing, and eliminating debt while protecting your credit score.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {[
          { title: "Debt Snowball Method", content: "Pay off your smallest debts first while making minimum payments on larger ones. Each paid-off debt gives you momentum and frees up cash for the next one. Best for people who need quick wins for motivation." },
          { title: "Debt Avalanche Method", content: "Focus on the highest-interest debt first while paying minimums on others. Saves more money in interest over time. Best for people motivated by math and efficiency." },
          { title: "Debt Consolidation", content: "Combine multiple debts into a single loan with a lower interest rate. Simplifies payments and can reduce total interest paid. Be cautious of fees and longer repayment terms." },
          { title: "Balance Transfer Cards", content: "Transfer high-interest credit card balances to a 0% APR card. Most offer 12-21 months interest-free. Pay off the balance before the promotional period ends to avoid back-interest." },
          { title: "Negotiate with Creditors", content: "Contact creditors directly to negotiate lower interest rates, waived fees, or hardship payment plans. Many creditors prefer to work with you rather than send accounts to collections." },
          { title: "Avoid Debt Settlement Traps", content: "Debt settlement companies often charge high fees and can damage your credit further. If you need debt relief, consider a non-profit credit counseling agency approved by the NFCC." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-secondary-green" /> {item.title}</h3>
            <p className="text-gray-600 leading-relaxed pl-7">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4">
        <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">Need Help With Credit Repair Too?</h2>
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default DebtManagement;
