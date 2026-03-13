import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

const Footer = () => {
  const [legalPages, setLegalPages] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchLegalPages();
  }, []);

  const fetchLegalPages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/legal-pages`);
      if (response.ok) {
        const data = await response.json();
        setLegalPages(data.filter(page => page.is_published));
      }
    } catch (error) {
      console.error('Error fetching legal pages:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Company Info Header */}
        <div className="mb-8 pb-8 border-b border-gray-800">
          <h2 className="font-cinzel text-2xl font-bold mb-4">Credlocity</h2>
          <p className="text-gray-400 mb-4">{t('footer.tagline')}</p>
          <div className="space-y-2 text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:Admin@credlocity.com" className="hover:text-white transition">Admin@credlocity.com</a>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>1500 Chestnut Street, Suite 2, Philadelphia, PA 19102</span>
            </div>
            <p className="text-sm">Credlocity Business Group LLC, formerly Ficostar Credit Services</p>
            <p className="text-sm italic">Not affiliated with FICO®. FICO® is a trademark of Fair Isaac Corporation.</p>
          </div>
        </div>

        {/* Four Column Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Credit Education */}
          <div>
            <h3 className="font-cinzel font-semibold text-lg mb-4">{t('footer.credit_education')}</h3>
            <ul className="space-y-2">
              <li><Link to="/credit-scores" className="text-gray-400 hover:text-white transition text-sm">{t('footer.credit_scores')}</Link></li>
              <li><Link to="/credit-reports" className="text-gray-400 hover:text-white transition text-sm">{t('footer.credit_reports')}</Link></li>
              <li><Link to="/repair-methods" className="text-gray-400 hover:text-white transition text-sm">{t('footer.repair_methods')}</Link></li>
              <li><Link to="/debt-management" className="text-gray-400 hover:text-white transition text-sm">{t('footer.debt_management')}</Link></li>
              <li><Link to="/credit-building" className="text-gray-400 hover:text-white transition text-sm">{t('footer.credit_building')}</Link></li>
              <li><Link to="/financial-wellness" className="text-gray-400 hover:text-white transition text-sm">{t('footer.financial_wellness')}</Link></li>
              <li><Link to="/education-hub" className="text-gray-400 hover:text-white transition text-sm">{t('footer.education_hub')}</Link></li>
              <li><Link to="/fcra-guide" className="text-gray-400 hover:text-white transition text-sm">{t('footer.fcra_guide')}</Link></li>
              <li><Link to="/fdcpa-guide" className="text-gray-400 hover:text-white transition text-sm">{t('footer.fdcpa_guide')}</Link></li>
              <li><Link to="/croa-guide" className="text-gray-400 hover:text-white transition text-sm">{t('footer.croa_guide')}</Link></li>
              <li><Link to="/tsr-compliance" className="text-gray-400 hover:text-white transition text-sm">{t('footer.tsr_compliance')}</Link></li>
              <li><Link to="/fcra-605b-block" className="text-gray-400 hover:text-white transition text-sm">{t('footer.fcra_605b')}</Link></li>
            </ul>
          </div>

          {/* Column 2: Credlocity vs Competitors */}
          <div>
            <h3 className="font-cinzel font-semibold text-lg mb-4">{t('footer.vs_competitors')}</h3>
            <ul className="space-y-2">
              <li><Link to="/credit-repair-reviews" className="text-gray-400 hover:text-white transition text-sm font-medium">{t('footer.credit_repair_reviews')}</Link></li>
              <li><Link to="/why-us" className="text-gray-400 hover:text-white transition text-sm">{t('footer.why_us_over_them')}</Link></li>
              <li><Link to="/vs-lexington-law" className="text-gray-400 hover:text-white transition text-sm">vs Lexington Law</Link></li>
              <li><Link to="/vs-creditrepair" className="text-gray-400 hover:text-white transition text-sm">vs Creditrepair.com</Link></li>
              <li><Link to="/vs-credit-people" className="text-gray-400 hover:text-white transition text-sm">vs The Credit People</Link></li>
              <li><Link to="/vs-credit-pros" className="text-gray-400 hover:text-white transition text-sm">vs The Credit Pros</Link></li>
              <li><Link to="/vs-credit-saint" className="text-gray-400 hover:text-white transition text-sm">vs Credit Saint</Link></li>
              <li><Link to="/vs-white-jacobs" className="text-gray-400 hover:text-white transition text-sm">vs White Jacobs</Link></li>
            </ul>
          </div>

          {/* Column 3: Credlocity */}
          <div>
            <h3 className="font-cinzel font-semibold text-lg mb-4">{t('footer.credlocity')}</h3>
            <ul className="space-y-2">
              <li><Link to="/success-stories" className="text-gray-400 hover:text-white transition text-sm font-medium">{t('footer.success_stories')}</Link></li>
              <li><Link to="/lawsuits" className="text-gray-400 hover:text-white transition text-sm">{t('footer.lawsuits_filed')}</Link></li>
              <li><Link to="/press-releases" className="text-gray-400 hover:text-white transition text-sm">{t('footer.press_releases')}</Link></li>
              
              {/* Dynamic Legal Pages */}
              {legalPages.map(page => (
                <li key={page.id}>
                  <Link to={`/legal/${page.slug}`} className="text-gray-400 hover:text-white transition text-sm">
                    {page.title}
                  </Link>
                </li>
              ))}
              
              <li><Link to="/partners" className="text-gray-400 hover:text-white transition text-sm">{t('footer.credlocity_partners')}</Link></li>
              <li><Link to="/become-a-partner" className="text-gray-400 hover:text-white transition text-sm">{t('footer.become_partner')}</Link></li>
              <li><Link to="/outsourcing" className="text-gray-400 hover:text-white transition text-sm">{t('footer.outsourcing_services')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Credit Tools */}
          <div>
            <h3 className="font-cinzel font-semibold text-lg mb-4">{t('footer.credit_tools')}</h3>
            <ul className="space-y-2">
              <li><Link to="/tools/credit-score-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.credit_score_calc')}</Link></li>
              <li><Link to="/tools/debt-to-income-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.dti_calc')}</Link></li>
              <li><Link to="/tools/credit-utilization-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.utilization_calc')}</Link></li>
              <li><Link to="/tools/loan-payment-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.loan_calc')}</Link></li>
              <li><Link to="/tools/debt-payoff-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.debt_payoff_calc')}</Link></li>
              <li><Link to="/tools/mortgage-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.mortgage_calc')}</Link></li>
              <li><Link to="/tools/credit-card-payoff-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.cc_payoff_calc')}</Link></li>
              <li><Link to="/tools/savings-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.savings_calc')}</Link></li>
              <li><Link to="/tools/interest-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.interest_calc')}</Link></li>
              <li><Link to="/tools/budget-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.budget_calc')}</Link></li>
              <li><Link to="/tools/refinance-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.refinance_calc')}</Link></li>
              <li><Link to="/tools/student-loan-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.student_loan_calc')}</Link></li>
              <li><Link to="/tools/auto-loan-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.auto_loan_calc')}</Link></li>
              <li><Link to="/tools/retirement-calculator" className="text-gray-400 hover:text-white transition text-sm">{t('footer.retirement_calc')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Consumer Protection */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="font-cinzel font-semibold text-lg mb-4">{t('footer.consumer_protection')}</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">{t('footer.report_fraud')}:</h4>
              <p className="text-gray-400">{t('footer.report_fraud_desc')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('footer.ftc_complaints')}:</h4>
              <p className="text-gray-400">
                <a href="https://ftc.gov/complaint" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">ftc.gov/complaint</a> or 1-877-FTC-HELP
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('footer.unfair_treatment')}:</h4>
              <p className="text-gray-400">{t('footer.unfair_treatment_desc')}</p>
            </div>
          </div>
          <p className="text-secondary-green font-semibold mt-4">{t('footer.honest_fair_legal')}</p>
        </div>

        {/* Important Disclosure with Bubble Styling */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="font-cinzel font-semibold text-xl mb-6 text-center">{t('footer.important_disclosure')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 border-2 border-secondary-green rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">{t('footer.your_rights')}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{t('footer.your_rights_desc')}</p>
            </div>
            <div className="bg-gray-800 border-2 border-primary-blue rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">{t('footer.requirements')}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{t('footer.requirements_desc')}</p>
            </div>
            <div className="bg-gray-800 border-2 border-secondary-green rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">{t('footer.tsr_compliance_title')}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t('footer.tsr_compliance_desc')}{' '}
                <Link to="/tsr-compliance" className="text-secondary-green hover:underline font-medium">
                  {t('site.learn_more')}
                </Link>
              </p>
            </div>
            <div className="bg-gray-800 border-2 border-primary-blue rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">{t('footer.federal_notice')}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{t('footer.federal_notice_desc')}</p>
            </div>
            <div className="bg-gray-800 border-2 border-secondary-green rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">{t('footer.our_promise')}</h4>
              <p className="text-secondary-green text-lg font-bold">{t('footer.honest_fair_legal')}</p>
              <p className="text-gray-300 text-sm mt-2">{t('footer.our_promise_desc')}</p>
            </div>
            <div className="bg-gray-800 border-2 border-yellow-500 rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">{t('footer.report_fraud_title')}</h4>
              <p className="text-gray-300 text-sm mb-3">{t('footer.report_fraud_question')}</p>
              <Link 
                to="/report-company" 
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition text-sm"
              >
                {t('footer.submit_complaint')}
              </Link>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex justify-center space-x-6 mb-8">
          <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Twitter">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition" aria-label="LinkedIn">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
            <Instagram className="w-6 h-6" />
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            © {t('footer.copyright')}
          </p>
          <p className="text-gray-500 text-sm">
            {t('footer.serving')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
