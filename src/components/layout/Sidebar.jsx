import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Layers,
  FileCheck,
  BookOpen,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Wand2,
  CalendarRange,
  GitMerge,
  ChevronDown,
  Database,
  FilePen,
  FileText,
  BarChart2,
  Wallet,
  TrendingUp,
  Settings,
  SlidersHorizontal,
  ScrollText,
  Banknote,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

/* ─────────────── ADMIN NAV (unchanged) ─────────────── */
const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orgs", label: "Organizations", icon: Building2 },
  { to: "/admin/companies", label: "Companies", icon: Layers },
  { to: "/admin/entities", label: "Entities", icon: Layers },
  { to: "/admin/scopes", label: "Scopes", icon: ShieldCheck },
  {
    to: "/admin/users",
    label: "User Management",
    icon: Users,
    match: (p) =>
      ["/admin/users", "/admin/roles", "/admin/permissions", "/admin/memberships"].some(
        (base) => p === base || p.startsWith(base + "/")
      ),
  },
];

/* ─────────────── DASHBOARD ─────────────── */
const dashboardItem = { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, module: "DASHBOARD" };

/* ─────────────── SECTION 1: SETUP & CONFIGURATION ─────────────── */
const setupSubGroups = [
  {
    key: "org-structure",
    label: "Organization Structure",
    icon: Layers,
    scopeOnly: true,
    match: (p) => p.startsWith("/org-structure"),
    items: [
      { to: "/org-structure/orgs", label: "Orgs" },
      { to: "/org-structure/companies", label: "Companies" },
      { to: "/org-structure/entities", label: "Entities" },
    ],
  },
  {
    key: "access-control",
    label: "Access Control",
    icon: ShieldCheck,
    scopeOnly: true,
    match: (p) => p.startsWith("/user-management"),
    items: [
      { to: "/user-management/users", label: "Users" },
      { to: "/user-management/roles", label: "Roles" },
      { to: "/user-management/permissions", label: "Permissions" },
      { to: "/user-management/memberships", label: "Memberships" },
    ],
  },
  {
    key: "property-portfolio",
    label: "Property Portfolio",
    icon: Wand2,
    module: "PROPERTY",
    match: (p) => p.startsWith("/properties/setup"),
    items: [{ to: "/properties/setup", label: "Setup Wizard" }],
  },
  {
    key: "tenant-master",
    label: "Tenant Master",
    icon: Users,
    module: "TENANT",
    match: (p) => p.startsWith("/tenants"),
    items: [{ to: "/tenants", label: "Tenant Setup" }],
  },
];

/* ─────────────── SECTION 2: MASTER DATA & TEMPLATES ─────────────── */
const masterDataItems = [
  {
    key: "clauses",
    label: "Clause Library",
    icon: BookOpen,
    module: "DOCUMENTS",
    match: (p) => p.startsWith("/clauses"),
    items: [
      { to: "/clauses/clauses", label: "Clauses" },
      { to: "/clauses/categories", label: "Categories" },
      { to: "/clauses/versions", label: "Versions" },
      { to: "/clauses/documents", label: "Documents" },
      { to: "/clauses/usages", label: "Usages" },
    ],
  },
  {
    key: "escalation-templates",
    label: "Rent Escalation Templates",
    icon: TrendingUp,
    module: "LEASE",
    to: "/leases/escalation-templates",
    match: (p) => p.startsWith("/leases/escalation-templates"),
  },
  {
    key: "agreement-structures",
    label: "Agreement Structures",
    icon: FileText,
    module: "LEASE",
    to: "/leases/agreement-structures",
    match: (p) => p.startsWith("/leases/agreement-structures"),
  },
  {
    key: "billing-config",
    label: "Billing Configuration",
    icon: Settings,
    module: "AR",
    match: (p) =>
      [
        "/billing/rules",
        "/billing/credit-rules",
        "/billing/dispute-rules",
        "/billing/site-config",
        "/billing/ageing",
      ].some((base) => p === base || p.startsWith(base + "/")),
    items: [
      { to: "/billing/rules", label: "Billing Rules" },
      { to: "/billing/credit-rules", label: "Credit Rules" },
      { to: "/billing/dispute-rules", label: "Dispute Rules" },
      { to: "/billing/site-config", label: "Site Config" },
      { to: "/billing/ageing", label: "Ageing Buckets" },
    ],
  },
  {
    key: "approvals",
    label: "Approval Matrices",
    icon: GitMerge,
    module: "APPROVALS",
    to: "/approvals/rules",
    match: (p) => p.startsWith("/approvals"),
  },
];

/* ─────────────── SECTION 3: LEASE OPERATIONS ─────────────── */
const leaseOpsItems = [
  {
    key: "agreements",
    label: "Agreements",
    icon: FileCheck,
    module: "LEASE",
    to: "/leases/agreements",
    match: (p) => p.startsWith("/leases/agreements"),
  },
  {
    key: "amendments",
    label: "Amendments",
    icon: FilePen,
    module: "LEASE",
    to: "/leases/amendments",
    match: (p) => p.startsWith("/leases/amendments"),
  },
  {
    key: "lease-documents",
    label: "Lease Documents",
    icon: FileText,
    module: "LEASE",
    to: "/leases/documents",
    match: (p) => p.startsWith("/leases/documents"),
  },
];

/* ─────────────── SECTION 4: BILLING & COLLECTIONS ─────────────── */
const billingCollItems = [
  {
    key: "invoice-schedules",
    label: "Invoice Schedules",
    icon: CalendarRange,
    module: "AR",
    to: "/billing/schedules",
    match: (p) => p.startsWith("/billing/schedules"),
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: FileText,
    module: "AR",
    to: "/billing/invoices",
    match: (p) => p.startsWith("/billing/invoices"),
  },
  {
    key: "ar-overview",
    label: "AR Overview",
    icon: BarChart2,
    module: "AR",
    to: "/billing/ar-overview",
    match: (p) => p.startsWith("/billing/ar-overview"),
  },
  {
    key: "ar-settings",
    label: "AR Settings",
    icon: Settings,
    module: "AR",
    to: "/billing/ar-settings",
    match: (p) => p.startsWith("/billing/ar-settings"),
  },
  {
    key: "collections",
    label: "Collections",
    icon: Wallet,
    module: "AR",
    match: (p) => p.startsWith("/billing/collections"),
    items: [
      { to: "/billing/collections/payments", label: "Payments" },
      { to: "/billing/collections/credit-notes", label: "Credit Notes" },
    ],
  },
];

/* ─────────────── SECTION 5: REPORTING & ANALYTICS ─────────────── */
const reportingItems = [
  {
    key: "financial-reporting",
    label: "Financial Reporting",
    icon: CalendarRange,
    module: "REVENUE",
    match: (p) =>
      p.startsWith("/rent-schedule-revenue") && !p.startsWith("/rent-schedule-revenue/invoice"),
    items: [
      { to: "/rent-schedule-revenue/rent-schedules", label: "Rent Schedules" },
      { to: "/rent-schedule-revenue/receivables", label: "Receivables Analysis" },
      { to: "/rent-schedule-revenue/revenue-recognition", label: "Revenue Recognition" },
    ],
  },
];

/* ─────────────── OPERATIONAL NAV ─────────────── */
const operationalNav = [
  {
    to: "/properties",
    label: "Properties",
    icon: Building2,
    match: (p) => p.startsWith("/properties") && !p.startsWith("/properties/setup"),
    module: "PROPERTY",
  },
];

/* ─────────────── ANIMATED COLLAPSE (defined outside to avoid remount) ─────────────── */
function Collapse({ isOpen, children }) {
  return (
    <div
      className={`grid transition-all duration-200 ease-in-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

/* ─────────────── SECTION HEADER (defined outside to avoid remount) ─────────────── */
function SectionHeader({ icon: Icon, label, isActive, isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group ${
        isActive
          ? "text-emerald-700"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors duration-150 ${
            isActive ? "bg-emerald-100" : "bg-gray-100 group-hover:bg-gray-200"
          }`}
        >
          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">{label}</span>
      </div>
      <ChevronDown
        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
          isOpen ? "rotate-0" : "-rotate-90"
        }`}
      />
    </button>
  );
}

/* ─────────────── COMPONENT ─────────────── */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Section open/close states
  const [setupOpen, setSetupOpen] = useState(true);
  const [masterDataOpen, setMasterDataOpen] = useState(true);
  const [leaseOpsOpen, setLeaseOpsOpen] = useState(true);
  const [billingCollOpen, setBillingCollOpen] = useState(true);
  const [reportingOpen, setReportingOpen] = useState(true);

  // Sub-group open states per section
  const [setupSubOpen, setSetupSubOpen] = useState({
    "org-structure": true,
    "access-control": true,
    "property-portfolio": true,
    "tenant-master": true,
  });
  const [masterSubOpen, setMasterSubOpen] = useState({
    clauses: true,
    "billing-config": true,
  });
  const [billingCollSubOpen, setBillingCollSubOpen] = useState({
    collections: true,
  });
  const [reportingSubOpen, setReportingSubOpen] = useState({
    "financial-reporting": true,
  });

  const { user, logout, availableScopes, activeModulePermissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.is_superuser === true;
  const hasScopeAccess = (availableScopes?.length ?? 0) > 0;

  const canView = (module) => {
    if (isAdmin || !module) return true;
    const perms = activeModulePermissions || {};
    if (Object.keys(perms).length === 0) return true;
    return perms[module]?.can_view === true;
  };

  // Filtered visible items per section
  const visibleSetupGroups = setupSubGroups.filter((sg) => {
    if (sg.scopeOnly && !hasScopeAccess) return false;
    if (sg.module && !canView(sg.module)) return false;
    return true;
  });
  const visibleMasterItems = masterDataItems.filter((i) => canView(i.module));
  const visibleLeaseOps    = leaseOpsItems.filter((i) => canView(i.module));
  const visibleBillingColl = billingCollItems.filter((i) => canView(i.module));
  const visibleReporting   = reportingItems.filter((i) => canView(i.module));
  const visibleOperational = operationalNav.filter((i) => canView(i.module));

  // Active flags per section
  const isSetupActive       = visibleSetupGroups.some((sg) => sg.match(location.pathname));
  const isMasterActive      = visibleMasterItems.some((i) => i.match(location.pathname));
  const isLeaseOpsActive    = visibleLeaseOps.some((i) => i.match(location.pathname));
  const isBillingCollActive = visibleBillingColl.some((i) => i.match(location.pathname));
  const isReportingActive   = visibleReporting.some((i) => i.match(location.pathname));

  // Auto-expand the right section + sub-group when navigating directly to a route
  useEffect(() => {
    const p = location.pathname;
    if (isSetupActive) {
      setSetupOpen(true);
      visibleSetupGroups.forEach((sg) => {
        if (sg.match(p)) setSetupSubOpen((prev) => ({ ...prev, [sg.key]: true }));
      });
    }
    if (isMasterActive) {
      setMasterDataOpen(true);
      visibleMasterItems.forEach((item) => {
        if (item.items && item.match(p))
          setMasterSubOpen((prev) => ({ ...prev, [item.key]: true }));
      });
    }
    if (isBillingCollActive) {
      setBillingCollOpen(true);
      visibleBillingColl.forEach((item) => {
        if (item.items && item.match(p))
          setBillingCollSubOpen((prev) => ({ ...prev, [item.key]: true }));
      });
    }
    if (isReportingActive) setReportingOpen(true);
    if (isLeaseOpsActive) setLeaseOpsOpen(true);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSetupSub       = (key) => setSetupSubOpen((p) => ({ ...p, [key]: !p[key] }));
  const toggleMasterSub      = (key) => setMasterSubOpen((p) => ({ ...p, [key]: !p[key] }));
  const toggleBillingCollSub = (key) => setBillingCollSubOpen((p) => ({ ...p, [key]: !p[key] }));
  const toggleReportingSub   = (key) => setReportingSubOpen((p) => ({ ...p, [key]: !p[key] }));

  const handleLogout = () => { logout(); navigate("/login"); };

  /* ── Top-level nav items (Dashboard + Properties) ── */
  const navLinkClass = (highlighted) =>
    `flex items-center gap-3 rounded-lg text-[15px] font-medium transition-all duration-150 ${
      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
    } ${
      highlighted
        ? collapsed
          ? "bg-emerald-50 text-emerald-700"
          : "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 -ml-[2px] pl-[14px]"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  /* ── Leaf item inside a tree list ── */
  const leafClass = (isActive) =>
    `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-150 ${
      isActive
        ? "text-emerald-700 font-medium"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
    }`;

  /* ── Tree-line leaf list with colored line when any child is active ── */
  const renderLeafItems = (items) => {
    const anyActive = items.some(
      ({ to }) => location.pathname === to || location.pathname.startsWith(to + "/")
    );
    return (
      <ul
        className={`ml-5 border-l-2 pl-3 mt-0.5 mb-1 space-y-0.5 transition-colors duration-200 ${
          anyActive ? "border-emerald-300" : "border-gray-200"
        }`}
      >
        {items.map(({ to, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <NavLink to={to} className={() => leafClass(active)}>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${
                    active ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                />
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    );
  };

  /* ── Sub-group item button class (direct link or collapsible header) ── */
  const subItemClass = (isActive) =>
    `w-full flex items-center justify-between pl-2.5 pr-2 py-2 rounded-lg text-[15px] font-medium transition-all duration-150 border-l-2 cursor-pointer ${
      isActive
        ? "bg-emerald-50/70 text-emerald-700 border-emerald-500"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent"
    }`;

  /* ── Renders a mixed section: direct links or collapsible sub-groups ── */
  const renderMixedSection = (items, subOpenState, toggleFn) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = item.match(location.pathname);

      if (item.to) {
        // Direct link — no chevron
        return (
          <NavLink key={item.key} to={item.to} className={() => subItemClass(isActive)}>
            <div className="flex items-center gap-2.5">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                  isActive ? "text-emerald-500" : "text-gray-400"
                }`}
              />
              <span>{item.label}</span>
            </div>
          </NavLink>
        );
      }

      // Collapsible sub-group
      const isOpen = subOpenState[item.key];
      return (
        <div key={item.key}>
          <button type="button" onClick={() => toggleFn(item.key)} className={subItemClass(isActive)}>
            <div className="flex items-center gap-2.5">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                  isActive ? "text-emerald-500" : "text-gray-400"
                }`}
              />
              <span>{item.label}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
          <Collapse isOpen={isOpen}>
            {renderLeafItems(item.items)}
          </Collapse>
        </div>
      );
    });

  /* ── Collapsed-mode: icon-only strip for a section ── */
  const renderCollapsedIcons = (items) => (
    <ul className="space-y-0.5 pt-1 border-t border-gray-100">
      {items.map((item) => {
        const Icon = item.icon;
        const dest = item.to ?? item.items?.[0]?.to;
        return (
          <li key={item.key}>
            <NavLink
              to={dest}
              title={item.label}
              className={() => navLinkClass(item.match(location.pathname))}
            >
              <Icon className="w-5 h-5 shrink-0" />
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      {/* ── Brand ── */}
      <div
        className={`border-b border-gray-100 flex items-center gap-2 min-h-[4.5rem] ${
          collapsed ? "flex-col justify-center p-2" : "justify-between p-3"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-gray-800 text-lg truncate">PropFolio</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {isAdmin ? (
          /* ── Admin navigation (unchanged) ── */
          <ul className="space-y-0.5">
            {adminNav.map(({ to, label, icon: Icon, end, match }) => {
              const active = match ? match(location.pathname) : undefined;
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end !== undefined ? end : to === "/"}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) => navLinkClass(active !== undefined ? active : isActive)}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        ) : (
          /* ── Tenant navigation ── */
          <div className="space-y-0.5">

            {/* ── 1. Dashboard ── */}
            {canView(dashboardItem.module) && (
              <NavLink
                to={dashboardItem.to}
                end
                title={collapsed ? dashboardItem.label : undefined}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{dashboardItem.label}</span>}
              </NavLink>
            )}

            {/* ── 2. SETUP & CONFIGURATION ── */}
            {visibleSetupGroups.length > 0 && (
              <div className="pt-1">
                {collapsed ? (
                  renderCollapsedIcons(visibleSetupGroups.map((sg) => ({ ...sg, to: sg.items[0].to })))
                ) : (
                  <div className="pt-2 border-t border-gray-100">
                    <SectionHeader
                      icon={SlidersHorizontal}
                      label="Setup & Configuration"
                      isActive={isSetupActive}
                      isOpen={setupOpen}
                      onToggle={() => setSetupOpen((o) => !o)}
                    />
                    <Collapse isOpen={setupOpen}>
                      <div className="mt-1 space-y-0.5 pb-1">
                        {visibleSetupGroups.map((sg) => {
                          const Icon = sg.icon;
                          const isSubActive = sg.match(location.pathname);
                          const isOpen = setupSubOpen[sg.key];
                          return (
                            <div key={sg.key}>
                              <button
                                type="button"
                                onClick={() => toggleSetupSub(sg.key)}
                                className={subItemClass(isSubActive)}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon
                                    className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                                      isSubActive ? "text-emerald-500" : "text-gray-400"
                                    }`}
                                  />
                                  <span>{sg.label}</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${
                                    isOpen ? "rotate-0" : "-rotate-90"
                                  }`}
                                />
                              </button>
                              <Collapse isOpen={isOpen}>
                                {renderLeafItems(sg.items)}
                              </Collapse>
                            </div>
                          );
                        })}
                      </div>
                    </Collapse>
                  </div>
                )}
              </div>
            )}

            {/* ── 3. MASTER DATA & TEMPLATES ── */}
            {visibleMasterItems.length > 0 && (
              <div className="pt-1">
                {collapsed ? (
                  renderCollapsedIcons(visibleMasterItems)
                ) : (
                  <div className="pt-2 border-t border-gray-100">
                    <SectionHeader
                      icon={Database}
                      label="Master Data & Templates"
                      isActive={isMasterActive}
                      isOpen={masterDataOpen}
                      onToggle={() => setMasterDataOpen((o) => !o)}
                    />
                    <Collapse isOpen={masterDataOpen}>
                      <div className="mt-1 space-y-0.5 pb-1">
                        {renderMixedSection(visibleMasterItems, masterSubOpen, toggleMasterSub)}
                      </div>
                    </Collapse>
                  </div>
                )}
              </div>
            )}

            {/* ── 4. LEASE OPERATIONS ── */}
            {visibleLeaseOps.length > 0 && (
              <div className="pt-1">
                {collapsed ? (
                  renderCollapsedIcons(visibleLeaseOps)
                ) : (
                  <div className="pt-2 border-t border-gray-100">
                    <SectionHeader
                      icon={ScrollText}
                      label="Lease Operations"
                      isActive={isLeaseOpsActive}
                      isOpen={leaseOpsOpen}
                      onToggle={() => setLeaseOpsOpen((o) => !o)}
                    />
                    <Collapse isOpen={leaseOpsOpen}>
                      <div className="mt-1 space-y-0.5 pb-1">
                        {renderMixedSection(visibleLeaseOps, {}, () => {})}
                      </div>
                    </Collapse>
                  </div>
                )}
              </div>
            )}

            {/* ── 5. BILLING & COLLECTIONS ── */}
            {visibleBillingColl.length > 0 && (
              <div className="pt-1">
                {collapsed ? (
                  renderCollapsedIcons(visibleBillingColl)
                ) : (
                  <div className="pt-2 border-t border-gray-100">
                    <SectionHeader
                      icon={Banknote}
                      label="Billing & Collections"
                      isActive={isBillingCollActive}
                      isOpen={billingCollOpen}
                      onToggle={() => setBillingCollOpen((o) => !o)}
                    />
                    <Collapse isOpen={billingCollOpen}>
                      <div className="mt-1 space-y-0.5 pb-1">
                        {renderMixedSection(visibleBillingColl, billingCollSubOpen, toggleBillingCollSub)}
                      </div>
                    </Collapse>
                  </div>
                )}
              </div>
            )}

            {/* ── 6. REPORTING & ANALYTICS ── */}
            {visibleReporting.length > 0 && (
              <div className="pt-1">
                {collapsed ? (
                  renderCollapsedIcons(visibleReporting)
                ) : (
                  <div className="pt-2 border-t border-gray-100">
                    <SectionHeader
                      icon={BarChart3}
                      label="Reporting & Analytics"
                      isActive={isReportingActive}
                      isOpen={reportingOpen}
                      onToggle={() => setReportingOpen((o) => !o)}
                    />
                    <Collapse isOpen={reportingOpen}>
                      <div className="mt-1 space-y-0.5 pb-1">
                        {renderMixedSection(visibleReporting, reportingSubOpen, toggleReportingSub)}
                      </div>
                    </Collapse>
                  </div>
                )}
              </div>
            )}

            {/* ── 7. OPERATIONAL NAV (Properties) ── */}
            {visibleOperational.length > 0 && (
              <div className="pt-2 mt-1 border-t border-gray-100">
                <ul className="space-y-0.5">
                  {visibleOperational.map(({ to, label, icon: Icon, end, match }) => {
                    const active = match ? match(location.pathname) : undefined;
                    return (
                      <li key={to}>
                        <NavLink
                          to={to}
                          end={end !== undefined ? end : to === "/"}
                          title={collapsed ? label : undefined}
                          className={({ isActive }) => navLinkClass(active !== undefined ? active : isActive)}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          {!collapsed && <span>{label}</span>}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          </div>
        )}
      </nav>

      {/* ── User / Logout ── */}
      <div
        className={`p-3 border-t border-gray-100 mt-auto ${collapsed ? "flex flex-col items-center" : ""}`}
      >
        {!collapsed && user?.email && (
          <p className="text-xs text-gray-500 truncate px-2 mb-2 w-full" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className={`flex items-center gap-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer ${
            collapsed ? "justify-center p-2 w-full" : "px-3 py-2 w-full"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
