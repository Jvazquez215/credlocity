import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Button } from '../components/ui/button';

const FAQ = () => {
  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I sign up for Credlocity?',
          a: 'Click "Start Free Trial" button, complete the secure online enrollment form, and you\'ll get immediate access to our services. No credit card required for the free trial.',
        },
        {
          q: 'Do I need a credit card to start the free trial?',
          a: 'No! We don\'t require a credit card for the 30-day free trial. You can experience our full service risk-free.',
        },
        {
          q: 'How long does the credit repair process take?',
          a: 'Most clients see initial results within 30-45 days. Complete credit repair typically takes 3-6 months, depending on the complexity of your credit issues.',
        },
      ],
    },
    {
      category: 'Services & Process',
      questions: [
        {
          q: 'What services are included?',
          a: 'All plans include credit analysis, dispute filing with all 3 bureaus, credit monitoring, and educational resources. Higher plans include one-on-one consultations and family coverage.',
        },
        {
          q: 'How do you remove negative items?',
          a: 'We use multiple proven methods including factual disputes, FCRA/FDCPA violation identification, goodwill letters, debt validation, and pay-for-delete negotiations.',
        },
        {
          q: 'Which credit bureaus do you work with?',
          a: 'We work with all three major credit bureaus: Experian, Equifax, and TransUnion.',
        },
        {
          q: 'Can you guarantee specific results?',
          a: 'No credit repair company can legally guarantee specific results. However, we have a proven track record and offer a 100% money-back guarantee if you\'re not satisfied.',
        },
      ],
    },
    {
      category: 'Pricing & Billing',
      questions: [
        {
          q: 'How much does Credlocity cost?',
          a: 'Plans start at $99.95/month with a 30-day free trial. No setup fees or first work fees. See our Pricing page for detailed plan information.',
        },
        {
          q: 'Are there any hidden fees?',
          a: 'No. The price you see is the price you pay. No setup fees, no cancellation fees, no hidden charges. 100% transparent pricing.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes! You can cancel your subscription at any time with no penalties or cancellation fees.',
        },
        {
          q: 'Do you offer a money-back guarantee?',
          a: 'Yes, we offer a 100% money-back guarantee. If you\'re not satisfied with our service, we\'ll refund your money.',
        },
      ],
    },
    {
      category: 'Credit Scores & Reports',
      questions: [
        {
          q: 'Will checking my credit hurt my score?',
          a: 'No! Checking your own credit is a "soft inquiry" and does not affect your credit score.',
        },
        {
          q: 'How much can my credit score improve?',
          a: 'Results vary by individual. Some clients see 50-100+ point increases, while others see more modest gains. It depends on your starting credit situation.',
        },
        {
          q: 'Can you remove accurate negative information?',
          a: 'Generally, accurate negative information cannot be removed until it ages off your report (7-10 years). However, we can work on goodwill removals and ensure information is reported correctly.',
        },
      ],
    },
    {
      category: 'Legal & Compliance',
      questions: [
        {
          q: 'Is credit repair legal?',
          a: 'Yes! Credit repair is 100% legal when done correctly. Credlocity follows all federal laws including FCRA, CROA, and TSR.',
        },
        {
          q: 'What is the FCRA?',
          a: 'The Fair Credit Reporting Act (FCRA) is a federal law that regulates credit reporting and gives you the right to dispute inaccurate information. Learn more on our FCRA Guide page.',
        },
        {
          q: 'What is the FDCPA?',
          a: 'The Fair Debt Collection Practices Act (FDCPA) protects consumers from abusive debt collection practices. We use this law to help remove collections.',
        },
        {
          q: 'Why can\'t I enroll over the phone?',
          a: 'Federal TSR regulations require credit repair services to be initiated through secure online platforms. This protects consumers from fraud and ensures compliance.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen" data-testid="faq-page">
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Everything you need to know about Credlocity and credit repair
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((item, qIndex) => (
                  <AccordionItem
                    key={qIndex}
                    value={`item-${catIndex}-${qIndex}`}
                    className="bg-white rounded-lg px-6 border border-gray-200"
                    data-testid={`faq-item-${catIndex}-${qIndex}`}
                  >
                    <AccordionTrigger className="font-semibold text-left hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-6">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help. Schedule a free consultation or start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <Button
              size="lg"
              variant="outline"
              className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white px-8"
              asChild
            >
              <a
                href="https://calendly.com/credlocity/oneonone"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Consultation
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;