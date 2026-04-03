import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTranslation } from '../context/TranslationContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  
  // Refs for dropdown timers
  const aboutTimerRef = useRef(null);
  const resourcesTimerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (aboutTimerRef.current) clearTimeout(aboutTimerRef.current);
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
    };
  }, []);

  const handleAboutEnter = () => {
    if (aboutTimerRef.current) clearTimeout(aboutTimerRef.current);
    setAboutDropdownOpen(true);
  };

  const handleAboutLeave = () => {
    aboutTimerRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 300);
  };

  const handleResourcesEnter = () => {
    if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
    setResourcesDropdownOpen(true);
  };

  const handleResourcesLeave = () => {
    resourcesTimerRef.current = setTimeout(() => {
      setResourcesDropdownOpen(false);
    }, 300);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-cinzel font-bold text-primary-blue">
              Credlocity
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-blue font-medium py-2">
              {t('site.home')}
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-primary-blue font-medium py-2">
              {t('site.plans_pricing')}
            </Link>
            
            {/* About Us Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleAboutEnter}
              onMouseLeave={handleAboutLeave}
            >
              <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-blue font-medium py-2">
                <span>{t('site.about_us')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {aboutDropdownOpen && (
                <div 
                  className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50"
                >
                  <Link to="/why-us" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.why_us')}
                  </Link>
                  <Link to="/30-day-free-trial" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.free_trial')}
                  </Link>
                  <Link to="/collection-removal" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.collection_removal')}
                  </Link>
                  <Link to="/late-payment-removal" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.late_payment_removal')}
                  </Link>
                  <Link to="/fraud-removal" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.fraud_removal')}
                  </Link>
                  <Link to="/human-trafficking-credit-block" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.human_trafficking_block')}
                  </Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleResourcesEnter}
              onMouseLeave={handleResourcesLeave}
            >
              <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-blue font-medium py-2">
                <span>{t('site.resources')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {resourcesDropdownOpen && (
                <div 
                  className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50"
                >
                  <Link to="/how-it-works" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.how_it_works')}
                  </Link>
                  <Link to="/faq" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.faqs')}
                  </Link>
                  <Link to="/blog" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.blog')}
                  </Link>
                  <Link to="/team" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.our_team')}
                  </Link>
                  <Link to="/faqs" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.faqs')}
                  </Link>
                  <Link to="/credit-scores" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.educational_guides')}
                  </Link>
                  <Link to="/credit-repair-scams" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.credit_repair_scams')}
                  </Link>
                </div>
              )}
            </div>

            <Link to="/credit-tracker-app" className="text-gray-700 hover:text-primary-blue font-medium py-2">
              {t('site.credit_tracker')}
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                onBlur={() => setTimeout(() => setLangDropdownOpen(false), 150)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                data-testid="header-lang-dropdown"
              >
                <Globe className="w-4 h-4" />
                <span>{lang === 'en' ? 'English' : 'Espanol'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <button onClick={() => { setLang('en'); setLangDropdownOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${lang === 'en' ? 'text-blue-600 font-medium' : 'text-gray-700'}`} data-testid="lang-option-en">
                    <span className="text-base">{'\uD83C\uDDFA\uD83C\uDDF8'}</span> English
                  </button>
                  <button onClick={() => { setLang('es'); setLangDropdownOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${lang === 'es' ? 'text-blue-600 font-medium' : 'text-gray-700'}`} data-testid="lang-option-es">
                    <span className="text-base">{'\uD83C\uDDEA\uD83C\uDDF8'}</span> Espanol
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              asChild
              className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
              data-testid="header-login-btn"
            >
              <Link to="/admin/login">{t('site.login')}</Link>
            </Button>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              data-testid="header-start-trial-btn"
            >
              <a 
                href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('site.start_free_trial')}
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4 mt-4">
              <Link to="/" className="text-gray-700 hover:text-primary-blue font-medium">
                {t('site.home')}
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-primary-blue font-medium">
                {t('site.plans_pricing')}
              </Link>
              
              {/* About Us Mobile */}
              <div className="space-y-2">
                <div className="font-semibold text-gray-900">{t('site.about_us')}</div>
                <Link to="/why-us" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.why_us')}
                </Link>
                <Link to="/30-day-free-trial" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.free_trial')}
                </Link>
                <Link to="/collection-removal" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.collection_removal')}
                </Link>
                <Link to="/late-payment-removal" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.late_payment_removal')}
                </Link>
                <Link to="/fraud-removal" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.fraud_removal')}
                </Link>
                <Link to="/human-trafficking-credit-block" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.human_trafficking_block')}
                </Link>
              </div>

              {/* Resources Mobile */}
              <div className="space-y-2">
                <div className="font-semibold text-gray-900">{t('site.resources')}</div>
                <Link to="/how-it-works" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.how_it_works')}
                </Link>
                <Link to="/faqs" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.faqs')}
                </Link>
                <Link to="/blog" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.blog')}
                </Link>
                <Link to="/team" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.our_team')}
                </Link>
                <Link to="/credit-scores" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.educational_guides')}
                </Link>
                <Link to="/credit-repair-scams" className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.credit_repair_scams')}
                </Link>
              </div>

              <Link to="/credit-tracker-app" className="text-gray-700 hover:text-primary-blue font-medium">
                {t('site.credit_tracker')}
              </Link>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/admin/login">{t('site.login')}</Link>
                </Button>
                <Button asChild className="w-full bg-secondary-green hover:bg-secondary-green/90">
                  <a 
                    href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('site.start_free_trial')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
