import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
const CreditScores = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const faqItems = [
    {
      question: 'What is a credit score and why do I need one?',
      answer: 'A credit score is a three-digit number that represents your creditworthiness. Lenders use it to determine whether to approve you for credit and what interest rate to offer. A higher score means better terms and more financial opportunities.',
    },
    {
      question: 'What\'s the difference between FICO and VantageScore?',
      answer: 'FICO and VantageScore are two different credit scoring models. FICO is more widely used by lenders (90% of lending decisions), while VantageScore is growing in popularity. They use similar data but weigh factors differently.',
    },
    {
      question: 'Why do I have different credit scores?',
      answer: 'You have multiple scores because there are different scoring models (FICO, VantageScore), different versions of each model, industry-specific scores, and scores from different credit bureaus using slightly different data.',
    },
    {
      question: 'How often do credit scores update?',
      answer: 'Credit scores can update whenever your credit report data changes, which is typically every 30-45 days as creditors report to bureaus. However, not all creditors report at the same time.',
    },
    {
      question: 'What\'s a good credit score?',
      answer: 'Generally, 670-739 is considered good, 740-799 is very good, and 800+ is excellent. However, each lender has their own criteria. The higher your score, the better your chances of approval and favorable terms.',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="credit-scores-page">
      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6 text-center" data-testid="page-title">
            Understanding Credit Scores
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto text-center">
            Your complete guide to credit scores, how they work, and how to improve them
          </p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">300-850</div>
              <p className="text-gray-600">Score Range</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-green mb-2">35%</div>
              <p className="text-gray-600">Payment History</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">30%</div>
              <p className="text-gray-600">Amounts Owed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-green mb-2">90%</div>
              <p className="text-gray-600">Lenders Use FICO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Content */}
      <section className="py-20 bg-gray-50" data-testid="content-tabs">
        <div className="container mx-auto px-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="fico-vs-vantage">FICO vs VantageScore</TabsTrigger>
              <TabsTrigger value="versions">Score Versions</TabsTrigger>
              <TabsTrigger value="factors">Score Factors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="font-cinzel text-3xl font-bold mb-6">What is a Credit Score?</h2>
                <p className="text-gray-700 mb-4">
                  A credit score is a numerical representation of your creditworthiness, ranging from 300 to 850. This three-digit number is calculated based on information in your credit reports and helps lenders determine the risk of lending you money.
                </p>
                <p className="text-gray-700 mb-6">
                  Credit scores are used by lenders, landlords, insurance companies, and even employers to evaluate your financial reliability. A higher score can help you qualify for better interest rates, higher credit limits, and more favorable loan terms.
                </p>

                <h3 className="font-cinzel text-2xl font-semibold mb-4">Credit Score Ranges</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-32 font-semibold">Poor (300-579)</div>
                    <div className="flex-1 bg-red-500 h-8 rounded flex items-center px-4 text-white">
                      High risk - difficulty getting approved
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 font-semibold">Fair (580-669)</div>
                    <div className="flex-1 bg-orange-500 h-8 rounded flex items-center px-4 text-white">
                      Below average - higher interest rates
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 font-semibold">Good (670-739)</div>
                    <div className="flex-1 bg-yellow-500 h-8 rounded flex items-center px-4 text-white">
                      Good - competitive rates available
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 font-semibold">Very Good (740-799)</div>
                    <div className="flex-1 bg-lime-500 h-8 rounded flex items-center px-4 text-white">
                      Very good - favorable terms
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 font-semibold">Excellent (800-850)</div>
                    <div className="flex-1 bg-green-600 h-8 rounded flex items-center px-4 text-white">
                      Excellent - best rates and terms
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="font-cinzel text-2xl font-semibold mb-4">The 5 FICO Score Factors</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Payment History (35%)</span>
                      <span className="text-primary-blue">Most Important</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-primary-blue h-3 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Do you pay your bills on time? Late payments hurt your score significantly.</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Amounts Owed (30%)</span>
                      <span className="text-primary-blue">Very Important</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-primary-blue h-3 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">How much of your available credit are you using? Lower is better (under 30%).</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Length of Credit History (15%)</span>
                      <span className="text-secondary-green">Important</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-secondary-green h-3 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">How long have you had credit? Longer history is better.</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Credit Mix (10%)</span>
                      <span className="text-secondary-green">Moderate</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-secondary-green h-3 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Do you have different types of credit (cards, loans, mortgage)?</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">New Credit (10%)</span>
                      <span className="text-secondary-green">Moderate</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-secondary-green h-3 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">How many new accounts have you opened recently? Too many can hurt.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fico-vs-vantage">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="font-cinzel text-3xl font-bold mb-6">FICO vs VantageScore: Key Differences</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4">Feature</th>
                        <th className="py-4 px-4">FICO</th>
                        <th className="py-4 px-4">VantageScore</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-4 font-semibold">Score Range</td>
                        <td className="py-4 px-4 text-center">300-850</td>
                        <td className="py-4 px-4 text-center">300-850</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-4 font-semibold">Market Share</td>
                        <td className="py-4 px-4 text-center text-primary-blue font-bold">90%</td>
                        <td className="py-4 px-4 text-center">10%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-4 font-semibold">Created By</td>
                        <td className="py-4 px-4 text-center">Fair Isaac Corporation</td>
                        <td className="py-4 px-4 text-center">3 Credit Bureaus</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-4 font-semibold">Most Used By</td>
                        <td className="py-4 px-4 text-center">Lenders (mortgages, auto, credit cards)</td>
                        <td className="py-4 px-4 text-center">Credit monitoring services, some lenders</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="versions">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="font-cinzel text-3xl font-bold mb-6">Credit Score Versions</h2>
                <p className="text-gray-700 mb-6">
                  There are multiple versions of credit scores, and lenders may use different versions depending on the type of credit you're applying for.
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">FICO Score 8</h3>
                    <p className="text-gray-600">Most commonly used version for general lending decisions.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">FICO Score 9</h3>
                    <p className="text-gray-600">Newer version that treats medical collections and paid collections more favorably.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">FICO Score 10 & 10T</h3>
                    <p className="text-gray-600">Latest versions with trending data over 24 months.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Industry-Specific Scores</h3>
                    <p className="text-gray-600">Auto scores, bankcard scores, and mortgage scores tailored for specific industries.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="factors">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="font-cinzel text-3xl font-bold mb-6">How to Improve Your Credit Score</h2>
                <div className="space-y-6">
                  <div className="border-l-4 border-primary-blue pl-6">
                    <h3 className="font-semibold text-xl mb-2">1. Pay Bills On Time (35% Impact)</h3>
                    <p className="text-gray-600 mb-2">Payment history is the most important factor. Set up automatic payments or reminders to never miss a due date.</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Set up autopay for minimum payments</li>
                      <li>Use calendar reminders</li>
                      <li>Consider payment apps</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-secondary-green pl-6">
                    <h3 className="font-semibold text-xl mb-2">2. Lower Credit Utilization (30% Impact)</h3>
                    <p className="text-gray-600 mb-2">Keep balances below 30% of your credit limits. Optimal is under 10%.</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Pay down high balances</li>
                      <li>Request credit limit increases</li>
                      <li>Make multiple payments per month</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-primary-blue pl-6">
                    <h3 className="font-semibold text-xl mb-2">3. Keep Old Accounts Open (15% Impact)</h3>
                    <p className="text-gray-600 mb-2">Length of credit history matters. Keep old accounts open even if you don't use them often.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white" data-testid="faq-section">
        <div className="container mx-auto px-4">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-blue mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-gray-50 rounded-lg px-6 border border-gray-200"
                >
                  <AccordionTrigger className="font-semibold text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-4xl font-bold mb-6">
            Need Help Improving Your Credit Score?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our experts can help you identify and remove negative items hurting your score.
          </p>
          <Button
            size="lg"
            className="bg-secondary-green hover:bg-secondary-light text-white px-8"
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
      </section>
    </div>
  );
};

export default CreditScores;
