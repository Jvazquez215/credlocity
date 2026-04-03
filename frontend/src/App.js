import { lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { ActivityTrackerProvider } from "./context/ActivityTrackerContext";
import { TranslationProvider } from "./context/TranslationContext";
import { LeadCaptureProvider } from "./context/LeadCaptureContext";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import FloatingBugReport from "./components/FloatingBugReport";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Eager-loaded homepage
import HomeNew from "./pages/HomeNew";
import "./styles/homepage-animations.css";

// Lazy-loaded global components
const BannersPopupsDisplay = lazy(() => import("./components/BannersPopupsDisplay"));
const PublicChatWidget = lazy(() => import("./components/chat/PublicChatWidget"));

// Lazy-loaded pages (reduces initial bundle size significantly)
// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Outsourcing = lazy(() => import("./pages/Outsourcing"));
const OutsourcingReviewDetail = lazy(() => import("./pages/OutsourcingReviewDetail"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CreditScores = lazy(() => import("./pages/CreditScores"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const AboutCredlocity = lazy(() => import("./pages/AboutCredlocity"));

// Partner Pages
const PartnersHub = lazy(() => import("./pages/partners/PartnersHub"));
const RealEstatePartner = lazy(() => import("./pages/partners/RealEstatePartner"));
const MortgageProfessionals = lazy(() => import("./pages/partners/MortgageProfessionals"));
const CarDealerships = lazy(() => import("./pages/partners/CarDealerships"));
const SocialMediaInfluencers = lazy(() => import("./pages/partners/SocialMediaInfluencers"));
const AttorneyPartners = lazy(() => import("./pages/partners/AttorneyPartners"));
const CollectionRemoval = lazy(() => import("./pages/credit-issues/CollectionRemoval"));
const LatePaymentRemoval = lazy(() => import("./pages/credit-issues/LatePaymentRemoval"));
const ChargeOffRemoval = lazy(() => import("./pages/credit-issues/ChargeOffRemoval"));
const BankruptcyCreditRepair = lazy(() => import("./pages/credit-issues/BankruptcyCreditRepair"));
const IdentityTheftCreditRepair = lazy(() => import("./pages/credit-issues/IdentityTheftCreditRepair"));
const HardInquiryRemoval = lazy(() => import("./pages/credit-issues/HardInquiryRemoval"));
const SubmitComplaint = lazy(() => import("./pages/SubmitComplaint"));
const SuccessStoriesDynamic = lazy(() => import("./pages/SuccessStoriesDynamic"));
const SuccessStoryDetail = lazy(() => import("./pages/SuccessStoryDetail"));
const BlogHub = lazy(() => import("./pages/BlogHub"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Team = lazy(() => import("./pages/Team"));
const AuthorProfile = lazy(() => import("./pages/AuthorProfile"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const LawsuitsPage = lazy(() => import("./pages/LawsuitsPage"));
const LawsuitDetail = lazy(() => import("./pages/LawsuitDetail"));
const PressReleasesPage = lazy(() => import("./pages/PressReleasesPage"));
const PressReleaseDetail = lazy(() => import("./pages/PressReleaseDetail"));
const AnnouncementDetail = lazy(() => import("./pages/AnnouncementDetail"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const AttorneySignup = lazy(() => import("./pages/AttorneySignup"));
const CaseUpdatePage = lazy(() => import("./pages/attorney/CaseUpdates"));
const AttorneyCases = lazy(() => import("./pages/attorney/AttorneyCases"));
const AttorneyPayments = lazy(() => import("./pages/attorney/AttorneyPayments"));
const AttorneyCaseDetail = lazy(() => import("./pages/attorney/AttorneyCaseDetail"));
const CreditRepairReviews = lazy(() => import("./pages/CreditRepairReviews"));
const ReviewDetailPage = lazy(() => import("./pages/ReviewDetailPage"));
const ClientReviewFormEnhanced = lazy(() => import("./pages/ClientReviewFormEnhanced"));

// Header Navigation Pages
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FreeTrialPage = lazy(() => import("./pages/FreeTrialPage"));
const FraudRemoval = lazy(() => import("./pages/credit-issues/FraudRemoval"));
const HumanTraffickingBlock = lazy(() => import("./pages/credit-issues/HumanTraffickingBlock"));
const CreditRepairScams = lazy(() => import("./pages/CreditRepairScams"));
const CreditTrackerApp = lazy(() => import("./pages/CreditTrackerApp"));
const SchoolApp = lazy(() => import("./pages/SchoolApp"));

// Education Pages
const EducationHub = lazy(() => import("./pages/education/EducationHub"));
const CreditBuilding = lazy(() => import("./pages/education/CreditBuilding"));
const CreditReports = lazy(() => import("./pages/education/CreditReports"));
const RepairMethods = lazy(() => import("./pages/education/RepairMethods"));
const DebtManagement = lazy(() => import("./pages/education/DebtManagement"));
const FinancialWellness = lazy(() => import("./pages/education/FinancialWellness"));
const FCRAGuide = lazy(() => import("./pages/education/FCRAGuide"));
const FDCPAGuide = lazy(() => import("./pages/education/FDCPAGuide"));
const CROAGuide = lazy(() => import("./pages/education/CROAGuide"));
const TSRCompliance = lazy(() => import("./pages/education/TSRCompliance"));
const FCRA605B = lazy(() => import("./pages/education/FCRA605B"));
const FreeLetters = lazy(() => import("./pages/FreeLetters"));
const LetterTemplatePage = lazy(() => import("./pages/LetterTemplatePage"));

// Competitor Comparisons
const CompetitorComparison = lazy(() => import("./pages/comparisons/CompetitorComparison"));
const CreditRepairReviewsHub = lazy(() => import("./pages/comparisons/CreditRepairReviews"));
const SwitchAndSave = lazy(() => import("./pages/SwitchAndSave"));
const ScamChecker = lazy(() => import("./pages/ScamChecker"));
const FreeCreditReportReview = lazy(() => import("./pages/FreeCreditReportReview"));
const DisputeLetter609 = lazy(() => import("./pages/DisputeLetter609"));
const DisputeCollectionsHub = lazy(() => import("./pages/guides/DisputeCollectionsHub"));
const DisputeCollectionAgency = lazy(() => import("./pages/guides/DisputeCollectionAgency"));

// Calculator Tools
const CalculatorPage = lazy(() => import("./pages/tools/CalculatorPage"));
const CreditScoreSimulator = lazy(() => import("./pages/tools/CreditScoreSimulator"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const ForgotPassword = lazy(() => import("./pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ClientIntakeForm = lazy(() => import("./pages/public/ClientIntakeForm"));

// Admin Partners Pages
const PartnersList = lazy(() => import("./pages/admin/partners/PartnersList"));
const PartnerForm = lazy(() => import("./pages/admin/partners/PartnerForm"));

// Attorney Portal Pages
const AttorneyLogin = lazy(() => import("./pages/attorney/AttorneyLogin"));
const AttorneyDashboard = lazy(() => import("./pages/attorney/AttorneyDashboard"));
const CaseMarketplace = lazy(() => import("./pages/attorney/CaseMarketplace"));
const CasePledge = lazy(() => import("./pages/attorney/CasePledge"));
const AttorneyReviews = lazy(() => import("./pages/attorney/AttorneyReviews"));

// CRO Portal Pages
const CROLogin = lazy(() => import("./pages/cro/CROLogin"));
const CRODashboard = lazy(() => import("./pages/cro/CRODashboard"));
const CROLandingPage = lazy(() => import("./pages/cro/CROLandingPage"));

// Company Portal Pages (Credit Repair Companies)
const CompanyLogin = lazy(() => import("./pages/company/CompanyLogin"));
const CompanySignup = lazy(() => import("./pages/company/CompanySignup"));
const CompanyDashboard = lazy(() => import("./pages/company/CompanyDashboard"));

// Partner Portal Pages (Outsourcing Partners)
const OutsourcingLogin = lazy(() => import("./pages/partner/OutsourcingLogin"));

// E-Signature
const SignAgreement = lazy(() => import("./pages/SignAgreement"));
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard"));

// E-Books / Store
const EbooksPage = lazy(() => import("./pages/EbooksPage"));
const EbookDetailPage = lazy(() => import("./pages/EbookDetailPage"));

// Credit Builder Public Store
const CreditBuilderPublicStore = lazy(() => import("./pages/public/CreditBuilderPublicStore"));
const AffiliateLandingPage = lazy(() => import("./pages/public/AffiliateLandingPage"));
const AffiliateDirectory = lazy(() => import("./pages/public/AffiliateDirectory"));
const LocalLandingPage = lazy(() => import("./pages/public/LocalLandingPage"));
const LocationsPage = lazy(() => import("./pages/LocationsPage"));
const CityFirstTimeHomeBuyer = lazy(() => import("./pages/CityFirstTimeHomeBuyer"));

// Collection Payment Portal
const CollectionPaymentPortal = lazy(() => import("./pages/public/CollectionPaymentPortal"));

// Audit Dashboard
const AuditDashboard = lazy(() => import("./pages/admin/audit/AuditDashboard"));
const LeadsPage = lazy(() => import("./pages/admin/leads/LeadsPage"));

// Payment Pages
const PaymentSuccess = lazy(() => import("./pages/payment/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/payment/PaymentCancel"));

// Hidden Portal Links (internal use only)
const PortalLinks = lazy(() => import("./pages/PortalLinks"));

// Loading spinner for lazy-loaded routes
const LazySpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

console.log('App.js loaded - all imports successful');

function App() {
  return (
    <HelmetProvider>
      <TranslationProvider>
      <LeadCaptureProvider>
      <AuthProvider>
        <PermissionsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ActivityTrackerProvider>
            <div className="App">
              <Suspense fallback={<LazySpinner />}>
              <Routes>
              {/* Admin Routes (no header/footer) - Must come FIRST to avoid being caught by /* */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/reset-password" element={<ResetPassword />} />
              <Route path="/admin/*" element={<AdminDashboard />} />

            {/* Payment Routes (no header/footer) */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* Company Portal Routes (Credit Repair Companies) */}
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route path="/company/signup" element={<CompanySignup />} />
            <Route path="/company/*" element={<CompanyDashboard />} />

            {/* Partner Portal Routes (Outsourcing Partners) */}
            <Route path="/partner/login" element={<OutsourcingLogin />} />
            <Route path="/partner/*" element={<PartnerDashboard />} />

            {/* CRO Portal Routes (Credit Repair Organizations) */}
            <Route path="/cro/login" element={<CROLogin />} />
            <Route path="/cro/*" element={<CRODashboard />} />

            {/* Attorney Portal Routes (no header/footer) */}
            <Route path="/attorney/login" element={<AttorneyLogin />} />

            {/* E-Signature Public Route */}
            <Route path="/sign/:signToken" element={<SignAgreement />} />
            <Route path="/attorney/marketplace" element={<CaseMarketplace />} />
            <Route path="/attorney/cases/:caseId/pledge" element={<CasePledge />} />
            <Route path="/attorney/case-updates/:caseId" element={<CaseUpdatePage />} />
            <Route path="/attorney/case-updates" element={<CaseUpdatePage />} />
            <Route path="/attorney/cases/:caseId" element={<AttorneyCaseDetail />} />
            <Route path="/attorney/cases" element={<AttorneyCases />} />
            <Route path="/attorney/payments" element={<AttorneyPayments />} />
            <Route path="/attorney/reviews" element={<AttorneyReviews />} />
            <Route path="/attorney" element={<AttorneyDashboard />} />

            {/* Hidden Portal Links Page (no header/footer, noindex) */}
            <Route path="/portals" element={<PortalLinks />} />

            {/* Client Intake Form (public, no header/footer) */}
            <Route path="/intake" element={<ClientIntakeForm />} />
            <Route path="/get-started" element={<ClientIntakeForm />} />
            <Route path="/credit-assessment" element={<ClientIntakeForm />} />

            {/* Attorney Routes (public, no header/footer) */}
            <Route path="/attorney/signup" element={<AttorneySignup />} />
            <Route path="/attorneys/apply" element={<AttorneySignup />} />

            {/* CRO Landing Page (public, own design) */}
            <Route path="/cro-partnership" element={<CROLandingPage />} />

            {/* Blog Routes (have their own header/footer) */}
            <Route path="/blog" element={<BlogHub />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/post/:slug" element={<BlogPost />} />

            {/* Team Routes (have their own header/footer) */}
            <Route path="/team" element={<Team />} />
            <Route path="/team/:slug" element={<AuthorProfile />} />
            <Route path="/faqs" element={<FAQPage />} />
            {/* Redirect old /faq URL to new /faqs */}
            <Route path="/faq" element={<Navigate to="/faqs" replace />} />

            {/* Public Routes with Header and Footer */}
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <HomeNew />
                  <Footer />
                </>
              }
            />
            <Route
              path="/home-old"
              element={
                <>
                  <Header />
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route
              path="/pricing"
              element={
                <>
                  <Header />
                  <Pricing />
                  <Footer />
                </>
              }
            />
            <Route
              path="/become-a-partner"
              element={
                <>
                  <Header />
                  <PartnersHub />
                  <Footer />
                </>
              }
            />
            <Route
              path="/become-a-partner/real-estate"
              element={
                <>
                  <Header />
                  <RealEstatePartner />
                  <Footer />
                </>
              }
            />
            <Route
              path="/become-a-partner/mortgage-professionals"
              element={
                <>
                  <Header />
                  <MortgageProfessionals />
                  <Footer />
                </>
              }
            />
            <Route
              path="/become-a-partner/car-dealerships"
              element={
                <>
                  <Header />
                  <CarDealerships />
                  <Footer />
                </>
              }
            />
            <Route
              path="/become-a-partner/social-media-influencers"
              element={
                <>
                  <Header />
                  <SocialMediaInfluencers />
                  <Footer />
                </>
              }
            />
            <Route
              path="/become-a-partner/attorneys"
              element={
                <>
                  <Header />
                  <AttorneyPartners />
                  <Footer />
                </>
              }
            />
            <Route
              path="/credit-scores"
              element={
                <>
                  <Header />
                  <CreditScores />
                  <Footer />
                </>
              }
            />
            <Route
              path="/why-us"
              element={
                <>
                  <Header />
                  <WhyUs />
                  <Footer />
                </>
              }
            />
            <Route
              path="/about-us"
              element={
                <>
                  <Header />
                  <AboutUs />
                  <Footer />
                </>
              }
            />
            <Route
              path="/about-credlocity"
              element={
                <>
                  <Header />
                  <AboutCredlocity />
                  <Footer />
                </>
              }
            />
            <Route
              path="/collection-removal"
              element={
                <>
                  <Header />
                  <CollectionRemoval />
                  <Footer />
                </>
              }
            />
            <Route
              path="/late-payment-removal"
              element={
                <>
                  <Header />
                  <LatePaymentRemoval />
                  <Footer />
                </>
              }
            />
            <Route
              path="/charge-off-removal"
              element={
                <>
                  <Header />
                  <ChargeOffRemoval />
                  <Footer />
                </>
              }
            />
            <Route
              path="/bankruptcy-credit-repair"
              element={
                <>
                  <Header />
                  <BankruptcyCreditRepair />
                  <Footer />
                </>
              }
            />
            <Route
              path="/identity-theft-credit-repair"
              element={
                <>
                  <Header />
                  <IdentityTheftCreditRepair />
                  <Footer />
                </>
              }
            />
            <Route
              path="/hard-inquiry-removal"
              element={
                <>
                  <Header />
                  <HardInquiryRemoval />
                  <Footer />
                </>
              }
            />
            <Route
              path="/report-company"
              element={
                <>
                  <Header />
                  <SubmitComplaint />
                  <Footer />
                </>
              }
            />
            <Route
              path="/submit-complaint"
              element={
                <>
                  <Header />
                  <SubmitComplaint />
                  <Footer />
                </>
              }
            />
            <Route
              path="/credit-repair-reviews"
              element={<CreditRepairReviews />}
            />
            <Route
              path="/credit-repair-reviews/review/:reviewSlug"
              element={<ReviewDetailPage />}
            />
            <Route
              path="/credit-repair-reviews/:companySlug"
              element={<CreditRepairReviews />}
            />
            <Route
              path="/success-stories"
              element={
                <>
                  <Header />
                  <SuccessStoriesDynamic />
                  <Footer />
                </>
              }
            />
            <Route
              path="/success-stories/:slug"
              element={
                <>
                  <Header />
                  <SuccessStoryDetail />
                  <Footer />
                </>
              }
            />
            {/* Client Review Form Routes */}
            <Route
              path="/leave-review"
              element={
                <>
                  <Header />
                  <ClientReviewFormEnhanced />
                  <Footer />
                </>
              }
            />
            <Route
              path="/review/:token"
              element={<ClientReviewFormEnhanced />}
            />
            <Route
              path="/lawsuits"
              element={<LawsuitsPage />}
            />
            <Route
              path="/lawsuits/:slug"
              element={<LawsuitDetail />}
            />
            <Route
              path="/press-releases"
              element={<PressReleasesPage />}
            />
            <Route
              path="/press-releases/:slug"
              element={<PressReleaseDetail />}
            />
            <Route
              path="/announcements/:slug"
              element={<AnnouncementDetail />}
            />
            <Route
              path="/partners"
              element={<PartnersPage />}
            />
            <Route
              path="/partners/:slug"
              element={<PartnerDetail />}
            />
            <Route
              path="/legal/:slug"
              element={<LegalPage />}
            />
            <Route
              path="/outsourcing"
              element={<Outsourcing />}
            />
            <Route
              path="/outsourcing/reviews/:slug"
              element={<OutsourcingReviewDetail />}
            />

            {/* Header Navigation Pages */}
            <Route path="/how-it-works" element={<><Header /><HowItWorks /><Footer /></>} />
            <Route path="/30-day-free-trial" element={<><Header /><FreeTrialPage /><Footer /></>} />
            <Route path="/fraud-removal" element={<><Header /><FraudRemoval /><Footer /></>} />
            <Route path="/human-trafficking-credit-block" element={<><Header /><HumanTraffickingBlock /><Footer /></>} />
            <Route path="/credit-repair-scams" element={<><Header /><CreditRepairScams /><Footer /></>} />
            <Route path="/credit-tracker-app" element={<><Header /><CreditTrackerApp /><Footer /></>} />

            {/* Store / E-Books Pages */}
            <Route path="/store" element={<><Header /><EbooksPage /><Footer /></>} />
            <Route path="/store/:slug" element={<><Header /><EbookDetailPage /><Footer /></>} />
            <Route path="/ebooks" element={<Navigate to="/store" replace />} />

            {/* Credit Builder Public Store */}
            <Route path="/credit-builder-store" element={<><Header /><CreditBuilderPublicStore /><Footer /></>} />

            {/* Education Pages */}
            <Route path="/education-hub" element={<><Header /><EducationHub /><Footer /></>} />
            <Route path="/credit-repair-laws" element={<><Header /><EducationHub /><Footer /></>} />
            <Route path="/credit-building" element={<><Header /><CreditBuilding /><Footer /></>} />
            <Route path="/credit-reports" element={<><Header /><CreditReports /><Footer /></>} />
            <Route path="/repair-methods" element={<><Header /><RepairMethods /><Footer /></>} />
            <Route path="/debt-management" element={<><Header /><DebtManagement /><Footer /></>} />
            <Route path="/financial-wellness" element={<><Header /><FinancialWellness /><Footer /></>} />
            <Route path="/fcra-guide" element={<><Header /><FCRAGuide /><Footer /></>} />
            <Route path="/fdcpa-guide" element={<><Header /><FDCPAGuide /><Footer /></>} />
            <Route path="/croa-guide" element={<><Header /><CROAGuide /><Footer /></>} />
            <Route path="/tsr-compliance" element={<><Header /><TSRCompliance /><Footer /></>} />
            <Route path="/fcra-605b-block" element={<><Header /><FCRA605B /><Footer /></>} />

            {/* Free Letters Page */}
            <Route path="/free-letters" element={<><Header /><FreeLetters /><Footer /></>} />
            <Route path="/free-letters/:slug" element={<><Header /><LetterTemplatePage /><Footer /></>} />

            {/* Competitor Comparisons */}
            <Route path="/credit-repair-reviews-hub" element={<><Header /><CreditRepairReviewsHub /><Footer /></>} />
            <Route path="/switch" element={<><Header /><SwitchAndSave /><Footer /></>} />
            <Route path="/scam-checker" element={<><Header /><ScamChecker /><Footer /></>} />
            <Route path="/free-credit-report-review" element={<><Header /><FreeCreditReportReview /><Footer /></>} />
            <Route path="/609-dispute-letter" element={<><Header /><DisputeLetter609 /><Footer /></>} />
            <Route path="/how-to-dispute-collections" element={<><Header /><DisputeCollectionsHub /><Footer /></>} />
            <Route path="/dispute/:slug" element={<><Header /><DisputeCollectionAgency /><Footer /></>} />
            <Route path="/vs-lexington-law" element={<><Header /><CompetitorComparison competitor="lexington-law" /><Footer /></>} />
            <Route path="/vs-creditrepair" element={<><Header /><CompetitorComparison competitor="creditrepair-com" /><Footer /></>} />
            <Route path="/vs-credit-people" element={<><Header /><CompetitorComparison competitor="credit-people" /><Footer /></>} />
            <Route path="/vs-credit-pros" element={<><Header /><CompetitorComparison competitor="credit-pros" /><Footer /></>} />
            <Route path="/vs-credit-saint" element={<><Header /><CompetitorComparison competitor="credit-saint" /><Footer /></>} />
            <Route path="/vs-white-jacobs" element={<><Header /><CompetitorComparison competitor="white-jacobs" /><Footer /></>} />

            {/* Calculator Tools */}
            <Route path="/tools/credit-score-simulator" element={<><Header /><CreditScoreSimulator /><Footer /></>} />
            <Route path="/tools/credit-score-calculator" element={<><Header /><CreditScoreSimulator /><Footer /></>} />
            <Route path="/tools/debt-to-income-calculator" element={<><Header /><CalculatorPage type="debt-to-income" /><Footer /></>} />
            <Route path="/tools/credit-utilization-calculator" element={<><Header /><CalculatorPage type="credit-utilization" /><Footer /></>} />
            <Route path="/tools/loan-payment-calculator" element={<><Header /><CalculatorPage type="loan-payment" /><Footer /></>} />
            <Route path="/tools/debt-payoff-calculator" element={<><Header /><CalculatorPage type="debt-payoff" /><Footer /></>} />
            <Route path="/tools/mortgage-calculator" element={<><Header /><CalculatorPage type="mortgage" /><Footer /></>} />
            <Route path="/tools/credit-card-payoff-calculator" element={<><Header /><CalculatorPage type="credit-card-payoff" /><Footer /></>} />
            <Route path="/tools/savings-calculator" element={<><Header /><CalculatorPage type="savings" /><Footer /></>} />
            <Route path="/tools/interest-calculator" element={<><Header /><CalculatorPage type="interest" /><Footer /></>} />
            <Route path="/tools/budget-calculator" element={<><Header /><CalculatorPage type="budget" /><Footer /></>} />
            <Route path="/tools/refinance-calculator" element={<><Header /><CalculatorPage type="refinance" /><Footer /></>} />
            <Route path="/tools/student-loan-calculator" element={<><Header /><CalculatorPage type="student-loan" /><Footer /></>} />
            <Route path="/tools/auto-loan-calculator" element={<><Header /><CalculatorPage type="auto-loan" /><Footer /></>} />
            <Route path="/tools/retirement-calculator" element={<><Header /><CalculatorPage type="retirement" /><Footer /></>} />

            {/* Affiliate Landing Pages (standalone, no header/footer) */}
            <Route path="/p/:slug" element={<AffiliateLandingPage />} />

            {/* Affiliate Directory (with header/footer) */}
            <Route path="/affiliate-partners" element={<><Header /><AffiliateDirectory /><Footer /></>} />

            {/* Locations Hub Page */}
            <Route path="/locations" element={<><Header /><LocationsPage /><Footer /></>} />

            {/* First-Time Home Buyer Resource (all cities) */}
            <Route path="/:slug/first-time-home-buyer" element={<><Header /><CityFirstTimeHomeBuyer /><Footer /></>} />

            {/* School Routes */}
            <Route path="/school" element={<SchoolApp />} />
            <Route path="/school/:page" element={<SchoolApp />} />
            <Route path="/school/:page/:courseId" element={<SchoolApp />} />

            {/* Local Landing Pages (with header/footer) - must be last catch-all */}
            <Route path="/:slug" element={<><Header /><LocalLandingPage /><Footer /></>} />

            {/* Collection Payment Portal (standalone, no header/footer) */}
            <Route path="/pay/:token" element={<CollectionPaymentPortal />} />

            </Routes>
            </Suspense>
            <Toaster />
            
            {/* Global Components - Available on all pages */}
            <FloatingBugReport />
            <Suspense fallback={null}>
              <BannersPopupsDisplay />
              <PublicChatWidget />
            </Suspense>
          </div>
          </ActivityTrackerProvider>
        </BrowserRouter>
        </PermissionsProvider>
      </AuthProvider>
      </LeadCaptureProvider>
      </TranslationProvider>
    </HelmetProvider>
  );
}

export default App;
