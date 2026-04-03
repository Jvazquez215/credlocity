"""
Seed script for the CROA Ethics School courses.
Contains real content, citations, and quiz questions for:
1. CROA Basics (20 questions, 80% pass)
2. FCRA Certification (50 questions, 75% pass)
3. Credit Repair Ethics (20 questions, 80% pass)
"""

COURSES = [
    {
        "id": "croa-basics",
        "title": "CROA Basics Certification",
        "short_name": "CROA",
        "description": "Learn the fundamentals of the Credit Repair Organizations Act (CROA) — the federal law governing credit repair companies. This course covers prohibited practices, required disclosures, consumer rights, and compliance obligations.",
        "badge_color": "#1a365d",
        "badge_accent": "#c6a035",
        "price": 0,
        "is_free": True,
        "status": "published",
        "order": 1,
        "duration": "2-3 hours",
        "total_questions": 20,
        "passing_score": 80,
        "image_url": "",
        "lessons": [
            {
                "title": "Introduction to CROA",
                "type": "reading",
                "content": """# The Credit Repair Organizations Act (CROA)

## What is CROA?

The **Credit Repair Organizations Act (CROA)**, codified at **15 U.S.C. sections 1679-1679j**, is a federal law enacted in 1996 as part of the Consumer Credit Protection Act. It was designed to protect consumers from deceptive practices by credit repair organizations.

> **"The Congress makes the following findings: (1) Consumers have a fundamental right to self-help with respect to improving their own credit records. (2) Certain advertising and business practices of some companies engaged in the business of credit repair services have worked a financial hardship upon consumers."**
> — 15 U.S.C. § 1679(a)

## Why Was CROA Enacted?

Congress found that the credit repair industry was plagued by fraud and deceptive practices. Many companies were charging consumers large upfront fees, making false promises about removing accurate negative information, and failing to deliver on their promises.

The law establishes specific rules that credit repair organizations must follow and gives consumers important rights when dealing with these companies.

## Who Does CROA Apply To?

CROA defines a **"credit repair organization"** as:

> **"Any person who uses any instrumentality of interstate commerce or the mails to sell, provide, or perform (or represent that such person can or will sell, provide, or perform) any service, in return for the payment of money or other valuable consideration, for the express or implied purpose of (i) improving any consumer's credit record, credit history, or credit rating; or (ii) providing advice or assistance to any consumer with regard to any activity or service [for improving credit]."**
> — 15 U.S.C. § 1679a(3)

### Exemptions:
- 501(c)(3) nonprofit organizations
- Creditors making credit decisions
- Depository institutions (banks and credit unions)
- Licensed real estate brokers (when acting as mortgage brokers)

## Key Takeaway

If you charge money to help consumers improve their credit, **you are subject to CROA**. Understanding this law is not optional — it's a legal requirement for operating a credit repair business."""
            },
            {
                "title": "Prohibited Practices Under CROA",
                "type": "reading",
                "content": """# Prohibited Practices Under CROA

## Section 1679b: What You CANNOT Do

CROA explicitly prohibits several practices. Violating any of these can result in civil liability, FTC enforcement actions, and state attorney general lawsuits.

### 1. No Upfront Fees Before Services Are Fully Performed

> **"No credit repair organization may charge or receive any money or other valuable consideration for the performance of any service which the credit repair organization has agreed to perform for the consumer before such service is fully performed."**
> — 15 U.S.C. § 1679b(b)

This is one of the most important and most violated provisions. You **cannot** collect payment until the promised service has been **fully rendered**. This means:
- No enrollment fees charged before work begins
- No "first month" payments before disputes are sent
- Payment can only be collected after measurable results are delivered

### 2. No False or Misleading Representations

> **"No person may make any statement, or counsel or advise any consumer to make any statement, which is untrue or misleading (or which, upon the exercise of reasonable care, should be known to be untrue or misleading) with respect to any consumer's credit worthiness, credit standing, or credit capacity."**
> — 15 U.S.C. § 1679b(a)(1)

### 3. No Advising Consumers to Alter Their Identity

> **"No person may make any statement, or counsel or advise any consumer to make any statement, the intended effect of which is to alter the consumer's identification to prevent the display of the consumer's credit record."**
> — 15 U.S.C. § 1679b(a)(2)

This means you **cannot**:
- Advise clients to apply for an EIN to use instead of their SSN
- Suggest creating a "new credit file"
- Recommend using CPN (Credit Privacy Numbers)

### 4. No Fraudulent Activity

Credit repair organizations cannot engage in any conduct that constitutes fraud or deception in connection with offering credit repair services.

## Penalties for Violations

Consumers can sue for:
- **Actual damages** sustained
- **Punitive damages** (in individual actions)
- **Attorney's fees and court costs**
- **Statutory damages** in class actions

Additionally, the FTC and state attorneys general can bring enforcement actions."""
            },
            {
                "title": "Required Disclosures and Consumer Rights",
                "type": "reading",
                "content": """# Required Disclosures and Consumer Rights

## The Consumer Credit File Rights Statement

Before any contract is signed, CROA requires credit repair organizations to provide a specific disclosure statement. This must be a **separate document** given to the consumer before they sign anything.

> **"Any credit repair organization shall provide any consumer with the following written statement before any contract or agreement between the consumer and the credit repair organization is executed..."**
> — 15 U.S.C. § 1679c(a)

The required disclosure MUST include:

1. **"You have a right to dispute inaccurate information in your credit report by contacting the credit bureau directly."**

2. **"Neither you nor any 'credit repair' company or credit repair organization has the right to have accurate, current, and verifiable information removed from your credit report."**

3. **"Under the Credit Repair Organizations Act, the credit repair organization cannot require you to waive your rights."**

4. **"You have a right to cancel the contract within 3 business days."**

## The Written Contract Requirement

CROA mandates that every agreement must be **in writing** and include:

> **"(1) the terms and conditions of payment, (2) a full and detailed description of the services to be performed, (3) the date by which the services are to be performed, and (4) the name and principal business address of the credit repair organization."**
> — 15 U.S.C. § 1679d(b)

## The 3-Day Cancellation Right

Consumers have an **absolute right** to cancel any contract with a credit repair organization within **three business days** of signing.

> **"Any consumer may cancel any contract with any credit repair organization without penalty or obligation by notifying the credit repair organization of the consumer's intention to do so at any time before midnight of the third business day which begins after the date on which the contract or agreement between the consumer and the credit repair organization is executed."**
> — 15 U.S.C. § 1679e(a)

## Non-Waivable Rights

A critical protection: **consumers cannot waive their CROA rights**:

> **"Any waiver by any consumer of any protection provided by or any right of the consumer under this subchapter shall be treated as void and may not be enforced by any Federal or State court or any other person."**
> — 15 U.S.C. § 1679f

This means you cannot include any clause in your contract that waives the consumer's rights under CROA, and any such clause is automatically void."""
            }
        ],
        "quiz": {
            "passing_score": 80,
            "questions": [
                {"id": "croa-q1", "question": "What does CROA stand for?", "options": ["Consumer Rights and Obligations Act", "Credit Repair Organizations Act", "Credit Reporting and Operations Act", "Consumer Reporting Organizations Act"], "correct_answer": 1, "explanation": "CROA stands for the Credit Repair Organizations Act, codified at 15 U.S.C. sections 1679-1679j."},
                {"id": "croa-q2", "question": "In what year was CROA enacted?", "options": ["1990", "1994", "1996", "2000"], "correct_answer": 2, "explanation": "CROA was enacted in 1996 as part of the Consumer Credit Protection Act."},
                {"id": "croa-q3", "question": "Under CROA, when can a credit repair organization collect payment?", "options": ["Before starting work", "After the contract is signed", "After services are fully performed", "Within 30 days of signing"], "correct_answer": 2, "explanation": "Per 15 U.S.C. § 1679b(b), no payment can be charged before services are fully performed."},
                {"id": "croa-q4", "question": "Can a credit repair company advise a consumer to use a CPN (Credit Privacy Number)?", "options": ["Yes, if the consumer requests it", "Yes, but only for new credit applications", "No, this is prohibited under CROA", "Yes, as long as it's disclosed"], "correct_answer": 2, "explanation": "15 U.S.C. § 1679b(a)(2) prohibits advising consumers to alter their identification to prevent display of their credit record."},
                {"id": "croa-q5", "question": "How many business days does a consumer have to cancel a credit repair contract?", "options": ["1 day", "3 business days", "5 business days", "7 business days"], "correct_answer": 1, "explanation": "15 U.S.C. § 1679e(a) provides a 3 business day cancellation right."},
                {"id": "croa-q6", "question": "Which of the following is NOT exempt from CROA?", "options": ["501(c)(3) nonprofits", "Banks and credit unions", "For-profit credit repair companies", "Licensed real estate brokers"], "correct_answer": 2, "explanation": "For-profit credit repair companies are fully subject to CROA."},
                {"id": "croa-q7", "question": "What must be provided to the consumer BEFORE signing any credit repair contract?", "options": ["A credit report", "The Consumer Credit File Rights Statement", "A payment plan", "A list of previous clients"], "correct_answer": 1, "explanation": "15 U.S.C. § 1679c(a) requires providing the written Consumer Credit File Rights Statement before any contract is executed."},
                {"id": "croa-q8", "question": "Can a consumer waive their rights under CROA?", "options": ["Yes, in writing", "Yes, if both parties agree", "No, any waiver is void", "Only with court approval"], "correct_answer": 2, "explanation": "15 U.S.C. § 1679f states any waiver of CROA rights is void and unenforceable."},
                {"id": "croa-q9", "question": "What damages can a consumer sue for under CROA?", "options": ["Only actual damages", "Actual damages, punitive damages, and attorney's fees", "Only statutory damages", "No private right of action exists"], "correct_answer": 1, "explanation": "CROA provides for actual damages, punitive damages, and attorney's fees and court costs."},
                {"id": "croa-q10", "question": "A credit repair contract must include all of the following EXCEPT:", "options": ["Terms of payment", "Description of services", "Consumer's credit score", "Date services will be performed"], "correct_answer": 2, "explanation": "15 U.S.C. § 1679d(b) requires terms of payment, description of services, date of performance, and company name/address."},
                {"id": "croa-q11", "question": "CROA is codified at which section of the U.S. Code?", "options": ["15 U.S.C. § 1681", "15 U.S.C. § 1679", "12 U.S.C. § 5511", "28 U.S.C. § 1332"], "correct_answer": 1, "explanation": "CROA is found at 15 U.S.C. sections 1679-1679j."},
                {"id": "croa-q12", "question": "Which federal agency primarily enforces CROA?", "options": ["SEC", "CFPB and FTC", "FBI", "Department of Education"], "correct_answer": 1, "explanation": "The FTC and CFPB are the primary federal enforcers of CROA."},
                {"id": "croa-q13", "question": "A credit repair organization makes a promise to 'guarantee' removal of all negative items. This is:", "options": ["Acceptable if in writing", "A violation of CROA", "Legal if they have a high success rate", "Required by law"], "correct_answer": 1, "explanation": "Making misleading representations about what can be achieved violates 15 U.S.C. § 1679b(a)(1)."},
                {"id": "croa-q14", "question": "The CROA disclosure statement must inform consumers that:", "options": ["Credit repair always works", "They can dispute inaccurate information directly with bureaus", "Only professionals can dispute credit report errors", "Accurate information can be removed"], "correct_answer": 1, "explanation": "The required disclosure must state consumers' right to dispute inaccurate information directly with credit bureaus."},
                {"id": "croa-q15", "question": "If a credit repair contract does not include a cancellation provision, the contract is:", "options": ["Still valid", "Void under CROA", "Valid but the consumer gets extra time", "Only enforceable in state court"], "correct_answer": 1, "explanation": "CROA requires specific contract terms; failure to include them renders the contract void."},
                {"id": "croa-q16", "question": "Charging a $500 'setup fee' before any disputes are sent is:", "options": ["Common industry practice", "Legal under CROA", "A violation of CROA's advance fee ban", "Legal if under $1,000"], "correct_answer": 2, "explanation": "15 U.S.C. § 1679b(b) prohibits charging any money before services are fully performed."},
                {"id": "croa-q17", "question": "Can a credit repair organization have accurate, negative information removed from a credit report?", "options": ["Yes, with the right techniques", "No, accurate and verifiable information cannot be removed", "Yes, after 2 years", "Only if the consumer consents"], "correct_answer": 1, "explanation": "The required CROA disclosure states neither consumers nor credit repair companies can remove accurate, current, and verifiable information."},
                {"id": "croa-q18", "question": "State attorneys general can enforce CROA provisions:", "options": ["True", "False", "Only with FTC permission", "Only for nonprofits"], "correct_answer": 0, "explanation": "State attorneys general have independent authority to enforce CROA."},
                {"id": "croa-q19", "question": "What type of organization is CROA part of?", "options": ["The Securities Act", "The Consumer Credit Protection Act", "The Dodd-Frank Act", "The Fair Housing Act"], "correct_answer": 1, "explanation": "CROA was enacted as part of the Consumer Credit Protection Act."},
                {"id": "croa-q20", "question": "A credit repair company can collect 'per deletion' fees:", "options": ["Before the deletion appears on the report", "Only after the deletion is verified and confirmed", "At any time after signing the contract", "Only for the first 3 deletions"], "correct_answer": 1, "explanation": "Under CROA, fees can only be charged after services are fully performed, meaning after verified results."}
            ]
        }
    },
    {
        "id": "fcra-certification",
        "title": "FCRA Certification",
        "short_name": "FCRA",
        "description": "A comprehensive deep-dive into the Fair Credit Reporting Act (FCRA) — the cornerstone consumer protection law governing credit reporting. Covers the original act, all major amendments, consumer protections, and compliance requirements.",
        "badge_color": "#1e3a5f",
        "badge_accent": "#4da6ff",
        "price": 0,
        "is_free": True,
        "status": "published",
        "order": 2,
        "duration": "4-6 hours",
        "total_questions": 50,
        "passing_score": 75,
        "image_url": "",
        "lessons": [
            {
                "title": "History and Purpose of the FCRA",
                "type": "reading",
                "content": """# The Fair Credit Reporting Act (FCRA)

## Overview

The **Fair Credit Reporting Act (FCRA)**, codified at **15 U.S.C. § 1681 et seq.**, was originally enacted on **October 26, 1970**. It is the primary federal law regulating the collection, dissemination, and use of consumer credit information.

> **"It is the purpose of this subchapter to require that consumer reporting agencies adopt reasonable procedures for meeting the needs of commerce for consumer credit, personnel, insurance, and other information in a manner which is fair and equitable to the consumer, with regard to the confidentiality, accuracy, relevancy, and proper utilization of such information."**
> — 15 U.S.C. § 1681(b)

## Why Was the FCRA Created?

Before the FCRA, credit bureaus operated with virtually no oversight. Consumers had:
- No right to see their own credit files
- No mechanism to dispute inaccurate information
- No knowledge of who was accessing their information
- No protection against outdated negative information

Senator William Proxmire, who championed the bill, stated the law was necessary because **"credit bureaus have grown to be among the most powerful institutions in this country... yet they are virtually unregulated."**

## Key Entities Under the FCRA

1. **Consumer Reporting Agencies (CRAs)** - Companies that compile and sell consumer reports (Equifax, Experian, TransUnion)
2. **Furnishers** - Entities that provide information to CRAs (creditors, lenders, collection agencies)
3. **Users** - Those who obtain consumer reports for permissible purposes"""
            },
            {
                "title": "Major FCRA Amendments",
                "type": "reading",
                "content": """# Major FCRA Amendments

## 1. Consumer Credit Reporting Reform Act of 1996

This was the first major overhaul of the FCRA. Key changes:
- Established the **7-year rule** for most negative items (10 years for bankruptcies)
- Required CRAs to investigate disputes within **30 days**
- Gave consumers the right to **one free report** after adverse action
- Strengthened requirements for furnisher accuracy

## 2. Fair and Accurate Credit Transactions Act (FACTA) — 2003

FACTA was a landmark amendment that significantly expanded consumer rights:

> **"Each consumer reporting agency that maintains a file on a consumer shall make all disclosures pursuant to section 1681g of this title once during any 12-month period upon request of the consumer and without charge."**
> — 15 U.S.C. § 1681j(a)(1)(A)

Key provisions:
- **Free annual credit reports** from each bureau (AnnualCreditReport.com)
- **Fraud alert** rights for identity theft victims
- **Credit freeze** provisions
- **Red flag rules** requiring identity theft prevention programs
- Right to **dispute directly with furnishers** (Section 623)
- **Truncation of credit card numbers** on receipts

## 3. Credit CARD Act of 2009

Added protections for credit card disclosures and marketing to young consumers.

## 4. Dodd-Frank Wall Street Reform Act — 2010

- Transferred FCRA enforcement authority to the newly created **Consumer Financial Protection Bureau (CFPB)**
- Added supervision authority over large CRAs
- Enhanced consumer complaint handling

## 5. Economic Growth, Regulatory Relief, and Consumer Protection Act — 2018

- Extended **free credit freeze and unfreeeze** for all consumers
- Special protections for **active-duty military** members
- One-year fraud alerts replaced 90-day alerts"""
            },
            {
                "title": "Consumer Rights Under the FCRA",
                "type": "reading",
                "content": """# Consumer Rights Under the FCRA

## Right to Access Your Credit File

> **"Every consumer reporting agency shall, upon request and proper identification, clearly and accurately disclose to the consumer all information in the consumer's file."**
> — 15 U.S.C. § 1681g(a)(1)

## Right to Dispute Inaccurate Information

The dispute process is central to the FCRA:

> **"If the completeness or accuracy of any item of information contained in a consumer's file at a consumer reporting agency is disputed by the consumer and the consumer notifies the agency directly...the agency shall, free of charge, conduct a reasonable reinvestigation to determine whether the disputed information is inaccurate."**
> — 15 U.S.C. § 1681i(a)(1)(A)

### The Investigation Timeline:
- CRA must investigate within **30 days** (can extend to 45 if consumer provides additional info)
- CRA must forward all relevant information to the furnisher within **5 business days**
- Furnisher must investigate and respond
- If information cannot be verified, **it must be deleted**

## Right to Know Who Accessed Your Report

> **"A consumer reporting agency shall maintain a record of all persons who have requested a consumer report...and shall include in the written disclosure required under subsection (a) of this section the name and address of each person."**
> — 15 U.S.C. § 1681g(a)(3)

## Permissible Purposes (Section 1681b)

Your credit report can only be pulled for:
1. **Credit transactions** - When you apply for credit
2. **Employment** - Only with your written consent
3. **Insurance underwriting**
4. **Legitimate business transactions** initiated by the consumer
5. **Court orders or subpoenas**
6. **Account review** - By existing creditors

## Right to Sue

> **"Any person who willfully fails to comply with any requirement imposed under this subchapter with respect to any consumer is liable to that consumer."**
> — 15 U.S.C. § 1681n(a)

Consumers can recover:
- **Actual damages** OR **statutory damages** ($100-$1,000 per violation)
- **Punitive damages** for willful violations
- **Attorney's fees and costs**"""
            },
            {
                "title": "Furnisher Obligations and Section 623",
                "type": "reading",
                "content": """# Furnisher Obligations Under the FCRA

## Section 623: Responsibilities of Furnishers

Section 623 of the FCRA (15 U.S.C. § 1681s-2) imposes specific duties on data furnishers:

### Duty of Accuracy

> **"A person shall not furnish any information relating to a consumer to any consumer reporting agency if the person knows or has reasonable cause to believe that the information is inaccurate."**
> — 15 U.S.C. § 1681s-2(a)(1)(A)

### Duty to Investigate Direct Disputes

When a consumer disputes information directly with a furnisher:

> **"After receiving notice of a dispute...a person shall conduct an investigation with respect to the disputed information...review all relevant information provided by the consumer...and report the results of the investigation to the consumer."**
> — 15 U.S.C. § 1681s-2(a)(8)(E)

### Duty to Correct and Update

If a furnisher determines information is inaccurate:

> **"If the investigation finds that the information is incomplete or inaccurate, the person shall report those results to each consumer reporting agency to which the person furnished the information and shall promptly modify, delete, or permanently block the reporting of that information."**
> — 15 U.S.C. § 1681s-2(b)(1)(E)

## Metro 2 Reporting Standards

The credit reporting industry uses the **Metro 2 format** as the standard for furnishing data. Key fields include:
- Account status codes (current, delinquent, charged-off)
- Payment rating
- Account type
- Date of first delinquency
- Balance amounts

Understanding Metro 2 is essential for credit repair professionals because errors often originate from incorrect Metro 2 coding by furnishers."""
            }
        ],
        "quiz": {
            "passing_score": 75,
            "questions": [
                {"id": "fcra-q1", "question": "When was the FCRA originally enacted?", "options": ["1968", "1970", "1974", "1980"], "correct_answer": 1, "explanation": "The FCRA was enacted on October 26, 1970."},
                {"id": "fcra-q2", "question": "The FCRA is codified at:", "options": ["15 U.S.C. § 1679", "15 U.S.C. § 1681", "12 U.S.C. § 2601", "29 U.S.C. § 206"], "correct_answer": 1, "explanation": "The FCRA is found at 15 U.S.C. § 1681 et seq."},
                {"id": "fcra-q3", "question": "How long must a CRA investigate a dispute?", "options": ["15 days", "30 days", "60 days", "90 days"], "correct_answer": 1, "explanation": "Per 15 U.S.C. § 1681i(a)(1)(A), investigations must be completed within 30 days."},
                {"id": "fcra-q4", "question": "FACTA was enacted in what year?", "options": ["2001", "2003", "2005", "2007"], "correct_answer": 1, "explanation": "The Fair and Accurate Credit Transactions Act was enacted in 2003."},
                {"id": "fcra-q5", "question": "What did FACTA provide to consumers for free?", "options": ["Credit repair services", "Annual credit reports from each bureau", "Identity theft insurance", "Credit monitoring"], "correct_answer": 1, "explanation": "FACTA mandated free annual credit reports via AnnualCreditReport.com."},
                {"id": "fcra-q6", "question": "Most negative items can remain on a credit report for:", "options": ["3 years", "5 years", "7 years", "10 years"], "correct_answer": 2, "explanation": "The FCRA establishes a 7-year reporting period for most negative items."},
                {"id": "fcra-q7", "question": "Bankruptcies can remain on a credit report for:", "options": ["5 years", "7 years", "10 years", "15 years"], "correct_answer": 2, "explanation": "Chapter 7 bankruptcies can be reported for up to 10 years."},
                {"id": "fcra-q8", "question": "Which agency gained FCRA enforcement authority under Dodd-Frank?", "options": ["SEC", "FDIC", "CFPB", "OCC"], "correct_answer": 2, "explanation": "The Dodd-Frank Act transferred FCRA enforcement to the CFPB."},
                {"id": "fcra-q9", "question": "A credit report can be pulled for employment purposes:", "options": ["Without any consent", "Only with the consumer's written consent", "Only by government employers", "Never"], "correct_answer": 1, "explanation": "Employment credit checks require the consumer's prior written consent."},
                {"id": "fcra-q10", "question": "If disputed information cannot be verified, the CRA must:", "options": ["Keep it on the report", "Mark it as disputed", "Delete it", "Send it to collections"], "correct_answer": 2, "explanation": "Unverifiable information must be deleted per 15 U.S.C. § 1681i."},
                {"id": "fcra-q11", "question": "Section 623 addresses the responsibilities of:", "options": ["Consumers", "Credit repair companies", "Furnishers", "Government agencies"], "correct_answer": 2, "explanation": "Section 623 (15 U.S.C. § 1681s-2) governs furnisher obligations."},
                {"id": "fcra-q12", "question": "Within how many days must a CRA forward dispute information to the furnisher?", "options": ["3 business days", "5 business days", "10 business days", "15 business days"], "correct_answer": 1, "explanation": "CRAs must forward dispute information within 5 business days."},
                {"id": "fcra-q13", "question": "Statutory damages for willful FCRA violations range from:", "options": ["$50-$500", "$100-$1,000", "$500-$5,000", "$1,000-$10,000"], "correct_answer": 1, "explanation": "15 U.S.C. § 1681n provides $100-$1,000 in statutory damages per violation."},
                {"id": "fcra-q14", "question": "The 2018 Economic Growth Act provided:", "options": ["Free credit monitoring", "Free credit freezes for all consumers", "Free credit repair", "Free credit scores"], "correct_answer": 1, "explanation": "The 2018 act made credit freezes and unfreezes free for all consumers."},
                {"id": "fcra-q15", "question": "What standard format do furnishers use to report data to CRAs?", "options": ["CSV format", "Metro 2", "JSON", "XML"], "correct_answer": 1, "explanation": "The Metro 2 format is the industry standard for furnishing credit data."},
                {"id": "fcra-q16", "question": "Which senator championed the original FCRA?", "options": ["William Proxmire", "Ted Kennedy", "Robert Byrd", "Hubert Humphrey"], "correct_answer": 0, "explanation": "Senator William Proxmire was the primary champion of the FCRA."},
                {"id": "fcra-q17", "question": "A permissible purpose for pulling a credit report includes all EXCEPT:", "options": ["Credit application", "Insurance underwriting", "Curiosity about a neighbor", "Employment with consent"], "correct_answer": 2, "explanation": "Pulling a report without a permissible purpose violates the FCRA."},
                {"id": "fcra-q18", "question": "The investigation period can be extended to 45 days if:", "options": ["The CRA requests it", "The consumer provides additional information", "The furnisher requests more time", "It's during a holiday period"], "correct_answer": 1, "explanation": "The 30-day period can extend to 45 days if the consumer provides additional relevant information."},
                {"id": "fcra-q19", "question": "Consumers can dispute information:", "options": ["Only with the CRA", "Only with the furnisher", "With both the CRA and the furnisher", "Only through a credit repair company"], "correct_answer": 2, "explanation": "FACTA added the right to dispute directly with furnishers in addition to CRAs."},
                {"id": "fcra-q20", "question": "The 'date of first delinquency' is important because:", "options": ["It determines the interest rate", "It starts the 7-year reporting clock", "It affects the credit score algorithm", "It determines the payment amount"], "correct_answer": 1, "explanation": "The date of first delinquency starts the 7-year reporting period for negative items."},
                {"id": "fcra-q21", "question": "What is a 'furnisher' under the FCRA?", "options": ["A furniture company", "An entity that provides information to CRAs", "A credit repair company", "A government regulator"], "correct_answer": 1, "explanation": "Furnishers are entities (creditors, collectors, etc.) that report data to credit bureaus."},
                {"id": "fcra-q22", "question": "Before the FCRA, consumers could:", "options": ["See their credit files freely", "Dispute inaccurate information", "Neither see their files nor dispute", "Only see files with court orders"], "correct_answer": 2, "explanation": "Before the FCRA, consumers had no right to see their files or dispute information."},
                {"id": "fcra-q23", "question": "The three major CRAs are:", "options": ["Equifax, Experian, TransUnion", "FICO, VantageScore, Credit Karma", "Dun & Bradstreet, Equifax, Experian", "TransUnion, FICO, Equifax"], "correct_answer": 0, "explanation": "Equifax, Experian, and TransUnion are the three major consumer reporting agencies."},
                {"id": "fcra-q24", "question": "A fraud alert under the FCRA lasts for:", "options": ["90 days (initial)", "1 year (initial)", "7 years", "Permanently"], "correct_answer": 1, "explanation": "After the 2018 amendment, initial fraud alerts last 1 year (previously 90 days)."},
                {"id": "fcra-q25", "question": "FCRA enforcement can be pursued by:", "options": ["Only the FTC", "Only the CFPB", "FTC, CFPB, state AGs, and private consumers", "Only through class action"], "correct_answer": 2, "explanation": "Multiple parties can enforce the FCRA including federal agencies, state AGs, and individual consumers."},
                {"id": "fcra-q26", "question": "A furnisher must investigate a direct dispute within:", "options": ["15 days", "30 days", "45 days", "60 days"], "correct_answer": 1, "explanation": "Furnishers must investigate direct disputes within 30 days."},
                {"id": "fcra-q27", "question": "What are 'soft inquiries'?", "options": ["Inquiries that damage your credit", "Inquiries visible only to the consumer, not affecting score", "Fraudulent inquiries", "Inquiries from collection agencies"], "correct_answer": 1, "explanation": "Soft inquiries (pre-approvals, own checks) don't affect credit scores and are visible only to the consumer."},
                {"id": "fcra-q28", "question": "Hard inquiries remain on a credit report for:", "options": ["1 year", "2 years", "5 years", "7 years"], "correct_answer": 1, "explanation": "Hard inquiries remain on credit reports for 2 years but only affect scores for about 1 year."},
                {"id": "fcra-q29", "question": "Which act created AnnualCreditReport.com?", "options": ["CROA", "FACTA", "Dodd-Frank", "The FCRA of 1970"], "correct_answer": 1, "explanation": "FACTA (2003) established the free annual credit report program."},
                {"id": "fcra-q30", "question": "A consumer's right to sue under the FCRA is established in:", "options": ["Section 611", "Section 623", "Section 616 and 617", "Section 605"], "correct_answer": 2, "explanation": "Sections 616 (willful) and 617 (negligent) establish the private right of action."},
                {"id": "fcra-q31", "question": "What is the maximum statute of limitations for FCRA lawsuits?", "options": ["1 year", "2 years", "5 years", "No limit"], "correct_answer": 2, "explanation": "FCRA lawsuits must be filed within 2 years of discovery or 5 years of the violation."},
                {"id": "fcra-q32", "question": "Mixed credit files occur when:", "options": ["A consumer has too many accounts", "Information from different consumers is combined", "A consumer has both good and bad credit", "A file is shared between bureaus"], "correct_answer": 1, "explanation": "Mixed files happen when CRAs merge data from different consumers with similar names/SSNs."},
                {"id": "fcra-q33", "question": "The FCRA requires CRAs to maintain:", "options": ["Only positive information", "Reasonable procedures for maximum possible accuracy", "100% accuracy", "Only information from verified sources"], "correct_answer": 1, "explanation": "15 U.S.C. § 1681e(b) requires 'reasonable procedures to assure maximum possible accuracy.'"},
                {"id": "fcra-q34", "question": "An adverse action notice must include:", "options": ["The consumer's credit score", "The name of the CRA that provided the report", "The amount of the denied credit", "The creditor's profit margin"], "correct_answer": 1, "explanation": "Adverse action notices must include the CRA name, address, phone, and the consumer's right to a free report."},
                {"id": "fcra-q35", "question": "Medical information in credit reports:", "options": ["Is freely reportable", "Has special protections under FACTA", "Is never included", "Only appears with consumer consent"], "correct_answer": 1, "explanation": "FACTA added special restrictions on how medical information can appear in credit reports."},
                {"id": "fcra-q36", "question": "The 'Red Flag Rules' were established by:", "options": ["The original FCRA", "FACTA", "Dodd-Frank", "The CARD Act"], "correct_answer": 1, "explanation": "FACTA's Red Flag Rules require creditors to implement identity theft prevention programs."},
                {"id": "fcra-q37", "question": "A credit freeze prevents:", "options": ["All access to a credit report", "New creditors from accessing the report", "Existing creditors from seeing the report", "The consumer from seeing their own report"], "correct_answer": 1, "explanation": "A credit freeze blocks new creditors from pulling the report, preventing new account fraud."},
                {"id": "fcra-q38", "question": "Active-duty military members receive:", "options": ["No special FCRA protections", "Extended fraud alerts up to 1 year", "Free credit monitoring from the government", "Automatic credit score boosts"], "correct_answer": 1, "explanation": "Active-duty military can place active duty alerts lasting 1 year on their credit files."},
                {"id": "fcra-q39", "question": "When must a furnisher stop reporting information after a dispute?", "options": ["Immediately upon receiving the dispute", "Only after the CRA tells them to", "After investigation if found inaccurate", "Never, they can continue reporting"], "correct_answer": 2, "explanation": "If the investigation finds information inaccurate, the furnisher must modify, delete, or block it."},
                {"id": "fcra-q40", "question": "The term 'consumer report' under the FCRA includes:", "options": ["Only credit reports", "Any communication bearing on creditworthiness, character, or reputation", "Only information from the 3 major bureaus", "Only written reports"], "correct_answer": 1, "explanation": "The FCRA defines consumer reports broadly to include any communication bearing on credit, character, or reputation."},
                {"id": "fcra-q41", "question": "Collection accounts can be reported starting from:", "options": ["The date the account was opened", "The date of first delinquency on the original account", "The date sent to collections", "The date the collector first contacts the consumer"], "correct_answer": 1, "explanation": "The 7-year clock starts from the date of first delinquency on the original account."},
                {"id": "fcra-q42", "question": "A reinvestigation by a CRA must be:", "options": ["Automated only", "Free of charge to the consumer", "Conducted only with consumer's attorney present", "Done by a third-party auditor"], "correct_answer": 1, "explanation": "15 U.S.C. § 1681i requires investigations be conducted free of charge."},
                {"id": "fcra-q43", "question": "If a CRA removes disputed information, can it be reinserted?", "options": ["Yes, at any time", "Only with written notice to the consumer within 5 days", "No, never", "Only if the furnisher verifies it"], "correct_answer": 1, "explanation": "Reinsertion is only allowed with 5-day notice to the consumer and the furnisher must certify accuracy."},
                {"id": "fcra-q44", "question": "Which is NOT a consumer reporting agency regulated by the FCRA?", "options": ["Equifax", "FICO", "Experian", "TransUnion"], "correct_answer": 1, "explanation": "FICO is a credit scoring company, not a consumer reporting agency."},
                {"id": "fcra-q45", "question": "The FCRA preempts state laws on:", "options": ["All credit-related matters", "Certain specific topics (prescreening, dispute procedures)", "Nothing, states always have authority", "Only criminal credit fraud"], "correct_answer": 1, "explanation": "FACTA created specific preemption of state laws on topics like prescreening and dispute procedures."},
                {"id": "fcra-q46", "question": "A consumer's right to add a statement to their credit file is found in:", "options": ["Section 609", "Section 611", "Section 623", "Section 605"], "correct_answer": 1, "explanation": "Section 611 (15 U.S.C. § 1681i) allows consumers to add a brief statement to their file."},
                {"id": "fcra-q47", "question": "Paid collection accounts:", "options": ["Must be immediately removed", "Can still be reported but must show as paid", "Cannot be reported after payment", "Must be removed within 30 days"], "correct_answer": 1, "explanation": "Paid collections can remain but must be updated to show the paid status."},
                {"id": "fcra-q48", "question": "The FCRA applies to:", "options": ["Only the 3 major bureaus", "All consumer reporting agencies", "Only financial institutions", "Only online credit services"], "correct_answer": 1, "explanation": "The FCRA applies to all consumer reporting agencies, not just the big three."},
                {"id": "fcra-q49", "question": "Negligent noncompliance with the FCRA allows consumers to recover:", "options": ["Actual damages, attorney fees, and costs", "Only statutory damages", "Punitive damages", "No damages"], "correct_answer": 0, "explanation": "Section 617 provides for actual damages plus attorney fees and costs for negligent violations."},
                {"id": "fcra-q50", "question": "The FCRA's purpose, per § 1681(b), is to ensure credit reporting is:", "options": ["Profitable for CRAs", "Fair and equitable to consumers", "Convenient for creditors", "Standardized globally"], "correct_answer": 1, "explanation": "The stated purpose is 'fair and equitable to the consumer' while meeting commerce needs."}
            ]
        }
    },
    {
        "id": "credit-repair-ethics",
        "title": "Credit Repair Ethics Certification",
        "short_name": "ETHICS",
        "description": "A comprehensive course on ethical practices in the credit repair industry. Learn about client communication standards, truthful advertising, proper fee structures, managing client expectations, and maintaining professional integrity.",
        "badge_color": "#2d3748",
        "badge_accent": "#48bb78",
        "price": 0,
        "is_free": True,
        "status": "published",
        "order": 3,
        "duration": "2-3 hours",
        "total_questions": 20,
        "passing_score": 80,
        "image_url": "",
        "lessons": [
            {
                "title": "Foundations of Credit Repair Ethics",
                "type": "reading",
                "content": """# Foundations of Credit Repair Ethics

## Why Ethics Matter in Credit Repair

The credit repair industry has historically suffered from a negative reputation due to unethical operators. As legitimate professionals, maintaining the highest ethical standards is not just a legal obligation — it's a business imperative.

### The Ethical Credit Repair Professional:
1. **Tells the truth** about what credit repair can and cannot achieve
2. **Puts clients first** rather than maximizing revenue
3. **Follows all laws** — CROA, FCRA, state regulations, and TSR
4. **Provides genuine value** through education and advocacy
5. **Maintains transparency** in pricing, processes, and expected outcomes

## Truthful Advertising

One of the most common ethical violations is misleading advertising. Ethical professionals:

- **Never guarantee** specific results ("We guarantee 100 point increase!")
- **Never promise** removal of accurate information ("We'll wipe your credit clean!")
- **Never claim** proprietary or secret methods ("Our special technique the bureaus don't want you to know!")
- **Always disclose** that consumers can dispute information themselves for free
- **Accurately represent** typical results, not best-case scenarios

## Setting Proper Expectations

From the very first interaction, ethical credit repair companies:
- Explain that **accurate, verifiable information cannot be removed**
- Set **realistic timelines** (credit repair typically takes 3-6 months)
- Explain that **results vary** by individual
- Make clear that **credit repair is not a magic fix** — it requires the client's active participation

## Proper Fee Structures

Under CROA, fees cannot be charged before services are fully performed. Ethical companies:
- Use **pay-for-performance** or **pay-after-results** models
- Clearly explain **all fees** upfront in writing
- Never use **hidden fees** or confusing pricing
- Provide the **3-day cancellation right** prominently"""
            },
            {
                "title": "Client Relationships and Data Protection",
                "type": "reading",
                "content": """# Client Relationships and Data Protection

## Informed Consent and Privacy

Credit repair professionals handle extremely sensitive personal information. Ethical standards demand:

### Data Protection:
- Store client SSNs, DOBs, and financial data with **encryption**
- Limit access to client data to **only those who need it**
- Have a **written privacy policy** and share it with clients
- **Never share** client information without explicit consent
- Have a **data breach notification plan**

### Informed Consent:
- Get **written authorization** before pulling credit reports
- Explain **exactly what you'll do** with their information
- Let clients **review dispute letters** before sending
- Keep clients **informed** of progress and results

## Managing Difficult Situations

### When a Client Has Unrealistic Expectations:
- Be **honest** rather than telling them what they want to hear
- Document the conversation in writing
- Offer **alternative solutions** (credit building, debt management)

### When You Can't Help:
- **Refer** to appropriate resources (bankruptcy attorney, HUD counselor)
- **Never string along** a client just to collect fees
- It's better to **lose a fee than lose your integrity**

### Handling Complaints:
- Listen with empathy
- Investigate promptly
- Make it right or explain honestly
- Document everything

## The Telemarketing Sales Rule (TSR)

The FTC's **Telemarketing Sales Rule** adds additional requirements for credit repair companies that use phone sales:
- Requires **express verifiable authorization** before charging
- Prohibits **material misrepresentations**
- Requires disclosure of the **total cost** of services
- Mandates call recordings in certain circumstances"""
            }
        ],
        "quiz": {
            "passing_score": 80,
            "questions": [
                {"id": "eth-q1", "question": "An ethical credit repair company should:", "options": ["Guarantee specific credit score increases", "Promise to remove all negative items", "Set realistic expectations about possible outcomes", "Tell clients what they want to hear"], "correct_answer": 2, "explanation": "Ethical professionals set realistic expectations and never guarantee specific results."},
                {"id": "eth-q2", "question": "Is it ethical to advertise 'guaranteed credit repair results'?", "options": ["Yes, if you have a high success rate", "No, results can never be guaranteed", "Yes, if you offer a money-back guarantee", "Only if you specify a timeframe"], "correct_answer": 1, "explanation": "Guaranteeing results is both unethical and a CROA violation — results vary by individual."},
                {"id": "eth-q3", "question": "When a client has a legitimate bankruptcy on their report, you should:", "options": ["Promise to remove it", "Explain it will remain for up to 10 years and focus on building positive credit", "Tell them to dispute it anyway", "Suggest using a CPN"], "correct_answer": 1, "explanation": "Accurate information cannot be removed. The ethical approach is honest education."},
                {"id": "eth-q4", "question": "Client data (SSN, DOB) should be:", "options": ["Stored in plain text for easy access", "Encrypted and access-limited", "Shared with all employees", "Posted on the company website for transparency"], "correct_answer": 1, "explanation": "Sensitive client data must be encrypted with limited access — this is both ethical and legally required."},
                {"id": "eth-q5", "question": "If you cannot help a client, the ethical action is to:", "options": ["Keep them enrolled to collect fees", "Refer them to appropriate resources", "Tell them their credit is beyond repair", "Ignore their calls"], "correct_answer": 1, "explanation": "Ethical professionals refer clients to appropriate help rather than stringing them along."},
                {"id": "eth-q6", "question": "The Telemarketing Sales Rule (TSR) requires credit repair companies to:", "options": ["Only sell in person", "Get express verifiable authorization before charging", "Charge higher fees for phone sales", "Avoid using phones entirely"], "correct_answer": 1, "explanation": "The TSR requires express verifiable authorization before charging for credit repair services."},
                {"id": "eth-q7", "question": "Before pulling a client's credit report, you must:", "options": ["Just pull it — they signed up for credit repair", "Get written authorization", "Only need verbal permission", "No permission needed for existing clients"], "correct_answer": 1, "explanation": "Written authorization is required before accessing anyone's credit report."},
                {"id": "eth-q8", "question": "An ethical pricing model for credit repair is:", "options": ["Large upfront fee before any work", "Pay-for-performance or pay-after-results", "Hidden fees added during the process", "Non-refundable retainer"], "correct_answer": 1, "explanation": "CROA requires payment only after services are performed; ethical companies use performance-based models."},
                {"id": "eth-q9", "question": "When advertising credit repair services, you should:", "options": ["Use testimonials from your best cases only", "Show 'typical' results that represent average outcomes", "Claim secret methods bureaus don't know about", "Guarantee a specific number of deletions"], "correct_answer": 1, "explanation": "Advertising should show typical results, not best-case scenarios, and never make false claims."},
                {"id": "eth-q10", "question": "Client dispute letters should be:", "options": ["Sent without client review", "Reviewed by the client before sending", "Copied from online templates without customization", "Written to be intentionally misleading"], "correct_answer": 1, "explanation": "Clients should review dispute letters to ensure accuracy and give informed consent."},
                {"id": "eth-q11", "question": "If a client complains about lack of results after 30 days, you should:", "options": ["Tell them to be patient and stop complaining", "Investigate their account, explain the timeline, and provide a status update", "Drop them as a client", "Promise faster results"], "correct_answer": 1, "explanation": "Address complaints with empathy, investigation, and honest communication."},
                {"id": "eth-q12", "question": "A credit repair company's privacy policy should be:", "options": ["Written in complex legal jargon", "Hidden in the terms of service", "Clear, accessible, and shared with clients", "Optional"], "correct_answer": 2, "explanation": "Privacy policies should be clear, easily understood, and proactively shared with clients."},
                {"id": "eth-q13", "question": "Referring to yourself as a 'credit attorney' when you're not a lawyer is:", "options": ["Fine as a marketing technique", "Unethical and potentially illegal", "Acceptable if you have credit repair experience", "Standard industry practice"], "correct_answer": 1, "explanation": "Misrepresenting credentials is unethical and may violate unauthorized practice of law statutes."},
                {"id": "eth-q14", "question": "The 3-day cancellation right should be:", "options": ["Buried in the fine print", "Prominently disclosed before signing", "Not mentioned unless asked", "Waived for returning clients"], "correct_answer": 1, "explanation": "The cancellation right must be prominently disclosed — hiding it violates both ethics and CROA."},
                {"id": "eth-q15", "question": "When a client's dispute results in no changes, you should:", "options": ["Hide the results and send more disputes", "Honestly report the results and discuss next steps", "Drop the client", "Blame the credit bureaus"], "correct_answer": 1, "explanation": "Transparency about results — positive or negative — is fundamental to ethical practice."},
                {"id": "eth-q16", "question": "An ethical credit repair company educates clients about:", "options": ["Only the services they provide", "Their rights to self-help and free dispute options", "Why they need professional help", "How to game the system"], "correct_answer": 1, "explanation": "CROA requires disclosure that consumers can dispute on their own; ethical companies go further with education."},
                {"id": "eth-q17", "question": "Using a client's personal information for purposes other than credit repair:", "options": ["Is fine if they signed a broad consent form", "Is an ethical violation and potential privacy breach", "Is acceptable for marketing purposes", "Is permitted for affiliate referrals"], "correct_answer": 1, "explanation": "Client data should only be used for the purpose for which consent was given."},
                {"id": "eth-q18", "question": "If you discover a team member is advising clients to use CPNs, you should:", "options": ["Ignore it if it's bringing in revenue", "Immediately stop the practice and retrain the team", "Report only if a client complains", "Gradually phase out the practice"], "correct_answer": 1, "explanation": "CPN schemes are illegal. The ethical response is immediate intervention."},
                {"id": "eth-q19", "question": "Continuing education and staying current on credit laws is:", "options": ["Optional for experienced professionals", "An ethical obligation", "Only needed for new hires", "Unnecessary if you passed initial training"], "correct_answer": 1, "explanation": "Laws and regulations evolve. Ethical professionals maintain current knowledge."},
                {"id": "eth-q20", "question": "The most important asset for a credit repair company is:", "options": ["A large advertising budget", "A large client list", "Trust and reputation", "Advanced dispute software"], "correct_answer": 2, "explanation": "Trust and reputation are the foundation of an ethical credit repair practice."}
            ]
        }
    }
]


async def seed_courses(db):
    """Seed the 3 foundational courses into the database."""
    for course in COURSES:
        existing = await db.school_courses.find_one({"id": course["id"]})
        if not existing:
            await db.school_courses.insert_one(course)
            print(f"[SCHOOL] Seeded course: {course['title']}")
        else:
            # Update content but preserve enrollment data
            await db.school_courses.update_one(
                {"id": course["id"]},
                {"$set": {
                    "title": course["title"],
                    "description": course["description"],
                    "lessons": course["lessons"],
                    "quiz": course["quiz"],
                    "passing_score": course["passing_score"],
                    "badge_color": course["badge_color"],
                    "badge_accent": course["badge_accent"],
                }}
            )
            print(f"[SCHOOL] Updated course: {course['title']}")
