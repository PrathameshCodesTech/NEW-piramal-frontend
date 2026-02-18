import { useState } from "react";
import ChartCard from "../ui/ChartCard";
import SimplePie from "../ui/SimplePie";
import ChartLegend from "../ui/ChartLegend";
import { X } from "lucide-react";

const fmtMoney = (v) => {
  const n = Number(v);
  if (!isFinite(n) || n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};
const fmtSqft = (v) => {
  const n = Number(v);
  if (!isFinite(n) || n === 0) return "0";
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L sqft`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K sqft`;
  return `${n.toLocaleString("en-IN")} sqft`;
};

/* ═══════════════════════════════════════════
   VERTICAL BAR CHART — reusable SVG component
   Supports grouped bars (up to 2 series)
═══════════════════════════════════════════ */
function VerticalBarChart({ data, series, formatY, height = 220, onBarClick }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data?.length) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;

  const W = 400;
  const H = height;
  const PAD = { top: 20, right: 16, bottom: 48, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0));
  const maxVal = Math.max(1, ...allVals);

  const numTicks = 5;
  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => (maxVal / numTicks) * i);

  const groupW = chartW / data.length;
  const barPad = groupW * 0.15;
  const barW = (groupW - barPad * 2) / series.length - 2;

  const toY = (v) => chartH - (v / maxVal) * chartH;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y-axis gridlines + labels */}
        {ticks.map((tick, i) => {
          const y = PAD.top + toY(tick);
          return (
            <g key={i}>
              <line
                x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke={i === 0 ? "#d1d5db" : "#f3f4f6"} strokeWidth={i === 0 ? 1 : 0.5}
              />
              <text x={PAD.left - 5} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                {formatY ? formatY(tick) : tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, gi) => {
          const groupX = PAD.left + gi * groupW + barPad;
          return (
            <g key={gi}>
              {series.map((s, si) => {
                const val = Number(d[s.key]) || 0;
                const bH = Math.max(2, (val / maxVal) * chartH);
                const bX = groupX + si * (barW + 2);
                const bY = PAD.top + chartH - bH;

                return (
                  <g key={si}>
                    {/* Bar shadow */}
                    <rect x={bX + 1} y={bY + 2} width={barW} height={bH} rx={3} fill="rgba(0,0,0,0.06)" />
                    {/* Bar */}
                    <rect
                      x={bX} y={bY} width={barW} height={bH} rx={3}
                      fill={s.color}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => onBarClick?.(d, s)}
                      onMouseEnter={() => {
                        setTooltip({ x: bX + barW / 2, y: bY, val, label: d.label, series: s.label, color: s.color });
                      }}
                    />
                    {/* Value label on top of bar if tall enough */}
                    {bH > 22 && (
                      <text x={bX + barW / 2} y={bY - 4} textAnchor="middle" fontSize={8} fill={s.color} fontWeight="600">
                        {formatY ? formatY(val) : val}
                      </text>
                    )}
                  </g>
                );
              })}
              {/* X-axis label */}
              <text
                x={groupX + (series.length * (barW + 2)) / 2 - 1}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                fontSize={9.5}
                fill="#6b7280"
                fontWeight="500"
              >
                {String(d.label || "").length > 12 ? String(d.label).slice(0, 11) + "…" : d.label}
              </text>
            </g>
          );
        })}

        {/* SVG Tooltip */}
        {tooltip && (() => {
          const tw = 100;
          const th = 44;
          const tx = Math.min(W - PAD.right - tw, Math.max(PAD.left, tooltip.x - tw / 2));
          const ty = Math.max(PAD.top, tooltip.y - th - 8);
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx={6} fill="white" stroke="#e5e7eb" strokeWidth={1}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))" }} />
              <text x={tx + 8} y={ty + 14} fontSize={9} fill="#6b7280">{tooltip.series} · {tooltip.label}</text>
              <text x={tx + 8} y={ty + 30} fontSize={11} fill={tooltip.color} fontWeight="700">
                {formatY ? formatY(tooltip.val) : tooltip.val}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AREA CHART — reusable SVG component
═══════════════════════════════════════════ */
function AreaChart({ data, series, formatY, height = 160 }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data?.length) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No data</div>;

  const W = 400;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0));
  const maxVal = Math.max(1, ...allVals);
  const n = data.length;
  const step = n > 1 ? chartW / (n - 1) : chartW;
  const toX = (i) => PAD.left + i * step;
  const toY = (v) => PAD.top + chartH - (v / maxVal) * chartH;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}
        onMouseLeave={() => setTooltip(null)}>
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = PAD.top + chartH * (1 - pct);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f3f4f6" strokeWidth={0.5} />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#9ca3af">
                {formatY ? formatY(maxVal * pct) : ""}
              </text>
            </g>
          );
        })}

        {/* Areas + lines */}
        {series.map((s) => {
          const coords = data.map((d, i) => [toX(i), toY(Number(d[s.key]) || 0)]);
          const last = coords[coords.length - 1];
          const linePath = `M ${coords.map(([x, y]) => `${x},${y}`).join(" L ")}`;
          const areaPath = `M ${PAD.left},${toY(0)} L ${coords.map(([x, y]) => `${x},${y}`).join(" L ")} L ${last[0]},${toY(0)} Z`;
          const gradId = `area-grad-${s.key}`;
          return (
            <g key={s.key}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#${gradId})`} />
              <path d={linePath} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {/* Dots */}
              {coords.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={3.5} fill={s.color} stroke="white" strokeWidth={1.5}
                  className="cursor-pointer"
                  onMouseEnter={() => setTooltip({ x, y, val: Number(data[i][s.key]) || 0, label: data[i].label, series: s.label, color: s.color })}
                />
              ))}
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {String(d.label || "").slice(0, 8)}
          </text>
        ))}

        {/* Tooltip */}
        {tooltip && (() => {
          const tw = 96; const th = 40;
          const tx = Math.min(W - PAD.right - tw, Math.max(PAD.left, tooltip.x - tw / 2));
          const ty = Math.max(PAD.top, tooltip.y - th - 10);
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx={5} fill="white" stroke="#e5e7eb" strokeWidth={1}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
              <text x={tx + 7} y={ty + 13} fontSize={8.5} fill="#6b7280">{tooltip.series} · {tooltip.label}</text>
              <text x={tx + 7} y={ty + 28} fontSize={11} fill={tooltip.color} fontWeight="700">
                {formatY ? formatY(tooltip.val) : tooltip.val}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DRILL-DOWN PANEL — slides in below chart
═══════════════════════════════════════════ */
function DrillPanel({ title, rows, onClose }) {
  if (!rows?.length) return null;
  return (
    <div className="mt-3 border-t border-gray-100 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600">{title}</p>
        <button onClick={onClose} className="p-0.5 hover:bg-gray-100 rounded">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700 truncate">{r.label}</span>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              {r.values.map((v, j) => (
                <span key={j} className="font-semibold" style={{ color: v.color }}>{v.text}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART 1 — Leased vs Vacant
═══════════════════════════════════════════ */
function LeasedVacantChart({ data, chartType, onBarClick }) {
  const [drill, setDrill] = useState(null);
  const [pieDrill, setPieDrill] = useState(null);

  if (!data?.length) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;

  const totalLeased = data.reduce((s, r) => s + (Number(r?.leased_area) || 0), 0);
  const totalVacant = data.reduce((s, r) => s + (Number(r?.vacant_area) || 0), 0);
  const total = totalLeased + totalVacant || 1;
  const pct = Math.round((totalLeased / total) * 100);

  const handleBarClick = (d) => {
    setDrill(d?.label === drill?.label ? null : d);
    onBarClick?.(d);
  };

  if (chartType === "pie") {
    const pieSegs = [
      { value: totalLeased, color: "#10b981", label: "Leased", key: "leased" },
      { value: totalVacant, color: "#f59e0b", label: "Vacant", key: "vacant" },
    ];
    return (
      <div className="flex flex-col items-center py-2">
        <SimplePie
          size={172}
          segments={pieSegs}
          onSegmentClick={(seg) => setPieDrill(pieDrill?.key === seg.key ? null : seg)}
          innerContent={
            <div style={{ textAlign: "center", lineHeight: 1.2 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{pct}%</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Occupied</div>
            </div>
          }
        />
        <div className="mt-3 flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-xs text-gray-500">Leased</p>
            <p className="font-bold text-emerald-600">{fmtSqft(totalLeased)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Vacant</p>
            <p className="font-bold text-amber-600">{fmtSqft(totalVacant)}</p>
          </div>
        </div>
        {pieDrill && (
          <DrillPanel
            title={`${pieDrill.label} — By Property`}
            rows={data.map((r) => ({
              label: r.label,
              values: [{ text: fmtSqft(pieDrill.key === "leased" ? r.leased_area : r.vacant_area), color: pieDrill.color }],
            }))}
            onClose={() => setPieDrill(null)}
          />
        )}
      </div>
    );
  }

  if (chartType === "bar") {
    return (
      <div>
        <VerticalBarChart
          data={data.map((r) => ({ label: r.label, leased: Number(r.leased_area) || 0, vacant: Number(r.vacant_area) || 0 }))}
          series={[
            { key: "leased", label: "Leased", color: "#10b981" },
            { key: "vacant", label: "Vacant", color: "#f59e0b" },
          ]}
          formatY={fmtSqft}
          height={220}
          onBarClick={(d) => handleBarClick(data.find((r) => r.label === d.label))}
        />
        <ChartLegend items={[{ color: "#10b981", label: "Leased" }, { color: "#f59e0b", label: "Vacant" }]} />
        {drill && (
          <DrillPanel
            title={`${drill.label} — Area Breakdown`}
            rows={[
              { label: "Leased Area", values: [{ text: fmtSqft(Number(drill.leased_area) || 0), color: "#10b981" }] },
              { label: "Vacant Area", values: [{ text: fmtSqft(Number(drill.vacant_area) || 0), color: "#f59e0b" }] },
              { label: "Occupancy", values: [{ text: `${Math.round(((Number(drill.leased_area) || 0) / (((Number(drill.leased_area) || 0) + (Number(drill.vacant_area) || 0)) || 1)) * 100)}%`, color: "#6b7280" }] },
              ...(drill.total_units ? [{ label: "Total Units", values: [{ text: String(drill.total_units), color: "#6b7280" }] }] : []),
            ]}
            onClose={() => setDrill(null)}
          />
        )}
      </div>
    );
  }

  // Area
  return (
    <div>
      <AreaChart
        data={data.map((r) => ({ label: r.label, leased: Number(r.leased_area) || 0, vacant: Number(r.vacant_area) || 0 }))}
        series={[
          { key: "leased", label: "Leased", color: "#10b981" },
          { key: "vacant", label: "Vacant", color: "#f59e0b" },
        ]}
        formatY={fmtSqft}
        height={180}
      />
      <ChartLegend items={[{ color: "#10b981", label: "Leased" }, { color: "#f59e0b", label: "Vacant" }]} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART 2 — Rent Due vs Collected
═══════════════════════════════════════════ */
function RentDueCollectedChart({ data, chartType }) {
  const [drill, setDrill] = useState(null);
  const [pieDrill, setPieDrill] = useState(null);

  if (!data?.length) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;

  const latest = data[data.length - 1] || data[0];
  const totalCollected = Number(latest?.collected) || 0;
  const totalDue = Number(latest?.due) || 0;
  const collectionPct = totalCollected + totalDue > 0
    ? Math.round((totalCollected / (totalCollected + totalDue)) * 100) : 0;

  if (chartType === "pie") {
    const pieSegs = [
      { value: totalCollected, color: "#10b981", label: "Collected", key: "collected" },
      { value: totalDue, color: "#f59e0b", label: "Due", key: "due" },
    ];
    return (
      <div className="flex flex-col items-center py-2">
        <SimplePie
          size={172}
          segments={pieSegs}
          onSegmentClick={(seg) => setPieDrill(pieDrill?.key === seg.key ? null : seg)}
          innerContent={
            <div style={{ textAlign: "center", lineHeight: 1.2 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{collectionPct}%</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Collected</div>
            </div>
          }
        />
        <div className="mt-3 flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-xs text-gray-500">Collected</p>
            <p className="font-bold text-emerald-600">{fmtMoney(totalCollected)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Due</p>
            <p className="font-bold text-amber-600">{fmtMoney(totalDue)}</p>
          </div>
        </div>
        {/* Tenant breakdown on segment click or always shown */}
        {(pieDrill || latest?.tenants?.length > 0) && (
          <div className="mt-3 w-full">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                {pieDrill ? `${pieDrill.label} — Tenant Wise` : "Tenant Wise"}
              </p>
              {pieDrill && (
                <button onClick={() => setPieDrill(null)} className="p-0.5 hover:bg-gray-100 rounded">
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {latest.tenants?.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium truncate">{t.tenant}</span>
                  <div className="flex gap-3 shrink-0 ml-2">
                    {(!pieDrill || pieDrill.key === "due") && (
                      <span className="text-amber-600 font-semibold">Due {fmtMoney(t.due)}</span>
                    )}
                    {(!pieDrill || pieDrill.key === "collected") && (
                      <span className="text-emerald-600 font-semibold">Col. {fmtMoney(t.collected)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (chartType === "bar") {
    return (
      <div>
        <VerticalBarChart
          data={data.map((d) => ({ label: d.label, collected: Number(d.collected) || 0, due: Number(d.due) || 0 }))}
          series={[
            { key: "collected", label: "Collected", color: "#10b981" },
            { key: "due", label: "Due", color: "#f59e0b" },
          ]}
          formatY={fmtMoney}
          height={220}
          onBarClick={(d) => {
            const raw = data.find((r) => r.label === d.label);
            setDrill(drill?.label === d.label ? null : raw);
          }}
        />
        <ChartLegend items={[{ color: "#10b981", label: "Collected" }, { color: "#f59e0b", label: "Due" }]} />
        {drill && (
          <DrillPanel
            title={`${drill.label} — Collection Breakdown`}
            rows={[
              { label: "Collected", values: [{ text: fmtMoney(Number(drill.collected) || 0), color: "#10b981" }] },
              { label: "Pending Due", values: [{ text: fmtMoney(Number(drill.due) || 0), color: "#f59e0b" }] },
              { label: "Collection %", values: [{ text: `${Math.round(((Number(drill.collected) || 0) / (((Number(drill.collected) || 0) + (Number(drill.due) || 0)) || 1)) * 100)}%`, color: "#6b7280" }] },
              ...(drill.tenants || []).map((t) => ({
                label: t.tenant,
                values: [
                  { text: `Col. ${fmtMoney(t.collected)}`, color: "#10b981" },
                  { text: `Due ${fmtMoney(t.due)}`, color: "#f59e0b" },
                ],
              })),
            ]}
            onClose={() => setDrill(null)}
          />
        )}
      </div>
    );
  }

  // Area
  return (
    <div>
      <AreaChart
        data={data.map((d) => ({ label: d.label, collected: Number(d.collected) || 0, due: Number(d.due) || 0 }))}
        series={[
          { key: "collected", label: "Collected", color: "#10b981" },
          { key: "due", label: "Due", color: "#f59e0b" },
        ]}
        formatY={fmtMoney}
        height={180}
      />
      <ChartLegend items={[{ color: "#10b981", label: "Collected" }, { color: "#f59e0b", label: "Due" }]} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART 3 — Lease Expiry Ladder
═══════════════════════════════════════════ */
const BUCKET_COLORS = { "0-30": "#ef4444", "31-60": "#f97316", "61-90": "#eab308", "90+": "#10b981" };

function ExpiryLadderChart({ data, chartType }) {
  const [drill, setDrill] = useState(null);
  const [pieDrill, setPieDrill] = useState(null);

  if (!data?.length) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;

  if (chartType === "pie") {
    const buckets = data.reduce((acc, x) => {
      const b = x.bucket || (x.days_left <= 30 ? "0-30" : x.days_left <= 60 ? "31-60" : x.days_left <= 90 ? "61-90" : "90+");
      if (!acc[b]) acc[b] = { total: 0, items: [] };
      acc[b].total += Number(x.sqft) || 1;
      acc[b].items.push(x);
      return acc;
    }, {});
    const segs = Object.entries(buckets).map(([b, v]) => ({
      value: v.total, color: BUCKET_COLORS[b] || "#10b981", label: `${b} days`, key: b, items: v.items,
    }));
    const totalCount = data.length;
    return (
      <div className="flex flex-col items-center py-2">
        <SimplePie
          size={172}
          segments={segs}
          onSegmentClick={(seg) => setPieDrill(pieDrill?.key === seg.key ? null : seg)}
          innerContent={
            <div style={{ textAlign: "center", lineHeight: 1.2 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{totalCount}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Expiring</div>
            </div>
          }
        />
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {segs.map((s, i) => (
            <button
              key={i}
              onClick={() => setPieDrill(pieDrill?.key === s.key ? null : s)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors"
              style={{ background: pieDrill?.key === s.key ? s.color + "22" : "transparent" }}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-gray-600">{s.label}</span>
            </button>
          ))}
        </div>
        {pieDrill && (
          <DrillPanel
            title={`Expiring in ${pieDrill.label} — ${pieDrill.items.length} leases`}
            rows={pieDrill.items.slice(0, 8).map((x) => ({
              label: x.tenant || "—",
              values: [
                { text: x.time_left || "—", color: pieDrill.color },
                { text: fmtSqft(x.sqft || 0), color: "#6b7280" },
              ],
            }))}
            onClose={() => setPieDrill(null)}
          />
        )}
      </div>
    );
  }

  if (chartType === "bar") {
    return (
      <div>
        <VerticalBarChart
          data={data.slice(0, 8).map((x, i) => ({
            label: x.tenant || x.expiry_month || `T${i + 1}`,
            sqft: Number(x.sqft) || 1,
            _raw: x,
          }))}
          series={[{ key: "sqft", label: "Leased Area", color: "#6366f1" }]}
          formatY={fmtSqft}
          height={220}
          onBarClick={(d) => {
            const raw = data.find((x) => (x.tenant || x.expiry_month) === d.label);
            setDrill(drill?.tenant === raw?.tenant ? null : raw);
          }}
        />
        <div className="flex flex-wrap gap-3 mt-2 px-2">
          {data.slice(0, 8).map((x, i) => (
            <div key={i} className="text-[10px] text-gray-500 text-center">
              <div className="font-semibold text-gray-700">{x.time_left}</div>
            </div>
          ))}
        </div>
        {drill && (
          <DrillPanel
            title={`${drill.tenant} — Lease Detail`}
            rows={[
              { label: "Time Left", values: [{ text: drill.time_left || "—", color: "#6366f1" }] },
              { label: "Expiry Date", values: [{ text: drill.expiry_date || "—", color: "#6b7280" }] },
              { label: "Leased Area", values: [{ text: fmtSqft(drill.sqft || 0), color: "#6366f1" }] },
              { label: "Monthly Rent", values: [{ text: fmtMoney(drill.rent_due || 0), color: "#10b981" }] },
            ]}
            onClose={() => setDrill(null)}
          />
        )}
      </div>
    );
  }

  // Area — show expiry distribution over time
  const areaData = data.map((x, i) => ({
    label: x.expiry_month || String(i + 1),
    sqft: Number(x.sqft) || 0,
    rent: Number(x.rent_due) || 0,
  }));
  return (
    <div>
      <AreaChart
        data={areaData}
        series={[
          { key: "sqft", label: "Expiring Area", color: "#6366f1" },
        ]}
        formatY={fmtSqft}
        height={180}
      />
      <ChartLegend items={[{ color: "#6366f1", label: "Expiring Area" }]} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART SECTION EXPORT
═══════════════════════════════════════════ */
export default function ChartSection({
  leasedVacantData,
  rentDueCollectedData,
  expiryLadderData,
  chart1Type, chart2Type, chart3Type,
  onChart1TypeChange, onChart2TypeChange, onChart3TypeChange,
  onBarClick,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
      <div className="min-w-0 overflow-hidden">
        <ChartCard title="Leased vs Vacant" subtitle="By property" chartType={chart1Type} onChartTypeChange={onChart1TypeChange}>
          <LeasedVacantChart data={leasedVacantData} chartType={chart1Type} onBarClick={onBarClick} />
        </ChartCard>
      </div>
      <div className="min-w-0 overflow-hidden">
        <ChartCard title="Rent Due vs Collected" subtitle="By project · Tenant wise" chartType={chart2Type} onChartTypeChange={onChart2TypeChange}>
          <RentDueCollectedChart data={rentDueCollectedData} chartType={chart2Type} />
        </ChartCard>
      </div>
      <div className="min-w-0 overflow-hidden">
        <ChartCard title="Lease Expiry Ladder" subtitle="Tenant wise · 30/60/90" chartType={chart3Type} onChartTypeChange={onChart3TypeChange}>
          <ExpiryLadderChart data={expiryLadderData} chartType={chart3Type} />
        </ChartCard>
      </div>
    </div>
  );
}
