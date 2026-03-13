import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { BookOpen, ArrowRight, CheckCircle2, FileText, Scale, Shield, TrendingUp, DollarSign, Heart } from 'lucide-react';

const EducationHub = () => {
  const topics = [
    { icon: TrendingUp, title: "Credit Scores", desc: "Understand how credit scores are calculated and what factors affect them.", link: "/credit-scores" },
    { icon: FileText, title: "Credit Reports", desc: "Learn how to read and interpret your credit reports from all three bureaus.", link: "/credit-reports" },
    { icon: Shield, title: "Repair Methods", desc: "Explore proven credit repair strategies and dispute techniques.", link: "/repair-methods" },
    { icon: DollarSign, title: "Debt Management", desc: "Strategies for managing and reducing debt effectively.", link: "/debt-management" },
    { icon: CheckCircle2, title: "Credit Building", desc: "How to build and maintain strong credit from scratch.", link: "/credit-building" },
    { icon: Heart, title: "Financial Wellness", desc: "Holistic approach to financial health and long-term stability.", link: "/financial-wellness" },
    { icon: Scale, title: "FCRA Guide", desc: "Your rights under the Fair Credit Reporting Act.", link: "/fcra-guide" },
    { icon: Scale, title: "FDCPA Guide", desc: "Know your rights when dealing with debt collectors.", link: "/fdcpa-guide" },
    { icon: Scale, title: "CROA Guide", desc: "Understanding the Credit Repair Organizations Act.", link: "/croa-guide" },
    { icon: Shield, title: "TSR Compliance", desc: "Telemarketing Sales Rule and how it protects you.", link: "/tsr-compliance" },
    { icon: FileText, title: "FCRA 605B Block", desc: "Identity theft victims: Learn about the 605B credit block process.", link: "/fcra-605b-block" }
  ];

  return (
    <>
      <Helmet><title>Education Hub | Credit Repair Knowledge Center | Credlocity</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Education Hub</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Free educational resources to help you understand credit, your rights, and how to achieve financial freedom.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <Link key={i} to={topic.link} className="group p-6 bg-white border rounded-xl hover:shadow-lg hover:border-primary-blue/30 transition-all">
                <topic.icon className="w-8 h-8 text-primary-blue mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-blue transition-colors">{topic.title}</h3>
                <p className="text-gray-600 text-sm">{topic.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">Ready for Professional Help?</h2>
          <p className="text-gray-600 mb-8">Knowledge is power, but sometimes you need an expert. Start your free 30-day trial today.</p>
          <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
            <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
          </Button>
        </div>
      </section>
    </>
  );
};

export default EducationHub;
