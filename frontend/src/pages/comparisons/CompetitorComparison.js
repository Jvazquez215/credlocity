import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, CheckCircle2, XCircle, Star } from 'lucide-react';

const competitors = {
  "lexington-law": { name: "Lexington Law", price: "$89.95-$129.95/mo", years: "17", rating: "3.5", issues: "Shut down by CFPB in 2023 for deceptive practices, $2.7B in illegal fees" },
  "creditrepair-com": { name: "CreditRepair.com", price: "$69.95-$119.95/mo", years: "12", rating: "3.0", issues: "FTC action for deceptive advertising, charges before work completed" },
  "credit-people": { name: "The Credit People", price: "$79/mo or $419 flat", years: "14", rating: "3.5", issues: "Limited transparency on dispute methods, flat fee non-refundable" },
  "credit-pros": { name: "The Credit Pros", price: "$119-$149/mo", years: "13", rating: "3.0", issues: "Higher pricing, aggressive upselling tactics reported" },
  "credit-saint": { name: "Credit Saint", price: "$79.99-$119.99/mo", years: "16", rating: "4.0", issues: "Limited online portal, slower communication reported" },
  "white-jacobs": { name: "White Jacobs", price: "$99/mo", years: "8", rating: "3.0", issues: "Newer company, limited track record, fewer consumer reviews available" }
};

const credlocity = { price: "$0 first month, then $99/mo", years: "16+", rating: "5.0" };

const CompetitorComparison = ({ competitor }) => {
  const comp = competitors[competitor] || competitors["lexington-law"];

  const comparisons = [
    { feature: "BBB Rating", us: "A+, Zero Complaints", them: `${comp.rating} stars` },
    { feature: "Free Trial", us: "30-Day Free Trial", them: "No free trial" },
    { feature: "Upfront Fees", us: "$0 first work fee", them: "Charges upfront or first month" },
    { feature: "Money-Back Guarantee", us: "180-day guarantee", them: "Limited or none" },
    { feature: "Monthly Cost", us: credlocity.price, them: comp.price },
    { feature: "Experience", us: `${credlocity.years} years`, them: `${comp.years} years` },
    { feature: "AI-Powered Disputes", us: "Yes - Metro2 AI analysis", them: "No" },
    { feature: "TSR Compliant", us: "100% online, fully compliant", them: "Varies" },
    { feature: "Yelp Rating", us: "5.0 stars", them: `${comp.rating} stars` },
    { feature: "Credit Tracker App", us: "Free included", them: "Not available or extra cost" }
  ];

  return (
    <>
      <Helmet><title>Credlocity vs {comp.name} | Credit Repair Comparison</title></Helmet>
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4">Credlocity vs. {comp.name}</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">See how Credlocity compares to {comp.name} on price, results, and consumer protection.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {comp.issues && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-red-800 mb-2">Known Issues with {comp.name}</h3>
              <p className="text-red-700 text-sm">{comp.issues}</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-secondary-green bg-green-50 rounded-tl-lg">Credlocity</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-500">{comp.name}</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center bg-green-50">
                      <span className="inline-flex items-center gap-1 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4" /> {row.us}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-500 text-sm">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">The Choice is Clear</h2>
          <p className="text-gray-600 mb-8">Start your free 30-day trial with Credlocity — zero risk, zero upfront fees.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
              <a href="https://credlocity.scorexer.com/portal-signUp/signup.jsp?id=a2dLYWJBMVhuOWRoMlB2cyt5MFVtUT09" target="_blank" rel="noopener noreferrer">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/credit-repair-reviews">See All Comparisons</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CompetitorComparison;
