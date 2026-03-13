import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CreditSageChatbot from "./components/CreditSageChatbot";
import BannersPopupsDisplay from "./components/BannersPopupsDisplay";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { ActivityTrackerProvider } from "./context/ActivityTrackerContext";
import { TranslationProvider } from "./context/TranslationContext";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PublicChatWidget from "./components/chat/PublicChatWidget";

// Public Pages
import Home from "./pages/Home";
import HomeNew from "./pages/HomeNew";
import Outsourcing from "./pages/Outsourcing";
import OutsourcingReviewDetail from "./pages/OutsourcingReviewDetail";
import "./styles/homepage-animations.css";
import Pricing from "./pages/Pricing";
import CreditScores from "./pages/CreditScores";
import WhyUs from "./pages/WhyUs";

// Partner Pages
import PartnersHub from "./pages/partners/PartnersHub";
import RealEstatePartner from "./pages/partners/RealEstatePartner";
import MortgageProfessionals from "./pages/partners/MortgageProfessionals";
import CarDealerships from "./pages/partners/CarDealerships";
import SocialMediaInfluencers from "./pages/partners/SocialMediaInfluencers";
import AttorneyPartners from "./pages/partners/AttorneyPartners";
import CollectionRemoval from "./pages/credit-issues/CollectionRemoval";
import LatePaymentRemoval from "./pages/credit-issues/LatePaymentRemoval";
import ChargeOffRemoval from "./pages/credit-issues/ChargeOffRemoval";
import BankruptcyCreditRepair from "./pages/credit-issues/BankruptcyCreditRepair";
import IdentityTheftCreditRepair from "./pages/credit-issues/IdentityTheftCreditRepair";
import HardInquiryRemoval from "./pages/credit-issues/HardInquiryRemoval";
import ReportCompany from "./pages/ReportCompany";
import SubmitComplaint from "./pages/SubmitComplaint";
import SuccessStories from "./pages/SuccessStories";
import SuccessStoriesDynamic from "./pages/SuccessStoriesDynamic";
import SuccessStoryDetail from "./pages/SuccessStoryDetail";
import BlogHub from "./pages/BlogHub";
import BlogPost from "./pages/BlogPost";
import Team from "./pages/Team";
import AuthorProfile from "./pages/AuthorProfile";
import FAQPage from "./pages/FAQPage";
import LawsuitsPage from "./pages/LawsuitsPage";
import LawsuitDetail from "./pages/LawsuitDetail";
import PressReleasesPage from "./pages/PressReleasesPage";
import PressReleaseDetail from "./pages/PressReleaseDetail";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import PartnersPage from "./pages/PartnersPage";
import PartnerDetail from "./pages/PartnerDetail";
import LegalPage from "./pages/LegalPage";
import AttorneySignup from "./pages/AttorneySignup";
import CaseUpdatePage from "./pages/attorney/CaseUpdates";
import AttorneyCases from "./pages/attorney/AttorneyCases";
import AttorneyPayments from "./pages/attorney/AttorneyPayments";
import AttorneyCaseDetail from "./pages/attorney/AttorneyCaseDetail";
import CreditRepairReviews from "./pages/CreditRepairReviews";
import ReviewDetailPage from "./pages/ReviewDetailPage";
import ClientReviewFormEnhanced from "./pages/ClientReviewFormEnhanced";

// Admin Pages  
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ClientIntakeForm from "./pages/public/ClientIntakeForm";

// Admin Partners Pages
import PartnersList from "./pages/admin/partners/PartnersList";
import PartnerForm from "./pages/admin/partners/PartnerForm";

// Attorney Portal Pages
import AttorneyLogin from "./pages/attorney/AttorneyLogin";
import AttorneyDashboard from "./pages/attorney/AttorneyDashboard";
import CaseMarketplace from "./pages/attorney/CaseMarketplace";
import CasePledge from "./pages/attorney/CasePledge";
import AttorneyReviews from "./pages/attorney/AttorneyReviews";

// Company Portal Pages (Credit Repair Companies)
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanySignup from "./pages/company/CompanySignup";
import CompanyDashboard from "./pages/company/CompanyDashboard";

// Partner Portal Pages (Outsourcing Partners)
import OutsourcingLogin from "./pages/partner/OutsourcingLogin";

// E-Signature
import SignAgreement from "./pages/SignAgreement";
import PartnerDashboard from "./pages/partner/PartnerDashboard";

// Payment Pages
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";

console.log('App.js loaded - all imports successful');

function App() {
  return (
    <HelmetProvider>
      <TranslationProvider>
      <AuthProvider>
        <PermissionsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ActivityTrackerProvider>
            <div className="App">
              <Routes>
              {/* Admin Routes (no header/footer) - Must come FIRST to avoid being caught by /* */}
              <Route path="/admin/login" element={<AdminLogin />} />
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

            {/* Client Intake Form (public, no header/footer) */}
            <Route path="/intake" element={<ClientIntakeForm />} />
            <Route path="/get-started" element={<ClientIntakeForm />} />
            <Route path="/credit-assessment" element={<ClientIntakeForm />} />

            {/* Attorney Routes (public, no header/footer) */}
            <Route path="/attorney/signup" element={<AttorneySignup />} />
            <Route path="/attorneys/apply" element={<AttorneySignup />} />

            {/* Blog Routes (have their own header/footer) */}
            <Route path="/blog" element={<BlogHub />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

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
            </Routes>
            <Toaster />
            
            {/* Global Components - Available on all pages */}
            <CreditSageChatbot />
            <BannersPopupsDisplay />
            <PublicChatWidget />
          </div>
          </ActivityTrackerProvider>
        </BrowserRouter>
        </PermissionsProvider>
      </AuthProvider>
      </TranslationProvider>
    </HelmetProvider>
  );
}

export default App;
