import { useNavigate } from "react-router-dom";
import { Sparkles, FileCheck, FileEdit, AlertCircle, Clock } from "lucide-react";
import Card from "../ui/Card";

const cn = (...a) => a.filter(Boolean).join(" ");

const ACTION_ROWS = [
  {
    key: "draft_leases",
    label: "Draft Leases",
    subLabel: "Review pending drafts",
    icon: FileEdit,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    badgeBg: "bg-gray-100",
    badgeColor: "text-gray-700",
    path: "/leases/agreements?status=DRAFT",
  },
  {
    key: "open_disputes",
    label: "Open Disputes",
    subLabel: "View open disputes",
    icon: AlertCircle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-100",
    badgeColor: "text-amber-700",
    path: "/billing/invoices?disputed=true",
  },
  {
    key: "overdue_invoices",
    label: "Overdue Invoices",
    subLabel: "Follow up on overdue",
    icon: Clock,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    badgeBg: "bg-red-100",
    badgeColor: "text-red-700",
    path: "/billing/invoices?status=OVERDUE",
  },
  {
    key: "active_leases",
    label: "Active Leases",
    subLabel: "View all active leases",
    icon: FileCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-100",
    badgeColor: "text-emerald-700",
    path: "/leases/agreements",
  },
];

export default function QuickActionsPanel({ quickActions = {} }) {
  const navigate = useNavigate();

  const visibleRows = ACTION_ROWS.filter((row) => {
    const count = Number(quickActions[row.key]) || 0;
    return count > 0;
  });

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-500" /> Quick Actions
      </h3>

      <button
        onClick={() => navigate("/leases/agreements/create")}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-emerald-600 transition-all mb-4"
      >
        <FileCheck className="w-4 h-4" /> Create Lease
      </button>

      {visibleRows.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-500">No pending actions</div>
      ) : (
        <div className="space-y-1">
          {visibleRows.map((row) => {
            const Icon = row.icon;
            const count = Number(quickActions[row.key]) || 0;
            return (
              <div
                key={row.key}
                onClick={() => navigate(row.path)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", row.iconBg)}>
                    <Icon className={cn("w-4 h-4", row.iconColor)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{row.label}</p>
                    <p className="text-xs text-gray-500">{row.subLabel}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", row.badgeBg, row.badgeColor)}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
