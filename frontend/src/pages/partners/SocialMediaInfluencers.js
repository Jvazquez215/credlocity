import React from 'react';
import { Helmet } from 'react-helmet-async';
import PartnerForm from '../../components/PartnerForm';
import { Users, DollarSign, TrendingUp, Repeat } from 'lucide-react';

const SocialMediaInfluencers = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Influencer Partnership | Credlocity Credit Repair</title>
        <meta name="description" content="Monetize your audience with Credlocity. Earn $75 per signup plus $20/month recurring commissions for active clients." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Monetize Your Audience with Recurring Income
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Partner with Credlocity and earn money helping your followers improve their credit. Get paid upfront plus monthly residuals.
            </p>
          </div>
        </div>
      </section>

      {/* Compensation Breakdown */}
      <section className="py-16 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Influencer Compensation</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-pink-300">
              <div className="text-center">
                <div className="text-6xl mb-4">💰</div>
                <div className="text-5xl font-bold text-pink-600 mb-2">$75</div>
                <div className="text-gray-600 font-semibold mb-4">Per Signup</div>
                <div className="text-sm text-gray-500">
                  One-time payment for each successful referral who signs up for credit repair
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-pink-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🔁</div>
                <div className="text-5xl font-bold text-pink-600 mb-2">$20<span className="text-2xl">/mo</span></div>
                <div className="text-gray-600 font-semibold mb-4">Recurring</div>
                <div className="text-sm text-gray-500">
                  Monthly residual commission as long as your referrals stay active with us
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-12 bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">💵 Earning Example</h3>
            <p className="text-lg text-gray-700 mb-2">
              Refer <strong>50 followers</strong> who sign up:
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex justify-between">
                <span>Initial signups (50 × $75):</span>
                <strong className="text-pink-600">$3,750</strong>
              </div>
              <div className="flex justify-between">
                <span>Monthly residuals (50 × $20):</span>
                <strong className="text-pink-600">$1,000/mo</strong>
              </div>
              <div className="border-t-2 border-gray-200 my-2"></div>
              <div className="flex justify-between text-xl">
                <span>Annual earnings:</span>
                <strong className="text-pink-600">$15,750</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Influencers Love This Program</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Help Your Audience</h3>
              <p className="text-gray-600">
                Share valuable financial services that genuinely help your followers improve their credit and financial health.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Repeat className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Recurring Passive Income</h3>
              <p className="text-gray-600">
                Build long-term passive income. Earn monthly commissions as long as your referrals remain active clients.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <DollarSign className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">High-Value Offer</h3>
              <p className="text-gray-600">
                Credit repair is a premium service people are actively seeking. Easy to promote with high conversion rates.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <TrendingUp className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Marketing Support</h3>
              <p className="text-gray-600">
                Get custom promo codes, branded graphics, video templates, and tracking links to maximize your conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Getting Started is Easy</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Apply to Partner</h3>
                <p className="text-gray-600">Submit your application with your social media handles. We'll review and approve within 24-48 hours.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Get Your Assets</h3>
                <p className="text-gray-600">Receive your unique tracking link, promo code, and marketing materials (graphics, videos, scripts).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Promote to Your Audience</h3>
                <p className="text-gray-600">Share Credlocity with your followers through posts, stories, videos, or dedicated content.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Earn Monthly Income</h3>
                <p className="text-gray-600">Get paid $75 per signup immediately, plus $20/month for every active client. Payments sent monthly via direct deposit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold mb-2">Social Media Influencers</h3>
              <p className="text-sm text-gray-600">Instagram, TikTok, YouTube creators</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-bold mb-2">Financial Coaches</h3>
              <p className="text-sm text-gray-600">Money experts and advisors</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-bold mb-2">Content Creators</h3>
              <p className="text-sm text-gray-600">Bloggers, podcasters, newsletter writers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Start Building Passive Income</h2>
            <p className="text-xl text-gray-600">Join our influencer network and start earning today.</p>
          </div>
          <PartnerForm partnerType="social-media-influencer" partnerTitle="Social Media Influencer" />
        </div>
      </section>
    </div>
  );
};

export default SocialMediaInfluencers;
