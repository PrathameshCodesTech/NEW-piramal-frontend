import { useState } from "react";
import { Bell, AlertTriangle, AlertCircle, Check, X, Plus, ChevronRight } from "lucide-react";
import Card from "../ui/Card";

const cn = (...a) => a.filter(Boolean).join(" ");

const ALERT_CONFIG = {
  LEASE_EXPIRING: { icon: AlertTriangle, borderColor: "border-red-400", iconColor: "text-red-500" },
  RENT_OVERDUE: { icon: AlertTriangle, borderColor: "border-amber-400", iconColor: "text-amber-500" },
  HIGH_VACANCY: { icon: AlertCircle, borderColor: "border-yellow-400", iconColor: "text-yellow-500" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function AlertsSection({ alerts = [], onNavigateToSite, onCreateTask }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  const actionCount = visible.filter((a) => !acknowledged.has(a.id)).length;
  const displayed = showAll ? visible : visible.slice(0, 5);

  const handleDismiss = (id) => setDismissed((prev) => new Set(prev).add(id));
  const handleAcknowledge = (id) => setAcknowledged((prev) => new Set(prev).add(id));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          Alerts
          {actionCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
              {actionCount} action required
            </span>
          )}
        </h3>
      </div>

      {visible.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No alerts</div>
      ) : (
        <div className="space-y-3">
          {displayed.map((alert) => {
            const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.LEASE_EXPIRING;
            const Icon = config.icon;
            const isAcked = acknowledged.has(alert.id);

            return (
              <div
                key={alert.id}
                className={cn(
                  "border-l-4 bg-white rounded-r-lg p-4 shadow-sm transition-opacity",
                  config.borderColor,
                  isAcked && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {alert.site_name && (
                        <button
                          onClick={() => onNavigateToSite?.(alert.site_id)}
                          className="text-xs text-emerald-600 font-medium hover:underline"
                        >
                          {alert.site_name} ›
                        </button>
                      )}
                      {!isAcked && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Dismiss
                      </button>
                      <button
                        onClick={() => onCreateTask?.(alert)}
                        className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Create Task
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(alert.created_at)}</span>
                </div>
              </div>
            );
          })}

          {visible.length > 5 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-center py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center justify-center gap-1"
            >
              View All ({visible.length}) <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
