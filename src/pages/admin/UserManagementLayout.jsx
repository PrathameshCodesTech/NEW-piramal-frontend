import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Users, ShieldCheck, Key, Link2, PanelTopClose, PanelTopOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { usersAPI, rolesAPI, permissionsAPI, membershipsAPI } from "../../services/api";
import { UserManagementContext } from "../../contexts/UserManagementContext";

function getBasePath(path) {
  return path.startsWith("/user-management") ? "/user-management" : "/admin";
}

function getActiveTab(path, basePath) {
  if (path.startsWith(`${basePath}/roles`) || path.startsWith(`${basePath}/permissions`)) return "roles";
  if (path.startsWith(`${basePath}/memberships`)) return "memberships";
  return "users";
}

const getNav = (basePath) => ({
  users: [{ to: `${basePath}/users`, label: "All Users", icon: Users }],
  roles: [
    { to: `${basePath}/roles`, label: "Roles", icon: ShieldCheck },
    { to: `${basePath}/permissions`, label: "Permissions", icon: Key },
  ],
  memberships: [{ to: `${basePath}/memberships`, label: "All Memberships", icon: Link2 }],
});

export default function UserManagementLayout() {
  const location = useLocation();
  const path = location.pathname;
  const basePath = getBasePath(path);
  const nav = getNav(basePath);
  const [stats, setStats] = useState(null);
  const [subNavOpen, setSubNavOpen] = useState(true);
  const activeTab = getActiveTab(path, basePath);
  const navItems =
    activeTab === "roles" ? nav.roles : activeTab === "memberships" ? nav.memberships : nav.users;

  useEffect(() => {
    Promise.all([
      usersAPI.list().catch(() => []),
      rolesAPI.list().catch(() => []),
      permissionsAPI.list().catch(() => []),
      membershipsAPI.list().catch(() => []),
    ]).then(([users, roles, perms, memberships]) => {
      const toCount = (x) =>
        Array.isArray(x) ? x.length : x?.count || (x?.results || []).length || 0;
      setStats({
        users: toCount(users),
        roles: toCount(roles),
        permissions: toCount(perms),
        memberships: toCount(memberships),
      });
    }).catch(() => setStats(null));
  }, [path]);

  return (
    <UserManagementContext.Provider value={basePath}>
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Manage users, roles, permissions and access control</p>
      </div>

      {/* Stats Widgets */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Users", value: stats.users, icon: Users, bg: "bg-emerald-50", text: "text-emerald-600" },
            { label: "Roles", value: stats.roles, icon: ShieldCheck, bg: "bg-blue-50", text: "text-blue-600" },
            { label: "Permissions", value: stats.permissions, icon: Key, bg: "bg-amber-50", text: "text-amber-600" },
            { label: "Memberships", value: stats.memberships, icon: Link2, bg: "bg-purple-50", text: "text-purple-600" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.text}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <NavLink
          to={`${basePath}/users`}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "users"
              ? "text-emerald-700 border-emerald-500"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Users
        </NavLink>
        <NavLink
          to={`${basePath}/roles`}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "roles"
              ? "text-emerald-700 border-emerald-500"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Roles & Permissions
        </NavLink>
        <NavLink
          to={`${basePath}/memberships`}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "memberships"
              ? "text-emerald-700 border-emerald-500"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          <Link2 className="w-4 h-4 shrink-0" />
          Memberships
        </NavLink>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setSubNavOpen((prev) => !prev)}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors -mb-px ${
            subNavOpen
              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          title={subNavOpen ? "Hide sub-tabs" : "Show sub-tabs"}
        >
          {subNavOpen ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
        </button>
      </div>

      {/* Sub-tabs */}
      {subNavOpen && (
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    isActive
                      ? "text-emerald-700 border-emerald-500"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" /> {item.label}
              </NavLink>
            );
          })}
        </div>
      )}

      {!subNavOpen && <div className="mb-6" />}

      <Outlet />
    </div>
    </UserManagementContext.Provider>
  );
}
