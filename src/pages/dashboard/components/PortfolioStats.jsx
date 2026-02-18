import { TrendingUp, TrendingDown, DollarSign, MessageSquare, Clock, Wrench } from "lucide-react";

const cn = (...a) => a.filter(Boolean).join(" ");

const STAT_CONFIG = {
  noi_ytd: { label: "NOI (YTD)", icon: DollarSign },
  tenant_requests: { label: "Tenant Requests", icon: MessageSquare },
  avg_days_vacant: { label: "Avg Days Vacant", icon: Clock },
  maintenance_pct_rev: { label: "Maintenance % Rev", icon: Wrench },
};

export default function PortfolioStats({ stats }) {
  if (!stats) return null;

  const keys = Object.keys(STAT_CONFIG).filter((k) => stats[k]);

  if (keys.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {keys.map((key) => {
        const stat = stats[key];
        const config = STAT_CONFIG[key];
        const Icon = config.icon;
        const change = Number(stat.change) || 0;
        const isPositive = change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendIcon className={cn("w-4 h-4", isPositive ? "text-emerald-500" : "text-red-500")} />
              <p className="text-xs text-gray-500 uppercase font-medium">{config.label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stat.formatted || stat.value || "—"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("text-xs font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
                {isPositive ? "+" : ""}{change}%
              </span>
              {stat.label && <span className="text-xs text-gray-500">{stat.label}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
