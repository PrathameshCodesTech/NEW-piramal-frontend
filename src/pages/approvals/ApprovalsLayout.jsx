import { Outlet, NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function ApprovalsLayout() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Approval Matrices</h1>
        <span className="text-sm text-gray-400">—</span>
        <p className="text-sm text-gray-500">Configure multi-level approval workflows for lease agreements</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        <NavLink
          to="/approvals/rules"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? "text-emerald-700 border-emerald-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`
          }
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Approval Rules
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}
