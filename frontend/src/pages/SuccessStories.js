import React from 'react';
import { Button } from '../components/ui/button';
import { Star, TrendingUp, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuccessStories = () => {
  const featuredStories = [
    {
      id: 1,
      initial: 'M',
      name: 'Maria G.',
      location: 'Los Angeles, CA',
      category: 'Mortgage Refinance',
      scoreBefore: 630,
      scoreAfter: 715,
      pointsIncrease: 85,
      timeframe: '90 days',
      summary: 'Saved $420/month on mortgage refinance after removing 6 inaccurate items from credit report.',
      savings: '$420/month',
      color: 'bg-blue-500',
    },
    {
      id: 2,
      initial: 'J',
      name: 'James T.',
      location: 'San Diego, CA',
      category: 'Rental Apartment Approval',
      scoreBefore: 595,
      scoreAfter: 665,
      pointsIncrease: 70,
      timeframe: '60 days',
      summary: 'Finally approved for dream apartment in North Park after 3 rejections - removed medical collection.',
      savings: null,
      color: 'bg-green-500',
    },
    {
      id: 3,
      initial: 'S',
      name: 'Sarah K.',
      location: 'San Francisco, CA',
      category: 'Identity Theft Recovery',
      scoreBefore: 485,
      scoreAfter: 695,
      pointsIncrease: 210,
      timeframe: '120 days',
      summary: 'Recovered from identity theft nightmare - removed 9 fraudulent credit card accounts.',
      savings: null,
      color: 'bg-purple-500',
    },
    {
      id: 4,
      initial: 'D',
      name: 'David R.',
      location: 'Sacramento, CA',
      category: 'First-Time Home Buyer FHA Loan',
      scoreBefore: 625,
      scoreAfter: 680,
      pointsIncrease: 55,
      timeframe: '75 days',
      summary: 'Qualified for FHA loan and bought first home - removed inaccurate late payments.',
      savings: 'FHA Approval',
      color: 'bg-orange-500',
    },
    {
      id: 5,
      initial: 'J',
      name: 'Jennifer W.',
      location: 'Houston, TX',
      category: 'Auto Loan Approval',
      scoreBefore: 580,
      scoreAfter: 670,
      pointsIncrease: 90,
      timeframe: '45 days',
      summary: 'Got approved for car loan with great rate after removing collections and duplicate accounts.',
      savings: '12% APR to 5.9% APR',
      color: 'bg-red-500',
    },
  ];

  const switchStories = [
    {
      title: 'Clients Who Switched from Lexington Law',
      subtitle: 'See why these clients chose Credlocity over Lexington Law',
      clients: [
        { initial: 'J', name: 'John S.', location: 'Atlanta, GA', before: 610, after: 695, points: 85, quote: 'Better results & transparency' },
        { initial: 'A', name: 'Amy C.', location: 'Seattle, WA', before: 595, after: 680, points: 85, quote: 'Faster service & real results' },
        { initial: 'R', name: 'Robert D.', location: 'Denver, CO', before: 620, after: 710, points: 90, quote: 'Pay-per-delete option' },
        { initial: 'L', name: 'Linda M.', location: 'Phoenix, AZ', before: 585, after: 665, points: 80, quote: 'No upfront fees' },
        { initial: 'M', name: 'Michael B.', location: 'Portland, OR', before: 605, after: 695, points: 90, quote: '180-day guarantee' },
      ],
    },
    {
      title: 'Clients Who Switched from Creditrepair.com',
      subtitle: 'Discover why they made the switch to Credlocity',
      clients: [
        { initial: 'P', name: 'Patricia W.', location: 'Boston, MA', before: 600, after: 685, points: 85, quote: 'Better customer service' },
        { initial: 'J', name: 'James A.', location: 'Detroit, MI', before: 590, after: 675, points: 85, quote: 'More transparent process' },
        { initial: 'S', name: 'Susan T.', location: 'Nashville, TN', before: 615, after: 700, points: 85, quote: 'Actually removed items' },
        { initial: 'D', name: 'David T.', location: 'Charlotte, NC', before: 605, after: 690, points: 85, quote: '30-day free trial' },
        { initial: 'K', name: 'Karen J.', location: 'Columbus, OH', before: 595, after: 680, points: 85, quote: 'Better pricing' },
      ],
    },
    {
      title: 'Clients Who Switched from The Credit People',
      subtitle: 'Read why these clients chose Credlocity instead',
      clients: [
        { initial: 'R', name: 'Richard M.', location: 'Minneapolis, MN', before: 610, after: 695, points: 85, quote: 'Faster results' },
        { initial: 'N', name: 'Nancy W.', location: 'Indianapolis, IN', before: 600, after: 685, points: 85, quote: 'Better technology' },
        { initial: 'C', name: 'Christopher H.', location: 'Kansas City, MO', before: 590, after: 675, points: 85, quote: 'More aggressive approach' },
        { initial: 'B', name: 'Barbara C.', location: 'Milwaukee, WI', before: 605, after: 690, points: 85, quote: 'Better communication' },
        { initial: 'D', name: 'Daniel L.', location: 'Louisville, KY', before: 615, after: 700, points: 85, quote: 'Cheaper pricing' },
      ],
    },
  ];

  const reviews = [
    {
      rating: 5,
      text: 'Credlocity changed my financial life! They removed 7 negative items from my credit report in just 3 months. My score went from 590 to 690. The team was professional, responsive, and transparent throughout the entire process. Highly recommend!',
      name: 'Michael Chen',
      location: 'Los Angeles, CA',
      date: 'November 2024',
    },
    {
      rating: 5,
      text: 'Best decision I ever made! I was skeptical about credit repair services, but Credlocity delivered. They removed inaccurate late payments and collections. My credit score increased 110 points in 4 months. Worth every penny!',
      name: 'Amanda Martinez',
      location: 'Miami, FL',
      date: 'October 2024',
    },
    {
      rating: 5,
      text: 'Outstanding service from start to finish. The 30-day free trial gave me confidence to continue. They kept me updated every step of the way. Removed 5 items that were dragging down my score. Finally qualified for a mortgage!',
      name: 'Robert Johnson',
      location: 'Dallas, TX',
      date: 'October 2024',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="success-stories-page">
      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6">
            Real Success Stories from Real Clients
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            See how Credlocity has helped thousands of Americans improve their credit scores, qualify for loans, save money, and achieve their financial goals.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">79K+</div>
              <p className="text-gray-600">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-green mb-2">3.6M+</div>
              <p className="text-gray-600">Items Removed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">120+</div>
              <p className="text-gray-600">Avg Points Increase</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-green mb-2">4.8/5</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">
              Featured Success Stories
            </h2>
            <p className="text-gray-600">Click any story to read the full details</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredStories.map((story) => (
              <Link
                key={story.id}
                to={`/success-story/${story.id}`}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${story.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                      {story.initial}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.location}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-secondary-green font-semibold mb-4">{story.category}</p>

                <div className="flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Before</p>
                    <p className="text-2xl font-bold text-red-500">{story.scoreBefore}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-secondary-green" />
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">After</p>
                    <p className="text-2xl font-bold text-green-600">{story.scoreAfter}</p>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <span className="inline-block bg-secondary-green/10 text-secondary-green px-4 py-2 rounded-full font-semibold">
                    +{story.pointsIncrease} points in {story.timeframe}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{story.summary}</p>

                {story.savings && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">💰 Savings: {story.savings}</p>
                  </div>
                )}

                <div className="mt-4 text-primary-blue font-semibold hover:underline">
                  Read Full Story →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Switch Stories */}
      {switchStories.map((section, sectionIdx) => (
        <section key={sectionIdx} className={sectionIdx % 2 === 0 ? 'py-20 bg-white' : 'py-20 bg-gray-50'}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600">{section.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {section.clients.map((client, idx) => (
                <Link
                  key={idx}
                  to={`/success-story/switch-${sectionIdx}-${idx}`}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-secondary-green transition"
                >
                  <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                    {client.initial}
                  </div>
                  <h3 className="font-semibold text-center mb-1">{client.name}</h3>
                  <p className="text-xs text-gray-600 text-center mb-4">{client.location}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2 text-sm">
                    <span className="text-red-500 font-semibold">{client.before}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 font-semibold">{client.after}</span>
                  </div>
                  <p className="text-center text-xs font-semibold text-secondary-green mb-3">
                    +{client.points} pts
                  </p>
                  
                  <p className="text-sm text-center italic text-gray-700 mb-3">"{client.quote}"</p>
                  
                  <p className="text-xs text-center text-primary-blue hover:underline">Read Story</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Reviews */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-3xl font-bold text-center text-primary-blue mb-12">
            What Our Clients Say
          </h2>
          <p className="text-center text-gray-600 mb-8">Real reviews from Google Business Profile (4-5 stars only)</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-sm text-gray-600">{review.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-blue hover:underline font-semibold"
            >
              View All Reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-4xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join 79,000+ Americans who've improved their credit scores with Credlocity. Start your free 30-day trial today!
          </p>
          <Button
            size="lg"
            className="bg-secondary-green hover:bg-secondary-light text-white px-12 text-lg"
            asChild
          >
            <a
              href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Free Trial
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SuccessStories;
