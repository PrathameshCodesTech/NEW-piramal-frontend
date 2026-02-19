import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FileCheck, TrendingUp, History, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import {
  agreementsAPI,
  escalationTemplatesAPI,
  agreementStructuresAPI,
  leaseAmendmentsAPI,
  leaseLinkedDocumentsAPI,
} from "../../services/api";
import { LayoutList } from "lucide-react";

const NAV_ITEMS = [
  {
    key: "agreements",
    to: "/leases/agreements",
    label: "Agreements",
    icon: FileCheck,
    match: (path) => path.startsWith("/leases/agreements"),
  },
  {
    key: "structures",
    to: "/leases/agreement-structures",
    label: "Agreement Structures",
    icon: LayoutList,
    match: (path) => path.startsWith("/leases/agreement-structures"),
  },
  {
    key: "escalations",
    to: "/leases/escalation-templates",
    label: "Escalation Templates",
    icon: TrendingUp,
    match: (path) => path.startsWith("/leases/escalation-templates"),
  },
  {
    key: "amendments",
    to: "/leases/amendments",
    label: "Amendments",
    icon: History,
    match: (path) => path.startsWith("/leases/amendments"),
  },
  {
    key: "documents",
    to: "/leases/documents",
    label: "Documents & Approvals",
    icon: FileText,
    match: (path) => path.startsWith("/leases/documents"),
  },
];

export default function LeaseLayout() {
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      agreementsAPI.list().catch(() => []),
      agreementStructuresAPI.list().catch(() => []),
      escalationTemplatesAPI.list().catch(() => []),
      leaseAmendmentsAPI.list().catch(() => []),
      leaseLinkedDocumentsAPI.list().catch(() => []),
    ])
      .then(([agreements, structures, templates, amendments, documents]) => {
        const toCount = (x) => (Array.isArray(x) ? x.length : x?.count || (x?.results || []).length || 0);
        setStats({
          agreements: toCount(agreements),
          structures: toCount(structures),
          templates: toCount(templates),
          amendments: toCount(amendments),
          documents: toCount(documents),
        });
      })
      .catch(() => setStats(null));
  }, [location.pathname]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Lease Management</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Manage lease agreements, escalations, amendments and linked documents</p>
      </div>

      {/* Stats Widgets */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Agreements", value: stats.agreements, icon: FileCheck, bg: "bg-emerald-50", text: "text-emerald-600" },
            { label: "Structures", value: stats.structures, icon: LayoutList, bg: "bg-teal-50", text: "text-teal-600" },
            { label: "Templates", value: stats.templates, icon: TrendingUp, bg: "bg-blue-50", text: "text-blue-600" },
            { label: "Amendments", value: stats.amendments, icon: History, bg: "bg-amber-50", text: "text-amber-600" },
            { label: "Documents", value: stats.documents, icon: FileText, bg: "bg-purple-50", text: "text-purple-600" },
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

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(location.pathname);
          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "text-emerald-700 border-emerald-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}

