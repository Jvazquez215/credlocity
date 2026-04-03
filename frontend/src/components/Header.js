import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTranslation } from '../context/TranslationContext';
import { useLeadCapture } from '../context/LeadCaptureContext';

const LOCATIONS = [
  { city: 'Philadelphia', state: 'PA', slug: '/credit-repair-philadelphia' },
  { city: 'Atlanta', state: 'GA', slug: '/credit-repair-atlanta' },
  { city: 'New York', state: 'NY', slug: '/credit-repair-new-york' },
  { city: 'Trenton', state: 'NJ', slug: '/credit-repair-trenton' },
  { city: 'Boise', state: 'ID', slug: '/credit-repair-boise' },
  { city: 'Nampa', state: 'ID', slug: '/credit-repair-nampa' },
  { city: 'Caldwell', state: 'ID', slug: '/credit-repair-caldwell' },
  { city: 'Idaho Falls', state: 'ID', slug: '/credit-repair-idaho-falls' },
  { city: 'Twin Falls', state: 'ID', slug: '/credit-repair-twin-falls' },
  { city: 'Pocatello', state: 'ID', slug: '/credit-repair-pocatello' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [locationsDropdownOpen, setLocationsDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const { openFreeTrial } = useLeadCapture();
  const navigate = useNavigate();
  const location = useLocation();

  const aboutTimerRef = useRef(null);
  const resourcesTimerRef = useRef(null);
  const locationsTimerRef = useRef(null);

  // Close mobile menu and scroll to top on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (aboutTimerRef.current) clearTimeout(aboutTimerRef.current);
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
      if (locationsTimerRef.current) clearTimeout(locationsTimerRef.current);
    };
  }, []);

  const handleAboutEnter = () => { if (aboutTimerRef.current) clearTimeout(aboutTimerRef.current); setAboutDropdownOpen(true); };
  const handleAboutLeave = () => { aboutTimerRef.current = setTimeout(() => setAboutDropdownOpen(false), 300); };
  const handleResourcesEnter = () => { if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current); setResourcesDropdownOpen(true); };
  const handleResourcesLeave = () => { resourcesTimerRef.current = setTimeout(() => setResourcesDropdownOpen(false), 300); };
  const handleLocationsEnter = () => { if (locationsTimerRef.current) clearTimeout(locationsTimerRef.current); setLocationsDropdownOpen(true); };
  const handleLocationsLeave = () => { locationsTimerRef.current = setTimeout(() => setLocationsDropdownOpen(false), 300); };

  // Mobile nav helper — closes menu, scrolls to top
  const mobileNav = (to) => (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate(to);
    window.scrollTo(0, 0);
  };

  // Desktop nav helper — closes dropdowns
  const desktopNav = () => {
    setAboutDropdownOpen(false);
    setResourcesDropdownOpen(false);
    setLocationsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={() => window.scrollTo(0, 0)}>
            <img
              src="/logo.png"
              alt="Credlocity"
              className="h-10 md:h-12 w-auto"
              data-testid="header-logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-blue font-medium py-2" onClick={() => window.scrollTo(0, 0)}>
              {t('site.home')}
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-primary-blue font-medium py-2" onClick={() => window.scrollTo(0, 0)}>
              {t('site.plans_pricing')}
            </Link>
            
            {/* About Us Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleAboutEnter}
              onMouseLeave={handleAboutLeave}
            >
              <Link
                to="/about-us"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-blue font-medium py-2"
                onClick={() => { desktopNav(); window.scrollTo(0, 0); }}
                data-testid="header-about-us-link"
              >
                <span>{t('site.about_us')}</span>
                <ChevronDown className="w-4 h-4" />
              </Link>
              
              {aboutDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
                  <Link to="/about-credlocity" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors font-medium" data-testid="dropdown-about-credlocity">
                    About Credlocity
                  </Link>
                  <Link to="/why-us" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors" data-testid="dropdown-why-us">
                    {t('site.why_us')}
                  </Link>
                  <Link to="/30-day-free-trial" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors" data-testid="dropdown-free-trial">
                    {t('site.free_trial')}
                  </Link>
                  <Link to="/success-stories" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    Success Stories
                  </Link>
                  <Link to="/team" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.our_team')}
                  </Link>
                  <Link to="/team/joeziel-joey-vazquez-davila" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors" data-testid="dropdown-meet-founder">
                    Meet Our Founder
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
                <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
                  <Link to="/how-it-works" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.how_it_works')}
                  </Link>
                  <Link to="/faqs" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.faqs')}
                  </Link>
                  <Link to="/blog" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors">
                    {t('site.blog')}
                  </Link>
                  <Link to="/credit-repair-laws" onClick={desktopNav} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-blue transition-colors" data-testid="dropdown-education-guide">
                    {t('site.educational_guides')}
                  </Link>
                </div>
              )}
            </div>

            <Link to="/credit-tracker-app" className="text-gray-700 hover:text-primary-blue font-medium py-2" onClick={() => window.scrollTo(0, 0)}>
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
              className="bg-secondary-green hover:bg-secondary-green/90 text-white"
              data-testid="header-start-trial-btn"
              onClick={openFreeTrial}
            >
              {t('site.start_free_trial')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 max-h-[80vh] overflow-y-auto" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4 mt-4">
              <a href="/" onClick={mobileNav('/')} className="text-gray-700 hover:text-primary-blue font-medium">
                {t('site.home')}
              </a>
              <a href="/pricing" onClick={mobileNav('/pricing')} className="text-gray-700 hover:text-primary-blue font-medium">
                {t('site.plans_pricing')}
              </a>
              
              {/* About Us Mobile */}
              <div className="space-y-2">
                <a href="/about-us" onClick={mobileNav('/about-us')} className="font-semibold text-gray-900 hover:text-primary-blue" data-testid="mobile-about-us-link">
                  {t('site.about_us')}
                </a>
                <a href="/about-credlocity" onClick={mobileNav('/about-credlocity')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  About Credlocity
                </a>
                <a href="/why-us" onClick={mobileNav('/why-us')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.why_us')}
                </a>
                <a href="/30-day-free-trial" onClick={mobileNav('/30-day-free-trial')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.free_trial')}
                </a>
                <a href="/success-stories" onClick={mobileNav('/success-stories')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  Success Stories
                </a>
                <a href="/team" onClick={mobileNav('/team')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.our_team')}
                </a>
                <a href="/team/joeziel-joey-vazquez-davila" onClick={mobileNav('/team/joeziel-joey-vazquez-davila')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  Meet Our Founder
                </a>
              </div>

              {/* Resources Mobile */}
              <div className="space-y-2">
                <div className="font-semibold text-gray-900">{t('site.resources')}</div>
                <a href="/how-it-works" onClick={mobileNav('/how-it-works')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.how_it_works')}
                </a>
                <a href="/faqs" onClick={mobileNav('/faqs')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.faqs')}
                </a>
                <a href="/blog" onClick={mobileNav('/blog')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.blog')}
                </a>
                <a href="/credit-repair-laws" onClick={mobileNav('/credit-repair-laws')} className="block pl-4 text-gray-700 hover:text-primary-blue">
                  {t('site.educational_guides')}
                </a>
              </div>

              <a href="/credit-tracker-app" onClick={mobileNav('/credit-tracker-app')} className="text-gray-700 hover:text-primary-blue font-medium">
                {t('site.credit_tracker')}
              </a>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Button variant="outline" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/admin/login">{t('site.login')}</Link>
                </Button>
                <Button className="w-full bg-secondary-green hover:bg-secondary-green/90" onClick={() => { setMobileMenuOpen(false); openFreeTrial(); }}>
                  {t('site.start_free_trial')}
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
