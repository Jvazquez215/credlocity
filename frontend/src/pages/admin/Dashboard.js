import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { 
  FileText, Star, MessageSquare, Image, AlertCircle, LogOut, LayoutDashboard, 
  Users, ExternalLink, ChevronDown, ChevronRight, Scale, Newspaper, Settings,
  Building2, Receipt, ClipboardList, HelpCircle, Megaphone, FolderOpen, Calendar,
  Phone, DollarSign, AlertTriangle, Plus, CheckCircle, CheckCircle2, Gavel, Link2,
  BarChart3, Globe, Award, Shield, MessageCircle, Headphones
} from 'lucide-react';
import DashboardHome from './DashboardHome';
import PagesList from './pages/PagesList';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import ComplaintsList from './complaints/ComplaintsList';
import CreditRepairComplaintManagement from './complaints/ComplaintManagement';
import MediaLibrary from './media/MediaLibrary';
import ReviewsList from './reviews/ReviewsList';
import CreateReview from './reviews/CreateReview';
import EditReview from './reviews/EditReview';
import ReviewLinkingManagement from './reviews/ReviewLinkingManagement';
import ReviewApprovalDashboard from './reviews/ReviewApprovalDashboard';
import BlogList from './blog/BlogList';
import CreatePost from './blog/CreatePost';
import EditPost from './blog/EditPost';
import ImportPost from './blog/ImportPost';
import CategoryManager from './blog/CategoryManager';
import AffiliatesList from './affiliates/AffiliatesList';
import CreateAffiliate from './affiliates/CreateAffiliate';
import PartnerLeadsList from './partners/PartnerLeadsList';
import VisualEditor from './page-builder/VisualEditor';
import BannersPopupsList from './banners-popups/BannersPopupsList';
import BannerPopupForm from './banners-popups/BannerPopupForm';
import LawsuitsList from './lawsuits/LawsuitsList';
import LawsuitForm from './lawsuits/LawsuitForm';
import PressReleasesList from './press-releases/PressReleasesList';
import PressReleaseForm from './press-releases/PressReleaseForm';
import PartnersList from './partners/PartnersList';
import PartnerForm from './partners/PartnerForm';
import LegalPagesList from './legal-pages/LegalPagesList';
import LegalPageForm from './legal-pages/LegalPageForm';
import ReviewCategoriesList from './review-categories/ReviewCategoriesList';
import ReviewCategoryForm from './review-categories/ReviewCategoryForm';
import OutsourceReviewsList from './outsource-reviews/OutsourceReviewsList';
import OutsourceReviewForm from './outsource-reviews/OutsourceReviewForm';
import AuthorsList from './authors/AuthorsList';
import CreateAuthor from './authors/CreateAuthor';
import EditAuthor from './authors/EditAuthor';
import FAQList from './faq/FAQList';
import CreateFAQ from './faq/CreateFAQ';
import EditFAQ from './faq/EditFAQ';
import FAQCategoryManager from './faq/FAQCategoryManager';
import SiteSettings from './settings/SiteSettings';
import LawsuitSettings from './settings/LawsuitSettings';
import LawsuitCategoriesManager from './settings/LawsuitCategoriesManager';
import LawsuitTypesManager from './settings/LawsuitTypesManager';
import LawsuitViolationsManager from './settings/LawsuitViolationsManager';
import PartyRolesManager from './settings/PartyRolesManager';
import OutcomeStagesManager from './settings/OutcomeStagesManager';

// Outsourcing Management
import OutsourcingDashboard from './outsourcing/OutsourcingDashboard';
import OutsourceInquiriesList from './outsourcing/OutsourceInquiriesList';
import OutsourcePartnersList from './outsourcing/OutsourcePartnersList';
import OutsourcePartnerForm from './outsourcing/OutsourcePartnerForm';
import OutsourcePartnerProfile from './outsourcing/OutsourcePartnerProfile';
import OutsourceInvoicesList from './outsourcing/OutsourceInvoicesList';
import OutsourceInvoiceForm from './outsourcing/OutsourceInvoiceForm';
import OutsourceWorkLogs from './outsourcing/OutsourceWorkLogs';
import OutsourceTicketsList from './outsourcing/OutsourceTicketsList';
import OutsourceTicketCategoriesSettings from './outsourcing/OutsourceTicketCategoriesSettings';
import OutsourceCouponsManager from './outsourcing/OutsourceCouponsManager';

// Unified Pages
import UnifiedReviewsPage from './reviews/UnifiedReviewsPage';
import MetricsDashboard from './metrics/MetricsDashboard';

// Client Management
import ClientsList from './clients/ClientsList';
import ClientProfile from './clients/ClientProfile';

// CMS / Form Builder
import IntakeFormsManager from './cms/IntakeFormsManager';
import CalendarsManager from './cms/CalendarsManager';

// Collections Management
import CollectionsDashboard from './collections/CollectionsDashboard';
import CollectionsAccountsList from './collections/CollectionsAccountsList';
import CollectionsAccountDetail from './collections/CollectionsAccountDetail';
import PaymentPlanWizard from './collections/PaymentPlanWizard';
import CollectionsCreateAccount from './collections/CollectionsCreateAccount';
import CollectionsApprovalQueue from './collections/CollectionsApprovalQueue';
import GoogleVoiceSettings from './collections/GoogleVoiceSettings';

// Team & Attorney Management
import TeamManagement from './team/TeamManagement';
import AttorneyManagement from './attorneys/AttorneyManagement';
import CaseUpdatePenalties from './attorneys/CaseUpdatePenalties';

// Revenue Dashboard
import RevenueDashboard from './revenue/RevenueDashboard';
import RevenueSplitReport from './revenue/RevenueSplitReport';

// Marketplace Management
import MarketplaceManagement from './marketplace/MarketplaceManagement';

// Case Management
import AdminCaseSubmission from './cases/AdminCaseSubmission';

// Billing & Invoices
import BillingDashboard from './billing/BillingDashboard';

// Security
import SecurityDashboard from './security/SecurityDashboard';

// Chat Systems
import InternalChat from './chat/InternalChat';
import SupportChatDashboard from './support-chat/SupportChatDashboard';

// Collapsible Menu Section Component
const MenuSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
};

// Menu Item Component
const MenuItem = ({ to, icon: Icon, label, badge, indent = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  
  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition ${
        indent ? 'ml-4' : ''
      } ${
        isActive 
          ? 'bg-primary-blue text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          isActive ? 'bg-white text-primary-blue' : 'bg-orange-100 text-orange-600'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

const Dashboard = () => {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pendingInquiries, setPendingInquiries] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    // Fetch pending inquiries count for badge
    const fetchPendingCount = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/outsource/inquiries`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPendingInquiries(data.filter(i => i.status === 'pending').length);
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };
    if (isAuthenticated) {
      fetchPendingCount();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-cinzel text-xl font-bold text-primary-blue hidden md:block">
                Credlocity CMS
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" target="_blank" className="text-sm text-gray-500 hover:text-primary-blue flex items-center gap-1">
              <ExternalLink className="w-4 h-4" /> View Site
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <span className="text-sm text-gray-600 hidden md:block">
              {user?.full_name}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {user?.role?.replace('_', ' ')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-[calc(100vh-57px)] shadow-sm overflow-y-auto" data-testid="admin-sidebar">
          <nav className="p-4 space-y-1">
            {/* Dashboard */}
            <MenuItem to="/admin" icon={LayoutDashboard} label="Dashboard" />

            {/* ==================== METRICS ==================== */}
            <MenuItem to="/admin/metrics" icon={BarChart3} label="Metrics & Analytics" />

            {/* ==================== WEBSITE MANAGEMENT ==================== */}
            <MenuSection title="Website Management" icon={Globe} defaultOpen={true}>
              <MenuItem to="/admin/pages" icon={FileText} label="Pages" />
              <MenuItem to="/admin/blog" icon={MessageSquare} label="Blog" />
              <MenuItem to="/admin/faqs" icon={HelpCircle} label="FAQs" />
              <MenuItem to="/admin/press-releases" icon={Newspaper} label="Press Releases" />
              <MenuItem to="/admin/lawsuits" icon={Scale} label="Lawsuits Filed" />
              <MenuItem to="/admin/legal-pages" icon={FileText} label="Legal Pages" />
              <MenuItem to="/admin/banners-popups" icon={Megaphone} label="Banners & Popups" />
              <MenuItem to="/admin/media" icon={Image} label="Media Library" />
            </MenuSection>

            {/* ==================== SOCIAL PROOF ==================== */}
            <MenuItem to="/admin/social-proof" icon={Star} label="Social Proof" />
            <MenuSection title="Review Tools" icon={Award} defaultOpen={false}>
              <MenuItem to="/admin/review-approval" icon={CheckCircle2} label="Approval Queue" />
              <MenuItem to="/admin/review-linking" icon={Link2} label="Review Linking" />
              <MenuItem to="/admin/review-categories" icon={FolderOpen} label="Categories" />
            </MenuSection>

            {/* ==================== CLIENTS ==================== */}
            <MenuSection title="Clients" icon={Users} defaultOpen={false}>
              <MenuItem to="/admin/clients" icon={Users} label="All Clients" />
            </MenuSection>

            {/* ==================== COLLECTIONS ==================== */}
            <MenuSection title="Collections" icon={Phone} defaultOpen={false}>
              <MenuItem to="/admin/collections" icon={LayoutDashboard} label="Dashboard" />
              <MenuItem to="/admin/collections/accounts" icon={Users} label="All Accounts" />
              <MenuItem to="/admin/collections/accounts/new" icon={Plus} label="Create Account" />
              <MenuItem to="/admin/collections/approvals" icon={CheckCircle} label="Approval Queue" />
              <MenuItem to="/admin/collections/google-voice" icon={Phone} label="Google Voice Settings" />
              <MenuItem to="/admin/collections/disputes" icon={AlertTriangle} label="Disputes" />
              <MenuItem to="/admin/collections/commission" icon={DollarSign} label="Commission" />
            </MenuSection>

            {/* ==================== OUTSOURCING ==================== */}
            <MenuSection title="Outsourcing" icon={Building2} defaultOpen={false}>
              <MenuItem to="/admin/outsourcing" icon={LayoutDashboard} label="Dashboard" />
              <MenuItem to="/admin/outsourcing/inquiries" icon={AlertCircle} label="Inquiries" badge={pendingInquiries > 0 ? pendingInquiries : null} />
              <MenuItem to="/admin/outsourcing/partners" icon={Building2} label="Partners" />
              <MenuItem to="/admin/outsourcing/tickets" icon={AlertCircle} label="Escalations" />
              <MenuItem to="/admin/outsourcing/work-logs" icon={ClipboardList} label="Work Logs" />
              <MenuItem to="/admin/outsourcing/invoices" icon={Receipt} label="Invoices" />
            </MenuSection>

            {/* ==================== BILLING & INVOICES ==================== */}
            <MenuItem to="/admin/billing" icon={DollarSign} label="Billing & Invoices" />

            {/* ==================== ATTORNEY MARKETPLACE ==================== */}
            <MenuSection title="Attorney Marketplace" icon={Gavel} defaultOpen={false}>
              <MenuItem to="/admin/marketplace" icon={Gavel} label="Case Management" />
              <MenuItem to="/admin/cases/new" icon={Plus} label="Submit New Case" />
              <MenuItem to="/admin/attorneys" icon={Scale} label="Attorney Network" />
              <MenuItem to="/admin/attorneys/penalties" icon={AlertTriangle} label="Case Update Penalties" />
              <MenuItem to="/admin/revenue/splits" icon={DollarSign} label="Revenue Splits" />
            </MenuSection>

            {/* ==================== AFFILIATE PROGRAM ==================== */}
            <MenuSection title="Affiliate Program" icon={ExternalLink} defaultOpen={false}>
              <MenuItem to="/admin/partner-leads" icon={Users} label="Affiliate Leads" />
              <MenuItem to="/admin/affiliates" icon={ExternalLink} label="Competitor Comparisons" />
            </MenuSection>

            {/* ==================== CREDLOCITY PARTNERS ==================== */}
            <MenuSection title="Credlocity Partners" icon={Award} defaultOpen={false}>
              <MenuItem to="/admin/partners" icon={Users} label="All Partners" />
              <MenuItem to="/admin/partners/new" icon={Plus} label="Add Partner" />
            </MenuSection>

            {/* ==================== FORM BUILDER ==================== */}
            <MenuSection title="Form Builder" icon={ClipboardList} defaultOpen={false}>
              <MenuItem to="/admin/intake-forms" icon={ClipboardList} label="Intake Forms" />
              <MenuItem to="/admin/calendars" icon={Calendar} label="Calendars" />
            </MenuSection>

            {/* ==================== TEAM ==================== */}
            <MenuSection title="Team" icon={Users} defaultOpen={false}>
              <MenuItem to="/admin/authors" icon={Users} label="Authors / Team" />
              <MenuItem to="/admin/team" icon={Users} label="Team Management" />
            </MenuSection>

            {/* ==================== CHAT SYSTEMS ==================== */}
            <MenuSection title="Chat & Support" icon={MessageCircle} defaultOpen={false}>
              <MenuItem to="/admin/chat" icon={MessageCircle} label="Internal Team Chat" />
              <MenuItem to="/admin/support-chat" icon={Headphones} label="Customer Support" />
            </MenuSection>

            {/* ==================== SECURITY ==================== */}
            <MenuItem to="/admin/security" icon={Shield} label="Security" />

            {/* ==================== SETTINGS ==================== */}
            <MenuSection title="Settings" icon={Settings} defaultOpen={false}>
              <MenuItem to="/admin/settings" icon={Settings} label="Site Settings" />
              <MenuItem to="/admin/settings/lawsuits" icon={Scale} label="Lawsuit Config" />
              <MenuItem to="/admin/complaints" icon={AlertCircle} label="Complaint Portal" />
            </MenuSection>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="pages" element={<PagesList />} />
            <Route path="pages/create" element={<CreatePage />} />
            <Route path="pages/edit/:pageId" element={<EditPage />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/create" element={<CreatePost />} />
            <Route path="blog/edit/:postId" element={<EditPost />} />
            <Route path="blog/import" element={<ImportPost />} />
            <Route path="blog/categories" element={<CategoryManager />} />
            <Route path="affiliates" element={<AffiliatesList />} />
            <Route path="affiliates/create" element={<CreateAffiliate />} />
            <Route path="partner-leads" element={<PartnerLeadsList />} />
            <Route path="page-builder/:pageId" element={<VisualEditor />} />
            <Route path="banners-popups" element={<BannersPopupsList />} />
            <Route path="banners-popups/new" element={<BannerPopupForm />} />
            <Route path="banners-popups/edit/:id" element={<BannerPopupForm />} />
            <Route path="lawsuits" element={<LawsuitsList />} />
            <Route path="lawsuits/new" element={<LawsuitForm />} />
            <Route path="lawsuits/:id" element={<LawsuitForm />} />
            <Route path="press-releases" element={<PressReleasesList />} />
            <Route path="press-releases/new" element={<PressReleaseForm />} />
            <Route path="press-releases/:id" element={<PressReleaseForm />} />
            <Route path="legal-pages" element={<LegalPagesList />} />
            <Route path="legal-pages/new" element={<LegalPageForm />} />
            <Route path="legal-pages/:id" element={<LegalPageForm />} />
            <Route path="authors" element={<AuthorsList />} />
            <Route path="authors/create" element={<CreateAuthor />} />
            <Route path="authors/edit/:authorId" element={<EditAuthor />} />
            <Route path="faqs" element={<FAQList />} />
            <Route path="faqs/create" element={<CreateFAQ />} />
            <Route path="faqs/edit/:faqId" element={<EditFAQ />} />
            <Route path="faqs/categories" element={<FAQCategoryManager />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="settings/lawsuits" element={<LawsuitSettings />} />
            <Route path="settings/lawsuit-categories" element={<LawsuitCategoriesManager />} />
            <Route path="settings/lawsuit-types" element={<LawsuitTypesManager />} />
            <Route path="settings/lawsuit-violations" element={<LawsuitViolationsManager />} />
            <Route path="settings/party-roles" element={<PartyRolesManager />} />
            <Route path="settings/outcome-stages" element={<OutcomeStagesManager />} />
            <Route path="complaints" element={<ComplaintsList />} />
            <Route path="credit-repair-reviews" element={<CreditRepairComplaintManagement />} />
            <Route path="review-approval" element={<ReviewApprovalDashboard />} />
            <Route path="social-proof" element={<UnifiedReviewsPage />} />
            <Route path="metrics" element={<MetricsDashboard />} />
            <Route path="reviews" element={<ReviewsList />} />
            <Route path="reviews/create" element={<CreateReview />} />
            <Route path="reviews/edit/:reviewId" element={<EditReview />} />
            <Route path="review-linking" element={<ReviewLinkingManagement />} />
            <Route path="review-categories" element={<ReviewCategoriesList />} />
            <Route path="review-categories/new" element={<ReviewCategoryForm />} />
            <Route path="review-categories/:id" element={<ReviewCategoryForm />} />
            <Route path="outsource-reviews" element={<OutsourceReviewsList />} />
            <Route path="outsource-reviews/create" element={<OutsourceReviewForm />} />
            <Route path="outsource-reviews/edit/:reviewId" element={<OutsourceReviewForm />} />
            <Route path="media" element={<MediaLibrary />} />

            {/* Credlocity Partners Routes */}
            <Route path="partners" element={<PartnersList />} />
            <Route path="partners/new" element={<PartnerForm />} />
            <Route path="partners/:id" element={<PartnerForm />} />
            
            {/* Client Management Routes */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:clientId" element={<ClientProfile />} />

            {/* Team & Attorney Management Routes */}
            <Route path="team" element={<TeamManagement />} />
            <Route path="attorneys" element={<AttorneyManagement />} />
            <Route path="attorneys/penalties" element={<CaseUpdatePenalties />} />

            {/* Revenue Dashboard Routes */}
            <Route path="revenue" element={<RevenueDashboard />} />
            <Route path="revenue/splits" element={<RevenueSplitReport />} />

            {/* Attorney Marketplace Routes */}
            <Route path="marketplace" element={<MarketplaceManagement />} />

            {/* Admin Case Submission */}
            <Route path="cases/new" element={<AdminCaseSubmission />} />

            {/* Security Dashboard Routes */}
            <Route path="security" element={<SecurityDashboard />} />

            {/* Chat Systems Routes */}
            <Route path="chat" element={<InternalChat />} />
            <Route path="support-chat" element={<SupportChatDashboard />} />

            {/* Form Builder / CMS Routes */}
            <Route path="intake-forms" element={<IntakeFormsManager />} />
            <Route path="calendars" element={<CalendarsManager />} />

            {/* Collections Management Routes */}
            <Route path="collections" element={<CollectionsDashboard />} />
            <Route path="collections/accounts" element={<CollectionsAccountsList />} />
            <Route path="collections/accounts/new" element={<CollectionsCreateAccount />} />
            <Route path="collections/accounts/:accountId" element={<CollectionsAccountDetail />} />
            <Route path="collections/accounts/:accountId/payment-plan" element={<PaymentPlanWizard />} />
            <Route path="collections/approvals" element={<CollectionsApprovalQueue />} />
            <Route path="collections/google-voice" element={<GoogleVoiceSettings />} />
            <Route path="collections/disputes" element={<div className="text-gray-600">Dispute Tickets - Coming Soon</div>} />
            <Route path="collections/commission" element={<div className="text-gray-600">Commission Dashboard - Coming Soon</div>} />

            {/* Outsourcing Routes */}
            <Route path="outsourcing" element={<OutsourcingDashboard />} />
            <Route path="outsourcing/inquiries" element={<OutsourceInquiriesList />} />
            <Route path="outsourcing/partners" element={<OutsourcePartnersList />} />
            <Route path="outsourcing/partners/new" element={<OutsourcePartnerForm />} />
            <Route path="outsourcing/partners/edit/:partnerId" element={<OutsourcePartnerForm />} />
            <Route path="outsourcing/partners/profile/:partnerId" element={<OutsourcePartnerProfile />} />
            <Route path="outsourcing/work-logs" element={<OutsourceWorkLogs />} />
            <Route path="outsourcing/invoices" element={<OutsourceInvoicesList />} />
            <Route path="outsourcing/invoices/new" element={<OutsourceInvoiceForm />} />
            <Route path="outsourcing/invoices/:invoiceId" element={<OutsourceInvoiceForm />} />
            <Route path="outsourcing/tickets" element={<OutsourceTicketsList />} />
            <Route path="outsourcing/ticket-categories" element={<OutsourceTicketCategoriesSettings />} />
            <Route path="outsourcing/coupons" element={<OutsourceCouponsManager />} />

            {/* Billing & Invoices Routes */}
            <Route path="billing/*" element={<BillingDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
