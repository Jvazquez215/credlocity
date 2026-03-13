import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { Button } from '../../components/ui/button';
import { 
  FileText, Star, MessageSquare, Image, AlertCircle, LogOut, LayoutDashboard, 
  Users, ExternalLink, ChevronDown, ChevronRight, Scale, Newspaper, Settings,
  Building2, Receipt, ClipboardList, HelpCircle, Megaphone, FolderOpen, Calendar,
  Phone, DollarSign, AlertTriangle, Plus, CheckCircle, CheckCircle2, Gavel, Link2,
  BarChart3, Globe, Award, Shield, MessageCircle, Headphones, GraduationCap,
  Briefcase, CreditCard, TrendingUp, Wallet, UserCog, BookOpen
} from 'lucide-react';
import SmartDashboard from './SmartDashboard';
import { useTranslation } from '../../context/TranslationContext';
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
import CMSChatBubble from '../../components/chat/CMSChatBubble';

// Training & Policies
import TrainingCenter from './training/TrainingCenter';

// Payroll
import PayrollDashboard from './payroll/PayrollDashboard';

// Documentation
import DocumentCenter from './documentation/DocumentCenter';

// Collections Commission Settings
import CollectionsCommissionSettings from './collections/CollectionsCommissionSettings';

// Commission Dashboard
import CommissionDashboard from './collections/CommissionDashboard';

// Permissions Manager
import PermissionsManager from './PermissionsManager';

// Collapsible Menu Section Component with permission gating
const MenuSection = ({ title, icon: Icon, children, defaultOpen = false, perm }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { hasPerm, hasAnyPerm } = usePermissions();
  
  // If perm is specified as array, check if user has any of those perms
  if (perm) {
    const perms = Array.isArray(perm) ? perm : [perm];
    if (!hasAnyPerm(perms)) return null;
  }
  
  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span className="text-[11px] font-semibold uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {isOpen && <div className="mt-0.5 space-y-0.5 ml-2">{children}</div>}
    </div>
  );
};

// Permission-aware Menu Item Component
const MenuItem = ({ to, icon: Icon, label, badge, perm }) => {
  const location = useLocation();
  const { hasPerm, hasAnyPerm } = usePermissions();
  const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to + '/'));
  
  if (perm) {
    const perms = Array.isArray(perm) ? perm : [perm];
    if (!hasAnyPerm(perms)) return null;
  }
  
  return (
    <Link
      to={to}
      data-testid={`nav-${label.toLowerCase().replace(/[\s&\/]+/g, '-')}`}
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition text-sm ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
          isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
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

  const { t, lang, toggleLang } = useTranslation();
  const LanguageToggle = () => (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:bg-gray-50"
      data-testid="lang-toggle-btn"
      title={lang === 'en' ? 'Cambiar a Espanol' : 'Switch to English'}
    >
      <span className="text-base">{lang === 'en' ? '\uD83C\uDDFA\uD83C\uDDF8' : '\uD83C\uDDEA\uD83C\uDDF8'}</span>
      <span className="text-gray-600">{lang === 'en' ? 'EN' : 'ES'}</span>
    </button>
  );

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
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-cinzel text-lg font-bold text-gray-900 hidden md:block">
                Credlocity
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <LanguageToggle />
            <Link to="/" target="_blank" className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> {t('nav.view_site')}
            </Link>
            <div className="h-5 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-700">{user?.full_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700 leading-none">{user?.full_name}</p>
                <p className="text-[10px] text-gray-400">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Restructured by Department */}
        <aside className="w-60 bg-white min-h-[calc(100vh-49px)] border-r border-gray-200 overflow-y-auto" data-testid="admin-sidebar">
          <nav className="p-3 space-y-0.5">
            {/* Master Dashboard */}
            <MenuItem to="/admin" icon={LayoutDashboard} label={t('nav.dashboard')} perm="dashboard.view" />
            <MenuItem to="/admin/metrics" icon={BarChart3} label={t('nav.analytics')} perm="dashboard.view" />

            {/* ==================== OPERATIONS ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.operations')}</span></div>
            
            <MenuSection title={t('nav.collections')} icon={Phone} perm={["collections.view", "collections.manage"]}>
              <MenuItem to="/admin/collections" icon={LayoutDashboard} label={t('nav.collections_dashboard')} perm="collections.view" />
              <MenuItem to="/admin/collections/accounts" icon={Users} label={t('nav.accounts')} perm="collections.view" />
              <MenuItem to="/admin/collections/accounts/new" icon={Plus} label={t('nav.new_account')} perm="collections.manage" />
              <MenuItem to="/admin/collections/approvals" icon={CheckCircle} label={t('nav.approvals')} perm="collections.manage" />
              <MenuItem to="/admin/collections/commissions-dashboard" icon={TrendingUp} label={t('nav.commissions')} perm="collections.view" />
              <MenuItem to="/admin/collections/commission" icon={Settings} label={t('nav.commission_config')} perm="collections.settings" />
              <MenuItem to="/admin/collections/google-voice" icon={Phone} label={t('nav.voice_settings')} perm="collections.settings" />
              <MenuItem to="/admin/collections/disputes" icon={AlertTriangle} label={t('nav.disputes')} perm="collections.manage" />
            </MenuSection>

            <MenuSection title={t('nav.clients')} icon={Users} perm={["clients.view", "clients.manage"]}>
              <MenuItem to="/admin/clients" icon={Users} label={t('nav.all_clients')} perm="clients.view" />
            </MenuSection>

            <MenuSection title={t('nav.outsourcing')} icon={Building2} perm={["outsourcing.view", "outsourcing.manage"]}>
              <MenuItem to="/admin/outsourcing" icon={LayoutDashboard} label={t('nav.outsourcing_dashboard')} perm="outsourcing.view" />
              <MenuItem to="/admin/outsourcing/inquiries" icon={AlertCircle} label={t('nav.inquiries')} badge={pendingInquiries > 0 ? pendingInquiries : null} perm="outsourcing.view" />
              <MenuItem to="/admin/outsourcing/partners" icon={Building2} label={t('nav.partners_list')} perm="outsourcing.view" />
              <MenuItem to="/admin/outsourcing/tickets" icon={AlertCircle} label={t('nav.escalations')} perm="outsourcing.manage" />
              <MenuItem to="/admin/outsourcing/work-logs" icon={ClipboardList} label={t('nav.work_logs')} perm="outsourcing.view" />
              <MenuItem to="/admin/outsourcing/invoices" icon={Receipt} label={t('nav.invoices')} perm="outsourcing.manage" />
            </MenuSection>

            {/* ==================== LEGAL ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.legal')}</span></div>
            
            <MenuSection title={t('nav.attorney_marketplace')} icon={Gavel} perm={["legal.view", "legal.manage"]}>
              <MenuItem to="/admin/marketplace" icon={Gavel} label={t('nav.case_management')} perm="legal.view" />
              <MenuItem to="/admin/cases/new" icon={Plus} label={t('nav.submit_case')} perm="legal.manage" />
              <MenuItem to="/admin/attorneys" icon={Scale} label={t('nav.attorney_network')} perm="legal.view" />
              <MenuItem to="/admin/attorneys/penalties" icon={AlertTriangle} label={t('nav.penalties')} perm="legal.manage" />
              <MenuItem to="/admin/revenue/splits" icon={DollarSign} label={t('nav.revenue_splits')} perm="legal.manage" />
            </MenuSection>

            <MenuItem to="/admin/lawsuits" icon={Scale} label={t('nav.lawsuits_filed')} perm="legal.view" />

            {/* ==================== MARKETING ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.marketing')}</span></div>
            
            <MenuSection title={t('nav.website')} icon={Globe} perm={["marketing.view", "marketing.manage"]} defaultOpen={false}>
              <MenuItem to="/admin/pages" icon={FileText} label={t('nav.pages')} perm="marketing.view" />
              <MenuItem to="/admin/blog" icon={MessageSquare} label={t('nav.blog')} perm="marketing.view" />
              <MenuItem to="/admin/faqs" icon={HelpCircle} label={t('nav.faqs')} perm="marketing.view" />
              <MenuItem to="/admin/press-releases" icon={Newspaper} label={t('nav.press_releases')} perm="marketing.view" />
              <MenuItem to="/admin/legal-pages" icon={FileText} label={t('nav.legal_pages')} perm="marketing.manage" />
              <MenuItem to="/admin/banners-popups" icon={Megaphone} label={t('nav.banners_popups')} perm="marketing.manage" />
              <MenuItem to="/admin/media" icon={Image} label={t('nav.media_library')} perm="marketing.view" />
            </MenuSection>

            <MenuSection title={t('nav.reviews_social')} icon={Star} perm={["reviews.view", "reviews.manage"]}>
              <MenuItem to="/admin/social-proof" icon={Star} label={t('nav.reviews')} perm="reviews.view" />
              <MenuItem to="/admin/review-approval" icon={CheckCircle2} label={t('nav.approvals')} perm="reviews.manage" />
              <MenuItem to="/admin/review-linking" icon={Link2} label={t('nav.reviews')} perm="reviews.manage" />
              <MenuItem to="/admin/review-categories" icon={FolderOpen} label={t('nav.categories')} perm="reviews.manage" />
            </MenuSection>

            {/* ==================== HR & PAYROLL ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.hr_payroll')}</span></div>
            
            <MenuItem to="/admin/team" icon={Users} label={t('nav.team_management')} perm="team.view" />
            <MenuItem to="/admin/authors" icon={UserCog} label={t('nav.authors_profiles')} perm="team.manage" />
            <MenuItem to="/admin/payroll" icon={Wallet} label={t('nav.payroll')} perm="payroll.view" />
            <MenuItem to="/admin/training" icon={GraduationCap} label={t('nav.training')} perm="training.view" />
            <MenuItem to="/admin/security" icon={Shield} label={t('nav.security')} perm="security.view" />

            {/* ==================== FINANCE ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.finance')}</span></div>
            
            <MenuItem to="/admin/billing" icon={CreditCard} label={t('nav.billing')} perm="billing.view" />

            {/* ==================== PARTNERS ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.partners')}</span></div>
            
            <MenuSection title={t('nav.affiliates_partners')} icon={Award} perm={["partners.view", "partners.manage"]}>
              <MenuItem to="/admin/partner-leads" icon={Users} label={t('nav.affiliate_leads')} perm="partners.view" />
              <MenuItem to="/admin/affiliates" icon={ExternalLink} label={t('nav.comparisons')} perm="partners.view" />
              <MenuItem to="/admin/partners" icon={Award} label={t('nav.credlocity_partners')} perm="partners.view" />
              <MenuItem to="/admin/partners/new" icon={Plus} label={t('nav.add_partner')} perm="partners.manage" />
            </MenuSection>

            {/* ==================== TOOLS ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.tools')}</span></div>
            
            <MenuSection title={t('nav.forms_calendars')} icon={ClipboardList} perm={["forms.view", "forms.manage"]}>
              <MenuItem to="/admin/intake-forms" icon={ClipboardList} label={t('nav.intake_forms')} perm="forms.view" />
              <MenuItem to="/admin/calendars" icon={Calendar} label={t('nav.calendars')} perm="forms.view" />
            </MenuSection>

            <MenuSection title={t('nav.chat_support')} icon={MessageCircle} perm={["chat.view", "chat.manage"]}>
              <MenuItem to="/admin/chat" icon={MessageCircle} label={t('nav.team_chat')} perm="chat.view" />
              <MenuItem to="/admin/support-chat" icon={Headphones} label={t('nav.customer_support')} perm="chat.manage" />
            </MenuSection>

            <MenuItem to="/admin/document-center" icon={BookOpen} label={t('nav.document_center')} />

            {/* ==================== ADMIN ==================== */}
            <div className="pt-3 pb-1"><span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('nav.admin')}</span></div>
            
            <MenuItem to="/admin/access-control" icon={Shield} label={t('nav.access_control')} perm="settings.manage" />
            <MenuSection title={t('nav.settings')} icon={Settings} perm={["settings.view", "settings.manage"]}>
              <MenuItem to="/admin/settings" icon={Settings} label={t('nav.site_settings')} perm="settings.view" />
              <MenuItem to="/admin/settings/lawsuits" icon={Scale} label={t('nav.lawsuit_config')} perm="settings.manage" />
              <MenuItem to="/admin/complaints" icon={AlertCircle} label={t('nav.complaints')} perm="settings.view" />
            </MenuSection>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-[calc(100vh-49px)]">
          <Routes>
            <Route index element={<SmartDashboard />} />
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

            {/* Access Control (RBAC) */}
            <Route path="access-control" element={<PermissionsManager />} />

            {/* Chat Systems Routes */}
            <Route path="chat" element={<InternalChat />} />
            <Route path="support-chat" element={<SupportChatDashboard />} />

            {/* Training & Policies Routes */}
            <Route path="training" element={<TrainingCenter />} />

            {/* Payroll Routes */}
            <Route path="payroll" element={<PayrollDashboard />} />

            {/* Document Center */}
            <Route path="document-center" element={<DocumentCenter />} />

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
            <Route path="collections/commission" element={<CollectionsCommissionSettings />} />
            <Route path="collections/commissions-dashboard" element={<CommissionDashboard />} />

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
      <CMSChatBubble />
    </div>
  );
};

export default Dashboard;
