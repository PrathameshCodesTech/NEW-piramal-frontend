import { Outlet, NavLink, useLocation } from "react-router-dom";
import { BookOpen, History, FileText, Link2, FolderOpen, PanelTopClose, PanelTopOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { clauseStatsAPI } from "../../services/api";

const CLAUSES_NAV = [
  { to: "/clauses/clauses", label: "Clauses", icon: BookOpen },
  { to: "/clauses/categories", label: "Categories", icon: FolderOpen },
];
const VERSIONS_NAV = [{ to: "/clauses/versions", label: "Versions", icon: History }];
const DOCUMENTS_NAV = [{ to: "/clauses/documents", label: "Documents", icon: FileText }];
const USAGES_NAV = [{ to: "/clauses/usages", label: "Usages", icon: Link2 }];

export default function ClauseLayout() {
  const location = useLocation();
  const path = location.pathname;
  const [stats, setStats] = useState(null);
  const [subNavOpen, setSubNavOpen] = useState(true);
  const activeTab = path.startsWith("/clauses/versions") ? "versions" : path.startsWith("/clauses/documents") ? "documents" : path.startsWith("/clauses/usages") ? "usages" : "clauses";
  const navItems = activeTab === "versions" ? VERSIONS_NAV : activeTab === "documents" ? DOCUMENTS_NAV : activeTab === "usages" ? USAGES_NAV : CLAUSES_NAV;

  useEffect(() => {
    clauseStatsAPI.summary().then(setStats).catch(() => setStats(null));
  }, [path]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Clause Library</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Manage clause templates, versions, documents and usages</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Clauses", value: stats?.total_clauses ?? 0, icon: BookOpen, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Categories", value: stats?.total_categories ?? 0, icon: FolderOpen, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Documents", value: stats?.total_documents ?? 0, icon: FileText, bg: "bg-amber-50", text: "text-amber-600" },
          { label: "Versions", value: stats?.total_versions ?? 0, icon: History, bg: "bg-purple-50", text: "text-purple-600" },
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

      {/* Main tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <NavLink to="/clauses/clauses" className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors " + (activeTab === "clauses" ? "text-emerald-700 border-emerald-500" : "text-gray-500 border-transparent hover:text-gray-700")}>
          <BookOpen className="w-4 h-4 shrink-0" /> Legal and Operational
        </NavLink>
        <NavLink to="/clauses/versions" className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors " + (activeTab === "versions" ? "text-emerald-700 border-emerald-500" : "text-gray-500 border-transparent hover:text-gray-700")}>
          <History className="w-4 h-4 shrink-0" /> Versions
        </NavLink>
        <NavLink to="/clauses/documents" className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors " + (activeTab === "documents" ? "text-emerald-700 border-emerald-500" : "text-gray-500 border-transparent hover:text-gray-700")}>
          <FileText className="w-4 h-4 shrink-0" /> Documents
        </NavLink>
        <NavLink to="/clauses/usages" className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors " + (activeTab === "usages" ? "text-emerald-700 border-emerald-500" : "text-gray-500 border-transparent hover:text-gray-700")}>
          <Link2 className="w-4 h-4 shrink-0" /> Usages
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

      {/* Sub-tabs - identical underline style as parent tabs */}
      {subNavOpen && (
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/clauses/clauses"}
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
  );
}
