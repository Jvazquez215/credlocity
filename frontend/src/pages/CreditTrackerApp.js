import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { ArrowRight, Smartphone, BarChart3, Bell, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';

const CreditTrackerApp = () => {
  const features = [
    { icon: BarChart3, title: "Real-Time Score Tracking", desc: "Monitor your credit score changes as disputes are processed and negative items are removed." },
    { icon: Bell, title: "Alert Notifications", desc: "Instant alerts when your score changes, new items appear, or disputes are resolved." },
    { icon: TrendingUp, title: "Progress Dashboard", desc: "Visual charts showing your credit improvement journey over time." },
    { icon: Shield, title: "Identity Monitoring", desc: "Get notified of suspicious activity on your credit file." },
    { icon: Smartphone, title: "Mobile Access", desc: "Check your credit anytime, anywhere from your phone or tablet." },
    { icon: CheckCircle2, title: "Dispute Status", desc: "Track the status of all active disputes in one centralized dashboard." }
  ];

  return (
    <>
      <Helmet><title>Credit Tracker App | Monitor Your Credit Score | Credlocity</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Credit Tracker App</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Monitor your credit repair progress in real-time. Free for all Credlocity clients.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl border hover:shadow-lg transition-shadow">
                <f.icon className="w-10 h-10 text-primary-blue mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">Free With Your Membership</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">The Credit Tracker app is included free with every Credlocity membership. Start your 30-day free trial to get instant access.</p>
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
              <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreditTrackerApp;
