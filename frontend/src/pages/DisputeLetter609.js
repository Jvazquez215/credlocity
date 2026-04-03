import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Scale,
  FileText, AlertTriangle, Shield, BookOpen, Send, Clock,
  XCircle, Info, ChevronRight, Lightbulb, Target, Zap
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { TrialButton } from '../components/LeadButtons';

const SECTIONS_609 = [
  {
    id: 'what-is',
    title: 'What Is a 609 Dispute Letter?',
    content: `A 609 dispute letter refers to Section 609 of the Fair Credit Reporting Act (FCRA), codified as 15 U.S.C. § 1681g. This section gives every consumer the right to request disclosure of all information in their credit file from any consumer reporting agency (CRA).

When you send a "609 letter," you are exercising your legal right to demand that the credit bureau provide you with complete and accurate information about what is in your file — including the sources of that information. If the bureau cannot verify the accuracy of an item or provide documentation supporting it, the item must be removed from your report under Section 611 of the FCRA.

The 609 letter is NOT a magic loophole or secret hack. It is simply a formal exercise of your rights under federal law. When used correctly alongside other dispute strategies, it can be a powerful tool for cleaning up your credit report.`
  },
  {
    id: 'legal-text',
    title: 'What Does Section 609 Actually Say?',
    content: `Section 609(a)(1) of the FCRA states:

"Every consumer reporting agency shall, upon request, and subject to section 1681h(a)(1) of this title, clearly and accurately disclose to the consumer — All information in the consumer's file at the time of the request."

This means the bureau MUST disclose:
• All information in your file
• The sources of that information
• Each person who procured a consumer report (inquiries) in the past year (2 years for employment)
• The dates, original payees, and amounts of any checks upon which any adverse information is based

This is YOUR legal right. You do not need to pay anyone to exercise it.`
  },
  {
    id: 'how-it-works',
    title: 'How Does a 609 Letter Work?',
    content: `When you send a 609 letter, you are asking the credit bureau to provide verifiable proof that the information on your report is accurate and belongs to you. Here is the process:

1. You identify negative items on your credit report that you believe are inaccurate, unverifiable, or outdated.

2. You write a formal letter to the credit bureau (Equifax, Experian, or TransUnion) citing Section 609 of the FCRA and requesting verification of specific items.

3. You include copies (not originals) of your government-issued ID and proof of address to verify your identity.

4. You send the letter via certified mail with return receipt requested so you have proof of delivery.

5. The bureau has 30 days (or 45 days if you provide additional information during the investigation) to investigate and respond.

6. If the bureau cannot verify the item with the original data furnisher, the item must be removed from your report under Section 611(a)(5)(A).

The key is specificity — identify exact accounts, provide your reasoning, and cite the relevant law.`
  },
  {
    id: 'when-to-use',
    title: 'When Should You Use a 609 Letter?',
    content: `A 609 letter is most effective in these situations:

GOOD candidates for a 609 dispute:
• Accounts you do not recognize or that may belong to someone else
• Collection accounts where the original creditor has gone out of business
• Old debts that have been sold multiple times between collectors
• Items with incorrect balances, dates, or account numbers
• Accounts opened through identity theft or fraud
• Items where the data furnisher may not have proper documentation

LESS effective for:
• Legitimate debts you know are accurate and current
• Items already verified in a previous dispute
• Information that you previously agreed to (signed contracts with clear records)

Remember: 609 is about requesting disclosure and verification. If the information IS accurate and the bureau CAN verify it, it will remain on your report. The power of 609 is that many data furnishers — especially old collection agencies and debt buyers — simply do not have the original documentation to verify.`
  }
];

const COMPARISON = [
  {
    section: 'Section 609',
    title: 'Right to Disclosure',
    law: '15 U.S.C. § 1681g',
    desc: 'Demands the bureau disclose all information in your file and the sources of that information. If they cannot provide verifiable documentation, the item is subject to removal.',
    best: 'Requesting verification of specific accounts, especially old or transferred debts.'
  },
  {
    section: 'Section 611',
    title: 'Right to Dispute',
    law: '15 U.S.C. § 1681i',
    desc: 'Requires the bureau to investigate disputed information within 30 days. If unverified, it must be deleted. This is the general dispute mechanism.',
    best: 'Disputing any item you believe is inaccurate — the standard dispute process.'
  },
  {
    section: 'Section 623',
    title: 'Furnisher Obligations',
    law: '15 U.S.C. § 1681s-2',
    desc: 'Requires data furnishers (creditors, collectors) to investigate disputes forwarded by the bureaus and correct or delete inaccurate information.',
    best: 'Going directly to the creditor/collector after a bureau dispute fails.'
  }
];

const MYTHS = [
  { myth: '609 letters can remove ANY item from your credit report.', fact: '609 letters can only force removal of items the bureau CANNOT verify. Accurate, verifiable information will remain.' },
  { myth: 'Section 609 is a secret loophole the bureaus do not want you to know about.', fact: 'Section 609 is public federal law. It is printed in the FCRA, available on government websites, and well-known in the credit industry.' },
  { myth: 'You need to pay a company to send a 609 letter for you.', fact: 'You can write and send a 609 letter yourself for free. Templates are widely available, including on our Free Letters page.' },
  { myth: '609 letters work 100% of the time.', fact: 'Success depends on whether the bureau can verify the disputed information. Well-documented, accurate accounts will survive a 609 dispute.' },
  { myth: 'One 609 letter will fix your entire credit report.', fact: 'Credit repair is a process. You may need multiple letters, different strategies (609, 611, 623), and persistence over weeks or months.' },
];

const LETTER_COMPONENTS = [
  { title: 'Your Personal Information', desc: 'Full legal name, current address, Social Security Number (last 4 digits), and date of birth.' },
  { title: 'Bureau Address', desc: 'The correct mailing address for the bureau you are writing to (Equifax, Experian, or TransUnion dispute centers).' },
  { title: 'Section 609 Citation', desc: 'Explicitly cite "Section 609 of the Fair Credit Reporting Act, 15 U.S.C. § 1681g" as the legal basis for your request.' },
  { title: 'Specific Account Details', desc: 'List each account you are disputing with the account number, creditor name, and the specific reason you are disputing it.' },
  { title: 'Request for Verification', desc: 'Clearly state that you are requesting the bureau provide verifiable proof that this information is accurate and belongs to you.' },
  { title: 'Identity Documents', desc: 'Include copies of your government-issued photo ID and a recent utility bill or bank statement as proof of address.' },
  { title: 'Certified Mail', desc: 'Send via USPS Certified Mail with Return Receipt Requested. Keep your receipt as proof of delivery and the date sent.' }
];

const FAQS = [
  { q: 'Is a 609 letter the same as a regular dispute letter?', a: 'Not exactly. A regular dispute letter typically invokes Section 611 of the FCRA and asks the bureau to investigate an item you believe is inaccurate. A 609 letter specifically invokes your right to disclosure under Section 609 — demanding the bureau prove they have verifiable documentation for the disputed item. Both can result in removal, but they approach it from different legal angles. The most effective strategy often combines both.' },
  { q: 'How long does the bureau have to respond?', a: 'Under the FCRA, the bureau must complete its investigation within 30 days of receiving your dispute. If you provide additional information during the investigation, they may extend this to 45 days. If they fail to respond within this timeframe, the item must be removed.' },
  { q: 'Can I send a 609 letter for all three bureaus at once?', a: 'Yes, but you should send separate letters to each bureau (Equifax, Experian, and TransUnion) since each maintains its own file on you. An item may appear on one, two, or all three reports, and each bureau must independently verify the information.' },
  { q: 'What happens if the bureau verifies the item?', a: 'If the bureau verifies the item and it remains on your report, you can: (1) request the method of verification under Section 611(a)(6)(B)(iii), (2) send a follow-up dispute with additional evidence, (3) go directly to the data furnisher under Section 623, or (4) add a 100-word consumer statement to your file explaining your dispute.' },
  { q: 'Do I need a lawyer to send a 609 letter?', a: 'No. You have the legal right to dispute items on your credit report yourself. However, if you have complex issues (identity theft, multiple lawsuits, FCRA violations by a bureau), consulting with a consumer rights attorney may be beneficial. Credlocity also offers free dispute letter templates you can customize and send on your own.' },
  { q: 'Can 609 letters remove accurate information?', a: 'Technically, if the bureau cannot verify the information — even if it was originally accurate — the item must be removed. This often happens with old accounts where the original creditor has gone out of business, sold the debt multiple times, or simply does not respond to the bureau verification request within 30 days.' },
];

const BUREAU_ADDRESSES = [
  { name: 'Equifax', address: 'P.O. Box 740256, Atlanta, GA 30374-0256', online: 'equifax.com/personal/disputes' },
  { name: 'Experian', address: 'P.O. Box 4500, Allen, TX 75013', online: 'experian.com/disputes' },
  { name: 'TransUnion', address: 'P.O. Box 2000, Chester, PA 19016', online: 'transunion.com/disputes' },
];

const DisputeLetter609 = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [openMyth, setOpenMyth] = useState(null);
  const [activeSection, setActiveSection] = useState('what-is');

  useSEO({
    title: '609 Dispute Letter: What It Is, How to Write One, and Does It Work? | Credlocity',
    description: 'Learn everything about Section 609 of the FCRA. Understand what a 609 dispute letter is, how to write one, when to use it, and access free customizable templates.',
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>609 Dispute Letter: Complete Guide + Free Templates | Credlocity</title>
        <meta name="description" content="Learn everything about 609 dispute letters under the FCRA. What Section 609 says, how to write a 609 letter, myths vs facts, and free customizable dispute letter templates." />
        <link rel="canonical" href="https://credlocity.com/609-dispute-letter" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "609 Dispute Letter: Complete Guide",
          "author": { "@type": "Organization", "name": "Credlocity" },
          "publisher": { "@type": "Organization", "name": "Credlocity" },
          "description": "Comprehensive guide to Section 609 of the FCRA, including how to write a 609 dispute letter, when to use it, and free templates."
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
        })}</script>
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section className="relative bg-primary-blue text-white overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.3),transparent_70%)]" />
        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <Scale className="w-4 h-4 text-yellow-300" />
            <span>Fair Credit Reporting Act — 15 U.S.C. § 1681g</span>
          </div>
          <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="page-title">
            The 609 Dispute Letter
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Section 609 of the FCRA — what it says, 
            how to use it, when it works, and how to write your own dispute letter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-8 py-6" asChild>
              <Link to="/free-letters" data-testid="hero-cta-letters">
                Get Free Dispute Templates <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/30 text-lg px-8 py-6" asChild>
              <a href="#how-to-write" data-testid="hero-cta-guide">
                Read the Guide <BookOpen className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ TABLE OF CONTENTS ═══ */}
      <section className="py-6 bg-gray-50 border-b sticky top-0 z-20" data-testid="toc">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'what-is', label: 'What Is It?' },
              { id: 'legal-text', label: 'Legal Text' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'when-to-use', label: 'When to Use' },
              { id: 'how-to-write', label: 'How to Write' },
              { id: 'myths', label: 'Myths vs Facts' },
              { id: '609-vs-611', label: '609 vs 611 vs 623' },
              { id: 'faq', label: 'FAQs' }
            ].map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeSection === item.id ? 'bg-primary-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT SECTIONS ═══ */}
      <section className="py-16 bg-white" data-testid="main-content">
        <div className="container mx-auto px-4 max-w-3xl">
          {SECTIONS_609.map((section) => (
            <div key={section.id} id={section.id} className="mb-16 scroll-mt-24">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-primary-blue mb-6">{section.title}</h2>
              <div className="prose prose-gray max-w-none">
                {section.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('"') || para.startsWith("'")) {
                    return (
                      <blockquote key={i} className="border-l-4 border-primary-blue bg-blue-50 p-5 rounded-r-xl my-6 text-gray-700 italic text-sm leading-relaxed">
                        {para}
                      </blockquote>
                    );
                  }
                  if (para.includes('•')) {
                    const lines = para.split('\n');
                    const title = lines[0].endsWith(':') ? lines[0] : null;
                    const items = lines.filter(l => l.startsWith('•'));
                    return (
                      <div key={i} className="my-4">
                        {title && <p className="font-semibold text-gray-900 mb-2">{title}</p>}
                        <ul className="space-y-2">
                          {items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-secondary-green mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item.replace('• ', '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  if (para.startsWith('GOOD') || para.startsWith('LESS')) {
                    const isGood = para.startsWith('GOOD');
                    return (
                      <div key={i} className={`p-4 rounded-xl my-4 ${isGood ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <p className={`font-semibold mb-2 ${isGood ? 'text-green-800' : 'text-amber-800'}`}>
                          {isGood ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}
                          {para.split('\n')[0]}
                        </p>
                        <ul className="space-y-1 ml-6">
                          {para.split('\n').filter(l => l.startsWith('•')).map((item, j) => (
                            <li key={j} className="text-sm text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  if (/^\d\./.test(para)) {
                    return (
                      <div key={i} className="my-4 pl-4 border-l-2 border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{para}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>;
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FREE LETTERS CTA (MID-PAGE) ═══ */}
      <section className="py-12 bg-gray-50" data-testid="free-letters-cta-mid">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-blue via-primary-blue/95 to-primary-blue/85 text-white p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-cinzel text-2xl md:text-3xl font-bold mb-2">Want a Custom Free Letter?</h3>
                <p className="text-gray-200 text-sm md:text-base max-w-xl">
                  Browse our collection of professionally written dispute letter templates. Fill in your details, generate a personalized PDF, and mail it — all 100% free, no signup required.
                </p>
              </div>
              <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8 whitespace-nowrap flex-shrink-0" asChild>
                <Link to="/free-letters" className="inline-flex items-center gap-2" data-testid="free-letters-btn-mid">
                  Browse Free Letters <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW TO WRITE A 609 LETTER ═══ */}
      <section id="how-to-write" className="py-20 bg-white scroll-mt-24" data-testid="how-to-write">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4 text-center">How to Write a 609 Dispute Letter</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">Every effective 609 letter includes these seven components.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {LETTER_COMPONENTS.map((comp, i) => (
              <Card key={i} className="border border-gray-200 hover:shadow-md transition-shadow" data-testid={`component-${i}`}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-blue text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{comp.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{comp.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bureau Addresses */}
          <div className="mt-12">
            <h3 className="font-cinzel text-xl font-bold text-primary-blue mb-6 text-center">Where to Send Your Letter</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {BUREAU_ADDRESSES.map((b, i) => (
                <Card key={i} className="border border-gray-200" data-testid={`bureau-${i}`}>
                  <CardContent className="p-5">
                    <h4 className="font-bold text-gray-900 mb-2">{b.name}</h4>
                    <p className="text-sm text-gray-600 mb-1"><Send className="w-3 h-3 inline mr-1" /> {b.address}</p>
                    <p className="text-sm text-primary-blue"><a href={`https://${b.online}`} target="_blank" rel="noopener noreferrer">{b.online}</a></p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MYTHS VS FACTS ═══ */}
      <section id="myths" className="py-20 bg-gray-50 scroll-mt-24" data-testid="myths-section">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4 text-center">609 Letter: Myths vs. Facts</h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-10">There is a lot of misinformation about 609 letters online. Here is the truth.</p>
          <div className="space-y-4">
            {MYTHS.map((m, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white" data-testid={`myth-${i}`}>
                <button
                  onClick={() => setOpenMyth(openMyth === i ? null : i)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 flex-1 pr-4">{m.myth}</span>
                  {openMyth === i ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openMyth === i && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-secondary-green uppercase tracking-wide mb-1">Fact</p>
                      <p className="text-gray-600 leading-relaxed">{m.fact}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 609 vs 611 vs 623 ═══ */}
      <section id="609-vs-611" className="py-20 bg-white scroll-mt-24" data-testid="comparison-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4 text-center">609 vs. 611 vs. 623: Which Should You Use?</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">The FCRA gives you multiple legal tools. Here is when to use each one.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {COMPARISON.map((c, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-xl transition-shadow" data-testid={`compare-${i}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-primary-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{c.section}</h3>
                  <p className="text-sm text-primary-blue font-medium mb-1">{c.title}</p>
                  <p className="text-xs text-gray-400 mb-3">{c.law}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{c.desc}</p>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-green-800 mb-1"><Target className="w-3 h-3 inline mr-1" />Best for:</p>
                    <p className="text-xs text-green-700">{c.best}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <Lightbulb className="w-6 h-6 text-primary-blue mx-auto mb-2" />
            <p className="text-gray-800 font-medium">
              <strong>Pro tip:</strong> The most effective credit repair strategy uses ALL THREE sections together.
              Start with a 609 request, follow up with a 611 dispute if needed, and escalate to a 623 demand directly to the furnisher.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQs ═══ */}
      <section id="faq" className="py-20 bg-gray-50 scroll-mt-24" data-testid="faq-section">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white" data-testid={`faq-${i}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FREE LETTERS CTA (BOTTOM) ═══ */}
      <section className="py-12 bg-white" data-testid="free-letters-cta-bottom">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-blue via-primary-blue/95 to-primary-blue/85 text-white p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-cinzel text-2xl md:text-3xl font-bold mb-2">Want a Custom Free Letter?</h3>
                <p className="text-gray-200 text-sm md:text-base max-w-xl">
                  Browse our collection of professionally written dispute letter templates. Fill in your details, generate a personalized PDF, and mail it — all 100% free, no signup required.
                </p>
              </div>
              <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8 whitespace-nowrap flex-shrink-0" asChild>
                <Link to="/free-letters" className="inline-flex items-center gap-2" data-testid="free-letters-btn-bottom">
                  Browse Free Letters <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 bg-primary-blue text-white" data-testid="final-cta">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Need Professional Help?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            If you would rather have experts handle your disputes, Credlocity offers full-service credit repair. 
            We know the law, we know the process, and we get results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrialButton size="lg" className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-10 py-6" data-testid="final-cta-trial">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </TrialButton>
            <Button size="lg" className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-lg px-10 py-6" asChild>
              <Link to="/free-credit-report-review" data-testid="final-cta-review">
                Get Free Credit Review <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DisputeLetter609;
