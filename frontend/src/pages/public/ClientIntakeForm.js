import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, FileText, Phone, Shield } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ClientIntakeForm = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [userAnswers, setUserAnswers] = useState({});
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', ssnLast4: '', consent: false
  });
  const [agreementData, setAgreementData] = useState({ accepted: false, signature: '', scrollProgress: 0 });
  const [userIP, setUserIP] = useState('');
  const [showTSRPopup, setShowTSRPopup] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preSelectedPackage, setPreSelectedPackage] = useState(null);
  const scrollBoxRef = useRef(null);
  
  // Form configuration from backend
  const [formConfig, setFormConfig] = useState(null);

  // Fetch form configuration from backend based on current URL slug
  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        // Get slug from pathname (e.g., /intake -> intake, /apply -> apply)
        const slug = location.pathname.replace(/^\//, '') || 'intake';
        const res = await axios.get(`${API_URL}/api/intake-forms/by-slug/${slug}`);
        setFormConfig(res.data);
      } catch (err) {
        console.log('Using default form config');
        // Use defaults if no config found
      }
    };
    fetchFormConfig();
  }, [location.pathname]);

  // Get pre-selected package from URL params (from pricing page)
  useEffect(() => {
    const packageKey = searchParams.get('package');
    const packageName = searchParams.get('name');
    const packagePrice = searchParams.get('price');
    
    if (packageKey) {
      setPreSelectedPackage({
        key: packageKey,
        name: packageName ? decodeURIComponent(packageName) : null,
        price: packagePrice ? parseFloat(packagePrice) : null
      });
      // Pre-select the package in step 3
      const scoreMap = { 'family': 12, 'aggressive': 11, 'fraud': 9 };
      setUserAnswers(prev => ({
        ...prev,
        step3: { value: packageKey, score: scoreMap[packageKey] || 9 }
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => setUserIP('IP_CAPTURE_PENDING'));
  }, []);

  const questions = [
    {
      step: 1, title: "What's Your Current Credit Score?", subtitle: "Don't worry if you're not sure - we'll help you find out!",
      options: [
        { value: 'poor', score: 12, title: 'Below 580 (Poor)', desc: 'Significant improvement needed - but we specialize in dramatic transformations' },
        { value: 'fair', score: 10, title: '580-669 (Fair)', desc: 'Good potential for improvement - let\'s unlock better opportunities' },
        { value: 'good', score: 6, title: '670-739 (Good)', desc: 'Great foundation - we can help you reach excellent territory' },
        { value: 'excellent', score: 3, title: '740+ (Excellent)', desc: 'Amazing! Let\'s maintain and optimize your excellent credit' },
        { value: 'unknown', score: 9, title: "I'm not sure", desc: "No problem! We'll help you get a complete credit analysis" }
      ]
    },
    {
      step: 2, title: "What's Your Timeline?", subtitle: 'When would you like to see significant improvement in your credit?',
      options: [
        { value: 'asap', score: 12, title: 'ASAP - I have an urgent need', desc: 'Buying a home, car, or need better rates immediately' },
        { value: '1-3months', score: 10, title: '1-3 months', desc: 'Planning a major purchase or financial goal soon' },
        { value: '3-6months', score: 7, title: '3-6 months', desc: 'Working toward specific financial milestones' },
        { value: '6months+', score: 4, title: '6+ months', desc: 'Building long-term financial health and opportunities' }
      ]
    },
    {
      step: 3, title: 'Which Service Level Fits Your Needs?', subtitle: 'Choose the investment level that matches your goals',
      options: [
        { value: 'family', score: 12, title: 'Family Package - $279.95/month', desc: 'Complete credit repair for couples & families' },
        { value: 'aggressive', score: 11, title: 'Aggressive Package - $179.95/month ⭐ Most Popular', desc: 'Unlimited disputes and priority support' },
        { value: 'fraud', score: 9, title: 'Fraud Package - $99.95/month', desc: 'Specialized service for identity theft victims' },
        { value: 'payment-plan', score: 8, title: 'I need flexible payment options', desc: 'Interested but need to discuss payment arrangements' },
        { value: 'unsure', score: 7, title: 'I need to understand the value first', desc: 'Want to learn more about services' }
      ]
    },
    {
      step: 4, title: "What's Your Credit Repair Experience?", subtitle: 'This helps us tailor the perfect approach',
      options: [
        { value: 'never', score: 8, title: 'Never tried credit repair', desc: 'Ready to start fresh with professional guidance' },
        { value: 'diy', score: 11, title: "I've tried DIY credit repair", desc: 'Attempted on my own but need expert help' },
        { value: 'other-company', score: 12, title: 'Used another credit repair company', desc: 'Looking for better results and service' },
        { value: 'currently-using', score: 9, title: 'Currently using another service', desc: 'Not satisfied with current progress' }
      ]
    },
    {
      step: 5, title: 'How Do You Make Financial Decisions?', subtitle: 'Understanding your process helps us serve you better',
      options: [
        { value: 'me-alone', score: 12, title: 'I make my own decisions', desc: 'Ready to move forward when I find the right solution' },
        { value: 'discuss-spouse', score: 9, title: 'I discuss with my spouse/partner', desc: 'We make financial decisions together' },
        { value: 'spouse-decides', score: 6, title: 'My spouse/partner decides', desc: 'They handle most financial decisions' },
        { value: 'family-input', score: 4, title: 'I consult family/advisors', desc: 'Important decisions involve input from multiple people' }
      ]
    }
  ];

  const getPackageDetails = (pkg) => {
    // If we have pre-selected package from pricing page, use it
    if (preSelectedPackage && preSelectedPackage.key === pkg && preSelectedPackage.name && preSelectedPackage.price) {
      return { name: preSelectedPackage.name, price: preSelectedPackage.price };
    }
    const packages = {
      'family': { name: 'Family Package', price: 279.95 },
      'aggressive': { name: 'Aggressive Package', price: 179.95 },
      'fraud': { name: 'Fraud Package', price: 99.95 },
      'payment-plan': { name: 'Flexible Payment Plan', price: 99.95 },
      'unsure': { name: 'To Be Determined', price: 0 }
    };
    return packages[pkg] || { name: 'To Be Determined', price: 0 };
  };

  const calculateScore = () => Object.values(userAnswers).reduce((sum, a) => sum + (a.score || 0), 0);

  const handleOptionSelect = (category, option) => {
    setUserAnswers({ ...userAnswers, [category]: option });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      let v = value.replace(/\D/g, '');
      if (v.length >= 6) v = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6,10)}`;
      else if (v.length >= 3) v = `(${v.slice(0,3)}) ${v.slice(3)}`;
      setFormData({ ...formData, phone: v });
    } else if (name === 'ssnLast4') {
      setFormData({ ...formData, ssnLast4: value.replace(/\D/g, '').slice(0, 4) });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleScroll = () => {
    if (!scrollBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollBoxRef.current;
    const progress = Math.min(Math.round((scrollTop / (scrollHeight - clientHeight)) * 100), 100);
    setAgreementData(prev => ({ ...prev, scrollProgress: progress }));
  };

  const validateStep6 = () => {
    const { firstName, lastName, email, phone, consent } = formData;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneValid = /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);
    return firstName && lastName && emailValid && phoneValid && consent;
  };

  const validateStep7 = () => {
    const fullName = `${formData.firstName} ${formData.lastName}`.toLowerCase();
    return agreementData.accepted && agreementData.signature.toLowerCase() === fullName && agreementData.scrollProgress >= 95;
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 6) setShowTSRPopup(true);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const canProceed = () => {
    if (currentStep <= 5) return userAnswers[`step${currentStep}`];
    if (currentStep === 6) return validateStep6();
    if (currentStep === 7) return validateStep7();
    return false;
  };

  const today = new Date();
  const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getFederalCancelDate = () => {
    const d = new Date(today);
    let added = 0;
    while (added < 3) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) added++; }
    return formatDate(d);
  };
  const getPACancelDate = () => { const d = new Date(today); d.setDate(d.getDate() + 5); return formatDate(d); };

  const handleSubmit = async () => {
    setLoading(true);
    const score = calculateScore();
    const pkgDetails = getPackageDetails(userAnswers.step3?.value);
    
    // Get form slug from current path to use form-specific settings
    const formSlug = location.pathname.replace(/^\//, '') || 'intake';
    
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobilePhone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      socialSecurityNumber: formData.ssnLast4,
      creditScore: userAnswers.step1?.value,
      timeline: userAnswers.step2?.value,
      budget: userAnswers.step3?.value,
      experience: userAnswers.step4?.value,
      decision: userAnswers.step5?.value,
      totalScore: score,
      consent: formData.consent,
      form_slug: formSlug,  // Pass form slug to use form-specific calendars and URLs
      agreementAcceptance: agreementData.accepted,
      electronicSignature: agreementData.signature,
      agreementDate: formatDate(today),
      federalCancelDate: getFederalCancelDate(),
      paStateCancelDate: getPACancelDate(),
      ipAddress: userIP,
      packageName: pkgDetails.name,
      packagePrice: pkgDetails.price
    };

    try {
      const response = await axios.post(`${API_URL}/api/clients/intake`, payload);
      const data = response.data;
      
      // Submit to external CRM (pulse.disputeprocess.com)
      try {
        const crmParams = new URLSearchParams({
          method: 'addWebFormData',
          tab_info_id: 'QTduWHF0U2lXOWNPNFZvN085bUJ3dz09',
          company_id: 'UmJ1YWN4dkUvbThaUXJqVkdKZ3paUT09',
          cust_type: data.lead_status === 'hot' ? '2' : '1', // 2 for high-intent, 1 for others
          customer_statusid: data.lead_status === 'hot' ? '1' : '2', // 1 for ready clients
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dateOfBirth,
          ssn_last4: formData.ssnLast4,
          textField1: JSON.stringify({
            credit_score: userAnswers.step1?.value,
            timeline: userAnswers.step2?.value,
            budget: userAnswers.step3?.value,
            experience: userAnswers.step4?.value,
            decision: userAnswers.step5?.value,
            total_score: calculateScore(),
            lead_status: data.lead_status
          }),
          textField2: JSON.stringify({
            agreement_accepted: agreementData.accepted,
            signature: agreementData.signature,
            agreement_date: formatDate(today),
            federal_cancel_date: getFederalCancelDate(),
            pa_cancel_date: getPACancelDate(),
            ip_address: userIP,
            package: pkgDetails.name,
            price: pkgDetails.price
          })
        });
        
        // Send to CRM (fire and forget - don't block on failure)
        fetch(`https://pulse.disputeprocess.com/CustumFieldController?${crmParams.toString()}`, {
          method: 'GET',
          mode: 'no-cors' // External CRM may not support CORS
        }).catch(err => console.log('CRM sync attempted:', err.message));
      } catch (crmError) {
        console.log('CRM submission error (non-blocking):', crmError);
      }
      
      // Build ScoreXer redirect URL with client parameters for hot leads
      // Use form config if available, otherwise fallback to data from API or defaults
      const baseScoreXerUrl = data.redirect_url || formConfig?.credit_report_url || 'https://credlocity.scorexer.com/scorefusion/scorefusion-signup.jsp?code=50a153cc-c';
      const scoreXerParams = new URLSearchParams({
        fname: formData.firstName,
        lname: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: 'assessment'
      });
      // Append params to ScoreXer URL (check if URL already has params)
      const scoreXerUrlWithParams = baseScoreXerUrl.includes('?') 
        ? `${baseScoreXerUrl}&${scoreXerParams.toString()}`
        : `${baseScoreXerUrl}?${scoreXerParams.toString()}`;
      
      // Get button text from form config if available
      const hotButtonText = formConfig?.credit_report_button_text || 'Get My Credit Report ($49.95)';
      const warmButtonText = formConfig?.warm_lead_button_text || 'Schedule My Free Strategy Session';
      const coldButtonText = formConfig?.cold_lead_button_text || 'Get My Free Consultation';
      const defaultCalendarUrl = formConfig?.default_calendar_url || 'https://calendly.com/credlocity/oneonone';
      
      let resultData;
      if (data.lead_status === 'hot') {
        resultData = { icon: '🚀', title: "Perfect! You're Ready to Transform Your Credit", message: "Based on your assessment, you're an ideal candidate for immediate credit improvement. Let's start with getting your comprehensive credit analysis for just $49.95.", buttonText: hotButtonText, redirectUrl: scoreXerUrlWithParams };
      } else if (data.lead_status === 'warm') {
        resultData = { icon: '💡', title: "Great! Let's Create Your Custom Strategy", message: 'You have excellent potential for credit improvement! A personalized consultation will help us design the perfect strategy.', buttonText: warmButtonText, redirectUrl: data.redirect_url || defaultCalendarUrl };
      } else {
        resultData = { icon: '📈', title: "Let's Start Your Credit Journey Together", message: "Credit improvement is absolutely achievable! We'd love to schedule a complimentary consultation to understand your goals.", buttonText: coldButtonText, redirectUrl: data.redirect_url || defaultCalendarUrl };
      }
      setResult(resultData);
      setCurrentStep(8);
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pkgDetails = getPackageDetails(userAnswers.step3?.value);
  const fullName = `${formData.firstName} ${formData.lastName}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-blue-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white text-center py-10 px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{formConfig?.header_title || 'Unlock Your Credit Potential'}</h1>
          <p className="text-lg opacity-90">{formConfig?.header_subtitle || 'Take our 2-minute assessment to discover your personalized path to financial freedom'}</p>
        </div>

        {/* Progress Bar */}
        {currentStep <= 7 && (
          <div className="px-6 py-4 border-b">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">Step {currentStep} of {totalSteps}</p>
          </div>
        )}

        {/* Question Steps 1-5 */}
        {currentStep <= 5 && (
          <div className="p-6 md:p-10 min-h-[500px]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full text-xl font-bold mb-4">{currentStep}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{questions[currentStep - 1].title}</h2>
              <p className="text-gray-500">{questions[currentStep - 1].subtitle}</p>
            </div>
            <div className="space-y-3 max-w-2xl mx-auto">
              {questions[currentStep - 1].options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleOptionSelect(`step${currentStep}`, opt)}
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:border-green-400 hover:shadow-md ${
                    userAnswers[`step${currentStep}`]?.value === opt.value ? 'border-green-600 bg-green-50 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{opt.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                    </div>
                    {userAnswers[`step${currentStep}`]?.value === opt.value && (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-10">
              {currentStep > 1 ? <button onClick={prevStep} className="px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 flex items-center"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button> : <div />}
              <button onClick={nextStep} disabled={!canProceed()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">Continue <ChevronRight className="w-5 h-5 ml-1" /></button>
            </div>
          </div>
        )}

        {/* Step 6: Contact Information */}
        {currentStep === 6 && (
          <div className="p-6 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full text-xl font-bold mb-4">6</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Personalized Results</h2>
              <p className="text-gray-500">We'll create a custom credit improvement strategy just for you</p>
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label><input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label><input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label><input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="(555) 555-5555" className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleFormChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Last 4 of SSN</label><input type="text" name="ssnLast4" value={formData.ssnLast4} onChange={handleFormChange} placeholder="1234" maxLength={4} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none" /></div>
              </div>
              <div className="bg-gray-50 border rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="consent" checked={formData.consent} onChange={handleFormChange} className="mt-1 w-5 h-5 accent-green-600" />
                  <span className="text-sm text-gray-600">I agree to receive communication about credit repair services via phone, email, or text. I can opt out anytime.</span>
                </label>
              </div>
            </div>
            <div className="flex justify-between mt-10 max-w-lg mx-auto">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 flex items-center"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button>
              <button onClick={nextStep} disabled={!canProceed()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">Continue <ChevronRight className="w-5 h-5 ml-1" /></button>
            </div>
          </div>
        )}

        {/* Step 7: Agreement */}
        {currentStep === 7 && (
          <div className="p-6 md:p-10">
            {/* TSR Popup */}
            {showTSRPopup && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-6 rounded-t-2xl text-center">
                    <h3 className="text-xl font-bold">⚖️ Important Federal Notice</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <p><strong>What is the TSR (Telemarketing Sales Rule)?</strong></p>
                    <p className="text-gray-600">The TSR is a federal regulation that prohibits credit repair companies from discussing services or accepting payment over the phone until you become an active client with a signed agreement.</p>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="font-semibold text-green-800">🎯 Here's What This Means for You:</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>✅ You are <strong>NOT being charged anything</strong> by signing this agreement</li>
                        <li>✅ You will <strong>NOT be charged for 30 days</strong> of credit repair services</li>
                        <li>✅ You can <strong>cancel at ANY TIME</strong> - no questions asked</li>
                        <li>✅ Federal law requires a 3-day cancellation right, but Credlocity gives you <strong>unlimited cancellation rights</strong></li>
                      </ul>
                    </div>
                    <p className="text-gray-600">This agreement allows us to legally schedule your consultation and discuss how we can help improve your credit.</p>
                  </div>
                  <button onClick={() => setShowTSRPopup(false)} className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg hover:from-green-600 hover:to-green-700">I Understand - Show Me the Agreement</button>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full text-xl font-bold mb-4">7</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Agreement & Legal Notice</h2>
              <p className="text-gray-500">Please review and sign your Free Trial Credit Repair Service Agreement</p>
            </div>

            {/* Agreement Container */}
            <div className="border-2 rounded-2xl overflow-hidden mb-6">
              <div className="bg-gray-100 p-4 text-center border-b">
                <h3 className="font-bold text-lg">📋 Free Trial Credit Repair Service Agreement</h3>
                <p className="text-sm text-gray-500">Scroll to read the entire agreement</p>
                {agreementData.scrollProgress < 95 && <span className="inline-block mt-2 px-4 py-1 bg-green-600 text-white rounded-full text-sm animate-bounce">↓ Scroll to continue ↓</span>}
              </div>
              <div ref={scrollBoxRef} onScroll={handleScroll} className="h-96 overflow-y-scroll p-6 bg-white text-sm leading-relaxed">
                <h4 className="text-xl font-bold text-center border-b-2 border-green-600 pb-2 mb-4">FREE TRIAL CREDIT REPAIR SERVICE AGREEMENT</h4>
                <p className="text-center text-gray-500 mb-6">Agreement Date: {formatDate(today)}</p>
                <p className="mb-4">This Free Trial Credit Repair Service Agreement is entered into between <strong>{fullName || '[Client Name]'}</strong> ("Client") and <strong>Credlocity Business Group LLC</strong> ("Company").</p>
                
                <h5 className="font-bold text-green-700 mt-6 mb-2">1. SERVICES TO BE PROVIDED</h5>
                <p className="mb-2">The Company agrees to provide credit repair services including:</p>
                <ul className="list-disc ml-6 mb-4 space-y-1">
                  <li>Comprehensive analysis of your credit reports from all three bureaus</li>
                  <li>Identification of inaccurate, unverifiable, or erroneous information</li>
                  <li>Preparation and submission of dispute letters</li>
                  <li>Monthly progress reports and updates</li>
                  <li>Access to client portal and ongoing support</li>
                </ul>

                <h5 className="font-bold text-green-700 mt-6 mb-2">2. FREE TRIAL PERIOD - 30 DAYS AT NO CHARGE</h5>
                <p className="mb-2"><strong>YOU ARE NOT BEING CHARGED FOR CREDIT REPAIR SERVICES.</strong> This agreement provides a <strong>30-day FREE TRIAL</strong> beginning from the date you sign.</p>
                <ul className="list-disc ml-6 mb-4 space-y-1">
                  <li>Full credit repair services at no charge during trial</li>
                  <li>No payment required for credit repair services</li>
                  <li>Cancel at any time for any reason with no obligation</li>
                </ul>

                <h5 className="font-bold text-green-700 mt-6 mb-2">3. SEPARATE SETUP SERVICES (ONE-TIME FEES)</h5>
                <p className="mb-2">The following setup services require separate payment:</p>
                <ul className="list-disc ml-6 mb-4 space-y-1">
                  <li><strong>Credit Report Purchase:</strong> $49.95 (one-time)</li>
                  <li><strong>Power of Attorney (E-Notary):</strong> $39.95 per individual (one-time)</li>
                </ul>

                <h5 className="font-bold text-green-700 mt-6 mb-2">4. YOUR SELECTED PACKAGE</h5>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p><strong>Package:</strong> {pkgDetails.name}</p>
                  <p><strong>Monthly Price (after trial):</strong> ${pkgDetails.price.toFixed(2)}/month</p>
                  <p><strong>Upfront Fees:</strong> Credit Report ($49.95) + E-Notary ($39.95) = $89.90</p>
                </div>

                <h5 className="font-bold text-green-700 mt-6 mb-2">5. YOUR CANCELLATION RIGHTS</h5>
                <p className="mb-2">Under the Credit Repair Organizations Act, you have the right to cancel within <strong>3 business days</strong>. However, Credlocity allows you to cancel <strong>at ANY TIME</strong>.</p>
                <p className="mb-4"><strong>How to Cancel:</strong> Email Admin@credlocity.com, call/text, or mail to 1500 Chestnut Street, Suite 2, Philadelphia, PA 19102</p>

                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 my-6">
                  <h5 className="font-bold text-yellow-700">⚠️ NOTICE OF CANCELLATION RIGHTS</h5>
                  <p className="mt-2"><strong>You may cancel this contract, without penalty or obligation, at any time.</strong></p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 my-6">
                  <h5 className="font-bold text-blue-800">🇺🇸 FEDERAL NOTICE OF RIGHT TO CANCEL</h5>
                  <p className="mt-2">You may cancel before midnight of <strong>{getFederalCancelDate()}</strong> (3 business days).</p>
                </div>

                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 my-6">
                  <h5 className="font-bold text-blue-800">📋 PENNSYLVANIA STATE NOTICE</h5>
                  <p className="mt-2">You may cancel before midnight of <strong>{getPACancelDate()}</strong> (5 days).</p>
                </div>

                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 my-6">
                  <h5 className="font-bold text-green-700">CLIENT ACKNOWLEDGMENT</h5>
                  <p className="mt-2">By signing below, I acknowledge that:</p>
                  <ul className="mt-2 space-y-1">
                    <li>✓ I have read and understand this entire agreement</li>
                    <li>✓ I am receiving a 30-day free trial of credit repair services</li>
                    <li>✓ I am NOT being charged for credit repair during the trial</li>
                    <li>✓ Setup services are separate one-time charges</li>
                    <li>✓ I can cancel at ANY TIME without penalty</li>
                  </ul>
                </div>

                <div className="bg-green-100 border-2 border-green-600 rounded-lg p-4 my-6">
                  <h5 className="font-bold text-green-800">✍️ DIGITAL SIGNATURE ACKNOWLEDGMENT</h5>
                  <p className="mt-2">My Information:</p>
                  <p><strong>Name:</strong> {fullName}</p>
                  <p><strong>IP Address:</strong> {userIP}</p>
                  <p><strong>Date:</strong> {formatDate(today)}</p>
                </div>

                <h5 className="font-bold text-gray-700 mt-6 mb-2">COMPANY INFORMATION</h5>
                <p><strong>Credlocity Business Group LLC</strong></p>
                <p>1500 Chestnut Street, Suite 2, Philadelphia, PA 19102</p>
                <p>Email: Admin@credlocity.com | Web: www.credlocity.com</p>
              </div>
              <div className="bg-gray-100 p-4">
                <p className="text-sm text-gray-600 text-center mb-2">Agreement Review Progress</p>
                <div className="h-2 bg-gray-300 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all" style={{ width: `${agreementData.scrollProgress}%` }} />
                </div>
                <p className="text-center font-bold text-green-600">{agreementData.scrollProgress}%</p>
              </div>
            </div>

            {/* Signature Section */}
            {agreementData.scrollProgress >= 95 && (
              <div className="border-2 rounded-xl p-6 mb-6 bg-gray-50">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Electronic Signature & Agreement</h4>
                <label className="flex items-start gap-3 p-4 bg-white rounded-lg border mb-4 cursor-pointer">
                  <input type="checkbox" checked={agreementData.accepted} onChange={(e) => setAgreementData({ ...agreementData, accepted: e.target.checked })} className="mt-1 w-5 h-5 accent-green-600" />
                  <span className="text-sm"><strong>I have read, understood, and agree to the terms of the Free Trial Credit Repair Service Agreement above.</strong> I acknowledge that I am receiving 30 days of free credit repair services and can cancel at any time.</span>
                </label>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Electronic Signature - Type your full legal name:</label>
                  <input type="text" value={agreementData.signature} onChange={(e) => setAgreementData({ ...agreementData, signature: e.target.value })} placeholder={`Type: ${fullName}`} className={`w-full px-4 py-3 border-2 rounded-xl font-serif text-lg focus:outline-none ${agreementData.signature.toLowerCase() === fullName.toLowerCase() ? 'border-green-500 bg-green-50' : agreementData.signature ? 'border-red-400' : 'border-gray-300'}`} />
                  {agreementData.signature && agreementData.signature.toLowerCase() !== fullName.toLowerCase() && <p className="text-red-500 text-sm mt-1">Signature must match: {fullName}</p>}
                  {agreementData.signature && agreementData.signature.toLowerCase() === fullName.toLowerCase() && <p className="text-green-600 text-sm mt-1">✓ Signature verified</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Today's Date:</label>
                  <input type="text" value={formatDate(today)} readOnly className="w-full px-4 py-3 border-2 rounded-xl bg-gray-100" />
                </div>
                <p className="text-xs text-gray-500 text-center">Your IP address ({userIP}) will be recorded for verification purposes</p>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
                  <p className="font-semibold">📧 What happens next?</p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• You'll receive a confirmation email with a copy of this agreement</li>
                    <li>• Your client portal credentials will be emailed to you</li>
                    <li>• Your 30-day free trial begins today</li>
                  </ul>
                  <div className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
                    <p className="font-semibold">📱 Your Direct Contact:</p>
                    <p className="text-2xl font-bold tracking-wider mt-1">(267) 225-3090</p>
                    <p className="text-sm mt-1 opacity-90">Call or text us anytime!</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 flex items-center"><ChevronLeft className="w-5 h-5 mr-1" /> Back</button>
              <button onClick={handleSubmit} disabled={!canProceed() || loading} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">{loading ? 'Submitting...' : 'Complete Agreement & Continue'} <ChevronRight className="w-5 h-5 ml-1" /></button>
            </div>
          </div>
        )}

        {/* Results Page */}
        {currentStep === 8 && result && (
          <div className="p-10 text-center">
            <div className="text-6xl mb-6">{result.icon}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{result.title}</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">{result.message}</p>
            <a href={result.redirectUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg transform hover:-translate-y-1 transition-all">
              {result.buttonText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientIntakeForm;
