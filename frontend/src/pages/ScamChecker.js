import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowRight, AlertTriangle, CheckCircle2, Shield, Scale, FileText, Search, XCircle, Copy, Trash2, Info, ExternalLink, Zap, Download, ChevronRight, Send, Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLeadCapture } from '../context/LeadCaptureContext';

const API = process.env.REACT_APP_BACKEND_URL;

/* ─────────────────────────────────────────
   RED FLAG PATTERN DATABASE
   ───────────────────────────────────────── */
const redFlagPatterns = [
  // Advance Fee / Upfront Charges
  {
    id: "advance-fee",
    category: "Illegal Fee",
    severity: "critical",
    law: "TSR §310.4(a)(2) & CROA §1679b(b)",
    patterns: [/(?:upfront|up-front|advance|initial|setup|set-up|enrollment|first.?work)\s*(?:fee|charge|cost|payment|deposit)/gi, /pay\s*(?:\w+\s*){0,3}(?:before|prior|first|now|today)\s*(?:\w+\s*){0,3}(?:start|begin|work)/gi, /(?:one.?time|first)\s*(?:\w+\s*){0,2}(?:fee|payment|charge)\s*(?:of\s*\$|\$)/gi, /(?:first\s*month|setup)\s*(?:is|will\s*be|costs?)\s*\$/gi, /(?:require|requires|needed|need)\s*(?:\w+\s*){0,3}(?:fee|payment|charge|deposit)/gi],
    title: "Advance Fee / Upfront Charge Detected",
    description: "Under the Telemarketing Sales Rule (TSR) and CROA, credit repair companies CANNOT charge fees before services are fully performed. Any upfront fee, setup fee, first work fee, or enrollment fee charged before disputes are completed is illegal.",
    action: "Report to the CFPB at consumerfinance.gov/complaint and the FTC at ReportFraud.ftc.gov. You may be entitled to a refund."
  },
  // Phone Enrollment
  {
    id: "phone-enrollment",
    category: "TSR Violation",
    severity: "critical",
    law: "TSR §310.4(a)(2)",
    patterns: [/(?:call|phone|dial|speak\s*(?:to|with))\s*(?:\S+\s*){0,6}(?:sign\s*up|enrol[l]?|get\s*started|begin)/gi, /(?:sign\s*up|enrol[l]?)\s*(?:\S+\s*){0,3}(?:phone|call|telephone)/gi, /(?:enrol[l]?(?:ment)?|sign.?up)\s*(?:\S+\s*){0,3}(?:phone|call|hotline)/gi, /(?:call\s*(?:us|now|today))\s*(?:\S+\s*){0,4}(?:to\s*(?:get|enrol|sign|start|begin))/gi],
    title: "Phone Enrollment Solicitation Detected",
    description: "The TSR prohibits credit repair companies from requesting or receiving payment for services sold via telemarketing before the services are fully performed. If a company enrolls you over the phone and charges any fee, that is a federal violation.",
    action: "Do not enroll over the phone. Legitimate companies like Credlocity operate through secure online platforms to comply with TSR."
  },
  // Guaranteed Results
  {
    id: "guaranteed-results",
    category: "Deceptive Practice",
    severity: "high",
    law: "CROA §1679b(a)(3)",
    patterns: [/guarant(?:ee|eed|ees?|eing)\s*(?:\w+\s*){0,3}(?:remov|delet|eliminat|improv|increas|rais|fix|clean|boost)/gi, /(?:100|hundred)\s*%?\s*(?:\w+\s*){0,2}(?:remov|delet|clean|success|guarant)/gi, /(?:all|every)\s*(?:negative|derogatory|bad)\s*(?:items?|marks?|entries?)\s*(?:\w+\s*){0,3}(?:remov|delet|gone|eliminat)/gi, /we\s*(?:will|can)\s*(?:definitely|certainly|absolutely|always)\s*(?:remov|delet|fix|clean)/gi, /guarant(?:ee|eed)\s*(?:to\s*)?(?:work|results?|success|improvement)/gi],
    title: "Guaranteed Results Promise Detected",
    description: "CROA explicitly prohibits credit repair companies from making any misleading statements. No company can guarantee specific credit repair results. The outcome depends on bureau investigations and the accuracy of the disputed information.",
    action: "Any company promising guaranteed removals is violating federal law. File a complaint with the FTC and your state AG."
  },
  // CPN / New Identity
  {
    id: "cpn-fraud",
    category: "Federal Crime",
    severity: "critical",
    law: "18 U.S.C. §1028 (Identity Fraud)",
    patterns: [/(?:cpn|credit\s*(?:privacy|protection)\s*(?:number|#))/gi, /(?:new|fresh|clean|second)\s*(?:credit\s*)?(?:identity|file|profile|number|ssn|social)/gi, /(?:replace|substitute|instead\s*of)\s*(?:your\s*)?(?:ssn|social\s*security)/gi, /(?:ein|employer\s*identification)\s*(?:for\s*)?(?:personal|credit)/gi],
    title: "Credit Privacy Number (CPN) / Identity Fraud Scheme Detected",
    description: "Selling or advising the use of a CPN, new SSN, or EIN for personal credit is federal identity fraud under 18 U.S.C. §1028. This can result in criminal prosecution for both the company AND the consumer who uses the fraudulent number.",
    action: "This is a federal crime. Report immediately to the FBI's Internet Crime Complaint Center (IC3) at ic3.gov and the FTC."
  },
  // No Contract
  {
    id: "no-contract",
    category: "CROA Violation",
    severity: "high",
    law: "CROA §1679d",
    patterns: [/(?:no|don'?t\s*need\s*(?:a|any)|without\s*(?:a|any))\s*(?:contract|agreement|paperwork|written)/gi, /(?:verbal|oral|handshake)\s*(?:agreement|deal|arrangement)/gi, /(?:sign|contract|agreement)\s*(?:is\s*)?(?:not\s*(?:needed|required|necessary)|optional)/gi],
    title: "Missing Written Contract Warning",
    description: "CROA requires credit repair companies to provide a written contract BEFORE performing any services. The contract must include: total cost, description of services, estimated timeline, your 3-day cancellation right, and the company's name and address.",
    action: "If no written contract was provided, all fees paid may be recoverable. The company is in violation of CROA §1679d."
  },
  // Pressure Tactics
  {
    id: "pressure-tactics",
    category: "Deceptive Practice",
    severity: "medium",
    law: "CROA §1679b(a) / FTC Act §5",
    patterns: [/(?:act\s*(?:now|fast|today|quickly|immediately)|(?:limited|special|exclusive)\s*(?:time|offer)|(?:offer|price|deal|rate)\s*(?:expires?|ends?|won'?t\s*last))/gi, /(?:only|just)\s*\d+\s*(?:spots?|slots?|seats?|positions?)\s*(?:left|available|remaining|open)/gi, /(?:today\s*only|act\s*before|expires?\s*(?:tonight|today|tomorrow|midnight))/gi, /(?:don'?t\s*(?:wait|miss|delay)|time\s*is\s*running\s*out|hurry)/gi],
    title: "High-Pressure Sales Tactics Detected",
    description: "Legitimate credit repair companies don't use urgency tactics. CROA gives you a 3-day right to cancel any contract. Companies using pressure to bypass your cooling-off period or rush you into paying are a red flag.",
    action: "Take your time. Research the company. If they can't wait 24 hours for your decision, they don't deserve your business."
  },
  // Telling You Not to Contact Bureaus
  {
    id: "bureau-block",
    category: "CROA Violation",
    severity: "high",
    law: "CROA §1679b(a)(1)",
    patterns: [/(?:don'?t|do\s*not|never|stop|avoid)\s*(?:contact|call|write|dispute|reach\s*out\s*to)\s*(?:the\s*)?(?:bureau|equifax|experian|transunion|credit\s*(?:report|agenc))/gi, /(?:let\s*us|we'?ll|leave\s*it\s*to\s*us|only\s*we\s*(?:can|should))\s*(?:handle|deal|contact|communicate)\s*(?:with\s*)?(?:the\s*)?(?:bureau|equifax|experian|transunion)/gi],
    title: "Restricting Your Bureau Contact Rights",
    description: "CROA makes it illegal for credit repair companies to advise you NOT to contact credit bureaus directly. You always have the right to dispute items yourself for free under FCRA §611.",
    action: "You always have the right to contact bureaus directly. Any company telling you otherwise is violating CROA."
  },
  // Unrealistic Timeline
  {
    id: "unrealistic-timeline",
    category: "Deceptive Marketing",
    severity: "medium",
    law: "CROA §1679b(a)(3) / FTC Act §5",
    patterns: [/(?:overnight|instant|immediate|same.?day|24.?hour|48.?hour|one\s*week|7.?day)\s*(?:credit\s*)?(?:repair|fix|improv|clean|boost|remov)/gi, /(?:fix|repair|clean|improve|boost)\s*(?:your\s*)?credit\s*(?:in|within)\s*(?:24|48|one|1|a\s*(?:few|couple))?\s*(?:hours?|days?|week)/gi, /(?:wipe|erase|clear)\s*(?:your\s*)?(?:credit|record|report|history)\s*(?:clean|completely|overnight)/gi],
    title: "Unrealistic Timeline Promises Detected",
    description: "Legitimate credit repair takes time — typically 3 to 6 months for meaningful results. Bureaus have 30-45 days to investigate each dispute. Any company promising overnight or instant results is being deceptive.",
    action: "Realistic timelines are 3-6 months. If it sounds too fast, it's likely a scam."
  },
  // Asking for SSN Inappropriately
  {
    id: "ssn-request",
    category: "Identity Risk",
    severity: "medium",
    law: "FTC Identity Theft Guidelines",
    patterns: [/(?:send|email|text|dm|message)\s*(?:us|me)\s*(?:your\s*)?(?:ssn|social\s*security|ss\s*#|social\s*#)/gi, /(?:need|require|give\s*(?:us|me))\s*(?:your\s*)?(?:full\s*)?(?:ssn|social\s*security)\s*(?:over|by|via|through)\s*(?:email|text|phone|dm|message|chat)/gi],
    title: "Insecure SSN Request Detected",
    description: "Legitimate companies use secure, encrypted portals for sensitive information. If a company asks for your Social Security number via email, text, DM, or unsecured channels, your identity is at risk.",
    action: "Never share your SSN over email, text, or phone. Only use secure, encrypted online portals."
  },
  // Money-Back Refusal
  {
    id: "no-refund",
    category: "Consumer Risk",
    severity: "medium",
    law: "CROA §1679e (3-Day Cancellation Right)",
    patterns: [/(?:no|non)\s*(?:refund|money.?back|cancellation|return)/gi, /(?:all\s*(?:sales?|fees?|payments?)\s*(?:are\s*)?(?:final|non.?refundable))/gi, /(?:cannot|can'?t|won'?t|will\s*not)\s*(?:be\s*)?(?:refund|return|give\s*back)/gi],
    title: "No-Refund / Non-Refundable Policy Detected",
    description: "CROA grants you a mandatory 3-day right to cancel any credit repair contract and receive a full refund. Companies that deny this right are violating federal law. Additionally, Credlocity offers a 180-day money-back guarantee — the industry's strongest.",
    action: "If within 3 days, demand your refund citing CROA §1679e. Beyond 3 days, file a chargeback with your bank if services weren't delivered."
  }
];

const severityConfig = {
  critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-600", badgeText: "CRITICAL" },
  high: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", badge: "bg-orange-500", badgeText: "HIGH RISK" },
  medium: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", badge: "bg-amber-500", badgeText: "WARNING" }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I know if a credit repair company is a scam?", "acceptedAnswer": { "@type": "Answer", "text": "Key red flags include: charging upfront fees before work is done (illegal under TSR and CROA), guaranteeing specific results, offering CPNs or new credit identities (federal crime), enrolling clients over the phone and charging fees, using high-pressure sales tactics, and refusing to provide written contracts. Use Credlocity's free Scam Checker tool to analyze any communication from a credit repair company." }},
    { "@type": "Question", "name": "Is it illegal for credit repair companies to charge upfront fees?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Under both the Telemarketing Sales Rule (TSR) and the Credit Repair Organizations Act (CROA), credit repair companies cannot charge fees before the promised services are fully performed. This includes setup fees, enrollment fees, first work fees, and any other charge collected before disputes are completed." }},
    { "@type": "Question", "name": "What laws protect consumers from credit repair scams?", "acceptedAnswer": { "@type": "Answer", "text": "The Credit Repair Organizations Act (CROA) requires written contracts, prohibits advance fees, guarantees a 3-day cancellation right, and bans deceptive practices. The Telemarketing Sales Rule (TSR) prohibits charging for telemarketed credit repair before services are performed. The Fair Credit Reporting Act (FCRA) gives you the right to dispute inaccurate items for free. The FTC Act prohibits deceptive advertising." }},
    { "@type": "Question", "name": "Can I check if a credit repair company is legitimate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Check the BBB (bbb.org) for their rating and complaints. Search the CFPB complaint database. Verify they have a physical address and business registration. Look for independent reviews on Trustpilot, Yelp, and Google. Confirm they offer written contracts and don't charge upfront fees. Credlocity maintains an A+ BBB rating with zero complaints since 2008." }},
    { "@type": "Question", "name": "What should I do if I've been scammed by a credit repair company?", "acceptedAnswer": { "@type": "Answer", "text": "Take these steps: 1) Request a refund in writing citing your CROA rights. 2) File a credit card chargeback if you paid by card. 3) File complaints with the CFPB (consumerfinance.gov), FTC (ReportFraud.ftc.gov), your state Attorney General, and the BBB. 4) Consider switching to Credlocity — we'll help you fight to recover illegal fees from your previous company and beat their price by 5%." }}
  ]
};

const ScamChecker = () => {
  const [inputText, setInputText] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const { openFreeTrial } = useLeadCapture();

  const results = useMemo(() => {
    if (!inputText.trim()) return [];
    const findings = [];
    const seen = new Set();

    for (const rule of redFlagPatterns) {
      for (const pattern of rule.patterns) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        while ((match = regex.exec(inputText)) !== null) {
          if (!seen.has(rule.id)) {
            seen.add(rule.id);
            findings.push({
              ...rule,
              matchedText: match[0],
              matchIndex: match.index
            });
          }
        }
      }
    }

    return findings.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 };
      return (order[a.severity] || 3) - (order[b.severity] || 3);
    });
  }, [inputText]);

  const handleCheck = () => setHasChecked(true);
  const handleClear = () => { setInputText(''); setHasChecked(false); };

  const riskScore = results.reduce((sum, r) => sum + (r.severity === 'critical' ? 3 : r.severity === 'high' ? 2 : 1), 0);
  const riskLevel = riskScore === 0 ? 'low' : riskScore <= 2 ? 'moderate' : riskScore <= 5 ? 'high' : 'critical';

  const sampleTexts = [
    { label: "Advance fee email", text: "Thank you for choosing CreditFix Pro! To get started, we require an initial setup fee of $199.95. This one-time enrollment fee covers your first work and credit analysis. Please pay now so we can begin working on your file immediately. Call us at 1-800-555-0100 to enroll over the phone today!" },
    { label: "CPN scam pitch", text: "Tired of bad credit? We can get you a brand new credit identity with a Credit Privacy Number (CPN). This new number replaces your Social Security Number on credit applications and gives you a fresh clean credit file. 100% guaranteed to work! We can erase all your negative items overnight. Act now — limited spots available!" },
    { label: "Pressure tactics", text: "URGENT: This exclusive offer expires tonight at midnight! We guarantee to remove all negative items from your credit report within 7 days. Only 3 spots left for our special $499 flat rate program. Don't wait — act now before this deal is gone! All sales are final and non-refundable. Send us your SSN via email to get started." }
  ];

  return (
    <>
      <Helmet>
        <title>Free Credit Repair Scam Checker Tool | Analyze Emails & Contracts | Credlocity</title>
        <meta name="description" content="Free tool to check if a credit repair company is a scam. Paste any email, contract, or ad and get instant analysis of red flags — illegal fees, false promises, TSR/CROA violations, and more." />
        <meta property="og:title" content="Free Credit Repair Scam Checker | Credlocity" />
        <meta property="og:description" content="Paste text from any credit repair company and instantly detect illegal fees, false promises, and federal law violations." />
        <link rel="canonical" href="https://www.credlocity.com/scam-checker" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-16 md:py-20" data-testid="scam-checker-hero">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <p className="text-sm uppercase tracking-wider text-green-300 mb-3 font-medium">Free Consumer Protection Tool</p>
          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" data-testid="scam-checker-h1">
            Credit Repair Scam Checker
          </h1>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Paste any email, contract, advertisement, or message from a credit repair company. Our tool instantly
            analyzes the text for red flags — including illegal fees, deceptive promises, and federal law violations.
          </p>
        </div>
      </section>

      {/* Checker Tool */}
      <section className="py-12 bg-gray-50" data-testid="checker-tool-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Input Area */}
            <div className="p-6 md:p-8 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Paste Text to Analyze
              </label>
              <textarea
                data-testid="scam-checker-input"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm min-h-[180px] focus:ring-2 focus:ring-primary-blue focus:border-primary-blue resize-y font-mono"
                value={inputText}
                onChange={e => { setInputText(e.target.value); if (hasChecked) setHasChecked(false); }}
                placeholder="Paste an email, contract clause, advertisement, or any text from a credit repair company here..."
              />
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                <div className="flex items-center gap-2">
                  <Button onClick={handleCheck} disabled={!inputText.trim()} data-testid="check-btn">
                    <Search className="w-4 h-4 mr-2" /> Check for Red Flags
                  </Button>
                  {inputText && (
                    <Button variant="outline" onClick={handleClear} data-testid="clear-btn">
                      <Trash2 className="w-4 h-4 mr-2" /> Clear
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400">{inputText.length} characters | {inputText.split(/\s+/).filter(w => w).length} words</p>
              </div>
            </div>

            {/* Sample Texts */}
            {!inputText && (
              <div className="px-6 md:px-8 py-4 bg-gray-50 border-b" data-testid="sample-texts">
                <p className="text-xs text-gray-500 font-medium mb-2">Try a sample to see how it works:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInputText(s.text); setHasChecked(false); }}
                      className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-primary-blue hover:text-primary-blue transition-colors"
                      data-testid={`sample-btn-${i}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {hasChecked && (
              <div className="p-6 md:p-8" data-testid="checker-results">
                {/* Risk Score */}
                <div className={`rounded-xl p-5 mb-6 text-center ${
                  riskLevel === 'critical' ? 'bg-red-100 border-2 border-red-300' :
                  riskLevel === 'high' ? 'bg-orange-100 border-2 border-orange-300' :
                  riskLevel === 'moderate' ? 'bg-amber-100 border-2 border-amber-300' :
                  'bg-green-100 border-2 border-green-300'
                }`} data-testid="risk-score">
                  <p className="text-xs uppercase tracking-wide font-medium mb-1 opacity-70">Risk Assessment</p>
                  <p className={`text-2xl md:text-3xl font-bold ${
                    riskLevel === 'critical' ? 'text-red-700' :
                    riskLevel === 'high' ? 'text-orange-700' :
                    riskLevel === 'moderate' ? 'text-amber-700' :
                    'text-green-700'
                  }`} data-testid="risk-level">
                    {riskLevel === 'critical' ? 'CRITICAL RISK — Likely Scam' :
                     riskLevel === 'high' ? 'HIGH RISK — Multiple Red Flags' :
                     riskLevel === 'moderate' ? 'MODERATE RISK — Proceed with Caution' :
                     'LOW RISK — No Major Red Flags Detected'}
                  </p>
                  <p className="text-sm mt-1 opacity-70">
                    {results.length} red flag{results.length !== 1 ? 's' : ''} detected
                    {results.length === 0 && ' — but always verify with BBB and CFPB before committing'}
                  </p>
                </div>

                {/* Individual Findings */}
                {results.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> Detailed Findings
                    </h3>
                    {results.map((r, i) => {
                      const config = severityConfig[r.severity];
                      return (
                        <div key={i} className={`${config.bg} ${config.border} border rounded-xl p-5`} data-testid={`finding-${r.id}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-semibold ${config.text} flex items-center gap-2`}>
                              <XCircle className="w-4 h-4 flex-shrink-0" /> {r.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className={`${config.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{config.badgeText}</span>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{r.category}</span>
                            </div>
                          </div>
                          <div className="bg-white/50 rounded-lg px-3 py-2 mb-3 border border-white">
                            <p className="text-xs text-gray-500 font-medium mb-1">Matched text:</p>
                            <p className="text-sm font-mono text-red-700 font-medium">"{r.matchedText}"</p>
                          </div>
                          <p className="text-sm leading-relaxed mb-3 opacity-90">{r.description}</p>
                          <div className="flex items-start gap-2 text-xs opacity-80">
                            <Scale className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span><strong>Law:</strong> {r.law}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs opacity-80 mt-1">
                            <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span><strong>Action:</strong> {r.action}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">No obvious red flags detected in this text.</p>
                    <p className="text-xs text-gray-400">This doesn't guarantee the company is legitimate. Always check their BBB rating, CFPB complaints, and verify they provide a written contract before paying.</p>
                  </div>
                )}

                {/* Next Steps */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">Recommended Next Steps</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Link to="/switch" className="p-3 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-all group" data-testid="next-step-switch">
                      <p className="text-xs font-semibold text-green-700 group-hover:text-green-800">Switch & Save 5%</p>
                      <p className="text-[11px] text-green-600">We'll beat their price + help recover illegal fees</p>
                    </Link>
                    <Link to="/credit-repair-reviews" className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-all group" data-testid="next-step-compare">
                      <p className="text-xs font-semibold text-blue-700 group-hover:text-blue-800">Compare Companies</p>
                      <p className="text-[11px] text-blue-600">See how they stack up against Credlocity</p>
                    </Link>
                    <Link to="/30-day-free-trial" className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-all group" data-testid="next-step-trial">
                      <p className="text-xs font-semibold text-purple-700 group-hover:text-purple-800">Start Free Trial</p>
                      <p className="text-[11px] text-purple-600">30 days free, 180-day guarantee</p>
                    </Link>
                  </div>
                </div>

                {/* File a Complaint — appears when violations found */}
                {results.length > 0 && (
                  <ComplaintGenerator violations={results} />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Check For */}
      <section className="py-12 bg-white" data-testid="what-we-check-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-2">What This Tool Checks For</h2>
          <p className="text-gray-600 mb-8">Our scam checker analyzes text against 10 categories of red flags based on federal consumer protection laws.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {redFlagPatterns.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${r.severity === 'critical' ? 'bg-red-500' : r.severity === 'high' ? 'bg-orange-500' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.title.replace(' Detected', '').replace(' Warning', '')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.law}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50" data-testid="scam-checker-faq-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6" data-testid={`scam-faq-${i}`}>
                <h3 className="font-semibold text-gray-900 mb-3 text-base">{faq.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Links */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-xl font-bold text-primary-blue mb-6">Related Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: "/credit-repair-scams", label: "Common Credit Repair Scams" },
              { to: "/switch", label: "Switch & Save 5%" },
              { to: "/credit-repair-reviews", label: "Company Reviews & Comparisons" },
              { to: "/tsr-compliance", label: "TSR Compliance" },
              { to: "/fcra-guide", label: "Your FCRA Rights" },
              { to: "/free-letters", label: "Free Dispute Letters" },
              { to: "/education-hub", label: "Credit Education Hub" },
              { to: "/how-it-works", label: "How Credlocity Works" }
            ].map((link, i) => (
              <Link key={i} to={link.to} className="p-3 bg-gray-50 rounded-lg border hover:border-primary-blue hover:shadow-sm transition-all text-xs font-medium text-gray-700 hover:text-primary-blue flex items-center gap-2">
                <ArrowRight className="w-3 h-3 flex-shrink-0" /> {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary text-white text-center" data-testid="scam-checker-cta">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Choose a Company You Can Trust</h2>
          <p className="text-lg text-gray-200 mb-4 leading-relaxed">
            Credlocity: A+ BBB rating, zero complaints since 2008, 30-day free trial, 180-day money-back guarantee,
            and 100% TSR/CROA/FCRA compliant. No illegal fees. No false promises. Just real results.
          </p>
          <p className="text-green-300 font-semibold mb-8">79,000+ clients | 236-point average score increase</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10" onClick={openFreeTrial} data-testid="scam-checker-bottom-cta">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/switch">Switch & Save 5%</Link>
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            <Link to="/tsr-compliance" className="underline hover:text-white">TSR Compliance</Link> |{' '}
            <Link to="/credit-repair-scams" className="underline hover:text-white">Scam Guide</Link> |{' '}
            <Link to="/credit-repair-reviews" className="underline hover:text-white">Company Reviews</Link>
          </p>
        </div>
      </section>
    </>
  );
};

/* ─────────────────────────────────────────
   COMPLAINT LETTER GENERATOR COMPONENT
   ───────────────────────────────────────── */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
];

const AGENCY_INFO = {
  cfpb: {
    name: "CFPB",
    fullName: "Consumer Financial Protection Bureau",
    description: "The CFPB enforces the CROA and TSR. They will forward your complaint to the company and require a response within 15 days.",
    online: "consumerfinance.gov/complaint",
    color: "blue",
    icon: Shield,
  },
  ftc: {
    name: "FTC",
    fullName: "Federal Trade Commission",
    description: "The FTC investigates patterns of fraud. Your report helps build cases against scam companies and protects other consumers.",
    online: "ReportFraud.ftc.gov",
    color: "green",
    icon: Scale,
  },
  attorney_general: {
    name: "State AG",
    fullName: "State Attorney General",
    description: "Your state AG's Consumer Protection Division can investigate, issue cease and desist orders, and seek restitution.",
    online: "naag.org/find-my-ag",
    color: "purple",
    icon: Building2,
  },
};

const ComplaintGenerator = ({ violations }) => {
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '', state: '', zip_code: '',
    company_name: '', company_website: '',
    amount_paid: '', description_of_events: '',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGenerate = async (agencyKey) => {
    const required = ['first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'email'];
    const missing = required.filter(f => !form[f]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      return;
    }
    if (!form.company_name.trim()) {
      toast.error('Please enter the company name you are reporting');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        ...form,
        agency: agencyKey,
        violations: violations.map(v => ({
          title: v.title,
          law: v.law,
          matched_text: v.matchedText,
          description: v.description,
          category: v.category,
        })),
      };

      const res = await fetch(`${API}/api/complaint-letters/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Generation failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaint_${agencyKey}_${form.last_name || 'letter'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const agencyName = AGENCY_INFO[agencyKey]?.fullName || agencyKey;
      toast.success(`${agencyName} complaint letter downloaded! Sign it, date it, and send via Certified Mail.`, { duration: 6000 });
    } catch (err) {
      toast.error(err.message);
    }
    setGenerating(false);
  };

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', hover: 'hover:border-blue-400', active: 'bg-blue-100 border-blue-400' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', hover: 'hover:border-green-400', active: 'bg-green-100 border-green-400' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', hover: 'hover:border-purple-400', active: 'bg-purple-100 border-purple-400' },
  };

  return (
    <div className="mt-6 pt-6 border-t-2 border-red-200" data-testid="complaint-generator">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="font-bold text-gray-900">File a Formal Complaint</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Based on the violations detected, we've pre-filled complaint letters for you. Choose an agency below, fill in your details, and download a ready-to-send letter.
      </p>

      {/* Agency Selection Cards */}
      <div className="grid md:grid-cols-3 gap-3 mb-5">
        {Object.entries(AGENCY_INFO).map(([key, agency]) => {
          const c = colorMap[agency.color];
          const isSelected = selectedAgency === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedAgency(isSelected ? null : key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? c.active : `${c.bg} ${c.border} ${c.hover}`}`}
              data-testid={`agency-card-${key}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <agency.icon className={`w-4 h-4 ${c.text}`} />
                <span className={`text-sm font-bold ${c.text}`}>{agency.name}</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{agency.description}</p>
              <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {agency.online}
              </p>
            </button>
          );
        })}
      </div>

      {/* Complaint Form — shown when agency selected */}
      {selectedAgency && (
        <div className="bg-gray-50 border rounded-xl p-5 space-y-4" data-testid="complaint-form" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              {AGENCY_INFO[selectedAgency].fullName} Complaint Letter
            </h4>
            <button onClick={() => setSelectedAgency(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Violations Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Violations to be reported ({violations.length}):</p>
            <ul className="space-y-1">
              {violations.map((v, i) => (
                <li key={i} className="text-[11px] text-red-800 flex items-start gap-1">
                  <XCircle className="w-3 h-3 shrink-0 mt-0.5" /> <span>{v.title} — <em>{v.law}</em></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Your Info */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Your Information</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="First Name *" value={form.first_name} onChange={e => update('first_name', e.target.value)} data-testid="complaint-first-name" />
              <Input placeholder="Last Name *" value={form.last_name} onChange={e => update('last_name', e.target.value)} data-testid="complaint-last-name" />
              <Input placeholder="Email *" type="email" value={form.email} onChange={e => update('email', e.target.value)} data-testid="complaint-email" />
              <Input placeholder="Phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
              <Input placeholder="Street Address *" value={form.address} onChange={e => update('address', e.target.value)} className="col-span-2" data-testid="complaint-address" />
              <Input placeholder="City *" value={form.city} onChange={e => update('city', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <select className="border rounded-md px-2 py-2 text-sm" value={form.state} onChange={e => update('state', e.target.value)} data-testid="complaint-state">
                  <option value="">State *</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input placeholder="Zip *" value={form.zip_code} onChange={e => update('zip_code', e.target.value)} data-testid="complaint-zip" />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Company You Are Reporting</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Company Name *" value={form.company_name} onChange={e => update('company_name', e.target.value)} data-testid="complaint-company-name" />
              <Input placeholder="Company Website (optional)" value={form.company_website} onChange={e => update('company_website', e.target.value)} />
              <Input placeholder="Amount Paid (if any)" value={form.amount_paid} onChange={e => update('amount_paid', e.target.value)} />
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Additional Details (Optional)</p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm min-h-[80px] resize-y"
              placeholder="Describe what happened in your own words — when you contacted them, what they promised, how they charged you..."
              value={form.description_of_events}
              onChange={e => update('description_of_events', e.target.value)}
              data-testid="complaint-description"
            />
          </div>

          {/* Generate Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
            <Button
              onClick={() => handleGenerate(selectedAgency)}
              disabled={generating}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              data-testid="generate-complaint-btn"
            >
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Generate {AGENCY_INFO[selectedAgency].name} Complaint Letter</>
              )}
            </Button>
            <a
              href={selectedAgency === 'cfpb' ? 'https://www.consumerfinance.gov/complaint/' : selectedAgency === 'ftc' ? 'https://reportfraud.ftc.gov/' : 'https://www.naag.org/find-my-ag/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <ExternalLink className="w-3 h-3" /> File Online Instead
            </a>
          </div>

          <p className="text-[10px] text-gray-400 flex items-start gap-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            Print, sign, and date the letter. Send via USPS Certified Mail, Return Receipt Requested for a legal paper trail. You may also file directly online at the agency's website.
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ScamChecker;
