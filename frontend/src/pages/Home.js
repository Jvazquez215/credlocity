import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle2, Shield, Users, Award, Star, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const Home = () => {
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/reviews?featured=true');
        setFeaturedReviews(response.data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-primary text-white py-20 md:py-32 overflow-hidden"
        data-testid="hero-section"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1758599670001-1253d37908ba')] bg-cover bg-center"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-cinzel text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
              CREDIT REPAIR DONE RIGHT
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              The most comprehensive credit education and repair service on the internet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8 py-6"
                asChild
                data-testid="hero-start-trial-btn"
              >
                <a 
                  href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Your Free 30-Day Trial
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-primary-blue text-lg px-8 py-6 backdrop-blur-sm"
                asChild
                data-testid="hero-consultation-btn"
              >
                <a 
                  href="https://calendly.com/credlocity/oneonone"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Free Consultation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b" data-testid="trust-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="font-semibold">5.0 Rating</p>
              <p className="text-sm text-gray-600">Yelp Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-blue mb-2">0</div>
              <p className="font-semibold">BBB Complaints</p>
              <p className="text-sm text-gray-600">Last 3 Years</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-green mb-2">30</div>
              <p className="font-semibold">Day Free Trial</p>
              <p className="text-sm text-gray-600">Longest in Industry</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-blue mb-2">$0</div>
              <p className="font-semibold">First Work Fee</p>
              <p className="text-sm text-gray-600">No Upfront Costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Credlocity */}
      <section className="py-20 bg-gray-50" data-testid="why-choose-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">
              Why Choose Credlocity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another credit repair company. We're your partner in financial freedom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg card-hover" data-testid="feature-card-ai">
              <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary-blue" />
              </div>
              <h3 className="font-cinzel text-xl font-semibold mb-4">Advanced AI Technology</h3>
              <p className="text-gray-600">
                Our proprietary AI analyzes your credit reports and creates personalized dispute strategies for maximum effectiveness.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg card-hover" data-testid="feature-card-tsr">
              <div className="w-16 h-16 bg-secondary-green/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-secondary-green" />
              </div>
              <h3 className="font-cinzel text-xl font-semibold mb-4">TSR Compliant Process</h3>
              <p className="text-gray-600">
                100% compliant with federal regulations. No phone enrollment, secure online platform only.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg card-hover" data-testid="feature-card-hispanic">
              <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary-blue" />
              </div>
              <h3 className="font-cinzel text-xl font-semibold mb-4">Hispanic-Owned Business</h3>
              <p className="text-gray-600">
                Founded by CEO Joeziel Vazquez in Philadelphia, serving diverse communities across all 50 states.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg card-hover" data-testid="feature-card-track-record">
              <div className="w-16 h-16 bg-secondary-green/10 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-secondary-green" />
              </div>
              <h3 className="font-cinzel text-xl font-semibold mb-4">Proven Track Record</h3>
              <p className="text-gray-600">
                16+ years experience, A+ BBB rating, zero complaints, and thousands of success stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 30-Day Free Trial */}
      <section className="py-20 bg-white" data-testid="trial-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-primary text-white rounded-3xl p-12">
            <h2 className="font-cinzel text-4xl font-bold mb-6 text-center">
              30-Day Free Trial
            </h2>
            <p className="text-xl mb-8 text-center">
              Experience our service risk-free with our comprehensive guarantee package
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <span>$0 due today - start immediately</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <span>180-day money-back guarantee</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <span>Cancel anytime, no long-term contracts</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <span>Free Credit Tracker app included</span>
              </div>
            </div>
            <p className="text-sm text-gray-100 mb-6 text-center">
              *You will pay for your credit report ($49.95) once you meet your assigned credit repair agent. Credit card information required but not charged for service fee for 30 days.
            </p>
            <div className="text-center">
              <Button
                size="lg"
                className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-12"
                asChild
              >
                <a
                  href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Your Free Trial
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Required Services */}
      <section className="py-20 bg-gray-50" data-testid="services-pricing-section">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-blue mb-12">
            Required Services
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="font-cinzel text-2xl font-semibold mb-4">Credit Report Analysis</h3>
              <div className="text-4xl font-bold text-primary-blue mb-4">$49.95</div>
              <p className="text-gray-600 mb-6">
                Comprehensive review of all three credit reports
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Full Experian, Equifax & TransUnion review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Identification of all negative items</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Personalized action plan</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="font-cinzel text-2xl font-semibold mb-4">Power of Attorney (E-Notary)</h3>
              <div className="text-4xl font-bold text-primary-blue mb-4">$39.95</div>
              <p className="text-gray-600 mb-6">
                Legal authorization to act on your behalf
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Electronic notarization included</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Legal authority to dispute on your behalf</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Required for bureau communications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Real Results */}
      <section className="py-20 bg-white" data-testid="testimonials-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">
              Real Results from Real Clients
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. See what our clients are saying about their credit repair journey.
            </p>
          </div>
          {loadingReviews ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading testimonials...</p>
            </div>
          ) : featuredReviews.length === 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Fallback to default testimonials if no featured reviews in database */}
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Credlocity helped me remove 12 negative items from my credit report in just 3 months. My score went from 580 to 720!"
                </p>
                <p className="font-semibold">- Maria G., Philadelphia</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "After being turned down for a mortgage, Credlocity helped me qualify within 6 months. Professional and effective!"
                </p>
                <p className="font-semibold">- James T., New York</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The 30-day free trial convinced me. Now I'm a paying customer and couldn't be happier with the results!"
                </p>
                <p className="font-semibold">- David L., Texas</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredReviews.slice(0, 3).map(review => (
                <Link 
                  to={`/success-stories/${review.story_slug}`}
                  key={review.id} 
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="flex mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  {review.client_photo_url && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={review.client_photo_url} 
                        alt={review.client_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="flex justify-center items-center gap-2 text-sm font-semibold mb-2">
                      <span className="text-red-600">{review.before_score}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600">{review.after_score}</span>
                    </div>
                    <div className="text-center text-green-600 font-bold text-lg">
                      +{review.points_improved} points!
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{review.testimonial_text}"
                  </p>
                  <p className="font-semibold">- {review.client_name}</p>
                  {review.competitor_switched_from && (
                    <p className="text-sm text-gray-500 mt-2">
                      Switched from {review.competitor_switched_from}
                    </p>
                  )}
                  {review.video_url && (
                    <div className="mt-4">
                      <iframe
                        width="100%"
                        height="200"
                        src={review.video_url}
                        frameBorder="0"
                        allowFullScreen
                        className="rounded"
                        title={`${review.client_name} testimonial`}
                      />
                    </div>
                  )}
                  
                  {/* Read Full Story Button */}
                  <div className="mt-4 text-blue-600 font-medium text-sm group-hover:text-blue-800 transition-colors">
                    Read Full Story →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Our Proven 6-Step Process */}
      <section className="py-20 bg-white" data-testid="process-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">
              Our Proven 6-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've perfected our credit repair process over 16+ years to deliver maximum results for our clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-primary-blue">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  1
                </div>
                <h3 className="font-cinzel text-xl font-semibold">Free Credit Analysis</h3>
              </div>
              <p className="text-gray-600">
                Complete credit report review to identify all negative items and opportunities for improvement.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-secondary-green">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary-green text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  2
                </div>
                <h3 className="font-cinzel text-xl font-semibold">Custom Strategy</h3>
              </div>
              <p className="text-gray-600">
                Personalized dispute strategy using advanced AI and Metro2 compliance techniques.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-primary-blue">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  3
                </div>
                <h3 className="font-cinzel text-xl font-semibold">Professional Disputes</h3>
              </div>
              <p className="text-gray-600">
                Expert dispute letters sent to credit bureaus and creditors on your behalf.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-secondary-green">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary-green text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  4
                </div>
                <h3 className="font-cinzel text-xl font-semibold">Bureau Challenges</h3>
              </div>
              <p className="text-gray-600">
                Strategic challenges to all three credit bureaus using proven legal methods.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-primary-blue">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  5
                </div>
                <h3 className="font-cinzel text-xl font-semibold">Progress Tracking</h3>
              </div>
              <p className="text-gray-600">
                Real-time updates via our Credit Tracker app showing your improving scores.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-secondary-green">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary-green text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  6
                </div>
                <h3 className="font-cinzel text-xl font-semibold">Score Optimization</h3>
              </div>
              <p className="text-gray-600">
                Ongoing optimization and credit building strategies for long-term success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gradient-primary text-white" data-testid="services-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-4xl font-bold mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Comprehensive credit repair solutions for every situation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Link to="/collection-removal" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition h-full">
                <h3 className="font-cinzel text-2xl font-semibold mb-4">Collection Removal</h3>
                <p className="text-gray-100 mb-4">
                  Expert removal of collection accounts using FDCPA violations and advanced dispute strategies.
                </p>
                <span className="text-secondary-light group-hover:underline">Learn More →</span>
              </div>
            </Link>

            <Link to="/late-payment-removal" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition h-full">
                <h3 className="font-cinzel text-2xl font-semibold mb-4">Late Payment Removal</h3>
                <p className="text-gray-100 mb-4">
                  Remove late payments through goodwill letters, FCBA disputes, and creditor negotiations.
                </p>
                <span className="text-secondary-light group-hover:underline">Learn More →</span>
              </div>
            </Link>

            <Link to="/fraud-removal" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition h-full">
                <h3 className="font-cinzel text-2xl font-semibold mb-4">Identity Theft & Fraud</h3>
                <p className="text-gray-100 mb-4">
                  Expert FCRA 605B credit block process for identity theft and fraud victims.
                </p>
                <span className="text-secondary-light group-hover:underline">Learn More →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-50" data-testid="final-cta-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-6">
            Ready to Take Control of Your Credit?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your 30-day free trial today. No credit card required. No first work fee. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8"
              asChild
              data-testid="final-cta-trial-btn"
            >
              <a 
                href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Your Free Trial
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white text-lg px-8"
              asChild
              data-testid="final-cta-consultation-btn"
            >
              <a 
                href="https://calendly.com/credlocity/oneonone"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Consultation
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
