import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { ArrowRight, Calculator } from 'lucide-react';

const calculatorConfig = {
  "credit-score": {
    title: "Credit Score Calculator",
    description: "Estimate how different factors affect your credit score.",
    fields: [
      { name: "paymentHistory", label: "On-time payment percentage", type: "number", suffix: "%", default: 95 },
      { name: "utilization", label: "Credit utilization rate", type: "number", suffix: "%", default: 30 },
      { name: "creditAge", label: "Average age of accounts (years)", type: "number", default: 5 },
      { name: "totalAccounts", label: "Total number of accounts", type: "number", default: 6 },
      { name: "hardInquiries", label: "Hard inquiries (last 2 years)", type: "number", default: 2 }
    ],
    calculate: (vals) => {
      let score = 300;
      score += (vals.paymentHistory / 100) * 250;
      score += Math.max(0, (100 - vals.utilization) / 100) * 165;
      score += Math.min(vals.creditAge * 10, 75);
      score += Math.min(vals.totalAccounts * 5, 50);
      score -= vals.hardInquiries * 10;
      return Math.round(Math.min(850, Math.max(300, score)));
    },
    resultLabel: "Estimated Credit Score"
  },
  "debt-to-income": {
    title: "Debt-to-Income Calculator",
    description: "Calculate your DTI ratio — a key factor lenders use for loan approval.",
    fields: [
      { name: "monthlyIncome", label: "Monthly gross income", type: "number", prefix: "$", default: 5000 },
      { name: "mortgage", label: "Monthly mortgage/rent", type: "number", prefix: "$", default: 1200 },
      { name: "carPayment", label: "Car payment", type: "number", prefix: "$", default: 350 },
      { name: "creditCards", label: "Credit card minimum payments", type: "number", prefix: "$", default: 150 },
      { name: "studentLoans", label: "Student loan payment", type: "number", prefix: "$", default: 200 },
      { name: "otherDebt", label: "Other monthly debt", type: "number", prefix: "$", default: 0 }
    ],
    calculate: (vals) => {
      const totalDebt = vals.mortgage + vals.carPayment + vals.creditCards + vals.studentLoans + vals.otherDebt;
      return vals.monthlyIncome > 0 ? Math.round((totalDebt / vals.monthlyIncome) * 100) : 0;
    },
    resultLabel: "DTI Ratio",
    resultSuffix: "%"
  },
  "credit-utilization": {
    title: "Credit Utilization Calculator",
    description: "See how your credit card balances affect your utilization ratio.",
    fields: [
      { name: "totalBalance", label: "Total credit card balances", type: "number", prefix: "$", default: 3000 },
      { name: "totalLimit", label: "Total credit limits", type: "number", prefix: "$", default: 10000 }
    ],
    calculate: (vals) => vals.totalLimit > 0 ? Math.round((vals.totalBalance / vals.totalLimit) * 100) : 0,
    resultLabel: "Utilization Rate",
    resultSuffix: "%"
  },
  "loan-payment": {
    title: "Loan Payment Calculator",
    description: "Calculate monthly payments for any type of loan.",
    fields: [
      { name: "principal", label: "Loan amount", type: "number", prefix: "$", default: 25000 },
      { name: "rate", label: "Annual interest rate", type: "number", suffix: "%", default: 6.5 },
      { name: "years", label: "Loan term (years)", type: "number", default: 5 }
    ],
    calculate: (vals) => {
      const r = vals.rate / 100 / 12;
      const n = vals.years * 12;
      if (r === 0) return Math.round(vals.principal / n);
      return Math.round(vals.principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    },
    resultLabel: "Monthly Payment",
    resultPrefix: "$"
  },
  "mortgage": {
    title: "Mortgage Calculator",
    description: "Estimate your monthly mortgage payment.",
    fields: [
      { name: "homePrice", label: "Home price", type: "number", prefix: "$", default: 350000 },
      { name: "downPayment", label: "Down payment", type: "number", prefix: "$", default: 70000 },
      { name: "rate", label: "Interest rate", type: "number", suffix: "%", default: 7.0 },
      { name: "years", label: "Loan term (years)", type: "number", default: 30 }
    ],
    calculate: (vals) => {
      const principal = vals.homePrice - vals.downPayment;
      const r = vals.rate / 100 / 12;
      const n = vals.years * 12;
      if (r === 0) return Math.round(principal / n);
      return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    },
    resultLabel: "Monthly Payment",
    resultPrefix: "$"
  },
  "debt-payoff": {
    title: "Debt Payoff Calculator",
    description: "Find out how long it will take to pay off your debt.",
    fields: [
      { name: "balance", label: "Current balance", type: "number", prefix: "$", default: 5000 },
      { name: "rate", label: "Annual interest rate", type: "number", suffix: "%", default: 18 },
      { name: "payment", label: "Monthly payment", type: "number", prefix: "$", default: 200 }
    ],
    calculate: (vals) => {
      const r = vals.rate / 100 / 12;
      if (r === 0) return Math.round(vals.balance / vals.payment);
      if (vals.payment <= vals.balance * r) return Infinity;
      return Math.ceil(-Math.log(1 - (vals.balance * r) / vals.payment) / Math.log(1 + r));
    },
    resultLabel: "Months to Pay Off",
    resultSuffix: " months"
  },
  "credit-card-payoff": {
    title: "Credit Card Payoff Calculator",
    description: "Calculate how long to pay off credit card debt.",
    fields: [
      { name: "balance", label: "Card balance", type: "number", prefix: "$", default: 8000 },
      { name: "rate", label: "APR", type: "number", suffix: "%", default: 22 },
      { name: "payment", label: "Monthly payment", type: "number", prefix: "$", default: 250 }
    ],
    calculate: (vals) => {
      const r = vals.rate / 100 / 12;
      if (r === 0) return Math.round(vals.balance / vals.payment);
      if (vals.payment <= vals.balance * r) return Infinity;
      return Math.ceil(-Math.log(1 - (vals.balance * r) / vals.payment) / Math.log(1 + r));
    },
    resultLabel: "Months to Pay Off",
    resultSuffix: " months"
  },
  "savings": {
    title: "Savings Calculator",
    description: "See how your savings can grow over time.",
    fields: [
      { name: "initial", label: "Initial deposit", type: "number", prefix: "$", default: 1000 },
      { name: "monthly", label: "Monthly contribution", type: "number", prefix: "$", default: 200 },
      { name: "rate", label: "Annual interest rate", type: "number", suffix: "%", default: 4.5 },
      { name: "years", label: "Time period (years)", type: "number", default: 10 }
    ],
    calculate: (vals) => {
      const r = vals.rate / 100 / 12;
      const n = vals.years * 12;
      const fv = vals.initial * Math.pow(1 + r, n) + vals.monthly * ((Math.pow(1 + r, n) - 1) / r);
      return Math.round(fv);
    },
    resultLabel: "Future Value",
    resultPrefix: "$"
  },
  "interest": {
    title: "Interest Calculator",
    description: "Calculate simple and compound interest.",
    fields: [
      { name: "principal", label: "Principal amount", type: "number", prefix: "$", default: 10000 },
      { name: "rate", label: "Annual rate", type: "number", suffix: "%", default: 5 },
      { name: "years", label: "Time (years)", type: "number", default: 5 }
    ],
    calculate: (vals) => Math.round(vals.principal * Math.pow(1 + vals.rate / 100, vals.years)),
    resultLabel: "Total (Compound)",
    resultPrefix: "$"
  },
  "budget": {
    title: "Budget Calculator",
    description: "Plan your monthly budget using the 50/30/20 rule.",
    fields: [
      { name: "income", label: "Monthly take-home pay", type: "number", prefix: "$", default: 4000 }
    ],
    calculate: (vals) => vals.income,
    resultLabel: "Your Budget",
    resultPrefix: "$",
    customResult: (vals) => ({
      needs: Math.round(vals.income * 0.5),
      wants: Math.round(vals.income * 0.3),
      savings: Math.round(vals.income * 0.2)
    })
  },
  "refinance": {
    title: "Refinance Calculator",
    description: "See how much you could save by refinancing.",
    fields: [
      { name: "balance", label: "Current loan balance", type: "number", prefix: "$", default: 200000 },
      { name: "currentRate", label: "Current interest rate", type: "number", suffix: "%", default: 7.5 },
      { name: "newRate", label: "New interest rate", type: "number", suffix: "%", default: 6.0 },
      { name: "years", label: "Remaining years", type: "number", default: 25 }
    ],
    calculate: (vals) => {
      const calc = (r, n, p) => { const mr = r / 100 / 12; const mn = n * 12; return mr === 0 ? p / mn : p * (mr * Math.pow(1 + mr, mn)) / (Math.pow(1 + mr, mn) - 1); };
      return Math.round(calc(vals.currentRate, vals.years, vals.balance) - calc(vals.newRate, vals.years, vals.balance));
    },
    resultLabel: "Monthly Savings",
    resultPrefix: "$"
  },
  "student-loan": {
    title: "Student Loan Calculator",
    description: "Calculate your student loan payments.",
    fields: [
      { name: "balance", label: "Loan balance", type: "number", prefix: "$", default: 35000 },
      { name: "rate", label: "Interest rate", type: "number", suffix: "%", default: 5.5 },
      { name: "years", label: "Repayment term (years)", type: "number", default: 10 }
    ],
    calculate: (vals) => {
      const r = vals.rate / 100 / 12; const n = vals.years * 12;
      return r === 0 ? Math.round(vals.balance / n) : Math.round(vals.balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    },
    resultLabel: "Monthly Payment",
    resultPrefix: "$"
  },
  "auto-loan": {
    title: "Auto Loan Calculator",
    description: "Calculate your car payment.",
    fields: [
      { name: "price", label: "Vehicle price", type: "number", prefix: "$", default: 30000 },
      { name: "down", label: "Down payment", type: "number", prefix: "$", default: 5000 },
      { name: "rate", label: "Interest rate", type: "number", suffix: "%", default: 6.0 },
      { name: "years", label: "Loan term (years)", type: "number", default: 5 }
    ],
    calculate: (vals) => {
      const p = vals.price - vals.down; const r = vals.rate / 100 / 12; const n = vals.years * 12;
      return r === 0 ? Math.round(p / n) : Math.round(p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    },
    resultLabel: "Monthly Payment",
    resultPrefix: "$"
  },
  "retirement": {
    title: "Retirement Calculator",
    description: "Estimate how much you'll have saved by retirement.",
    fields: [
      { name: "current", label: "Current savings", type: "number", prefix: "$", default: 50000 },
      { name: "monthly", label: "Monthly contribution", type: "number", prefix: "$", default: 500 },
      { name: "rate", label: "Expected annual return", type: "number", suffix: "%", default: 7 },
      { name: "years", label: "Years until retirement", type: "number", default: 30 }
    ],
    calculate: (vals) => {
      const r = vals.rate / 100 / 12; const n = vals.years * 12;
      return Math.round(vals.current * Math.pow(1 + r, n) + vals.monthly * ((Math.pow(1 + r, n) - 1) / r));
    },
    resultLabel: "Retirement Savings",
    resultPrefix: "$"
  }
};

const CalculatorPage = ({ type }) => {
  const config = calculatorConfig[type] || calculatorConfig["credit-score"];
  const initialValues = {};
  config.fields.forEach(f => { initialValues[f.name] = f.default || 0; });
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const res = config.calculate(values);
    setResult(res);
  };

  const handleChange = (name, val) => {
    setValues(prev => ({ ...prev, [name]: parseFloat(val) || 0 }));
  };

  const budgetResult = type === "budget" && result !== null ? config.customResult(values) : null;

  return (
    <>
      <Helmet><title>{config.title} | Credlocity Credit Tools</title></Helmet>
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Calculator className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold mb-3">{config.title}</h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">{config.description}</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white border rounded-2xl shadow-lg p-8">
            <div className="space-y-5">
              {config.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <div className="relative">
                    {field.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{field.prefix}</span>}
                    <input
                      type="number"
                      value={values[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-primary-blue focus:border-transparent ${field.prefix ? 'pl-8' : 'pl-4'} ${field.suffix ? 'pr-8' : 'pr-4'}`}
                      data-testid={`calc-${field.name}`}
                    />
                    {field.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{field.suffix}</span>}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleCalculate} className="w-full mt-6 bg-primary-blue hover:bg-blue-700 text-white" size="lg" data-testid="calc-submit">Calculate</Button>
            {result !== null && (
              <div className="mt-6 p-6 bg-blue-50 rounded-xl text-center" data-testid="calc-result">
                {budgetResult ? (
                  <div className="space-y-3">
                    <div><span className="text-gray-600">Needs (50%):</span> <span className="font-bold text-xl text-primary-blue">${budgetResult.needs.toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Wants (30%):</span> <span className="font-bold text-xl text-primary-blue">${budgetResult.wants.toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Savings (20%):</span> <span className="font-bold text-xl text-secondary-green">${budgetResult.savings.toLocaleString()}</span></div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-1">{config.resultLabel}</div>
                    <div className="text-4xl font-bold text-primary-blue">
                      {result === Infinity ? "Cannot pay off" : `${config.resultPrefix || ''}${result.toLocaleString()}${config.resultSuffix || ''}`}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-4">These calculators provide estimates only and should not be considered financial advice.</p>
            <Button variant="outline" size="sm" asChild>
              <a href="/education-hub">More Credit Tools <ArrowRight className="w-4 h-4 ml-1" /></a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CalculatorPage;
