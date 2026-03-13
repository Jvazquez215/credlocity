import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { CheckCircle2, ArrowRight, Shield, Clock, FileText, Users, Zap, Phone } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { icon: FileText, title: "1. Free Credit Analysis", description: "Sign up for your free 30-day trial and our team reviews your full credit report from all three bureaus (Experian, Equifax, TransUnion). We identify every negative item that can be legally challenged." },
    { icon: Zap, title: "2. Custom Strategy", description: "Our AI-powered system creates a personalized dispute strategy targeting FCRA, FDCPA, and FCBA violations. Each dispute is tailored to the specific type of negative item on your report." },
    { icon: Shield, title: "3. Professional Disputes", description: "We send expertly crafted dispute letters to credit bureaus and creditors on your behalf. Our letters cite specific legal violations and demand verification of the reported information." },
    { icon: Clock, title: "4. Bureau Investigation", description: "Credit bureaus have 30 days to investigate each dispute under FCRA. If they cannot verify the information, they must remove it. We track every response and deadline." },
    { icon: Users, title: "5. Progress Updates", description: "Track your progress in real-time through our Credit Tracker app. See which items have been removed, your updated scores, and what's still being disputed." },
    { icon: CheckCircle2, title: "6. Ongoing Optimization", description: "We continue working through all negative items, sending follow-up disputes and escalations as needed. Most clients see significant results within 60-90 days." }
  ];

  return (
    <>
      <Helmet><title>How Credit Repair Works | Credlocity</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Our proven 6-step process has helped thousands of Americans improve their credit scores and achieve financial freedom.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 mb-12 last:mb-0">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-blue/10 rounded-2xl flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary-blue" />
              </div>
              <div>
                <h3 className="font-cinzel text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Start your free 30-day trial today. No upfront fees. No long-term contracts.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
              <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">View Plans & Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;
