import { Outlet, NavLink } from "react-router-dom";
import { Calendar, Receipt, Wallet, TrendingUp, PanelTopClose, PanelTopOpen } from "lucide-react";
import { useState } from "react";

const RENT_SCHEDULE_REVENUE_NAV = [
  { to: "/rent-schedule-revenue/rent-schedules", label: "Rent Schedules", icon: Calendar },
  { to: "/rent-schedule-revenue/invoice", label: "Invoice", icon: Receipt },
  { to: "/rent-schedule-revenue/receivables", label: "Receivables", icon: Wallet },
  { to: "/rent-schedule-revenue/revenue-recognition", label: "Revenue Recognition", icon: TrendingUp },
];

export default function RentScheduleRevenueLayout() {
  const [subNavOpen, setSubNavOpen] = useState(true);

  return (
    <div>
      {/* Header — same pattern as BillingLayout */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Rent Schedule & Revenue Recognition</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Manage rent schedules, invoices, receivables and revenue recognition</p>
      </div>

      {/* Sub-tabs — 4 tabs: Rent Schedules, Invoice, Receivables, Revenue Recognition */}
      <div className="flex flex-wrap items-center gap-1 mb-6 border-b border-gray-200">
        {RENT_SCHEDULE_REVENUE_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={false}
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

      {!subNavOpen && <div className="mb-6" />}

      <Outlet />
    </div>
  );
}
