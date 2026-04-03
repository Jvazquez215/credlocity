/**
 * Collection Agency Data for Dispute Guide Pages
 * Used by DisputeCollectionAgency.js dynamic component
 */

export const COLLECTION_AGENCIES = {
  'ccs-collection-services': {
    name: 'CCS Collection Services',
    slug: 'ccs-collection-services',
    aka: ['CCS Collections', 'Credit Collection Services'],
    headquarters: 'Norwood, MA',
    founded: '1969',
    description: 'Credit Collection Services (CCS) is a third-party debt collection agency based in Massachusetts that collects debts for healthcare providers, financial institutions, telecommunications companies, and government agencies. They are one of the larger collection agencies in the United States.',
    whatTheyCollect: ['Medical debts and hospital bills', 'Credit card debts', 'Telecommunications bills (phone, internet, cable)', 'Utility debts', 'Government debts and fines', 'Student loans'],
    commonComplaints: [
      'Attempting to collect debts already paid or settled',
      'Reporting inaccurate information to credit bureaus',
      'Calling at inappropriate times or with excessive frequency',
      'Failing to provide proper debt validation within required timeframes',
      'Continuing collection activity after receiving a dispute letter',
      'Contacting consumers at their workplace after being told not to'
    ],
    cfpbComplaints: '5,200+',
    disputeStrategy: 'CCS often collects medical debts that have already been paid by insurance. Always request an itemized statement from the original provider and compare it against your insurance Explanation of Benefits (EOB). Medical billing errors are extremely common — the American Medical Association estimates up to 30% of medical bills contain errors.',
    specificTips: [
      'Request the original signed contract or agreement — CCS often cannot produce it for purchased debts',
      'If this is a medical debt, contact your insurance company first to verify what was covered',
      'Ask CCS for the date of first delinquency — this determines how long the item can stay on your report',
      'Check if the debt is past the statute of limitations in your state before making any payment',
      'CCS has been known to re-age debts — verify the original delinquency date matches your records'
    ],
    knownViolations: 'CCS has faced enforcement actions from the CFPB and state attorneys general for unfair debt collection practices, including collecting on debts that were not owed and failing to properly investigate consumer disputes.'
  },

  'lvnv-funding': {
    name: 'LVNV Funding',
    slug: 'lvnv-funding',
    aka: ['LVNV Funding LLC', 'Resurgent Capital Services (servicing arm)'],
    headquarters: 'Greenville, SC',
    founded: '1998',
    description: 'LVNV Funding is a debt buyer — they purchase defaulted debts from original creditors for pennies on the dollar and then attempt to collect the full amount. They are a subsidiary of Sherman Financial Group, one of the largest debt buying companies in the country. Their accounts are typically serviced by Resurgent Capital Services.',
    whatTheyCollect: ['Purchased credit card debts', 'Personal loans', 'Retail store credit accounts', 'Auto deficiency balances', 'Medical debts purchased in bulk', 'Telecommunications debts'],
    commonComplaints: [
      'Attempting to collect on debts past the statute of limitations (zombie debts)',
      'Inability to provide original account documentation',
      'Reporting inaccurate account information to credit bureaus',
      'Adding unauthorized fees and interest to original debt amounts',
      'Reselling debts to other collectors after consumer disputes',
      'Failing to mark accounts as disputed when required'
    ],
    cfpbComplaints: '12,000+',
    disputeStrategy: 'As a debt buyer, LVNV typically purchases debts in bulk for 3-5 cents on the dollar. They often lack original account documents, signed agreements, and complete payment histories. This is your biggest advantage — demand full documentation under Section 609 and 611 of the FCRA. Without the original signed agreement, they cannot legally verify the debt.',
    specificTips: [
      'LVNV is a debt BUYER, not the original creditor — they must prove the chain of ownership from original creditor to them',
      'Demand the original signed credit agreement, not just a printout of account details',
      'Request a complete payment history from the original creditor through LVNV',
      'Check if the debt has been sold again — LVNV sometimes sells debts they cannot collect on',
      'LVNV debts are often several years old — check your state statute of limitations before any contact',
      'Their servicing arm, Resurgent Capital Services, handles day-to-day collections — disputes can go to either entity'
    ],
    knownViolations: 'LVNV Funding and its affiliates have been the subject of numerous lawsuits and regulatory actions. The FTC has taken action against Sherman Financial Group entities for deceptive practices. Multiple state attorneys general have investigated LVNV for attempting to collect time-barred debts.'
  },

  'caine-and-weiner': {
    name: 'Caine & Weiner',
    slug: 'caine-and-weiner',
    aka: ['Caine & Weiner Inc.', 'C&W Collections'],
    headquarters: 'Sherman Oaks, CA',
    founded: '1930',
    description: 'Caine & Weiner is one of the oldest collection agencies in the United States, operating since 1930. They collect debts for healthcare systems, financial institutions, educational institutions, government agencies, and commercial businesses. They are headquartered in California with offices nationwide.',
    whatTheyCollect: ['Healthcare and hospital debts', 'Government agency debts', 'Educational institution debts (tuition, fees)', 'Commercial business debts', 'Financial institution debts', 'Property management debts'],
    commonComplaints: [
      'Aggressive calling patterns — multiple calls per day',
      'Collecting debts that consumers do not recognize',
      'Insufficient documentation when validating debts',
      'Continuing to call after cease and desist requests',
      'Inaccurate reporting of debt amounts to credit bureaus',
      'Threatening legal action they do not intend to take'
    ],
    cfpbComplaints: '1,800+',
    disputeStrategy: 'Caine & Weiner frequently collects institutional debts (hospitals, universities, government). Request detailed documentation from the ORIGINAL institution, not just what Caine & Weiner provides. Institutional debts often have billing errors, insurance coverage gaps, or financial hardship provisions that were never applied.',
    specificTips: [
      'If this is a hospital debt, request an itemized bill and compare with your insurance EOB — billing errors are common',
      'For educational debts, check if you were eligible for financial aid, hardship deferrals, or institutional forgiveness programs',
      'Caine & Weiner is a contingency collector (collects on behalf of others) — the original creditor still owns the debt',
      'Since they collect on behalf of the original creditor, send your dispute to BOTH Caine & Weiner AND the original creditor',
      'Request proof of their authorization to collect — they must have a valid assignment from the original creditor'
    ],
    knownViolations: 'Caine & Weiner has received complaints filed with the CFPB regarding calling practices and insufficient debt validation. As a contingency collector, they are fully subject to the FDCPA.'
  },

  'alliance-one': {
    name: 'Alliance One',
    slug: 'alliance-one',
    aka: ['Alliance One Receivables Management', 'Alliance One Inc.'],
    headquarters: 'Dallas, TX',
    founded: '1993',
    description: 'Alliance One Receivables Management is a large debt collection agency that specializes in government receivables, toll violations, parking tickets, court fines, and utility debts. They are one of the primary collectors used by state and local government agencies across the United States.',
    whatTheyCollect: ['Toll violations and E-ZPass debts', 'Parking tickets and traffic fines', 'Court costs and legal fines', 'Utility debts (water, electric, gas)', 'State tax debts', 'Government agency receivables'],
    commonComplaints: [
      'Collecting on toll violations consumers were never notified about',
      'Inflating original fine amounts with unauthorized fees',
      'Failing to properly identify themselves in communications',
      'Not providing adequate documentation for government debts',
      'Placing items on credit reports without prior notice',
      'Difficulty reaching a human representative'
    ],
    cfpbComplaints: '2,500+',
    disputeStrategy: 'Alliance One primarily collects government debts — tolls, fines, and utility bills. Many of these debts are the result of administrative errors (wrong license plate, wrong address, paid but not recorded). Contact the ORIGINAL government agency directly to verify the debt exists and the amount is correct before dealing with Alliance One.',
    specificTips: [
      'For toll violations, request photos/evidence of the actual violation — many are misread license plates',
      'Government debts may have different statute of limitations rules than consumer debts',
      'Some states exempt government debts from FDCPA protections — check your state laws',
      'If the debt is a utility bill, contact the utility company directly to verify and potentially set up a payment plan',
      'Request the original notice of violation — if you were never properly notified, the debt may be invalid',
      'Alliance One often adds late fees and collection fees on top of the original fine — challenge any added charges'
    ],
    knownViolations: 'Alliance One has been the subject of consumer complaints regarding the addition of unauthorized fees to government debts and failure to properly validate debts when challenged.'
  },

  'harris-and-harris': {
    name: 'Harris & Harris',
    slug: 'harris-and-harris',
    aka: ['Harris & Harris Ltd.', 'Harris and Harris Group'],
    headquarters: 'Chicago, IL',
    founded: '1968',
    description: 'Harris & Harris is a debt collection firm that primarily collects on behalf of utility companies, municipalities, healthcare providers, and telecommunications companies. They are based in Chicago and operate throughout the United States.',
    whatTheyCollect: ['Utility debts (electric, gas, water)', 'Municipal debts and city fines', 'Healthcare and medical debts', 'Telecommunications debts', 'Toll and parking debts', 'Commercial receivables'],
    commonComplaints: [
      'Aggressive and repeated calling patterns',
      'Collecting debts that have already been paid to the original creditor',
      'Failure to send written validation notices within 5 days of initial contact',
      'Continuing collection on disputed debts without providing verification',
      'Misrepresenting the legal consequences of not paying',
      'Reporting debts to credit bureaus before proper validation'
    ],
    cfpbComplaints: '3,100+',
    disputeStrategy: 'Harris & Harris frequently collects utility and municipal debts. These debts often have complex billing structures with multiple charges, late fees, and penalties. Request an itemized breakdown of ALL charges from the original utility company. Utility billing errors — especially estimated meter reads and rate changes — are surprisingly common.',
    specificTips: [
      'Contact your utility company directly to verify the debt — they may have records of payments Harris & Harris does not',
      'Request the meter reading records if disputing a utility bill amount',
      'For municipal debts, check if there is a hearing or appeal process available through the city',
      'Harris & Harris is a contingency collector — the original creditor retains ownership of the debt',
      'If you have proof of payment to the original creditor, send it to Harris & Harris with a cease collection demand',
      'Check if your state has specific protections for utility debt collection'
    ],
    knownViolations: 'Harris & Harris has faced regulatory scrutiny regarding their calling practices and debt validation procedures. Multiple consumers have reported successful FDCPA claims against the company.'
  },

  'midland-credit-management': {
    name: 'Midland Credit Management',
    slug: 'midland-credit-management',
    aka: ['MCM', 'Midland Funding', 'Encore Capital Group subsidiary'],
    headquarters: 'San Diego, CA',
    founded: '1953',
    description: 'Midland Credit Management (MCM) is one of the largest debt buyers in the United States. They are a subsidiary of Encore Capital Group and purchase defaulted consumer debts in bulk. MCM is one of the most aggressive debt collectors in the country, frequently filing lawsuits against consumers.',
    whatTheyCollect: ['Purchased credit card debts', 'Personal loan defaults', 'Retail credit accounts', 'Auto loan deficiencies', 'Telecommunications debts', 'Banking overdrafts and charged-off accounts'],
    commonComplaints: [
      'Filing lawsuits on debts past the statute of limitations',
      'Inability to produce original signed agreements',
      'Suing consumers who dispute debts rather than providing validation',
      'Adding fees and interest not in the original agreement',
      'Purchasing and attempting to collect debts already settled',
      'Using sworn affidavits based on incomplete records'
    ],
    cfpbComplaints: '15,000+',
    disputeStrategy: 'MCM is a debt BUYER that purchases defaulted debts for pennies on the dollar. They are notorious for filing lawsuits — they file more collection lawsuits than almost any other company. Your best defense is demanding proof of ownership and the original signed agreement. MCM frequently cannot produce these documents because they purchase debts in bulk with minimal documentation.',
    specificTips: [
      'MCM is owned by Encore Capital Group — both entities may appear on your credit report for the same debt',
      'If MCM sues you, DO NOT IGNORE IT — file an answer with the court and demand proof of debt ownership',
      'Request the Bill of Sale showing the chain of ownership from original creditor to MCM',
      'MCM uses robo-signed affidavits — challenge the basis of any affidavit they submit as evidence',
      'Check if the debt is past the statute of limitations — MCM has been penalized for suing on time-barred debts',
      'MCM settled with the CFPB for $42 million in 2015 for illegal practices — know your rights'
    ],
    knownViolations: 'Encore Capital Group / Midland Credit Management entered into a consent order with the CFPB in September 2015, paying $42 million in consumer relief and a $10 million penalty for using deceptive tactics, collecting debts consumers did not owe, and suing consumers using robo-signed affidavits.'
  },

  'portfolio-recovery-associates': {
    name: 'Portfolio Recovery Associates',
    slug: 'portfolio-recovery-associates',
    aka: ['PRA', 'PRA Group', 'Portfolio Recovery Associates LLC'],
    headquarters: 'Norfolk, VA',
    founded: '1996',
    description: 'Portfolio Recovery Associates (PRA) is one of the largest publicly traded debt buyers in the United States. A subsidiary of PRA Group, they purchase and collect defaulted consumer receivables, including credit card debts, consumer loans, and auto deficiency balances. PRA is traded on NASDAQ under ticker PRAA.',
    whatTheyCollect: ['Purchased credit card debts', 'Consumer loan defaults', 'Auto loan deficiency balances', 'Retail credit defaults', 'Banking products (overdrafts, lines of credit)', 'Private student loan defaults'],
    commonComplaints: [
      'Collecting on debts consumers do not recognize',
      'Inability to provide adequate documentation when debts are disputed',
      'Reporting debts to credit bureaus without proper validation',
      'Attempting to collect time-barred debts',
      'Offering "settlements" on debts they cannot prove are owed',
      'Aggressive calling and threatening legal action'
    ],
    cfpbComplaints: '10,000+',
    disputeStrategy: 'PRA is a publicly traded debt buyer — they purchase debts in bulk portfolios, often with minimal documentation. As a public company, they are more responsive to regulatory complaints and documented disputes than smaller collectors. File complaints with the CFPB and your state AG simultaneously with your dispute to PRA — this significantly increases the chances of resolution.',
    specificTips: [
      'PRA Group is publicly traded (NASDAQ: PRAA) — they are sensitive to regulatory scrutiny and public complaints',
      'Demand the original account agreement, complete payment history, and bill of sale',
      'PRA often offers settlements of 25-40% of the claimed balance — but only settle if they can prove the debt is yours',
      'File a CFPB complaint at the same time as your dispute letter — PRA must respond to CFPB complaints within 15 days',
      'If PRA is reporting an inaccurate balance, dispute directly with all three credit bureaus simultaneously',
      'PRA has been required to implement compliance monitoring — reference their consent orders in your dispute letters'
    ],
    knownViolations: 'PRA Group has been the subject of multiple regulatory actions. In 2015, the CFPB ordered PRA to refund $19 million to consumers for collecting debts that consumers had already paid, were not owed, or were discharged in bankruptcy.'
  },

  'encore-capital-group': {
    name: 'Encore Capital Group',
    slug: 'encore-capital-group',
    aka: ['Encore Capital', 'Midland Funding (subsidiary)', 'Midland Credit Management (subsidiary)'],
    headquarters: 'San Diego, CA',
    founded: '1999',
    description: 'Encore Capital Group is one of the largest debt buyers in the world, publicly traded on NASDAQ under ticker ECPG. They are the parent company of Midland Credit Management (MCM) and Midland Funding. Together, they purchase and collect billions of dollars in defaulted consumer debts annually across the United States and internationally.',
    whatTheyCollect: ['Purchased credit card debts (their primary business)', 'Consumer loan defaults', 'Retail credit defaults', 'Banking product defaults', 'Auto loan deficiencies', 'International consumer debts'],
    commonComplaints: [
      'Same complaints as Midland Credit Management (their subsidiary)',
      'Double-reporting debts through both Encore and Midland entities',
      'Filing high volumes of collection lawsuits with insufficient documentation',
      'Using robo-signed affidavits as evidence in court',
      'Collecting on debts discharged in bankruptcy',
      'Misrepresenting the legal status of time-barred debts'
    ],
    cfpbComplaints: '8,000+ (excluding Midland Credit Management complaints)',
    disputeStrategy: 'Encore Capital Group and Midland Credit Management are the SAME company. If you see both names on your credit report, check if they are reporting the SAME debt twice — this is a common tactic that violates the FCRA. Dispute any duplicate reporting immediately. The CFPB consent order from 2015 specifically addressed Encore\'s deceptive practices — reference this in your disputes.',
    specificTips: [
      'Check if BOTH Encore Capital AND Midland Credit Management appear on your report — this may be duplicate reporting of the same debt',
      'Reference the 2015 CFPB consent order (File No. 2015-CFPB-0022) in your dispute letters — it gives you extra leverage',
      'Encore paid $42 million in the CFPB settlement — they are under enhanced regulatory scrutiny',
      'Demand the complete chain of ownership from the original creditor through every sale to Encore',
      'If Encore sues, demand they produce the original signed agreement — not a computer printout or recreated document',
      'As a public company (NASDAQ: ECPG), a well-documented complaint to the CFPB carries significant weight'
    ],
    knownViolations: 'In 2015, the CFPB ordered Encore Capital Group and its subsidiaries to pay $42 million to consumers and a $10 million civil penalty for collecting debts consumers did not owe, using robo-signed court documents, and deceiving consumers about the legal status of their debts. The company remains under enhanced CFPB supervision.'
  }
};

export const AGENCY_LIST = Object.values(COLLECTION_AGENCIES);

export const AGENCY_SLUGS = Object.keys(COLLECTION_AGENCIES);
