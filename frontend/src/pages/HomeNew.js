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
              CREDIT REPAIR DONE RIGHT
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-100">
              Remove Negative Items, Collections & Late Payments From Your Credit Report
            </h2>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Professional credit repair services helping you improve your credit score and achieve financial freedom. Serving clients nationwide since 2008.
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
                  Start Your Free 30-Day Trial
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
                  Book Free Consultation
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
                <p className="font-semibold text-white">5.0 Rating</p>
                <p className="text-sm text-gray-200">Yelp Reviews</p>
              </TrustBadge>
              
              <TrustBadge delay={100}>
                <div className="text-3xl font-bold mb-2">0</div>
                <p className="font-semibold text-white">BBB Complaints</p>
                <p className="text-sm text-gray-200">Last 3 Years</p>
              </TrustBadge>
              
              <TrustBadge delay={200}>
                <div className="text-3xl font-bold mb-2">30</div>
                <p className="font-semibold text-white">Day Free Trial</p>
                <p className="text-sm text-gray-200">Longest in Industry</p>
              </TrustBadge>
              
              <TrustBadge delay={300}>
                <div className="text-3xl font-bold mb-2">$0</div>
                <p className="font-semibold text-white">First Work Fee</p>
                <p className="text-sm text-gray-200">No Upfront Costs</p>
              </TrustBadge>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW CREDIT REPAIR WORKS */}
      <HowCreditRepairWorks />

      {/* SECTION 3: WHY CHOOSE CREDLOCITY */}
      <WhyChooseCredlocity />

      {/* SECTION 4: ANIMATED STATISTICS */}
      <AnimatedStatistics />

      {/* SECTION 5: 30-DAY FREE TRIAL OFFER */}
      <FreeTrialSection />

      {/* SECTION 6: CREDIT ISSUES WE FIX */}
      <CreditIssuesSection />

      {/* SECTION 7: OUR PROVEN 6-STEP PROCESS */}
      <SixStepProcess />

      {/* SECTION 8: REAL RESULTS FROM REAL CLIENTS */}
      <TestimonialsSection />

      {/* SECTION 9: LOCAL SEO SECTION */}
      <LocalSEOSection />

      {/* SECTION 10: FAQ SECTION */}
      <FAQSection openFaq={openFaq} setOpenFaq={setOpenFaq} />

      {/* SECTION 11: FINAL CTA */}
      <FinalCTA />
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
const HowCreditRepairWorks = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const steps = [
    {
      number: 1,
      title: "Step 1: Obtain Your Credit Reports",
      content: "Get free copies from AnnualCreditReport.com or through Experian, Equifax, and TransUnion. Review all three reports carefully for errors, outdated information, and inaccurate negative items."
    },
    {
      number: 2,
      title: "Step 2: Identify Disputable Items",
      content: "Look for:",
      bullets: [
        "Accounts you don't recognize",
        "Incorrect late payment dates",
        "Collections beyond the 7-year reporting period",
        "Duplicate accounts",
        "Incorrect balances or credit limits",
        "Identity theft items"
      ]
    },
    {
      number: 3,
      title: "Step 3: File Disputes Under FCRA",
      content: "The Fair Credit Reporting Act (FCRA) gives you the right to dispute any inaccurate, incomplete, or unverifiable information. Credit bureaus must investigate within 30 days."
    },
    {
      number: 4,
      title: "Step 4: Challenge Unverified Items",
      content: "If creditors can't verify the disputed information, the credit bureau must remove it. Professional credit repair companies use advanced strategies including Metro2 compliance checks and FCRA violation identification."
    },
    {
      number: 5,
      title: "Step 5: Monitor Progress",
      content: "Track your credit score changes monthly. Most people see improvements within 60-90 days of starting the dispute process."
    }
  ];

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            How to Repair Your Credit: The Complete Process
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Over 79,000 Americans have improved their credit scores using proven credit repair strategies. Whether you repair your credit yourself or work with professionals, understanding the process is essential. Here's everything you need to know about legally removing negative items, improving your credit score, and achieving financial freedom.
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
            When to Consider Professional Credit Repair
          </h3>
          <p className="text-gray-700 mb-4">
            While you can repair credit yourself, professional credit repair services save time and often achieve better results through:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Advanced dispute strategies you can't access as a consumer",
              "Legal expertise in FCRA, FDCPA, and FCBA violations",
              "Creditor negotiations and pay-for-delete arrangements",
              "Bureau challenges using technical Metro2 compliance issues",
              "Litigation support for FCRA violations"
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
              Get Professional Help <ArrowRight className="w-4 h-4 ml-2" />
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
const WhyChooseCredlocity = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const features = [
    {
      icon: Zap,
      title: "Advanced AI Technology",
      description: "Our proprietary AI analyzes your credit reports using Metro2 compliance standards and creates personalized dispute strategies targeting FCRA, FDCPA, and FCBA violations for maximum effectiveness.",
      color: "blue"
    },
    {
      icon: Shield,
      title: "TSR Compliant Process",
      description: "100% compliant with federal regulations. No phone enrollment, secure online platform only.",
      color: "green"
    },
    {
      icon: Users,
      title: "Hispanic-Owned Business",
      description: "Founded by CEO Joeziel Vazquez in Philadelphia, serving diverse communities across all 50 states.",
      color: "blue"
    },
    {
      icon: Award,
      title: "Proven Track Record",
      description: "16+ years experience, A+ BBB rating, zero complaints, and thousands of success stories.",
      color: "green"
    },
    {
      icon: BadgeCheck,
      title: "Certified Credit Experts",
      description: "Board Certified Credit Consultant (BCCC), Certified Credit Score Consultant (CCSC), and FCRA Certified professionals with 16+ years of experience.",
      color: "blue"
    }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            Why Choose Credlocity Over Other Credit Repair Companies
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Not all credit repair companies are created equal. Here's what makes us different from Lexington Law, Credit Saint, The Credit People, and other competitors.
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
            Compare us to competitors:{' '}
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
const AnimatedStatistics = () => {
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
            label="Years of Experience" 
            isInView={hasStarted}
            delay={0}
            suffix=""
          />
          <StatBox 
            count={count2} 
            label="Users" 
            isInView={hasStarted}
            delay={100}
            format="K"
          />
          <StatBox 
            count={count3} 
            label="Deleted Debt" 
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
const FreeTrialSection = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto bg-gradient-primary text-white rounded-3xl p-8 md:p-12 transition-all duration-700 ${
          isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4 text-center">
            30-Day Free Trial
          </h2>
          <p className="text-lg md:text-xl mb-8 text-center text-gray-100">
            Experience our service risk-free with our comprehensive guarantee package
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              "$0 due today - start immediately",
              "180-day money-back guarantee",
              "Cancel anytime, no long-term contracts",
              "Free Credit Tracker app included"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-100 mb-6 text-center">
            *You will pay for your credit report ($49.95) once you meet your assigned credit repair agent. Credit card information required but not charged for service fee for 30 days.
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
                Start Your Free Trial
              </a>
            </Button>
          </div>

          {/* Required Services */}
          <div className="border-t border-white/20 pt-8">
            <h3 className="font-cinzel text-2xl font-bold mb-6 text-center">Required Services</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-semibold text-xl mb-2">Credit Report Analysis</h4>
                <div className="text-3xl font-bold mb-3">$49.95</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Comprehensive review of all three credit reports</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Full Experian, Equifax & TransUnion review</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Identification of all negative items</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Personalized action plan</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-semibold text-xl mb-2">Power of Attorney (E-Notary)</h4>
                <div className="text-3xl font-bold mb-3">$39.95</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Electronic notarization included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Legal authority to dispute on your behalf</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Required for bureau communications</span>
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
const CreditIssuesSection = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.05 });

  const creditIssues = [
    {
      icon: TrendingDown,
      title: "Collection Removal",
      description: "Remove collection accounts using FDCPA violations, validation disputes, and pay-for-delete negotiations. Collections can drop your score 50-100 points—we remove them permanently.",
      stats: [
        "Average: -80 points per collection",
        "Stay on report: 7 years",
        "Success rate: 73%"
      ],
      link: "/collection-removal",
      color: "red"
    },
    {
      icon: Clock,
      title: "Late Payment Removal",
      description: "Remove late payments through goodwill letters, FCBA disputes, and Metro2 compliance challenges. Even one 30-day late can cost you 60-110 points.",
      stats: [
        "Average: -90 points per late",
        "Stay on report: 7 years",
        "Success rate: 68%"
      ],
      link: "/late-payment-removal",
      color: "orange"
    },
    {
      icon: FileText,
      title: "Charge-Off Removal",
      description: "Remove charge-offs using verification disputes, account validation, and creditor negotiations. Charge-offs signal severe delinquency to lenders.",
      stats: [
        "Average: -110 points",
        "Stay on report: 7 years",
        "Success rate: 71%"
      ],
      link: "/charge-off-removal",
      color: "red"
    },
    {
      icon: Scale,
      title: "Bankruptcy Removal",
      description: "Challenge bankruptcy reporting errors and rebuild credit after Chapter 7 or Chapter 13. While bankruptcies are difficult to remove, errors in reporting are common.",
      stats: [
        "Average: -200+ points",
        "Stay on report: 7-10 years",
        "Success rate: 34%"
      ],
      link: "/bankruptcy-credit-repair",
      color: "purple"
    },
    {
      icon: ShieldCheck,
      title: "Identity Theft Resolution",
      description: "Expert FCRA 605B credit block process for fraud victims. Remove fraudulent accounts and restore your credit using specialized identity theft procedures.",
      stats: [
        "Affects: 15M Americans/year",
        "Average damage: -150 points",
        "Success rate: 89%"
      ],
      link: "/identity-theft-credit-repair",
      color: "blue"
    },
    {
      icon: Target,
      title: "Hard Inquiry Removal",
      description: "Remove unauthorized hard inquiries that weren't approved by you. Each inquiry can cost 5-10 points, and multiple inquiries compound the damage.",
      stats: [
        "Average: -5 points each",
        "Stay on report: 2 years",
        "Success rate: 62%"
      ],
      link: "/hard-inquiry-removal",
      color: "indigo"
    }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            Credit Issues We Fix
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Expert removal strategies for every type of negative item affecting your credit score.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {creditIssues.map((issue, index) => (
            <CreditIssueCard key={index} issue={issue} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CreditIssueCard = ({ issue, index, isInView }) => {
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
          Learn More 
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  );
};

// SECTION 7: OUR PROVEN 6-STEP PROCESS
const SixStepProcess = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const steps = [
    {
      title: "Free Credit Analysis",
      description: "Complete credit report review to identify all negative items and opportunities for improvement."
    },
    {
      title: "Custom Strategy",
      description: "Personalized dispute strategy using advanced AI and Metro2 compliance techniques."
    },
    {
      title: "Professional Disputes",
      description: "Expert dispute letters sent to credit bureaus and creditors on your behalf."
    },
    {
      title: "Bureau Challenges",
      description: "Strategic challenges to all three credit bureaus using proven legal methods."
    },
    {
      title: "Progress Tracking",
      description: "Real-time updates via our Credit Tracker app showing your improving scores."
    },
    {
      title: "Score Optimization",
      description: "Ongoing optimization and credit building strategies for long-term success."
    }
  ];

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            Our Proven 6-Step Process
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            We've perfected our credit repair process over 16+ years to deliver maximum results for our clients.
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
const TestimonialsSection = () => {
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
            Real Results from Real Clients
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. See what our clients are saying about their credit repair journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial, index, isInView }) => (
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
        <div className="text-xs text-gray-500">Before</div>
      </div>
      <ArrowRight className="w-6 h-6 text-gray-400" />
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{testimonial.after}</div>
        <div className="text-xs text-gray-500">After</div>
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
        Read Full Story <ArrowRight className="w-3 h-3 ml-1" />
      </Link>
    </Button>
  </div>
);

// SECTION 9: LOCAL SEO SECTION
const LocalSEOSection = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-blue-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-6 text-center">
            Credit Repair Services in Philadelphia & Nationwide
          </h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Since 2008, Credlocity has operated from our Philadelphia, Pennsylvania headquarters, providing professional credit repair services to clients across all 50 states. As a Hispanic-owned business founded by CEO Joeziel Vazquez, we're proud to serve diverse communities with ethical, compliant credit restoration services.
          </p>

          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h3 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">
              Serving These Major Markets:
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Philadelphia, PA • New York, NY • Los Angeles, CA • Chicago, IL • Houston, TX • Phoenix, AZ • San Antonio, TX • San Diego, CA • Dallas, TX • San Jose, CA • Austin, TX • Jacksonville, FL • Fort Worth, TX • Columbus, OH • Charlotte, NC • and all 50 states nationwide
            </p>
          </div>

          <div className="bg-gradient-primary text-white rounded-xl p-8">
            <h3 className="font-cinzel text-2xl font-bold mb-6">Get Started Online</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Philadelphia Headquarters</div>
                  <div className="text-gray-100">Serving all 50 states nationwide</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Email Support</div>
                  <a href="mailto:support@credlocity.com" className="text-gray-100 hover:underline">
                    support@credlocity.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">TSR Compliant</div>
                  <div className="text-gray-100">100% online enrollment - No phone calls required</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Sign Up Anytime</div>
                  <div className="text-gray-100">24/7 online enrollment available</div>
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
                  Start Your Free Trial Online
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
const FAQSection = ({ openFaq, setOpenFaq }) => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

  const faqs = [
    {
      question: "How long does credit repair take?",
      answer: "Most clients see results within 60-90 days, with significant improvements by 6 months. The timeline depends on the number and type of negative items. Collections and late payments are often removed faster than bankruptcies or judgments. Credit bureaus have 30 days to investigate disputes under FCRA."
    },
    {
      question: "Can you really remove negative items from my credit report?",
      answer: "Yes, but only items that are inaccurate, unverifiable, or violate consumer protection laws. Legitimate negative information that creditors can verify may remain. However, many negative items contain errors or compliance violations that make them legally removable under FCRA, FDCPA, or FCBA."
    },
    {
      question: "How much does credit repair cost?",
      answer: "Credit repair typically costs $79-$149 per month. Credlocity offers a 30-day free trial with no upfront service fees. You only pay for required services: credit report analysis ($49.95) and power of attorney e-notary ($39.95). After your free trial, monthly service is $99/month with our 180-day money-back guarantee."
    },
    {
      question: "Is credit repair legal?",
      answer: "Yes. Credit repair is 100% legal under the Credit Repair Organizations Act (CROA). You have the right to dispute inaccurate information under the Fair Credit Reporting Act (FCRA). Reputable companies like Credlocity operate in full compliance with federal regulations including TSR and CROA."
    },
    {
      question: "Will credit repair hurt my credit score?",
      answer: "No. Disputing items cannot hurt your credit score. If a dispute is successful, negative items are removed and your score improves. If unsuccessful, your credit stays the same. There is no downside to legitimate credit repair disputes."
    }
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            Common Questions About Credit Repair
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Get answers to the most frequently asked questions about our credit repair services.
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
            Have more questions? Visit our comprehensive FAQ page with 50+ answers.
          </p>
          <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white" asChild>
            <Link to="/faq">
              View All FAQs <ArrowRight className="w-4 h-4 ml-2" />
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
const FinalCTA = () => {
  const [ref, isInView] = useInView({ once: true, threshold: 0.3 });

  return (
    <section className="py-20 bg-gradient-primary text-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
          isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Credit?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            Start your 30-day free trial today. No credit card required. No first work fee. Cancel anytime.
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
                Start Your Free Trial
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
                Book a Consultation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeNew;
