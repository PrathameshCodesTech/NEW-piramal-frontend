import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrgListPage from "./pages/admin/orgs/OrgListPage";
import OrgCreatePage from "./pages/admin/orgs/OrgCreatePage";
import OrgEditPage from "./pages/admin/orgs/OrgEditPage";
import OrgViewPage from "./pages/admin/orgs/OrgViewPage";
import CompanyListPage from "./pages/admin/companies/CompanyListPage";
import CompanyCreatePage from "./pages/admin/companies/CompanyCreatePage";
import CompanyEditPage from "./pages/admin/companies/CompanyEditPage";
import CompanyViewPage from "./pages/admin/companies/CompanyViewPage";
import EntityListPage from "./pages/admin/entities/EntityListPage";
import EntityCreatePage from "./pages/admin/entities/EntityCreatePage";
import EntityEditPage from "./pages/admin/entities/EntityEditPage";
import EntityViewPage from "./pages/admin/entities/EntityViewPage";
import ScopeListPage from "./pages/admin/scopes/ScopeListPage";
import ScopeCreatePage from "./pages/admin/scopes/ScopeCreatePage";
import ScopeViewPage from "./pages/admin/scopes/ScopeViewPage";
import UserListPage from "./pages/admin/users/UserListPage";
import UserCreatePage from "./pages/admin/users/UserCreatePage";
import UserViewPage from "./pages/admin/users/UserViewPage";
import RoleListPage from "./pages/admin/roles/RoleListPage";
import RoleCreatePage from "./pages/admin/roles/RoleCreatePage";
import RoleViewPage from "./pages/admin/roles/RoleViewPage";
import MembershipListPage from "./pages/admin/memberships/MembershipListPage";
import MembershipCreatePage from "./pages/admin/memberships/MembershipCreatePage";

// Property pages
import PropertySetupPage from "./pages/properties/PropertySetupPage";
import SiteViewPage from "./pages/properties/sites/SiteViewPage";
import SiteCreatePage from "./pages/properties/sites/SiteCreatePage";
import SiteEditPage from "./pages/properties/sites/SiteEditPage";
import TowerCreatePage from "./pages/properties/towers/TowerCreatePage";
import TowerEditPage from "./pages/properties/towers/TowerEditPage";
import FloorCreatePage from "./pages/properties/floors/FloorCreatePage";
import FloorEditPage from "./pages/properties/floors/FloorEditPage";
import UnitCreatePage from "./pages/properties/units/UnitCreatePage";
import UnitEditPage from "./pages/properties/units/UnitEditPage";
import PropertySetupWizard from "./pages/properties/wizard/PropertySetupWizard";

// Tenant pages
import TenantListPage from "./pages/tenants/TenantListPage";
import TenantCreatePage from "./pages/tenants/TenantCreatePage";
import TenantViewPage from "./pages/tenants/TenantViewPage";
import TenantEditPage from "./pages/tenants/TenantEditPage";

// Clause pages
import ClauseLayout from "./pages/clauses/ClauseLayout";
import ClausesListWithCreateModal from "./pages/clauses/clauses/ClausesListWithCreateModal";
import ClauseViewPage from "./pages/clauses/clauses/ClauseViewPage";
import ClauseEditPage from "./pages/clauses/clauses/ClauseEditPage";
import ClauseCategoriesListWithCreateModal from "./pages/clauses/categories/ClauseCategoriesListWithCreateModal";
import ClauseCategoryViewPage from "./pages/clauses/categories/ClauseCategoryViewPage";
import ClauseCategoryEditPage from "./pages/clauses/categories/ClauseCategoryEditPage";
import ClauseVersionsListPage from "./pages/clauses/versions/ClauseVersionsListPage";
import ClauseDocumentsListWithCreateModal from "./pages/clauses/documents/ClauseDocumentsListWithCreateModal";
import ClauseDocumentViewPage from "./pages/clauses/documents/ClauseDocumentViewPage";
import ClauseUsagesListWithCreateModal from "./pages/clauses/usages/ClauseUsagesListWithCreateModal";

// Lease pages
import LeaseLayout from "./pages/leases/LeaseLayout";
import AgreementsListPage from "./pages/leases/agreements/AgreementsListPage";
import AgreementCreatePage from "./pages/leases/agreements/AgreementCreatePage";
import AgreementViewPage from "./pages/leases/agreements/AgreementViewPage";
import EscalationTemplatesListPage from "./pages/leases/escalation-templates/EscalationTemplatesListPage";
import EscalationTemplateCreatePage from "./pages/leases/escalation-templates/EscalationTemplateCreatePage";
import EscalationTemplateViewPage from "./pages/leases/escalation-templates/EscalationTemplateViewPage";
import EscalationTemplateEditPage from "./pages/leases/escalation-templates/EscalationTemplateEditPage";
import AmendmentsListPage from "./pages/leases/amendments/AmendmentsListPage";
import AmendmentCreatePage from "./pages/leases/amendments/AmendmentCreatePage";
import AmendmentViewPage from "./pages/leases/amendments/AmendmentViewPage";
import LeaseDocumentsListPage from "./pages/leases/documents/LeaseDocumentsListPage";
import LeaseDocumentCreatePage from "./pages/leases/documents/LeaseDocumentCreatePage";
import LeaseDocumentViewPage from "./pages/leases/documents/LeaseDocumentViewPage";

// Billing pages
import BillingLayout from "./pages/billing/BillingLayout";
import BillingPlaceholderPage from "./pages/billing/BillingPlaceholderPage";
import SiteConfigListPage from "./pages/billing/site-config/SiteConfigListPage";
import SiteConfigViewPage from "./pages/billing/site-config/SiteConfigViewPage";
import BillingRulesListWithCreateModal from "./pages/billing/rules/BillingRulesListWithCreateModal";
import BillingRuleViewPage from "./pages/billing/rules/BillingRuleViewPage";
import InvoiceSchedulesListWithCreateModal from "./pages/billing/schedules/InvoiceSchedulesListWithCreateModal";
import InvoiceScheduleViewPage from "./pages/billing/schedules/InvoiceScheduleViewPage";
import InvoicesListWithCreateModal from "./pages/billing/invoices/InvoicesListWithCreateModal";
import InvoiceViewPage from "./pages/billing/invoices/InvoiceViewPage";
import PaymentsListWithCreateModal from "./pages/billing/collections/PaymentsListWithCreateModal";
import CreditNotesListWithCreateModal from "./pages/billing/collections/CreditNotesListWithCreateModal";
import AROverviewPage from "./pages/billing/ar-overview/AROverviewPage";
import DisputeRulesListWithCreateModal from "./pages/billing/dispute-rules/DisputeRulesListWithCreateModal";
import CreditRulesListWithCreateModal from "./pages/billing/credit-rules/CreditRulesListWithCreateModal";
import AgeingSetupPage from "./pages/billing/ageing/AgeingSetupPage";
import ARSettingsPage from "./pages/billing/ar-settings/ARSettingsPage";
import LeaseARRulesPage from "./pages/billing/lease-rules/LeaseARRulesPage";

// Dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Tenant routes */}
        <Route index element={<DashboardPage />} />

        {/* Tenant routes */}
        <Route path="tenants" element={<TenantListPage />} />
        <Route path="tenants/create" element={<TenantCreatePage />} />
        <Route path="tenants/:id" element={<TenantViewPage />} />
        <Route path="tenants/:id/edit" element={<TenantEditPage />} />

        {/* Clause routes */}
        <Route path="clauses" element={<ClauseLayout />}>
          <Route index element={<Navigate to="/clauses/clauses" replace />} />
          <Route path="clauses" element={<ClausesListWithCreateModal />} />
          <Route path="clauses/create" element={<ClausesListWithCreateModal />} />
          <Route path="clauses/:id" element={<ClauseViewPage />} />
          <Route path="clauses/:id/edit" element={<ClauseEditPage />} />
          <Route path="categories" element={<ClauseCategoriesListWithCreateModal />} />
          <Route path="categories/create" element={<ClauseCategoriesListWithCreateModal />} />
          <Route path="categories/:id" element={<ClauseCategoryViewPage />} />
          <Route path="categories/:id/edit" element={<ClauseCategoryEditPage />} />
          <Route path="versions" element={<ClauseVersionsListPage />} />
          <Route path="documents" element={<ClauseDocumentsListWithCreateModal />} />
          <Route path="documents/upload" element={<ClauseDocumentsListWithCreateModal />} />
          <Route path="documents/:id" element={<ClauseDocumentViewPage />} />
          <Route path="usages" element={<ClauseUsagesListWithCreateModal />} />
          <Route path="usages/create" element={<ClauseUsagesListWithCreateModal />} />
        </Route>

        {/* Lease routes */}
        <Route path="leases" element={<LeaseLayout />}>
          <Route index element={<Navigate to="/leases/agreements" replace />} />
          <Route path="agreements" element={<AgreementsListPage />} />
          <Route path="agreements/create" element={<AgreementCreatePage />} />
          <Route path="agreements/:id" element={<AgreementViewPage />} />
          <Route path="escalation-templates" element={<EscalationTemplatesListPage />} />
          <Route path="escalation-templates/create" element={<EscalationTemplateCreatePage />} />
          <Route path="escalation-templates/:id" element={<EscalationTemplateViewPage />} />
          <Route path="escalation-templates/:id/edit" element={<EscalationTemplateEditPage />} />
          <Route path="amendments" element={<AmendmentsListPage />} />
          <Route path="amendments/create" element={<AmendmentCreatePage />} />
          <Route path="amendments/:id" element={<AmendmentViewPage />} />
          <Route path="documents" element={<LeaseDocumentsListPage />} />
          <Route path="documents/create" element={<LeaseDocumentCreatePage />} />
          <Route path="documents/:id" element={<LeaseDocumentViewPage />} />
        </Route>

        {/* Billing routes */}
        <Route path="billing" element={<BillingLayout />}>
          <Route index element={<Navigate to="/billing/site-config" replace />} />
          <Route path="site-config" element={<SiteConfigListPage />} />
          <Route path="site-config/:siteId" element={<SiteConfigViewPage />} />
          <Route path="site-config/:siteId/edit" element={<BillingPlaceholderPage title="Edit Site Config" />} />
          <Route path="rules" element={<BillingRulesListWithCreateModal />} />
          <Route path="rules/create" element={<BillingRulesListWithCreateModal />} />
          <Route path="rules/:id" element={<BillingRuleViewPage />} />
          <Route path="rules/:id/edit" element={<BillingPlaceholderPage title="Edit Billing Rule" />} />
          <Route path="schedules" element={<InvoiceSchedulesListWithCreateModal />} />
          <Route path="schedules/create" element={<InvoiceSchedulesListWithCreateModal />} />
          <Route path="schedules/:id" element={<InvoiceScheduleViewPage />} />
          <Route path="invoices" element={<InvoicesListWithCreateModal />} />
          <Route path="invoices/create" element={<InvoicesListWithCreateModal />} />
          <Route path="invoices/:id" element={<InvoiceViewPage />} />
          <Route path="invoices/:id/edit" element={<BillingPlaceholderPage title="Edit Invoice" />} />
          <Route path="ar-overview" element={<AROverviewPage />} />
          <Route path="collections/payments" element={<PaymentsListWithCreateModal />} />
          <Route path="collections/payments/create" element={<PaymentsListWithCreateModal />} />
          <Route path="collections/payments/:id" element={<BillingPlaceholderPage title="Payment" />} />
          <Route path="collections/credit-notes" element={<CreditNotesListWithCreateModal />} />
          <Route path="collections/credit-notes/create" element={<CreditNotesListWithCreateModal />} />
          <Route path="collections/credit-notes/:id" element={<BillingPlaceholderPage title="Credit Note" />} />
          <Route path="dispute-rules" element={<DisputeRulesListWithCreateModal />} />
          <Route path="dispute-rules/create" element={<DisputeRulesListWithCreateModal />} />
          <Route path="dispute-rules/:id" element={<BillingPlaceholderPage title="Dispute Rule" />} />
          <Route path="credit-rules" element={<CreditRulesListWithCreateModal />} />
          <Route path="credit-rules/create" element={<CreditRulesListWithCreateModal />} />
          <Route path="credit-rules/:id" element={<BillingPlaceholderPage title="Credit Rule" />} />
          <Route path="ageing" element={<AgeingSetupPage />} />
          <Route path="ageing/config" element={<BillingPlaceholderPage title="Ageing Config" />} />
          <Route path="ar-settings" element={<ARSettingsPage />} />
          <Route path="lease-rules" element={<LeaseARRulesPage />} />
          <Route path="lease-rules/:agreementId/edit" element={<BillingPlaceholderPage title="Edit Lease AR Rules" />} />
        </Route>

        {/* Property routes */}
        <Route path="properties" element={<PropertySetupPage />} />
        <Route path="properties/sites/create" element={<SiteCreatePage />} />
        <Route path="properties/sites/:id" element={<SiteViewPage />} />
        <Route path="properties/sites/:id/edit" element={<SiteEditPage />} />
        <Route path="properties/towers/create" element={<TowerCreatePage />} />
        <Route path="properties/towers/:id/edit" element={<TowerEditPage />} />
        <Route path="properties/floors/create" element={<FloorCreatePage />} />
        <Route path="properties/floors/:id/edit" element={<FloorEditPage />} />
        <Route path="properties/units/create" element={<UnitCreatePage />} />
        <Route path="properties/units/:id/edit" element={<UnitEditPage />} />
        <Route path="properties/setup" element={<PropertySetupWizard />} />

        {/* Admin routes */}
        <Route path="admin" element={<AdminDashboard />} />

        <Route path="admin/orgs" element={<OrgListPage />} />
        <Route path="admin/orgs/create" element={<OrgCreatePage />} />
        <Route path="admin/orgs/:id" element={<OrgViewPage />} />
        <Route path="admin/orgs/:id/edit" element={<OrgEditPage />} />

        <Route path="admin/companies" element={<CompanyListPage />} />
        <Route path="admin/companies/create" element={<CompanyCreatePage />} />
        <Route path="admin/companies/:id" element={<CompanyViewPage />} />
        <Route path="admin/companies/:id/edit" element={<CompanyEditPage />} />

        <Route path="admin/entities" element={<EntityListPage />} />
        <Route path="admin/entities/create" element={<EntityCreatePage />} />
        <Route path="admin/entities/:id" element={<EntityViewPage />} />
        <Route path="admin/entities/:id/edit" element={<EntityEditPage />} />

        <Route path="admin/scopes" element={<ScopeListPage />} />
        <Route path="admin/scopes/create" element={<ScopeCreatePage />} />
        <Route path="admin/scopes/:id" element={<ScopeViewPage />} />

        <Route path="admin/users" element={<UserListPage />} />
        <Route path="admin/users/create" element={<UserCreatePage />} />
        <Route path="admin/users/:id" element={<UserViewPage />} />

        <Route path="admin/roles" element={<RoleListPage />} />
        <Route path="admin/roles/create" element={<RoleCreatePage />} />
        <Route path="admin/roles/:id" element={<RoleViewPage />} />

        <Route path="admin/memberships" element={<MembershipListPage />} />
        <Route path="admin/memberships/create" element={<MembershipCreatePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
