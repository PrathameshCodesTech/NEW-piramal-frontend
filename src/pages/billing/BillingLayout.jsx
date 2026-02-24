import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Settings, FileText, AlertCircle, Gift, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { billingRulesAPI, creditRulesAPI, disputeRulesAPI } from "../../services/api";

const NAV_ITEMS = [
  {
    key: "rules",
    to: "/billing/rules",
    label: "Billing Rules",
    icon: FileText,
    match: (path) => path.startsWith("/billing/rules"),
  },
  {
    key: "credit-rules",
    to: "/billing/credit-rules",
    label: "Credit Rules",
    icon: Gift,
    match: (path) => path.startsWith("/billing/credit-rules"),
  },
  {
    key: "dispute-rules",
    to: "/billing/dispute-rules",
    label: "Dispute Rules",
    icon: AlertCircle,
    match: (path) => path.startsWith("/billing/dispute-rules"),
  },
  {
    key: "site-config",
    to: "/billing/site-config",
    label: "Site Config",
    icon: Settings,
    match: (path) => path.startsWith("/billing/site-config"),
  },
  {
    key: "ageing",
    to: "/billing/ageing",
    label: "Ageing Setup",
    icon: Clock,
    match: (path) => path.startsWith("/billing/ageing"),
  },
];

export default function BillingLayout() {
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      billingRulesAPI.list().catch(() => ({ results: [] })),
      creditRulesAPI.list().catch(() => ({ results: [] })),
      disputeRulesAPI.list().catch(() => ({ results: [] })),
    ]).then(([rules, creditRules, disputeRules]) => {
      const toCount = (x) => (Array.isArray(x) ? x.length : x?.count || (x?.results || []).length || 0);
      setStats({
        rules: toCount(rules),
        creditRules: toCount(creditRules),
        disputeRules: toCount(disputeRules),
      });
    }).catch(() => setStats({ rules: 0, creditRules: 0, disputeRules: 0 }));
  }, [location.pathname]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Billing Configuration</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Configure billing rules, credit rules, dispute rules and ageing setup</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Billing Rules", value: stats?.rules ?? 0, icon: FileText, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Credit Rules", value: stats?.creditRules ?? 0, icon: Gift, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Dispute Rules", value: stats?.disputeRules ?? 0, icon: AlertCircle, bg: "bg-amber-50", text: "text-amber-600" },
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
