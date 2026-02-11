import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Receipt, BarChart3, Settings, FileText, Calendar, CreditCard, FileMinus, AlertCircle, Gift, Clock, FileSignature, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { billingRulesAPI, invoicesAPI, paymentsAPI } from "../../services/api";

const BILLING_NAV = [
  { to: "/billing/site-config", label: "Site Config", icon: Settings },
  { to: "/billing/rules", label: "Billing Rules", icon: FileText },
  { to: "/billing/schedules", label: "Invoice Schedules", icon: Calendar },
  { to: "/billing/invoices", label: "Invoices", icon: Receipt },
];

const AR_NAV = [
  { to: "/billing/ar-overview", label: "AR Overview", icon: BarChart3 },
  { to: "/billing/collections/payments", label: "Payments", icon: CreditCard },
  { to: "/billing/collections/credit-notes", label: "Credit Notes", icon: FileMinus },
  { to: "/billing/dispute-rules", label: "Dispute Rules", icon: AlertCircle },
  { to: "/billing/credit-rules", label: "Credit Rules", icon: Gift },
  { to: "/billing/ageing", label: "Ageing Setup", icon: Clock },
  { to: "/billing/ar-settings", label: "AR Settings", icon: Settings },
  { to: "/billing/lease-rules", label: "Lease AR Rules", icon: FileSignature },
];

function isBillingRoute(path) {
  return (
    path.startsWith("/billing/site-config") ||
    path.startsWith("/billing/rules") ||
    path.startsWith("/billing/schedules") ||
    path.startsWith("/billing/invoices")
  );
}

export default function BillingLayout() {
  const location = useLocation();
  const path = location.pathname;
  const [stats, setStats] = useState(null);
  const [subNavOpen, setSubNavOpen] = useState(true);
  const activeTab = isBillingRoute(path) ? "billing" : "ar";
  const navItems = activeTab === "billing" ? BILLING_NAV : AR_NAV;

  useEffect(() => {
    Promise.all([
      billingRulesAPI.list().catch(() => ({ results: [] })),
      typeof invoicesAPI.summary === "function" ? invoicesAPI.summary().catch(() => ({})) : Promise.resolve({}),
      paymentsAPI.list().catch(() => ({ results: [] })),
    ]).then(([rules, invSummary, payments]) => {
      const r = rules?.results || [];
      const p = payments?.results || [];
      setStats({
        rules: Array.isArray(r) ? r.length : 0,
        invoices: invSummary?.total ?? invSummary?.count ?? (Array.isArray(invSummary?.invoices) ? invSummary.invoices.length : 0),
        payments: Array.isArray(p) ? p.length : 0,
      });
    }).catch(() => setStats({ rules: 0, invoices: 0, payments: 0 }));
  }, [path]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Billing & AR</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Manage billing configuration, invoices, payments and receivables</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Rules", value: stats?.rules ?? 0, icon: FileText, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Invoices", value: stats?.invoices ?? 0, icon: Receipt, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Payments", value: stats?.payments ?? 0, icon: CreditCard, bg: "bg-purple-50", text: "text-purple-600" },
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

      {/* Primary tabs */}
      <div className="flex gap-1 mb-1 border-b border-gray-200">
        <NavLink
          to="/billing/site-config"
          className={
            `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "billing"
                ? "text-emerald-700 border-emerald-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`
          }
        >
          <Receipt className="w-4 h-4 shrink-0" />
          Billing
        </NavLink>
        <NavLink
          to="/billing/ar-overview"
          className={
            `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "ar"
                ? "text-emerald-700 border-emerald-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`
          }
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          AR
        </NavLink>
      </div>

      {/* Sub-tabs with icons and collapse toggle */}
      {subNavOpen ? (
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={false}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" /> {item.label}
                </NavLink>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSubNavOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
            title="Hide sub-navigation"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => setSubNavOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"
            title="Show sub-navigation"
          >
            <ChevronDown className="w-4 h-4" /> Show sub-tabs
          </button>
        </div>
      )}

      <Outlet />
    </div>
  );
}
