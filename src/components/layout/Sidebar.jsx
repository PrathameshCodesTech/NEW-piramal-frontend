import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Layers,
  FileCheck,
  Receipt,
  BookOpen,
  Users,
  UserCog,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Wand2,
  CalendarRange,
  GitMerge,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orgs", label: "Organizations", icon: Building2 },
  { to: "/admin/companies", label: "Companies", icon: Layers },
  { to: "/admin/entities", label: "Entities", icon: Layers },
  { to: "/admin/scopes", label: "Scopes", icon: ShieldCheck },
  { to: "/admin/users", label: "User Management", icon: Users, match: (p) => ["/admin/users", "/admin/roles", "/admin/permissions", "/admin/memberships"].some((base) => p === base || p.startsWith(base + "/")) },
];

const tenantNavBase = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, module: "DASHBOARD" },
  { to: "/properties", label: "Properties", icon: Building2, match: (p) => p.startsWith("/properties") && !p.startsWith("/properties/setup"), module: "PROPERTY" },
  { to: "/properties/setup", label: "Setup Wizard", icon: Wand2, module: "PROPERTY" },
  { to: "/tenants", label: "Tenant Setup", icon: Users, module: "TENANT" },
  { to: "/leases", label: "Lease Management", icon: FileCheck, module: "LEASE" },
  { to: "/billing", label: "Billing & AR", icon: Receipt, module: "AR" },
  { to: "/rent-schedule-revenue", label: "Rent Schedule & Revenue Recognition", icon: CalendarRange, match: (p) => p.startsWith("/rent-schedule-revenue"), module: "REVENUE" },
  { to: "/clauses", label: "Clause Library", icon: BookOpen, module: "DOCUMENTS" },
  { to: "/approvals/rules", label: "Approval Matrices", icon: GitMerge, match: (p) => p.startsWith("/approvals"), module: "APPROVALS" },
];

const tenantNavOrgStructure = { to: "/org-structure/orgs", label: "Org Structure", icon: Layers, match: (p) => ["/org-structure"].some((base) => p === base || p.startsWith(base + "/")) };
const tenantNavUserMgmt = { to: "/user-management/users", label: "User Management", icon: UserCog, match: (p) => ["/user-management"].some((base) => p === base || p.startsWith(base + "/")) };

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, availableScopes, activeModulePermissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.is_superuser === true;
  const hasScopeAccess = (availableScopes?.length ?? 0) > 0;

  // Returns true if the user can view this module.
  // Superusers always see everything. If no module permissions defined (empty role),
  // show all items. If permissions are defined, check can_view.
  const canView = (module) => {
    if (isAdmin || !module) return true;
    const perms = activeModulePermissions || {};
    if (Object.keys(perms).length === 0) return true; // role has no module perms = no restriction
    return perms[module]?.can_view === true;
  };

  const tenantNav = [
    ...tenantNavBase,
    ...(hasScopeAccess ? [tenantNavOrgStructure, tenantNavUserMgmt] : []),
  ].filter((item) => canView(item.module));

  const navItems = isAdmin ? adminNav : tenantNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      {/* Brand */}
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
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end, match }) => {
            const active = match ? match(location.pathname) : undefined;
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end !== undefined ? end : to === "/"}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => {
                    const highlighted = active !== undefined ? active : isActive;
                    return `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                    } ${
                      highlighted
                        ? collapsed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 -ml-[2px] pl-[14px]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`;
                  }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className={`p-3 border-t border-gray-100 mt-auto ${collapsed ? "flex flex-col items-center" : ""}`}>
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
