import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle2, X, FileText, Scale, Clock, Building, FileMinus, BarChart3, Shield, Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import api from '../utils/api';

const Pricing = () => {
  const navigate = useNavigate();
  const [pricingSchema, setPricingSchema] = useState(null);
  const [cmsPlans, setCmsPlans] = useState([]);
  const [pageConfig, setPageConfig] = useState(null);
  const [setupServices, setSetupServices] = useState([]);
  const [payPerDeleteOptions, setPayPerDeleteOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping for products
  const iconMap = {
    'chart': BarChart3,
    'scale': Scale,
    'file-minus': FileMinus,
    'clock': Clock,
    'building': Building,
    'file': FileText,
    'shield': Shield,
  };

  useEffect(() => {
    // Fetch pricing schema for SEO
    const fetchPricingSchema = async () => {
      try {
        const response = await api.get('/pricing/schema');
        setPricingSchema(response.data.schema);
      } catch (err) {
        console.error('Error fetching pricing schema:', err);
      }
    };
    
    // Fetch CMS pricing plans and products
    const fetchCmsPlans = async () => {
      try {
        const [plansRes, configRes, productsRes] = await Promise.all([
          api.get('/billing/public/pricing-plans'),
          api.get('/billing/public/pricing-config'),
          api.get('/billing/public/pricing-products')
        ]);
        setCmsPlans(plansRes.data || []);
        setPageConfig(configRes.data || null);
        
        // Separate products by category
        const products = productsRes.data || [];
        setSetupServices(products.filter(p => p.category === 'setup_service'));
        setPayPerDeleteOptions(products.filter(p => p.category === 'pay_per_delete'));
      } catch (err) {
        console.error('Error fetching CMS pricing:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricingSchema();
    fetchCmsPlans();
  }, []);

  // Default hardcoded plans (fallback if CMS plans are empty)
  const defaultPlans = [
    {
      name: 'Fraud Plan',
      packageKey: 'fraud',
      price: '$99.95',
      priceValue: 99.95,
      trial: '15-Day Free Trial',
      features: [
        'Identity theft & fraud removal',
        'FCRA 605B credit block',
        'All 3 credit bureaus',
        'Monthly credit monitoring',
        'Email support',
        'Educational resources',
      ],
      notIncluded: [
        'One-on-one consultations',
        'Family members',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Aggressive Plan',
      packageKey: 'aggressive',
      price: '$179.95',
      priceValue: 179.95,
      trial: '30-Day Free Trial',
      features: [
        'Everything in Fraud Plan',
        'Advanced dispute strategies',
        'Collection account removal',
        'Late payment removal',
        'Monthly one-on-one reviews',
        'Priority support',
        'Goodwill letter campaigns',
        'FDCPA violation identification',
      ],
      notIncluded: [
        'Family members',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Family Plan',
      packageKey: 'family',
      price: '$279.95',
      priceValue: 279.95,
      trial: '30-Day Free Trial',
      features: [
        'Everything in Aggressive Plan',
        'Up to 4 family members',
        'Individual credit repair for each',
        'Family financial planning',
        'Dedicated family account manager',
        'Savings vs individual plans',
      ],
      notIncluded: [],
      cta: 'Start Free Trial',
      popular: false,
    },
  ];

  // Use CMS plans if available, otherwise use defaults
  const plans = cmsPlans.length > 0 ? cmsPlans.map(p => ({
    name: p.name,
    packageKey: p.code?.toLowerCase() || p.name.toLowerCase().replace(/\s+/g, '-'),
    price: p.price,
    priceValue: p.price_value || 0,
    trial: p.trial_text || '',
    features: p.features || [],
    notIncluded: p.not_included || [],
    cta: p.cta_text || 'Get Started',
    ctaUrl: p.cta_url,
    popular: p.is_featured,
    banner: p.banner,
    highlightColor: p.highlight_color
  })) : defaultPlans;

  // Use CMS FAQs if available
  const faqItems = (pageConfig?.faqs && pageConfig.faqs.length > 0) ? pageConfig.faqs : [
    {
      question: 'Do you charge a first work fee?',
      answer: 'No! Unlike many competitors who charge $100-$150 upfront, we charge $0 in first work fees. You only pay your monthly subscription after your free trial ends.',
    },
    {
      question: 'How long is the free trial?',
      answer: 'Our Aggressive and Family plans include a 30-day free trial - the longest in the credit repair industry. Our Fraud Plan includes a 15-day free trial. No credit card required upfront.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, absolutely. You can cancel your subscription at any time with no cancellation fees or penalties. We believe in earning your business every month.',
    },
    {
      question: 'Do you offer a money-back guarantee?',
      answer: 'Yes, we offer a 100% money-back guarantee. If you\'re not satisfied with our service, we\'ll refund your money. No questions asked.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and ACH bank transfers through our secure online platform.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No. The price you see is the price you pay. No setup fees, no cancellation fees, no hidden charges. 100% transparent pricing.',
    },
    {
      question: 'How do you compare to competitors\' pricing?',
      answer: 'We offer the best value in the industry. While competitors like Lexington Law charge $89.95-$139.95/month plus setup fees, and Credit Saint charges $99+ first work fee, we charge $0 upfront and offer longer free trials.',
    },
    {
      question: 'What\'s included in the monthly fee?',
      answer: 'Your monthly fee includes comprehensive credit repair services, dispute filing with all 3 bureaus, credit monitoring, educational resources, and customer support. Higher-tier plans include one-on-one consultations.',
    },
  ];

  const handleSelectPlan = (plan) => {
    // If plan has custom URL, use it
    if (plan.ctaUrl) {
      if (plan.ctaUrl.startsWith('http')) {
        window.location.href = plan.ctaUrl;
      } else {
        navigate(plan.ctaUrl);
      }
      return;
    }
    // Default behavior - navigate to intake form with pre-selected package
    navigate(`/intake?package=${plan.packageKey}&name=${encodeURIComponent(plan.name)}&price=${plan.priceValue}`);
  };

  // Get hero content from config or use defaults
  const heroTitle = pageConfig?.hero?.title || 'Transparent Pricing, No Hidden Fees';
  const heroSubtitle = pageConfig?.hero?.subtitle || 'Choose the plan that\'s right for you. All plans include our money-back guarantee.';
  const heroHighlights = pageConfig?.hero?.highlights || ['$0 First Work Fee', '30-Day Free Trial', 'Cancel Anytime'];

  // Banner color mapping
  const bannerColors = {
    green: 'bg-green-500',
    gold: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500',
  };

  return (
    <div className="min-h-screen" data-testid="pricing-page">
      <Helmet>
        <title>Pricing - Transparent Credit Repair Plans | Credlocity</title>
        <meta name="description" content="Choose from our transparent credit repair pricing plans: Fraud Plan ($99.95), Aggressive Plan ($179.95), or Family Plan ($279.95). No hidden fees, free trials included." />
        <meta name="keywords" content="credit repair pricing, credit repair cost, credit repair plans, credit repair fees, transparent pricing" />
        
        {/* Pricing Schema */}
        {pricingSchema && (
          <script type="application/ld+json">
            {JSON.stringify(pricingSchema)}
          </script>
        )}
      </Helmet>
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6" data-testid="pricing-title">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-8">
            {heroSubtitle}
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            {heroHighlights.map((highlight, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="mx-2 hidden sm:inline">•</span>}
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">{highlight}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50" data-testid="pricing-plans">
        <div className="container mx-auto px-4">
          <div className={`grid gap-8 max-w-7xl mx-auto ${
            plans.length === 1 ? 'md:grid-cols-1 max-w-md' :
            plans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
            plans.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
            'md:grid-cols-3'
          }`}>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-4 ring-secondary-green transform md:scale-105' : ''
                } ${plan.highlightColor ? `ring-2 ring-${plan.highlightColor}-500` : ''}`}
                data-testid={`plan-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Banner/Badge - Now dynamic from CMS */}
                {plan.banner ? (
                  <div className={`${bannerColors[plan.banner.color] || 'bg-green-500'} text-white text-center py-2 font-semibold`}>
                    {plan.banner.text}
                  </div>
                ) : plan.popular ? (
                  <div className="bg-secondary-green text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                ) : null}
                <div className="p-8">
                  <h3 className="font-cinzel text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary-blue">{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {plan.trial && <p className="text-secondary-green font-semibold mb-6">{plan.trial}</p>}

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded && plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-secondary-green hover:bg-secondary-light text-white py-6"
                    onClick={() => handleSelectPlan(plan)}
                    data-testid={`cta-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Essential Setup Services Section */}
      {setupServices.length > 0 && (
        <section className="py-20 bg-white" data-testid="setup-services-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">
                {pageConfig?.sections?.setup_services?.title || 'Essential Setup Services'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {pageConfig?.sections?.setup_services?.subtitle || 'Required one-time services to begin your credit repair journey professionally and legally'}
              </p>
            </div>

            {/* Info Box */}
            <div className="max-w-4xl mx-auto mb-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {pageConfig?.sections?.setup_services?.info_box?.title || 'Why These Services Are Required'}
                  </h3>
                  <ul className="space-y-2 text-blue-800">
                    {(pageConfig?.sections?.setup_services?.info_box?.points || [
                      'Credit reports provide the legal foundation for dispute strategies',
                      'Power of Attorney enables us to negotiate directly with creditors',
                      'E-Notary prevents delays and ensures immediate case activation'
                    ]).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-blue-700 italic">
                    {pageConfig?.sections?.setup_services?.info_box?.note || "These aren't additional fees - they're essential legal requirements for professional credit repair"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {setupServices.map((service, index) => {
                const IconComponent = iconMap[service.icon] || FileText;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                    data-testid={`setup-service-${service.code.toLowerCase()}`}
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-primary-blue" />
                        </div>
                        <div>
                          <h3 className="font-cinzel text-xl font-bold text-gray-900">{service.name}</h3>
                          <span className="text-sm text-gray-500">{service.price_note}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-3xl font-bold text-primary-blue">{service.price_display}</span>
                        </div>
                        <Button
                          className="bg-secondary-green hover:bg-secondary-light text-white"
                          onClick={() => window.open(service.cta_url, '_blank')}
                          data-testid={`cta-setup-${service.code.toLowerCase()}`}
                        >
                          {service.cta_text}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pay-Per-Delete Options Section */}
      {payPerDeleteOptions.length > 0 && (
        <section className="py-20 bg-gray-50" data-testid="pay-per-delete-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">
                {pageConfig?.sections?.pay_per_delete?.title || 'Pay-Per-Delete Options'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {pageConfig?.sections?.pay_per_delete?.subtitle || 'Only pay when we successfully remove negative items from your credit report'}
              </p>
            </div>

            {/* Benefits List */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="bg-secondary-green/5 rounded-xl p-6 border border-secondary-green/20">
                <div className="grid sm:grid-cols-2 gap-4">
                  {(pageConfig?.sections?.pay_per_delete?.benefits || [
                    'No monthly fees - only pay for results',
                    'Performance-based pricing model',
                    'Same credit report and power of attorney requirements',
                    'Perfect for targeted credit repair needs'
                  ]).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {payPerDeleteOptions.map((option, index) => {
                const IconComponent = iconMap[option.icon] || FileMinus;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
                    data-testid={`ppd-option-${option.code.toLowerCase()}`}
                  >
                    <div className="bg-gradient-to-r from-primary-blue to-primary-blue/90 text-white p-4 text-center">
                      <IconComponent className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="font-cinzel text-lg font-bold">{option.name}</h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <span className="text-4xl font-bold text-primary-blue">{option.price_display}</span>
                        <p className="text-sm text-gray-500 mt-1">{option.price_note}</p>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                      
                      {option.features && option.features.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {option.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <Button
                        className="w-full bg-secondary-green hover:bg-secondary-light text-white"
                        onClick={() => window.open(option.cta_url, '_blank')}
                        data-testid={`cta-ppd-${option.code.toLowerCase()}`}
                      >
                        {option.cta_text}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 180-Day Guarantee Section */}
      {(pageConfig?.sections?.guarantee?.enabled !== false) && (
        <section className="py-16 bg-gradient-to-r from-secondary-green to-secondary-light" data-testid="guarantee-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
                {pageConfig?.sections?.guarantee?.title || '180-Day Money-Back Guarantee'}
              </h2>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed">
                {pageConfig?.sections?.guarantee?.description || "We're so confident in our service that we offer a complete money-back guarantee. If you don't see meaningful progress in your credit score within 180 days, we'll refund your money - no questions asked."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Comparison Table */}
      <section className="py-20 bg-white" data-testid="comparison-section">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-blue mb-12">
            How We Compare to Competitors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-6xl mx-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-cinzel">Feature</th>
                  <th className="py-4 px-4 bg-secondary-green/10">
                    <span className="font-cinzel font-bold text-secondary-green">Credlocity</span>
                  </th>
                  <th className="py-4 px-4 text-gray-600">Lexington Law</th>
                  <th className="py-4 px-4 text-gray-600">Creditrepair.com</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">First Work Fee</td>
                  <td className="py-4 px-4 text-center bg-secondary-green/5">
                    <span className="font-bold text-secondary-green">$0</span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">Varies</td>
                  <td className="py-4 px-4 text-center text-gray-600">$119.95</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">Free Trial</td>
                  <td className="py-4 px-4 text-center bg-secondary-green/5">
                    <span className="font-bold text-secondary-green">30 Days</span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">None</td>
                  <td className="py-4 px-4 text-center text-gray-600">None</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">BBB Complaints (3 yrs)</td>
                  <td className="py-4 px-4 text-center bg-secondary-green/5">
                    <span className="font-bold text-secondary-green">0</span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">Multiple</td>
                  <td className="py-4 px-4 text-center text-gray-600">Multiple</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">Monthly Appointments</td>
                  <td className="py-4 px-4 text-center bg-secondary-green/5">
                    <CheckCircle2 className="w-6 h-6 text-secondary-green mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">Premier+ Only</td>
                  <td className="py-4 px-4 text-center text-gray-600">Limited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold">Family Plans</td>
                  <td className="py-4 px-4 text-center bg-secondary-green/5">
                    <CheckCircle2 className="w-6 h-6 text-secondary-green mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">Limited</td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    <X className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50" data-testid="faq-section">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-blue mb-12">
            Pricing FAQs
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-lg px-6 border border-gray-200"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="font-semibold text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-primary text-white" data-testid="pricing-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start your free trial today. No credit card required. No first work fee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-secondary-green hover:bg-secondary-light text-white px-8"
              asChild
              data-testid="pricing-cta-btn"
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
              className="bg-white/10 border-white text-white hover:bg-white hover:text-primary-blue px-8"
              asChild
              data-testid="pricing-consultation-btn"
            >
              <a
                href="https://calendly.com/credlocity/oneonone"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule Consultation
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* TSR Compliance Notice */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600 text-center">
            In accordance with federal regulations, all credit repair services must be initiated through our secure online platform. No payment processing or enrollment via phone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
