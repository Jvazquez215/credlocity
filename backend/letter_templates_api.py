"""
Free Letters Template System — SEO-optimized letter pages with consumer form + PDF generation.
Each letter has its own page with instructions, bureau contacts, and auto-fill PDF generation.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
import uuid
import io

letter_templates_router = APIRouter(prefix="/api/letter-templates", tags=["Letter Templates"])
db = None


def set_db(database):
    global db
    db = database


CREDIT_BUREAUS = [
    {
        "name": "Equifax",
        "address": "P.O. Box 740241, Atlanta, GA 30374-0241",
        "phone": "(800) 685-1111",
        "website": "www.equifax.com",
        "online_dispute": "https://www.equifax.com/personal/credit-report-services/credit-dispute/"
    },
    {
        "name": "Experian",
        "address": "P.O. Box 4500, Allen, TX 75013",
        "phone": "(888) 397-3742",
        "website": "www.experian.com",
        "online_dispute": "https://www.experian.com/disputes/main.html"
    },
    {
        "name": "TransUnion",
        "address": "P.O. Box 2000, Chester, PA 19016",
        "phone": "(800) 916-8800",
        "website": "www.transunion.com",
        "online_dispute": "https://www.transunion.com/credit-disputes/dispute-your-credit"
    }
]


LETTER_TEMPLATES = [
    {
        "slug": "credit-bureau-dispute-letter",
        "title": "Credit Bureau Dispute Letter",
        "category": "Dispute Letters",
        "short_description": "Dispute inaccurate, incomplete, or unverifiable items on your credit report directly with Equifax, Experian, or TransUnion.",
        "meta_title": "Free Credit Bureau Dispute Letter Template | Credlocity",
        "meta_description": "Download a free credit bureau dispute letter to challenge inaccurate items on your credit report. Editable template with step-by-step instructions.",
        "description": "Under the Fair Credit Reporting Act (FCRA), Section 611, you have the legal right to dispute any information on your credit report that you believe is inaccurate, incomplete, or unverifiable. Credit bureaus are required by federal law to investigate your dispute within 30 days and either verify, correct, or delete the disputed item. This letter is your first and most powerful tool in the credit repair process. It formally notifies the credit bureau that specific items on your report contain errors and demands an investigation.",
        "how_to_use": "1. Pull your free credit reports from AnnualCreditReport.com\n2. Identify the specific items you want to dispute — note the creditor name, account number, and the exact error\n3. Fill out the form below with your personal information and account details\n4. Click 'Generate Letter' to create your personalized dispute letter\n5. Print the letter, sign it, and date it\n6. Make a copy for your records\n7. Send via USPS Certified Mail with Return Receipt Requested to each credit bureau reporting the error\n8. Keep your certified mail receipt and tracking number — this is your legal proof of delivery",
        "results_likelihood": "Credit bureau disputes have a strong success rate when the disputed information truly is inaccurate. According to the FTC, approximately 1 in 4 consumers have errors on their credit reports. If the furnisher (creditor) cannot verify the disputed item within 30 days, the bureau must remove it. Disputes involving genuinely incorrect dates, amounts, account statuses, or accounts that don't belong to you have the highest success rates (70-80%). Even if the first dispute is verified, you can submit additional disputes with supporting documentation.",
        "aftercare": "After sending your dispute letter, here's what to expect and do:\n\n- **30-Day Investigation Period**: The bureau has 30 days (45 if you provide additional info) to investigate\n- **Results Letter**: You'll receive a written response with investigation results\n- **Updated Credit Report**: If items are corrected or removed, request an updated report\n- **If Verified**: Don't give up — send a Method of Verification (MOV) letter asking how the item was verified\n- **Follow Up**: If no response within 35 days, send a follow-up letter referencing your certified mail tracking number\n- **Document Everything**: Keep copies of all letters, receipts, and responses in a dedicated folder\n- **Re-dispute with New Information**: If your dispute is rejected, gather supporting documents and submit a new dispute with evidence",
        "send_to": "credit_bureaus",
        "letter_body": "To Whom It May Concern:\n\nI am writing to formally dispute the following information on my credit report. Under the Fair Credit Reporting Act, Section 611 (15 U.S.C. § 1681i), I am requesting that you investigate the following item(s) which I believe to be inaccurate:\n\nCreditor/Account Name: {account_name}\nAccount Number: {account_number}\n\nThe reason for my dispute is that this information is [inaccurate/incomplete/unverifiable]. I am requesting that this item be investigated and [corrected/removed] from my credit report.\n\nUnder FCRA Section 611(a), you are required to conduct a reasonable investigation within 30 days of receiving this dispute. If you cannot verify the accuracy of this information, it must be deleted from my credit report.\n\nPlease send me an updated copy of my credit report reflecting any changes made as a result of this investigation, as required by FCRA Section 611(a)(6).\n\nI have enclosed copies of documents supporting my dispute. Please investigate this matter and correct the disputed item(s) as soon as possible.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Understanding the FCRA", "url": "/credit-repair-laws"},
            {"text": "Free Credit Repair Education", "url": "/credit-repair-laws"},
            {"text": "Method of Verification Letter", "url": "/free-letters/method-of-verification-letter"},
            {"text": "Start Your Free Trial", "url": "/pricing"}
        ],
        "order": 1,
        "faqs": [
            {"q": "What is a credit bureau dispute letter?", "a": "A credit bureau dispute letter is a formal written request sent to one of the three major credit bureaus (Equifax, Experian, or TransUnion) asking them to investigate and correct inaccurate information on your credit report. Under the Fair Credit Reporting Act (FCRA) Section 611, the bureau must investigate within 30 days and either verify, correct, or delete the disputed item."},
            {"q": "How long does a credit bureau dispute take?", "a": "By law, credit bureaus must complete their investigation within 30 days of receiving your dispute (45 days if you provide additional information during the investigation). You will receive written notification of the results, and if changes are made, an updated copy of your credit report."},
            {"q": "Can I dispute multiple items in one letter?", "a": "While you can dispute multiple items in one letter, many credit repair experts recommend disputing no more than 2-3 items per letter. Disputing too many items at once may cause the bureau to flag your dispute as frivolous under FCRA Section 611(a)(3). For best results, focus on the most impactful errors first."},
            {"q": "Do I need to send a separate letter to each bureau?", "a": "Yes. Each credit bureau maintains its own independent credit file. An error may appear on one, two, or all three reports. You must send a separate dispute letter to each bureau that is reporting the inaccurate information. Generate a separate letter for each bureau using our form above."},
            {"q": "What happens if the credit bureau doesn't respond?", "a": "If a credit bureau fails to respond within the 30-day statutory period, the disputed item must be deleted from your credit report. Document your certified mail tracking showing the date they received your letter, and send a follow-up letter citing their FCRA violation. You may also have grounds for a lawsuit under FCRA Section 616 or 617."}
        ]
    },
    {
        "slug": "debt-validation-letter",
        "title": "Debt Validation Letter",
        "category": "Debt Validation",
        "short_description": "Demand proof that a debt collector has the legal right to collect a debt from you under the FDCPA.",
        "meta_title": "Free Debt Validation Letter Template | FDCPA Rights | Credlocity",
        "meta_description": "Download a free debt validation letter to exercise your rights under the FDCPA. Force debt collectors to prove the debt is valid and belongs to you.",
        "description": "Under the Fair Debt Collection Practices Act (FDCPA), Section 809(b), you have the right to request validation of any debt a collector claims you owe. Within 30 days of a collector's initial contact, you can send a Debt Validation Letter requiring them to provide proof that: (1) the debt exists, (2) the amount is correct, and (3) they have the legal authority to collect it. If the collector cannot provide adequate validation, they must cease all collection activity and cannot report the debt to credit bureaus. This is one of the most powerful consumer protection tools available.",
        "how_to_use": "1. Send this letter within 30 days of a collector's first contact — this is critical for maximum legal protection\n2. Fill out the form below with your information and the account details from the collection notice\n3. Click 'Generate Letter' to create your personalized validation request\n4. Print, sign, and date the letter\n5. Send via USPS Certified Mail with Return Receipt Requested to the collection agency\n6. Do NOT acknowledge the debt is yours in any communication\n7. Do NOT make any payment before receiving proper validation",
        "results_likelihood": "Debt validation letters are highly effective. Many collection agencies purchase debts in bulk and may not have complete documentation. Studies show that approximately 40-50% of collection accounts cannot be fully validated when properly challenged. If the collector cannot provide adequate documentation (original signed agreement, complete payment history, chain of ownership), they are legally prohibited from continuing collection efforts and must remove the account from your credit reports. Even validated debts may reveal errors in the amount owed.",
        "aftercare": "After sending your debt validation letter:\n\n- **Collection Activity Must Stop**: The collector must cease collection until validation is provided\n- **30-Day Response Window**: While not legally required to respond in 30 days, most reputable collectors will\n- **Review the Validation**: If they respond, carefully review all documents for accuracy\n- **Check the Statute of Limitations**: Verify the debt hasn't exceeded your state's statute of limitations\n- **No Response = Victory**: If no validation within 30-45 days, send a follow-up letter demanding removal from credit reports\n- **File a Complaint**: If they continue collecting without validating, file a complaint with the CFPB and your state Attorney General\n- **Keep Records**: Save all correspondence — you may need it if you pursue legal action under the FDCPA",
        "send_to": "collector",
        "letter_body": "To Whom It May Concern:\n\nI am writing in response to your contact regarding an alleged debt. Under the Fair Debt Collection Practices Act, Section 809(b) (15 U.S.C. § 1692g), I am formally requesting validation of this debt.\n\nAccount Referenced: {account_name}\nAccount Number: {account_number}\n\nPlease provide the following documentation:\n\n1. The original signed agreement or contract bearing my signature\n2. A complete payment history from the original creditor\n3. Proof that you are licensed to collect debts in my state\n4. The name and address of the original creditor\n5. Documentation showing the chain of ownership of this debt\n6. Verification that the statute of limitations has not expired\n7. Proof that the amount claimed is accurate, including an itemized breakdown of all fees, interest, and charges\n\nUntil you provide adequate validation of this debt, I demand that you:\n- Cease all collection activity\n- Remove any negative reporting to credit bureaus related to this account\n- Do not contact me by phone regarding this matter\n\nAny continued collection activity or credit reporting without providing the requested validation will be considered a violation of the FDCPA and may result in legal action.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Understanding the FDCPA", "url": "/credit-repair-laws"},
            {"text": "Cease and Desist Letter", "url": "/free-letters/cease-and-desist-letter"},
            {"text": "Credit Repair Scam Checker", "url": "/scam-checker"},
            {"text": "Professional Credit Repair", "url": "/pricing"}
        ],
        "order": 2,
        "faqs": [
            {"q": "What is a debt validation letter?", "a": "A debt validation letter is a formal written request sent to a debt collector demanding proof that: (1) the debt exists, (2) you owe it, (3) the amount is correct, and (4) the collector has the legal right to collect it. This right is guaranteed under the Fair Debt Collection Practices Act (FDCPA) Section 809(b)."},
            {"q": "How long do I have to send a debt validation letter?", "a": "You have 30 days from the collector's initial contact to send a debt validation letter. While you can send one after 30 days, the legal protections are strongest within this window. During the first 30 days, the collector must cease collection until they provide validation."},
            {"q": "What happens if the collector can't validate the debt?", "a": "If the collector cannot provide adequate validation, they must: (1) cease all collection activity, (2) stop reporting the debt to credit bureaus, and (3) not sell or transfer the debt. If they continue collecting without validating, each action is a separate FDCPA violation worth up to $1,000 in statutory damages."},
            {"q": "Should I send a debt validation letter or pay the debt?", "a": "Always validate first, never pay first. Many collection accounts contain errors in the amount owed, are past the statute of limitations, or belong to a different person entirely. Paying before validating waives your leverage. If the debt is validated and legitimate, you can then negotiate a pay-for-delete or settlement."},
            {"q": "Does a debt validation letter work on original creditors?", "a": "No. The FDCPA only applies to third-party debt collectors, not original creditors (like your bank or credit card company). If an original creditor is reporting inaccurate information, use a Credit Bureau Dispute Letter instead to challenge the reporting directly with the bureaus."}
        ]
    },
    {
        "slug": "goodwill-letter",
        "title": "Goodwill Adjustment Letter",
        "category": "Goodwill Letters",
        "short_description": "Request a creditor to remove a late payment from your credit report as a gesture of goodwill.",
        "meta_title": "Free Goodwill Letter Template | Remove Late Payments | Credlocity",
        "meta_description": "Download a free goodwill adjustment letter to request removal of late payments from your credit report. Works best when you've been a loyal customer.",
        "description": "A Goodwill Adjustment Letter is a personal appeal to a creditor asking them to remove a late payment or other negative mark from your credit report as a gesture of goodwill. Unlike formal disputes, this approach relies on the creditor's willingness to help rather than a legal obligation. This works best when you have a history of on-time payments and the late payment was due to an unusual circumstance (job loss, medical emergency, family crisis). Creditors are under no legal obligation to grant goodwill adjustments, but many do — especially for long-standing customers with otherwise excellent payment histories.",
        "how_to_use": "1. Only use this letter if you actually made the late payment — this is NOT a dispute, it's a request for mercy\n2. Be honest about why the payment was late — genuine hardship stories resonate more than excuses\n3. Highlight your loyalty and positive payment history with the creditor\n4. Fill out the form below with your details\n5. Click 'Generate Letter' and print the letter\n6. Consider handwriting the letter for a personal touch (optional)\n7. Sign, date, and send via regular first-class mail or certified mail\n8. You may also call the creditor's customer service line to follow up verbally",
        "results_likelihood": "Goodwill letters have a moderate success rate of approximately 25-40%. Success depends heavily on: (1) your overall payment history with the creditor, (2) whether the late payment was a one-time occurrence, (3) the reason for the late payment, and (4) the creditor's internal policies. Some creditors (like American Express and Discover) are known to be more receptive. Capital One and Chase tend to be less flexible. The key is sincerity — a genuine, well-written letter explaining your circumstances has the best chance.",
        "aftercare": "After sending your goodwill letter:\n\n- **Wait 2-3 Weeks**: Give the creditor time to review and respond\n- **Follow Up By Phone**: Call customer service and reference your letter — ask to speak with a supervisor if the first representative says no\n- **Try Multiple Times**: If denied, wait a month and try again — you may reach a different decision-maker\n- **Check Your Reports**: If approved, verify the late payment is removed within 30-60 days\n- **Send a Thank You**: If they grant your request, a brief thank-you note builds goodwill for future requests\n- **Consider Alternatives**: If denied multiple times, you can still file a formal dispute if you believe the reporting is inaccurate",
        "send_to": "creditor",
        "letter_body": "Dear Customer Service Department,\n\nI am writing to respectfully request a goodwill adjustment to my account. I have been a loyal customer of {account_name} and value our relationship.\n\nAccount Number: {account_number}\n\nI am writing regarding a late payment that was reported to the credit bureaus. I take full responsibility for this late payment. However, I would like to explain the circumstances that led to it and humbly request that you consider removing this negative mark from my credit report.\n\nThe late payment occurred during a difficult period in my life, and it does not reflect my typical payment behavior. Before and since this incident, I have maintained a consistent record of on-time payments with your company.\n\nI understand that you are under no obligation to make this adjustment, but I am hoping that given my overall history as a responsible customer, you would consider this request as a gesture of goodwill. This one late payment is significantly impacting my credit score and my ability to [qualify for a mortgage/refinance/provide for my family].\n\nI would greatly appreciate your consideration in removing this late payment from my credit report. I am committed to maintaining my excellent payment record going forward.\n\nThank you for your time and consideration.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\nPhone: {phone}\nEmail: {email}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Credit Bureau Dispute Letter", "url": "/free-letters/credit-bureau-dispute-letter"},
            {"text": "How Credit Scores Work", "url": "/credit-repair-laws"},
            {"text": "Start Free Trial", "url": "/pricing"}
        ],
        "order": 3,
        "faqs": [
            {"q": "What is a goodwill adjustment letter?", "a": "A goodwill adjustment letter is a personal appeal to a creditor asking them to remove a late payment from your credit report as a courtesy. Unlike formal disputes, it's not based on an error — you're acknowledging the late payment happened but asking for mercy based on your overall relationship and circumstances."},
            {"q": "How likely is a goodwill letter to work?", "a": "Success rates range from 25-40% depending on several factors: your overall payment history, the creditor's policies, the reason for the late payment, and whether it was a one-time occurrence. Creditors like American Express and Discover tend to be more receptive. The key is being genuine, respectful, and highlighting your loyalty."},
            {"q": "Can I send a goodwill letter for old late payments?", "a": "Yes, you can send goodwill letters for late payments at any point while they're still on your credit report (up to 7 years). However, more recent late payments tend to get better responses because the creditor-customer relationship is fresher. Older late payments have less credit score impact anyway."},
            {"q": "How many times can I send a goodwill letter?", "a": "You can send as many as you'd like. If your first letter is denied, wait a month and try again — you may reach a different decision-maker. Some consumers have success on their 2nd or 3rd attempt. Each letter should be slightly different and increasingly personal. Following up with a phone call can also help."},
            {"q": "Is a goodwill letter the same as a dispute?", "a": "No. A dispute says the information is wrong. A goodwill letter says the information is right, but asks the creditor to remove it as a favor. Never mix the two approaches — if you dispute an item you know is accurate, you could face issues if the creditor has documentation."}
        ]
    },
    {
        "slug": "cease-and-desist-letter",
        "title": "Cease and Desist Letter to Debt Collectors",
        "category": "Cease & Desist",
        "short_description": "Legally demand that a debt collector stop all contact with you under the FDCPA.",
        "meta_title": "Free Cease and Desist Letter for Debt Collectors | FDCPA | Credlocity",
        "meta_description": "Download a free cease and desist letter to stop harassing debt collector calls and letters. Exercise your rights under the Fair Debt Collection Practices Act.",
        "description": "Under the Fair Debt Collection Practices Act (FDCPA), Section 805(c), you have the absolute legal right to demand that a debt collector stop contacting you. Once a collector receives your written cease and desist notice, they may only contact you one final time to confirm they received your letter or to notify you of a specific action (such as filing a lawsuit). This letter is your strongest weapon against harassment, excessive phone calls, threats, and other abusive collection practices. Note: this letter stops contact but does NOT eliminate the debt itself.",
        "how_to_use": "1. Use this letter when a debt collector is calling excessively, using abusive language, or contacting you at inconvenient times\n2. Fill out the form below with your personal information and the collector's details\n3. Click 'Generate Letter' to create your personalized cease and desist notice\n4. Print, sign, and date the letter\n5. Send via USPS Certified Mail with Return Receipt Requested — this creates a legal paper trail\n6. Keep a copy of everything\n7. If the collector violates the cease and desist order, document every contact — each violation is worth up to $1,000 in statutory damages",
        "results_likelihood": "A cease and desist letter is nearly 100% effective at stopping contact from legitimate debt collection agencies. Under the FDCPA, collectors face legal penalties of up to $1,000 per violation plus actual damages and attorney fees. However, be aware that: (1) This only applies to third-party collectors, not original creditors, (2) The collector can still sue you for the debt, (3) Stopping contact doesn't eliminate the debt. For most consumers dealing with aggressive collectors, this letter provides immediate and permanent relief from unwanted contact.",
        "aftercare": "After sending your cease and desist letter:\n\n- **Log All Future Contact**: If the collector contacts you after receiving your letter (beyond the one allowed follow-up), document every instance\n- **FDCPA Violations**: Each unauthorized contact after a cease and desist is a separate violation — consult an FDCPA attorney\n- **The Debt Still Exists**: This letter stops contact but doesn't resolve the debt — consider negotiating a settlement or validating the debt\n- **Watch for Lawsuits**: The collector can still file a lawsuit — check your mail for court summons\n- **Credit Report**: The collection may still appear on your credit report — file a separate dispute if inaccurate\n- **File Complaints**: If they violate the cease and desist, file complaints with the CFPB (consumerfinance.gov) and your state Attorney General",
        "send_to": "collector",
        "letter_body": "CEASE AND DESIST NOTICE\n\nTo Whom It May Concern:\n\nRe: Account Name: {account_name}\nAccount Number: {account_number}\n\nI am writing to formally notify you that I am exercising my rights under the Fair Debt Collection Practices Act, Section 805(c) (15 U.S.C. § 1692c(c)).\n\nI hereby demand that you immediately cease and desist all communication with me regarding the above-referenced account. This includes but is not limited to:\n\n- Telephone calls to my home, work, or mobile phone\n- Written correspondence (except as permitted by law)\n- Contact with any third parties regarding this debt\n- Any and all other forms of communication\n\nPursuant to the FDCPA, you may only contact me one final time to acknowledge receipt of this letter or to notify me of a specific legal action. Any further contact beyond what is permitted by law will be considered a violation of the FDCPA.\n\nI am fully aware of my rights under the FDCPA, and I will not hesitate to pursue legal action for any violations, including statutory damages of up to $1,000 per violation, actual damages, and attorney fees.\n\nThis letter is being sent via Certified Mail, Return Receipt Requested, for documentation purposes.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Debt Validation Letter", "url": "/free-letters/debt-validation-letter"},
            {"text": "Your FDCPA Rights", "url": "/credit-repair-laws"},
            {"text": "File a CFPB Complaint", "url": "/scam-checker"},
            {"text": "Professional Help", "url": "/pricing"}
        ],
        "order": 4,
        "faqs": [
            {"q": "What does a cease and desist letter do to a debt collector?", "a": "A cease and desist letter legally compels a debt collector to stop all communication with you. Under FDCPA Section 805(c), once they receive your written notice, they can only contact you one final time to confirm receipt or to notify you of a specific action (like filing a lawsuit). All phone calls, letters, and other contact must stop."},
            {"q": "Does a cease and desist letter erase the debt?", "a": "No. A cease and desist letter only stops contact — it does not eliminate, reduce, or forgive the debt. The collector can still report the debt to credit bureaus and can still file a lawsuit to collect. It simply stops the harassment. To address the debt itself, consider a debt validation letter or pay-for-delete negotiation."},
            {"q": "Can a debt collector sue me after a cease and desist?", "a": "Yes. A cease and desist letter stops communication, not legal action. The collector retains the right to file a lawsuit to collect the debt. However, if the statute of limitations has expired on the debt, they cannot legally sue you. Check your state's statute of limitations before deciding your strategy."},
            {"q": "What if the collector ignores my cease and desist letter?", "a": "If a collector continues to contact you after receiving your cease and desist letter, each unauthorized contact is a separate FDCPA violation. Document every instance (date, time, what was said) and consult an FDCPA attorney. You may be entitled to $1,000 per violation plus actual damages and attorney fees. File a complaint with the CFPB immediately."},
            {"q": "Should I send a cease and desist or a debt validation letter first?", "a": "Always send a debt validation letter first. A cease and desist stops all communication, which means the collector can't respond to your validation request. Send the validation letter, wait for their response, and only send a cease and desist if they continue harassing you or fail to validate the debt."}
        ]
    },
    {
        "slug": "identity-theft-dispute-letter",
        "title": "Identity Theft Dispute Letter",
        "category": "Identity Theft",
        "short_description": "Dispute fraudulent accounts opened in your name due to identity theft with the credit bureaus.",
        "meta_title": "Free Identity Theft Dispute Letter Template | Credlocity",
        "meta_description": "Download a free identity theft dispute letter to remove fraudulent accounts from your credit report. Includes instructions for FTC reports and police reports.",
        "description": "If you are a victim of identity theft, the Fair Credit Reporting Act (FCRA) Section 605B provides you with powerful protections. Credit bureaus must block fraudulent information from your credit report within 4 business days of receiving an identity theft report, a copy of your FTC Identity Theft Report, and proof of your identity. This letter formally notifies the credit bureau of the fraudulent account and demands its immediate removal. Identity theft affects approximately 1 in 15 Americans each year, and swift action is essential to minimize damage to your credit.",
        "how_to_use": "1. File an Identity Theft Report at IdentityTheft.gov — this generates your FTC Identity Theft Affidavit\n2. File a police report with your local law enforcement\n3. Place a fraud alert on your credit reports by calling any one bureau (they must notify the other two)\n4. Consider placing a credit freeze for maximum protection\n5. Fill out the form below with your information and the fraudulent account details\n6. Click 'Generate Letter' to create your identity theft dispute\n7. Print, sign, and date the letter\n8. Include copies (NOT originals) of: FTC Identity Theft Report, police report, government-issued ID, proof of address\n9. Send via USPS Certified Mail with Return Receipt Requested to each bureau",
        "results_likelihood": "Identity theft disputes have the highest success rate of any dispute type — approximately 90-95% when properly documented. Under FCRA Section 605B, credit bureaus must block fraudulent accounts within 4 business days of receiving proper documentation. The key is providing complete documentation: FTC Identity Theft Report, police report, and proof of identity. Without these supporting documents, the success rate drops significantly. If a bureau fails to block the information, they face significant legal liability.",
        "aftercare": "After sending your identity theft dispute:\n\n- **4 Business Days**: Bureaus must block fraudulent information within 4 business days\n- **Extended Fraud Alert**: Consider placing a 7-year extended fraud alert (requires police report)\n- **Credit Freeze**: Place a credit freeze with all three bureaus to prevent new fraudulent accounts\n- **Monitor Regularly**: Check your credit reports monthly for at least 12 months\n- **IRS Identity Protection PIN**: Request an IP PIN from the IRS to prevent tax-related identity theft\n- **Notify Affected Creditors**: Contact each creditor where fraud occurred and dispute directly\n- **Change Passwords**: Update passwords and enable two-factor authentication on all financial accounts\n- **Keep All Documentation**: Maintain your identity theft file for at least 7 years",
        "send_to": "credit_bureaus",
        "letter_body": "To Whom It May Concern:\n\nIDENTITY THEFT VICTIM — REQUEST FOR FRAUDULENT ACCOUNT REMOVAL\n\nI am a victim of identity theft and I am writing to dispute the following fraudulent account on my credit report, pursuant to FCRA Section 605B (15 U.S.C. § 1681c-2).\n\nFraudulent Account Name: {account_name}\nAccount Number: {account_number}\n\nThis account was opened fraudulently without my knowledge, consent, or authorization. I did not open this account, I have never used this account, and I am not responsible for any charges or balances associated with it.\n\nI am requesting that you immediately block this fraudulent information from my credit report as required by the FCRA. Enclosed please find:\n\n1. A copy of my FTC Identity Theft Report (IdentityTheft.gov)\n2. A copy of the police report filed with my local law enforcement\n3. A copy of my government-issued identification\n4. Proof of my current address\n\nUnder FCRA Section 605B, you are required to block this fraudulent information within 4 business days of receiving this letter and the enclosed documentation.\n\nPlease send me written confirmation once the fraudulent account has been removed, along with an updated copy of my credit report.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\nPhone: {phone}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Credit Bureau Dispute Letter", "url": "/free-letters/credit-bureau-dispute-letter"},
            {"text": "Understanding FCRA Protections", "url": "/credit-repair-laws"},
            {"text": "Credit Repair Scam Checker", "url": "/scam-checker"},
            {"text": "Professional Credit Repair", "url": "/pricing"}
        ],
        "order": 5,
        "faqs": [
            {"q": "What documents do I need for an identity theft dispute?", "a": "You need: (1) An FTC Identity Theft Report from IdentityTheft.gov, (2) A police report filed with your local law enforcement, (3) A copy of your government-issued photo ID, and (4) Proof of your current address (utility bill or bank statement). Send copies, never originals."},
            {"q": "How quickly must credit bureaus remove fraudulent accounts?", "a": "Under FCRA Section 605B, credit bureaus must block (remove) fraudulent information within 4 business days of receiving your identity theft dispute along with proper documentation (FTC report, police report, ID, and proof of address). This is one of the fastest removal timelines in consumer protection law."},
            {"q": "Should I freeze my credit after identity theft?", "a": "Absolutely. A credit freeze prevents anyone from opening new accounts in your name. Since the 2018 Economic Growth Act, credit freezes are free at all three bureaus and can be placed and lifted online. This is separate from a fraud alert and provides stronger protection. You can still use your existing credit cards with a freeze in place."},
            {"q": "Can identity theft affect my credit score permanently?", "a": "No. Once fraudulent accounts are properly removed through the dispute process, your credit score should recover. However, the process can take weeks to months depending on how many accounts were opened. The key is acting quickly — file your FTC report, police report, and dispute letters as soon as you discover the theft."},
            {"q": "What if the bureau refuses to remove a fraudulent account?", "a": "If a bureau refuses to remove an account despite proper documentation, you have several options: (1) File a CFPB complaint, (2) Contact your state Attorney General, (3) Consult an FCRA attorney — willful violations can result in $100-$1,000 per violation plus actual damages, (4) Re-submit with additional evidence."}
        ]
    },
    {
        "slug": "pay-for-delete-letter",
        "title": "Pay for Delete Negotiation Letter",
        "category": "Dispute Letters",
        "short_description": "Negotiate with a collection agency to remove a collection account from your credit report in exchange for payment.",
        "meta_title": "Free Pay for Delete Letter Template | Collection Removal | Credlocity",
        "meta_description": "Download a free pay for delete letter to negotiate removal of collection accounts from your credit report in exchange for payment.",
        "description": "A Pay for Delete letter is a negotiation strategy where you offer to pay a collection account (either in full or a settled amount) in exchange for the collector agreeing to remove the negative entry from your credit report. While collectors are not legally required to agree, many will because they prefer to receive payment. This approach is most effective with smaller collection agencies and junk debt buyers who purchased the debt for pennies on the dollar. Important: NEVER pay a collection without getting a written agreement to delete first.",
        "how_to_use": "1. First send a Debt Validation Letter to verify the debt — never negotiate until the debt is validated\n2. Determine how much you can afford to pay — many collectors will accept 30-50% of the balance\n3. Fill out the form below with your information and the collection account details\n4. Click 'Generate Letter' to create your pay for delete offer\n5. Print, sign, and date the letter\n6. Send via USPS Certified Mail with Return Receipt Requested\n7. Wait for a written response — NEVER agree verbally\n8. Only pay after receiving a signed written agreement to delete\n9. Pay by cashier's check or money order — never give electronic access to your bank account",
        "results_likelihood": "Pay for delete success rates vary significantly: approximately 30-50% with junk debt buyers and smaller collection agencies, but lower (10-20%) with larger agencies that have strict policies against deletion. The key factors are: (1) The age of the debt — older debts are easier to negotiate, (2) The size of the balance — smaller debts are more negotiable, (3) The type of collector — original creditors almost never agree, while debt buyers are more flexible. Always get the agreement in writing before paying.",
        "aftercare": "After sending your pay for delete letter:\n\n- **Wait for Written Response**: Do NOT call to follow up for at least 2 weeks\n- **Get It in Writing**: If they agree verbally, insist on a written agreement on company letterhead\n- **Review the Agreement**: Ensure it specifically states they will request deletion (not just 'update') from ALL three bureaus\n- **Pay Securely**: Use cashier's check or money order — never provide bank account details\n- **Keep Everything**: Save the agreement, payment receipt, and certified mail receipt\n- **Verify Deletion**: Check all three credit reports 30-60 days after payment\n- **If Not Deleted**: Send a copy of the agreement with a demand to honor it — consult an attorney if they refuse",
        "send_to": "collector",
        "letter_body": "To Whom It May Concern:\n\nRe: Account Name: {account_name}\nAccount Number: {account_number}\n\nI am writing regarding the above-referenced account that appears on my credit report as a collection. I am prepared to resolve this matter and would like to propose the following arrangement.\n\nI am willing to pay the balance on this account, provided that you agree, in writing, to the following conditions:\n\n1. Upon receipt of payment, you will request deletion of this account from all three major credit bureaus (Equifax, Experian, and TransUnion) within 30 days\n2. You will not sell, transfer, or assign this debt to any other collection agency\n3. You will provide written confirmation that this account has been paid and satisfied in full\n\nThis offer is contingent upon receiving a signed, written agreement from your company confirming the above terms before any payment is made. Please respond in writing on company letterhead.\n\nIf this proposal is acceptable, please send your written agreement to the address below. I will remit payment within 10 business days of receiving your signed agreement.\n\nI look forward to resolving this matter amicably.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Debt Validation Letter", "url": "/free-letters/debt-validation-letter"},
            {"text": "Cease and Desist Letter", "url": "/free-letters/cease-and-desist-letter"},
            {"text": "Professional Help", "url": "/pricing"}
        ],
        "order": 6,
        "faqs": [
            {"q": "What is a pay for delete agreement?", "a": "A pay for delete is a negotiated agreement where you offer to pay a collection account (in full or a settled amount) in exchange for the collector agreeing to remove the collection entry from your credit report. It's not officially recognized by credit bureaus, but many collectors agree to it because they'd rather get paid."},
            {"q": "Is pay for delete legal?", "a": "Pay for delete operates in a gray area. While it's not illegal for a collector to agree to remove accurate information after payment, credit bureaus technically prohibit it in their contracts with data furnishers. In practice, many collectors still honor pay-for-delete agreements because enforcement is rare and they want the payment."},
            {"q": "How much should I offer in a pay for delete?", "a": "Start by offering 30-40% of the outstanding balance, especially for older debts or those purchased by junk debt buyers. Many collectors paid pennies on the dollar for the debt, so even a partial payment is profitable. You can negotiate up from there. For debts under $500, consider offering to pay in full for a guaranteed deletion."},
            {"q": "What if the collector agrees verbally but not in writing?", "a": "NEVER pay based on a verbal agreement. Always insist on a written agreement on company letterhead that specifically states they will request deletion from all three credit bureaus. Without written documentation, you have no proof and no recourse if they take your money and don't delete."},
            {"q": "Should I validate the debt before offering pay for delete?", "a": "Yes, always send a Debt Validation Letter first. Validation may reveal the collector can't prove the debt is yours, the amount is wrong, or the statute of limitations has expired. Only negotiate pay for delete on debts that have been properly validated."}
        ]
    },
    {
        "slug": "inquiry-removal-letter",
        "title": "Hard Inquiry Removal Letter",
        "category": "Credit Bureau",
        "short_description": "Request removal of unauthorized hard inquiries from your credit report that you did not authorize.",
        "meta_title": "Free Hard Inquiry Removal Letter Template | Credlocity",
        "meta_description": "Download a free hard inquiry removal letter to remove unauthorized credit pulls from your credit report. Protect your credit score from unauthorized inquiries.",
        "description": "Under the Fair Credit Reporting Act (FCRA) Section 604, a company can only pull your credit report (hard inquiry) with your written consent or a permissible purpose. If you did not authorize a credit inquiry, you have the right to dispute it and request its removal. Each unauthorized hard inquiry can lower your credit score by 5-10 points and remains on your report for two years. Common unauthorized inquiries include those from companies you never applied to, duplicate pulls from the same company, and inquiries from companies that pulled your report for promotional purposes without proper authorization.",
        "how_to_use": "1. Review your credit reports for any hard inquiries you don't recognize\n2. Note the company name and the date of the inquiry\n3. Do NOT dispute soft inquiries — they don't affect your score and only you can see them\n4. Fill out the form below with your information and the inquiry details\n5. Click 'Generate Letter' to create your inquiry removal request\n6. Print, sign, and date the letter\n7. Send to each credit bureau reporting the unauthorized inquiry via Certified Mail\n8. You may also contact the company that made the inquiry directly",
        "results_likelihood": "Unauthorized inquiry removal has a moderate-to-high success rate of approximately 50-70%. Bureaus must verify that proper authorization existed. If the company that made the inquiry cannot produce proof of your written consent, the inquiry must be removed. Inquiries that are clearly unauthorized (from companies you have no relationship with) have the highest removal rates. Note: If you did authorize the inquiry (even if you don't remember), the dispute will likely be denied.",
        "aftercare": "After sending your inquiry removal letter:\n\n- **30-Day Investigation**: The bureau has 30 days to investigate\n- **Company Contact**: Consider also writing directly to the company that made the inquiry\n- **FTC Complaint**: If the inquiry was truly unauthorized, file an FTC complaint — this may indicate identity theft\n- **Fraud Alert**: If multiple unauthorized inquiries appear, place a fraud alert on your reports\n- **Credit Freeze**: Consider a credit freeze to prevent future unauthorized pulls\n- **Opt Out**: Visit OptOutPrescreen.com to stop pre-approved credit offers that generate soft inquiries\n- **Check Results**: Verify removal on your updated credit report within 45 days",
        "send_to": "credit_bureaus",
        "letter_body": "To Whom It May Concern:\n\nI am writing to dispute an unauthorized hard inquiry that appears on my credit report. Under the Fair Credit Reporting Act, Section 604 (15 U.S.C. § 1681b), a hard inquiry can only appear on my credit report if I provided written authorization or if there was a permissible purpose.\n\nUnauthorized Inquiry By: {account_name}\nDate of Inquiry: {account_number}\n\nI did not authorize this company to pull my credit report, and I have no record of providing written consent for this inquiry. This inquiry was made without my knowledge or permission and is therefore in violation of the FCRA.\n\nI am requesting that you immediately investigate this unauthorized inquiry and remove it from my credit report. Under FCRA Section 611, you are required to conduct a reasonable investigation within 30 days.\n\nIf this inquiry cannot be verified as authorized, it must be permanently removed from my credit report. Please send me written confirmation of the investigation results and an updated copy of my credit report.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Credit Bureau Dispute Letter", "url": "/free-letters/credit-bureau-dispute-letter"},
            {"text": "Identity Theft Dispute", "url": "/free-letters/identity-theft-dispute-letter"},
            {"text": "Understanding Your Credit", "url": "/credit-repair-laws"}
        ],
        "order": 7,
        "faqs": [
            {"q": "What is a hard inquiry and how does it affect my score?", "a": "A hard inquiry (also called a hard pull) occurs when a lender checks your credit report as part of a lending decision. Each hard inquiry can lower your credit score by 5-10 points and remains on your report for 2 years. However, multiple inquiries for the same type of loan (mortgage, auto) within a 14-45 day window are typically counted as a single inquiry."},
            {"q": "Can I remove authorized hard inquiries?", "a": "Generally no. If you applied for credit and authorized the inquiry, it is legitimate and cannot be removed through dispute. However, if the company pulled your credit without your knowledge or written consent, or if the inquiry resulted from identity theft, you have the right to have it removed."},
            {"q": "What's the difference between a hard and soft inquiry?", "a": "A hard inquiry occurs when you apply for credit and affects your score. A soft inquiry occurs when you check your own credit, when a company pre-screens you for offers, or when an existing creditor reviews your account. Soft inquiries do not affect your score and are only visible to you."},
            {"q": "How many points will removing an inquiry add to my score?", "a": "Removing a single hard inquiry typically adds 5-10 points to your credit score, though the impact varies based on your overall credit profile. If you have many inquiries, removing several could have a meaningful cumulative effect. Inquiries less than 12 months old have the biggest score impact."},
            {"q": "Can I dispute inquiries online or do I need to mail a letter?", "a": "While some bureaus allow online inquiry disputes, sending a physical letter via Certified Mail provides better documentation and tends to get more thorough attention. Online disputes are processed through the e-OSCAR system which often results in automatic verification. A mailed letter creates a legal paper trail."}
        ]
    },
    {
        "slug": "method-of-verification-letter",
        "title": "Method of Verification (MOV) Letter",
        "category": "Credit Bureau",
        "short_description": "Demand that the credit bureau reveal exactly how they verified a disputed item — your right under the FCRA.",
        "meta_title": "Free Method of Verification Letter Template | FCRA Rights | Credlocity",
        "meta_description": "Download a free Method of Verification letter to find out how a credit bureau verified a disputed item. A powerful follow-up to initial disputes.",
        "description": "When a credit bureau investigates your dispute and responds that the item has been 'verified,' you have the right under FCRA Section 611(a)(7) to request the Method of Verification — the specific process and documentation they used to confirm the information. Many bureaus use an automated system called e-OSCAR that sends a two-digit code to the furnisher, who then confirms or denies. This process is often called a 'rubber stamp' investigation because it lacks thoroughness. By requesting the MOV, you force the bureau to disclose their investigation process, which may reveal that no meaningful investigation occurred.",
        "how_to_use": "1. Only use this letter AFTER your initial dispute has been 'verified' by the bureau\n2. Reference your original dispute — include the date and any reference numbers\n3. Fill out the form with your information and the account that was verified\n4. Click 'Generate Letter' to create your MOV request\n5. Print, sign, and date the letter\n6. Send via USPS Certified Mail with Return Receipt Requested\n7. If the MOV reveals an inadequate investigation, this may support an FCRA lawsuit",
        "results_likelihood": "The Method of Verification letter itself rarely results in direct item removal (approximately 15-25%). However, it serves two critical strategic purposes: (1) It often reveals that the bureau conducted a superficial investigation, which strengthens any future FCRA complaint or lawsuit, and (2) It creates additional pressure on the bureau, sometimes triggering a re-investigation that leads to removal. This letter is most effective as part of a multi-round dispute strategy rather than as a standalone tool.",
        "aftercare": "After sending your MOV letter:\n\n- **15-Day Response**: The bureau should respond within 15 days with verification details\n- **Review Carefully**: Look for evidence of a 'rubber stamp' e-OSCAR investigation\n- **Document for Legal Action**: If the MOV reveals an inadequate investigation, consult an FCRA attorney\n- **File with CFPB**: Submit a complaint to the Consumer Financial Protection Bureau\n- **Re-dispute with Evidence**: Armed with the MOV information, submit a new dispute with additional documentation\n- **Consider Legal Action**: Willful violations of the FCRA can result in $100-$1,000 in statutory damages per violation\n- **Statute of Limitations**: You have 2 years from discovery (or 5 years from violation) to file an FCRA lawsuit",
        "send_to": "credit_bureaus",
        "letter_body": "To Whom It May Concern:\n\nRe: Method of Verification Request — FCRA Section 611(a)(7)\n\nI recently submitted a dispute regarding the following account on my credit report:\n\nAccount Name: {account_name}\nAccount Number: {account_number}\n\nYour investigation concluded that this item was 'verified as accurate.' I am now exercising my right under the Fair Credit Reporting Act, Section 611(a)(7) (15 U.S.C. § 1681i(a)(7)), to request a description of the procedure used to determine the accuracy and completeness of this information.\n\nSpecifically, please provide:\n\n1. The method of verification used to investigate my dispute\n2. The name, address, and telephone number of any person contacted in connection with the investigation\n3. A description of the specific documents or records reviewed during the investigation\n4. The business name and address of any furnisher contacted\n5. Whether the investigation was conducted by automated means (e-OSCAR) or through a manual review\n\nPlease provide this information within 15 days as required by the FCRA. Failure to provide the method of verification may constitute a violation of my rights under the FCRA.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Credit Bureau Dispute Letter", "url": "/free-letters/credit-bureau-dispute-letter"},
            {"text": "Understanding FCRA Rights", "url": "/credit-repair-laws"},
            {"text": "Professional Credit Repair", "url": "/pricing"}
        ],
        "order": 8,
        "faqs": [
            {"q": "What is a Method of Verification (MOV) letter?", "a": "A Method of Verification letter is a follow-up request sent to a credit bureau after your initial dispute has been 'verified as accurate.' Under FCRA Section 611(a)(7), you have the right to know exactly how the bureau investigated your dispute — what process they used, who they contacted, and what documents they reviewed."},
            {"q": "When should I send a Method of Verification letter?", "a": "Send a MOV letter immediately after receiving a dispute result that says the item was 'verified.' This is your second-round strategy. The MOV forces the bureau to disclose whether they conducted a genuine investigation or simply used the automated e-OSCAR system to rubber-stamp the furnisher's confirmation."},
            {"q": "What is e-OSCAR and why does it matter?", "a": "e-OSCAR (Online Solution for Complete and Accurate Reporting) is an automated system credit bureaus use to process disputes. It reduces complex disputes to a 2-digit code sent to the furnisher, who then clicks 'verify' or 'not verify.' Courts have found this process inadequate in many cases. A MOV letter may reveal this superficial process, supporting further legal action."},
            {"q": "Can a MOV letter lead to item removal?", "a": "A MOV letter itself has about a 15-25% chance of directly causing removal. However, its real value is strategic: if the bureau reveals a superficial investigation, you can file a CFPB complaint, re-dispute with additional evidence, or consult an FCRA attorney about a lawsuit for willful non-compliance."},
            {"q": "How long does the bureau have to respond to a MOV request?", "a": "The bureau should respond within 15 days of receiving your MOV request. Their response must describe the procedure used to determine accuracy, the business name and address of any furnisher contacted, and the telephone number of the furnisher if reasonably available."}
        ]
    },
    {
        "slug": "statute-of-limitations-letter",
        "title": "Statute of Limitations Expiration Letter",
        "category": "Debt Validation",
        "short_description": "Challenge a debt collector attempting to collect on a time-barred debt that has exceeded the statute of limitations.",
        "meta_title": "Free Statute of Limitations Letter for Debt | Stop Old Debt Collection | Credlocity",
        "meta_description": "Download a free statute of limitations letter to stop collectors from pursuing time-barred debts. Know your rights against old debt collection.",
        "description": "Every state has a statute of limitations on debt — a time period after which a creditor can no longer sue you to collect. Once the statute of limitations has expired, the debt is considered 'time-barred.' While the debt technically still exists, a collector cannot legally threaten to sue you or file a lawsuit. If a collector contacts you about a time-barred debt, this letter puts them on notice that you are aware of your rights. Important: Be careful not to 'restart the clock' — making a payment, acknowledging the debt, or entering a payment agreement can reset the statute of limitations in many states.",
        "how_to_use": "1. Research your state's statute of limitations for the type of debt (credit card, medical, etc.)\n2. Determine when the 'clock started' — typically the date of last payment or last activity\n3. If the statute has expired, fill out the form below with your details\n4. Click 'Generate Letter' to create your time-barred debt notice\n5. Print, sign, and date the letter\n6. Send via USPS Certified Mail with Return Receipt Requested\n7. DO NOT make any payment or acknowledge the debt — this can restart the clock\n8. DO NOT agree to any payment plan or 'good faith' payment",
        "results_likelihood": "This letter is highly effective (80-90%) at stopping collection activity on truly time-barred debts. Most reputable collectors will stop contact after receiving proper notice. If a collector files or threatens a lawsuit on a time-barred debt, this is a violation of the FDCPA and you may be entitled to damages. However, be aware: (1) The debt may still appear on your credit report for up to 7 years from the date of first delinquency, (2) The statute of limitations varies by state (3-10 years), (3) Some actions can restart the clock.",
        "aftercare": "After sending your statute of limitations letter:\n\n- **Document Any Further Contact**: If the collector continues, each contact may be an FDCPA violation\n- **Do NOT Make Payments**: Any payment, even $1, can restart the statute of limitations in most states\n- **Do NOT Acknowledge the Debt**: If contacted, simply state 'I sent a written response' and hang up\n- **Credit Report**: The debt may still appear on your report — file a dispute if it's been more than 7 years from the date of first delinquency\n- **Consult an Attorney**: If the collector threatens or files a lawsuit on a time-barred debt, consult an FDCPA attorney immediately\n- **File Complaints**: Report violations to the CFPB and your state Attorney General",
        "send_to": "collector",
        "letter_body": "To Whom It May Concern:\n\nRe: Account Name: {account_name}\nReference/Account Number: {account_number}\n\nI am writing in response to your attempts to collect on the above-referenced account. I am aware that the statute of limitations on this debt has expired under the laws of my state.\n\nThis debt is time-barred, meaning you can no longer file a lawsuit to collect this debt. Under the Fair Debt Collection Practices Act (FDCPA), any attempt to collect on a time-barred debt through threats of legal action constitutes a violation of federal law.\n\nPlease be advised of the following:\n\n1. I do not acknowledge this debt as valid or owing\n2. I will not be making any payments on this account\n3. The statute of limitations on this debt has expired\n4. Any representation that legal action may be taken is a violation of the FDCPA\n\nI demand that you immediately cease all collection activity regarding this account. Any further contact regarding this debt, other than to confirm receipt of this letter, will be considered harassment and a violation of the FDCPA.\n\nI reserve all rights to pursue legal action for any violations of the FDCPA, including statutory damages and attorney fees.\n\nSincerely,\n\n[Your Signature]\n{first_name} {last_name}\n{address}\n{city}, {state} {zip_code}\n\nDate: {current_date}",
        "required_fields": ["first_name", "last_name", "address", "city", "state", "zip_code", "phone", "email", "account_name", "account_number"],
        "related_links": [
            {"text": "Debt Validation Letter", "url": "/free-letters/debt-validation-letter"},
            {"text": "Cease and Desist Letter", "url": "/free-letters/cease-and-desist-letter"},
            {"text": "Know Your Rights", "url": "/credit-repair-laws"},
            {"text": "Professional Help", "url": "/pricing"}
        ],
        "order": 9,
        "faqs": [
            {"q": "What is the statute of limitations on debt?", "a": "The statute of limitations on debt is a state-imposed time limit after which a creditor can no longer file a lawsuit to force you to pay. It typically ranges from 3-10 years depending on your state and the type of debt. Once expired, the debt is 'time-barred' — it still exists, but it cannot be enforced through the courts."},
            {"q": "Does the statute of limitations affect my credit report?", "a": "No. The statute of limitations (how long a collector can sue) is separate from the credit reporting period (how long an item stays on your report). The FCRA allows most negative items to remain on your report for 7 years from the date of first delinquency, regardless of whether the statute of limitations has expired."},
            {"q": "Can a payment restart the statute of limitations?", "a": "In most states, yes. Making any payment — even $1 — can restart the statute of limitations clock. This is why collectors often try to get you to make a 'good faith' payment. Similarly, acknowledging the debt in writing or agreeing to a payment plan can restart the clock in many states. Never pay or acknowledge a time-barred debt without consulting an attorney."},
            {"q": "Can a collector sue me on a time-barred debt?", "a": "While a collector technically can file a lawsuit on a time-barred debt, doing so may violate the FDCPA. If you are sued, you must raise the statute of limitations as an affirmative defense in your response. If the court agrees the debt is time-barred, the case will be dismissed. Never ignore a lawsuit — always respond."},
            {"q": "How do I find my state's statute of limitations?", "a": "Statute of limitations varies by state and debt type (credit card, medical, written contract, oral agreement). You can search '[your state] statute of limitations on debt' or consult an attorney. Common ranges: credit card debt (3-6 years in most states), medical debt (3-10 years), written contracts (4-6 years)."}
        ]
    }
]


# ============ ENDPOINTS ============

@letter_templates_router.get("/list")
async def list_letter_templates():
    """Public: Get all letter templates for the listing page"""
    templates = []
    for t in LETTER_TEMPLATES:
        templates.append({
            "slug": t["slug"],
            "title": t["title"],
            "category": t["category"],
            "short_description": t["short_description"],
            "results_likelihood": t["results_likelihood"][:120] + "..." if len(t["results_likelihood"]) > 120 else t["results_likelihood"],
            "order": t["order"],
            "send_to": t["send_to"],
        })
    templates.sort(key=lambda x: x["order"])
    return templates


@letter_templates_router.get("/{slug}")
async def get_letter_template(slug: str):
    """Public: Get a single letter template with full content"""
    for t in LETTER_TEMPLATES:
        if t["slug"] == slug:
            return {**t, "credit_bureaus": CREDIT_BUREAUS}
    raise HTTPException(status_code=404, detail="Letter template not found")


@letter_templates_router.post("/{slug}/generate-pdf")
async def generate_letter_pdf(slug: str, data: dict):
    """Generate a pre-filled PDF letter for download"""
    template = None
    for t in LETTER_TEMPLATES:
        if t["slug"] == slug:
            template = t
            break
    if not template:
        raise HTTPException(status_code=404, detail="Letter template not found")

    # Validate required fields
    missing = [f for f in template["required_fields"] if not data.get(f, "").strip()]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    # Add current date
    data["current_date"] = datetime.now().strftime("%B %d, %Y")

    # Fill the template
    body = template["letter_body"]
    for key, val in data.items():
        body = body.replace("{" + key + "}", str(val))

    # Determine recipient address block
    send_to = template.get("send_to", "credit_bureaus")
    recipient_block = ""
    if send_to == "credit_bureaus":
        bureau = data.get("bureau", "Equifax")
        for b in CREDIT_BUREAUS:
            if b["name"].lower() == bureau.lower():
                recipient_block = f"{b['name']}\n{b['address']}"
                break
        if not recipient_block:
            recipient_block = f"{CREDIT_BUREAUS[0]['name']}\n{CREDIT_BUREAUS[0]['address']}"
    elif send_to in ("collector", "creditor"):
        collector_name = data.get("collector_name", data.get("account_name", ""))
        collector_addr = data.get("collector_address", "")
        recipient_block = f"{collector_name}\n{collector_addr}" if collector_addr else collector_name

    # Generate PDF using reportlab
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_LEFT

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            leftMargin=1*inch, rightMargin=1*inch,
                            topMargin=1*inch, bottomMargin=1*inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('LetterTitle', parent=styles['Heading1'], fontSize=14, spaceAfter=6)
    body_style = ParagraphStyle('LetterBody', parent=styles['Normal'], fontSize=11, leading=16, spaceAfter=4)
    sender_style = ParagraphStyle('Sender', parent=styles['Normal'], fontSize=10, leading=14)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=9, leading=12, textColor='#666666')

    story = []

    # Sender info
    sender = f"{data.get('first_name', '')} {data.get('last_name', '')}<br/>"
    sender += f"{data.get('address', '')}<br/>"
    sender += f"{data.get('city', '')}, {data.get('state', '')} {data.get('zip_code', '')}<br/>"
    sender += f"Phone: {data.get('phone', '')}<br/>"
    sender += f"Email: {data.get('email', '')}"
    story.append(Paragraph(sender, sender_style))
    story.append(Spacer(1, 0.3*inch))

    # Date
    story.append(Paragraph(data["current_date"], body_style))
    story.append(Spacer(1, 0.2*inch))

    # Recipient
    if recipient_block:
        story.append(Paragraph(recipient_block.replace("\n", "<br/>"), body_style))
        story.append(Spacer(1, 0.3*inch))

    # Letter body
    for para in body.split("\n\n"):
        para = para.strip()
        if not para:
            continue
        para_html = para.replace("\n", "<br/>")
        story.append(Paragraph(para_html, body_style))
        story.append(Spacer(1, 0.1*inch))

    # Signature reminder
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("<b>IMPORTANT: Sign and date this letter before sending.</b>", small_style))
    story.append(Paragraph("Send via USPS Certified Mail, Return Receipt Requested.", small_style))

    doc.build(story)
    buffer.seek(0)

    safe_title = template["slug"].replace("-", "_")
    filename = f"{safe_title}_{data.get('last_name', 'letter')}.pdf"

    # Track download
    if db is not None:
        await db.letter_downloads.insert_one({
            "id": str(uuid.uuid4()),
            "template_slug": slug,
            "template_title": template["title"],
            "user_email": data.get("email", ""),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
