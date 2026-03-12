import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const [legalPages, setLegalPages] = useState([]);

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
          <p className="text-gray-400 mb-4">America's Most Trusted Credit Repair Company</p>
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
            <h3 className="font-cinzel font-semibold text-lg mb-4">Credit Education</h3>
            <ul className="space-y-2">
              <li><Link to="/credit-scores" className="text-gray-400 hover:text-white transition text-sm">Credit Scores</Link></li>
              <li><Link to="/credit-reports" className="text-gray-400 hover:text-white transition text-sm">Credit Reports</Link></li>
              <li><Link to="/repair-methods" className="text-gray-400 hover:text-white transition text-sm">Repair Methods</Link></li>
              <li><Link to="/debt-management" className="text-gray-400 hover:text-white transition text-sm">Debt Management</Link></li>
              <li><Link to="/credit-building" className="text-gray-400 hover:text-white transition text-sm">Credit Building</Link></li>
              <li><Link to="/financial-wellness" className="text-gray-400 hover:text-white transition text-sm">Financial Wellness</Link></li>
              <li><Link to="/education-hub" className="text-gray-400 hover:text-white transition text-sm">Education Hub</Link></li>
              <li><Link to="/fcra-guide" className="text-gray-400 hover:text-white transition text-sm">FCRA Guide</Link></li>
              <li><Link to="/fdcpa-guide" className="text-gray-400 hover:text-white transition text-sm">FDCPA Guide</Link></li>
              <li><Link to="/croa-guide" className="text-gray-400 hover:text-white transition text-sm">CROA Guide</Link></li>
              <li><Link to="/tsr-compliance" className="text-gray-400 hover:text-white transition text-sm">TSR Compliance</Link></li>
              <li><Link to="/fcra-605b-block" className="text-gray-400 hover:text-white transition text-sm">FCRA 605B Block</Link></li>
            </ul>
          </div>

          {/* Column 2: Credlocity vs Competitors */}
          <div>
            <h3 className="font-cinzel font-semibold text-lg mb-4">Credlocity vs. Competitors</h3>
            <ul className="space-y-2">
              <li><Link to="/credit-repair-reviews" className="text-gray-400 hover:text-white transition text-sm font-medium">Credit Repair Reviews</Link></li>
              <li><Link to="/why-us" className="text-gray-400 hover:text-white transition text-sm">Why Us Over Them</Link></li>
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
            <h3 className="font-cinzel font-semibold text-lg mb-4">Credlocity</h3>
            <ul className="space-y-2">
              <li><Link to="/success-stories" className="text-gray-400 hover:text-white transition text-sm font-medium">Success Stories</Link></li>
              <li><Link to="/lawsuits" className="text-gray-400 hover:text-white transition text-sm">Lawsuits Filed</Link></li>
              <li><Link to="/press-releases" className="text-gray-400 hover:text-white transition text-sm">Press Releases</Link></li>
              
              {/* Dynamic Legal Pages */}
              {legalPages.map(page => (
                <li key={page.id}>
                  <Link to={`/legal/${page.slug}`} className="text-gray-400 hover:text-white transition text-sm">
                    {page.title}
                  </Link>
                </li>
              ))}
              
              <li><Link to="/partners" className="text-gray-400 hover:text-white transition text-sm">Credlocity Partners</Link></li>
              <li><Link to="/become-a-partner" className="text-gray-400 hover:text-white transition text-sm">Become a Partner</Link></li>
              <li><Link to="/outsourcing" className="text-gray-400 hover:text-white transition text-sm">Outsourcing Services</Link></li>
            </ul>
          </div>

          {/* Column 4: Credit Tools */}
          <div>
            <h3 className="font-cinzel font-semibold text-lg mb-4">Credit Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/tools/credit-score-calculator" className="text-gray-400 hover:text-white transition text-sm">Credit Score Calculator</Link></li>
              <li><Link to="/tools/debt-to-income-calculator" className="text-gray-400 hover:text-white transition text-sm">Debt-to-Income Calculator</Link></li>
              <li><Link to="/tools/credit-utilization-calculator" className="text-gray-400 hover:text-white transition text-sm">Credit Utilization Calculator</Link></li>
              <li><Link to="/tools/loan-payment-calculator" className="text-gray-400 hover:text-white transition text-sm">Loan Payment Calculator</Link></li>
              <li><Link to="/tools/debt-payoff-calculator" className="text-gray-400 hover:text-white transition text-sm">Debt Payoff Calculator</Link></li>
              <li><Link to="/tools/mortgage-calculator" className="text-gray-400 hover:text-white transition text-sm">Mortgage Calculator</Link></li>
              <li><Link to="/tools/credit-card-payoff-calculator" className="text-gray-400 hover:text-white transition text-sm">Credit Card Payoff Calculator</Link></li>
              <li><Link to="/tools/savings-calculator" className="text-gray-400 hover:text-white transition text-sm">Savings Calculator</Link></li>
              <li><Link to="/tools/interest-calculator" className="text-gray-400 hover:text-white transition text-sm">Interest Calculator</Link></li>
              <li><Link to="/tools/budget-calculator" className="text-gray-400 hover:text-white transition text-sm">Budget Calculator</Link></li>
              <li><Link to="/tools/refinance-calculator" className="text-gray-400 hover:text-white transition text-sm">Refinance Calculator</Link></li>
              <li><Link to="/tools/student-loan-calculator" className="text-gray-400 hover:text-white transition text-sm">Student Loan Calculator</Link></li>
              <li><Link to="/tools/auto-loan-calculator" className="text-gray-400 hover:text-white transition text-sm">Auto Loan Calculator</Link></li>
              <li><Link to="/tools/retirement-calculator" className="text-gray-400 hover:text-white transition text-sm">Retirement Calculator</Link></li>
            </ul>
          </div>
        </div>

        {/* Consumer Protection */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="font-cinzel font-semibold text-lg mb-4">Consumer Protection</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Report Fraud:</h4>
              <p className="text-gray-400">State Attorney General or local consumer affairs</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">FTC Complaints:</h4>
              <p className="text-gray-400">
                <a href="https://ftc.gov/complaint" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">ftc.gov/complaint</a> or 1-877-FTC-HELP
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Unfair Treatment:</h4>
              <p className="text-gray-400">Contact PA Attorney General</p>
            </div>
          </div>
          <p className="text-secondary-green font-semibold mt-4">Honest, Fair & Legal</p>
        </div>

        {/* Important Disclosure with Bubble Styling */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="font-cinzel font-semibold text-xl mb-6 text-center">IMPORTANT DISCLOSURE</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Your Rights Bubble */}
            <div className="bg-gray-800 border-2 border-secondary-green rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">Your Rights</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                You can dispute credit report errors for free under the Fair Credit Reporting Act (FCRA). Credlocity does not provide legal advice or guarantee removal of verifiable items.
              </p>
            </div>

            {/* Requirements Bubble */}
            <div className="bg-gray-800 border-2 border-primary-blue rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">Requirements</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Active client participation required. Results may vary. We comply with all federal and state credit repair laws.
              </p>
            </div>

            {/* TSR Compliance Bubble */}
            <div className="bg-gray-800 border-2 border-secondary-green rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">TSR Compliance</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Full compliance with CROA and Telemarketing Sales Rule.{' '}
                <Link to="/tsr-compliance" className="text-secondary-green hover:underline font-medium">
                  Learn More
                </Link>
              </p>
            </div>

            {/* Federal Notice Bubble */}
            <div className="bg-gray-800 border-2 border-primary-blue rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">Federal Notice</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                All services initiated through secure online platform. Per federal regulations, no phone enrollment.
              </p>
            </div>

            {/* Honest Fair Legal Bubble */}
            <div className="bg-gray-800 border-2 border-secondary-green rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">Our Promise</h4>
              <p className="text-secondary-green text-lg font-bold">
                Honest, Fair & Legal
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Committed to ethical practices and complete transparency in all our services.
              </p>
            </div>

            {/* Report Other Companies Bubble */}
            <div className="bg-gray-800 border-2 border-yellow-500 rounded-2xl p-6">
              <h4 className="font-cinzel font-semibold text-white mb-3 text-lg">Report Fraud</h4>
              <p className="text-gray-300 text-sm mb-3">
                Had a bad experience with another credit repair company?
              </p>
              <Link 
                to="/report-company" 
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition text-sm"
              >
                Submit a Complaint
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
            © 2025 Credlocity Business Group LLC. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Serving All 50 States from Philadelphia, PA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
