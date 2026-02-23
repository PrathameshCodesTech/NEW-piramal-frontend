import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Calendar, BarChart3, CreditCard, FileMinus, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { invoiceSchedulesAPI, paymentsAPI, creditNotesAPI } from "../../services/api";

const NAV_ITEMS = [
  {
    key: "schedules",
    to: "/billing/schedules",
    label: "Invoice Schedules",
    icon: Calendar,
    match: (path) => path.startsWith("/billing/schedules"),
  },
  {
    key: "ar-overview",
    to: "/billing/ar-overview",
    label: "AR Overview",
    icon: BarChart3,
    match: (path) => path.startsWith("/billing/ar-overview"),
  },
  {
    key: "ar-settings",
    to: "/billing/ar-settings",
    label: "AR Settings",
    icon: Settings,
    match: (path) => path.startsWith("/billing/ar-settings"),
  },
  {
    key: "payments",
    to: "/billing/collections/payments",
    label: "Payments",
    icon: CreditCard,
    match: (path) => path.startsWith("/billing/collections/payments"),
  },
  {
    key: "credit-notes",
    to: "/billing/collections/credit-notes",
    label: "Credit Notes",
    icon: FileMinus,
    match: (path) => path.startsWith("/billing/collections/credit-notes"),
  },
];

export default function BillingCollectionsLayout() {
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      invoiceSchedulesAPI.list().catch(() => ({ results: [] })),
      paymentsAPI.list().catch(() => ({ results: [] })),
      creditNotesAPI.list().catch(() => ({ results: [] })),
    ]).then(([schedules, payments, creditNotes]) => {
      const toCount = (x) => (Array.isArray(x) ? x.length : x?.count || (x?.results || []).length || 0);
      setStats({
        schedules: toCount(schedules),
        payments: toCount(payments),
        creditNotes: toCount(creditNotes),
      });
    }).catch(() => setStats({ schedules: 0, payments: 0, creditNotes: 0 }));
  }, [location.pathname]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Billing & Collections</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Manage invoice schedules, payments, credit notes and accounts receivable</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Schedules", value: stats?.schedules ?? 0, icon: Calendar, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Payments", value: stats?.payments ?? 0, icon: CreditCard, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Credit Notes", value: stats?.creditNotes ?? 0, icon: FileMinus, bg: "bg-purple-50", text: "text-purple-600" },
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
