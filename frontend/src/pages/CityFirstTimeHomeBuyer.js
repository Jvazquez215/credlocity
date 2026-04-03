import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  Home, ChevronRight, DollarSign, TrendingDown, GraduationCap,
  Calculator, Shield, ArrowRight, CheckCircle2, AlertTriangle, Star,
  ExternalLink, BookOpen, Phone, MapPin, Building2, Landmark, Percent,
  Scale, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { TrialButton } from '../components/LeadButtons';
import useSEO from '../hooks/useSEO';

/* ═══════════════════════════════════════════════════════════════════
   CITY-SPECIFIC DATA
   Each city gets: grants, courses, resources, local stats, and copy.
   The calculator, FAQs skeleton, and educational content are shared.
   ═══════════════════════════════════════════════════════════════════ */

const CITY_DATA = {
  'credit-repair-philadelphia': {
    city: 'Philadelphia', state: 'PA', stateFullName: 'Pennsylvania',
    phone: '(215) 263-5244', phoneTel: '+12152635244',
    medianHome: 280000, propertyTax: 1.3998, avgInsurance: 1400,
    grants: [
      { title: 'Philly First Home', amount: 'Up to $10,000', desc: 'City of Philadelphia grant for first-time home buyers. Can be used toward down payment and/or closing costs. Does not need to be repaid.', link: 'https://phdcphila.org/', linkText: 'PHDC Website' },
      { title: 'PHFA Keystone Advantage', amount: 'Up to $6,000', desc: 'Pennsylvania Housing Finance Agency down payment and closing cost assistance. Zero-percent interest, forgiven after 10 years.', link: 'https://www.phfa.org/programs/assistance.aspx', linkText: 'PHFA Website' },
      { title: 'HOMEstead Program', amount: 'Up to $10,000', desc: 'Philadelphia forgivable loan for closing costs on properties in targeted areas. Can be combined with Philly First Home.', link: 'https://phdcphila.org/', linkText: 'PHDC Website' },
      { title: 'PHFA K-FIT', amount: 'Up to 5% of Loan', desc: 'Keystone Forgivable in Ten Years program provides up to 5% of the mortgage amount, forgiven after 10 years of primary residence.', link: 'https://www.phfa.org/programs/assistance.aspx', linkText: 'PHFA Website' },
      { title: 'FHA Good Neighbor Next Door', amount: '50% Discount', desc: 'Law enforcement, teachers, firefighters, and EMTs can purchase HUD homes at 50% discount in designated revitalization areas.', link: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot', linkText: 'HUD Website' },
      { title: 'Philadelphia IDA Program', amount: '$3 Match per $1', desc: 'Individual Development Accounts match your savings 3-to-1 for homeownership. Save $1,000 and receive $3,000 in matching funds.', link: 'https://clarifi.org/', linkText: 'Clarifi' },
    ],
    primaryGrant: '$10,000', primaryGrantName: 'Philly First Home',
    courses: [
      { name: 'Clarifi (formerly CCCS of Delaware Valley)', phone: '(215) 563-5665', url: 'https://clarifi.org', desc: 'In-person and online classes. One of the largest HUD-approved agencies in Philadelphia. Also provides financial coaching and IDA programs.' },
      { name: 'Congreso de Latinos Unidos', phone: '(215) 763-8870', url: 'https://www.congreso.net', desc: 'Bilingual (English/Spanish) homebuyer education. Serves the Latino community in North Philadelphia and beyond.' },
      { name: 'HACE', phone: '(215) 426-8025', url: 'https://www.hacecdc.org', desc: 'Homebuyer workshops, pre-purchase counseling, and down payment assistance guidance for Philadelphia residents.' },
      { name: 'Asociacion Puertorriquenos en Marcha (APM)', phone: '(215) 235-6070', url: 'https://www.apmphila.org', desc: 'Community-based housing counseling and homebuyer education courses in North Philadelphia.' },
      { name: 'Philadelphia Housing Authority (PHA)', phone: '(215) 684-4000', url: 'https://www.pha.phila.gov', desc: 'Administers the Philly First Home grant program and provides direct housing counseling services.' },
      { name: 'NHS of Philadelphia', phone: '(215) 987-2500', url: 'https://nhsphila.org', desc: 'Comprehensive homebuyer training, financial fitness, and pre-purchase counseling. Multiple office locations.' },
    ],
    resources: [
      { name: 'PHFA (PA Housing Finance Agency)', desc: 'State agency administering mortgage programs, down payment assistance, and homebuyer grants.', url: 'https://www.phfa.org', icon: Landmark },
      { name: 'PHDC (Philadelphia Housing Development Corp)', desc: 'Manages the HOMEstead program and other city-funded housing initiatives.', url: 'https://phdcphila.org', icon: Building2 },
      { name: 'Philadelphia Legal Assistance', desc: 'Free legal services for low-income residents on housing-related issues.', url: 'https://www.philalegal.org', icon: Scale },
      { name: 'Community Legal Services', desc: 'Helps residents with landlord-tenant disputes, mortgage foreclosure prevention, and fair housing.', url: 'https://clsphila.org', icon: Shield },
      { name: 'Philadelphia Dept. of L&I', desc: 'Property inspections, zoning, and permits for home buyers and owners.', url: 'https://www.phila.gov/departments/department-of-licenses-and-inspections/', icon: CheckCircle2 },
      { name: 'CFPB', desc: 'Federal resource for mortgage education, lender comparison tools, and consumer complaint filing.', url: 'https://www.consumerfinance.gov/owning-a-home/', icon: Star },
    ],
  },
  'credit-repair-atlanta': {
    city: 'Atlanta', state: 'GA', stateFullName: 'Georgia',
    phone: '(215) 263-5244', phoneTel: '+12152635244',
    medianHome: 350000, propertyTax: 1.1, avgInsurance: 1800,
    grants: [
      { title: 'Georgia Dream Homeownership Program', amount: 'Up to $10,000', desc: 'Georgia Department of Community Affairs provides down payment assistance for first-time home buyers with low-to-moderate income. No repayment required if you stay 5+ years.', link: 'https://www.dca.ga.gov/safe-affordable-housing/homeownership/georgia-dream-homeownership-program', linkText: 'DCA Website' },
      { title: 'Georgia Dream PEN Program', amount: 'Up to $12,500', desc: 'Additional $2,500 for public safety, education, healthcare, and military personnel on top of the standard Georgia Dream assistance.', link: 'https://www.dca.ga.gov/', linkText: 'DCA Website' },
      { title: 'Invest Atlanta Down Payment Assistance', amount: 'Up to $20,000', desc: 'City of Atlanta program providing forgivable down payment assistance for homes purchased within Atlanta city limits.', link: 'https://www.investatlanta.com/', linkText: 'Invest Atlanta' },
      { title: 'Atlanta Neighborhood Development Partnership', amount: 'Varies', desc: 'Provides affordable homeownership opportunities in Atlanta neighborhoods through development and financial counseling.', link: 'https://andpi.org/', linkText: 'ANDP Website' },
      { title: 'FHA Good Neighbor Next Door', amount: '50% Discount', desc: 'Law enforcement, teachers, firefighters, and EMTs can purchase HUD homes at 50% discount in designated areas of Atlanta.', link: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot', linkText: 'HUD Website' },
      { title: 'Veteran Home Buyer Benefits', amount: '0% Down', desc: 'VA loans require zero down payment. Atlanta veterans can combine VA financing with state/city grants for maximum savings.', link: 'https://www.va.gov/housing-assistance/home-loans/', linkText: 'VA Home Loans' },
    ],
    primaryGrant: '$20,000', primaryGrantName: 'Invest Atlanta DPA',
    courses: [
      { name: 'Atlanta Neighborhood Development Partnership', phone: '(404) 522-2637', url: 'https://andpi.org/', desc: 'HUD-approved homebuyer education, financial counseling, and affordable housing programs.' },
      { name: 'Consumer Credit Counseling Service of Greater Atlanta', phone: '(404) 527-7630', url: 'https://www.cccsinc.org', desc: 'Offers HUD-approved homebuyer education classes, budget counseling, and pre-purchase planning.' },
      { name: 'Latin American Association', phone: '(404) 638-1800', url: 'https://thelaa.org', desc: 'Bilingual homebuyer education and housing counseling for Atlanta Latino community.' },
      { name: 'Urban League of Greater Atlanta', phone: '(404) 659-1150', url: 'https://www.ulgatl.org', desc: 'Housing counseling, homebuyer education, and financial empowerment programs for metro Atlanta.' },
    ],
    resources: [
      { name: 'GA Dept. of Community Affairs', desc: 'State agency administering Georgia Dream and other housing programs.', url: 'https://www.dca.ga.gov/', icon: Landmark },
      { name: 'Invest Atlanta', desc: 'City economic development authority managing down payment assistance programs.', url: 'https://www.investatlanta.com/', icon: Building2 },
      { name: 'Atlanta Legal Aid Society', desc: 'Free legal services for low-income residents on housing matters.', url: 'https://atlantalegalaid.org/', icon: Scale },
      { name: 'CFPB', desc: 'Federal resource for mortgage education and consumer protection.', url: 'https://www.consumerfinance.gov/owning-a-home/', icon: Star },
    ],
  },
  'credit-repair-new-york': {
    city: 'New York', state: 'NY', stateFullName: 'New York',
    phone: '(215) 263-5244', phoneTel: '+12152635244',
    medianHome: 750000, propertyTax: 0.88, avgInsurance: 2200,
    grants: [
      { title: 'SONYMA Down Payment Assistance', amount: 'Up to $15,000', desc: 'State of New York Mortgage Agency provides down payment assistance as a second mortgage with 0% interest, repayable on sale or refinance.', link: 'https://hcr.ny.gov/sonyma', linkText: 'SONYMA Website' },
      { title: 'HPD HomeFirst', amount: 'Up to $100,000', desc: 'NYC Housing Preservation & Development provides up to $100,000 in down payment assistance for first-time buyers in NYC. Forgivable after 10-15 years.', link: 'https://www.nyc.gov/site/hpd/services-and-information/homefirst-down-payment-assistance-program.page', linkText: 'HPD Website' },
      { title: 'SONYMA Achieving the Dream', amount: 'Low Rate Loans', desc: 'Low interest rate mortgages for first-time buyers with household income below area median. Can be combined with DPA programs.', link: 'https://hcr.ny.gov/sonyma', linkText: 'SONYMA Website' },
      { title: 'NYC Housing Connect', amount: 'Affordable Units', desc: 'Lottery system for affordable housing in New York City. Income-restricted apartments and condos at below-market prices.', link: 'https://housingconnect.nyc.gov/', linkText: 'Housing Connect' },
      { title: 'FHA Good Neighbor Next Door', amount: '50% Discount', desc: 'Law enforcement, teachers, firefighters, and EMTs can purchase HUD homes at 50% discount in designated NYC neighborhoods.', link: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot', linkText: 'HUD Website' },
      { name: 'Veteran Home Buyer Benefits', title: 'Veteran Home Buyer Benefits', amount: '0% Down', desc: 'VA loans require zero down payment. NYC veterans can combine VA financing with SONYMA and HPD grants.', link: 'https://www.va.gov/housing-assistance/home-loans/', linkText: 'VA Home Loans' },
    ],
    primaryGrant: '$100,000', primaryGrantName: 'HPD HomeFirst',
    courses: [
      { name: 'NHS of New York City', phone: '(212) 519-2500', url: 'https://nhsnyc.org', desc: 'HUD-approved homebuyer education, financial counseling, and foreclosure prevention for all five boroughs.' },
      { name: 'Chhaya CDC', phone: '(718) 478-3848', url: 'https://www.chhayacdc.org', desc: 'Homebuyer education in multiple languages serving South Asian and other immigrant communities in Queens and NYC.' },
      { name: 'MHANY Management', phone: '(212) 233-1619', url: 'https://www.mhaofnyc.org', desc: 'Comprehensive homebuyer classes and housing counseling throughout New York City.' },
      { name: 'NYC Housing Authority (NYCHA)', phone: '(212) 306-3000', url: 'https://www.nyc.gov/nycha', desc: 'Homeownership information and referrals for NYC public housing residents and Section 8 voucher holders.' },
    ],
    resources: [
      { name: 'SONYMA (NYS Mortgage Agency)', desc: 'State agency providing low-rate mortgages and down payment assistance.', url: 'https://hcr.ny.gov/sonyma', icon: Landmark },
      { name: 'NYC HPD', desc: 'NYC Housing Preservation & Development manages HomeFirst and affordable housing programs.', url: 'https://www.nyc.gov/site/hpd/', icon: Building2 },
      { name: 'Legal Aid Society', desc: 'Free legal services for low-income New Yorkers on housing-related issues.', url: 'https://www.legalaidnyc.org/', icon: Scale },
      { name: 'CFPB', desc: 'Federal mortgage education and consumer protection.', url: 'https://www.consumerfinance.gov/owning-a-home/', icon: Star },
    ],
  },
  'credit-repair-trenton': {
    city: 'Trenton', state: 'NJ', stateFullName: 'New Jersey',
    phone: '(215) 263-5244', phoneTel: '+12152635244',
    medianHome: 220000, propertyTax: 2.23, avgInsurance: 1300,
    grants: [
      { title: 'NJHMFA Down Payment Assistance', amount: 'Up to $15,000', desc: 'New Jersey Housing & Mortgage Finance Agency provides up to $15,000 as a forgivable second mortgage for first-time buyers. Forgiven after 5 years.', link: 'https://www.nj.gov/dca/hmfa/', linkText: 'NJHMFA Website' },
      { title: 'NJHMFA Smart Start', amount: 'Up to $15,000', desc: 'Additional down payment and closing cost assistance for qualified first-time buyers in New Jersey.', link: 'https://www.nj.gov/dca/hmfa/', linkText: 'NJHMFA Website' },
      { title: 'Trenton Housing Authority Programs', amount: 'Varies', desc: 'Local housing authority programs for Trenton residents including homeownership opportunities and housing counseling.', link: 'https://www.trentonha.org/', linkText: 'THA Website' },
      { title: 'Mercer County HOME Program', amount: 'Up to $10,000', desc: 'Mercer County federally-funded HOME program provides down payment assistance for income-eligible county residents.', link: 'https://www.mercercounty.org/', linkText: 'Mercer County' },
      { title: 'FHA Good Neighbor Next Door', amount: '50% Discount', desc: 'Law enforcement, teachers, firefighters, and EMTs can purchase HUD homes at 50% discount in designated NJ areas.', link: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot', linkText: 'HUD Website' },
      { title: 'Veteran Home Buyer Benefits', amount: '0% Down', desc: 'VA loans require zero down payment. NJ veterans can combine VA financing with NJHMFA grants for maximum savings.', link: 'https://www.va.gov/housing-assistance/home-loans/', linkText: 'VA Home Loans' },
    ],
    primaryGrant: '$15,000', primaryGrantName: 'NJHMFA DPA',
    courses: [
      { name: 'Isles Inc.', phone: '(609) 341-4700', url: 'https://isles.org', desc: 'Trenton-based HUD-approved counseling agency offering homebuyer education, financial coaching, and foreclosure prevention.' },
      { name: 'HomeFront NJ', phone: '(609) 989-9417', url: 'https://homefrontnj.org', desc: 'Mercer County housing services including homebuyer education workshops and affordable housing programs.' },
      { name: 'NJ Citizen Action', phone: '(973) 643-8800', url: 'https://www.njcitizenaction.org', desc: 'Statewide HUD-approved homebuyer education and financial counseling for NJ residents.' },
    ],
    resources: [
      { name: 'NJHMFA', desc: 'NJ Housing & Mortgage Finance Agency — mortgage programs and down payment assistance.', url: 'https://www.nj.gov/dca/hmfa/', icon: Landmark },
      { name: 'Trenton Housing Authority', desc: 'Local housing programs and counseling for Trenton residents.', url: 'https://www.trentonha.org/', icon: Building2 },
      { name: 'NJ Legal Services', desc: 'Free legal aid for low-income NJ residents on housing matters.', url: 'https://www.lsnj.org/', icon: Scale },
      { name: 'CFPB', desc: 'Federal mortgage education and consumer protection.', url: 'https://www.consumerfinance.gov/owning-a-home/', icon: Star },
    ],
  },
  'credit-repair-boise': {
    city: 'Boise', state: 'ID', stateFullName: 'Idaho',
    phone: '(215) 263-5244', phoneTel: '+12152635244',
    medianHome: 450000, propertyTax: 0.63, avgInsurance: 1200,
    grants: [
      { title: 'IHFA First-Time Homebuyer Program', amount: 'Up to $12,000', desc: 'Idaho Housing and Finance Association provides down payment and closing cost assistance for first-time buyers through participating lenders.', link: 'https://www.idahohousing.com/', linkText: 'IHFA Website' },
      { title: 'IHFA Second Mortgage', amount: 'Up to 3.5%', desc: 'IHFA second mortgage covers up to 3.5% of purchase price for down payment and closing costs. 10-year forgivable loan.', link: 'https://www.idahohousing.com/', linkText: 'IHFA Website' },
      { title: 'Boise City HOME Program', amount: 'Up to $10,000', desc: 'City of Boise federally-funded HOME program provides down payment assistance to income-eligible first-time buyers within Boise city limits.', link: 'https://www.cityofboise.org/departments/housing-and-community-development/', linkText: 'Boise Housing' },
      { title: 'FHA Good Neighbor Next Door', amount: '50% Discount', desc: 'Law enforcement, teachers, firefighters, and EMTs can purchase HUD homes at 50% discount in designated Idaho areas.', link: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot', linkText: 'HUD Website' },
      { title: 'USDA Rural Development', amount: '0% Down', desc: 'USDA loans available in rural areas around Boise with zero down payment and no PMI for income-eligible buyers.', link: 'https://www.rd.usda.gov/programs-services/single-family-housing-programs', linkText: 'USDA Website' },
      { title: 'Veteran Home Buyer Benefits', amount: '0% Down', desc: 'VA loans require zero down payment. Boise veterans can combine VA financing with IHFA grants.', link: 'https://www.va.gov/housing-assistance/home-loans/', linkText: 'VA Home Loans' },
    ],
    primaryGrant: '$12,000', primaryGrantName: 'IHFA DPA',
    courses: [
      { name: 'Idaho Housing and Finance Association', phone: '(208) 331-4882', url: 'https://www.idahohousing.com', desc: 'State housing agency offering free online homebuyer education courses accepted by all major lenders in Idaho.' },
      { name: 'NeighborWorks Boise', phone: '(208) 343-4065', url: 'https://www.nwboise.org', desc: 'HUD-approved homebuyer education, one-on-one counseling, and affordable housing services for Boise area.' },
      { name: 'LEAP Housing Counseling', phone: '(208) 345-4957', url: 'https://www.leapcharities.org', desc: 'Financial education and housing counseling for low-to-moderate income individuals in the Treasure Valley.' },
    ],
    resources: [
      { name: 'IHFA (Idaho Housing & Finance)', desc: 'State agency administering first-time buyer programs and down payment assistance.', url: 'https://www.idahohousing.com/', icon: Landmark },
      { name: 'City of Boise Housing', desc: 'Local housing and community development programs.', url: 'https://www.cityofboise.org/departments/housing-and-community-development/', icon: Building2 },
      { name: 'Idaho Legal Aid Services', desc: 'Free legal assistance for low-income Idaho residents on housing issues.', url: 'https://www.idaholegalaid.org/', icon: Scale },
      { name: 'CFPB', desc: 'Federal mortgage education and consumer protection.', url: 'https://www.consumerfinance.gov/owning-a-home/', icon: Star },
    ],
  },
};

// Idaho cities share IHFA programs — deep clone Boise data with city-specific overrides
// Note: We need to preserve icon references (React components) which can't be JSON serialized
const cloneIdahoData = () => {
  const boise = CITY_DATA['credit-repair-boise'];
  return {
    ...boise,
    grants: boise.grants.map(g => ({ ...g })),
    courses: boise.courses.map(c => ({ ...c })),
    resources: boise.resources.map(r => ({ ...r })), // This preserves icon references
  };
};

['credit-repair-nampa', 'credit-repair-caldwell', 'credit-repair-idaho-falls', 'credit-repair-twin-falls', 'credit-repair-pocatello'].forEach(slug => {
  const map = {
    'credit-repair-nampa': { city: 'Nampa', medianHome: 380000 },
    'credit-repair-caldwell': { city: 'Caldwell', medianHome: 340000 },
    'credit-repair-idaho-falls': { city: 'Idaho Falls', medianHome: 320000 },
    'credit-repair-twin-falls': { city: 'Twin Falls', medianHome: 300000 },
    'credit-repair-pocatello': { city: 'Pocatello', medianHome: 280000 },
  };
  const base = cloneIdahoData();
  const overrides = map[slug];
  base.city = overrides.city;
  base.medianHome = overrides.medianHome;
  // Replace Boise-specific grant with generic Idaho
  base.grants = base.grants.map(g => g.title === 'Boise City HOME Program'
    ? { ...g, title: `${overrides.city} Community HOME Program`, desc: g.desc.replace(/Boise/g, overrides.city) }
    : g
  );
  base.courses = base.courses.map(c => c.name === 'NeighborWorks Boise'
    ? { ...c, name: `NeighborWorks Idaho`, desc: c.desc.replace(/Boise/g, overrides.city) }
    : c
  );
  base.resources = base.resources.map(r => r.name === 'City of Boise Housing'
    ? { ...r, name: `${overrides.city} Housing Resources`, desc: r.desc.replace(/Local/g, overrides.city) }
    : r
  );
  CITY_DATA[slug] = base;
});

/* ─── Interest rate tiers by credit score ─── */
const RATE_TIERS = [
  { min: 760, max: 850, rate: 6.25, label: 'Excellent' },
  { min: 700, max: 759, rate: 6.75, label: 'Good' },
  { min: 680, max: 699, rate: 7.10, label: 'Above Average' },
  { min: 660, max: 679, rate: 7.45, label: 'Average' },
  { min: 640, max: 659, rate: 7.90, label: 'Fair' },
  { min: 620, max: 639, rate: 8.50, label: 'Minimum FHA' },
  { min: 580, max: 619, rate: 9.25, label: 'Subprime' },
  { min: 500, max: 579, rate: 10.50, label: 'Poor' },
];

const PMI_RATES = [
  { min: 760, pct: 0.22 }, { min: 700, pct: 0.44 }, { min: 680, pct: 0.58 },
  { min: 660, pct: 0.72 }, { min: 640, pct: 0.95 }, { min: 620, pct: 1.10 },
  { min: 580, pct: 1.50 }, { min: 500, pct: 1.85 },
];

const getRate = (score) => (RATE_TIERS.find(t => score >= t.min && score <= t.max) || RATE_TIERS[RATE_TIERS.length - 1]);
const getPMI = (score) => (PMI_RATES.find(t => score >= t.min) || PMI_RATES[PMI_RATES.length - 1]).pct;
const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => Math.round(n).toLocaleString('en-US');

/* ─── Mortgage Calculator ─── */
const MortgageCalculator = ({ cityData }) => {
  const grantAmt = parseInt((cityData.primaryGrant || '$10,000').replace(/[^0-9]/g, '')) || 10000;
  const [homePrice, setHomePrice] = useState(cityData.medianHome);
  const [downPaymentPct, setDownPaymentPct] = useState(3.5);
  const [creditScore, setCreditScore] = useState(640);
  const [loanTerm, setLoanTerm] = useState(30);
  const [applyGrant, setApplyGrant] = useState(true);
  const [propertyTaxRate, setPropertyTaxRate] = useState(cityData.propertyTax);
  const [homeInsurance, setHomeInsurance] = useState(cityData.avgInsurance);

  const calc = useMemo(() => {
    const grantAmount = applyGrant ? grantAmt : 0;
    const downPaymentDollars = homePrice * (downPaymentPct / 100);
    const effectiveDown = downPaymentDollars + grantAmount;
    const loanAmount = Math.max(0, homePrice - effectiveDown);
    const tier = getRate(creditScore);
    const monthlyRate = tier.rate / 100 / 12;
    const numPayments = loanTerm * 12;
    let monthlyPI = 0;
    if (monthlyRate > 0 && numPayments > 0) {
      monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyInsurance = homeInsurance / 12;
    const ltv = homePrice > 0 ? loanAmount / homePrice : 0;
    const needsPMI = ltv > 0.80;
    const pmiRate = needsPMI ? getPMI(creditScore) : 0;
    const monthlyPMI = (loanAmount * (pmiRate / 100)) / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;
    const totalInterest = (monthlyPI * numPayments) - loanAmount;

    // Grant savings
    const loanNoGrant = Math.max(0, homePrice - downPaymentDollars);
    let piNoGrant = 0;
    if (monthlyRate > 0 && numPayments > 0) {
      piNoGrant = loanNoGrant * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    const grantSavings = (piNoGrant - monthlyPI) * numPayments;

    // Credit repair savings (if improved to 760)
    const improvedTier = getRate(760);
    const improvedRate = improvedTier.rate / 100 / 12;
    let improvedPI = 0;
    if (improvedRate > 0) {
      improvedPI = loanAmount * (improvedRate * Math.pow(1 + improvedRate, numPayments)) / (Math.pow(1 + improvedRate, numPayments) - 1);
    }
    const improvedPMI = ltv > 0.80 ? (loanAmount * (getPMI(760) / 100)) / 12 : 0;
    const improvedTotal = improvedPI + monthlyTax + monthlyInsurance + improvedPMI;
    const monthlySavings = totalMonthly - improvedTotal;
    const lifetimeSavings = monthlySavings * numPayments;

    return { loanAmount, tier, monthlyPI, monthlyTax, monthlyInsurance, monthlyPMI, totalMonthly, totalInterest, needsPMI, pmiRate, effectiveDown, grantSavings, improvedTotal, monthlySavings, lifetimeSavings };
  }, [homePrice, downPaymentPct, creditScore, loanTerm, applyGrant, propertyTaxRate, homeInsurance, grantAmt]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden" data-testid="mortgage-calculator">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8" />
          <h2 className="font-cinzel text-xl md:text-2xl font-bold">{cityData.city} Mortgage Calculator</h2>
        </div>
        <p className="text-sm text-gray-200">Includes {cityData.primaryGrant} {cityData.primaryGrantName} grant, PMI, taxes, and credit-score-based rates</p>
      </div>
      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Home Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary" data-testid="calc-home-price" />
              </div>
              <input type="range" min={100000} max={1500000} step={5000} value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} className="w-full mt-1 accent-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Down Payment: {downPaymentPct}% (${fmtInt(homePrice * downPaymentPct / 100)})</label>
              <input type="range" min={0} max={20} step={0.5} value={downPaymentPct} onChange={e => setDownPaymentPct(Number(e.target.value))} className="w-full accent-primary" data-testid="calc-down-payment" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Credit Score: <span className={`font-bold ${creditScore >= 700 ? 'text-green-600' : creditScore >= 640 ? 'text-yellow-600' : 'text-red-600'}`}>{creditScore}</span>
                <span className="ml-2 text-xs text-gray-500">({calc.tier.label})</span>
              </label>
              <input type="range" min={500} max={850} step={5} value={creditScore} onChange={e => setCreditScore(Number(e.target.value))} className="w-full accent-primary" data-testid="calc-credit-score" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>500</span><span>620</span><span>700</span><span>760</span><span>850</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loan Term</label>
                <select value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))} className="w-full py-2.5 px-3 border rounded-lg" data-testid="calc-loan-term">
                  <option value={30}>30 years</option><option value={15}>15 years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Annual Insurance</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" value={homeInsurance} onChange={e => setHomeInsurance(Number(e.target.value))} className="w-full pl-8 pr-4 py-2.5 border rounded-lg" data-testid="calc-insurance" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Property Tax Rate: {propertyTaxRate}%</label>
              <input type="range" min={0.3} max={3} step={0.01} value={propertyTaxRate} onChange={e => setPropertyTaxRate(Number(e.target.value))} className="w-full accent-primary" />
              <p className="text-xs text-gray-500 mt-0.5">{cityData.city} average: {cityData.propertyTax}%</p>
            </div>
            <label className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
              <input type="checkbox" checked={applyGrant} onChange={e => setApplyGrant(e.target.checked)} className="w-4 h-4 accent-green-600" data-testid="calc-grant-toggle" />
              <div>
                <span className="font-semibold text-sm text-green-800">Apply {cityData.primaryGrant} {cityData.primaryGrantName} Grant</span>
                <p className="text-xs text-green-600">Reduces your loan amount</p>
              </div>
            </label>
          </div>

          <div>
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <p className="text-sm text-gray-500 mb-1">Estimated Monthly Payment</p>
              <p className="text-4xl font-cinzel font-bold text-primary" data-testid="calc-monthly-payment">${fmt(calc.totalMonthly)}</p>
              <p className="text-xs text-gray-500 mt-1">Interest rate: {calc.tier.rate}% ({calc.tier.label})</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Principal & Interest</span><span className="font-semibold">${fmt(calc.monthlyPI)}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Property Tax</span><span className="font-semibold">${fmt(calc.monthlyTax)}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Homeowner's Insurance</span><span className="font-semibold">${fmt(calc.monthlyInsurance)}</span></div>
              {calc.needsPMI && <div className="flex justify-between py-2 border-b"><span className="text-gray-600">PMI ({calc.pmiRate}%)</span><span className="font-semibold text-amber-600">${fmt(calc.monthlyPMI)}</span></div>}
              <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Loan Amount</span><span className="font-semibold">${fmtInt(calc.loanAmount)}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Total Down ({downPaymentPct}% + grant)</span><span className="font-semibold text-green-600">${fmtInt(calc.effectiveDown)}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-600">Total Interest ({loanTerm}yr)</span><span className="font-semibold">${fmtInt(calc.totalInterest)}</span></div>
            </div>
            {applyGrant && calc.grantSavings > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800"><DollarSign className="w-4 h-4 inline" /> Grant Savings: ${fmtInt(calc.grantSavings)} over {loanTerm} years</p>
              </div>
            )}
            {creditScore < 760 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl" data-testid="calc-credit-repair-savings">
                <p className="text-sm font-semibold text-blue-900 mb-1"><TrendingDown className="w-4 h-4 inline mr-1" />If your score improved to 760+:</p>
                <p className="text-sm text-blue-800">Monthly payment: <strong>${fmt(calc.improvedTotal)}</strong></p>
                <p className="text-sm text-blue-800">You'd save <strong>${fmt(calc.monthlySavings)}/mo</strong> or <strong className="text-lg">${fmtInt(calc.lifetimeSavings)}</strong> over {loanTerm} years</p>
                <TrialButton className="mt-3 bg-primary hover:bg-primary-dark text-white text-sm w-full" size="sm">Start Improving My Score</TrialButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Reusable sub-components ─── */
const GrantCard = ({ title, amount, desc, link, linkText }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-cinzel font-semibold text-lg">{title}</h3>
      <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm whitespace-nowrap">{amount}</span>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed mb-3">{desc}</p>
    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">{linkText || 'Learn More'} <ExternalLink className="w-3 h-3" /></a>}
  </div>
);

const FAQ = ({ q, a, open, toggle }) => (
  <div className="border-b border-gray-200">
    <button onClick={toggle} className="w-full flex items-center justify-between py-4 text-left">
      <span className="font-semibold text-gray-800 pr-4">{q}</span>
      <ChevronRight className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
    </button>
    {open && <div className="pb-4 text-gray-600 text-sm leading-relaxed">{a}</div>}
  </div>
);

/* ═══════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════ */
const CityFirstTimeHomeBuyer = () => {
  const { slug } = useParams();
  const cityData = CITY_DATA[slug];
  const [openFaq, setOpenFaq] = useState(null);

  useSEO({ title: `${cityData?.city || ''} First Time Home Buyer`, description: `Complete guide for ${cityData?.city || ''} first time home buyers.` });

  if (!cityData) return <Navigate to="/locations" replace />;

  const { city, state, stateFullName } = cityData;

  const faqs = [
    { q: `What credit score do I need to buy a house in ${city}?`, a: `FHA loans require a minimum 580 credit score with 3.5% down, or 500 with 10% down. Conventional loans typically need 620+. However, a higher score (700+) gets you significantly better interest rates that save tens of thousands over the life of the loan.` },
    { q: `Can I combine the ${cityData.primaryGrant} ${cityData.primaryGrantName} grant with other programs?`, a: `Yes! You can stack multiple assistance programs. Some ${city} buyers have combined grants totaling $20,000-$25,000+ in assistance. Check with your lender and housing counselor for compatible programs.` },
    { q: 'How long does the homebuyer education course take?', a: 'Most HUD-approved courses take 6-8 hours and can be completed in one day (in-person) or over a weekend (online). The certificate is valid for 2 years from the date of completion.' },
    { q: 'Does credit repair really lower my interest rate?', a: `Absolutely. Moving from a 640 to a 760 credit score can reduce your interest rate by 2+ percentage points. On a $${fmtInt(cityData.medianHome - 10000)} mortgage, that saves roughly $150-200/month or $54,000-$72,000 over 30 years.` },
    { q: 'What is PMI and can I avoid it?', a: 'Private Mortgage Insurance (PMI) is required when your down payment is less than 20%. It typically costs 0.22%-1.85% of your loan amount per year depending on your credit score. Higher credit scores mean lower PMI rates.' },
    { q: 'How long does it take to improve my credit score?', a: 'Most Credlocity clients see significant improvement in 3-7 months. We dispute inaccurate items on all 3 bureaus using FCRA-compliant methods. The average client sees a 236-point increase.' },
    { q: `Are there income limits for ${city} home buyer grants?`, a: `Yes. Most grant programs have household income limits that vary by household size and are updated annually. Contact the administering agency or a HUD-approved counselor for current limits.` },
    { q: `What closing costs should I expect in ${city}?`, a: `Closing costs in ${stateFullName} typically run 2-5% of the purchase price, including transfer taxes, title insurance, appraisal, and lender fees. Some grants can also cover closing costs.` },
  ];

  const schema = {
    "@context": "https://schema.org", "@type": "Article",
    "headline": `${city} First-Time Home Buyer Guide 2025-2026`,
    "description": `Complete guide to buying your first home in ${city}, ${state}. Grants, credit score requirements, mortgage calculator, and resources.`,
    "author": { "@type": "Organization", "name": "Credlocity Business Group LLC" },
    "publisher": { "@type": "Organization", "name": "Credlocity", "url": "https://www.credlocity.com" },
    "mainEntityOfPage": `https://www.credlocity.com/${slug}/first-time-home-buyer`,
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
  };

  // Compute the 620 vs 760 comparison for this city's median home
  const compLoan = cityData.medianHome - (cityData.medianHome * 0.035) - parseInt((cityData.primaryGrant || '$10000').replace(/[^0-9]/g, ''));
  const r620 = 8.50 / 100 / 12; const r760 = 6.25 / 100 / 12;
  const pi620 = compLoan * (r620 * Math.pow(1 + r620, 360)) / (Math.pow(1 + r620, 360) - 1);
  const pi760 = compLoan * (r760 * Math.pow(1 + r760, 360)) / (Math.pow(1 + r760, 360) - 1);
  const totalSavings = fmtInt((pi620 * 360) - (pi760 * 360) + ((compLoan * 0.011 / 12) - (compLoan * 0.0022 / 12)) * 360);

  return (
    <div className="min-h-screen bg-white" data-testid="city-homebuyer-page">
      <Helmet>
        <title>{city} First Time Home Buyer Guide 2026 | {cityData.primaryGrant} Grant, Calculator & Resources</title>
        <meta name="description" content={`Complete ${city} first time home buyer guide. Learn about the ${cityData.primaryGrant} ${cityData.primaryGrantName} grant, stackable grants, credit score requirements, homebuyer courses, and use our mortgage calculator.`} />
        <meta name="keywords" content={`${city.toLowerCase()} first time home buyer, ${city.toLowerCase()} home buyer grant, first time home buyer ${city} ${state}, ${city.toLowerCase()} homebuyer education, credit score to buy house ${city.toLowerCase()}, ${city.toLowerCase()} mortgage calculator`} />
        <link rel="canonical" href={`https://www.credlocity.com/${slug}/first-time-home-buyer`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-8 flex-wrap" data-testid="homebuyer-breadcrumb">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/locations" className="hover:text-white transition">Locations</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/${slug}`} className="hover:text-white transition">{city}, {state}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">First-Time Home Buyer</span>
          </nav>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Home className="w-4 h-4" /> {city} Housing Resource
            </div>
            <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="homebuyer-title">
              {city} First-Time Home Buyer: Complete Guide to Grants, Credit Scores & Savings
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mb-8">
              {city} offers first-time home buyers up to <strong>{cityData.primaryGrant} in grant money</strong> through the {cityData.primaryGrantName} program, plus additional stackable grants. Your credit score determines if you qualify and how much you'll pay in interest. This guide covers everything you need.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {['Grants', 'Credit Scores', 'Calculator', 'Courses', 'Resources'].map(t => (
                <a key={t} href={`#${t.toLowerCase().replace(' ', '-')}`} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky TOC */}
      <section className="py-3 bg-gray-50 border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 overflow-x-auto text-sm scrollbar-hide">
            <span className="text-gray-500 shrink-0 font-semibold">Jump to:</span>
            {[{ id: 'grants', l: 'Grants' }, { id: 'credit-scores', l: 'Credit Scores' }, { id: 'why-credit-repair', l: 'Why Credit Repair' }, { id: 'calculator', l: 'Calculator' }, { id: 'courses', l: 'Courses' }, { id: 'steps', l: 'Step-by-Step' }, { id: 'resources', l: 'Resources' }, { id: 'faqs', l: 'FAQs' }].map(x => (
              <a key={x.id} href={`#${x.id}`} className="text-primary hover:underline whitespace-nowrap shrink-0">{x.l}</a>
            ))}
          </div>
        </div>
      </section>

      {/* Grants */}
      <section id="grants" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-700" /></div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold">{city} First-Time Home Buyer Grants & Assistance</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-8">
            {city}, {stateFullName} offers several programs to help first-time home buyers with down payment and closing cost assistance. The primary program provides up to <strong>{cityData.primaryGrant}</strong> through {cityData.primaryGrantName}. Here are all the programs you may be eligible for:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {cityData.grants.map(g => <GrantCard key={g.title} {...g} />)}
          </div>
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800"><AlertTriangle className="w-4 h-4 inline mr-1" /> <strong>Important:</strong> Grant programs have limited funding and may change. Always verify current availability directly with the administering agency.</p>
          </div>
        </div>
      </section>

      {/* Credit Scores */}
      <section id="credit-scores" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><TrendingDown className="w-6 h-6 text-blue-700" /></div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold">Credit Score Requirements for {city} Home Buyers</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-8">Your credit score is the single most important factor in determining your mortgage interest rate:</p>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead><tr className="bg-primary text-white"><th className="text-left p-4 font-semibold">Loan Type</th><th className="text-center p-4 font-semibold">Min. Score</th><th className="text-center p-4 font-semibold">Down Payment</th><th className="text-center p-4 font-semibold">PMI?</th></tr></thead>
              <tbody>
                <tr className="border-b"><td className="p-4 font-medium">FHA Loan</td><td className="text-center p-4"><strong>580</strong></td><td className="text-center p-4">3.5%</td><td className="text-center p-4">Yes (MIP)</td></tr>
                <tr className="border-b bg-gray-50"><td className="p-4 font-medium">FHA (Higher Down)</td><td className="text-center p-4"><strong>500</strong></td><td className="text-center p-4">10%</td><td className="text-center p-4">Yes (MIP)</td></tr>
                <tr className="border-b"><td className="p-4 font-medium">Conventional</td><td className="text-center p-4"><strong>620</strong></td><td className="text-center p-4">3-5%</td><td className="text-center p-4">If &lt;20% down</td></tr>
                <tr className="border-b bg-gray-50"><td className="p-4 font-medium">VA Loan (Veterans)</td><td className="text-center p-4"><strong>580*</strong></td><td className="text-center p-4">0%</td><td className="text-center p-4">No</td></tr>
                <tr><td className="p-4 font-medium">USDA Loan</td><td className="text-center p-4"><strong>640</strong></td><td className="text-center p-4">0%</td><td className="text-center p-4">Guarantee fee</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-cinzel font-semibold text-lg mb-4">How Credit Score Affects Your Interest Rate</h3>
            <div className="space-y-3">
              {RATE_TIERS.map(t => (
                <div key={t.min} className="flex items-center gap-3">
                  <span className={`w-20 text-sm font-mono font-bold ${t.min >= 700 ? 'text-green-600' : t.min >= 640 ? 'text-yellow-600' : 'text-red-600'}`}>{t.min}-{t.max}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div className={`h-full rounded-full flex items-center px-2 text-white text-xs font-semibold ${t.min >= 700 ? 'bg-green-500' : t.min >= 640 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (t.rate / 11) * 100)}%` }}>{t.rate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Credit Repair */}
      <section id="why-credit-repair" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Shield className="w-6 h-6 text-purple-700" /></div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold">Why Credit Repair Matters &mdash; Even With the Minimum Score</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-8">
            Many {city} residents think, "I have a 620 score — that's enough for an FHA loan." While technically true, <strong>buying at the minimum score costs you tens of thousands of dollars</strong> in higher interest.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h3 className="font-cinzel font-semibold text-lg mb-1 text-red-800">Score: 620 (Minimum FHA)</h3>
              <p className="text-sm text-red-600 mb-4">Interest Rate: 8.50%</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Monthly P&I:</span><span className="font-bold text-red-700">${fmt(pi620)}</span></div>
                <div className="flex justify-between"><span>Total Interest (30yr):</span><span className="font-bold text-red-700">${fmtInt(pi620 * 360 - compLoan)}</span></div>
                <div className="flex justify-between"><span>PMI (1.10%/yr):</span><span className="font-bold text-red-700">${fmt(compLoan * 0.011 / 12)}/mo</span></div>
              </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="font-cinzel font-semibold text-lg mb-1 text-green-800">Score: 760+ (After Credit Repair)</h3>
              <p className="text-sm text-green-600 mb-4">Interest Rate: 6.25%</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Monthly P&I:</span><span className="font-bold text-green-700">${fmt(pi760)}</span></div>
                <div className="flex justify-between"><span>Total Interest (30yr):</span><span className="font-bold text-green-700">${fmtInt(pi760 * 360 - compLoan)}</span></div>
                <div className="flex justify-between"><span>PMI (0.22%/yr):</span><span className="font-bold text-green-700">${fmt(compLoan * 0.0022 / 12)}/mo</span></div>
              </div>
            </div>
          </div>
          <div className="bg-primary text-white rounded-2xl p-8 text-center mb-8">
            <p className="text-sm uppercase tracking-wider mb-2 text-gray-300">Total Lifetime Savings With Credit Repair</p>
            <p className="text-4xl md:text-5xl font-cinzel font-bold mb-2" data-testid="lifetime-savings">${totalSavings}+</p>
            <p className="text-gray-300">Higher credit score = Lower rate + Lower PMI + More home equity</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-cinzel font-semibold text-lg mb-3">How Credlocity Helps {city} Home Buyers</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              {['Dispute inaccurate items on all 3 credit bureaus', 'Remove erroneous collections and charge-offs', 'Negotiate pay-for-delete agreements with creditors', 'One-on-one credit coaching for mortgage readiness', 'Average 236-point score increase in 3-7 months', 'FCRA-compliant, Board Certified processes'].map(t => (
                <div key={t} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {t}</div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrialButton className="bg-primary hover:bg-primary-dark text-white" size="lg">Start Free Credit Analysis</TrialButton>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" size="lg" asChild><Link to="/pricing">View Pricing</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold mb-3">{city} Mortgage Payment Calculator</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">See exactly how the {cityData.primaryGrant} grant, your credit score, PMI, property taxes, and insurance affect your monthly mortgage payment.</p>
          </div>
          <MortgageCalculator cityData={cityData} />
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><GraduationCap className="w-6 h-6 text-amber-700" /></div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold">{city} Homebuyer Education Courses</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-8">Most first-time home buyer programs require completion of a HUD-approved homebuyer education course. Here are approved providers serving {city}:</p>
          <div className="space-y-4">
            {cityData.courses.map(c => (
              <div key={c.name} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">{c.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{c.desc}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">Website <ExternalLink className="w-3 h-3" /></a>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">HUD-Approved</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <BookOpen className="w-4 h-4 inline mr-1" /> <strong>Online Option:</strong> Framework by NeighborWorks (<a href="https://www.frameworkhomeownership.org" target="_blank" rel="noopener noreferrer" className="underline">frameworkhomeownership.org</a>) offers HUD-approved online courses you can complete at your own pace.
          </div>
        </div>
      </section>

      {/* Step-by-Step */}
      <section id="steps" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center mb-10">Your Step-by-Step Path to Homeownership in {city}</h2>
          <div className="space-y-6">
            {[
              { step: 1, title: 'Check Your Credit Report', desc: 'Get your free credit report from AnnualCreditReport.com. Review all 3 bureaus for errors and inaccuracies.', link: '/tools/credit-score-calculator', linkText: 'Use Our Credit Score Calculator' },
              { step: 2, title: 'Repair Your Credit', desc: `If your score is below 700, professional credit repair can save you tens of thousands in interest. Credlocity's average client sees a 236-point increase in 3-7 months.`, link: '/pricing', linkText: 'View Credit Repair Plans' },
              { step: 3, title: 'Complete Homebuyer Education', desc: 'Take a HUD-approved course (required for most grants). Most courses take just 6-8 hours.', link: '#courses', linkText: 'View Course Providers' },
              { step: 4, title: 'Apply for Grants', desc: `Apply for the ${cityData.primaryGrant} ${cityData.primaryGrantName} grant and other assistance programs you qualify for.`, link: '#grants', linkText: 'View All Grants' },
              { step: 5, title: 'Get Pre-Approved', desc: 'With your improved credit score and grant approval, get pre-approved by a lender.', link: '#calculator', linkText: 'Estimate Your Payment' },
              { step: 6, title: `Find Your ${city} Home`, desc: `Work with a local real estate agent experienced with first-time buyer programs in ${city}.`, link: `/${slug}`, linkText: `${city} Credit Repair Services` },
            ].map(s => (
              <div key={s.step} className="flex gap-4 md:gap-6">
                <div className="shrink-0"><div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-cinzel font-bold text-lg">{s.step}</div></div>
                <div className="pb-6 border-b border-gray-200 flex-1">
                  <h3 className="font-cinzel font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">{s.desc}</p>
                  {s.link && (s.link.startsWith('#') ? <a href={s.link} className="text-primary hover:underline text-sm flex items-center gap-1">{s.linkText} <ArrowRight className="w-3 h-3" /></a> : <Link to={s.link} className="text-primary hover:underline text-sm flex items-center gap-1">{s.linkText} <ArrowRight className="w-3 h-3" /></Link>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><Building2 className="w-6 h-6 text-teal-700" /></div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold">{city} Housing Resources</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {cityData.resources.map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition group block">
                <div className="flex items-start gap-3">
                  <r.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div><h3 className="font-semibold text-sm group-hover:text-primary transition">{r.name}</h3><p className="text-xs text-gray-600 mt-1">{r.desc}</p></div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} open={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* Interlinks */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-cinzel text-xl font-bold mb-6">Related Credlocity Resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { to: `/${slug}`, label: `Credit Repair ${city}`, icon: MapPin },
              { to: '/tools/credit-score-calculator', label: 'Credit Score Calculator', icon: Calculator },
              { to: '/tools/mortgage-calculator', label: 'Mortgage Calculator', icon: Home },
              { to: '/tools/debt-to-income-calculator', label: 'DTI Calculator', icon: Percent },
              { to: '/free-letters', label: 'Free Dispute Letters', icon: FileText },
              { to: '/pricing', label: 'Credit Repair Pricing', icon: Star },
              { to: '/credit-repair-scams', label: 'Scam Checker Tool', icon: Shield },
              { to: '/how-it-works', label: 'How Credit Repair Works', icon: BookOpen },
              { to: '/locations', label: 'All Locations', icon: Building2 },
            ].map(l => (
              <Link key={l.to} to={l.to} className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-lg hover:bg-primary/5 transition">
                <l.icon className="w-4 h-4 shrink-0" /> {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Ready to Buy Your First Home in {city}?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">Let Credlocity help you improve your credit score to qualify for the best mortgage rates and save thousands.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <TrialButton size="lg" className="bg-secondary-green hover:bg-secondary-light text-white font-semibold px-8">Start Free Credit Analysis</TrialButton>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <a href={`tel:${cityData.phoneTel}`}><Phone className="w-4 h-4 mr-2" /> {cityData.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityFirstTimeHomeBuyer;
