import React, { useState } from 'react';
import { CheckCircle2, X as XIcon, Shield, Info, FileText, Scale, Clock, Building, FileMinus, BarChart3, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const iconMap = {
  'chart': BarChart3, 'scale': Scale, 'file-minus': FileMinus,
  'clock': Clock, 'building': Building, 'file': FileText, 'shield': Shield,
};

const bannerColors = {
  green: 'bg-green-500', gold: 'bg-yellow-500', blue: 'bg-blue-500',
  purple: 'bg-purple-500', red: 'bg-red-500', orange: 'bg-orange-500',
  pink: 'bg-pink-500', teal: 'bg-teal-500',
};

const PricingPreview = ({ plans: rawPlans, products: rawProducts, config, onClose }) => {
  // Default FAQ items (same as public Pricing page)
  const defaultFaqs = [
    { question: 'Do you charge a first work fee?', answer: 'No! Unlike many competitors who charge $100-$150 upfront, we charge $0 in first work fees. You only pay your monthly subscription after your free trial ends.' },
    { question: 'How long is the free trial?', answer: 'Our Aggressive and Family plans include a 30-day free trial - the longest in the credit repair industry. Our Fraud Plan includes a 15-day free trial. No credit card required upfront.' },
    { question: 'Can I cancel anytime?', answer: 'Yes, absolutely. You can cancel your subscription at any time with no cancellation fees or penalties. We believe in earning your business every month.' },
    { question: 'Do you offer a money-back guarantee?', answer: "Yes, we offer a 100% money-back guarantee. If you're not satisfied with our service, we'll refund your money. No questions asked." },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, and ACH bank transfers through our secure online platform.' },
    { question: 'Are there any hidden fees?', answer: 'No. The price you see is the price you pay. No setup fees, no cancellation fees, no hidden charges. 100% transparent pricing.' },
    { question: "How do you compare to competitors' pricing?", answer: "We offer the best value in the industry. While competitors like Lexington Law charge $89.95-$139.95/month plus setup fees, and Credit Saint charges $99+ first work fee, we charge $0 upfront and offer longer free trials." },
    { question: "What's included in the monthly fee?", answer: 'Your monthly fee includes comprehensive credit repair services, dispute filing with all 3 bureaus, credit monitoring, educational resources, and customer support. Higher-tier plans include one-on-one consultations.' },
  ];
  const faqItems = (config?.faqs && config.faqs.length > 0) ? config.faqs : defaultFaqs;

  // Filter to only visible, active items — exactly as the public API does
  const visiblePlans = (rawPlans || [])
    .filter(p => p.status === 'active' && p.show_on_website)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map(p => {
      const ws = p.website_settings || {};
      return {
        name: ws.display_name || p.name,
        price: ws.price_display || `$${p.monthly_fee}`,
        trial: ws.trial_text || '',
        features: ws.features_included || p.features || [],
        notIncluded: ws.features_not_included || [],
        cta: ws.cta_text || 'Get Started',
        popular: p.is_featured,
        banner: ws.banner,
        highlightColor: ws.highlight_color,
      };
    });

  const setupServices = (rawProducts || []).filter(p => p.category === 'setup_service' && p.status === 'active' && p.show_on_website)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const payPerDeleteOptions = (rawProducts || []).filter(p => p.category === 'pay_per_delete' && p.status === 'active' && p.show_on_website)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const heroTitle = config?.hero?.title || 'Transparent Pricing, No Hidden Fees';
  const heroSubtitle = config?.hero?.subtitle || 'Choose the plan that\'s right for you. All plans include our money-back guarantee.';
  const heroHighlights = config?.hero?.highlights || ['$0 First Work Fee', '30-Day Free Trial', 'Cancel Anytime'];

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto" data-testid="pricing-preview-overlay">
      {/* Floating toolbar */}
      <div className="sticky top-0 z-[70] bg-slate-900 text-white flex items-center justify-between px-6 py-2.5 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
            Preview
          </span>
          <span className="text-sm text-slate-300">This is how visitors will see your pricing page</span>
        </div>
        <button onClick={onClose} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors" data-testid="close-preview-btn">
          <XIcon className="w-4 h-4" /> Close Preview
        </button>
      </div>

      {/* ═══ Hero ═══ */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6">{heroTitle}</h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-8">{heroSubtitle}</p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            {heroHighlights.map((h, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="mx-2 hidden sm:inline">&#8226;</span>}
                <span className="flex items-center gap-1"><CheckCircle2 className="w-5 h-5" /><span className="font-semibold">{h}</span></span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Plan Cards ═══ */}
      {visiblePlans.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`grid gap-8 max-w-7xl mx-auto ${
              visiblePlans.length === 1 ? 'md:grid-cols-1 max-w-md' :
              visiblePlans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
              visiblePlans.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'
            }`}>
              {visiblePlans.map((plan, i) => (
                <div key={i} className={`bg-white rounded-2xl shadow-xl overflow-hidden ${plan.popular ? 'ring-4 ring-secondary-green transform md:scale-105' : ''}`}>
                  {plan.banner ? (
                    <div className={`${bannerColors[plan.banner.color] || 'bg-green-500'} text-white text-center py-2 font-semibold`}>{plan.banner.text}</div>
                  ) : plan.popular ? (
                    <div className="bg-secondary-green text-white text-center py-2 font-semibold">Most Popular</div>
                  ) : null}
                  <div className="p-8">
                    <h3 className="font-cinzel text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-primary-blue">{plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    {plan.trial && <p className="text-secondary-green font-semibold mb-6">{plan.trial}</p>}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary-green mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">{f}</span></li>
                      ))}
                      {plan.notIncluded.map((f, fi) => (
                        <li key={fi} className="flex items-start"><XIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-400">{f}</span></li>
                      ))}
                    </ul>
                    <Button className="w-full bg-secondary-green hover:bg-secondary-light text-white py-6">{plan.cta}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {visiblePlans.length === 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p className="text-lg">No plans are set to &quot;Show on Website&quot;. Toggle visibility in the Plans tab.</p>
          </div>
        </section>
      )}

      {/* ═══ Setup Services ═══ */}
      {config?.sections?.setup_services?.enabled !== false && setupServices.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">{config?.sections?.setup_services?.title || 'Essential Setup Services'}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{config?.sections?.setup_services?.subtitle || 'Required one-time services to begin your credit repair journey professionally and legally'}</p>
            </div>
            <div className="max-w-4xl mx-auto mb-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">{config?.sections?.setup_services?.info_box?.title || 'Why These Services Are Required'}</h3>
                  <ul className="space-y-2 text-blue-800">
                    {(config?.sections?.setup_services?.info_box?.points || [
                      'Credit reports provide the legal foundation for dispute strategies',
                      'Power of Attorney enables us to negotiate directly with creditors',
                      'E-Notary prevents delays and ensures immediate case activation'
                    ]).map((pt, pi) => (
                      <li key={pi} className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><span>{pt}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {setupServices.map((svc, si) => {
                const Ic = iconMap[svc.icon] || FileText;
                return (
                  <div key={si} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-primary-blue/10 rounded-xl flex items-center justify-center"><Ic className="w-7 h-7 text-primary-blue" /></div>
                        <div><h3 className="font-cinzel text-xl font-bold text-gray-900">{svc.name}</h3><span className="text-sm text-gray-500">{svc.price_note}</span></div>
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">{svc.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary-blue">{svc.price_display}</span>
                        <Button className="bg-secondary-green hover:bg-secondary-light text-white">{svc.cta_text}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Pay-Per-Delete ═══ */}
      {config?.sections?.pay_per_delete?.enabled !== false && payPerDeleteOptions.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-4xl font-bold text-primary-blue mb-4">{config?.sections?.pay_per_delete?.title || 'Pay-Per-Delete Options'}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{config?.sections?.pay_per_delete?.subtitle || 'Only pay when we successfully remove negative items from your credit report'}</p>
            </div>
            <div className="max-w-3xl mx-auto mb-12">
              <div className="bg-secondary-green/5 rounded-xl p-6 border border-secondary-green/20">
                <div className="grid sm:grid-cols-2 gap-4">
                  {(config?.sections?.pay_per_delete?.benefits || [
                    'No monthly fees - only pay for results', 'Performance-based pricing model',
                    'Same credit report and power of attorney requirements', 'Perfect for targeted credit repair needs'
                  ]).map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0" /><span className="text-gray-700">{b}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {payPerDeleteOptions.map((opt, oi) => {
                const Ic = iconMap[opt.icon] || FileMinus;
                return (
                  <div key={oi} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-primary-blue to-primary-blue/90 text-white p-4 text-center">
                      <Ic className="w-8 h-8 mx-auto mb-2" /><h3 className="font-cinzel text-lg font-bold">{opt.name}</h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <span className="text-4xl font-bold text-primary-blue">{opt.price_display}</span>
                        <p className="text-sm text-gray-500 mt-1">{opt.price_note}</p>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{opt.description}</p>
                      {opt.features?.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {opt.features.map((f, fi) => (
                            <li key={fi} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0" /><span className="text-gray-700">{f}</span></li>
                          ))}
                        </ul>
                      )}
                      <Button className="w-full bg-secondary-green hover:bg-secondary-light text-white">{opt.cta_text}</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Comparison Table ═══ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-blue mb-12">How We Compare to Competitors</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-6xl mx-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-cinzel">Feature</th>
                  <th className="py-4 px-4 bg-secondary-green/10"><span className="font-cinzel font-bold text-secondary-green">Credlocity</span></th>
                  <th className="py-4 px-4 text-gray-600">Lexington Law</th>
                  <th className="py-4 px-4 text-gray-600">Creditrepair.com</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'First Work Fee', us: '$0', a: 'Varies', b: '$119.95' },
                  { f: 'Free Trial', us: '30 Days', a: 'None', b: 'None' },
                  { f: 'BBB Complaints (3 yrs)', us: '0', a: 'Multiple', b: 'Multiple' },
                  { f: 'Monthly Appointments', us: true, a: 'Premier+ Only', b: 'Limited' },
                  { f: 'Family Plans', us: true, a: 'Limited', b: false },
                ].map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-semibold">{row.f}</td>
                    <td className="py-4 px-4 text-center bg-secondary-green/5">
                      {typeof row.us === 'boolean' ? (row.us ? <CheckCircle2 className="w-6 h-6 text-secondary-green mx-auto" /> : <XIcon className="w-6 h-6 text-gray-400 mx-auto" />) : <span className="font-bold text-secondary-green">{row.us}</span>}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{typeof row.a === 'boolean' ? (row.a ? <CheckCircle2 className="w-6 h-6 text-secondary-green mx-auto" /> : <XIcon className="w-6 h-6 text-gray-400 mx-auto" />) : row.a}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{typeof row.b === 'boolean' ? (row.b ? <CheckCircle2 className="w-6 h-6 text-secondary-green mx-auto" /> : <XIcon className="w-6 h-6 text-gray-400 mx-auto" />) : row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ FAQ Section ═══ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-blue mb-12">Pricing FAQs</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <FAQPreviewItem key={index} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Guarantee ═══ */}
      {config?.sections?.guarantee?.enabled !== false && (
        <section className="py-16 bg-gradient-to-r from-secondary-green to-secondary-light">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">{config?.sections?.guarantee?.title || '180-Day Money-Back Guarantee'}</h2>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed">{config?.sections?.guarantee?.description || "We're so confident in our service that we offer a complete money-back guarantee."}</p>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Compliance ═══ */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600 text-center">{config?.compliance_notice || 'In accordance with federal regulations, all credit repair services must be initiated through our secure online platform.'}</p>
        </div>
      </div>
    </div>
  );
};

const FAQPreviewItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg px-6 border border-gray-200">
      <button onClick={() => setOpen(!open)} className="w-full py-4 flex items-center justify-between text-left">
        <span className="font-semibold text-gray-900">{item.question}</span>
        <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="pb-4 text-gray-600 text-sm leading-relaxed border-t pt-3">{item.answer}</div>}
    </div>
  );
};

export default PricingPreview;
