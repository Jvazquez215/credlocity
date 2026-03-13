import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Heart, CheckCircle2 } from 'lucide-react';

const FinancialWellness = () => (
  <>
    <Helmet><title>Financial Wellness Guide | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Financial Wellness</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">A holistic approach to financial health — from credit repair to long-term wealth building.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {[
          { title: "Emergency Fund", content: "Build 3-6 months of living expenses in savings. This prevents you from relying on credit cards during emergencies, which is one of the top causes of debt." },
          { title: "Budget with Purpose", content: "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings/debt payoff. Track every dollar and adjust monthly based on your goals." },
          { title: "Automate Your Finances", content: "Set up auto-pay for all bills to avoid late payments. Automate savings transfers so you pay yourself first before spending." },
          { title: "Insurance Protection", content: "Proper insurance (health, auto, renter's/homeowner's) prevents one catastrophic event from destroying your financial progress." },
          { title: "Retirement Planning", content: "Contribute at least enough to get your employer's 401(k) match — it's free money. Even small contributions grow significantly over decades through compound interest." },
          { title: "Credit as a Tool, Not a Crutch", content: "Use credit strategically for rewards and building history, but never spend more than you can pay off each month. Your credit score is a financial asset — protect it." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-secondary-green" /> {item.title}</h3>
            <p className="text-gray-600 leading-relaxed pl-7">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4">
        <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">Start Your Credit Repair Journey</h2>
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default FinancialWellness;
