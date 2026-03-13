import React, { useState, useEffect, useRef, lazy, Suspense, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { 
  CheckCircle2, Shield, Users, Award, Star, TrendingUp, 
  Scale, FileText, AlertTriangle, Flag, UserCheck, ArrowRight,
  Phone, Mail, MapPin, ChevronDown, ChevronUp, ExternalLink,
  Zap, Target, BarChart3, BadgeCheck, TrendingDown,
  ShieldCheck, Clock, DollarSign
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useCountUp, formatNumber } from '../hooks/useCountUp';
import { useTranslation } from '../context/TranslationContext';

// Lazy load image component for performance
const LazyImage = memo(({ src, alt, className, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className} {...props}>
      {inView && (
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        />
      )}
    </div>
  );
});

const HomeNew = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const { t } = useTranslation();

  // Throttled parallax effect for better performance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = window.pageYOffset;
          // Only update parallax if visible (top 800px of page)
          if (offset < 800) {
            setParallaxOffset(offset * 0.3);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Credit Repair Services | Remove Negative Items | Credlocity</title>
        <meta 
          name="description" 
          content="Professional credit repair since 2008. Remove collections, late payments & negative items. 30-day free trial. A+ BBB rating. Serving Philadelphia & nationwide." 
        />
        <link rel="canonical" href="https://www.credlocity.com" />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="US-PA" />
        <meta name="geo.placename" content="Philadelphia" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Credit Repair Services | Remove Negative Items & Improve Your Score" />
        <meta property="og:description" content="Expert credit repair helping you remove negative items and improve your credit score. 30-day free trial, 0 BBB complaints, serving all 50 states." />
        <meta property="og:image" content="https://www.credlocity.com/og-image.jpg" />
        <meta property="og:url" content="https://www.credlocity.com" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Repair Services | Remove Negative Items" />
        <meta name="twitter:description" content="Professional credit repair since 2008. Remove collections & negative items. 30-day free trial. A+ BBB rating." />
        <meta name="twitter:image" content="https://www.credlocity.com/twitter-card.jpg" />
        
        {/* LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Credlocity",
            "description": "Professional credit repair services removing negative items from credit reports since 2008",
            "url": "https://www.credlocity.com",
            "telephone": "+1-215-123-4567",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Main Street",
              "addressLocality": "Philadelphia",
              "addressRegion": "PA",
              "postalCode": "19103",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "39.9526",
              "longitude": "-75.1652"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "500"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            }
          })}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Credlocity",
            "legalName": "Credlocity Business Group LLC",
            "url": "https://www.credlocity.com",
            "logo": "https://www.credlocity.com/logo.png",
            "foundingDate": "2008",
            "founders": [{
              "@type": "Person",
              "name": "Joeziel Vazquez"
            }]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen">

      {/* SECTION 1: HERO SECTION */}
      <section 
        className="relative bg-gradient-primary text-white py-20 md:py-32 overflow-hidden"
        data-testid="hero-section"
      >
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7937764/pexels-photo-7937764.jpeg')] bg-cover bg-center"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-cinzel text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
              {t('home.hero_title')}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-100">
              {t('home.hero_subtitle')}
            </h2>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-3xl mx-auto">
              {t('home.hero_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8 py-6 transform hover:scale-105 transition-transform duration-200"
                asChild
              >
                <a 
                  href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('home.start_free_trial')}
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-primary-blue text-lg px-8 py-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-200"
                asChild
              >
                <a 
                  href="https://calendly.com/credlocity/oneonone"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('home.book_consultation')}
                </a>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <TrustBadge delay={0}>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="font-semibold text-white">{t('home.rating')}</p>
                <p className="text-sm text-gray-200">{t('home.yelp_reviews')}</p>
              </TrustBadge>
              
              <TrustBadge delay={100}>
                <div className="text-3xl font-bold mb-2">0</div>
                <p className="font-semibold text-white">{t('home.bbb_complaints')}</p>
                <p className="text-sm text-gray-200">{t('home.last_3_years')}</p>
              </TrustBadge>
              
              <TrustBadge delay={200}>
                <div className="text-3xl font-bold mb-2">30</div>
                <p className="font-semibold text-white">{t('home.day_free_trial')}</p>
                <p className="text-sm text-gray-200">{t('home.longest_industry')}</p>
              </TrustBadge>
              
              <TrustBadge delay={300}>
                <div className="text-3xl font-bold mb-2">$0</div>
                <p className="font-semibold text-white">{t('home.first_work_fee')}</p>
                <p className="text-sm text-gray-200">{t('home.no_upfront')}</p>
              </TrustBadge>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW CREDIT REPAIR WORKS */}
      <HowCreditRepairWorks t={t} />

      {/* SECTION 3: WHY CHOOSE CREDLOCITY */}
      <WhyChooseCredlocity t={t} />

      {/* SECTION 4: ANIMATED STATISTICS */}
      <AnimatedStatistics t={t} />

      {/* SECTION 5: 30-DAY FREE TRIAL OFFER */}
      <FreeTrialSection t={t} />

      {/* SECTION 6: CREDIT ISSUES WE FIX */}
      <CreditIssuesSection t={t} />

      {/* SECTION 7: OUR PROVEN 6-STEP PROCESS */}
      <SixStepProcess t={t} />

      {/* SECTION 8: REAL RESULTS FROM REAL CLIENTS */}
      <TestimonialsSection t={t} />

      {/* SECTION 9: LOCAL SEO SECTION */}
      <LocalSEOSection t={t} />

      {/* SECTION 10: FAQ SECTION */}
      <FAQSection openFaq={openFaq} setOpenFaq={setOpenFaq} t={t} />

      {/* SECTION 11: FINAL CTA */}
      <FinalCTA t={t} />
      </div>
    </>
  );
};

// TRUST BADGE COMPONENT
const TrustBadge = ({ children, delay }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// SECTION 2: HOW CREDIT REPAIR WORKS
const HowCreditRepairWorks = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const steps = [
    {
      number: 1,
      title: t('home.step1_title'),
      content: t('home.step1_desc')
    },
    {
      number: 2,
      title: t('home.step2_title'),
      content: t('home.step2_desc'),
      bullets: [
        t('home.step2_b1'),
        t('home.step2_b2'),
        t('home.step2_b3'),
        t('home.step2_b4'),
        t('home.step2_b5'),
        t('home.step2_b6')
      ]
    },
    {
      number: 3,
      title: t('home.step3_title'),
      content: t('home.step3_desc')
    },
    {
      number: 4,
      title: t('home.step4_title'),
      content: t('home.step4_desc')
    },
    {
      number: 5,
      title: t('home.step5_title'),
      content: t('home.step5_desc')
    }
  ];

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            {t('home.how_title')}
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {t('home.how_desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} isInView={isInView} />
          ))}
        </div>

        {/* When to Consider Professional Credit Repair */}
        <div className={`mt-12 max-w-4xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-xl p-8 transition-all duration-700 delay-500 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h3 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">
            {t('home.professional_title')}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('home.professional_desc')}
          </p>
          <ul className="space-y-3 mb-6">
            {[
              t('home.pro_b1'),
              t('home.pro_b2'),
              t('home.pro_b3'),
              t('home.pro_b4'),
              t('home.pro_b5')
            ].map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <Button 
            className="bg-primary-blue hover:bg-blue-700 text-white"
            asChild
          >
            <Link to="/plans-pricing">
              {t('home.get_professional_help')} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index, isInView }) => (
  <div
    className={`bg-white rounded-xl shadow-lg p-6 border-t-4 border-primary-blue hover:shadow-xl hover:-translate-y-2 transition-all duration-700 h-full ${
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    <div className="flex flex-col h-full">
      <div className="w-14 h-14 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold text-2xl mb-4">
        {step.number}
      </div>
      <h3 className="font-cinzel text-xl font-semibold text-gray-900 mb-3">
        {step.title}
      </h3>
      <p className="text-gray-700 text-sm mb-3 flex-1">
        {step.content}
        {step.number === 1 && (
          <span> Get free copies from{' '}
            <a 
              href="https://www.annualcreditreport.com" 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="text-primary-blue hover:underline font-medium"
            >
              AnnualCreditReport.com
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
            {' '}or through Experian, Equifax, and TransUnion.
          </span>
        )}
      </p>
      {step.bullets && (
        <ul className="space-y-2 mt-auto">
          {step.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start text-gray-700 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary-blue mr-2 flex-shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

// SECTION 3: WHY CHOOSE CREDLOCITY
const WhyChooseCredlocity = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const features = [
    { icon: Zap, title: t('home.feat_ai_title'), description: t('home.feat_ai_desc'), color: "blue" },
    { icon: Shield, title: t('home.feat_tsr_title'), description: t('home.feat_tsr_desc'), color: "green" },
    { icon: Users, title: t('home.feat_hispanic_title'), description: t('home.feat_hispanic_desc'), color: "blue" },
    { icon: Award, title: t('home.feat_proven_title'), description: t('home.feat_proven_desc'), color: "green" },
    { icon: BadgeCheck, title: t('home.feat_certified_title'), description: t('home.feat_certified_desc'), color: "blue" }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            {t('home.why_title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {t('home.why_desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>

        <div className={`text-center text-sm text-gray-600 transition-all duration-700 delay-500 ${
          isInView ? 'opacity-100' : 'opacity-0'
        }`}>
          <p>
            {t('home.compare')}{' '}
            <Link to="/credlocity-vs-lexington-law" className="text-primary-blue hover:underline">Credlocity vs. Lexington Law</Link>
            {', '}
            <Link to="/credlocity-vs-credit-saint" className="text-primary-blue hover:underline">Credit Saint</Link>
            {', '}
            <Link to="/credlocity-vs-the-credit-people" className="text-primary-blue hover:underline">The Credit People</Link>
            {', and '}
            <Link to="/credlocity-vs-white-jacobs" className="text-primary-blue hover:underline">White Jacobs</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index, isInView }) => {
  const Icon = feature.icon;
  const colorClasses = {
    blue: 'bg-primary-blue/10 text-primary-blue',
    green: 'bg-secondary-green/10 text-secondary-green'
  };

  return (
    <div
      className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`w-16 h-16 ${colorClasses[feature.color]} rounded-full flex items-center justify-center mb-6`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-cinzel text-xl font-semibold mb-4">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
    </div>
  );
};

// SECTION 4: ANIMATED STATISTICS
const AnimatedStatistics = ({ t }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          console.log('Stats section in view, starting counters');
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasStarted]);
  
  const count1 = useCountUp(16, 2000, hasStarted);
  const count2 = useCountUp(79000, 2500, hasStarted);
  const count3 = useCountUp(3600000, 3000, hasStarted);

  return (
    <section className="py-20 bg-gradient-primary text-white" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <StatBox 
            count={count1} 
            label={t('home.years_exp')} 
            isInView={hasStarted}
            delay={0}
            suffix=""
          />
          <StatBox 
            count={count2} 
            label={t('home.users')} 
            isInView={hasStarted}
            delay={100}
            format="K"
          />
          <StatBox 
            count={count3} 
            label={t('home.deleted_debt')} 
            isInView={hasStarted}
            delay={200}
            format="M"
          />
        </div>
      </div>
    </section>
  );
};

const StatBox = ({ count, label, isInView, delay, format, suffix = "" }) => {
  const displayValue = format ? formatNumber(count) : count + suffix;
  
  return (
    <div
      className={`text-center transition-all duration-700 ${
        isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-5xl md:text-6xl font-bold mb-2" aria-live="polite">
        {displayValue}
      </div>
      <p className="text-xl text-gray-200">{label}</p>
    </div>
  );
};

// SECTION 5: 30-DAY FREE TRIAL OFFER
const FreeTrialSection = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto bg-gradient-primary text-white rounded-3xl p-8 md:p-12 transition-all duration-700 ${
          isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4 text-center">
            {t('home.trial_title')}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-center text-gray-100">
            {t('home.trial_desc')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              t('home.trial_b1'),
              t('home.trial_b2'),
              t('home.trial_b3'),
              t('home.trial_b4')
            ].map((benefit, i) => (
              <div key={i} className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-100 mb-6 text-center">
            {t('home.trial_disclaimer')}
          </p>

          <div className="text-center mb-8">
            <Button
              size="lg"
              className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-12 transform hover:scale-105 transition-transform"
              asChild
            >
              <a
                href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.start_trial')}
              </a>
            </Button>
          </div>

          {/* Required Services */}
          <div className="border-t border-white/20 pt-8">
            <h3 className="font-cinzel text-2xl font-bold mb-6 text-center">{t('home.required_services')}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-semibold text-xl mb-2">{t('home.credit_analysis')}</h4>
                <div className="text-3xl font-bold mb-3">$49.95</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.analysis_b1')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.analysis_b2')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.analysis_b3')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.analysis_b4')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-semibold text-xl mb-2">{t('home.poa_title')}</h4>
                <div className="text-3xl font-bold mb-3">$39.95</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.poa_b1')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.poa_b2')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('home.poa_b3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// SECTION 6: CREDIT ISSUES WE FIX
const CreditIssuesSection = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.05 });

  const creditIssues = [
    { icon: TrendingDown, title: t('home.issue_collection'), description: t('home.issue_collection_desc'), stats: ["Average: -80 points per collection", "Stay on report: 7 years", "Success rate: 73%"], link: "/collection-removal", color: "red" },
    { icon: Clock, title: t('home.issue_late'), description: t('home.issue_late_desc'), stats: ["Average: -90 points per late", "Stay on report: 7 years", "Success rate: 68%"], link: "/late-payment-removal", color: "orange" },
    { icon: FileText, title: t('home.issue_chargeoff'), description: t('home.issue_chargeoff_desc'), stats: ["Average: -110 points", "Stay on report: 7 years", "Success rate: 71%"], link: "/charge-off-removal", color: "red" },
    { icon: Scale, title: t('home.issue_bankruptcy'), description: t('home.issue_bankruptcy_desc'), stats: ["Average: -200+ points", "Stay on report: 7-10 years", "Success rate: 34%"], link: "/bankruptcy-credit-repair", color: "purple" },
    { icon: ShieldCheck, title: t('home.issue_identity'), description: t('home.issue_identity_desc'), stats: ["Affects: 15M Americans/year", "Average damage: -150 points", "Success rate: 89%"], link: "/identity-theft-credit-repair", color: "blue" },
    { icon: Target, title: t('home.issue_inquiry'), description: t('home.issue_inquiry_desc'), stats: ["Average: -5 points each", "Stay on report: 2 years", "Success rate: 62%"], link: "/hard-inquiry-removal", color: "indigo" }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            {t('home.issues_title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {t('home.issues_desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {creditIssues.map((issue, index) => (
            <CreditIssueCard key={index} issue={issue} index={index} isInView={isInView} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CreditIssueCard = ({ issue, index, isInView, t }) => {
  const Icon = issue.icon;
  const colorClasses = {
    red: 'bg-red-100 text-red-600 border-red-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200'
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`w-14 h-14 ${colorClasses[issue.color]} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-cinzel text-xl font-semibold mb-3">{issue.title}</h3>
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{issue.description}</p>
      
      <div className="space-y-2 mb-4">
        {issue.stats.map((stat, i) => (
          <div key={i} className="flex items-start text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span>{stat}</span>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full group hover:bg-primary-blue hover:text-white transition-colors"
        asChild
      >
        <Link to={issue.link}>
          {t('home.learn_more')} 
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  );
};

// SECTION 7: OUR PROVEN 6-STEP PROCESS
const SixStepProcess = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const steps = [
    { title: t('home.ps1_title'), description: t('home.ps1_desc') },
    { title: t('home.ps2_title'), description: t('home.ps2_desc') },
    { title: t('home.ps3_title'), description: t('home.ps3_desc') },
    { title: t('home.ps4_title'), description: t('home.ps4_desc') },
    { title: t('home.ps5_title'), description: t('home.ps5_desc') },
    { title: t('home.ps6_title'), description: t('home.ps6_desc') }
  ];

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            {t('home.process_title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {t('home.process_desc')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <ProcessStep key={index} step={step} index={index} isInView={isInView} isLast={index === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProcessStep = ({ step, index, isInView, isLast }) => (
  <div className="relative">
    <div
      className={`flex items-start gap-6 mb-8 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold text-xl z-10 relative">
          {index + 1}
        </div>
        {!isLast && (
          <div className="w-0.5 h-16 bg-primary-blue/30 ml-6 mt-2" />
        )}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md flex-1 hover:shadow-lg transition-shadow">
        <h3 className="font-cinzel text-xl font-semibold mb-2">{step.title}</h3>
        <p className="text-gray-600">{step.description}</p>
      </div>
    </div>
  </div>
);

// SECTION 8: REAL RESULTS FROM REAL CLIENTS
const TestimonialsSection = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const testimonials = [
    {
      name: "Sarah Johnson",
      before: 580,
      after: 730,
      improvement: "+150 points",
      quote: "Credlocity helped me file a lawsuit against Equifax and we won! My credit score improved dramatically.",
      switched: "Switched from Fake Competitor"
    },
    {
      name: "Michael Rodriguez",
      before: 550,
      after: 710,
      improvement: "+160 points",
      quote: "They sued TransUnion on my behalf and my score went from 550 to 710! Amazing results.",
      switched: ""
    },
    {
      name: "Jennifer Lee",
      before: 600,
      after: 745,
      improvement: "+145 points",
      quote: "Credlocity won my FCRA case against Experian. My credit improved dramatically!",
      switched: ""
    }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            {t('home.testimonials_title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {t('home.testimonials_desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} isInView={isInView} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial, index, isInView, t }) => (
  <div
    className={`bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${index * 150}ms` }}
  >
    <div className="flex mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      ))}
    </div>
    
    <div className="flex items-center gap-4 mb-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{testimonial.before}</div>
        <div className="text-xs text-gray-500">{t('home.before')}</div>
      </div>
      <ArrowRight className="w-6 h-6 text-gray-400" />
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{testimonial.after}</div>
        <div className="text-xs text-gray-500">{t('home.after')}</div>
      </div>
      <div className="ml-auto">
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          {testimonial.improvement}
        </div>
      </div>
    </div>

    <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
    
    <div className="flex items-center justify-between">
      <p className="font-semibold text-gray-900">— {testimonial.name}</p>
    </div>
    
    {testimonial.switched && (
      <p className="text-xs text-gray-500 mt-2">[{testimonial.switched}]</p>
    )}
    
    <Button variant="link" className="text-primary-blue p-0 h-auto mt-3" asChild>
      <Link to="/success-stories">
        {t('home.read_story')} <ArrowRight className="w-3 h-3 ml-1" />
      </Link>
    </Button>
  </div>
);

// SECTION 9: LOCAL SEO SECTION
const LocalSEOSection = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-blue-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-6 text-center">
            {t('home.local_title')}
          </h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            {t('home.local_desc')}
          </p>

          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h3 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">
              {t('home.serving_markets')}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Philadelphia, PA • New York, NY • Los Angeles, CA • Chicago, IL • Houston, TX • Phoenix, AZ • San Antonio, TX • San Diego, CA • Dallas, TX • San Jose, CA • Austin, TX • Jacksonville, FL • Fort Worth, TX • Columbus, OH • Charlotte, NC
            </p>
          </div>

          <div className="bg-gradient-primary text-white rounded-xl p-8">
            <h3 className="font-cinzel text-2xl font-bold mb-6">{t('home.get_started_online')}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">{t('home.philly_hq')}</div>
                  <div className="text-gray-100">{t('home.serving_50')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">{t('home.email_support')}</div>
                  <a href="mailto:support@credlocity.com" className="text-gray-100 hover:underline">
                    support@credlocity.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">{t('home.tsr_compliant')}</div>
                  <div className="text-gray-100">{t('home.tsr_online')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">{t('home.signup_anytime')}</div>
                  <div className="text-gray-100">{t('home.247_enrollment')}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button 
                size="lg"
                className="bg-secondary-green hover:bg-secondary-light text-white transform hover:scale-105 transition-transform"
                asChild
              >
                <a 
                  href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('home.start_trial_online')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// SECTION 10: FAQ SECTION
const FAQSection = ({ openFaq, setOpenFaq, t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const faqs = [
    { question: t('home.faq1_q'), answer: t('home.faq1_a') },
    { question: t('home.faq2_q'), answer: t('home.faq2_a') },
    { question: t('home.faq3_q'), answer: t('home.faq3_a') },
    { question: t('home.faq4_q'), answer: t('home.faq4_a') },
    { question: t('home.faq5_q'), answer: t('home.faq5_a') }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            {t('home.faq_title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {t('home.faq_desc')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              faq={faq} 
              index={index} 
              isOpen={openFaq === index}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              isInView={isInView}
            />
          ))}
        </div>

        <div className={`text-center transition-all duration-700 delay-500 ${
          isInView ? 'opacity-100' : 'opacity-0'
        }`}>
          <p className="text-gray-700 mb-4">
            {t('home.faq_more')}
          </p>
          <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white" asChild>
            <Link to="/faq">
              {t('home.view_all_faqs')} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>
    </section>
  );
};

const FAQItem = ({ faq, index, isOpen, onClick, isInView }) => (
  <div
    className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-700 ${
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    <button
      onClick={onClick}
      className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-primary-blue flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
    <div
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}
    >
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  </div>
);

// SECTION 11: FINAL CTA
const FinalCTA = ({ t }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.3 });

  return (
    <section className="py-20 bg-gradient-primary text-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
          isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta_title')}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            {t('home.cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10 py-6 transform hover:scale-105 transition-transform"
              asChild
            >
              <a 
                href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.cta_trial')}
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white hover:text-primary-blue text-lg px-10 py-6 backdrop-blur-sm transform hover:scale-105 transition-all"
              asChild
            >
              <a 
                href="https://calendly.com/credlocity/oneonone"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.cta_consult')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeNew;
