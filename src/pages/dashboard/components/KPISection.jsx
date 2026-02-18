import { TrendingUp, TrendingDown, Home, Building2, IndianRupee, Clock, FileCheck, BarChart2, Info, ChevronRight } from "lucide-react";

const cn = (...a) => a.filter(Boolean).join(" ");

const TYPE_CONFIG = {
  occupancy: {
    icon: Home,
    accent: "border-emerald-500",
    iconBg: "bg-emerald-500",
    valueBg: "bg-emerald-50",
    changePos: "bg-emerald-50 text-emerald-700",
    changeNeg: "bg-red-50 text-red-700",
    progressBar: true,
  },
  vacant: {
    icon: Building2,
    accent: "border-amber-500",
    iconBg: "bg-amber-500",
    valueBg: "bg-amber-50",
    changePos: "bg-emerald-50 text-emerald-700",
    changeNeg: "bg-red-50 text-red-700",
    progressBar: false,
  },
  collected: {
    icon: IndianRupee,
    accent: "border-blue-500",
    iconBg: "bg-blue-500",
    valueBg: "bg-blue-50",
    changePos: "bg-emerald-50 text-emerald-700",
    changeNeg: "bg-red-50 text-red-700",
    progressBar: false,
  },
  pending: {
    icon: Clock,
    accent: "border-red-500",
    iconBg: "bg-red-500",
    valueBg: "bg-red-50",
    changePos: "bg-emerald-50 text-emerald-700",
    changeNeg: "bg-red-50 text-red-700",
    progressBar: false,
  },
  expiries: {
    icon: BarChart2,
    accent: "border-purple-500",
    iconBg: "bg-purple-500",
    valueBg: "bg-purple-50",
    changePos: "bg-emerald-50 text-emerald-700",
    changeNeg: "bg-red-50 text-red-700",
    progressBar: false,
  },
  default: {
    icon: FileCheck,
    accent: "border-sky-500",
    iconBg: "bg-sky-500",
    valueBg: "bg-sky-50",
    changePos: "bg-emerald-50 text-emerald-700",
    changeNeg: "bg-red-50 text-red-700",
    progressBar: false,
  },
};

function KPICard({ title, value, type, change, changeLabel, subtitle, hoverInfo, onClick, detailData }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  const Icon = config.icon;
  const isPositive = Number(change) >= 0;
  const hasChange = change !== undefined && change !== null;

  // Try to extract a numeric occupancy for the progress bar
  const occupancyNum = type === "occupancy"
    ? parseFloat(detailData?.value ?? value ?? 0)
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm",
        "border-t-4", config.accent,
        "hover:shadow-lg hover:border-t-4 transition-all duration-200",
        onClick && "cursor-pointer"
      )}
    >
      {/* Body */}
      <div className="p-4 pb-3">
        {/* Top row: icon + title + info */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.iconBg)}>
            <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {hoverInfo && <Info className="w-3.5 h-3.5 text-gray-400" />}
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>

        {/* Value */}
        <p className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">
          {value || "—"}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Progress bar for occupancy */}
      {config.progressBar && occupancyNum > 0 && (
        <div className="px-4 pb-2">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                occupancyNum >= 90 ? "bg-emerald-500" : occupancyNum >= 75 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(100, occupancyNum)}%` }}
            />
          </div>
        </div>
      )}

      {/* Change pill + label */}
      {hasChange && (
        <div className="px-4 pb-4 flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
            isPositive ? config.changePos : config.changeNeg
          )}>
            {isPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{change}
          </span>
          {changeLabel && (
            <span className="text-[11px] text-gray-400">{changeLabel}</span>
          )}
        </div>
      )}

      {/* Bottom click hint line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity",
        config.iconBg
      )} />
    </button>
  );
}

export default function KPISection({ kpis, onKpiClick }) {
  if (!kpis?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          {...kpi}
          onClick={onKpiClick ? () => onKpiClick(kpi) : undefined}
        />
      ))}
    </div>
  );
}
