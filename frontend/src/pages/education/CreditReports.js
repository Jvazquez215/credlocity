import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

const CreditReports = () => (
  <>
    <Helmet><title>Understanding Credit Reports | Credlocity</title></Helmet>
    <section className="bg-gradient-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Credit Reports</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">Everything you need to know about reading, understanding, and disputing items on your credit reports.</p>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">What's on Your Credit Report?</h2>
        <p className="text-gray-700 mb-8">Your credit report contains four main sections: Personal Information, Account History, Public Records, and Inquiries. Understanding each section is key to identifying errors that can be disputed.</p>
        {[
          { title: "Personal Information", content: "Name, addresses, SSN, date of birth, employer history. Errors here won't affect your score but can cause confusion with someone else's accounts." },
          { title: "Account History (Trade Lines)", content: "Every credit account: credit cards, mortgages, auto loans, student loans. Shows payment history, balances, credit limits, and account status." },
          { title: "Public Records", content: "Bankruptcies, civil judgments, and tax liens. These have the most severe negative impact on your credit score." },
          { title: "Hard Inquiries", content: "Records of who has pulled your credit. Hard inquiries (from applications) can lower your score by 5-10 points each." },
          { title: "Three Bureaus, Three Reports", content: "Experian, Equifax, and TransUnion each maintain separate reports. Not all creditors report to all three, so reports may differ. Check all three at AnnualCreditReport.com." },
          { title: "Common Errors to Dispute", content: "Accounts that aren't yours, incorrect payment history, wrong balances or credit limits, outdated negative items (beyond 7 years), duplicate accounts, and mixed files with another person." }
        ].map((item, i) => (
          <div key={i} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-blue" /> {item.title}</h3>
            <p className="text-gray-600 leading-relaxed pl-7">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-gray-50 text-center">
      <div className="container mx-auto px-4">
        <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-4">Found Errors on Your Report?</h2>
        <p className="text-gray-600 mb-6">Let our experts handle the dispute process for you.</p>
        <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
          <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
        </Button>
      </div>
    </section>
  </>
);

export default CreditReports;
