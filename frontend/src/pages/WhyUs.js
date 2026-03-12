import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, TrendingUp, Award, Users, Shield, Clock, Target, Heart } from 'lucide-react';
import axios from 'axios';
const WhyUs = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authors?status=active`);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const stats = [
    { number: '10,000+', label: 'Negative Items Removed', sublabel: '2021-2023' },
    { number: '0', label: 'Negative Reviews', sublabel: 'Since 2008' },
    { number: '79,000+', label: 'Satisfied Clients', sublabel: 'And Counting' },
    { number: '16+', label: 'Years Experience', sublabel: 'Industry Leading' }
  ];

  const features = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: '30-Day Free Credit Repair Trial',
      description: 'Experience our professional services risk-free with complete credit analysis and dispute initiation.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: '100% Money-Back Guarantee',
      description: '180-day guarantee with full refund if no credit improvements within 6 months.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Personalized Credit Solutions',
      description: 'Custom-crafted dispute letters and individual credit improvement strategies.'
    },
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: 'Family-Owned Excellence',
      description: 'Direct accountability, personal investment in success, and ethical practices.'
    }
  ];

  const reasons = [
    {
      title: 'Proven Results',
      description: 'With over 16 years of experience in the credit repair industry, we have established ourselves as the go-to solution for individuals and businesses seeking exceptional results. Our expert team of credit specialists has helped thousands rebuild their credit scores.'
    },
    {
      title: 'Advanced Techniques',
      description: 'Unlike other credit repair companies, Credlocity doesn\'t rely on outdated methods. We use factual disputing with Metro2 Compliance, case law for specific situations, and citation of regulations from the CFPB and FTC. This strategic method ensures every dispute is backed by solid evidence.'
    },
    {
      title: 'Cutting-Edge Technology',
      description: 'We leverage AI technology, including ChatGPT and AutoGPT, to streamline the dispute process. With our cutting-edge technology, your credit repair journey will be handled with unparalleled speed and accuracy.'
    },
    {
      title: 'Diverse and Inclusive',
      description: 'As a minority-owned and LGBTQ operated business, we understand the importance of treating each client\'s situation with respect and understanding. We provide personalized solutions that cater to your specific needs.'
    },
    {
      title: 'Unmatched Customer Support',
      description: 'Your satisfaction is our top priority. We offer a 30-day free trial and a money-back guarantee. Our knowledgeable and friendly customer support team is always available to answer your questions throughout your credit repair journey.'
    },
    {
      title: 'Unblemished Reputation',
      description: 'We have zero negative online reviews and complaints with the Better Business Bureau (BBB). This reflects our unwavering commitment to delivering exceptional service and customer satisfaction.'
    },
    {
      title: 'Customer Centric and Focused',
      description: 'We prioritize your needs and goals above all else. Our team is dedicated to understanding your unique credit challenges and crafting personalized solutions to address them effectively. Experience the difference of working with a truly customer-centric credit repair company.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Why Choose Credlocity - America's Most Trusted Credit Repair Company</title>
        <meta name="description" content="Discover why Credlocity is America's leading ethical credit repair company. 10,000+ negative items removed, 0 negative reviews since 2008, and 16+ years of proven results." />
        <meta property="og:title" content="Why Choose Credlocity - Ethical Credit Repair Since 2008" />
        <meta property="og:description" content="Family-owned credit repair excellence with 30-day free trial, 180-day money-back guarantee, and personalized credit solutions." />
        <meta name="keywords" content="credit repair, ethical credit repair, credit restoration, fix credit score, credit repair company, Philadelphia credit repair" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Credlocity: Transforming Lives Through Ethical Credit Repair
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Welcome to Credlocity, America's trusted credit repair company founded by credit restoration expert <Link to="/team/joeziel-joey-vazquez-davila" className="underline hover:text-blue-200">Joeziel Joey Vazquez</Link>. Our mission focuses on ethical credit repair solutions, helping thousands of individuals and families restore their credit scores and regain financial freedom.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/pricing" 
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-lg"
              >
                Start Your Free Trial
              </Link>
              <Link 
                to="/team" 
                className="px-8 py-4 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-900 transition text-lg border-2 border-white"
              >
                Meet Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
              From Credit Challenges to Credit Excellence
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                <Link to="/team/joeziel-joey-vazquez-davila" className="text-blue-600 hover:underline font-semibold">Joeziel's journey</Link> from facing credit challenges to becoming a leading credit repair specialist demonstrates the power of determination. After an unsuccessful experience with traditional <Link to="/blog" className="text-blue-600 hover:underline">credit repair services</Link>, he mastered the credit restoration process himself, transforming his own credit score and inspiring him to help others achieve similar success.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">From challenged credit to 740+ scores across all bureaus</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Founded Credlocity in 2008</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Turned personal success into helping thousands of families</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  to="/team/joeziel-joey-vazquez-davila" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg"
                >
                  <Users className="w-6 h-6" />
                  Meet Our Founder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Revolutionized Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            How Credlocity Revolutionized Ethical Credit Repair in America
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Credlocity has emerged as America's leading <Link to="/credit-scores" className="text-blue-600 hover:underline">ethical credit repair company</Link> through our innovative approach and unwavering commitment to client success. As a family-owned credit repair service, we've transformed the industry by prioritizing transparency, results, and customer satisfaction above all else.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk-Free Experience Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Experience Risk-Free Credit Repair
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Unlike traditional credit repair companies that demand upfront fees, Credlocity leads the industry with our innovative free trial program
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
            <div className="bg-blue-700 rounded-lg p-6">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
              <p>30 days of professional credit repair services at no cost</p>
            </div>
            <div className="bg-blue-700 rounded-lg p-6">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
              <p>Complete credit analysis and dispute initiation</p>
            </div>
            <div className="bg-blue-700 rounded-lg p-6">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
              <p>Access to our credit monitoring app</p>
            </div>
            <div className="bg-blue-700 rounded-lg p-6">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
              <p>Personal credit coaching session</p>
            </div>
          </div>

          <Link 
            to="/pricing" 
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-xl"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Why Choose Us - Detailed Reasons */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            The Best Credit Repair Company in the Industry
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Welcome to Credlocity, the premier credit repair company born in Philadelphia. Discover what makes us the industry leader.
          </p>

          <div className="max-w-5xl mx-auto space-y-8">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">{reason.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Meet Our Leadership Team
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Behind every successful <Link to="/success-stories" className="text-blue-600 hover:underline">credit repair journey</Link> at Credlocity stands a dedicated team of credit restoration experts and industry veterans. Our leadership team combines extensive experience in credit repair, consumer finance, and technology to deliver exceptional results for our clients.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-10">
            {teamMembers.slice(0, 6).map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
                {member.photo_url ? (
                  <img 
                    src={member.photo_url} 
                    alt={member.full_name} 
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-300 flex items-center justify-center text-4xl text-gray-600 font-bold border-4 border-blue-100">
                    {member.full_name.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.full_name}</h3>
                <p className="text-blue-600 font-semibold mb-2">{member.title}</p>
                {member.specialization && (
                  <p className="text-sm text-gray-600 mb-4">{member.specialization}</p>
                )}
                <Link 
                  to={`/team/${member.slug}`} 
                  className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Meet {member.full_name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/team" 
              className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-xl"
            >
              <Users className="w-6 h-6" />
              Meet Our Complete Team
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your Path to Credit Success Starts Here
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Choose Credlocity as your trusted <Link to="/blog" className="underline hover:text-blue-200">credit repair partner</Link>. Experience our proven credit repair process, innovative credit monitoring technology, and dedicated support team. Start your credit restoration journey with our risk-free trial today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/pricing" 
              className="px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-xl"
            >
              Get Started - Free Trial
            </Link>
            <Link 
              to="/report-company" 
              className="px-10 py-4 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-900 transition text-xl border-2 border-white"
            >
              Schedule Consultation
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>180-day guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Expert analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Personal coaching</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyUs;
