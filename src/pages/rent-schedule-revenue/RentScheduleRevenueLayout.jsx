import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Calendar, Wallet, TrendingUp } from "lucide-react";

const NAV_ITEMS = [
  { to: "/rent-schedule-revenue/rent-schedules", label: "Rent Schedules", icon: Calendar },
  { to: "/rent-schedule-revenue/receivables", label: "Receivables", icon: Wallet },
  { to: "/rent-schedule-revenue/revenue-recognition", label: "Revenue Recognition", icon: TrendingUp },
];

export default function RentScheduleRevenueLayout() {
  const location = useLocation();

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Reporting & Analytics</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Track rent schedules, receivables and revenue recognition</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={false}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "text-emerald-700 border-emerald-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" /> {item.label}
            </NavLink>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
