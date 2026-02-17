import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Filter,
  Loader2,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  Building2,
  Layers,
  MapPin,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Home,
  Users,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { dashboardAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════════════════ */
const cn = (...a) => a.filter(Boolean).join(" ");

const todayYYYYMMDD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fmtMoney = (v) => {
  const n = Number(v);
  if (!isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-IN");
};

const fmtPct = (v) => {
  const n = Number(v);
  if (!isFinite(n)) return "—";
  return n <= 1 ? `${Math.round(n * 100)}%` : `${Math.round(n)}%`;
};

const toCsvParam = (arr) => {
  const a = Array.isArray(arr) ? arr : [];
  const clean = a.map((x) => String(x).trim()).filter(Boolean).filter((x, i, self) => self.indexOf(x) === i);
  return clean.length ? clean.join(",") : undefined;
};

/* ═══════════════════════════════════════════════════════════════════════════
   UI COMPONENTS (Modular - defined in same file)
═══════════════════════════════════════════════════════════════════════════ */

/* ── Button Component ── */
function Button({ children, variant = "primary", size = "md", className, ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2",
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

/* ── Card Component ── */
function Card({ children, className, ...props }) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

/* ── Badge Component ── */
function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

/* ── Modal Component ── */
function Modal({ open, onClose, title, subtitle, children, maxWidth = "lg", bodyMaxHeight }) {
  if (!open) return null;
  const maxW = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl" }[maxWidth] || "max-w-lg";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("relative bg-white rounded-xl shadow-xl border border-gray-200 w-full", maxW)}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={cn("px-5 py-4", bodyMaxHeight && "overflow-y-auto")} style={bodyMaxHeight ? { maxHeight: bodyMaxHeight } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Tooltip Component ── */
function Tooltip({ content, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

/* ── KPICard Component ── */
function KPICard({ title, value, type, change, changeLabel, subtitle, hoverInfo, onClick, detailData }) {
  const typeConfig = {
    occupancy: { icon: Home, color: "emerald", bgIcon: "bg-emerald-100", textIcon: "text-emerald-600" },
    vacant: { icon: Building2, color: "amber", bgIcon: "bg-amber-100", textIcon: "text-amber-600" },
    collected: { icon: DollarSign, color: "blue", bgIcon: "bg-blue-100", textIcon: "text-blue-600" },
    pending: { icon: Clock, color: "red", bgIcon: "bg-red-100", textIcon: "text-red-600" },
    expiries: { icon: Calendar, color: "purple", bgIcon: "bg-purple-100", textIcon: "text-purple-600" },
    default: { icon: TrendingUp, color: "gray", bgIcon: "bg-gray-100", textIcon: "text-gray-600" },
  };
  const config = typeConfig[type] || typeConfig.default;
  const Icon = config.icon;
  const isPositive = change >= 0;

  return (
    <Card
      className={cn("p-5 cursor-pointer hover:shadow-md transition-shadow group", onClick && "hover:border-emerald-300")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgIcon)}>
          <Icon className={cn("w-5 h-5", config.textIcon)} />
        </div>
        {hoverInfo && (
          <Tooltip content={hoverInfo}>
            <div className="text-xs text-gray-400 group-hover:text-gray-600">ℹ️</div>
          </Tooltip>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={cn("text-sm font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
            {isPositive ? "+" : ""}{change}
          </span>
          {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
        </div>
      )}
    </Card>
  );
}

/* ── ChartCard Component ── */
function ChartCard({ title, subtitle, children, chartType, onChartTypeChange, rightContent, contentClassName }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {rightContent}
          {chartType && onChartTypeChange && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {["pie", "bar", "area"].map((t) => (
                <button
                  key={t}
                  onClick={() => onChartTypeChange(t)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                    chartType === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={cn(contentClassName)}>{children}</div>
    </Card>
  );
}

/* ── SimplePie Chart Component ── */
function SimplePie({ size = 160, segments, formatValue, onSegmentClick }) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  if (total === 0) return <div className="flex items-center justify-center h-40 text-gray-500">No data</div>;

  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;
  let currentAngle = -90;

  const paths = segments.map((seg, i) => {
    const value = seg.value || 0;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { d, color: seg.color, label: seg.label, value, seg };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-0">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.color}
            stroke="white"
            strokeWidth="2"
            className={cn(onSegmentClick && "cursor-pointer hover:opacity-80 transition-opacity")}
            onClick={() => onSegmentClick?.(p.seg)}
          />
        ))}
      </svg>
      <div className="mt-3 text-center">
        <p className="text-lg font-bold text-gray-900">{formatValue ? formatValue(total) : total.toLocaleString()}</p>
        <p className="text-xs text-gray-500">Total</p>
      </div>
    </div>
  );
}

/* ── MiniTable Component ── */
function MiniTable({ title, cols, rows, onRowClick, onViewAll, highlightColumn }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {onViewAll && rows.length > 0 && (
          <button onClick={onViewAll} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-500">No data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {cols.map((col, i) => (
                  <th key={col} className={cn("px-4 py-2 text-xs font-semibold text-gray-500 uppercase", i === 0 ? "text-left" : "text-right")}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.slice(0, 5).map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-gray-50")}
                >
                  {cols.map((col, colIdx) => (
                    <td
                      key={col}
                      className={cn(
                        "px-4 py-2.5",
                        colIdx === 0 ? "text-left font-medium text-gray-800" : "text-right text-gray-600",
                        highlightColumn === col && "font-semibold text-amber-600"
                      )}
                    >
                      {row?.[col] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ── ChartLegend Component ── */
function ChartLegend({ items }) {
  return (
    <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-6 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ── FilterModal Component ── */
function FilterModal({ open, onClose, draft, setDraft, filterOptions, onApply, loading }) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Filters" subtitle="Filter dashboard data">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sites</label>
          <select
            multiple
            value={draft.site_ids || []}
            onChange={(e) => setDraft({ ...draft, site_ids: Array.from(e.target.selectedOptions, (o) => o.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {(filterOptions?.sites || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={draft.date_from || ""}
              onChange={(e) => setDraft({ ...draft, date_from: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={draft.date_to || ""}
              onChange={(e) => setDraft({ ...draft, date_to: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
          <input
            type="date"
            value={draft.as_of || ""}
            onChange={(e) => setDraft({ ...draft, as_of: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onApply} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Filters"}
        </Button>
      </div>
    </Modal>
  );
}

/* ── DetailModal Component ── */
function DetailModal({ open, onClose, title, subtitle, children }) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} maxWidth="xl" bodyMaxHeight="70vh">
      {children}
    </Modal>
  );
}

/* ── KPIDetailContent Component ── */
function KPIDetailContent({ data, drillDownProperty, drillDownData, onPropertyClick, onBackFromDrillDown }) {
  if (!data) return <div className="text-gray-500">No details available</div>;

  return (
    <div className="space-y-4">
      {drillDownProperty ? (
        <div>
          <button onClick={onBackFromDrillDown} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-3">
            ← Back to breakdown
          </button>
          <h4 className="font-semibold text-gray-900 mb-2">{drillDownProperty}</h4>
          {drillDownData && (
            <div className="space-y-2">
              {drillDownData.map((item, i) => (
                <div key={i} className="flex justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="font-medium text-gray-800">{item.label}</span>
                  <span className="text-gray-600">{item.amount || item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {data.comparison && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">{data.comparison.currentLabel}</p>
                <p className="text-lg font-bold text-gray-900">{data.comparison.current}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{data.comparison.previousLabel}</p>
                <p className="text-lg font-bold text-gray-600">{data.comparison.previous}</p>
              </div>
            </div>
          )}
          {data.breakdown && data.breakdown.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{data.breakdownTitle || "Breakdown"}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.breakdown.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => data.supportsDrillDown && onPropertyClick?.(item)}
                    className={cn(
                      "flex justify-between p-2 rounded-lg text-sm",
                      data.supportsDrillDown ? "cursor-pointer hover:bg-emerald-50 bg-gray-50" : "bg-gray-50"
                    )}
                  >
                    <span className="font-medium text-gray-800">{item.label}</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.insights && data.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {data.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHART RENDERERS
═══════════════════════════════════════════════════════════════════════════ */

function renderLeasedVacantChart({ data, chartType, onBarClick }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-gray-500">No data</div>;

  const totalLeased = data.reduce((s, r) => s + (Number(r?.leased_area) || 0), 0);
  const totalVacant = data.reduce((s, r) => s + (Number(r?.vacant_area) || 0), 0);

  if (chartType === "pie") {
    return (
      <div className="flex flex-col items-center py-4">
        <SimplePie
          size={160}
          segments={[
            { value: totalLeased, color: "#10b981", label: "Leased" },
            { value: totalVacant, color: "#f59e0b", label: "Vacant" },
          ]}
          formatValue={(v) => `${fmtMoney(v)} sqft`}
        />
        <div className="mt-4 flex gap-6 text-sm">
          <span className="text-emerald-600 font-medium">Leased: {fmtMoney(totalLeased)} sqft</span>
          <span className="text-amber-600 font-medium">Vacant: {fmtMoney(totalVacant)} sqft</span>
        </div>
      </div>
    );
  }

  if (chartType === "bar") {
    const max = Math.max(1, ...data.flatMap((r) => [Number(r?.leased_area) || 0, Number(r?.vacant_area) || 0]));
    return (
      <div>
        <div className="flex items-end justify-around gap-4 w-full px-4" style={{ minHeight: 280 }}>
          {data.map((r, i) => {
            const leased = Number(r?.leased_area) || 0;
            const vacant = Number(r?.vacant_area) || 0;
            const leasedH = (leased / max) * 200;
            const vacantH = (vacant / max) * 200;
            return (
              <div
                key={i}
                onClick={() => onBarClick?.(r)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="flex items-end justify-center gap-1" style={{ height: 220 }}>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-emerald-800 mb-1">{fmtMoney(leased)}</span>
                    <div className="bg-emerald-500 rounded-t-lg group-hover:bg-emerald-600" style={{ width: 44, height: Math.max(8, leasedH) }} />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-amber-700 mb-1">{fmtMoney(vacant)}</span>
                    <div className="bg-amber-400 rounded-t-lg group-hover:bg-amber-500" style={{ width: 44, height: Math.max(8, vacantH) }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center leading-tight">{r.label}</span>
              </div>
            );
          })}
        </div>
        <ChartLegend items={[{ color: "#10b981", label: "Leased" }, { color: "#f59e0b", label: "Vacant" }]} />
      </div>
    );
  }

  // Area/Line chart
  const maxArea = Math.max(1, ...data.flatMap((r) => [Number(r?.leased_area) || 0, Number(r?.vacant_area) || 0]));
  const n = data.length || 1;
  const step = n > 1 ? 100 / (n - 1) : 100;
  const h = 80;
  const toY = (v) => h - (v / maxArea) * (h - 10);
  const leasedPoints = data.map((r, i) => `${i * step},${toY(Number(r?.leased_area) || 0)}`);
  const vacantPoints = data.map((r, i) => `${i * step},${toY(Number(r?.vacant_area) || 0)}`);
  const lastX = (n - 1) * step;
  const leasedArea = `M 0 ${h} L ${leasedPoints.join(" L ")} L ${lastX} ${h} Z`;
  const vacantArea = `M 0 ${h} L ${vacantPoints.join(" L ")} L ${lastX} ${h} Z`;

  return (
    <div>
      <div className="h-36">
        <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="w-full h-full">
          <path d={leasedArea} fill="rgba(16,185,129,0.3)" />
          <path d={vacantArea} fill="rgba(245,158,11,0.3)" />
          <path d={`M ${leasedPoints.join(" L ")}`} fill="none" stroke="#10b981" strokeWidth="2" />
          <path d={`M ${vacantPoints.join(" L ")}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>
      <ChartLegend items={[{ color: "#10b981", label: "Leased" }, { color: "#f59e0b", label: "Vacant" }]} />
    </div>
  );
}

function renderRentChart({ data, chartType }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-gray-500">No data</div>;

  const currentPeriod = data[data.length - 1] || data[0];
  const totalDue = Number(currentPeriod?.due) || 0;
  const totalCollected = Number(currentPeriod?.collected) || 0;

  if (chartType === "pie") {
    const segments = [];
    if (totalCollected > 0) segments.push({ value: totalCollected, color: "#10b981", label: "Collected" });
    if (totalDue > 0) segments.push({ value: totalDue, color: "#f59e0b", label: "Due" });
    return (
      <div className="flex flex-col items-center py-4">
        <SimplePie size={160} segments={segments} formatValue={(v) => `₹${fmtMoney(v)}`} />
        <div className="mt-4 flex gap-6 text-sm">
          <span className="text-emerald-600 font-medium">Collected: ₹{fmtMoney(totalCollected)}</span>
          <span className="text-amber-600 font-medium">Due: ₹{fmtMoney(totalDue)}</span>
        </div>
      </div>
    );
  }

  if (chartType === "bar") {
    const max = Math.max(1, ...data.flatMap((d) => [Number(d?.due) || 0, Number(d?.collected) || 0]));
    return (
      <div className="space-y-4">
        {data.map((d, idx) => {
          const due = Number(d?.due) || 0;
          const col = Number(d?.collected) || 0;
          const total = due + col || 1;
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{d.label}</span>
                <span className="text-xs text-gray-500">₹{fmtMoney(total)}</span>
              </div>
              <div className="h-8 rounded-lg overflow-hidden flex bg-gray-100">
                <div className="bg-emerald-500 flex items-center justify-center" style={{ width: `${(col / total) * 100}%` }}>
                  {col / total > 0.2 && <span className="text-xs font-medium text-white">{fmtMoney(col)}</span>}
                </div>
                <div className="bg-amber-400 flex items-center justify-center" style={{ width: `${(due / total) * 100}%` }}>
                  {due / total > 0.2 && <span className="text-xs font-medium text-white">{fmtMoney(due)}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <ChartLegend items={[{ color: "#10b981", label: "Collected" }, { color: "#f59e0b", label: "Due" }]} />
      </div>
    );
  }

  // Area
  const maxVal = Math.max(1, ...data.flatMap((d) => [Number(d?.due) || 0, Number(d?.collected) || 0]));
  const n = data.length || 1;
  const step = n > 1 ? 100 / (n - 1) : 100;
  const h = 80;
  const toY = (v) => h - (v / maxVal) * (h - 10);
  const dueCoords = data.map((d, i) => `${i * step},${toY(Number(d?.due) || 0)}`);
  const colCoords = data.map((d, i) => `${i * step},${toY(Number(d?.collected) || 0)}`);
  const lastX = (n - 1) * step;
  const dueArea = `M 0 ${h} L ${dueCoords.join(" L ")} L ${lastX} ${h} Z`;
  const colArea = `M 0 ${h} L ${colCoords.join(" L ")} L ${lastX} ${h} Z`;

  return (
    <div>
      <div className="h-36">
        <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="w-full h-full">
          <path d={dueArea} fill="rgba(16,185,129,0.25)" />
          <path d={colArea} fill="rgba(245,158,11,0.25)" />
          <path d={`M ${dueCoords.join(" L ")}`} fill="none" stroke="#10b981" strokeWidth="2" />
          <path d={`M ${colCoords.join(" L ")}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>
      <ChartLegend items={[{ color: "#10b981", label: "Collected" }, { color: "#f59e0b", label: "Due" }]} />
    </div>
  );
}

function renderExpiryChart({ data, chartType }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-gray-500">No data</div>;

  if (chartType === "pie") {
    const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];
    const segments = data.slice(0, 6).map((x, i) => ({
      value: Number(x?.sqft) || 0,
      color: colors[i % colors.length],
      label: String(x?.tenant || x?.expiry_month || i),
    }));
    return (
      <div className="flex flex-col items-center py-4">
        <SimplePie size={140} segments={segments} formatValue={(v) => `${fmtMoney(v)} sqft`} />
        <div className="mt-3 text-xs text-gray-500 text-center max-h-16 overflow-y-auto">
          {data.slice(0, 4).map((x, i) => (
            <div key={i}>{x?.tenant}: {fmtMoney(x?.sqft || 0)} sqft</div>
          ))}
        </div>
      </div>
    );
  }

  if (chartType === "bar") {
    const max = Math.max(1, ...data.map((x) => Number(x?.sqft) || 0));
    return (
      <div className="flex items-end justify-around gap-3 w-full" style={{ minHeight: 280 }}>
        {data.slice(0, 8).map((x, idx) => {
          const area = Number(x?.sqft) || 0;
          const height = (area / max) * 200;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 min-w-0" style={{ maxWidth: 96 }}>
              <span className="text-xs font-medium text-emerald-700 whitespace-nowrap">{x?.time_left || "—"}</span>
              <div className="w-full flex flex-col justify-end min-w-[44px] mx-auto" style={{ height: 220 }}>
                <div className="w-full bg-emerald-500 rounded-t-lg min-h-[8px]" style={{ height }} />
              </div>
              <span className="text-sm font-semibold text-gray-800 truncate w-full text-center">{x?.tenant}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Area
  const maxVal = Math.max(1, ...data.map((x) => Number(x?.sqft) || 0));
  const n = data.length || 1;
  const step = n > 1 ? 100 / (n - 1) : 100;
  const h = 80;
  const toY = (v) => h - (v / maxVal) * (h - 10);
  const coords = data.map((x, i) => `${i * step},${toY(Number(x?.sqft) || 0)}`);
  const lastX = (n - 1) * step;
  const areaPath = `M 0 ${h} L ${coords.join(" L ")} L ${lastX} ${h} Z`;

  return (
    <div>
      <div className="h-36">
        <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="expGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#expGrad)" />
          <path d={`M ${coords.join(" L ")}`} fill="none" stroke="#10b981" strokeWidth="2" />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
        {data.slice(0, 6).map((x, i) => (
          <span key={i}>{String(x?.expiry_month || i).slice(-2)}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  // Applied filters
  const [applied, setApplied] = useState({
    org_ids: [],
    site_ids: [],
    tower_ids: [],
    floor_ids: [],
    unit_ids: [],
    as_of: todayYYYYMMDD(),
    date_from: "",
    date_to: "",
    group_by: "site",
  });

  // Draft filters (modal)
  const [draft, setDraft] = useState(applied);
  const [filterOpen, setFilterOpen] = useState(false);

  // Chart types
  const [chart1Type, setChart1Type] = useState("bar");
  const [chart2Type, setChart2Type] = useState("pie");
  const [chart3Type, setChart3Type] = useState("bar");

  // Modals
  const [kpiModal, setKpiModal] = useState({ open: false, kpi: null, drillDownProperty: null, drillDownData: null });
  const [viewAllModal, setViewAllModal] = useState({ open: false, title: "", rows: [], cols: [] });
  const [chartExpandModal, setChartExpandModal] = useState({ open: false, chart: null });

  // Property selector
  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  const filterOptions = useMemo(() => data?.filters || {}, [data]);

  const buildParams = (obj) => ({
    org_ids: toCsvParam(obj.org_ids),
    site_ids: toCsvParam(obj.site_ids),
    tower_ids: toCsvParam(obj.tower_ids),
    floor_ids: toCsvParam(obj.floor_ids),
    unit_ids: toCsvParam(obj.unit_ids),
    as_of: obj.as_of || undefined,
    date_from: obj.date_from || undefined,
    date_to: obj.date_to || undefined,
    group_by: obj.group_by || "site",
  });

  const loadDashboard = async (nextApplied) => {
    setLoading(true);
    setErr("");
    try {
      const params = buildParams(nextApplied);
      const res = await dashboardAPI.getDashboard(params);
      setData(res);
      setApplied(nextApplied);
    } catch (e) {
      setErr(e?.message || "Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPIs from API
  const kpis = useMemo(() => {
    if (!data?.kpis) return [];
    const k = data.kpis;
    return [
      {
        id: "occupancy",
        title: "Occupancy",
        value: k.occupancy_rate?.formatted || `${k.occupancy_rate?.value || 0}%`,
        type: "occupancy",
        change: k.occupancy_rate?.change || 0,
        changeLabel: k.occupancy_rate?.change_label || "vs last month",
        hoverInfo: "Click to see breakdown by property",
        detailData: k.occupancy_rate,
      },
      {
        id: "vacant",
        title: "Vacant Area",
        value: k.vacant_area?.formatted || `${k.vacant_area?.value || 0} sqft`,
        type: "vacant",
        change: k.vacant_area?.change || 0,
        changeLabel: k.vacant_area?.change_label || "sqft",
        hoverInfo: "Click to see breakdown by property",
        detailData: k.vacant_area,
      },
      {
        id: "collected",
        title: "Rent Collected",
        value: k.rent_collected?.formatted || `₹${fmtMoney(k.rent_collected?.value || 0)}`,
        type: "collected",
        change: k.rent_collected?.change || 0,
        changeLabel: k.rent_collected?.change_label || "vs target",
        hoverInfo: "Click for collection details",
        detailData: k.rent_collected,
      },
      {
        id: "pending",
        title: "Pending Revenue",
        value: k.pending_revenue?.formatted || `₹${fmtMoney(k.pending_revenue?.value || 0)}`,
        type: "pending",
        subtitle: k.pending_revenue?.subtitle || "Receivables",
        hoverInfo: "Click for breakdown by property",
        detailData: k.pending_revenue,
      },
      {
        id: "monthly_rent",
        title: "Monthly Rent Raised",
        value: k.monthly_rent_raised?.formatted || `₹${fmtMoney(k.monthly_rent_raised?.value || 0)}`,
        type: "expiries",
        subtitle: k.monthly_rent_raised?.subtitle || "This month",
        hoverInfo: "Click for breakdown by property",
        detailData: k.monthly_rent_raised,
      },
      {
        id: "new_leases",
        title: "New Leases",
        value: k.new_leases_ytd?.formatted || String(k.new_leases_ytd?.value || 0),
        type: "default",
        subtitle: k.new_leases_ytd?.subtitle || "YTD",
        hoverInfo: "Click to see new leases",
        detailData: k.new_leases_ytd,
      },
    ];
  }, [data]);

  // Chart data from API
  const leasedVacantData = useMemo(() => {
    const chartData = data?.charts?.leased_vacant || [];
    if (selectedSiteIds.length === 0) return chartData;
    return chartData.filter((row) => selectedSiteIds.includes(row.propertyId));
  }, [data, selectedSiteIds]);

  const rentDueCollectedData = useMemo(() => data?.charts?.rent_due_collected || [], [data]);
  const expiryLadderData = useMemo(() => data?.charts?.expiry_ladder || [], [data]);

  // Table data from API
  const tblUpcoming = useMemo(() => {
    const rows = data?.tables?.upcoming_expiries || [];
    return rows.map((x, idx) => ({
      _raw: x,
      _idx: idx,
      Tenant: x?.tenant || "—",
      Rent: `₹${fmtMoney(x?.rent_due)}`,
      "Days Left": `${x?.days_left ?? "—"}d`,
    }));
  }, [data]);

  const tblOverdue = useMemo(() => {
    const rows = data?.tables?.top_overdue_tenants || [];
    return rows.map((x, idx) => ({
      _raw: x,
      _idx: idx,
      Tenant: x?.tenant || "—",
      Overdue: `₹${fmtMoney(x?.overdue)}`,
      Status: x?.bucket || "—",
    }));
  }, [data]);

  const tblVacantAging = useMemo(() => {
    const rows = data?.tables?.vacant_units_aging || [];
    return rows.map((x, idx) => ({
      _raw: x,
      _idx: idx,
      Unit: x?.unit_label || `Unit #${x?.unit_id ?? "—"}`,
      Area: `${fmtMoney(x?.area)} sqft`,
      "Vacant Since": x?.vacant_since ?? "—",
      Days: x?.days != null ? `${x.days}d` : "—",
    }));
  }, [data]);

  // Handlers
  const openFilters = () => {
    setDraft(applied);
    setFilterOpen(true);
  };

  const applyFilters = async () => {
    setFilterOpen(false);
    await loadDashboard(draft);
  };

  const refresh = () => loadDashboard(applied);

  const handleKpiClick = (kpi) => {
    setKpiModal({ open: true, kpi, drillDownProperty: null, drillDownData: null });
  };

  const handleKpiModalClose = () => {
    setKpiModal({ open: false, kpi: null, drillDownProperty: null, drillDownData: null });
  };

  const handlePropertyClickInKpi = (item) => {
    if (!item?.propertyId) return;
    const kpiId = kpiModal.kpi?.id;
    const breakdown = kpiModal.kpi?.detailData?.breakdown || [];
    const propertyBreakdown = breakdown.find((b) => b.propertyId === item.propertyId);
    if (propertyBreakdown) {
      setKpiModal((prev) => ({
        ...prev,
        drillDownProperty: item.label,
        drillDownData: [{ label: item.label, amount: propertyBreakdown.value }],
      }));
    }
  };

  const handleBackFromDrillDown = () => {
    setKpiModal((prev) => ({ ...prev, drillDownProperty: null, drillDownData: null }));
  };

  const handleTableRowClick = (row, type) => {
    console.log("Row clicked:", row, type);
  };

  const handleViewAll = (title, rows, cols) => {
    setViewAllModal({ open: true, title, rows, cols });
  };

  const openChartExpandModal = (chartId) => setChartExpandModal({ open: true, chart: chartId });
  const closeChartExpandModal = () => setChartExpandModal({ open: false, chart: null });

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Overview of your property portfolio</p>
              </div>
              {/* Property selector */}
              <div className="hidden md:block relative">
                <button
                  type="button"
                  onClick={() => setPropertyDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedSiteIds.length === 0
                      ? "All Properties"
                      : selectedSiteIds.length === (filterOptions?.sites?.length || 0)
                        ? "All Properties"
                        : `${selectedSiteIds.length} selected`}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", propertyDropdownOpen && "rotate-180")} />
                </button>
                {propertyDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setPropertyDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-20 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                      <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Properties</p>
                      {(filterOptions?.sites || []).map((s) => (
                        <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSiteIds.includes(String(s.id))}
                            onChange={() => {
                              const id = String(s.id);
                              setSelectedSiteIds((prev) =>
                                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                              );
                            }}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-800">{s.name}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              )}
              <Button variant="secondary" onClick={refresh} disabled={loading} className="p-2.5">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
              <Button variant="secondary" className="p-2.5">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={openFilters}>
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">{err}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} {...kpi} onClick={() => handleKpiClick(kpi)} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Leased vs Vacant" subtitle="By property" chartType={chart1Type} onChartTypeChange={setChart1Type}>
            {renderLeasedVacantChart({ data: leasedVacantData, chartType: chart1Type, onBarClick: () => openChartExpandModal("leased_vacant") })}
          </ChartCard>
          <ChartCard title="Rent Due vs Collected" subtitle="By project" chartType={chart2Type} onChartTypeChange={setChart2Type}>
            {renderRentChart({ data: rentDueCollectedData, chartType: chart2Type })}
          </ChartCard>
          <ChartCard title="Lease Expiry Ladder" subtitle="Tenant wise" chartType={chart3Type} onChartTypeChange={setChart3Type}>
            {renderExpiryChart({ data: expiryLadderData, chartType: chart3Type })}
          </ChartCard>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MiniTable
            title="Upcoming Expiries"
            cols={["Tenant", "Rent", "Days Left"]}
            rows={tblUpcoming}
            onRowClick={(row) => handleTableRowClick(row, "lease")}
            onViewAll={() => handleViewAll("Upcoming Expiries", tblUpcoming, ["Tenant", "Rent", "Days Left"])}
          />
          <MiniTable
            title="Top Overdue Tenants"
            cols={["Tenant", "Overdue", "Status"]}
            rows={tblOverdue}
            highlightColumn="Overdue"
            onRowClick={(row) => handleTableRowClick(row, "tenant")}
            onViewAll={() => handleViewAll("Top Overdue Tenants", tblOverdue, ["Tenant", "Overdue", "Status"])}
          />
          <MiniTable
            title="Vacant Units Aging"
            cols={["Unit", "Area", "Vacant Since", "Days"]}
            rows={tblVacantAging}
            onRowClick={(row) => handleTableRowClick(row, "unit")}
            onViewAll={() => handleViewAll("Vacant Units Aging", tblVacantAging, ["Unit", "Area", "Vacant Since", "Days"])}
          />
        </div>

        {/* Portfolio Map */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">Portfolio Map</h3>
            <Button variant="secondary" size="sm">
              <Layers className="w-4 h-4" />
              Heatmap
            </Button>
          </div>
          <div className="relative min-h-[220px] rounded-lg bg-gray-100/80 overflow-visible">
            <svg className="absolute inset-0 w-full h-full text-gray-300" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M0,120 Q80,80 120,100 T240,90 T360,110 T400,100 L400,220 L0,220 Z" fill="currentColor" opacity={0.6} />
              <path d="M0,140 Q100,100 200,130 T400,120 L400,220 L0,220 Z" fill="currentColor" opacity={0.4} />
            </svg>
            {(data?.portfolio_map || []).map((pin, i) => (
              <div
                key={pin.id || i}
                className="absolute z-10"
                style={{ left: `${20 + i * 40}%`, top: "40%", transform: "translate(-50%, -50%)" }}
              >
                <Tooltip content={`${pin.name}: ${pin.occupancy}% occupancy`}>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full ring-4 ring-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform",
                      pin.color === "green" && "bg-emerald-500",
                      pin.color === "orange" && "bg-amber-500",
                      pin.color === "red" && "bg-red-500"
                    )}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> ≥90%</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> 75-89%</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> {"<"}75%</div>
          </div>
        </Card>
      </div>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        draft={draft}
        setDraft={setDraft}
        filterOptions={filterOptions}
        onApply={applyFilters}
        loading={loading}
      />

      {/* KPI Detail Modal */}
      <DetailModal
        open={kpiModal.open}
        onClose={handleKpiModalClose}
        title={kpiModal.kpi?.title || "Details"}
        subtitle="Breakdown and insights"
      >
        <KPIDetailContent
          data={kpiModal.kpi?.detailData}
          drillDownProperty={kpiModal.drillDownProperty}
          drillDownData={kpiModal.drillDownData}
          onPropertyClick={handlePropertyClickInKpi}
          onBackFromDrillDown={handleBackFromDrillDown}
        />
      </DetailModal>

      {/* View All Modal */}
      <DetailModal
        open={viewAllModal.open}
        onClose={() => setViewAllModal({ open: false, title: "", rows: [], cols: [] })}
        title={viewAllModal.title}
        subtitle={`${viewAllModal.rows.length} items`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {viewAllModal.cols.map((col, idx) => (
                  <th key={col} className={cn("py-3 px-2 text-xs font-semibold text-gray-500 uppercase", idx === 0 ? "text-left" : "text-right")}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {viewAllModal.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {viewAllModal.cols.map((col, colIdx) => (
                    <td key={col} className={cn("py-3 px-2", colIdx === 0 ? "text-left font-medium text-gray-800" : "text-right text-gray-600")}>
                      {row?.[col] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DetailModal>

      {/* Chart Expand Modal */}
      <DetailModal
        open={chartExpandModal.open}
        onClose={closeChartExpandModal}
        title={chartExpandModal.chart === "leased_vacant" ? "Leased vs Vacant" : chartExpandModal.chart === "rent" ? "Rent Due vs Collected" : "Lease Expiry Ladder"}
        subtitle="Expanded view"
        maxWidth="2xl"
      >
        <div className="min-h-[320px]">
          {chartExpandModal.chart === "leased_vacant" && (
            <ChartCard title="Leased vs Vacant" subtitle="By property" chartType={chart1Type} onChartTypeChange={setChart1Type}>
              {renderLeasedVacantChart({ data: leasedVacantData, chartType: chart1Type })}
            </ChartCard>
          )}
          {chartExpandModal.chart === "rent" && (
            <ChartCard title="Rent Due vs Collected" subtitle="By project" chartType={chart2Type} onChartTypeChange={setChart2Type}>
              {renderRentChart({ data: rentDueCollectedData, chartType: chart2Type })}
            </ChartCard>
          )}
          {chartExpandModal.chart === "expiry" && (
            <ChartCard title="Lease Expiry Ladder" subtitle="Tenant wise" chartType={chart3Type} onChartTypeChange={setChart3Type}>
              {renderExpiryChart({ data: expiryLadderData, chartType: chart3Type })}
            </ChartCard>
          )}
        </div>
      </DetailModal>
    </div>
  );
}
