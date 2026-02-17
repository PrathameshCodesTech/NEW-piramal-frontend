import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Building2, Layers, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { orgTreeAPI } from "../../services/api";
import { OrgStructureContext } from "../../contexts/OrgStructureContext";

function getBasePath(path) {
  return path.startsWith("/org-structure") ? "/org-structure" : "/admin";
}

function getActiveTab(path, basePath) {
  if (path.startsWith(`${basePath}/companies`)) return "companies";
  if (path.startsWith(`${basePath}/entities`)) return "entities";
  return "orgs";
}

const getNav = (basePath) => [
  { to: `${basePath}/orgs`, label: "Organizations", icon: Building2 },
  { to: `${basePath}/companies`, label: "Companies", icon: Layers },
  { to: `${basePath}/entities`, label: "Entities", icon: MapPin },
];

export default function OrgStructureLayout() {
  const location = useLocation();
  const path = location.pathname;
  const basePath = getBasePath(path);
  const nav = getNav(basePath);
  const [summary, setSummary] = useState(null);
  const activeTab = getActiveTab(path, basePath);

  useEffect(() => {
    orgTreeAPI
      .list()
      .then((res) => {
        const s = res?.summary || {};
        setSummary({
          orgs: s.total_orgs ?? 0,
          companies: s.total_companies ?? 0,
          entities: s.total_entities ?? 0,
        });
      })
      .catch(() => setSummary(null));
  }, [path]);

  return (
    <OrgStructureContext.Provider value={basePath}>
      <div>
        <div className="flex items-baseline gap-2 mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Org Structure</h1>
          <span className="text-sm text-gray-400">—</span>
          <p className="text-sm text-gray-500">
            Manage organizations, companies and entities within your scope
          </p>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Organizations", value: summary.orgs, icon: Building2, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: "Companies", value: summary.companies, icon: Layers, bg: "bg-blue-50", text: "text-blue-600" },
              { label: "Entities", value: summary.entities, icon: MapPin, bg: "bg-purple-50", text: "text-purple-600" },
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

        <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith("/orgs") || item.to.endsWith("/companies") || item.to.endsWith("/entities")}
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

        <Outlet />
      </div>
    </OrgStructureContext.Provider>
  );
}
